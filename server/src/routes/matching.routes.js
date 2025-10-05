const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { MatchingController } = require('../controllers/matching.controller');

const router = express.Router();

// Aplicar autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route   POST /api/matching/execute
 * @desc    Executar matching entre empréstimo e oferta
 * @access  Private (Investor/Admin)
 */
router.post('/execute', requireRole(['investor', 'admin']), MatchingController.executeMatching);

/**
 * @route   GET /api/matching/automatic
 * @desc    Buscar matches automáticos
 * @access  Private (Investor/Admin/System)
 */
router.get('/automatic', requireRole(['investor', 'admin', 'system']), MatchingController.findAutomaticMatches);

/**
 * @route   GET /api/matching/loans/:loan_id
 * @desc    Listar matches de um empréstimo
 * @access  Private
 */
router.get('/loans/:loan_id', MatchingController.getLoanMatches);

/**
 * @route   GET /api/matching/offers/:offer_id
 * @desc    Listar matches de uma oferta
 * @access  Private
 */
router.get('/offers/:offer_id', MatchingController.getOfferMatches);

module.exports = router;
