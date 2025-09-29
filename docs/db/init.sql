-- -- criação de schema, índices, views
-- cria as tabelas users, loans, offers, matches, ledger, frauds, scores além de views e índices.
-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    cpf CHAR(11) UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    fraud_score INT DEFAULT 0,
    fraud_status TEXT DEFAULT 'clear',
    credit_score INT DEFAULT 0,
    risk_band TEXT DEFAULT 'low',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Loans
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    borrower_id INT REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    term_months INT NOT NULL,
    status TEXT DEFAULT 'pending',
    contract_json JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Offers
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    investor_id INT REFERENCES users(id) ON DELETE CASCADE,
    amount_available NUMERIC NOT NULL,
    term_months INT NOT NULL,
    min_rate NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    loan_id INT REFERENCES loans(id) ON DELETE CASCADE,
    offer_id INT REFERENCES offers(id) ON DELETE CASCADE,
    amount_matched NUMERIC NOT NULL,
    rate NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ledger
CREATE TABLE IF NOT EXISTS ledger (
    id SERIAL PRIMARY KEY,
    account_type TEXT NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    dc CHAR(1) NOT NULL, -- D=Débito, C=Crédito
    ref TEXT,
    meta JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Frauds
CREATE TABLE IF NOT EXISTS frauds (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    severity INT DEFAULT 1,
    payload JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Scores
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL,
    risk_band TEXT DEFAULT 'low',
    reason_json JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Views (exemplo: saldo do usuário)
CREATE VIEW balances AS
SELECT
    u.id AS user_id,
    SUM(CASE WHEN l.dc='C' THEN l.amount ELSE 0 END) -
    SUM(CASE WHEN l.dc='D' THEN l.amount ELSE 0 END) AS balance
FROM users u
LEFT JOIN ledger l ON l.user_id = u.id
GROUP BY u.id;