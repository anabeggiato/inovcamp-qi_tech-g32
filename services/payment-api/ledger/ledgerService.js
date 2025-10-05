const { generateId } = require('../../shared/utils');
const { createServiceLogger } = require('../../shared/logger');

/**
 * Sistema de Ledger (Dupla Entrada)
 * Registra todas as transações financeiras para auditoria e rastreabilidade
 */

const logger = createServiceLogger('ledger-service');

// Simulação do ledger
let ledgerEntries = {};
let accountBalances = {};

/**
 * Cria entrada no ledger (dupla entrada)
 * @param {Object} transaction - Dados da transação
 * @returns {Object} Entrada criada
 */
async function createLedgerEntry(transaction) {
    const { fromAccount, toAccount, amount, description, category, subcategory } = transaction;
    const entryId = generateId('LEDGER');

    const entry = {
        id: entryId,
        transactionId: transaction.id || generateId('TXN'),
        fromAccount,
        toAccount,
        amount,
        description,
        category: category || 'payment',
        subcategory: subcategory || 'transfer',
        type: 'transfer',
        status: 'pending',
        createdAt: new Date().toISOString(),
        processedAt: null
    };

    // Salvar no banco de dados
    try {
        const { query } = require('../../shared/database');

        // Extrair user_id do fromAccount (user_123 -> 123)
        const userId = fromAccount.replace('user_', '');

        await query(`
            INSERT INTO ledger (
                account_type, user_id, account_ref, amount, dc, ref, 
                transaction_type, description, category, subcategory
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
            'user',
            parseInt(userId),
            fromAccount,
            amount,
            'D', // Debit
            entryId,
            'transfer',
            description,
            category,
            subcategory
        ]);

        logger.info(`Ledger entry saved to database`, { entryId, fromAccount, amount, category });
    } catch (error) {
        logger.error(`Error saving ledger entry to database`, { entryId, error: error.message });
    }

    // Processa transferência imediatamente (dupla entrada)
    try {
        // Valida saldo da conta de origem
        if (accountBalances[fromAccount] < amount) {
            entry.status = 'failed';
            entry.error = 'Insufficient funds';
            logger.error(`Ledger entry failed: insufficient funds`, { entryId, fromAccount, amount });
            return entry;
        }

        // Processa transferência (dupla entrada)
        accountBalances[fromAccount] -= amount;
        accountBalances[toAccount] = (accountBalances[toAccount] || 0) + amount;

        entry.status = 'completed';
        entry.processedAt = new Date().toISOString();

        logger.info(`Ledger entry completed`, { entryId, fromAccount, toAccount, amount });
    } catch (error) {
        entry.status = 'failed';
        entry.error = error.message;
        logger.error(`Ledger entry failed`, { entryId, error: error.message });
    }

    ledgerEntries[entryId] = entry;

    logger.info(`Ledger entry created`, { entryId, fromAccount, toAccount, amount });

    return entry;
}

/**
 * Cria entrada de receita (QI-EDU recebe taxa)
 * @param {Object} transaction - Dados da transação
 * @returns {Object} Entrada criada
 */
function createRevenueEntry(transaction) {
    const { fromAccount, amount, description, category = 'revenue' } = transaction;
    const entryId = generateId('REV');

    const entry = {
        id: entryId,
        transactionId: transaction.id || generateId('TXN'),
        fromAccount,
        toAccount: 'qi_edu_revenue',
        amount,
        description,
        category,
        subcategory: 'platform_fee',
        type: 'revenue',
        status: 'pending',
        createdAt: new Date().toISOString(),
        processedAt: null
    };

    // Simula processamento assíncrono
    setTimeout(() => {
        try {
            // Valida saldo da conta de origem
            if (accountBalances[fromAccount] < amount) {
                entry.status = 'failed';
                entry.error = 'Insufficient funds';
                logger.error(`Revenue entry failed: insufficient funds`, { entryId, fromAccount, amount });
                return;
            }

            // Processa receita
            accountBalances[fromAccount] -= amount;
            accountBalances['qi_edu_revenue'] = (accountBalances['qi_edu_revenue'] || 0) + amount;

            entry.status = 'completed';
            entry.processedAt = new Date().toISOString();

            logger.info(`Revenue entry completed`, { entryId, fromAccount, amount });
        } catch (error) {
            entry.status = 'failed';
            entry.error = error.message;
            logger.error(`Revenue entry failed`, { entryId, error: error.message });
        }
    }, 500);

    ledgerEntries[entryId] = entry;

    logger.info(`Revenue entry created`, { entryId, fromAccount, amount });

    return entry;
}

/**
 * Cria entrada de despesa (QI-EDU paga custos)
 * @param {Object} transaction - Dados da transação
 * @returns {Object} Entrada criada
 */
function createExpenseEntry(transaction) {
    const { toAccount, amount, description, category = 'expense' } = transaction;
    const entryId = generateId('EXP');

    const entry = {
        id: entryId,
        transactionId: transaction.id || generateId('TXN'),
        fromAccount: 'qi_edu_expenses',
        toAccount,
        amount,
        description,
        category,
        subcategory: 'operational_cost',
        type: 'expense',
        status: 'pending',
        createdAt: new Date().toISOString(),
        processedAt: null
    };

    // Simula processamento assíncrono
    setTimeout(() => {
        try {
            // Valida saldo da conta de origem
            if (accountBalances['qi_edu_expenses'] < amount) {
                entry.status = 'failed';
                entry.error = 'Insufficient funds';
                logger.error(`Expense entry failed: insufficient funds`, { entryId, toAccount, amount });
                return;
            }

            // Processa despesa
            accountBalances['qi_edu_expenses'] -= amount;
            accountBalances[toAccount] = (accountBalances[toAccount] || 0) + amount;

            entry.status = 'completed';
            entry.processedAt = new Date().toISOString();

            logger.info(`Expense entry completed`, { entryId, toAccount, amount });
        } catch (error) {
            entry.status = 'failed';
            entry.error = error.message;
            logger.error(`Expense entry failed`, { entryId, error: error.message });
        }
    }, 500);

    ledgerEntries[entryId] = entry;

    logger.info(`Expense entry created`, { entryId, toAccount, amount });

    return entry;
}

/**
 * Consulta saldo de uma conta no ledger
 * @param {string} accountId - ID da conta
 * @returns {Object} Saldo da conta
 */
function getAccountBalance(accountId) {
    const balance = accountBalances[accountId] || 0;

    return {
        accountId,
        balance,
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Lista entradas do ledger por conta
 * @param {string} accountId - ID da conta
 * @param {number} limit - Limite de resultados
 * @returns {Array} Lista de entradas
 */
function getLedgerEntriesByAccount(accountId, limit = 50) {
    return Object.values(ledgerEntries)
        .filter(entry => entry.fromAccount === accountId || entry.toAccount === accountId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}

/**
 * Lista entradas do ledger por categoria
 * @param {string} category - Categoria
 * @param {number} limit - Limite de resultados
 * @returns {Array} Lista de entradas
 */
function getLedgerEntriesByCategory(category, limit = 50) {
    return Object.values(ledgerEntries)
        .filter(entry => entry.category === category)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}

/**
 * Gera relatório de receitas e despesas
 * @param {string} startDate - Data inicial
 * @param {string} endDate - Data final
 * @returns {Object} Relatório financeiro
 */
function generateFinancialReport(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const entries = Object.values(ledgerEntries).filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= start && entryDate <= end;
    });

    const revenues = entries
        .filter(entry => entry.type === 'revenue')
        .reduce((sum, entry) => sum + entry.amount, 0);

    const expenses = entries
        .filter(entry => entry.type === 'expense')
        .reduce((sum, entry) => sum + entry.amount, 0);

    const transfers = entries
        .filter(entry => entry.type === 'transfer')
        .reduce((sum, entry) => sum + entry.amount, 0);

    return {
        period: { startDate, endDate },
        revenues,
        expenses,
        transfers,
        netIncome: revenues - expenses,
        totalTransactions: entries.length,
        generatedAt: new Date().toISOString()
    };
}

/**
 * Inicializa contas do sistema
 */
function initializeSystemAccounts() {
    accountBalances['qi_edu_revenue'] = 0;
    accountBalances['qi_edu_expenses'] = 0;

    logger.info('System accounts initialized');
}

/**
 * Obter transações de um usuário
 */
async function getUserTransactions(userId, limit = 50, offset = 0) {
    try {
        const { query } = require('../../shared/database');

        const result = await query(`
            SELECT 
                id, account_type, user_id, account_ref, amount, dc, ref,
                transaction_type, description, category, subcategory,
                created_at, updated_at
            FROM ledger 
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);

        return result.rows;
    } catch (error) {
        console.error('[LEDGER] Erro ao buscar transações do usuário:', error);
        return [];
    }
}

