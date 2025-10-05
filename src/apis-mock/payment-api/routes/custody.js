const express = require('express');
const { createServiceLogger } = require('../../shared/logger');
const { createResponse, handleError } = require('../../shared/utils');
const investorDeposits = require('../custody/investorDeposits');
const institutionTransfers = require('../custody/institutionTransfers');

const router = express.Router();
const logger = createServiceLogger('custody-routes');

/**
 * POST /custody/investor/deposit
 * Processa depósito de investidor
 */
router.post('/investor/deposit', async (req, res) => {
    try {
        const { investorId, amount, paymentMethod, description } = req.body;

        if (!investorId || !amount || !paymentMethod) {
            return res.status(400).json(createResponse(false, 'Dados obrigatórios: investorId, amount, paymentMethod'));
        }

        logger.info(`Processando depósito do investidor ${investorId}`, { amount, paymentMethod });

        const result = await investorDeposits.processInvestorDeposit({
            investorId,
            amount,
            paymentMethod,
            description: description || `Depósito via ${paymentMethod.toUpperCase()}`
        });

        logger.info('Depósito processado com sucesso', { investorId, amount });

        res.json(createResponse(true, 'Depósito processado com sucesso', result));
    } catch (error) {
        logger.error('Erro ao processar depósito', error);
        res.status(500).json(handleError(error, 'investor-deposit'));
    }
});

/**
 * GET /custody/investor/:investorId/balance
 * Consulta saldo do investidor
 */
router.get('/investor/:investorId/balance', async (req, res) => {
    try {
        const { investorId } = req.params;

        logger.info(`Consultando saldo do investidor ${investorId}`);

        const balance = await investorDeposits.getInvestorBalance(investorId);

        res.json(createResponse(true, 'Saldo consultado', balance));
    } catch (error) {
        logger.error('Erro ao consultar saldo', error);
        res.status(500).json(handleError(error, 'investor-balance'));
    }
});

/**
 * GET /custody/investor/:investorId/deposits
 * Lista depósitos do investidor
 */
router.get('/investor/:investorId/deposits', async (req, res) => {
    try {
        const { investorId } = req.params;
        const { limit = 50 } = req.query;

        logger.info(`Listando depósitos do investidor ${investorId}`);

        const deposits = await investorDeposits.getInvestorDeposits(investorId, parseInt(limit));

        res.json(createResponse(true, 'Depósitos listados', {
            investorId,
            totalDeposits: deposits.length,
            deposits
        }));
    } catch (error) {
        logger.error('Erro ao listar depósitos', error);
        res.status(500).json(handleError(error, 'investor-deposits'));
    }
});

/**
 * POST /custody/institution/transfer
 * Processa transferência de empréstimo para instituição
 */
router.post('/institution/transfer', async (req, res) => {
    try {
        const { loanId, institutionId, amount, description } = req.body;

        if (!loanId || !institutionId || !amount) {
            return res.status(400).json(createResponse(false, 'Dados obrigatórios: loanId, institutionId, amount'));
        }

        logger.info(`Processando transferência para instituição ${institutionId}`, { loanId, amount });

        const result = await institutionTransfers.processLoanTransfer({
            loanId,
            institutionId,
            amount,
            description: description || `Repasse empréstimo ${loanId}`
        });

        logger.info('Transferência processada com sucesso', { loanId, institutionId, amount });

        res.json(createResponse(true, 'Transferência processada com sucesso', result));
    } catch (error) {
        logger.error('Erro ao processar transferência', error);
        res.status(500).json(handleError(error, 'institution-transfer'));
    }
});

/**
 * GET /custody/institution/:institutionId/balance
 * Consulta saldo da instituição
 */
router.get('/institution/:institutionId/balance', async (req, res) => {
    try {
        const { institutionId } = req.params;

        logger.info(`Consultando saldo da instituição ${institutionId}`);

        const balance = await institutionTransfers.getInstitutionBalance(institutionId);

        res.json(createResponse(true, 'Saldo consultado', balance));
    } catch (error) {
        logger.error('Erro ao consultar saldo', error);
        res.status(500).json(handleError(error, 'institution-balance'));
    }
});

/**
 * GET /custody/institution/:institutionId/transfers
 * Lista transferências da instituição
 */
router.get('/institution/:institutionId/transfers', async (req, res) => {
    try {
        const { institutionId } = req.params;
        const { limit = 50 } = req.query;

        logger.info(`Listando transferências da instituição ${institutionId}`);

        const transfers = await institutionTransfers.getInstitutionTransfers(institutionId, parseInt(limit));

        res.json(createResponse(true, 'Transferências listadas', {
            institutionId,
            totalTransfers: transfers.length,
            transfers
        }));
    } catch (error) {
        logger.error('Erro ao listar transferências', error);
        res.status(500).json(handleError(error, 'institution-transfers'));
    }
});

/**
 * POST /custody/student/payment
 * Processa pagamento de estudante para instituição
 */
router.post('/student/payment', async (req, res) => {
    try {
        const { studentId, institutionId, amount, installmentId, description } = req.body;

        if (!studentId || !institutionId || !amount || !installmentId) {
            return res.status(400).json(createResponse(false, 'Dados obrigatórios: studentId, institutionId, amount, installmentId'));
        }

        logger.info(`Processando pagamento do estudante ${studentId}`, { institutionId, amount, installmentId });

        const result = await institutionTransfers.processStudentPayment({
            studentId,
            institutionId,
            amount,
            installmentId,
            description: description || `Pagamento parcela ${installmentId}`
        });

        logger.info('Pagamento processado com sucesso', { studentId, institutionId, amount });

        res.json(createResponse(true, 'Pagamento processado com sucesso', result));
    } catch (error) {
        logger.error('Erro ao processar pagamento', error);
        res.status(500).json(handleError(error, 'student-payment'));
    }
});

module.exports = router;

