# QiTech - Plataforma de Financiamento Educacional

> **Fintech inovadora que conecta estudantes, investidores e instituições de ensino através de um marketplace de financiamento educacional.**

## 🚀 **Visão Geral**

A QiTech é uma plataforma completa que democratiza o acesso ao financiamento educacional, oferecendo:

- **Para Estudantes**: Empréstimos educacionais com taxas competitivas
- **Para Investidores**: Oportunidades de investimento com retorno atrativo
- **Para Instituições**: Ferramentas de gestão e integração financeira

## 📁 **Estrutura do Projeto**

```
qitech/
├── client/          # Frontend (Next.js)
├── server/          # Backend (Node.js/Express)
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── db/
│   │   ├── utils/
│   │   └── server.js
│   ├── db/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── package.json
│   ├── config.js
│   └── README.md
├── docs/           # Documentação
└── README.md       # Este arquivo
```

## 🛠️ **Tecnologias**

### **Frontend**
- **Next.js** - Framework React
- **Tailwind CSS** - Estilização
- **Componentes reutilizáveis**

### **Backend**
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Knex.js** - Query builder

### **Banco de Dados**
- **PostgreSQL** (Render)
- **Migrations** versionadas
- **Seeds** para dados de teste
- **Triggers** e **Functions** PL/pgSQL

## 🚀 **Início Rápido**

### **1. Server (API)**
```bash
cd server
npm install
npm run migrate:latest
npm run seed:run
npm run dev
```

### **2. Frontend (Website)**
```bash
cd client
npm install
npm run dev
```

### **3. Documentação**
```bash
cd docs
npm install
npm start
```

## 📚 **Documentação**

- **[Server API](./server/README.md)** - Documentação completa da API
- **[Documentação Técnica](./docs/)** - Arquitetura, banco de dados e fluxos
- **[Banco de Dados](./docs/docs/4.%20Banco%20de%20dados/)** - Estrutura e modelagem

## 🔐 **Autenticação**

### **Usuários de Teste**
| Email | Senha | Role |
|-------|-------|------|
| alice@test.com | 123456 | student |
| bob@test.com | 123456 | investor |
| charlie@test.com | 123456 | student |

### **Endpoints Principais**
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token
- `GET /api/students/*` - Rotas de estudantes
- `GET /api/investors/*` - Rotas de investidores
- `GET /api/loans/*` - Rotas de empréstimos

## 🏗️ **Arquitetura**

### **Server**
- **API RESTful** com Express.js
- **Autenticação JWT** com middleware
- **Banco PostgreSQL** com Knex.js
- **Validação** de dados
- **Segurança** com Helmet e CORS

### **Frontend**
- **Next.js** com App Router
- **Componentes** reutilizáveis
- **Responsive Design**
- **SEO** otimizado

### **Banco de Dados**
- **10 tabelas** principais
- **4 views** para consultas
- **15 funções** PostgreSQL
- **Triggers** automáticos
- **Ledger** de dupla entrada

## 🧪 **Testes**

```bash
# Testar API
cd server
npm run test:api

# Testar banco
npm run db:test
```

## 📊 **Funcionalidades**

### **Para Estudantes**
- ✅ Solicitar empréstimos
- ✅ Acompanhar score de crédito
- ✅ Histórico de performance acadêmica
- ✅ Dashboard personalizado

### **Para Investidores**
- ✅ Criar ofertas de investimento
- ✅ Portfólio de investimentos
- ✅ Analytics e métricas
- ✅ Gestão de risco

### **Para Instituições**
- ✅ Gestão de estudantes
- ✅ Relatórios financeiros
- ✅ Integração com sistemas
- ✅ Analytics institucionais

## 🔧 **Scripts Disponíveis**

### **Server**
```bash
npm start          # Produção
npm run dev        # Desenvolvimento
npm run test:api   # Testar API
npm run migrate:latest  # Executar migrations
npm run seed:run   # Popular banco
```

### **Frontend**
```bash
npm run dev        # Desenvolvimento
npm run build      # Build produção
npm start          # Servidor produção
```

## 🌟 **Diferenciais**

- **Matching Automático** entre empréstimos e ofertas
- **Score de Crédito Dinâmico** baseado em performance acadêmica
- **Antifraude** integrado
- **Monetização** automática com taxas
- **Ledger** de dupla entrada para auditoria
- **Contratos Digitais** com JSON

## 📈 **Roadmap**

- [ ] **Fase 1**: MVP com funcionalidades básicas ✅
- [ ] **Fase 2**: Integração com bancos
- [ ] **Fase 3**: App mobile
- [ ] **Fase 4**: IA para recomendações
- [ ] **Fase 5**: Expansão internacional

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 **Equipe**

Desenvolvido pela **equipe QiTech** para o **InovCamp QI Tech G32**.

---

**Desenvolvido com ❤️ para democratizar o acesso à educação**