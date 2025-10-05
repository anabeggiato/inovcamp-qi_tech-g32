const express = require('express');
const { createServiceLogger } = require('../../shared/logger');
const { createResponse, handleError } = require('../../shared/utils');
const paymentService = require('../services/paymentService');

const router = express.Router();
const logger = createServiceLogger('installment-routes');

/**
 * GET /installments/:loanId
 * Lista parcelas de um empréstimo
 */
router.get('/:loanId', async (req, res) => {
    try {
        const { loanId } = req.params;

        logger.info(`Listando parcelas do empréstimo ${loanId}`);

        const installments = await paymentService.getInstallmentsByLoan(loanId);

        if (installments.length === 0) {
            return res.status(404).json(createResponse(false, 'Empréstimo não encontrado ou sem parcelas'));
        }

        logger.info(`Encontradas ${installments.length} parcelas`);

        res.json(createResponse(true, 'Parcelas listadas', {
            loanId,
            totalInstallments: installments.length,
            installments
        }));
    } catch (error) {
        logger.error('Erro ao listar parcelas', error);
        res.status(500).json(handleError(error, 'list-installments'));
    }
});

/**
 * GET /installments/:loanId/summary
 * Resumo de pagamentos de um empréstimo
 */
router.get('/:loanId/summary', async (req, res) => {
    try {
        const { loanId } = req.params;

        logger.info(`Gerando resumo de pagamentos do empréstimo ${loanId}`);

        const summary = await paymentService.getPaymentSummary(loanId);

        if (!summary) {
            return res.status(404).json(createResponse(false, 'Empréstimo não encontrado'));
        }

        logger.info('Resumo gerado com sucesso', summary);

        res.json(createResponse(true, 'Resumo de pagamentos gerado', summary));
    } catch (error) {
        logger.error('Erro ao gerar resumo', error);
        res.status(500).json(handleError(error, 'payment-summary'));
    }
});

module.exports = router;
