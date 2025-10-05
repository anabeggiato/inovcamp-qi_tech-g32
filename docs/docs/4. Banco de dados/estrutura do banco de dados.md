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
- **Ferramenta usada:** [Knex.js](https://knexjs.org/), migrations em JavaScript.
- **Como rodar (no diretório `server/`):**
  - `npm run migrate:latest`
  - `npm run migrate:rollback`
  - `npm run migrate:status`
  - Para reset completo: `npm run db:reset`

### Seeds

- **Função:** popular o banco com dados iniciais para testes e demos.
- **Exemplo:** `users`, `offers`, `loans`, entre outras.
- **Como rodar (no diretório `server/`):** `npm run seed:run`
- **Benefício:** qualquer ambiente consegue reproduzir dados de teste consistentes.

> Observação: migrations + seeds permitem reconstruir o banco rapidamente (local/staging/prod com pipeline controlado).

---

## 4. Modelagem do Banco de Dados

| Tabela                     | Principais Campos                                                                                                                                                                            | Descrição                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **users**                  | id, name, cpf, email, is_system, role, fraud_score, fraud_status, credit_score, risk_band                                                                                                    | Dados cadastrais + snapshots de antifraude e score de crédito     |
| **institutions**           | id, name, integration_meta, institution_user_id                                                                                                                                              | Informações de instituições de ensino + usuário sistema           |
| **loans**                  | id, borrower_id, school_id, custody_user_id, amount, term_months, status, contract_json, origination_pct, marketplace_pct, custody_pct_monthly, spread_pct_annual, revenue_first_year        | Pedidos de empréstimo + campos de monetização                     |
| **offers**                 | id, investor_id, amount_available, term_months, min_rate                                                                                                                                     | Ofertas de investimento dos investidores                          |
| **matches**                | id, loan_id, offer_id, amount_matched, rate                                                                                                                                                  | Relacionamento entre pedidos e ofertas (fracionamento permitido)  |
| **ledger**                 | id, account_type, user_id, account_ref, amount, dc, ref, meta                                                                                                                                | Lançamentos de dupla entrada para saldos e pagamentos             |
| **frauds**                 | id, user_id, type, severity, payload                                                                                                                                                         | Histórico de sinais antifraude                                    |
| **scores**                 | id, user_id, score, risk_band, reason_json                                                                                                                                                   | Histórico de cálculos de score de crédito                         |
| **academic_performance**   | id, user_id, school_id, period, grade_avg, attendance_pct, status, meta                                                                                                                      | Histórico acadêmico para cálculo de score                         |
| **loan_fees**              | id, loan_id, fee_type, amount, period_start, period_end, charged_at, ledger_ref, meta                                                                                                        | Audit trail de taxas cobradas por empréstimo                      |
| **installments**           | id, loan_id, number, amount, principal_amount, interest_amount, due_date, status, payment_date, paid_amount, payment_phase, investor_share, qi_edu_fee_share, payment_method, transaction_id | Parcelas do empréstimo e status de pagamento                      |
| **payment_methods**        | id, user_id, type, identifier, is_active, is_default, meta                                                                                                                                   | Métodos de pagamento do usuário (PIX, boleto, cartão, etc.)       |
| **payment_transactions**   | id, installment_id, payment_method_id, amount, status, external_transaction_id, fees, net_amount, meta, processed_at                                                                         | Transações de pagamento vinculadas às parcelas                    |
| **loan_payment_schedules** | id, loan_id, schedule_type, total_installments, monthly_payment, first_payment_date, last_payment_date, is_active                                                                            | Cronograma de pagamentos por empréstimo                           |
| **custody_accounts**       | id, user_id, account_number, balance, email, phone, status                                                                                                                                   | Contas de custódia internas para movimentações                    |
| **custody_transactions**   | id, custody_account_id, amount, payment_method, transaction_type, category, subcategory, description, status                                                                                 | Movimentações na custódia (depósitos, transferências, pagamentos) |
| **payment_ledger**         | id, amount, category, subcategory, ref, meta, created_at                                                                                                                                     | Ledger específico da Payment API                                  |
| **orchestrated_payments**  | id, installment_id, payment_method, status, meta                                                                                                                                             | Orquestrações de pagamento por parcela                            |
| **payment_plans**          | id, loan_id, plan_type, payment_timing, installments_list                                                                                                                                    | Planos de pagamento agregando parcelas                            |

---

## 5. Fluxo dos Dados

1. **Cadastro/Onboarding:** cria usuário em `users`. OTPs e verificações KYC podem gerar registros em `frauds`.
2. **Antifraude:** cada sinal é salvo em `frauds`; snapshot em `users` atualizado (`fraud_score`, `fraud_status`).
3. **Score de Crédito:** cada cálculo é salvo em `scores`; snapshot em `users` atualizado (`credit_score`, `risk_band`).
4. **Empréstimos (`loans`):** tomadores registram pedidos de empréstimo com campos de monetização.
5. **Ofertas (`offers`):** investidores registram ofertas de investimento.
6. **Matching:** pedidos e ofertas são casados automaticamente via função `match_loan()`, registrados em `matches` (status: matched/partial/open).
7. **Ledger:** toda liberação, pagamento e repasse é registrado em dupla entrada (`ledger`).
8. **Monetização:** taxas são cobradas automaticamente via triggers e funções, registradas em `loan_fees`.
9. **Parcelas:** geração de `installments`/`loan_payment_schedules` conforme cronograma.
10. **Pagamentos:** cada tentativa/baixa gera `payment_transactions` e pode atualizar `installments`.
11. **Custódia:** movimentações espelham-se em `custody_accounts`/`custody_transactions` e `payment_ledger`.
12. **Saldos:** consultados via `VIEW balances` e `view_user_loans`.
13. **Revenue:** receita calculada e acompanhada via `VIEW revenue_by_loan` e `loan_fees`.

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

### 6.1 Núcleo (Users, Institutions, Loans, Offers, Matches, Ledger)

```mermaid
%%{init: {"fontSize": 14}}%%
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
    USERS ||--o{ LEDGER : "has_account"
    INSTITUTIONS ||--o{ LOANS : "receives"
    LOANS ||--o{ MATCHES : "matches_with"
    OFFERS ||--o{ MATCHES : "matches_with"
    LOANS ||--o{ LOAN_FEES : "generates_fees"
```

### 6.2 Pagamentos (Installments, Payment Methods, Transactions, Schedules, Plans)

```mermaid
%%{init: {"fontSize": 14}}%%
erDiagram
    INSTALLMENTS {
        int id PK
        int loan_id FK
        int number
        numeric amount
        numeric principal_amount
        numeric interest_amount
        date due_date
        text status
        date payment_date
        numeric paid_amount
        text payment_phase
        boolean is_symbolic
        numeric symbolic_amount
        numeric investor_share
        numeric qi_edu_fee_share
        text payment_method
        text transaction_id
        int ledger_entry_id FK
        timestamp created_at
    }

    PAYMENT_METHODS {
        int id PK
        int user_id FK
        text type
        text identifier
        boolean is_active
        boolean is_default
        jsonb meta
        timestamp created_at
    }

    PAYMENT_TRANSACTIONS {
        int id PK
        int installment_id FK
        int payment_method_id FK
        numeric amount
        text status
        text external_transaction_id
        numeric fees
        numeric net_amount
        jsonb meta
        timestamp processed_at
        timestamp created_at
    }

    LOAN_PAYMENT_SCHEDULES {
        int id PK
        int loan_id FK
        text schedule_type
        int total_installments
        numeric monthly_payment
        date first_payment_date
        date last_payment_date
        boolean is_active
    }

    PAYMENT_PLANS {
        int id PK
        int loan_id FK
        text plan_type
        text payment_timing
        jsonb installments_list
        timestamp created_at
    }

    LOANS ||--o{ INSTALLMENTS : "has"
    INSTALLMENTS ||--o{ PAYMENT_TRANSACTIONS : "has"
    USERS ||--o{ PAYMENT_METHODS : "has"
    PAYMENT_METHODS ||--o{ PAYMENT_TRANSACTIONS : "used_in"
    LOANS ||--o{ LOAN_PAYMENT_SCHEDULES : "schedules"
    LOANS ||--o{ PAYMENT_PLANS : "has"
```

### 6.3 Custódia (Accounts, Transactions, Payment Ledger)

```mermaid
%%{init: {"fontSize": 14}}%%
erDiagram
    CUSTODY_ACCOUNTS {
        int id PK
        int user_id FK
        text account_number
        numeric balance
        text email
        text phone
        text status
    }

    CUSTODY_TRANSACTIONS {
        int id PK
        int custody_account_id FK
        numeric amount
        text payment_method
        text transaction_type
        text category
        text subcategory
        text description
        text status
        timestamp created_at
    }

    PAYMENT_LEDGER {
        int id PK
        numeric amount
        text category
        text subcategory
        text ref
        jsonb meta
        timestamp created_at
    }

    USERS ||--o{ CUSTODY_ACCOUNTS : "owns"
    CUSTODY_ACCOUNTS ||--o{ CUSTODY_TRANSACTIONS : "has"
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

**Funções Core (atuais):**

- `ledger_transfer()`: transferências de dupla entrada
- `match_loan()`: matching automático de empréstimos e ofertas
- `create_institution_user()`: criação de usuário sistema para instituição
- `create_custody_for_loan()`: criação de usuário de custódia por empréstimo
- `recompute_score_for_user()`: recálculo de score (acadêmico + antifraude)
- `release_to_institution()`: liberação de recursos para instituição

**Funções de Monetização (atuais):**

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

- Consulta de saldo por usuário isolando lógica contábil
- Calcula créditos menos débitos por usuário

**`view_user_loans`:**

- Lista de empréstimos por usuário com status e ticket

**`view_loan_matches`:**

- Relaciona empréstimos com seus matches e investidores

**`revenue_by_loan`:**

- Receita por empréstimo: ticket, receita projetada (1º ano) e realizada

### Ferramentas auxiliares

- **Render/Heroku/Cloud:** deploy do PostgreSQL.
- **DBeaver:** gerenciamento visual do banco.
- **Knex.js:** migrations e seeds para versão e populamento do banco.
- **GitHub Actions:** CI para migrations e seeds automáticas.
- **.env + Secrets:** variáveis seguras.

### Segurança e conformidade

- Conexão TLS/SSL entre app e DB.
- Hash de senhas (bcrypt).
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

### Estrutura de Verificação

Para conferir o ambiente rapidamente:

1. Rodar migrations e seeds (`server/`): `npm run db:reset`
2. Conferir views criadas: `balances`, `view_user_loans`, `view_loan_matches`, `revenue_by_loan`
3. Executar funções chave manualmente (SQL) se necessário, como `match_loan()` e `release_to_institution()`

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
