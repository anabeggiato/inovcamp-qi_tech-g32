const express = require('express');
const { createServiceLogger } = require('../../shared/logger');
const { createResponse, handleError } = require('../../shared/utils');
const scoreEngine = require('../services/scoreEngine');

const router = express.Router();
const logger = createServiceLogger('scores-routes');

/**
 * POST /scores/calculate
 * Calcula score completo do usuário (Serasa-inspired)
 */
router.post('/calculate', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json(createResponse(false, 'userId é obrigatório'));
        }

        logger.info(`Calculando score para usuário ${userId}`);

        const score = await scoreEngine.calculateScore(userId);

        res.json(createResponse(true, 'Score calculado com sucesso', score));
    } catch (error) {
        logger.error('Erro ao calcular score', error);
        res.status(500).json(handleError(error, 'calculate-score'));
    }
});

/**
 * GET /scores/:userId
 * Consulta score do usuário
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        logger.info(`Consultando score do usuário ${userId}`);

        const score = await scoreEngine.getScore(userId);

        if (!score) {
            return res.status(404).json(createResponse(false, 'Score não encontrado para este usuário'));
        }

        res.json(createResponse(true, 'Score consultado com sucesso', score));
    } catch (error) {
        logger.error('Erro ao consultar score', error);
        res.status(500).json(handleError(error, 'get-score'));
    }
});

/**
 * GET /scores/:userId/history
 * Consulta histórico de scores do usuário
 */
router.get('/:userId/history', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        logger.info(`Consultando histórico de scores do usuário ${userId}`);

        const history = await scoreEngine.getScoreHistory(userId, parseInt(limit));

        res.json(createResponse(true, 'Histórico de scores consultado com sucesso', {
            userId,
            history,
            totalScores: history.length
        }));
    } catch (error) {
        logger.error('Erro ao consultar histórico de scores', error);
        res.status(500).json(handleError(error, 'get-score-history'));
    }
});

module.exports = router;
