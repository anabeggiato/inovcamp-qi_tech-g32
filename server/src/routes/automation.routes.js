const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { automationService } = require('../services/automation.service');
const { apiIntegration } = require('../services/apiIntegration.service');

const router = express.Router();

// Aplicar autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route   GET /api/automation/status
 * @desc    Obter status do sistema de automação baseado em eventos
 * @access  Private (Admin/System)
 */
router.get('/status', requireRole(['admin', 'system']), (req, res) => {
    try {
        const status = automationService.getJobsStatus();

        res.json({
            success: true,
            message: 'Status do sistema de automação (baseado em eventos)',
            data: {
                automation: status,
                events: {
                    description: 'Sistema baseado em eventos - mais eficiente que polling',
                    monitored_events: [
                        'user.created - Onboarding automático',
                        'loan.created - Matching automático',
                        'offer.created - Matching automático',
                        'transaction.created - Análise de fraude',
                        'academic.updated - Score dinâmico',
                        'installment.due - Cobrança automática'
                    ]
                },
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Erro ao obter status da automação:', error);

        res.status(500).json({
            success: false,
            message: 'Erro ao obter status da automação',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/automation/start
 * @desc    Iniciar jobs de automação
 * @access  Private (Admin/System)
 */
router.post('/start', requireRole(['admin', 'system']), async (req, res) => {
    try {
        console.log('🚀 Iniciando jobs de automação via API...');

        await automationService.startAllJobs();

        res.json({
            success: true,
            message: 'Jobs de automação iniciados com sucesso',
            data: {
                status: automationService.getJobsStatus(),
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar jobs de automação:', error);

        res.status(500).json({
            success: false,
            message: 'Erro ao iniciar jobs de automação',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/automation/stop
 * @desc    Parar jobs de automação
 * @access  Private (Admin/System)
 */
router.post('/stop', requireRole(['admin', 'system']), (req, res) => {
    try {
        console.log('🛑 Parando jobs de automação via API...');

        automationService.stopAllJobs();

        res.json({
            success: true,
            message: 'Jobs de automação parados com sucesso',
            data: {
                status: automationService.getJobsStatus(),
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Erro ao parar jobs de automação:', error);

        res.status(500).json({
            success: false,
            message: 'Erro ao parar jobs de automação',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/automation/health
 * @desc    Verificar saúde de todas as APIs integradas
 * @access  Private (Admin/System)
 */
router.get('/health', requireRole(['admin', 'system']), async (req, res) => {
    try {
        console.log('🔍 Verificando saúde das APIs integradas...');

        const healthStatus = await apiIntegration.checkAllApisHealth();

        res.json({
            success: true,
            message: 'Status de saúde das APIs',
            data: {
                apis: healthStatus,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Erro ao verificar saúde das APIs:', error);

        res.status(500).json({
            success: false,
            message: 'Erro ao verificar saúde das APIs',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/automation/onboarding/:userId
 * @desc    Executar onboarding manual para um usuário
 * @access  Private (Admin/System)
 */
router.post('/onboarding/:userId', requireRole(['admin', 'system']), async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`👤 Executando onboarding manual para usuário ${userId}`);

        // Buscar usuário
        const { db } = require('../../db');
        const user = await db('users').where('id', userId).first();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Executar onboarding
        await automationService.processUserOnboarding(user);

        res.json({
            success: true,
            message: 'Onboarding executado com sucesso',
            data: {
                userId: userId,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Erro ao executar onboarding:', error);

        res.status(500).json({
            success: false,
            message: 'Erro ao executar onboarding',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/automation/matching/execute
 * @desc    Executar matching manual
 * @access  Private (Admin/System)
 */
router.post('/matching/execute', requireRole(['admin', 'system']), async (req, res) => {
    try {
        console.log('🤝 Executando matching manual...');

        await automationService.runMatchingJob();

        res.json({
            success: true,
            message: 'Matching executado com sucesso',
            data: {
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Erro ao executar matching:', error);

        res.status(500).json({
            success: false,
            message: 'Erro ao executar matching',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/automation/score/:userId
 * @desc    Recalcular score manual para um usuário
 * @access  Private (Admin/System)
 */
router.post('/score/:userId', requireRole(['admin', 'system']), async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`📊 Recalculando score manual para usuário ${userId}`);

        // Buscar usuário
        const { db } = require('../../db');
        const user = await db('users').where('id', userId).first();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Recalcular score
        await automationService.recalculateStudentScore(user);

        res.json({
            success: true,
            message: 'Score recalculado com sucesso',
            data: {
                userId: userId,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Erro ao recalcular score:', error);

        res.status(500).json({
            success: false,
            message: 'Erro ao recalcular score',
            error: error.message
        });
    }
});

module.exports = router;
