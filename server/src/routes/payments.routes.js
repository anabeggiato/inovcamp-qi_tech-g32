const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { apiIntegration } = require('../services/apiIntegration.service');

const router = express.Router();

// Aplicar autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route   GET /api/payments
 * @desc    Listar pagamentos do usuário
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    console.log(`🔍 Listando pagamentos para usuário ${userId}`);

    // Buscar transações via Payment API
    const transactions = await apiIntegration.getTransactions(userId, page, limit);

    res.json({
      success: true,
      message: 'Pagamentos listados com sucesso',
      data: {
        transactions: transactions.data?.transactions || [],
        pagination: transactions.data?.pagination || { page, limit, total: 0 },
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar pagamentos:', error);

    // Fallback com dados mockados
    res.json({
      success: true,
      message: 'Pagamentos listados (dados mockados)',
      data: {
        transactions: [],
        pagination: { page: 1, limit: 20, total: 0 },
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        },
        note: 'Payment API indisponível - dados mockados'
      }
    });
  }
});

/**
 * @route   GET /api/payments/:id
 * @desc    Obter detalhes de um pagamento específico
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user.id;

    console.log(`🔍 Buscando pagamento ${paymentId} para usuário ${userId}`);

    // Buscar pagamento via Payment API
    const payment = await apiIntegration.getPayment(paymentId);

    res.json({
      success: true,
      message: 'Pagamento encontrado com sucesso',
      data: {
        payment: payment.data,
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar pagamento:', error);

    res.status(404).json({
      success: false,
      message: 'Pagamento não encontrado',
      data: {
        paymentId: req.params.id,
        note: 'Payment API indisponível ou pagamento não existe'
      }
    });
  }
});

/**
 * @route   POST /api/payments
 * @desc    Criar novo pagamento
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentData = {
      ...req.body,
      user_id: userId,
      created_by: userId
    };

    console.log(`💳 Criando pagamento para usuário ${userId}`);

    // Criar pagamento via Payment API
    const payment = await apiIntegration.createPayment(paymentData);

    res.status(201).json({
      success: true,
      message: 'Pagamento criado com sucesso',
      data: {
        payment: payment.data,
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error);

    res.status(500).json({
      success: false,
      message: 'Erro ao criar pagamento',
      error: error.message || 'Payment API indisponível'
    });
  }
});

/**
 * @route   GET /api/payments/balance
 * @desc    Obter saldo do usuário
 * @access  Private
 */
router.get('/balance', async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`💰 Consultando saldo para usuário ${userId}`);

    // Buscar saldo via Payment API
    const balance = await apiIntegration.getUserBalance(userId);

    res.json({
      success: true,
      message: 'Saldo obtido com sucesso',
      data: {
        balance: balance.data?.balance || 0,
        currency: 'BRL',
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao consultar saldo:', error);

    // Fallback com dados mockados
    res.json({
      success: true,
      message: 'Saldo obtido (dados mockados)',
      data: {
        balance: 0,
        currency: 'BRL',
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        },
        note: 'Payment API indisponível - dados mockados'
      }
    });
  }
});

/**
 * @route   GET /api/payments/transactions
 * @desc    Obter histórico de transações
 * @access  Private
 */
router.get('/transactions', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    console.log(`📊 Consultando transações para usuário ${userId}`);

    // Buscar transações via Payment API
    const transactions = await apiIntegration.getTransactions(userId, page, limit);

    res.json({
      success: true,
      message: 'Transações obtidas com sucesso',
      data: {
        transactions: transactions.data?.transactions || [],
        pagination: transactions.data?.pagination || { page, limit, total: 0 },
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao consultar transações:', error);

    // Fallback com dados mockados
    res.json({
      success: true,
      message: 'Transações obtidas (dados mockados)',
      data: {
        transactions: [],
        pagination: { page: 1, limit: 20, total: 0 },
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        },
        note: 'Payment API indisponível - dados mockados'
      }
    });
  }
});

/**
 * @route   POST /api/payments/transfer
 * @desc    Transferir valores entre contas
 * @access  Private
 */
router.post('/transfer', async (req, res) => {
  try {
    const userId = req.user.id;
    const transferData = {
      ...req.body,
      from_user_id: userId
    };

    console.log(`🔄 Processando transferência para usuário ${userId}`);

    // Processar transferência via Payment API
    const transfer = await apiIntegration.transferMoney(transferData);

    res.json({
      success: true,
      message: 'Transferência processada com sucesso',
      data: {
        transfer: transfer.data,
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao processar transferência:', error);

    res.status(500).json({
      success: false,
      message: 'Erro ao processar transferência',
      error: error.message || 'Payment API indisponível'
    });
  }
});

/**
 * @route   GET /api/payments/fees
 * @desc    Obter taxas cobradas
 * @access  Private
 */
router.get('/fees', async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`💸 Consultando taxas para usuário ${userId}`);

    // Buscar taxas via Payment API
    const fees = await apiIntegration.getFees(userId);

    res.json({
      success: true,
      message: 'Taxas obtidas com sucesso',
      data: {
        fees: fees.data?.fees || [],
        total: fees.data?.total || 0,
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao consultar taxas:', error);

    // Fallback com dados mockados
    res.json({
      success: true,
      message: 'Taxas obtidas (dados mockados)',
      data: {
        fees: [],
        total: 0,
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        },
        note: 'Payment API indisponível - dados mockados'
      }
    });
  }
});

/**
 * @route   POST /api/payments/process
 * @desc    Processar pagamento
 * @access  Private
 */
router.post('/process', async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentData = {
      ...req.body,
      user_id: userId
    };

    console.log(`⚙️ Processando pagamento para usuário ${userId}`);

    // Processar pagamento via Payment API
    const payment = await apiIntegration.processPayment(paymentData);

    res.json({
      success: true,
      message: 'Pagamento processado com sucesso',
      data: {
        payment: payment.data,
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);

    res.status(500).json({
      success: false,
      message: 'Erro ao processar pagamento',
      error: error.message || 'Payment API indisponível'
    });
  }
});

/**
 * @route   POST /api/payments/custody/deposit
 * @desc    Depositar na conta de custódia
 * @access  Private
 */
router.post('/custody/deposit', async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, description } = req.body;

    console.log(`💰 Depositando ${amount} na custódia para usuário ${userId}`);

    // Depositar via Payment API
    const deposit = await apiIntegration.depositToCustody(userId, amount, description);

    res.json({
      success: true,
      message: 'Depósito realizado com sucesso',
      data: {
        deposit: deposit.data,
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao depositar na custódia:', error);

    res.status(500).json({
      success: false,
      message: 'Erro ao depositar na custódia',
      error: error.message || 'Payment API indisponível'
    });
  }
});

/**
 * @route   POST /api/payments/custody/account
 * @desc    Criar conta de custódia
 * @access  Private
 */
router.post('/custody/account', async (req, res) => {
  try {
    const userId = req.user.id;
    const accountData = {
      ...req.body,
      user_id: userId
    };

    console.log(`🏦 Criando conta de custódia para usuário ${userId}`);

    // Criar conta via Payment API
    const account = await apiIntegration.createCustodyAccount(accountData);

    res.status(201).json({
      success: true,
      message: 'Conta de custódia criada com sucesso',
      data: {
        account: account.data,
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar conta de custódia:', error);

    res.status(500).json({
      success: false,
      message: 'Erro ao criar conta de custódia',
      error: error.message || 'Payment API indisponível'
    });
  }
});

module.exports = router;
