# 💳 Payment API - Setup Simples

## 🚀 Como Usar

### 1. Aplicar Migrations
```bash
npx knex migrate:latest
```

### 2. Criar Dados de Teste
```bash
npx knex seed:run --specific=006_payment_api_test_data.js
```

### 3. Iniciar API
```bash
cd services/payment-api
node server.js
```

### 4. Testar
```bash
cd server
node test-api.js
```

## 📊 Endpoints Funcionando
- ✅ GET /health
- ✅ POST /custody/investor/deposit
- ✅ GET /custody/investor/:id/balance
- ✅ GET /custody/investor/:id/deposits
- ✅ POST /custody/accounts
- ✅ GET /custody/accounts/:user_id
- ✅ POST /custody/accounts/:user_id/deposit
- ✅ GET /installments/:loanId
- ✅ GET /installments/:loanId/summary

## 🎯 Status: 100% Funcional
