const { generateId } = require('../../shared/utils');
const { createServiceLogger } = require('../../shared/logger');
const { query } = require('../../shared/database');

/**
 * Serviço de Custódia
 * Simula uma instituição financeira custodiante (Banco, Corretora, etc.)
 * QI-EDU NÃO toca no dinheiro, apenas orquestra as transferências
 */

const logger = createServiceLogger('custody-service');

// Simulação de contas custodiadas
let custodyAccounts = {};
let custodyTransactions = {};

/**
 * Cria conta de custódia para um usuário
 * @param {string} userId - ID do usuário
 * @param {string} userType - Tipo: 'investor', 'student', 'qi_edu'
 * @param {number} initialBalance - Saldo inicial
 * @returns {Object} Conta criada
 */
function createCustodyAccount(userId, userType, initialBalance = 0) {
    const accountId = generateId('CUST');

    const account = {
        id: accountId,
        userId,
        userType,
        balance: initialBalance,
        availableBalance: initialBalance,
        blockedBalance: 0,
        createdAt: new Date().toISOString(),
        status: 'active'
    };

    custodyAccounts[accountId] = account;

    logger.info(`Conta de custódia criada`, { accountId, userId, userType, balance: initialBalance });

    return account;
}

/**
 * Bloqueia valor em uma conta (para garantias, etc.)
 * @param {string} accountId - ID da conta
 * @param {number} amount - Valor a bloquear
 * @param {string} reason - Motivo do bloqueio
 * @returns {Object} Resultado do bloqueio
 */
function blockAmount(accountId, amount, reason) {
    const account = custodyAccounts[accountId];

    if (!account) {
        throw new Error('Conta não encontrada');
    }

    if (account.availableBalance < amount) {
        throw new Error('Saldo insuficiente para bloqueio');
    }

    account.availableBalance -= amount;
    account.blockedBalance += amount;

    const transaction = {
        id: generateId('BLOCK'),
        accountId,
        type: 'block',
        amount,
        reason,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };

    custodyTransactions[transaction.id] = transaction;

    logger.info(`Valor bloqueado`, { accountId, amount, reason });

    return transaction;
}

/**
 * Libera valor bloqueado
 * @param {string} accountId - ID da conta
 * @param {number} amount - Valor a liberar
 * @param {string} reason - Motivo da liberação
 * @returns {Object} Resultado da liberação
 */
function unblockAmount(accountId, amount, reason) {
    const account = custodyAccounts[accountId];

    if (!account) {
        throw new Error('Conta não encontrada');
    }

    if (account.blockedBalance < amount) {
        throw new Error('Valor bloqueado insuficiente');
    }

    account.blockedBalance -= amount;
    account.availableBalance += amount;

    const transaction = {
        id: generateId('UNBLOCK'),
        accountId,
        type: 'unblock',
        amount,
        reason,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };

    custodyTransactions[transaction.id] = transaction;

    logger.info(`Valor liberado`, { accountId, amount, reason });

    return transaction;
}

/**
 * Transfere valor entre contas custodiadas
 * @param {string} fromAccountId - Conta de origem
 * @param {string} toAccountId - Conta de destino
 * @param {number} amount - Valor a transferir
 * @param {string} description - Descrição da transferência
 * @returns {Object} Resultado da transferência
 */
