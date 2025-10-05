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
      SELECT id, name, email 
      FROM users 
      WHERE id = $1 AND (role = 'investor' OR user_type = 'investor')
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
            // Atualiza saldo do investidor na conta de custódia
            await client.query(`
        UPDATE custody_accounts 
        SET available_balance = available_balance + $1,
            total_balance = total_balance + $1,
            updated_at = NOW()
        WHERE id = $2
      `, [amount, `user_${investorId}`]);

            // Registra no ledger
            await client.query(`
        INSERT INTO ledger (
          account_type, user_id, account_ref, amount, dc, ref, description, 
          transaction_type, category, subcategory, external_reference
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
                'custody',
                investorId,
                `investor_${investorId}`,
                amount,
                'C', // Crédito
                depositId,
                `Depósito investidor - ${description}`,
                'deposit',
                'investor_funding',
                'deposit',
                paymentResult.externalTransactionId
            ]);

            // Registra transação de pagamento
            await client.query(`
        INSERT INTO payment_transactions (
          payment_method_id, amount, status, 
          external_transaction_id, description, payment_id
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                null, // payment_method_id pode ser NULL
                amount,
                'completed',
                paymentResult.externalTransactionId,
                description,
                paymentResult.paymentMethodId // Usar como payment_id (text)
            ]);
        });

        // Busca saldo atual da conta de custódia
        const balanceResult = await query(`
            SELECT available_balance 
            FROM custody_accounts 
            WHERE id = $1
        `, [`user_${investorId}`]);
        
        const currentBalance = balanceResult.rows.length > 0 ? 
            parseFloat(balanceResult.rows[0].available_balance || 0) : 0;
        const newBalance = currentBalance + amount;

        logger.info(`Depósito processado`, {
            investorId,
            amount,
            depositId,
            newBalance
        });

        return {
            success: true,
            depositId,
            investorId,
            amount,
            newBalance,
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
    const accountId = `user_${userId}`;
    
    // Verifica se já existe conta de custódia
    const existingAccount = await query(`
    SELECT * FROM custody_accounts 
    WHERE id = $1
  `, [accountId]);

    if (existingAccount.rows.length > 0) {
        return existingAccount.rows[0];
    }

    // Cria nova conta de custódia
    await query(`
    INSERT INTO custody_accounts (id, user_id, user_type, available_balance, blocked_amount, total_balance, status, created_at, updated_at)
    VALUES ($1, $2, $3, 0, 0, 0, 'active', NOW(), NOW())
  `, [accountId, userId, userType]);

    return { 
        id: accountId, 
        user_id: userId, 
        user_type: userType,
        available_balance: 0, 
        blocked_amount: 0,
        total_balance: 0,
        status: 'active'
    };
}

/**
 * Simula processamento de método de pagamento
 */
async function processPaymentMethod(method, amount, description) {
    const paymentMethodId = generateId('PM');
    const externalTransactionId = generateId('EXT');

    // Mapear métodos para IDs numéricos
    const methodIds = {
        'pix': 1,
        'ted': 2,
        'boleto': 3,
        'credit_card': 4,
        'debit_card': 5
    };

    // Simula diferentes métodos de pagamento
    switch (method) {
        case 'pix':
            return {
                success: true,
                paymentMethodId: methodIds.pix,
                externalTransactionId,
                method: 'pix',
                processingTime: 'instant'
            };

        case 'ted':
            return {
                success: true,
                paymentMethodId: methodIds.ted,
                externalTransactionId,
                method: 'ted',
                processingTime: '1-2 business days'
            };

        case 'boleto':
            return {
                success: true,
                paymentMethodId: methodIds.boleto,
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
      LEFT JOIN ledger l ON l.external_reference = pt.external_transaction_id
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
        COALESCE(ca.available_balance, 0) as balance,
        u.created_at
      FROM users u
      LEFT JOIN custody_accounts ca ON ca.id = $2
      WHERE u.id = $1 AND (u.role = 'investor' OR u.user_type = 'investor')
    `, [investorId, `user_${investorId}`]);

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

