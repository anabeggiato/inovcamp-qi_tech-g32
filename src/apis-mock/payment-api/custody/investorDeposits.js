const { generateId } = require('../../shared/utils');
const { query, transaction } = require('../../shared/database');
const { createServiceLogger } = require('../../shared/logger');

/**
 * Sistema de Depósitos de Investidores
 * Gerencia o fluxo de depósito de investidores na custódia
 */

const logger = createServiceLogger('investor-deposits');

/**
 * Processa depósito de investidor
 * @param {Object} depositData - Dados do depósito
 * @returns {Object} Resultado do depósito
 */
async function processInvestorDeposit(depositData) {
    const { investorId, amount, paymentMethod, description } = depositData;

    try {
        const depositId = generateId('DEP');

        // 1. Valida se o investidor existe
        const investorResult = await query(`
      SELECT id, name, email, balance 
      FROM users 
      WHERE id = $1 AND user_type = 'investor'
    `, [investorId]);

        if (investorResult.rows.length === 0) {
            throw new Error('Investidor não encontrado');
        }

        const investor = investorResult.rows[0];

        // 2. Cria conta de custódia se não existir
        let custodyAccount = await getOrCreateCustodyAccount(investorId, 'investor');

        // 3. Processa pagamento (simula integração com banco)
        const paymentResult = await processPaymentMethod(paymentMethod, amount, description);

        if (!paymentResult.success) {
            throw new Error(`Falha no pagamento: ${paymentResult.error}`);
        }

        // 4. Atualiza saldo na custódia
        await transaction(async (client) => {
            // Atualiza saldo do investidor
            await client.query(`
        UPDATE users 
        SET balance = balance + $1 
        WHERE id = $2
      `, [amount, investorId]);

            // Registra no ledger
            await client.query(`
        INSERT INTO ledger (
          from_account, to_account, amount, description, 
          transaction_type, category, subcategory
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
                'external_bank', // Conta externa (banco do investidor)
                `investor_${investorId}`, // Conta do investidor
                amount,
                `Depósito investidor - ${description}`,
                'deposit',
                'investor_funding',
                'deposit'
            ]);

            // Registra transação de pagamento
            await client.query(`
        INSERT INTO payment_transactions (
          payment_method_id, amount, status, 
          external_transaction_id, description
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
                paymentResult.paymentMethodId,
                amount,
                'completed',
                paymentResult.externalTransactionId,
                description
            ]);
        });

        logger.info(`Depósito processado`, {
            investorId,
            amount,
            depositId,
            newBalance: parseFloat(investor.balance) + amount
        });

        return {
            success: true,
            depositId,
            investorId,
            amount,
            newBalance: parseFloat(investor.balance) + amount,
            paymentMethod: paymentResult.method,
            status: 'completed',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        logger.error('Erro ao processar depósito', { investorId, amount, error: error.message });
        throw error;
    }
}

/**
 * Busca ou cria conta de custódia para investidor
 */
async function getOrCreateCustodyAccount(userId, userType) {
    // Verifica se já existe conta de custódia
    const existingAccount = await query(`
    SELECT * FROM balances 
    WHERE user_id = $1
  `, [userId]);

    if (existingAccount.rows.length > 0) {
        return existingAccount.rows[0];
    }

    // Cria nova conta de custódia
    await query(`
    INSERT INTO balances (user_id, balance, created_at, updated_at)
    VALUES ($1, 0, NOW(), NOW())
  `, [userId]);

    return { user_id: userId, balance: 0 };
}

/**
 * Simula processamento de método de pagamento
 */
async function processPaymentMethod(method, amount, description) {
    const paymentMethodId = generateId('PM');
    const externalTransactionId = generateId('EXT');

    // Simula diferentes métodos de pagamento
    switch (method) {
        case 'pix':
            return {
                success: true,
                paymentMethodId,
                externalTransactionId,
                method: 'pix',
                processingTime: 'instant'
            };

        case 'ted':
            return {
                success: true,
                paymentMethodId,
                externalTransactionId,
                method: 'ted',
                processingTime: '1-2 business days'
            };

        case 'boleto':
            return {
                success: true,
                paymentMethodId,
                externalTransactionId,
                method: 'boleto',
                processingTime: '1-3 business days'
            };

        default:
            return {
                success: false,
                error: 'Método de pagamento não suportado'
            };
    }
}

/**
 * Lista depósitos de um investidor
 */
async function getInvestorDeposits(investorId, limit = 50) {
    try {
        const result = await query(`
      SELECT 
        pt.id,
        pt.amount,
        pt.status,
        pt.external_transaction_id,
        pt.description,
        pt.created_at,
        l.description as ledger_description
      FROM payment_transactions pt
      LEFT JOIN ledger l ON l.external_reference = pt.id
      WHERE pt.description LIKE $1
      ORDER BY pt.created_at DESC
      LIMIT $2
    `, [`Depósito investidor%`, limit]);

        return result.rows;
    } catch (error) {
        logger.error('Erro ao buscar depósitos', { investorId, error: error.message });
        throw error;
    }
}

/**
 * Consulta saldo de investidor
 */
async function getInvestorBalance(investorId) {
    try {
        const result = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COALESCE(b.balance, 0) as balance,
        u.created_at
      FROM users u
      LEFT JOIN balances b ON b.user_id = u.id
      WHERE u.id = $1 AND u.user_type = 'investor'
    `, [investorId]);

        if (result.rows.length === 0) {
            throw new Error('Investidor não encontrado');
        }

        return result.rows[0];
    } catch (error) {
        logger.error('Erro ao consultar saldo', { investorId, error: error.message });
        throw error;
    }
}

module.exports = {
    processInvestorDeposit,
    getInvestorDeposits,
    getInvestorBalance
};

