# QiTech Backend API

Backend API para a plataforma QiTech de financiamento educacional.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL (já configurado no Render)
- npm ou yarn

### Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
# O arquivo config.js já está configurado com a URL do banco PostgreSQL
# Se necessário, você pode modificar as configurações em config.js
```

3. **Executar migrations (se necessário):**
```bash
npm run migrate:latest
```

4. **Popular banco com dados de teste:**
```bash
npm run seed:run
```

5. **Iniciar servidor:**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor com nodemon

# Produção
npm start           # Inicia servidor

# Banco de dados
npm run migrate:latest    # Executa migrations
npm run migrate:rollback  # Reverte migrations
npm run migrate:status    # Status das migrations
npm run seed:run          # Executa seeds
npm run db:reset          # Reset completo do banco
npm run db:test           # Teste completo do banco
```

## 🔐 Autenticação

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "alice@test.com",
  "password": "123456"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "name": "Alice Silva",
      "email": "alice@test.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### Usar Token

```bash
GET /api/students/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📚 Endpoints Disponíveis

### 🔐 Autenticação (`/api/auth`)
- `POST /login` - Login do usuário
- `GET /verify` - Verificar token válido
- `POST /logout` - Logout do usuário

### 👨‍🎓 Estudantes (`/api/students`)
- `GET /profile` - Perfil do estudante
- `GET /loans` - Listar empréstimos
- `POST /loans` - Solicitar empréstimo
- `GET /credit-score` - Score de crédito
- `GET /academic-performance` - Performance acadêmica

### 💰 Investidores (`/api/investors`)
- `GET /profile` - Perfil do investidor
- `GET /offers` - Listar ofertas
- `POST /offers` - Criar oferta
- `GET /portfolio` - Portfólio
- `GET /returns` - Retornos
- `GET /analytics` - Analytics

### 💳 Empréstimos (`/api/loans`)
- `GET /` - Listar empréstimos
- `GET /:id` - Detalhes do empréstimo
- `POST /` - Criar empréstimo (estudantes)
- `PUT /:id/status` - Atualizar status
- `GET /:id/matches` - Matches do empréstimo
- `POST /:id/disburse` - Liberar recursos

### 💸 Pagamentos (`/api/payments`)
- `GET /` - Listar pagamentos
- `GET /:id` - Detalhes do pagamento
- `POST /` - Criar pagamento
- `GET /balance` - Saldo do usuário
- `GET /transactions` - Histórico
- `POST /transfer` - Transferir valores
- `GET /fees` - Taxas cobradas

### 🏫 Instituições (`/api/faculties`)
- `GET /` - Listar instituições
- `GET /:id` - Detalhes da instituição
- `GET /:id/loans` - Empréstimos da instituição
- `GET /:id/students` - Estudantes da instituição
- `GET /:id/analytics` - Analytics da instituição
- `POST /` - Cadastrar instituição
- `PUT /:id` - Atualizar instituição

### 🎯 Recomendações (`/api/recommendations`)
- `GET /students` - Recomendações para estudantes
- `GET /investors` - Recomendações para investidores
- `GET /matching` - Recomendações de matching
- `GET /risk-assessment` - Avaliação de risco
- `GET /credit-score` - Recomendações de score
- `POST /feedback` - Feedback de recomendações

## 🧪 Testando a API

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@test.com", "password": "123456"}'
```

### 3. Acessar endpoint protegido
```bash
curl -X GET http://localhost:3000/api/students/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 👥 Usuários de Teste

Baseado nos seeds do banco:

| Email | Senha | Role | Descrição |
|-------|-------|------|-----------|
| alice@test.com | 123456 | student | Estudante |
| bob@test.com | 123456 | investor | Investidor |
| charlie@test.com | 123456 | student | Estudante |

## 🔧 Configuração

### Configuração

O projeto usa o arquivo `config.js` para configurações:

```javascript
module.exports = {
  database: {
    connectionString: 'postgres://qitech_user:...@dpg-d3cvvsl6ubrc73f64cpg-a.oregon-postgres.render.com:5432/qitech'
  },
  jwt: {
    secret: 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: '24h'
  },
  server: {
    port: 3000,
    env: 'development'
  }
};
```

### Estrutura do Projeto

```
src/
├── controllers/     # Controllers da API
├── routes/         # Definição das rotas
├── middleware/     # Middlewares (auth, etc.)
├── db/            # Conexão com banco
├── utils/         # Utilitários (hash, etc.)
└── server.js      # Servidor principal
```

## 🛡️ Segurança

- **JWT Authentication**: Tokens seguros com expiração
- **Role-based Access**: Controle de acesso por role
- **Password Hashing**: Senhas hasheadas com bcrypt
- **CORS**: Configuração de CORS
- **Helmet**: Headers de segurança
- **Input Validation**: Validação de entrada com express-validator

## 📊 Banco de Dados

O projeto usa PostgreSQL com Knex.js para:
- Migrations para versionamento do schema
- Seeds para dados de teste
- Conexão segura com SSL

### Comandos do Banco

```bash
# Ver status das migrations
npm run migrate:status

# Executar migrations
npm run migrate:latest

# Reverter migrations
npm run migrate:rollback

# Popular com dados de teste
npm run seed:run

# Reset completo
npm run db:reset

# Teste completo
npm run db:test
```

## 🚀 Deploy

### Render.com

1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Deploy automático

### Variáveis de Produção

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=seu-jwt-secret-super-seguro
RENDER_DATABASE_URL=sua-url-do-banco
```

## 📝 Logs

O servidor usa Morgan para logging:
- Requests HTTP
- Status codes
- Response times
- User agents

## 🔍 Debug

Para debug, use:
```bash
NODE_ENV=development npm run dev
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do servidor
2. Testar conexão com banco
3. Verificar variáveis de ambiente
4. Consultar documentação da API

---

**Desenvolvido com ❤️ pela equipe QiTech**
