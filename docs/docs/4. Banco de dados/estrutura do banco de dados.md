---
title: Estrutura do banco de dados
sidebar_position: 4
---

# Modelagem de Banco de Dados

## 1. Decisões de Design

- **Minimalismo:** reduzimos o número de tabelas para simplificar o MVP e acelerar o desenvolvimento.
- **Snapshots em `users`:** armazenamos score de crédito e status antifraude mais recentes no próprio usuário para consultas rápidas.
- **Histórico separado:** detalhes ficam em tabelas próprias (`frauds`, `scores`, `academic_performance`) garantindo rastreabilidade e auditoria.
- **Ledger de dupla entrada:** toda movimentação financeira (empréstimos, pagamentos, repasses) passa pelo ledger, garantindo consistência contábil.
- **Uso de JSONB:** colunas JSON permitem armazenar informações flexíveis (contratos, payloads de antifraude, metadados), sem precisar criar dezenas de tabelas auxiliares.
- **Flexibilidade e prototipagem rápida:** ideal para MVP e hackathons.

---

## 2. Vantagens da Estrutura

- **Simplicidade para prototipagem** e rápida evolução do MVP.
- **Didática e clareza** para mentores e jurados entenderem.
- **Escalabilidade:** cada módulo pode ser transformado em microserviço ou tabela especializada no futuro.
- **Transparência:** ledger garante rastreabilidade financeira.
- **Desacoplamento:** separação clara entre usuários, empréstimos, ofertas, fraudes, scores e movimentações.
- **Auditoria:** histórico append-only em `frauds`, `scores` e `ledger`.

---

## 3. Migrations e Seeds

### Migrations

