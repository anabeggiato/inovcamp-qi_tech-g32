const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Aplicar autenticação e verificar role de estudante
router.use(authenticateToken);
router.use(requireRole(['student']));

/**
 * @route   GET /api/students/profile
 * @desc    Obter perfil do estudante
 * @access  Private (Student)
 */
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Perfil do estudante',
    data: {
      user: req.user,
      note: 'Implementar lógica para buscar dados completos do estudante'
    }
  });
});

/**
 * @route   GET /api/students/loans
 * @desc    Listar empréstimos do estudante
 * @access  Private (Student)
 */
router.get('/loans', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Empréstimos do estudante',
    data: {
      loans: [],
      note: 'Implementar lógica para buscar empréstimos do usuário'
    }
  });
});

/**
 * @route   POST /api/students/loans
 * @desc    Solicitar novo empréstimo
 * @access  Private (Student)
 */
router.post('/loans', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Solicitar empréstimo',
    data: {
      note: 'Implementar lógica para criar nova solicitação de empréstimo'
    }
  });
});

/**
 * @route   GET /api/students/credit-score
 * @desc    Obter score de crédito do estudante
 * @access  Private (Student)
 */
router.get('/credit-score', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Score de crédito',
    data: {
      score: 0,
      riskBand: 'low',
      note: 'Implementar lógica para calcular score de crédito'
    }
  });
});

/**
 * @route   GET /api/students/academic-performance
 * @desc    Obter performance acadêmica
 * @access  Private (Student)
 */
router.get('/academic-performance', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Performance acadêmica',
    data: {
      performance: [],
      note: 'Implementar lógica para buscar dados acadêmicos'
    }
  });
});

module.exports = router;
