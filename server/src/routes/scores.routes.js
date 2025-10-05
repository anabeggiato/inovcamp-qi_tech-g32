const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { apiIntegration } = require('../services/apiIntegration.service');

const router = express.Router();

// Aplicar autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route   POST /api/scores/calculate
 * @desc    Calcular score de crédito para um usuário
 * @access  Private
 */
router.post('/calculate', async (req, res) => {
    try {
        const userId = req.user.id;
        const userData = req.body;

        console.log(`🧮 Calculando score para usuário ${userId}`);

        // Calcular score via Score Engine
        const score = await apiIntegration.calculateScore(userId, userData);

        res.json({
            success: true,
            message: 'Score calculado com sucesso',
            data: {
                score: score.data,
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role
                }
            }
        });

    } catch (error) {
        console.error('❌ Erro ao calcular score:', error);

        // Fallback com dados mockados
        res.json({
            success: true,
            message: 'Score calculado (dados mockados)',
            data: {
                score: {
                    userId: req.user.id,
                    score: 500,
                    riskBand: 'C',
                    fraudScore: 0,
                    fraudStatus: 'unknown',
                    factors: [],
                    note: 'Score Engine indisponível - dados mockados'
                },
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role
                }
            }
        });
    }
});

/**
 * @route   GET /api/scores/:userId
 * @desc    Consultar score de um usuário
 * @access  Private
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        console.log(`📊 Consultando score para usuário ${userId}`);

        // Verificar se o usuário tem permissão para acessar o score
        if (req.user.role !== 'admin' && req.user.role !== 'system' && parseInt(currentUserId) !== parseInt(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado - você só pode acessar seu próprio score'
            });
        }

        // Buscar score via Score Engine
        const score = await apiIntegration.getUserScore(userId);

        res.json({
            success: true,
            message: 'Score obtido com sucesso',
            data: {
                score: score.data,
                user: {
                    id: userId,
                    name: req.user.name,
                    role: req.user.role
                }
            }
        });

    } catch (error) {
        console.error('❌ Erro ao consultar score:', error);

        res.status(404).json({
            success: false,
            message: 'Score não encontrado',
            data: {
                userId: req.params.userId,
                note: 'Score Engine indisponível ou usuário não encontrado'
            }
        });
    }
});

/**
 * @route   GET /api/scores/:userId/risk-band
 * @desc    Consultar faixa de risco de um usuário
 * @access  Private
 */
router.get('/:userId/risk-band', async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        console.log(`🏷️ Consultando faixa de risco para usuário ${userId}`);

        // Verificar se o usuário tem permissão para acessar o score
        if (req.user.role !== 'admin' && req.user.role !== 'system' && parseInt(currentUserId) !== parseInt(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado - você só pode acessar sua própria faixa de risco'
            });
        }

        // Buscar faixa de risco via Score Engine
        const riskBand = await apiIntegration.getRiskBand(userId);

        res.json({
            success: true,
            message: 'Faixa de risco obtida com sucesso',
            data: {
                riskBand: riskBand.data,
                user: {
                    id: userId,
                    name: req.user.name,
                    role: req.user.role
                }
            }
        });

    } catch (error) {
        console.error('❌ Erro ao consultar faixa de risco:', error);

        res.status(404).json({
            success: false,
            message: 'Faixa de risco não encontrada',
            data: {
                userId: req.params.userId,
                note: 'Score Engine indisponível ou usuário não encontrado'
            }
        });
    }
});

/**
 * @route   POST /api/scores/fraud/analyze
 * @desc    Analisar transação para fraude
 * @access  Private
 */
router.post('/fraud/analyze', async (req, res) => {
    try {
        const userId = req.user.id;
        const transactionData = {
            ...req.body,
            user_id: userId
        };

        console.log(`🛡️ Analisando transação para fraude - usuário ${userId}`);

        // Analisar fraude via Score Engine
        const fraudAnalysis = await apiIntegration.analyzeFraud(transactionData);

        res.json({
            success: true,
            message: 'Análise de fraude concluída',
            data: {
                fraudAnalysis: fraudAnalysis.data,
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role
                }
            }
        });

    } catch (error) {
        console.error('❌ Erro na análise de fraude:', error);

        res.status(500).json({
            success: false,
            message: 'Erro na análise de fraude',
            error: error.message || 'Score Engine indisponível'
        });
    }
});

/**
 * @route   POST /api/scores/fraud/events
 * @desc    Registrar evento de fraude
 * @access  Private (Admin/System)
 */
router.post('/fraud/events', requireRole(['admin', 'system']), async (req, res) => {
    try {
        const eventData = req.body;

        console.log(`📝 Registrando evento de fraude`);

        // Registrar evento via Score Engine
        const event = await apiIntegration.reportFraudEvent(eventData);

        res.status(201).json({
            success: true,
            message: 'Evento de fraude registrado com sucesso',
            data: {
                event: event.data,
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role
                }
            }
        });

    } catch (error) {
        console.error('❌ Erro ao registrar evento de fraude:', error);

        res.status(500).json({
            success: false,
            message: 'Erro ao registrar evento de fraude',
            error: error.message || 'Score Engine indisponível'
        });
    }
});

/**
 * @route   POST /api/scores/credit/analyze
 * @desc    Análise de crédito completa
 * @access  Private
 */
router.post('/credit/analyze', async (req, res) => {
    try {
        const userId = req.user.id;
        const creditData = {
            ...req.body,
            user_id: userId
        };

        console.log(`💳 Realizando análise de crédito para usuário ${userId}`);

        // Análise de crédito via Score Engine
        const creditAnalysis = await apiIntegration.analyzeCredit(creditData);

        res.json({
            success: true,
            message: 'Análise de crédito concluída',
            data: {
                creditAnalysis: creditAnalysis.data,
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role
                }
            }
        });

    } catch (error) {
        console.error('❌ Erro na análise de crédito:', error);

        res.status(500).json({
            success: false,
            message: 'Erro na análise de crédito',
            error: error.message || 'Score Engine indisponível'
        });
    }
});

module.exports = router;