/**
 * Obter taxas de um usuário
 */
async function getUserFees(userId, period = 'month') {
    try {
        const { query } = require('../../shared/database');

        let dateFilter = '';
        if (period === 'month') {
            dateFilter = "AND created_at >= NOW() - INTERVAL '1 month'";
        } else if (period === 'year') {
            dateFilter = "AND created_at >= NOW() - INTERVAL '1 year'";
        }

        const result = await query(`
            SELECT 
                id, amount, description, category, subcategory,
                created_at
            FROM ledger 
            WHERE user_id = $1 
            AND category = 'fee'
            ${dateFilter}
            ORDER BY created_at DESC
        `, [userId]);

        return result.rows;
    } catch (error) {
        console.error('[LEDGER] Erro ao buscar taxas do usuário:', error);
        return [];
    }
}

/**
 * Gera relatório de auditoria completo
 * @param {string} startDate - Data inicial
 * @param {string} endDate - Data final
 * @returns {Object} Relatório de auditoria
 */
function generateAuditReport(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const entries = Object.values(ledgerEntries).filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= start && entryDate <= end;
    });

    // Agrupar por categoria
    const byCategory = entries.reduce((acc, entry) => {
        if (!acc[entry.category]) {
            acc[entry.category] = { count: 0, total: 0, entries: [] };
        }
        acc[entry.category].count++;
        acc[entry.category].total += entry.amount;
        acc[entry.category].entries.push(entry);
        return acc;
    }, {});

    // Agrupar por status
    const byStatus = entries.reduce((acc, entry) => {
        if (!acc[entry.status]) {
            acc[entry.status] = { count: 0, total: 0 };
        }
        acc[entry.status].count++;
        acc[entry.status].total += entry.amount;
        return acc;
    }, {});

    return {
        period: { startDate, endDate },
        summary: {
            totalEntries: entries.length,
            totalAmount: entries.reduce((sum, entry) => sum + entry.amount, 0),
            successfulEntries: entries.filter(e => e.status === 'completed').length,
            failedEntries: entries.filter(e => e.status === 'failed').length
        },
        byCategory,
        byStatus,
        entries: entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        generatedAt: new Date().toISOString()
    };
}

