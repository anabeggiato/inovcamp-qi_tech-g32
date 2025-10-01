-- db/init_full_qiedu.sql
-- ======================================================
-- QI-EDU (Inovacamp QI Tech) — Schema completo atualizado
-- Drop & recreate + functions, triggers, seed
-- WARNING: executes DROP ... CASCADE. Use in dev/test first.
-- ======================================================

-- =========================
-- LIMPAR (DROP) - tenta remover objetos antigos
-- =========================
DROP TRIGGER IF EXISTS after_insert_academic ON academic_performance CASCADE;
DROP TRIGGER IF EXISTS after_insert_score ON scores CASCADE;
DROP TRIGGER IF EXISTS after_insert_fraud ON frauds CASCADE;

DROP FUNCTION IF EXISTS trg_after_insert_academic() CASCADE;
DROP FUNCTION IF EXISTS trg_after_insert_score() CASCADE;
DROP FUNCTION IF EXISTS trg_after_insert_fraud() CASCADE;

DROP FUNCTION IF EXISTS release_to_institution(INT) CASCADE;
DROP FUNCTION IF EXISTS recompute_score_for_user(INT) CASCADE;
DROP FUNCTION IF EXISTS create_custody_for_loan(INT) CASCADE;
DROP FUNCTION IF EXISTS create_institution_user(INT) CASCADE;
DROP FUNCTION IF EXISTS match_loan(INT) CASCADE;
DROP FUNCTION IF EXISTS ledger_transfer(INT,INT,NUMERIC,TEXT,TEXT,JSONB) CASCADE;

DROP TABLE IF EXISTS academic_performance CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS frauds CASCADE;
DROP TABLE IF EXISTS ledger CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =========================
-- 1) Tabelas
-- =========================

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE, -- pode ser NULL para contas de sistema
    email TEXT UNIQUE,
    is_system BOOLEAN DEFAULT FALSE,
    role TEXT DEFAULT 'student', -- student | investor | institution | custody | admin
    fraud_score INT DEFAULT 0,
    fraud_status TEXT DEFAULT 'ok',
    credit_score INT DEFAULT 0,
    risk_band TEXT DEFAULT 'low',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Institutions (faculdades / recebedoras)
CREATE TABLE institutions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    integration_meta JSONB,
    institution_user_id INT NULL REFERENCES users(id)
);

