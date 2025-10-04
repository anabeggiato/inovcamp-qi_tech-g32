const { generateId } = require('../../shared/utils');
const { query, transaction } = require('../../shared/database');
const { createServiceLogger } = require('../../shared/logger');

/**
 * Sistema de Transferências para Instituições
 * Gerencia o fluxo de repasse de empréstimos para faculdades
 */

const logger = createServiceLogger('institution-transfers');

/**
 * Processa transferência de empréstimo para faculdade
 * @param {Object} transferData - Dados da transferência
 * @returns {Object} Resultado da transferência
 */
async function processLoanTransfer(transferData) {
    const { loanId, institutionId, amount, description } = transferData;

    try {
        const transferId = generateId('TRANSFER');

        // 1. Valida empréstimo e instituição
        const loanResult = await query(`
      SELECT 
        l.id, l.amount, l.status, l.student_id,
        u.name as student_name, u.email as student_email
      FROM loans l
      JOIN users u ON u.id = l.student_id
      WHERE l.id = $1
    `, [loanId]);

        if (loanResult.rows.length === 0) {
            throw new Error('Empréstimo não encontrado');
        }

        const loan = loanResult.rows[0];

        const institutionResult = await query(`
      SELECT id, name, email, account_number
      FROM institutions 
      WHERE id = $1
    `, [institutionId]);

        if (institutionResult.rows.length === 0) {
            throw new Error('Instituição não encontrada');
        }

        const institution = institutionResult.rows[0];

        // 2. Verifica se há saldo suficiente (do investidor)
        const balanceResult = await query(`
      SELECT SUM(balance) as total_balance
      FROM balances
      WHERE user_id IN (
        SELECT investor_id FROM matches WHERE loan_id = $1
      )
    `, [loanId]);

        const totalBalance = parseFloat(balanceResult.rows[0].total_balance || 0);

        if (totalBalance < amount) {
            throw new Error('Saldo insuficiente para transferência');
        }

        // 3. Processa transferência
        await transaction(async (client) => {
            // Atualiza status do empréstimo
            await client.query(`
        UPDATE loans 
        SET status = 'disbursed', disbursed_at = NOW()
        WHERE id = $1
      `, [loanId]);

            // Cria conta de custódia para instituição se não existir
            await client.query(`
        INSERT INTO balances (user_id, balance, created_at, updated_at)
        VALUES ($1, 0, NOW(), NOW())
        ON CONFLICT (user_id) DO NOTHING
      `, [institutionId]);

            // Transfere valor para instituição
            await client.query(`
        UPDATE balances 
        SET balance = balance + $1, updated_at = NOW()
        WHERE user_id = $1
      `, [institutionId, amount]);

            // Debita dos investidores (proporcionalmente)
            const matchesResult = await client.query(`
        SELECT investor_id, amount as invested_amount
        FROM matches 
        WHERE loan_id = $1
      `, [loanId]);

            for (const match of matchesResult.rows) {
                const proportionalAmount = (match.invested_amount / loan.amount) * amount;

                await client.query(`
          UPDATE balances 
          SET balance = balance - $1, updated_at = NOW()
          WHERE user_id = $2
        `, [proportionalAmount, match.investor_id]);
            }

            // Registra no ledger
            await client.query(`
        INSERT INTO ledger (
          from_account, to_account, amount, description,
          transaction_type, category, subcategory, loan_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
                'investor_custody', // Conta de custódia dos investidores
                `institution_${institutionId}`, // Conta da instituição
                amount,
                `Repasse empréstimo ${loanId} - ${description}`,
                'transfer',
                'loan_disbursement',
                'institution_transfer',
                loanId
            ]);

            // Registra taxa de originação (QI-EDU)
            const originationFee = amount * 0.02; // 2% de taxa de originação
            await client.query(`
        INSERT INTO ledger (
          from_account, to_account, amount, description,
          transaction_type, category, subcategory, loan_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
                `institution_${institutionId}`,
                'qi_edu_revenue',
                originationFee,
                `Taxa de originação - Empréstimo ${loanId}`,
                'fee',
                'platform_fee',
                'origination_fee',
                loanId
            ]);
        });

        logger.info(`Transferência processada`, {
            loanId,
            institutionId,
            amount,
            transferId,
            studentName: loan.student_name
        });

        return {
            success: true,
            transferId,
            loanId,
            institutionId,
            amount,
            originationFee: amount * 0.02,
            netAmount: amount - (amount * 0.02),
            status: 'completed',
            timestamp: new Date().toISOString(),
            student: {
                id: loan.student_id,
                name: loan.student_name,
                email: loan.student_email
            },
            institution: {
                id: institution.id,
                name: institution.name,
                accountNumber: institution.account_number
            }
        };

    } catch (error) {
        logger.error('Erro ao processar transferência', {
            loanId,
            institutionId,
            amount,
            error: error.message
        });
        throw error;
    }
}