async function transferBetweenAccounts(fromAccountId, toAccountId, amount, description) {
    try {
        // Extrair user_ids dos accountIds
        const fromUserId = fromAccountId.replace('user_', '');
        const toUserId = toAccountId.replace('user_', '');

        // Buscar contas no banco
        const fromAccount = await getAccountByUserId(fromUserId);
        const toAccount = await getAccountByUserId(toUserId);

        if (!fromAccount) {
            throw new Error(`Conta de origem não encontrada: ${fromAccountId}`);
        }

        if (!toAccount) {
            throw new Error(`Conta de destino não encontrada: ${toAccountId}`);
        }

        if (fromAccount.availableBalance < amount) {
            throw new Error('Saldo insuficiente para transferência');
        }

        // Atualizar saldos no banco de dados
        await query(`
            UPDATE custody_accounts 
            SET available_balance = available_balance - $1,
                total_balance = total_balance - $1,
                updated_at = NOW()
            WHERE user_id = $2
        `, [amount, fromUserId]);

        await query(`
            UPDATE custody_accounts 
            SET available_balance = available_balance + $1,
                total_balance = total_balance + $1,
                updated_at = NOW()
            WHERE user_id = $2
        `, [amount, toUserId]);

        // Registrar transações no banco
        const transferOutId = generateId('TRANSFER_OUT');
        const transferInId = generateId('TRANSFER_IN');

        await query(`
            INSERT INTO custody_transactions (
                id, account_id, type, amount, description, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [transferOutId, fromAccountId, 'transfer_out', amount, description, 'completed', new Date()]);

        await query(`
            INSERT INTO custody_transactions (
                id, account_id, type, amount, description, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [transferInId, toAccountId, 'transfer_in', amount, description, 'completed', new Date()]);

        // Atualizar cache em memória
        fromAccount.availableBalance -= amount;
        toAccount.availableBalance += amount;

        // Criar transação em memória para compatibilidade
        const transactionId = generateId('TRANSFER');
        const transaction = {
            id: transactionId,
            fromAccountId,
            toAccountId,
            type: 'transfer',
            amount,
            description,
            timestamp: new Date().toISOString(),
            status: 'completed'
        };

        custodyTransactions[transactionId] = transaction;

        logger.info(`Transferência realizada`, {
            fromAccountId,
            toAccountId,
            amount,
            description,
            transactionId
        });

        return {
            transactionId,
            fromAccountId,
            toAccountId,
            amount,
            description,
            status: 'completed',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        logger.error('Erro ao transferir valores', { fromAccountId, toAccountId, amount, error: error.message });
        throw error;
    }
}

/**
 * Consulta saldo de uma conta
 * @param {string} accountId - ID da conta (formato: user_123)
 * @returns {Object} Saldo da conta
 */
async function getAccountBalance(accountId) {
    try {
        // Extrair user_id do accountId (user_123 -> 123)
        const userId = accountId.replace('user_', '');

        // Buscar conta no banco usando getAccountByUserId
        const account = await getAccountByUserId(userId);

        if (!account) {
            // Se não existe, criar automaticamente
            logger.info(`Conta não encontrada, criando automaticamente: ${accountId}`);
            const newAccount = await createCustodyAccount({
                userId: parseInt(userId),
                userType: 'user',
                initialBalance: 0
            });

            return {
                accountId,
                availableBalance: newAccount.availableBalance,
                blockedAmount: newAccount.blockedAmount,
                totalBalance: newAccount.totalBalance,
                status: 'active'
            };
        }

        return {
            accountId,
            availableBalance: account.availableBalance,
            blockedAmount: account.blockedAmount,
            totalBalance: account.totalBalance,
            status: account.status || 'active'
        };
    } catch (error) {
        console.error(`[CUSTODY] Erro ao consultar saldo:`, error.message);

        // Fallback: buscar em memória
        if (custodyAccounts[accountId]) {
            const account = custodyAccounts[accountId];
            return {
                accountId,
                availableBalance: account.availableBalance,
                blockedAmount: account.blockedAmount,
                totalBalance: account.totalBalance,
                status: 'active'
            };
        }

        // Se não existe nem em memória, criar automaticamente
        custodyAccounts[accountId] = {
            id: accountId,
            availableBalance: 0,
            blockedAmount: 0,
            totalBalance: 0,
            createdAt: new Date().toISOString()
        };

        return {
            accountId,
            availableBalance: 0,
            blockedAmount: 0,
            totalBalance: 0,
            status: 'active'
        };
    }
}

/**
 * Lista transações de uma conta
 * @param {string} accountId - ID da conta
 * @param {number} limit - Limite de transações
 * @returns {Array} Lista de transações
 */
function getAccountTransactions(accountId, limit = 50) {
    const transactions = Object.values(custodyTransactions)
        .filter(t => t.accountId === accountId || t.fromAccountId === accountId || t.toAccountId === accountId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

    return transactions;
}

/**
 * Cria conta de custódia para QI-EDU (recebe taxas)
 */
function createQIEDUAccount() {
    return createCustodyAccount('qi_edu_platform', 'qi_edu', 0);
}

/**
 * Cria conta de custódia para investidor
 */
function createInvestorAccount(investorId) {
    return createCustodyAccount(investorId, 'investor', 0);
}

/**
 * Cria conta de custódia para estudante
 */
function createStudentAccount(studentId) {
    return createCustodyAccount(studentId, 'student', 0);
}

/**
 * Criar conta de custódia para um usuário
 */
async function createCustodyAccount({ userId, userType, initialBalance = 0 }) {
    const accountId = `user_${userId}`;

    console.log(`[CUSTODY] Tentando criar conta: ${accountId}`);

    try {
        // Verificar se já existe no banco
        console.log(`[CUSTODY] Verificando se conta existe...`);
        const existing = await query(`
            SELECT id FROM custody_accounts WHERE id = $1
        `, [accountId]);

        if (existing.rows.length > 0) {
            console.log(`[CUSTODY] Conta já existe: ${accountId}`);
            throw new Error('Conta de custódia já existe para este usuário');
        }

        // Criar no banco de dados
        console.log(`[CUSTODY] Inserindo no banco...`);
        await query(`
            INSERT INTO custody_accounts (
                id, user_id, user_type, available_balance, 
                blocked_amount, total_balance, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            accountId, userId, userType, initialBalance,
            0, initialBalance, 'active', new Date()
        ]);

        console.log(`[CUSTODY] Conta inserida no banco com sucesso!`);

        // Também salvar em memória para consultas rápidas
        custodyAccounts[accountId] = {
            id: accountId,
            userId: userId,
            userType: userType,
            availableBalance: initialBalance,
            blockedAmount: 0,
            totalBalance: initialBalance,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        logger.info(`Conta de custódia criada no banco`, { userId, userType, initialBalance });

        return custodyAccounts[accountId];
    } catch (error) {
        console.error(`[CUSTODY] Erro ao criar conta no banco, salvando em memória:`, error.message);

        // Fallback: salvar apenas em memória
        custodyAccounts[accountId] = {
            id: accountId,
            userId: userId,
            userType: userType,
            availableBalance: initialBalance,
            blockedAmount: 0,
            totalBalance: initialBalance,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        logger.warn(`Conta de custódia criada apenas em memória (banco indisponível)`, { userId, userType, initialBalance });

        return custodyAccounts[accountId];
    }
}

/**
 * Obter conta de custódia por user_id
 * CORRIGIDO: Busca no banco de dados primeiro
 */
async function getAccountByUserId(userId) {
    const accountId = `user_${userId}`;

    try {
        // Primeiro tenta buscar no banco de dados
        const result = await query(`
            SELECT * FROM custody_accounts WHERE user_id = $1
        `, [userId]);

        if (result.rows.length > 0) {
            const account = result.rows[0];

            // Atualiza cache em memória
            custodyAccounts[accountId] = {
                id: account.id,
                userId: account.user_id,
                userType: account.user_type,
                availableBalance: parseFloat(account.available_balance || 0),
                blockedAmount: parseFloat(account.blocked_amount || 0),
                totalBalance: parseFloat(account.total_balance || 0),
                status: account.status,
                createdAt: account.created_at
            };

            return custodyAccounts[accountId];
        }

        // Se não encontrou no banco, criar automaticamente
        logger.info(`Conta não encontrada no banco, criando automaticamente: ${accountId}`);
        const newAccount = await createCustodyAccount({
            userId: parseInt(userId),
            userType: 'user',
            initialBalance: 0
        });

        return newAccount;

    } catch (error) {
        console.error(`[CUSTODY] Erro ao buscar conta no banco:`, error.message);

        // Fallback: buscar apenas em memória
        return custodyAccounts[accountId] || null;
    }
}

/**
 * Depositar valor na conta de custódia
 * CORRIGIDO: Busca conta no banco de dados primeiro
 */
async function depositToAccount({ userId, amount, paymentMethod, description }) {
    const accountId = `user_${userId}`;

    try {
        // Primeiro verifica se a conta existe no banco
        let account = await getAccountByUserId(userId);

        if (!account) {
            // Se não existe, cria automaticamente
            logger.info(`Conta não encontrada, criando automaticamente: ${accountId}`);
            account = await createCustodyAccount({ userId, userType: 'user', initialBalance: 0 });
        }

        // Atualizar saldo no banco de dados
        await query(`
            UPDATE custody_accounts 
            SET available_balance = available_balance + $1,
                total_balance = total_balance + $1,
                updated_at = NOW()
            WHERE user_id = $2
        `, [amount, userId]);

        // Atualizar cache em memória
        account.availableBalance += amount;
        account.totalBalance = account.availableBalance + account.blockedAmount;
        custodyAccounts[accountId] = account;

        // Registrar transação no banco
        const transactionId = generateId('DEP');
        await query(`
            INSERT INTO custody_transactions (
                id, account_id, type, amount, payment_method, description, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [transactionId, accountId, 'deposit', amount, paymentMethod, description, 'completed', new Date()]);

        // Criar transação em memória para compatibilidade
        const transaction = {
            id: transactionId,
            accountId: accountId,
            type: 'deposit',
            amount: amount,
            paymentMethod: paymentMethod,
            description: description,
            timestamp: new Date().toISOString(),
            status: 'completed'
        };

        custodyTransactions[transactionId] = transaction;

        logger.info(`Depósito realizado`, { userId, amount, paymentMethod, newBalance: account.availableBalance });

        return {
            transactionId,
            userId,
            amount,
            paymentMethod,
            status: 'completed',
            newBalance: account.availableBalance
        };
    } catch (error) {
        logger.error('Erro ao depositar valor', { userId, amount, error: error.message });
        throw error;
    }
}

module.exports = {
    createCustodyAccount,
    createQIEDUAccount,
    createInvestorAccount,
    createStudentAccount,
    blockAmount,
    unblockAmount,
    transferBetweenAccounts,
    getAccountBalance,
    getAccountTransactions,
    getAccountByUserId,
    depositToAccount
};
