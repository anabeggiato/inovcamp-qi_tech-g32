const express = require('express');
const { createServiceLogger } = require('../../shared/logger');
const { createResponse, handleError } = require('../../shared/utils');
const { query } = require('../../shared/database');
const fraudDetector = require('../services/fraudDetector');

const router = express.Router();
const logger = createServiceLogger('fraud-routes');

/**
 * POST /fraud/analyze
 * Analisa transação em tempo real (Sift-inspired)
 */
router.post('/analyze', async (req, res) => {
    try {
        const {
            userId,
            transactionId,
            amount,
            paymentMethod,
            deviceFingerprint,
            userAgent,
            location,
            metadata
        } = req.body;

        if (!userId || !amount) {
            return res.status(400).json(createResponse(false, 'userId e amount são obrigatórios'));
        }

        logger.info(`Analisando transação para usuário ${userId}`, { amount, paymentMethod });

        const transaction = {
            id: transactionId,
            userId,
            amount,
            paymentMethod,
            deviceFingerprint,
            userAgent,
            location,
            metadata
        };

        const analysis = await fraudDetector.analyzeTransaction(transaction);

        res.json(createResponse(true, 'Análise de fraude concluída', analysis));
    } catch (error) {
        logger.error('Erro ao analisar transação', error);
        res.status(500).json(handleError(error, 'analyze-transaction'));
    }
});

/**
 * POST /fraud/events
 * Registra evento de fraude
 */
router.post('/events', async (req, res) => {
    try {
        const {
            userId,
            eventType,
            severity,
            payload
        } = req.body;

        if (!userId || !eventType) {
            return res.status(400).json(createResponse(false, 'userId e eventType são obrigatórios'));
        }

        logger.info(`Registrando evento de fraude para usuário ${userId}`, { eventType, severity });

        // Mapeia severity string para integer
        const severityInt = mapSeverityToInt(severity || 'medium');

        // Salva no banco de dados seguindo a estrutura da tabela
        const fraudEventResult = await query(`
            INSERT INTO frauds (user_id, type, severity, payload, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
        `, [userId, eventType, severityInt, JSON.stringify(payload || {})]);

        // Verifica se o evento foi criado com sucesso
        if (!fraudEventResult || !fraudEventResult.rows || fraudEventResult.rows.length === 0) {
            return res.status(500).json(createResponse(false, 'Erro ao registrar evento de fraude'));
        }

        const fraudEvent = fraudEventResult.rows[0];

        res.json(createResponse(true, 'Evento de fraude registrado com sucesso', fraudEvent));
    } catch (error) {
        logger.error('Erro ao registrar evento de fraude', error);
        res.status(500).json(handleError(error, 'register-fraud-event'));
    }
});

/**
 * GET /fraud/:userId/risk
 * Consulta risco do usuário
 */
router.get('/:userId/risk', async (req, res) => {
    try {
        const { userId } = req.params;

        logger.info(`Consultando risco do usuário ${userId}`);

        // Consulta histórico de fraudes do usuário
        const fraudHistoryResult = await query(`
            SELECT * FROM frauds 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 10
        `, [userId]);

        // Garante que fraudHistory seja sempre um array
        const fraudHistory = fraudHistoryResult && fraudHistoryResult.rows ? fraudHistoryResult.rows : [];

        // Consulta score de fraude do usuário
        const userScoreResult = await query(`
            SELECT fraud_score, fraud_status FROM users 
            WHERE id = $1
        `, [userId]);

        // Garante que userScore seja sempre um array
        const userScore = userScoreResult && userScoreResult.rows ? userScoreResult.rows : [];

        // Calcula nível de risco baseado no histórico
        let riskLevel = 'LOW';
        let riskScore = 0;

        if (fraudHistory.length > 0) {
            const highSeverityCount = fraudHistory.filter(f => f.severity >= 3).length;
            const mediumSeverityCount = fraudHistory.filter(f => f.severity === 2).length;

            if (highSeverityCount > 0) {
                riskLevel = 'HIGH';
                riskScore = 80 + (highSeverityCount * 10);
            } else if (mediumSeverityCount > 2) {
                riskLevel = 'MEDIUM';
                riskScore = 50 + (mediumSeverityCount * 5);
            } else {
                riskLevel = 'LOW';
                riskScore = 20 + (fraudHistory.length * 2);
            }
        }

        const userRisk = {
            userId,
            riskLevel,
            riskScore: Math.min(riskScore, 100),
            lastAnalysis: new Date().toISOString(),
            fraudHistory: fraudHistory.map(f => ({
                id: f.id,
                eventType: f.type,
                severity: mapSeverityToString(f.severity),
                createdAt: f.created_at
            })),
            currentFraudScore: userScore[0]?.fraud_score || 1000,
            currentFraudStatus: userScore[0]?.fraud_status || 'CLEAN',
            recommendations: generateRiskRecommendations(riskLevel, fraudHistory.length)
        };

        res.json(createResponse(true, 'Risco do usuário consultado com sucesso', userRisk));
    } catch (error) {
        logger.error('Erro ao consultar risco do usuário', error);
        res.status(500).json(handleError(error, 'get-user-risk'));
    }
});

