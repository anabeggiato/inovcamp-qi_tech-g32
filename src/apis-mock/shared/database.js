const { Pool } = require('pg');
require('dotenv').config();

/**
 * Configuração compartilhada do banco de dados
 * Usado por todas as APIs e engines
 */

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'qi_edu',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20, // Máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

// Pool de conexões compartilhado
const pool = new Pool(dbConfig);

// Event listeners para debug
pool.on('connect', () => {
    console.log('[DATABASE] Nova conexão estabelecida');
});

pool.on('error', (err) => {
    console.error('[DATABASE] Erro inesperado no pool de conexões:', err);
    process.exit(-1);
});

/**
 * Executa uma query no banco de dados
 * @param {string} text - Query SQL
 * @param {Array} params - Parâmetros da query
 * @returns {Promise} Resultado da query
 */
async function query(text, params = []) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`[DATABASE] Query executada em ${duration}ms: ${text.substring(0, 50)}...`);
        return result;
    } catch (error) {
        console.error('[DATABASE] Erro na query:', error);
        throw error;
    }
}

/**
 * Executa uma transação
 * @param {Function} callback - Função que recebe o client da transação
 * @returns {Promise} Resultado da transação
 */
async function transaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Fecha todas as conexões do pool
 */
async function close() {
    await pool.end();
}

module.exports = {
    pool,
    query,
    transaction,
    close
};
