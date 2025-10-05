const express = require('express');
const { createServiceLogger } = require('../../shared/logger');
const { createResponse, handleError } = require('../../shared/utils');
const ledgerService = require('../ledger/ledgerService');

const router = express.Router();
const logger = createServiceLogger('audit-routes');

/**
 * GET /api/audit/report
 * Gerar relatório de auditoria
 */
router.get('/report', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json(createResponse(false, 'Parâmetros obrigatórios: startDate, endDate'));
        }

        logger.info('Gerando relatório de auditoria', { startDate, endDate });

        const report = ledgerService.generateAuditReport(startDate, endDate);

        res.json(createResponse(true, 'Relatório de auditoria gerado com sucesso', report));

    } catch (error) {
        logger.error('Erro ao gerar relatório de auditoria', error);
        res.status(500).json(handleError(error, 'audit-report'));
    }
});

/**
 * GET /api/audit/integrity
 * Validar integridade do ledger
 */
router.get('/integrity', async (req, res) => {
    try {
        logger.info('Validando integridade do ledger');

        const integrity = ledgerService.validateLedgerIntegrity();

        res.json(createResponse(true, 'Validação de integridade concluída', integrity));

    } catch (error) {
        logger.error('Erro ao validar integridade do ledger', error);
        res.status(500).json(handleError(error, 'audit-integrity'));
    }
});

/**
 * GET /api/audit/export
 * Exportar dados do ledger
 */
router.get('/export', async (req, res) => {
    try {
        const { format = 'json' } = req.query;

        if (!['json', 'csv'].includes(format)) {
            return res.status(400).json(createResponse(false, 'Formato deve ser json ou csv'));
        }

        logger.info('Exportando dados do ledger', { format });

        const data = ledgerService.exportLedgerData(format);

        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="ledger-export.csv"');
            res.send(data);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename="ledger-export.json"');
            res.send(data);
        }

    } catch (error) {
        logger.error('Erro ao exportar dados do ledger', error);
        res.status(500).json(handleError(error, 'audit-export'));
    }
});

/**
 * GET /api/audit/financial-report
 * Gerar relatório financeiro
 */
router.get('/financial-report', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json(createResponse(false, 'Parâmetros obrigatórios: startDate, endDate'));
        }

        logger.info('Gerando relatório financeiro', { startDate, endDate });

        const report = ledgerService.generateFinancialReport(startDate, endDate);

        res.json(createResponse(true, 'Relatório financeiro gerado com sucesso', report));

    } catch (error) {
        logger.error('Erro ao gerar relatório financeiro', error);
        res.status(500).json(handleError(error, 'financial-report'));
    }
});

module.exports = router;