/**
 * Valida integridade do ledger (soma dos débitos = soma dos créditos)
 * @returns {Object} Resultado da validação
 */
function validateLedgerIntegrity() {
    const entries = Object.values(ledgerEntries);
    
    let totalDebits = 0;
    let totalCredits = 0;
    const accountBalances = {};

    entries.forEach(entry => {
        if (entry.status === 'completed') {
            // Débito (fromAccount perde dinheiro)
            if (!accountBalances[entry.fromAccount]) {
                accountBalances[entry.fromAccount] = 0;
            }
            accountBalances[entry.fromAccount] -= entry.amount;
            totalDebits += entry.amount;

            // Crédito (toAccount ganha dinheiro)
            if (!accountBalances[entry.toAccount]) {
                accountBalances[entry.toAccount] = 0;
            }
            accountBalances[entry.toAccount] += entry.amount;
            totalCredits += entry.amount;
        }
    });

    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01; // Tolerância para arredondamento

    return {
        isBalanced,
        totalDebits,
        totalCredits,
        difference: totalCredits - totalDebits,
        accountBalances,
        validatedAt: new Date().toISOString()
    };
}

/**
 * Exporta dados do ledger para auditoria externa
 * @param {string} format - Formato de exportação (json, csv)
 * @returns {string} Dados exportados
 */
function exportLedgerData(format = 'json') {
    const entries = Object.values(ledgerEntries);

    if (format === 'csv') {
        const headers = ['id', 'transactionId', 'fromAccount', 'toAccount', 'amount', 'description', 'category', 'subcategory', 'type', 'status', 'createdAt', 'processedAt'];
        const csvRows = [headers.join(',')];
        
        entries.forEach(entry => {
            const row = headers.map(header => {
                const value = entry[header] || '';
                return `"${value}"`;
            });
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    return JSON.stringify(entries, null, 2);
}

module.exports = {
    createLedgerEntry,
    createRevenueEntry,
    createExpenseEntry,
    getAccountBalance,
    getLedgerEntriesByAccount,
    getLedgerEntriesByCategory,
    generateFinancialReport,
    generateAuditReport,
    validateLedgerIntegrity,
    exportLedgerData,
    initializeSystemAccounts,
    getUserTransactions,
    getUserFees
};