-- Loans
CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    borrower_id INT REFERENCES users(id) ON DELETE SET NULL,
    school_id INT REFERENCES institutions(id) ON DELETE SET NULL,
    custody_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    term_months INT NOT NULL CHECK (term_months > 0),
    status TEXT DEFAULT 'pending', -- pending / open / partial / matched / disbursed
    contract_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Offers
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    investor_id INT REFERENCES users(id) ON DELETE SET NULL,
    amount_available NUMERIC NOT NULL CHECK (amount_available >= 0),
    term_months INT NOT NULL,
    min_rate NUMERIC NOT NULL CHECK (min_rate >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Matches
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    loan_id INT REFERENCES loans(id) ON DELETE CASCADE,
    offer_id INT REFERENCES offers(id) ON DELETE CASCADE,
    amount_matched NUMERIC NOT NULL,
    rate NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ledger (dupla entrada)
CREATE TABLE ledger (
    id SERIAL PRIMARY KEY,
    account_type TEXT NOT NULL,
    user_id INT NULL REFERENCES users(id) ON DELETE SET NULL,
    account_ref TEXT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    dc CHAR(1) NOT NULL CHECK (dc IN ('D','C')),
    ref TEXT,
    meta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Frauds (histórico)
CREATE TABLE frauds (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    severity INT DEFAULT 1 CHECK (severity >= 0),
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Scores (histórico)
CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL,
    risk_band TEXT,
    reason_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Academic performance (input para score)
CREATE TABLE academic_performance (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    school_id INT REFERENCES institutions(id) ON DELETE SET NULL,
    period TEXT,
    grade_avg NUMERIC,
    attendance_pct NUMERIC,
    status TEXT,
    meta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices úteis
CREATE INDEX idx_users_is_system ON users(is_system);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_frauds_user ON frauds(user_id);
CREATE INDEX idx_scores_user ON scores(user_id);
CREATE INDEX idx_academic_user ON academic_performance(user_id);
CREATE INDEX idx_loans_borrower ON loans(borrower_id);
CREATE INDEX idx_offers_investor ON offers(investor_id);
CREATE INDEX idx_ledger_user ON ledger(user_id);

-- =========================
-- 2) Views
-- =========================

CREATE OR REPLACE VIEW balances AS
SELECT
    u.id AS user_id,
    COALESCE(SUM(CASE WHEN l.dc='C' THEN l.amount ELSE 0 END),0) -
    COALESCE(SUM(CASE WHEN l.dc='D' THEN l.amount ELSE 0 END),0) AS balance
FROM users u
LEFT JOIN ledger l ON l.user_id = u.id
GROUP BY u.id;

-- =========================
-- 3) Funções & Regras
-- =========================

-- 3.0) create_institution_user: cria user sistêmico para institution, role='institution'
CREATE OR REPLACE FUNCTION create_institution_user(p_institution_id INT) RETURNS INT AS $$
DECLARE
    v_user_id INT;
    v_institution_name TEXT;
BEGIN
    SELECT name INTO v_institution_name FROM institutions WHERE id = p_institution_id;
    IF v_institution_name IS NULL THEN
        RAISE EXCEPTION 'Institution % not found', p_institution_id;
    END IF;

    SELECT institution_user_id INTO v_user_id FROM institutions WHERE id = p_institution_id;
    IF v_user_id IS NOT NULL THEN
        RETURN v_user_id;
    END IF;

    INSERT INTO users (nome, cpf, email, is_system, role, created_at, updated_at)
    VALUES (concat('INSTITUTION:', v_institution_name), NULL, concat('institution+', p_institution_id, '@internal'), TRUE, 'institution', now(), now())
    RETURNING id INTO v_user_id;

    UPDATE institutions SET institution_user_id = v_user_id WHERE id = p_institution_id;

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;


-- 3.1) ledger_transfer: transferência contábil (débitos/créditos)
CREATE OR REPLACE FUNCTION ledger_transfer(
    p_from_user INT,
    p_to_user INT,
    p_amount NUMERIC,
    p_account_type TEXT,
    p_ref TEXT,
    p_meta JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;

    -- Débito (remetente)
    INSERT INTO ledger (account_type, user_id, amount, dc, ref, meta, created_at)
    VALUES (p_account_type, p_from_user, p_amount, 'D', p_ref, p_meta, now());

    -- Crédito (destinatário)
    INSERT INTO ledger (account_type, user_id, amount, dc, ref, meta, created_at)
    VALUES (p_account_type, p_to_user, p_amount, 'C', p_ref, p_meta, now());
END;
$$ LANGUAGE plpgsql;


-- 3.2) match_loan: matching FIFO
CREATE OR REPLACE FUNCTION match_loan(p_loan_id INT) RETURNS VOID AS $$
DECLARE
    v_loan_amount NUMERIC;
    v_remaining NUMERIC;
    v_offer RECORD;
BEGIN
    SELECT amount INTO v_loan_amount FROM loans WHERE id = p_loan_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Loan % not found', p_loan_id;
    END IF;

    v_remaining := v_loan_amount;

    FOR v_offer IN
        SELECT * FROM offers WHERE amount_available > 0 ORDER BY created_at FOR UPDATE
    LOOP
        EXIT WHEN v_remaining <= 0;

        IF v_offer.amount_available <= v_remaining THEN
            INSERT INTO matches (loan_id, offer_id, amount_matched, rate, created_at)
            VALUES (p_loan_id, v_offer.id, v_offer.amount_available, v_offer.min_rate, now());

            v_remaining := v_remaining - v_offer.amount_available;

            UPDATE offers
            SET amount_available = 0,
                updated_at = now()
            WHERE id = v_offer.id;
        ELSE
            INSERT INTO matches (loan_id, offer_id, amount_matched, rate, created_at)
            VALUES (p_loan_id, v_offer.id, v_remaining, v_offer.min_rate, now());

            UPDATE offers
            SET amount_available = amount_available - v_remaining,
                updated_at = now()
            WHERE id = v_offer.id;

            v_remaining := 0;
        END IF;
    END LOOP;

    IF v_remaining = 0 THEN
        UPDATE loans SET status = 'matched', updated_at = now() WHERE id = p_loan_id;
    ELSIF v_remaining < v_loan_amount THEN
        UPDATE loans SET status = 'partial', updated_at = now() WHERE id = p_loan_id;
    ELSE
        UPDATE loans SET status = 'open', updated_at = now() WHERE id = p_loan_id;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- 3.3) create_custody_for_loan: cria user sistêmico para custodiar o loan
