const { generateId } = require('../../shared/utils');
const { query, transaction } = require('../../shared/database');
const { createServiceLogger } = require('../../shared/logger');

/**
 * Sistema de Transferências para Instituições - VERSÃO CORRIGIDA
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
        l.id, l.amount, l.status, l.borrower_id,
        u.name as student_name, u.email as student_email
      FROM loans l
      JOIN users u ON u.id = l.borrower_id
      WHERE l.id = $1
    `, [loanId]);

        if (loanResult.rows.length === 0) {
            throw new Error('Empréstimo não encontrado');
        }

        const loan = loanResult.rows[0];

        const institutionResult = await query(`
      SELECT id, name, integration_meta
      FROM institutions 
      WHERE id = $1
    `, [institutionId]);

        if (institutionResult.rows.length === 0) {
            throw new Error('Instituição não encontrada');
        }

        const institution = institutionResult.rows[0];

        // 2. Verifica se o empréstimo está aprovado
        if (loan.status !== 'approved' && loan.status !== 'matched') {
            throw new Error('Empréstimo não está aprovado para transferência');
        }

        // 3. Verifica se há saldo suficiente na custódia
        const custodyResult = await query(`
      SELECT available_balance, total_balance
      FROM custody_accounts 
      WHERE id = 'custody_loan_${loanId}'
    `);

        if (custodyResult.rows.length === 0) {
            throw new Error('Conta de custódia do empréstimo não encontrada');
        }

        const custodyBalance = parseFloat(custodyResult.rows[0].available_balance || 0);
        if (custodyBalance < amount) {
            throw new Error('Saldo insuficiente na custódia para transferência');
        }

        // 4. Processa transferência
        await transaction(async (client) => {
            // Atualiza status do empréstimo
            await client.query(`
        UPDATE loans 
        SET status = 'disbursed'
        WHERE id = $1
      `, [loanId]);

            // Cria conta de custódia para instituição se não existir
            await client.query(`
        INSERT INTO custody_accounts (id, user_id, user_type, available_balance, blocked_amount, total_balance, status)
        VALUES ($1, $2, 'institution', 0, 0, 0, 'active')
        ON CONFLICT (id) DO NOTHING
      `, [`institution_${institutionId}`, institutionId]);

            // Debita da custódia do empréstimo
            await client.query(`
        UPDATE custody_accounts 
        SET available_balance = available_balance - $1,
            total_balance = total_balance - $1,
            updated_at = NOW()
        WHERE id = 'custody_loan_${loanId}'
      `, [amount]);

            // Credita na conta da instituição
            await client.query(`
        UPDATE custody_accounts 
        SET available_balance = available_balance + $1,
            total_balance = total_balance + $1,
            updated_at = NOW()
        WHERE id = $2
      `, [amount, `institution_${institutionId}`]);

            // Registra no ledger
            await client.query(`
        INSERT INTO ledger (account_type, user_id, account_ref, amount, dc, ref, description, transaction_type, category, subcategory, external_reference, loan_id)
        VALUES ('custody', $1, $2, $3, 'D', $4, $5, 'escrow_transfer', 'principal', 'loan_disbursement', $4, $6)
      `, [institutionId, `institution_${institutionId}`, amount, transferId, description, loanId]);

            // Registra entrada de crédito
            await client.query(`
        INSERT INTO ledger (account_type, user_id, account_ref, amount, dc, ref, description, transaction_type, category, subcategory, external_reference, loan_id)
        VALUES ('custody', $1, $2, $3, 'C', $4, $5, 'escrow_transfer', 'principal', 'loan_disbursement', $4, $6)
      `, [institutionId, `institution_${institutionId}`, amount, transferId, description, loanId]);
        });

        logger.info('Transferência processada com sucesso', {
            transferId,
            loanId,
            institutionId,
            amount
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
                id: loan.borrower_id,
                name: loan.student_name,
                email: loan.student_email
            },
            institution: {
                id: institution.id,
                name: institution.name,
                integrationMeta: institution.integration_meta
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
 * Consulta saldo da instituição
 */
async function getInstitutionBalance(institutionId) {
    try {
        const result = await query(`
      SELECT 
        i.id,
        i.name,
        i.integration_meta,
        COALESCE(ca.available_balance, 0) as balance,
        i.created_at
      FROM institutions i
      LEFT JOIN custody_accounts ca ON ca.id = 'institution_${institutionId}'
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
 * Lista transferências da instituição
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
      JOIN users u ON u.id = lo.borrower_id
      WHERE l.account_ref = $1
      AND l.transaction_type = 'escrow_transfer'
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
 * Processa pagamento de estudante para instituição
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Object} Resultado do pagamento
 */
async function processStudentPayment(paymentData) {
    const { studentId, institutionId, amount, installmentId, description } = paymentData;

    try {
        const paymentId = generateId('PAY');

        await transaction(async (client) => {
            // Debita do estudante na conta de custódia
            await client.query(`
        UPDATE custody_accounts 
        SET available_balance = available_balance - $1,
            total_balance = total_balance - $1,
            updated_at = NOW()
        WHERE id = $2
      `, [amount, `user_${studentId}`]);

            // Credita na instituição
            await client.query(`
        UPDATE custody_accounts 
        SET available_balance = available_balance + $1,
            total_balance = total_balance + $1,
            updated_at = NOW()
        WHERE id = $2
      `, [amount, `institution_${institutionId}`]);

            // Registra no ledger
            await client.query(`
        INSERT INTO ledger (account_type, user_id, account_ref, amount, dc, ref, description, transaction_type, category, subcategory, installment_id)
        VALUES ('custody', $1, $2, $3, 'D', $4, $5, 'payment', 'student_payment', 'installment_payment', $6)
      `, [studentId, `user_${studentId}`, amount, paymentId, description, installmentId]);

            // Registra entrada de crédito
            await client.query(`
        INSERT INTO ledger (account_type, user_id, account_ref, amount, dc, ref, description, transaction_type, category, subcategory, installment_id)
        VALUES ('custody', $1, $2, $3, 'C', $4, $5, 'payment', 'student_payment', 'installment_payment', $6)
      `, [institutionId, `institution_${institutionId}`, amount, paymentId, description, installmentId]);

            // Atualiza status da parcela
            await client.query(`
        UPDATE installments 
        SET status = 'paid', payment_date = NOW()
        WHERE id = $1
      `, [installmentId]);
        });

        logger.info('Pagamento de estudante processado', {
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
    getInstitutionBalance,
    getInstitutionTransfers,
    processStudentPayment
};