/**
 * Lista transferências de uma instituição
 */
async function getInstitutionTransfers(institutionId, limit = 50) {
    try {
        const result = await query(`
      SELECT 
        l.id as transfer_id,
        l.amount,
        l.description,
        l.created_at,
        l.loan_id,
        u.name as student_name
      FROM ledger l
      JOIN loans lo ON lo.id = l.loan_id
      JOIN users u ON u.id = lo.student_id
      WHERE l.to_account = $1
      AND l.transaction_type = 'transfer'
      ORDER BY l.created_at DESC
      LIMIT $2
    `, [`institution_${institutionId}`, limit]);

        return result.rows;
    } catch (error) {
        logger.error('Erro ao buscar transferências', { institutionId, error: error.message });
        throw error;
    }
}

/**
 * Consulta saldo de instituição
 */
async function getInstitutionBalance(institutionId) {
    try {
        const result = await query(`
      SELECT 
        i.id,
        i.name,
        i.email,
        COALESCE(b.balance, 0) as balance,
        i.created_at
      FROM institutions i
      LEFT JOIN balances b ON b.user_id = i.id
      WHERE i.id = $1
    `, [institutionId]);

        if (result.rows.length === 0) {
            throw new Error('Instituição não encontrada');
        }

        return result.rows[0];
    } catch (error) {
        logger.error('Erro ao consultar saldo', { institutionId, error: error.message });
        throw error;
    }
}

/**
 * Processa pagamento de estudante para instituição
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Object} Resultado do pagamento
 */
async function processStudentPayment(paymentData) {
    const { studentId, institutionId, amount, installmentId, description } = paymentData;

    try {
        const paymentId = generateId('PAY');

        await transaction(async (client) => {
            // Debita do estudante
            await client.query(`
        UPDATE balances 
        SET balance = balance - $1, updated_at = NOW()
        WHERE user_id = $2
      `, [amount, studentId]);

            // Credita na instituição
            await client.query(`
        UPDATE balances 
        SET balance = balance + $1, updated_at = NOW()
        WHERE user_id = $2
      `, [amount, institutionId]);

            // Registra no ledger
            await client.query(`
        INSERT INTO ledger (
          from_account, to_account, amount, description,
          transaction_type, category, subcategory, installment_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
                `student_${studentId}`,
                `institution_${institutionId}`,
                amount,
                `Pagamento parcela - ${description}`,
                'payment',
                'student_payment',
                'installment_payment',
                installmentId
            ]);

            // Atualiza status da parcela
            await client.query(`
        UPDATE installments 
        SET status = 'paid', paid_at = NOW()
        WHERE id = $1
      `, [installmentId]);
        });

        logger.info(`Pagamento de estudante processado`, {
            studentId,
            institutionId,
            amount,
            installmentId
        });

        return {
            success: true,
            paymentId,
            studentId,
            institutionId,
            amount,
            installmentId,
            status: 'completed',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        logger.error('Erro ao processar pagamento de estudante', {
            studentId,
            institutionId,
            amount,
            error: error.message
        });
        throw error;
    }
}

module.exports = {
    processLoanTransfer,
    getInstitutionTransfers,
    getInstitutionBalance,
    processStudentPayment
};