CREATE OR REPLACE FUNCTION create_custody_for_loan(p_loan_id INT) RETURNS INT AS $$
DECLARE
    v_loan RECORD;
    v_custody_user INT;
BEGIN
    SELECT * INTO v_loan FROM loans WHERE id = p_loan_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Loan % not found', p_loan_id;
    END IF;

    IF v_loan.custody_user_id IS NOT NULL THEN
        RETURN v_loan.custody_user_id;
    END IF;

    INSERT INTO users (nome, cpf, email, is_system, role, created_at, updated_at)
    VALUES (concat('CUSTODY:LOAN:', p_loan_id), NULL, concat('custody+loan+', p_loan_id, '@internal'), TRUE, 'custody', now(), now())
    RETURNING id INTO v_custody_user;

    UPDATE loans SET custody_user_id = v_custody_user, updated_at = now() WHERE id = p_loan_id;

    RETURN v_custody_user;
END;
$$ LANGUAGE plpgsql;


-- 3.4) recompute_score_for_user: heurística simples para score preditivo educacional
CREATE OR REPLACE FUNCTION recompute_score_for_user(p_user_id INT) RETURNS VOID AS $$
DECLARE
    v_academic_avg NUMERIC;
    v_max_fraud INT;
    v_score NUMERIC;
    v_risk TEXT;
BEGIN
    SELECT AVG(
        CASE
            WHEN ap.grade_avg IS NULL THEN 0
            WHEN ap.grade_avg <= 10 THEN ap.grade_avg * 10
            ELSE ap.grade_avg
        END
    ) INTO v_academic_avg
    FROM academic_performance ap
    WHERE ap.user_id = p_user_id;

    IF v_academic_avg IS NULL THEN
        v_academic_avg := 50;
    END IF;

    SELECT COALESCE(MAX(severity), 0) INTO v_max_fraud FROM frauds WHERE user_id = p_user_id;

    v_score := round((v_academic_avg * 0.6) + ((100 - v_max_fraud) * 0.4));

    IF v_score >= 760 THEN
        v_risk := 'A';
    ELSIF v_score >= 650 THEN
        v_risk := 'B';
    ELSIF v_score >= 500 THEN
        v_risk := 'C';
    ELSE
        v_risk := 'D';
    END IF;

    INSERT INTO scores (user_id, score, risk_band, reason_json, created_at)
    VALUES (p_user_id, v_score::INT, v_risk, jsonb_build_object('academic_avg', v_academic_avg, 'max_fraud', v_max_fraud), now());

    UPDATE users SET credit_score = v_score::INT, risk_band = v_risk, updated_at = now() WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;


-- 3.5) release_to_institution: libera valor da custódia para a instituição (se matched)
CREATE OR REPLACE FUNCTION release_to_institution(p_loan_id INT) RETURNS VOID AS $$
DECLARE
    v_loan RECORD;
    v_custody_user INT;
    v_institution_user INT;
    v_amount NUMERIC;
BEGIN
    SELECT * INTO v_loan FROM loans WHERE id = p_loan_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Loan % not found', p_loan_id;
    END IF;

    IF v_loan.status NOT IN ('matched') THEN
        RAISE EXCEPTION 'Loan % is not matched and cannot be disbursed', p_loan_id;
    END IF;

    v_custody_user := v_loan.custody_user_id;
    IF v_custody_user IS NULL THEN
        v_custody_user := create_custody_for_loan(p_loan_id);
    END IF;

    IF v_loan.school_id IS NULL THEN
        RAISE EXCEPTION 'Loan % has no school_id', p_loan_id;
    END IF;
    v_institution_user := create_institution_user(v_loan.school_id);

    v_amount := v_loan.amount;

    PERFORM ledger_transfer(v_custody_user, v_institution_user, v_amount, 'disbursement', concat('loan_', p_loan_id), jsonb_build_object('loan_id', p_loan_id));

    UPDATE loans SET status = 'disbursed', updated_at = now() WHERE id = p_loan_id;
