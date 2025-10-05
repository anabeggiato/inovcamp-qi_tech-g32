// investors.routes.js
const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
// const { MatchingController } = require('../controllers/matching.controller'); // (opcional, não usado aqui)

const router = express.Router();

// ====== MIDDLEWARES GERAIS ======
router.use(authenticateToken);
router.use(requireRole(['investor']));

// ====== MOCK SIMPLES DE INVESTIMENTOS ATIVOS ======
// Em produção, isso viria do banco (matches/ofertas + parcelas em aberto).
// Mantive um investorId para filtrar pelo usuário logado (req.user.id).
const MOCK_ACTIVE_INVESTMENTS = [
  {
    id: 'match-001',
    investorId: 1,
    student_id: 101,
    student_name: 'Ana Souza',
    course: 'Engenharia de Software',
    amount: 15000,
    status: 'active',
    startedAt: '2025-07-15',
    expectedAPR: 0.125, // 12.5% a.a. (exemplo)
  },
  {
    id: 'match-002',
    investorId: 1,
    student_id: 102,
    student_name: 'Carlos Lima',
    course: 'Administração',
    amount: 20000,
    status: 'active',
    startedAt: '2025-08-01',
    expectedAPR: 0.108, // 10.8% a.a.
  },
  {
    id: 'match-003',
    investorId: 2, // outro investidor
    student_id: 103,
    student_name: 'Joana Mendes',
    course: 'Direito',
    amount: 18000,
    status: 'active',
    startedAt: '2025-08-10',
    expectedAPR: 0.12,
  },
];

// Helper: formata a lista "limpa" (sem investorId) para resposta
function sanitizeInvestment(i) {
  const { investorId, ...rest } = i;
  return rest;
}

// ====== ROTAS DO INVESTIDOR ======

/**
 * @route   GET /api/investors/profile
 * @desc    Obter perfil do investidor
 * @access  Private (Investor)
 */
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Perfil do investidor',
    data: {
      user: req.user,
      note: 'Implementar lógica para buscar dados completos do investidor',
    },
  });
});

/**
 * @route   GET /api/investors/offers
 * @desc    Listar ofertas do investidor
 * @access  Private (Investor)
 */
router.get('/offers', (req, res) => {
  res.json({
    success: true,
    message: 'Ofertas do investidor',
    data: {
      offers: [],
      note: 'Implementar lógica para buscar ofertas do investidor',
    },
  });
});

/**
 * @route   POST /api/investors/offers
 * @desc    Criar nova oferta de investimento
 * @access  Private (Investor)
 */
router.post('/offers', (req, res) => {
  res.json({
    success: true,
    message: 'Criar oferta (placeholder)',
    data: {
      note: 'Implementar lógica para criar nova oferta de investimento',
    },
  });
});

/**
 * @route   GET /api/investors/portfolio
 * @desc    Obter portfólio de investimentos (agregado + lista de ativos)
 * @access  Private (Investor)
 *
 * ✅ Simples: retorna totalInvested, activeLoans e a lista activeInvestments
 *    construída a partir do MOCK, filtrando por req.user.id.
 */
router.get('/portfolio', (req, res) => {
  const investorId = Number(req.user?.id) || req.user?.id; // dependendo de como o id vem no token
  const myActive = MOCK_ACTIVE_INVESTMENTS
    .filter(i => i.investorId === investorId && i.status === 'active')
    .map(sanitizeInvestment);

  const totalInvested = myActive.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const activeLoans = myActive.length;

  // Retorno (returns) e risco (risk) são placeholders aqui.
  // Você pode calcular returns reais depois (ex.: parcelas pagas - principal).
  const returns = 0;
  const risk = activeLoans <= 1 ? 'low' : activeLoans <= 3 ? 'moderate' : 'high';

  res.json({
    success: true,
    message: 'Portfólio do investidor',
    data: {
      portfolio: {
        totalInvested,
        activeLoans,
        returns,
        risk,
        activeInvestments: myActive, // 👈 lista dos investimentos ATIVOS
      },
      note: 'Métrica simples baseada em mock; integrar com DB quando possível',
    },
  });
});

/**
 * @route   GET /api/investors/returns
 * @desc    Obter retornos dos investimentos
 * @access  Private (Investor)
 */
router.get('/returns', (req, res) => {
  res.json({
    success: true,
    message: 'Retornos do investidor',
    data: {
      returns: [],
      note: 'Implementar lógica para calcular retornos dos investimentos',
    },
  });
});

/**
 * @route   GET /api/investors/analytics
 * @desc    Obter analytics de investimento
 * @access  Private (Investor)
 */
router.get('/analytics', (req, res) => {
  res.json({
    success: true,
    message: 'Analytics do investidor',
    data: {
      analytics: {
        riskDistribution: {},
        performanceMetrics: {},
        marketInsights: {},
      },
      note: 'Implementar lógica para analytics avançados',
    },
  });
});

// ===== ROTAS DE MATCHING P2P =====

/**
 * @route   GET /api/investors/:investorId/offers/:offerId/eligible-loans
 * @desc    Buscar empréstimos elegíveis para uma oferta específica
 * @access  Private (Investor)
 */
router.get('/:investorId/offers/:offerId/eligible-loans', (req, res) => {
  res.json({
    success: true,
    message: 'Empréstimos elegíveis (placeholder)',
    data: { eligibleLoans: [] },
  });
});

/**
 * @route   GET /api/investors/:investorId/matching-stats
 * @desc    Obter estatísticas de matching para um investidor
 * @access  Private (Investor)
 */
router.get('/:investorId/matching-stats', (req, res) => {
  res.json({
    success: true,
    message: 'Estatísticas de matching (placeholder)',
    data: { stats: {} },
  });
});

/**
 * @route   POST /api/investors/:investorId/offers/:offerId/validate-investment
 * @desc    Validar se um investimento é viável
 * @access  Private (Investor)
 */
router.post('/:investorId/offers/:offerId/validate-investment', (req, res) => {
  res.json({
    success: true,
    message: 'Validação de investimento (placeholder)',
    data: { valid: true },
  });
});

/**
 * @route   POST /api/investors/:investorId/offers/:offerId/execute-match
 * @desc    Executar um match (salvar no banco)
 * @access  Private (Investor)
 */
router.post('/:investorId/offers/:offerId/execute-match', (req, res) => {
  res.json({
    success: true,
    message: 'Executar match (placeholder)',
    data: { matchId: 'mock-match-id' },
  });
});

/**
 * @route   GET /api/investors/:investorId/matches
 * @desc    Buscar matches de um investidor
 * @access  Private (Investor)
 */
router.get('/:investorId/matches', (req, res) => {
  res.json({
    success: true,
    message: 'Matches do investidor (placeholder)',
    data: { matches: [] },
  });
});

module.exports = router;
