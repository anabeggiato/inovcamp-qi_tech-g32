const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { OffersController } = require('../controllers/offers.controller');

const router = express.Router();

// Aplicar autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route   GET /api/offers
 * @desc    Listar ofertas do investidor
 * @access  Private (Investor)
 */
router.get('/', requireRole(['investor']), OffersController.list);

/**
 * @route   POST /api/offers
 * @desc    Criar nova oferta de investimento
 * @access  Private (Investor)
 */
router.post('/', requireRole(['investor']), OffersController.create);

/**
 * @route   GET /api/offers/:id
 * @desc    Obter oferta por ID
 * @access  Private (Investor)
 */
router.get('/:id', requireRole(['investor']), OffersController.getById);

/**
 * @route   PUT /api/offers/:id
 * @desc    Atualizar oferta
 * @access  Private (Investor)
 */
router.put('/:id', requireRole(['investor']), OffersController.update);

module.exports = router;
