const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger/swaggerConfig');
const { createServiceLogger } = require('../shared/logger');
const { createResponse, handleError } = require('../shared/utils');

// Importar rotas
const paymentRoutes = require('./routes/payments');
const paymentMainRoutes = require('./routes/payments-main');
const installmentRoutes = require('./routes/installments');
const custodyRoutes = require('./routes/custody');
const custodyAccountRoutes = require('./routes/custody-accounts');

// Inicializar sistema
const ledgerService = require('./ledger/ledgerService');
ledgerService.initializeSystemAccounts();

const app = express();
const PORT = process.env.PAYMENT_API_PORT || 3002;
const logger = createServiceLogger('payment-api');

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'QI-EDU Payment API Documentation'
}));

// Rotas
app.use('/payments', paymentRoutes);
app.use('/api/payments', paymentMainRoutes);
app.use('/installments', installmentRoutes);
app.use('/custody', custodyRoutes);
app.use('/custody/accounts', custodyAccountRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json(createResponse(true, 'Payment API está funcionando', {
        port: PORT,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    }));
});

// Inicia o servidor
app.listen(PORT, () => {
    logger.info(`Payment API Mock rodando na porta ${PORT}`);
    console.log(`💳 Payment API Mock rodando na porta ${PORT}`);
    console.log(`📚 Endpoints disponíveis:`);
    console.log(`   GET  /health`);
    console.log(`   GET  /api-docs - 📖 Documentação Swagger`);
    console.log(`\n🔧 Endpoints Internos:`);
    console.log(`   GET  /payments/options`);
    console.log(`   POST /payments/create-plan`);
    console.log(`   POST /payments/pay-installment`);
    console.log(`   POST /payments/orchestrate`);
    console.log(`   GET  /payments/status/:paymentId`);
    console.log(`   GET  /installments/:loanId`);
    console.log(`   POST /custody/investor/deposit - 💰 Depósito investidor`);
    console.log(`   GET  /custody/investor/:id/balance - 💰 Saldo investidor`);
    console.log(`   POST /custody/institution/transfer - 🏫 Transferência para faculdade`);
    console.log(`   GET  /custody/institution/:id/balance - 🏫 Saldo faculdade`);
    console.log(`   POST /custody/student/payment - 👨‍🎓 Pagamento estudante`);
    console.log(`\n🏦 Endpoints de Contas de Custódia:`);
    console.log(`   POST /custody/accounts - 🏦 Criar conta de custódia`);
    console.log(`   GET  /custody/accounts/:user_id - 📋 Consultar conta`);
    console.log(`   POST /custody/accounts/:user_id/deposit - 💰 Depositar valor`);
    console.log(`\n🌐 Endpoints para Backend Principal:`);
    console.log(`   POST /api/payments - 💳 Criar pagamento`);
    console.log(`   GET  /api/payments/:id - 📋 Consultar pagamento`);
    console.log(`   GET  /api/payments/balance - 💰 Saldo do usuário`);
    console.log(`   GET  /api/payments/transactions - 📊 Histórico`);
    console.log(`   POST /api/payments/transfer - 🔄 Transferir valores`);
    console.log(`   GET  /api/payments/fees - 💸 Taxas cobradas`);
    console.log(`   POST /api/payments/process - ⚙️ Processar pagamento`);
    console.log(`   POST /api/payments/webhook - 🔗 Webhook de confirmação`);
});

module.exports = app;
