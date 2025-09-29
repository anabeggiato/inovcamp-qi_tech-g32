-- -- dados de exemplo para demo
-- insere dados iniciais (usuários, um empréstimo, uma oferta, exemplo de ledger) para demo.

-- Usuários
INSERT INTO users (nome, cpf, email) VALUES
('Alice Silva', '12345678901', 'alice@mail.com'),
('Bruno Souza', '23456789012', 'bruno@mail.com');

-- Fraudes (exemplo: falha de OTP)
INSERT INTO frauds (user_id, type, severity, payload) VALUES
(1, 'OTP_failed', 3, '{"attempts":2}');

-- Scores de crédito
INSERT INTO scores (user_id, score, risk_band, reason_json) VALUES
(1, 750, 'medium', '{"reason":"bom histórico"}');

-- Empréstimos
INSERT INTO loans (borrower_id, amount, term_months, status) VALUES
(1, 5000, 12, 'pending');

-- Ofertas de investimento
INSERT INTO offers (investor_id, amount_available, term_months, min_rate) VALUES
(2, 10000, 12, 1.5);

-- Matching: aplica função match_loan ao empréstimo 1
SELECT match_loan(1);

-- Ledger: registra transferência de empréstimo do investidor 2 para Alice (id=1)
SELECT ledger_transfer(2, 1, 5000, 'loan', 'Empréstimo inicial');

-- Saldo atual (view)
SELECT * FROM balances;