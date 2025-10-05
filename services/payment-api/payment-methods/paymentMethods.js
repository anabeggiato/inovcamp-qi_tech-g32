const { generateId } = require('../../shared/utils');
const { createServiceLogger } = require('../../shared/logger');

/**
 * Sistema de Métodos de Pagamento
 * Simula integração com diferentes métodos de pagamento
 */

const logger = createServiceLogger('payment-methods');

// Simulação de transações de pagamento
let paymentTransactions = {};

/**
 * Gera PIX instantâneo
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Object} Dados do PIX
 */
function generatePIX(paymentData) {
    const { amount, description, recipient } = paymentData;
    const pixId = generateId('PIX');

    const pixData = {
        id: pixId,
        type: 'pix',
        amount,
        description,
        recipient,
        pixKey: generatePIXKey(),
        qrCode: generateQRCode(pixId),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    paymentTransactions[pixId] = pixData;

    logger.info(`PIX gerado`, { pixId, amount, recipient });

    return pixData;
}

/**
 * Gera boleto bancário
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Object} Dados do boleto
 */
function generateBoleto(paymentData) {
    const { amount, description, dueDate } = paymentData;
    const boletoId = generateId('BOLETO');

    const boletoData = {
        id: boletoId,
        type: 'boleto',
        amount,
        description,
        dueDate: dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
        barcode: generateBarcode(boletoId),
        digitableLine: generateDigitableLine(boletoId),
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    paymentTransactions[boletoId] = boletoData;

    logger.info(`Boleto gerado`, { boletoId, amount, dueDate: boletoData.dueDate });

    return boletoData;
}

/**
 * Processa pagamento com cartão de crédito
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Object} Resultado do pagamento
 */
function processCreditCard(paymentData) {
    const { amount, description, cardData, installments = 1 } = paymentData;
    const cardId = generateId('CARD');

    const cardPayment = {
        id: cardId,
        type: 'credit_card',
        amount,
        description,
        installments,
        cardLast4: cardData.number.slice(-4),
        cardBrand: detectCardBrand(cardData.number),
        status: 'processing',
        createdAt: new Date().toISOString()
    };

    // Simula processamento assíncrono
    setTimeout(() => {
        // 90% de chance de sucesso
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
            cardPayment.status = 'approved';
            cardPayment.approvedAt = new Date().toISOString();
            cardPayment.authorizationCode = generateAuthorizationCode();

            logger.info(`Pagamento com cartão aprovado`, { cardId, amount });
        } else {
            cardPayment.status = 'declined';
            cardPayment.declinedAt = new Date().toISOString();
            cardPayment.declineReason = 'Insufficient funds';

            logger.error(`Pagamento com cartão recusado`, { cardId, amount });
        }
    }, 2000);

    paymentTransactions[cardId] = cardPayment;

    logger.info(`Pagamento com cartão processado`, { cardId, amount, installments });

    return cardPayment;
}

/**
 * Processa débito automático
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Object} Resultado do débito
 */
function processDebitCard(paymentData) {
    const { amount, description, bankAccount } = paymentData;
    const debitId = generateId('DEBIT');

    const debitPayment = {
        id: debitId,
        type: 'debit_card',
        amount,
        description,
        bankAccount: bankAccount.accountNumber.slice(-4),
        status: 'processing',
        createdAt: new Date().toISOString()
    };

    // Simula processamento assíncrono
    setTimeout(() => {
        // 95% de chance de sucesso
        const isSuccess = Math.random() > 0.05;

        if (isSuccess) {
            debitPayment.status = 'approved';
            debitPayment.approvedAt = new Date().toISOString();

            logger.info(`Débito automático aprovado`, { debitId, amount });
        } else {
            debitPayment.status = 'declined';
            debitPayment.declinedAt = new Date().toISOString();
            debitPayment.declineReason = 'Insufficient funds';

            logger.error(`Débito automático recusado`, { debitId, amount });
        }
    }, 1500);

    paymentTransactions[debitId] = debitPayment;

    logger.info(`Débito automático processado`, { debitId, amount });

    return debitPayment;
}

/**
 * Consulta status de um pagamento
 * @param {string} paymentId - ID do pagamento
 * @returns {Object} Status do pagamento
 */
function getPaymentStatus(paymentId) {
    const payment = paymentTransactions[paymentId];

    if (!payment) {
        throw new Error('Pagamento não encontrado');
    }

    return {
        id: payment.id,
        type: payment.type,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
        ...(payment.approvedAt && { approvedAt: payment.approvedAt }),
        ...(payment.declinedAt && { declinedAt: payment.declinedAt }),
        ...(payment.declineReason && { declineReason: payment.declineReason })
    };
}

/**
 * Lista pagamentos por tipo
 * @param {string} type - Tipo de pagamento
 * @param {number} limit - Limite de resultados
 * @returns {Array} Lista de pagamentos
 */
function getPaymentsByType(type, limit = 50) {
    return Object.values(paymentTransactions)
        .filter(p => p.type === type)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}

// Funções auxiliares

function generatePIXKey() {
    const keys = [
        'pix@qi-edu.com.br',
        '+5511999999999',
        '12345678901',
        '12345678901234'
    ];
    return keys[Math.floor(Math.random() * keys.length)];
}

function generateQRCode(pixId) {
    return `00020126580014br.gov.bcb.pix0136${pixId}520400005303986540510.005802BR5913QI-EDU LTDA6009SAO PAULO62070503***6304${pixId}`;
}

function generateBarcode(boletoId) {
    return boletoId.replace(/-/g, '').padStart(44, '0');
}

function generateDigitableLine(boletoId) {
    const barcode = generateBarcode(boletoId);
    return barcode.replace(/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{10})/, '$1.$2 $3.$4 $5.$6 $7 $8');
}

function detectCardBrand(cardNumber) {
    const number = cardNumber.replace(/\D/g, '');

    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'discover';

    return 'unknown';
}

function generateAuthorizationCode() {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
}

module.exports = {
    generatePIX,
    generateBoleto,
    processCreditCard,
    processDebitCard,
    getPaymentStatus,
    getPaymentsByType
};

