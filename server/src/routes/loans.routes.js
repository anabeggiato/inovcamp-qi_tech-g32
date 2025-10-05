const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const matchingController = require('../controllers/matching.controller');
const matchingExecutionController = require('../controllers/matching-execution.controller');

const router = express.Router();

// Aplicar autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route   GET /api/loans
 * @desc    Listar todos os empréstimos (com filtros por role)
 * @access  Private
 */
router.get('/', (req, res) => {
  const userRole = req.user.role;

  res.json({
    success: true,
    message: `Endpoint placeholder - Listar empréstimos (${userRole})`,
    data: {
      loans: [],
      filters: {
        role: userRole,
        status: 'all'
      },
      note: 'Implementar lógica para filtrar empréstimos baseado no role do usuário'
    }
  });
});

/**
 * @route   GET /api/loans/:id
 * @desc    Obter detalhes de um empréstimo específico
 * @access  Private
 */
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Detalhes do empréstimo',
    data: {
      loanId: req.params.id,
      loan: null,
      note: 'Implementar lógica para buscar empréstimo específico'
    }
  });
});

/**
 * @route   GET /api/loans/:loanId/details
 * @desc    Obter detalhes completos de um empréstimo (para matching)
 * @access  Private
 */
router.get('/:loanId/details', matchingController.getLoanDetails);

/**
 * @route   GET /api/loans/:loanId/matches
 * @desc    Buscar matches de um empréstimo
 * @access  Private
 */
router.get('/:loanId/matches', matchingExecutionController.getLoanMatches);

/**
 * @route   POST /api/loans
 * @desc    Criar novo empréstimo (apenas estudantes)
 * @access  Private (Student)
 */
router.post('/', requireRole(['student']), (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Criar empréstimo',
    data: {
      note: 'Implementar lógica para criar novo empréstimo'
    }
  });
});

/**
 * @route   PUT /api/loans/:id/status
 * @desc    Atualizar status do empréstimo
 * @access  Private (Admin/System)
 */
router.put('/:id/status', requireRole(['admin', 'system']), (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Atualizar status do empréstimo',
    data: {
      loanId: req.params.id,
      note: 'Implementar lógica para atualizar status (aprovação, rejeição, etc.)'
    }
  });
});

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
