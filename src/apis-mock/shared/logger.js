const winston = require('winston');
require('dotenv').config();

/**
 * Sistema de logs compartilhado
 * Usado por todas as APIs e engines
 */

// Configuração dos níveis de log
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Cores para cada nível
const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(logColors);

// Formato personalizado para logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level}]: ${stack || message}`;
    })
);

// Configuração do logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels: logLevels,
    format: logFormat,
    transports: [
        // Console transport
        new winston.transports.Console({
            format: logFormat
        }),

        // File transport para erros
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),

        // File transport para todos os logs
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ],
});

// Criar diretório de logs se não existir
const fs = require('fs');
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}

/**
 * Logger específico para APIs
 * @param {string} service - Nome do serviço (faculty-api, payment-api, etc.)
 * @returns {Object} Logger configurado
 */
function createServiceLogger(service) {
    return {
        info: (message, meta = {}) => logger.info(`[${service.toUpperCase()}] ${message}`, meta),
        error: (message, meta = {}) => logger.error(`[${service.toUpperCase()}] ${message}`, meta),
        warn: (message, meta = {}) => logger.warn(`[${service.toUpperCase()}] ${message}`, meta),
        debug: (message, meta = {}) => logger.debug(`[${service.toUpperCase()}] ${message}`, meta),
        http: (message, meta = {}) => logger.http(`[${service.toUpperCase()}] ${message}`, meta),
    };
}

module.exports = {
    logger,
    createServiceLogger
};

