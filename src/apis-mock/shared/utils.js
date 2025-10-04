const Joi = require('joi');

/**
 * Utilitários compartilhados
 * Usado por todas as APIs e engines
 */

/**
 * Valida um ID numérico
 * @param {any} id - ID para validar
 * @returns {boolean} True se válido
 */
function isValidId(id) {
    return Joi.number().integer().positive().validate(id).error === undefined;
}

/**
 * Valida um email
 * @param {string} email - Email para validar
 * @returns {boolean} True se válido
 */
function isValidEmail(email) {
    return Joi.string().email().validate(email).error === undefined;
}

/**
 * Valida um CPF
 * @param {string} cpf - CPF para validar
 * @returns {boolean} True se válido
 */
function isValidCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se não são todos iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validação do algoritmo do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
}

/**
 * Formata um valor monetário
 * @param {number} value - Valor para formatar
 * @returns {string} Valor formatado
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata uma data
 * @param {Date|string} date - Data para formatar
 * @returns {string} Data formatada
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date));
}

/**
 * Gera um ID único
 * @param {string} prefix - Prefixo para o ID
 * @returns {string} ID único
 */
function generateId(prefix = 'ID') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
}

/**
 * Calcula juros compostos
 * @param {number} principal - Valor principal
 * @param {number} rate - Taxa de juros (em decimal, ex: 0.015 para 1.5%)
 * @param {number} periods - Número de períodos
 * @returns {Object} Cálculo detalhado
 */
function calculateCompoundInterest(principal, rate, periods) {
    const totalAmount = principal * Math.pow(1 + rate, periods);
    const interest = totalAmount - principal;
    const monthlyPayment = totalAmount / periods;

    return {
        principal,
        interest,
        totalAmount,
        monthlyPayment,
        rate: rate * 100, // Converte para percentual
        periods
    };
}

/**
 * Valida dados de entrada com Joi
 * @param {Object} data - Dados para validar
 * @param {Object} schema - Schema Joi
 * @returns {Object} Resultado da validação
 */
function validateData(data, schema) {
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        return {
            isValid: false,
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            })),
            data: null
        };
    }

    return {
        isValid: true,
        errors: [],
        data: value
    };
}

/**
 * Retorna uma resposta padronizada da API
 * @param {boolean} success - Se a operação foi bem-sucedida
 * @param {string} message - Mensagem de resposta
 * @param {any} data - Dados da resposta
 * @param {number} statusCode - Código de status HTTP
 * @returns {Object} Resposta padronizada
 */
function createResponse(success, message, data = null, statusCode = 200) {
    return {
        success,
        message,
        data,
        timestamp: new Date().toISOString(),
        statusCode
    };
}

/**
 * Trata erros de forma padronizada
 * @param {Error} error - Erro capturado
 * @param {string} context - Contexto onde o erro ocorreu
 * @returns {Object} Erro tratado
 */
function handleError(error, context = 'Unknown') {
    console.error(`[ERROR] ${context}:`, error);

    return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        context,
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    isValidId,
    isValidEmail,
    isValidCPF,
    formatCurrency,
    formatDate,
    generateId,
    calculateCompoundInterest,
    validateData,
    createResponse,
    handleError
};