/**
 * GET /fraud/alerts
 * Lista alertas de fraude
 */
router.get('/alerts', async (req, res) => {
    try {
        const { limit = 50, severity = 'high' } = req.query;

        logger.info(`Listando alertas de fraude`, { limit, severity });

        // Mapeia severity string para integer para consulta
        const severityInt = mapSeverityToInt(severity) || 3; // default para high

        // Consulta fraudes recentes com alta severidade
        const alertsResult = await query(`
            SELECT f.*, u.name as user_name, u.email as user_email
            FROM frauds f
            JOIN users u ON f.user_id = u.id
            WHERE f.severity = $1
            ORDER BY f.created_at DESC
            LIMIT $2
        `, [severityInt, parseInt(limit)]);

        // Garante que alerts seja sempre um array
        const alerts = alertsResult && alertsResult.rows ? alertsResult.rows : [];

        res.json(createResponse(true, 'Alertas de fraude listados com sucesso', {
            alerts: alerts.map(alert => ({
                id: alert.id,
                userId: alert.user_id,
                userName: alert.user_name,
                userEmail: alert.user_email,
                type: alert.type,
                severity: mapSeverityToString(alert.severity),
                status: 'active',
                createdAt: alert.created_at
            })),
            totalAlerts: alerts.length,
            filters: { limit, severity }
        }));
    } catch (error) {
        logger.error('Erro ao listar alertas de fraude', error);
        res.status(500).json(handleError(error, 'list-fraud-alerts'));
    }
});


/**
 * Mapeia severity string para integer
 */
function mapSeverityToInt(severity) {
    const severityMap = {
        'low': 1,
        'medium': 2,
        'high': 3,
        'critical': 4
    };
    return severityMap[severity] || 2; // default para medium
}

/**
 * Mapeia severity integer para string
 */
function mapSeverityToString(severity) {
    const severityMap = {
        1: 'low',
        2: 'medium',
        3: 'high',
        4: 'critical'
    };
    return severityMap[severity] || 'medium';
}

/**
 * Gera recomendações baseadas no nível de risco
 */
function generateRiskRecommendations(riskLevel, fraudCount) {
    const recommendations = [];

    switch (riskLevel) {
        case 'HIGH':
            recommendations.push({
                type: 'ENHANCED_MONITORING',
                message: 'Usuário requer monitoramento intensivo',
                priority: 'HIGH',
                action: 'MONITOR'
            });
            if (fraudCount > 3) {
                recommendations.push({
                    type: 'ACCOUNT_REVIEW',
                    message: 'Revisar conta devido ao histórico de fraudes',
                    priority: 'HIGH',
                    action: 'REVIEW'
                });
            }
            break;
        case 'MEDIUM':
            recommendations.push({
                type: 'STANDARD_MONITORING',
                message: 'Monitoramento padrão recomendado',
                priority: 'MEDIUM',
                action: 'MONITOR'
            });
            break;
        case 'LOW':
            recommendations.push({
                type: 'NORMAL_MONITORING',
                message: 'Continue monitoramento normal',
                priority: 'LOW',
                action: 'MONITOR'
            });
            break;
    }

    return recommendations;
}

module.exports = router;
