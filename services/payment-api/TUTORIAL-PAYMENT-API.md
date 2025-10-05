# 🚀 Tutorial - Payment API QI-EDU

## 📋 Pré-requisitos
- Node.js (versão 18+)
- npm

---

## 1️⃣ Estrutura Necessária
```
services/
├── shared/           # Módulos compartilhados (OBRIGATÓRIO)
└── payment-api/      # API de Pagamentos
```

---

## 2️⃣ Passo a Passo - Só Payment API

### 🔧 Passo 1: Instalar Módulos Compartilhados (OBRIGATÓRIO)
```bash
# Navegar para o diretório shared
cd services/shared

# Instalar dependências
npm install
```

### 🔧 Passo 2: Instalar Payment API
```bash
# Navegar para a Payment API
cd services/payment-api

# Instalar dependências
npm install

# Iniciar a Payment API
node server.js
```

---

## 3️⃣ Comandos de Teste

### 🧪 Testar Payment API
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3002/health"

# Consultar taxas
Invoke-RestMethod -Uri "http://localhost:3002/api/payments/fees"

# Consultar saldo
Invoke-RestMethod -Uri "http://localhost:3002/api/payments/balance"

# Histórico de transações
Invoke-RestMethod -Uri "http://localhost:3002/api/payments/transactions"
```

---

## 4️⃣ Troubleshooting

### ❌ Erro: "Cannot find module 'pg'"
```bash
# Instalar pg no diretório shared
cd services/shared
npm install pg
```

### ❌ Erro: "Cannot find module 'winston'"
```bash
# Instalar winston no diretório shared
cd services/shared
npm install winston
```

### ❌ Erro: "Port already in use"
```bash
# Verificar processos rodando
netstat -ano | findstr :3002

# Matar processo se necessário
taskkill /PID <PID_NUMBER> /F
```

---

## 5️⃣ Resumo dos Comandos

```bash
# 1. Módulos Compartilhados (OBRIGATÓRIO)
cd services/shared && npm install

# 2. Payment API
cd services/payment-api && npm install && node server.js
```

**🎉 Pronto! Payment API rodando em `http://localhost:3002`!**

---

## 6️⃣ Endpoints Disponíveis

### 💳 Pagamentos (porta 3002)
- `GET /health` - Health check
- `GET /api/payments/fees` - Consultar taxas
- `GET /api/payments/balance` - Consultar saldo
- `GET /api/payments/transactions` - Histórico
- `POST /api/payments` - Criar pagamento

### 🏦 Custódia (porta 3002)
- `POST /custody/accounts` - Criar conta de custódia
- `GET /custody/accounts/:id` - Consultar conta

### 🔧 Endpoints Internos
- `GET /payments/options` - Opções de pagamento
- `POST /payments/create-plan` - Criar plano de pagamento
- `POST /payments/pay-installment` - Pagar parcela
- `POST /payments/orchestrate` - Orquestrar pagamento
- `GET /payments/status/:paymentId` - Status do pagamento
- `GET /installments/:loanId` - Parcelas do empréstimo

### 🏦 Endpoints de Custódia
- `POST /custody/investor/deposit` - 💰 Depósito investidor
- `GET /custody/investor/:id/balance` - 💰 Saldo investidor
- `POST /custody/institution/transfer` - 🏫 Transferência para faculdade
- `GET /custody/institution/:id/balance` - 🏫 Saldo faculdade
- `POST /custody/student/payment` - 👨‍🎓 Pagamento estudante

---

## 7️⃣ Documentação Swagger

Acesse a documentação completa da API em:
```
http://localhost:3002/api-docs
```

---

## 8️⃣ Logs e Debug

A Payment API gera logs detalhados:
- Console: Logs em tempo real
- Arquivo: `logs/payment-api.log`

---

## 9️⃣ Variáveis de Ambiente

A API utiliza as seguintes variáveis (já configuradas):
- `PAYMENT_API_PORT=3002`
- `DB_HOST` - Host do banco de dados
- `RENDER_DATABASE_URL` - URL do banco em nuvem

---

## 🎯 Status dos Serviços

### ✅ Funcionando
- Payment API (porta 3002)
- Health check
- Endpoints de pagamento
- Endpoints de custódia

### 🔧 Para Desenvolvimento
- Logs detalhados
- Swagger documentation
- Error handling
- CORS habilitado

---

**🎉 Payment API QI-EDU funcionando perfeitamente!**
