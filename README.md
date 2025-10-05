### QiTech - Plataforma de Financiamento Educacional

Documentação oficial para executar o projeto. Conteúdo objetivo, profissional e pronto para rodar.

### Sumário

- Requisitos
- Visão geral dos serviços e portas
- Instalação rápida (todos os serviços)
- Execução manual por serviço
- Banco de dados, migrations e seeds
- Teste rápido (health checks e login)
- Usuários de teste
- Dicas de troubleshooting (Windows/PowerShell)

### Requisitos

- Node.js 18+ (recomendado 18 LTS ou 20 LTS)
- npm 8+
- Windows PowerShell ou terminal equivalente

Observação: O backend já vem configurado para usar um PostgreSQL gerenciado (Render). Não é necessário ter Postgres local.

### Serviços e Portas

- Frontend `client` (Next.js): http://localhost:3000
- Backend principal `server` (Express): http://localhost:5000
- Mock Faculty API: http://localhost:3001
- Mock Payment API: http://localhost:3002
- Score Engine: http://localhost:3003

Endpoints de health:

- Backend: `GET http://localhost:5000/health`
- Faculty: `GET http://localhost:3001/health`
- Payment: `GET http://localhost:3002/health`
- Score: `GET http://localhost:3003/health`

### Instalação Rápida (todos os serviços)

Execute na raiz do repositório:

```bash
npm run install:all
```

Isso instala as dependências do backend e dos mocks (payment, score, faculty). Para o frontend, instale separadamente:

```bash
cd client && npm install
```

Aplicar migrations e seeds do backend (necessário na primeira execução):

```bash
cd server
npm run migrate:latest
npm run seed:run
```

Iniciar todos os serviços utilitários + backend (em paralelo):

```bash
cd ..
npm start
```

O comando acima usa `start-all-services.js` para subir:

- Faculty API (3001)
- Payment API (3002)
- Score Engine (3003)
- Backend (5000)

Em outra janela, subir o frontend:

```bash
cd client
npm run dev
```

Aplicação acessível em `http://localhost:3000`.

### Execução Manual por Serviço

Você pode subir cada serviço separadamente conforme necessidade.

Backend principal (`server`):

```bash
cd server
npm install
npm run migrate:latest
npm run seed:run
npm run dev   # Porta 5000
```

Frontend (`client`):

```bash
cd client
npm install
npm run dev   # Porta 3000
```

Mock Faculty API:

```bash
cd services/faculty-api
npm install
npm start      # Porta 3001
```

Mock Payment API:

```bash
cd services/payment-api
npm install
npm start      # Porta 3002
```

Score Engine:

```bash
cd services/score-engine
npm install
npm start      # Porta 3003
```

### Banco de Dados, Migrations e Seeds

O backend usa PostgreSQL via `server/config.js` (URL já configurada para Render). Comandos:

```bash
cd server
npm run migrate:status
npm run migrate:latest
npm run seed:run
npm run db:reset   # rollback all + latest + seed
```

Importante:

- Caso precise apontar para outro banco, ajuste a `connectionString` em `server/config.js` ou forneça `process.env.DATABASE_URL` e adapte `knexfile.js` para usar a env.
- SSL já está habilitado no `knexfile.js`.

### Teste Rápido

Health checks:

```bash
curl http://localhost:5000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

Login (backend):

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@test.com", "password": "123456"}'
```

Após logar, use o token em endpoints protegidos, por exemplo:

```bash
curl -H "Authorization: Bearer SEU_TOKEN" http://localhost:5000/api/students/profile
```

### Usuários de Teste

- `alice@test.com` / `123456` (student)
- `bob@test.com` / `123456` (investor)
- `charlie@test.com` / `123456` (student)

### Dicas de Troubleshooting (Windows/PowerShell)

- Porta em uso: finalize processos que ocupem `3000-3003` e `5000` ou altere a porta do serviço necessário.
- CORS: o backend está configurado para aceitar `http://localhost:3000`. Se mudar a porta do frontend, ajuste em `server/src/server.js` (origem do CORS).
- Falha ao conectar no banco: verifique sua rede/VPN. Se trocar o banco, atualize `server/config.js` e rode as migrations/seeds novamente.
- Node/nodemon não encontrados: confirme Node 18+ e rode `npm install` no diretório do serviço.
- Saída do `npm start` (raiz) mostra as URLs. O backend atende em `http://localhost:5000` (ignore qualquer log antigo indicando 3000).

### Scripts Úteis (raiz)

```bash
npm run install:all   # Instala deps backend + mocks
npm start             # Sobe mocks + backend em paralelo
npm run start:server  # Apenas backend (server)
npm run start:payment # Apenas Payment API
npm run start:score   # Apenas Score Engine
npm run start:faculty # Apenas Faculty API
```

### Documentação Relacionada

- Backend: `server/READMEBACKEND.md`
- Pagamentos (mock): `server/README-PAYMENT-API.md`
- Documentação Docusaurus: `docs/`

—

Projeto QI-EDU – InovCamp QI Tech G32.
