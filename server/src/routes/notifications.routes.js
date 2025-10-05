const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { db } = require('../../db');

const router = express.Router();

// Aplicar autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route   GET /api/notifications
 * @desc    Listar notificações do usuário
 * @access  Private
 */
router.get('/', async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { limit = 50, offset = 0, status } = req.query;

        console.log(`🔍 Listando notificações para usuário ${userId}`);

        let query = db('notifications')
            .select('*')
            .where('user_id', userId)
            .orderBy('created_at', 'desc')
            .limit(parseInt(limit))
            .offset(parseInt(offset));

        if (status) {
            query = query.where('status', status);
        }

        const notifications = await query;

        res.json({
            success: true,
            message: 'Notificações listadas com sucesso',
            data: {
                notifications,
                total: notifications.length,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            }
        });

    } catch (error) {
        console.error('❌ Erro ao listar notificações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marcar notificação como lida
 * @access  Private
 */
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.user;

        console.log(`📖 Marcando notificação ${id} como lida para usuário ${userId}`);

        const updated = await db('notifications')
            .where('id', id)
            .where('user_id', userId)
            .update({
                read_at: new Date(),
                updated_at: new Date()
            });

        if (updated === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notificação não encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Notificação marcada como lida'
        });

    } catch (error) {
        console.error('❌ Erro ao marcar notificação como lida:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Obter contagem de notificações não lidas
 * @access  Private
 */
router.get('/unread-count', async (req, res) => {
    try {
        const { id: userId } = req.user;

        console.log(`🔢 Contando notificações não lidas para usuário ${userId}`);

        const count = await db('notifications')
            .count('* as count')
            .where('user_id', userId)
            .whereNull('read_at')
            .first();

        res.json({
            success: true,
            message: 'Contagem de notificações não lidas',
            data: {
                unread_count: parseInt(count.count)
            }
        });

    } catch (error) {
        console.error('❌ Erro ao contar notificações não lidas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
