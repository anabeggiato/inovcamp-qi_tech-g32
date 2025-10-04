const config = require('../config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('../db');

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const studentsRoutes = require('./routes/students.routes');
const investorsRoutes = require('./routes/investors.routes');
const loansRoutes = require('./routes/loans.routes');
const paymentsRoutes = require('./routes/payments.routes');
const facultiesRoutes = require('./routes/faculties.routes');
const recommendationsRoutes = require('./routes/recommendations.routes');

const app = express();
const PORT = config.server.port;

// Middlewares de segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Parser de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Rota de health check
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      success: true,
      message: 'API funcionando',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      environment: config.server.env
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro no health check',
      error: error.message
    });
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'QiTech API - Plataforma de Financiamento Educacional',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      investors: '/api/investors',
      loans: '/api/loans',
      payments: '/api/payments',
      faculties: '/api/faculties',
      recommendations: '/api/recommendations'
    },
    documentation: 'https://github.com/qitech/api-docs'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/investors', investorsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/faculties', facultiesRoutes);
app.use('/api/recommendations', recommendationsRoutes);

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️  Aviso: Conexão com banco de dados falhou');
    } else {
      console.log('✅ Conexão com banco de dados estabelecida');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado com sucesso!');
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/`);
      console.log(`🌍 Ambiente: ${config.server.env}`);
      console.log('📋 Endpoints disponíveis:');
      console.log('   POST /api/auth/login - Login');
      console.log('   GET  /api/auth/verify - Verificar token');
      console.log('   POST /api/auth/logout - Logout');
      console.log('   GET  /api/students/* - Rotas de estudantes');
      console.log('   GET  /api/investors/* - Rotas de investidores');
      console.log('   GET  /api/loans/* - Rotas de empréstimos');
      console.log('   GET  /api/payments/* - Rotas de pagamentos');
      console.log('   GET  /api/faculties/* - Rotas de instituições');
      console.log('   GET  /api/recommendations/* - Rotas de recomendações');
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de sinais para shutdown graceful
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido, encerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();

module.exports = app;