END;
$$ LANGUAGE plpgsql;


-- =========================
-- 4) Triggers
-- =========================

-- 4.1) Recompute & snapshot after fraud insert
CREATE OR REPLACE FUNCTION trg_after_insert_fraud() RETURNS TRIGGER AS $$
DECLARE
    v_max_severity INT;
    v_status TEXT;
BEGIN
    SELECT MAX(severity) INTO v_max_severity FROM frauds WHERE user_id = NEW.user_id;
    IF v_max_severity IS NULL THEN
        v_max_severity := 0;
    END IF;

    IF v_max_severity >= 80 THEN
        v_status := 'blocked';
    ELSIF v_max_severity >= 50 THEN
        v_status := 'review';
    ELSE
        v_status := 'ok';
    END IF;

    UPDATE users
    SET fraud_score = v_max_severity,
        fraud_status = v_status,
        updated_at = now()
    WHERE id = NEW.user_id;

    PERFORM recompute_score_for_user(NEW.user_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_fraud
AFTER INSERT ON frauds
FOR EACH ROW
EXECUTE PROCEDURE trg_after_insert_fraud();


-- 4.2) snapshot after score insert
CREATE OR REPLACE FUNCTION trg_after_insert_score() RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET credit_score = NEW.score,
        risk_band = NEW.risk_band,
        updated_at = now()
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_score
AFTER INSERT ON scores
FOR EACH ROW
EXECUTE PROCEDURE trg_after_insert_score();


-- 4.3) recompute when academic data arrives
CREATE OR REPLACE FUNCTION trg_after_insert_academic() RETURNS TRIGGER AS $$
BEGIN
    PERFORM recompute_score_for_user(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_academic
AFTER INSERT ON academic_performance
FOR EACH ROW
EXECUTE PROCEDURE trg_after_insert_academic();


-- =========================
-- 5) Seed / Dados de Demonstração
-- =========================

-- Institutions (faculdade)
INSERT INTO institutions (name, integration_meta) VALUES
('Faculdade Exemplo', jsonb_build_object('integration', 'mock', 'notes', 'API B2B mock'));

-- cria institution-user sistêmico
SELECT create_institution_user(1);

-- Usuários (pessoas reais)
INSERT INTO users (nome, cpf, email, role) VALUES
('Alice Silva', '12345678901', 'alice@mail.com', 'student'),
('Bruno Souza', '23456789012', 'bruno@mail.com', 'investor');

-- Academic performance (Alice)
INSERT INTO academic_performance (user_id, school_id, period, grade_avg, attendance_pct, status)
VALUES (1, 1, '2025-1', 8.5, 92, 'active');

-- Frauds (exemplo leve)
INSERT INTO frauds (user_id, type, severity, payload) VALUES
(1, 'OTP_failed', 3, '{"attempts":2}');

-- recompute initial score (triggers might already have done)
SELECT recompute_score_for_user(1);

-- Ofertas (Bruno investidor)
INSERT INTO offers (investor_id, amount_available, term_months, min_rate) VALUES
(2, 10000, 12, 1.5);

-- Empréstimo (Alice)
INSERT INTO loans (borrower_id, school_id, amount, term_months, status) VALUES
(1, 1, 5000, 12, 'pending');

-- Matching automático para o loan id=1
SELECT match_loan(1);

-- Cria conta de custódia para o loan e transfere montante dos investidores para custódia
SELECT create_custody_for_loan(1);

DO $$
DECLARE
    v_custody INT;
    v_investor INT := 2;
    v_amount NUMERIC := 5000;
BEGIN
    SELECT custody_user_id INTO v_custody FROM loans WHERE id = 1;
    IF v_custody IS NULL THEN
        RAISE NOTICE 'custody null';
    ELSE
        PERFORM ledger_transfer(v_investor, v_custody, v_amount, 'loan_funding', 'loan_1_funding', jsonb_build_object('loan_id',1));
    END IF;
END $$;

-- Libera para a instituição (disbursement)
SELECT release_to_institution(1);

-- Checks output
SELECT * FROM balances ORDER BY user_id;
SELECT * FROM matches WHERE loan_id = 1;
SELECT * FROM ledger ORDER BY created_at DESC LIMIT 20;

-- ======================================================
-- FIM
-- ======================================================



