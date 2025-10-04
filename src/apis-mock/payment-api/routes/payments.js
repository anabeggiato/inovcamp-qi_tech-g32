const express = require('express');
const { createServiceLogger } = require('../../shared/logger');
const { createResponse, handleError } = require('../../shared/utils');
const paymentService = require('../services/paymentService');

const router = express.Router();
const logger = createServiceLogger('payment-routes');

/**
 * GET /payments/options
 * Lista opções de timing de pagamento
 */
router.get('/options', (req, res) => {
    try {
        logger.info('Listando opções de pagamento');

        const options = Object.entries(paymentService.PAYMENT_TIMING_OPTIONS).map(([key, value]) => ({
            id: key,
            name: value.name,
            description: value.description
        }));

        res.json(createResponse(true, 'Opções de pagamento listadas', options));
    } catch (error) {
        logger.error('Erro ao listar opções de pagamento', error);
        res.status(500).json(handleError(error, 'payment-options'));
    }
});

/**
 * POST /payments/create-plan
 * Cria plano de pagamento para um empréstimo
 */
router.post('/create-plan', async (req, res) => {
    try {
        const { loan, paymentTiming } = req.body;

        if (!loan || !paymentTiming) {
            return res.status(400).json(createResponse(false, 'Dados obrigatórios: loan, paymentTiming'));
        }

        logger.info(`Criando plano de pagamento para empréstimo ${loan.id}`, { paymentTiming });

        const paymentPlan = await paymentService.createPaymentPlan(loan, paymentTiming);

        logger.info('Plano de pagamento criado com sucesso', {
            loanId: loan.id,
            installments: paymentPlan.installments
        });

        res.json(createResponse(true, 'Plano de pagamento criado', paymentPlan));
    } catch (error) {
        logger.error('Erro ao criar plano de pagamento', error);
        res.status(500).json(handleError(error, 'create-payment-plan'));
    }
});

/**
 * POST /payments/pay-installment
 * Processa pagamento de uma parcela
 */
router.post('/pay-installment', (req, res) => {
    try {
        const { installmentId, paymentMethod, paymentDate } = req.body;

        if (!installmentId || !paymentMethod) {
            return res.status(400).json(createResponse(false, 'Dados obrigatórios: installmentId, paymentMethod'));
        }

        logger.info(`Processando pagamento da parcela ${installmentId}`, { paymentMethod });

        const result = paymentService.processPayment(installmentId, paymentMethod, paymentDate);

        logger.info('Pagamento processado', { transactionId: result.transactionId });

        res.json(createResponse(true, 'Pagamento processado', result));
    } catch (error) {
        logger.error('Erro ao processar pagamento', error);
        res.status(500).json(handleError(error, 'pay-installment'));
    }
});

/**
 * POST /payments/orchestrate
 * Orquestra pagamento completo (custódia + métodos + ledger)
 */
router.post('/orchestrate', (req, res) => {
    try {
        const {
            loanId,
            installmentId,
            paymentMethod,
            amount,
            fromAccount,
            toAccount,
            description,
            cardData,
            installments,
            bankAccount
        } = req.body;

        if (!loanId || !installmentId || !paymentMethod || !amount || !fromAccount || !toAccount) {
            return res.status(400).json(createResponse(false, 'Dados obrigatórios: loanId, installmentId, paymentMethod, amount, fromAccount, toAccount'));
        }

        logger.info(`Orquestrando pagamento completo`, {
            loanId,
            installmentId,
            paymentMethod,
            amount
        });

        const result = paymentService.orchestratePayment({
            loanId,
            installmentId,
            paymentMethod,
            amount,
            fromAccount,
            toAccount,
            description,
            cardData,
            installments,
            bankAccount
        });

        logger.info('Pagamento orquestrado', {
            success: result.success,
            paymentId: result.paymentId
        });

        res.json(createResponse(result.success, result.message || 'Pagamento orquestrado', result));
    } catch (error) {
        logger.error('Erro ao orquestrar pagamento', error);
        res.status(500).json(handleError(error, 'orchestrate-payment'));
    }
});

/**
 * GET /payments/status/:paymentId
 * Consulta status de pagamento orquestrado
 */
router.get('/status/:paymentId', (req, res) => {
    try {
        const { paymentId } = req.params;

        logger.info(`Consultando status do pagamento ${paymentId}`);

        const status = paymentService.getOrchestratedPaymentStatus(paymentId);

        res.json(createResponse(true, 'Status consultado', status));
    } catch (error) {
        logger.error('Erro ao consultar status', error);
        res.status(500).json(handleError(error, 'payment-status'));
    }
});


module.exports = router;