- **Função:** versionar e criar/alterar tabelas do banco de forma reproduzível.
- **Ferramenta usada:** [Knex.js](https://knexjs.org/), permitindo definir migrations em JavaScript.
- **Fluxo de uso:**
  1. Criar migration: `npx knex migrate:make create_users_table`
  2. Rodar todas as migrations: `npx knex migrate:latest --knexfile knexfile.js`
  3. Cada migration cria ou altera tabelas com controle de versão (coluna `id` autoincrement, constraints, foreign keys).

### Seeds

- **Função:** popular o banco com dados iniciais para testes e demos.
- **Exemplo:** tabela `users`, `offers` e `loans` recebem registros iniciais de teste.
- **Comando:** `npx knex seed:run --knexfile knexfile.js`
- **Benefício:** garante que qualquer desenvolvedor ou ambiente consiga reproduzir dados de teste consistentes.

> Observação: migrations + seeds permitem que o banco seja reconstruído do zero rapidamente, essencial em hackathons e deploys em ambientes diferentes (local, staging, render).

---

## 4. Modelagem do Banco de Dados

| Tabela                   | Principais Campos                                                                                                                                                                     | Descrição                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **users**                | id, name, cpf, email, is_system, role, fraud_score, fraud_status, credit_score, risk_band                                                                                             | Dados cadastrais + snapshots de antifraude e score de crédito    |
| **institutions**         | id, name, integration_meta, institution_user_id                                                                                                                                       | Informações de instituições de ensino + usuário sistema          |
| **loans**                | id, borrower_id, school_id, custody_user_id, amount, term_months, status, contract_json, origination_pct, marketplace_pct, custody_pct_monthly, spread_pct_annual, revenue_first_year | Pedidos de empréstimo + campos de monetização                    |
| **offers**               | id, investor_id, amount_available, term_months, min_rate                                                                                                                              | Ofertas de investimento dos investidores                         |
| **matches**              | id, loan_id, offer_id, amount_matched, rate                                                                                                                                           | Relacionamento entre pedidos e ofertas (fracionamento permitido) |
| **ledger**               | id, account_type, user_id, account_ref, amount, dc, ref, meta                                                                                                                         | Lançamentos de dupla entrada para saldos e pagamentos            |
| **frauds**               | id, user_id, type, severity, payload                                                                                                                                                  | Histórico de sinais antifraude                                   |
| **scores**               | id, user_id, score, risk_band, reason_json                                                                                                                                            | Histórico de cálculos de score de crédito                        |
| **academic_performance** | id, user_id, school_id, period, grade_avg, attendance_pct, status, meta                                                                                                               | Histórico acadêmico para cálculo de score                        |
| **loan_fees**            | id, loan_id, fee_type, amount, period_start, period_end, charged_at, ledger_ref, meta                                                                                                 | Audit trail de taxas cobradas por empréstimo                     |

---

## 5. Fluxo dos Dados

1. **Cadastro/Onboarding:** cria usuário em `users`. OTPs e verificações KYC podem gerar registros em `frauds`.
2. **Antifraude:** cada sinal é salvo em `frauds`; snapshot em `users` atualizado (`fraud_score`, `fraud_status`).
3. **Score de Crédito:** cada cálculo é salvo em `scores`; snapshot em `users` atualizado (`credit_score`, `risk_band`).
4. **Empréstimos (`loans`):** tomadores registram pedidos de empréstimo com campos de monetização.
5. **Ofertas (`offers`):** investidores registram ofertas de investimento.
6. **Matching:** pedidos e ofertas são casados automaticamente via função `match_loan()`, registrados em `matches`.
7. **Ledger:** toda liberação, pagamento e repasse é registrado em dupla entrada (`ledger`).
8. **Monetização:** taxas são cobradas automaticamente via triggers e funções, registradas em `loan_fees`.
9. **Saldos:** consultados via `VIEW balances` ou funções agregadas.
10. **Revenue:** receita calculada automaticamente via `VIEW revenue_by_loan`.

---

Usuário (borrower)  
│  
▼  
Cadastro / Onboarding

- Tabela: `users`
- Inserção de dados básicos
- Verificação KYC  
  │  
  ▼  
  Antifraude Automático
- Tabela: `frauds`
- Trigger: `trg_after_insert_fraud()`
- Atualiza snapshot em `users` (`fraud_score`, `fraud_status`)  
  │  
  ▼  
  Score de Crédito
- Tabela: `scores`
- Trigger: `trg_after_insert_score()`
- Atualiza snapshot em `users` (`credit_score`, `risk_band`)  
  │  
  ▼  
  Empréstimo (`loans`)
- Usuário cria pedido com campos de monetização
- Trigger: `trg_compute_loan_revenue()` calcula receita  
  │  
  ▼  
  Matching Automático
- Tabelas: `offers`, `matches`
- Função: `match_loan()` conecta empréstimos a ofertas  
  │  
  ▼  
  Contrato Digital
- JSON em `contract_json` de `loans`  
  │  
  ▼  
  Liberação de Recursos
- Função: `release_to_institution()`
- Função: `ledger_transfer()`
- Tabela: `ledger` (débito/crédito)  
  │  
  ▼  
  Monetização Automática
- Trigger: `trg_after_update_loan_disbursed()`
- Funções: `charge_origination_and_marketplace()`, `charge_custody_monthly()`
- Tabela: `loan_fees` (audit trail)
  │  
  ▼  
  Saldo e Revenue Atualizados
- View: `balances`
- View: `revenue_by_loan`

---

## 6. Diagrama Entidade-Relacionamento (ERD)

```mermaid
erDiagram
    USERS {
        int id PK
        text name
        char(11) cpf
        text email
        boolean is_system
        text role
        int fraud_score
        text fraud_status
        int credit_score
        text risk_band
        timestamp created_at
        timestamp updated_at
    }

    INSTITUTIONS {
        int id PK
        text name
        jsonb integration_meta
        int institution_user_id FK
        timestamp created_at
        timestamp updated_at
    }

    LOANS {
        int id PK
        int borrower_id FK
        int school_id FK
        int custody_user_id FK
        numeric amount
        int term_months
        text status
        jsonb contract_json
        numeric origination_pct
        numeric marketplace_pct
        numeric custody_pct_monthly
        numeric spread_pct_annual
        numeric revenue_first_year
        timestamp created_at
        timestamp updated_at
    }

    OFFERS {
        int id PK
        int investor_id FK
        numeric amount_available
        int term_months
        numeric min_rate
        timestamp created_at
        timestamp updated_at
    }

    MATCHES {
        int id PK
        int loan_id FK
        int offer_id FK
        numeric amount_matched
        numeric rate
        timestamp created_at
    }

    LEDGER {
        int id PK
        text account_type
        int user_id FK
        text account_ref
        numeric amount
        char dc
        text ref
        jsonb meta
        timestamp created_at
    }

    FRAUDS {
        int id PK
        int user_id FK
        text type
        int severity
        jsonb payload
        timestamp created_at
    }

    SCORES {
        int id PK
        int user_id FK
        int score
        text risk_band
        jsonb reason_json
        timestamp created_at
    }

    ACADEMIC_PERFORMANCE {
        int id PK
        int user_id FK
        int school_id FK
        text period
        numeric grade_avg
        numeric attendance_pct
        text status
        jsonb meta
        timestamp created_at
    }

    LOAN_FEES {
        int id PK
        int loan_id FK
        text fee_type
        numeric amount
        date period_start
        date period_end
        timestamp charged_at
        text ledger_ref
        jsonb meta
        timestamp created_at
    }

    USERS ||--o{ LOANS : "borrows"
    USERS ||--o{ OFFERS : "creates"
    USERS ||--o{ FRAUDS : "generates"
    USERS ||--o{ SCORES : "generates"
    USERS ||--o{ LEDGER : "has_account"
    USERS ||--o{ ACADEMIC_PERFORMANCE : "has_performance"
    INSTITUTIONS ||--o{ LOANS : "receives"
    INSTITUTIONS ||--o{ ACADEMIC_PERFORMANCE : "tracks"
    LOANS ||--o{ MATCHES : "matches_with"
    OFFERS ||--o{ MATCHES : "matches_with"
    LOANS ||--o{ LOAN_FEES : "generates_fees"
```

## 7. Tecnologias e justificativa

### Banco de Dados: PostgreSQL (Render)

- **Por que:** ACID, robusto, suporte a JSONB, views, funções e locks por linha.
- **Benefício:** prototipagem rápida de regras complexas (ledger, matching, triggers) sem infra pesada.
- **Trade-off:** NoSQL não garante consistência contábil necessária para o ledger.

### JSONB (`contract_json`, `payload`, `meta`)

- **Flexível:** contratos, antifraude e metadados sem tabelas extras.
- **Rápido para MVP:** mudanças de schema não quebram banco.
- **Trade-off:** validação de dados na aplicação necessária.

### Funções PL/pgSQL

**Funções Core:**

- `ledger_transfer()`: transferências de dupla entrada
- `match_loan()`: matching automático de empréstimos e ofertas
- `create_institution_user()`: criação de usuários sistema para instituições
- `create_custody_for_loan()`: criação de usuários custódia
- `recompute_score_for_user()`: recálculo de score baseado em performance acadêmica e fraudes
- `release_to_institution()`: liberação de recursos para instituições

**Funções de Monetização:**

- `ensure_platform_user()`: criação de usuário plataforma
- `compute_revenue_first_year()`: cálculo de receita do primeiro ano
- `charge_fee_for_loan()`: cobrança de taxas com audit trail
- `charge_origination_and_marketplace()`: cobrança de taxas de origem e marketplace
- `charge_custody_monthly()`: cobrança mensal de custódia

- Regras críticas encapsuladas no banco, garantindo atomicidade e evitando condições de corrida.
- **Benefício:** segurança mesmo com concorrência e lógica persistente no banco.

### Triggers e snapshots em `users`

**Triggers Core:**

- `trg_after_insert_fraud()`: atualiza fraud_score e fraud_status automaticamente
- `trg_after_insert_score()`: atualiza credit_score e risk_band automaticamente
- `trg_after_insert_academic()`: recalcula score quando performance acadêmica é inserida

**Triggers de Monetização:**

- `trg_compute_loan_revenue()`: calcula revenue_first_year automaticamente
- `trg_after_update_loan_disbursed()`: cobra taxas quando empréstimo é liberado

- Mantêm snapshots consistentes com histórico.
- **Benefício:** consultas e decisões em tempo real.
- **Trade-off:** aumenta complexidade de debugging, mas ideal para MVP com auditoria.

### Ledger de dupla entrada

- **Por que:** consistência financeira e rastreabilidade.
- **Benefício:** auditoria e reconciliação simplificadas.

### Views

**`balances`:**

- Consulta de saldo por usuário isolando lógica contábil da aplicação
- Calcula automaticamente créditos menos débitos por usuário

**`revenue_by_loan`:**

- Consulta de receita por empréstimo
- Mostra ticket, receita projetada (primeiro ano) e receita realizada (taxas cobradas)

### Ferramentas auxiliares

- **Render:** deploy rápido do PostgreSQL.
- **DBeaver:** gerenciamento visual do banco.
- **Knex.js:** migrations e seeds para versão e populamento do banco.
- **GitHub Actions:** CI para migrations e seeds automáticas.
- **.env + Secrets:** variáveis seguras.

### Segurança e conformidade

- Conexão TLS/SSL entre app e DB.
- Hash de senhas (bcrypt/argon2).
- Sanitização e validação de inputs (SQLi/XSS).
- Histórico append-only (`frauds`, `scores`, `ledger`).

### Cobertura dos requisitos do hackathon

- **Carteira / P2P:** `offers`, `loans`, `matches`, `ledger` com matching automático
- **Antifraude:** `frauds` + triggers bloqueiam usuários suspeitos automaticamente
- **Score dinâmico:** `scores` + snapshot `users.credit_score` com recálculo automático
- **Contrato digital e liberação:** `contract_json` + `ledger_transfer` + `release_to_institution`
- **Monetização:** campos de taxas em `loans` + `loan_fees` + triggers automáticos
- **Receita:** cálculo automático via `revenue_by_loan` view
- **Usuários sistema:** criação automática de usuários para instituições e custódia
- **Reprodutibilidade:** migrations + seeds permitem reconstruir banco do zero em qualquer ambiente

---

## 8. Como Testar o Banco de Dados

> **⚠️ Nota:** Os testes abaixo requerem configuração de banco PostgreSQL local ou em nuvem. Para demonstração, os dados de teste podem ser executados em ambiente controlado.

### Configuração Necessária

1. **Banco PostgreSQL** (local ou Render/Heroku)
2. **Arquivo `.env`** com string de conexão:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
3. **Dependências instaladas:** `npm install`

### Comandos Disponíveis

```bash
# Verificar status dos migrations
npm run migrate:status

# Executar migrations
npm run migrate:latest

# Executar seeds
npm run seed:run

# Teste completo (migrations + seeds + verificações)
npm run db:test

# Reset completo (rollback + migrate + seed)
npm run db:reset
```

### Estrutura de Teste

O sistema inclui um script de teste (`test-db.js`) que verifica:

1. **📋 Tabelas:** Confirma que todas as 10 tabelas foram criadas
2. **👁️ Views:** Verifica as 4 views (`balances`, `revenue_by_loan`, `view_user_loans`, `view_loan_matches`)
3. **⚙️ Funções:** Confirma as 15 funções PostgreSQL estão funcionais
4. **📊 Dados:** Conta registros em cada tabela principal
5. **💳 Balances:** Testa cálculo de saldos por usuário
6. **💵 Revenue:** Verifica cálculo de receita por empréstimo
7. **🔧 Funções:** Testa funções críticas como `recompute_score_for_user()` e `ensure_platform_user()`

### Fluxo de Demonstração

1. **Setup:** Configuração de banco PostgreSQL
2. **Migrations:** Cria todas as tabelas, views, funções e triggers
3. **Seeds:** Insere dados demo (instituição, usuários, empréstimo, oferta)
4. **Matching:** Executa matching automático
5. **Disbursement:** Libera recursos para instituição
6. **Monetização:** Cobra taxas automaticamente
7. **Verificação:** Confirma que tudo funcionou corretamente

### Resultado da Demonstração

- ✅ **16 tabelas** criadas (incluindo tabelas do Knex)
- ✅ **4 views** funcionando
- ✅ **15 funções** PostgreSQL operacionais
- ✅ **6 usuários** (incluindo sistema)
- ✅ **1 empréstimo** com monetização
- ✅ **1 oferta** de investimento
- ✅ **1 match** realizado
- ✅ **8 transações** no ledger
- ✅ **Balances** calculados corretamente
- ✅ **Revenue** calculado: R$ 185,00 (primeiro ano)
