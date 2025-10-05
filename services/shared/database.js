const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

/**
 * Configuração compartilhada do banco de dados
 * Usado por todas as APIs e engines
 */

// Debug: verificar variáveis de ambiente
console.log('[DATABASE] RENDER_DATABASE_URL:', process.env.RENDER_DATABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA');
console.log('[DATABASE] DB_HOST:', process.env.DB_HOST || 'NÃO DEFINIDA');

const dbConfig = process.env.RENDER_DATABASE_URL ? {
    connectionString: process.env.RENDER_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10, // Reduzir conexões simultâneas
    idleTimeoutMillis: 60000, // Aumentar timeout de idle
    connectionTimeoutMillis: 10000, // Aumentar timeout de conexão
    acquireTimeoutMillis: 10000, // Timeout para adquirir conexão
    createTimeoutMillis: 10000, // Timeout para criar conexão
    destroyTimeoutMillis: 5000, // Timeout para destruir conexão
    reapIntervalMillis: 1000, // Intervalo para limpeza
    createRetryIntervalMillis: 200, // Intervalo para retry
} : {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'qi_edu',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
    acquireTimeoutMillis: 10000,
    createTimeoutMillis: 10000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
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
async function query(text, params = [], retries = 3) {
    const start = Date.now();

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await pool.query(text, params);
            const duration = Date.now() - start;
            console.log(`[DATABASE] Query executada em ${duration}ms (tentativa ${attempt}): ${text.substring(0, 50)}...`);
            return result;
        } catch (error) {
            console.error(`[DATABASE] Erro na query (tentativa ${attempt}/${retries}):`, error.message);

            if (attempt === retries) {
                throw error;
            }

            // Aguardar antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
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
