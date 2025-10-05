const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger/swaggerConfig');
const { createServiceLogger } = require('../shared/logger');
const { createResponse, handleError } = require('../shared/utils');

dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

// Importar rotas
const scoreRoutes = require('./routes/scores');
const fraudRoutes = require('./routes/fraud');
const creditRoutes = require('./routes/credit');

// Inicializar sistema
const scoreEngine = require('./services/scoreEngine');
const fraudDetector = require('./services/fraudDetector');

const app = express();
const PORT = process.env.SCORE_API_PORT || 3003;
const logger = createServiceLogger('score-engine');

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'QI-EDU Score Engine - Serasa + Sift Inspired'
}));

// Rotas
app.use('/scores', scoreRoutes);
app.use('/fraud', fraudRoutes);
app.use('/credit', creditRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json(createResponse(true, 'QI-EDU Score Engine está funcionando', {
        port: PORT,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        inspired_by: ['Serasa Experian', 'Sift Science']
    }));
});

// Inicia o servidor
app.listen(PORT, () => {
    logger.info(`QI-EDU Score Engine rodando na porta ${PORT}`);
    console.log(`🏦 QI-EDU Score Engine rodando na porta ${PORT}`);
    console.log(`📚 Endpoints disponíveis:`);
    console.log(`   GET  /health`);
    console.log(`   GET  /api-docs - 📖 Documentação Swagger`);
    console.log(`\n🎯 Endpoints de Score (Serasa-Inspired):`);
    console.log(`   POST /scores/calculate - 🧮 Calcular score 0-1000`);
    console.log(`   GET  /scores/:userId - 📊 Consultar score do usuário`);
    console.log(`   GET  /scores/:userId/band - 🏷️ Consultar faixa de risco (A-E)`);
    console.log(`   GET  /scores/:userId/factors - 🔍 Fatores negativos`);
    console.log(`   GET  /scores/:userId/history - 📈 Histórico de scores`);
    console.log(`\n🛡️ Endpoints de Antifraude (Sift-Inspired):`);
    console.log(`   POST /fraud/analyze - 🔍 Analisar transação em tempo real`);
    console.log(`   POST /fraud/events - 📝 Registrar evento de fraude`);
    console.log(`   GET  /fraud/:userId/risk - ⚠️ Consultar risco do usuário`);
    console.log(`   GET  /fraud/alerts - 🚨 Alertas de fraude`);
    console.log(`\n💳 Endpoints de Crédito:`);
    console.log(`   POST /credit/analyze - 💰 Análise de crédito completa`);
    console.log(`\n🔗 Inspirado em: Serasa Experian + Sift Science`);
});

module.exports = app;
