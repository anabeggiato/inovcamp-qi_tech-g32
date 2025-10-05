const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { LoansController } = require('../controllers/loans.controller');

const router = express.Router();

// Aplicar autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route   GET /api/loans
 * @desc    Listar todos os empréstimos (com filtros por role)
 * @access  Private
 */
router.get('/', LoansController.list);

/**
 * @route   GET /api/loans/:id
 * @desc    Obter detalhes de um empréstimo específico
 * @access  Private
 */
router.get('/:id', LoansController.getById);

/**
 * @route   POST /api/loans
 * @desc    Criar novo empréstimo (apenas estudantes)
 * @access  Private (Student)
 */
router.post('/', requireRole(['student']), LoansController.create);

/**
 * @route   PUT /api/loans/:id/status
 * @desc    Atualizar status do empréstimo
 * @access  Private (Admin/System)
 */
router.put('/:id/status', requireRole(['admin', 'system']), LoansController.updateStatus);

/**
 * @route   GET /api/loans/:id/matches
 * @desc    Obter matches de um empréstimo
 * @access  Private
 */
router.get('/:id/matches', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Matches do empréstimo',
    data: {
      loanId: req.params.id,
      matches: [],
      note: 'Implementar lógica para buscar ofertas casadas com o empréstimo'
    }
  });
});

/**
 * @route   POST /api/loans/:id/disburse
 * @desc    Liberar recursos do empréstimo
 * @access  Private (System)
 */
router.post('/:id/disburse', requireRole(['system']), (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Liberar recursos',
    data: {
      loanId: req.params.id,
      note: 'Implementar lógica para liberação de recursos para instituição'
    }
  });
});

module.exports = router;
