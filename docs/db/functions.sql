-- -- stored procedures (ledger, matching)
-- contém funções atômicas (ex: ledger_transfer, match_loan) escritas em PL/pgSQL para garantir consistência contábil e regras de negócio.

-- 1) ledger_transfer: transferência atômica entre contas (dupla entrada)
CREATE OR REPLACE FUNCTION ledger_transfer(
    p_from_user INT,
    p_to_user INT,
    p_amount NUMERIC,
    p_account_type TEXT,
    p_ref TEXT,
    p_meta JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
    IF p_from_user IS NULL OR p_to_user IS NULL THEN
        RAISE EXCEPTION 'from_user and to_user must be provided';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;

    -- Débito no remetente
    INSERT INTO ledger (account_type, user_id, amount, dc, ref, meta, created_at)
    VALUES (p_account_type, p_from_user, p_amount, 'D', p_ref, p_meta, now());

    -- Crédito no destinatário
    INSERT INTO ledger (account_type, user_id, amount, dc, ref, meta, created_at)
    VALUES (p_account_type, p_to_user, p_amount, 'C', p_ref, p_meta, now());
END;
$$ LANGUAGE plpgsql;


-- 2) match_loan: implementação FIFO que consome ofertas e atualiza loan/offer
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
            -- full use of this offer
            INSERT INTO matches (loan_id, offer_id, amount_matched, rate, created_at)
            VALUES (p_loan_id, v_offer.id, v_offer.amount_available, v_offer.min_rate, now());

            v_remaining := v_remaining - v_offer.amount_available;

            UPDATE offers
            SET amount_available = 0,
                updated_at = now()
            WHERE id = v_offer.id;
        ELSE
            -- partial consumption
            INSERT INTO matches (loan_id, offer_id, amount_matched, rate, created_at)
            VALUES (p_loan_id, v_offer.id, v_remaining, v_offer.min_rate, now());

            UPDATE offers
            SET amount_available = amount_available - v_remaining,
                updated_at = now()
            WHERE id = v_offer.id;

            v_remaining := 0;
        END IF;
    END LOOP;

    -- atualiza status do loan
    IF v_remaining = 0 THEN
        UPDATE loans SET status = 'matched', updated_at = now() WHERE id = p_loan_id;
    ELSIF v_remaining < v_loan_amount THEN
        UPDATE loans SET status = 'partial', updated_at = now() WHERE id = p_loan_id;
    ELSE
        -- nenhum match
        UPDATE loans SET status = 'open', updated_at = now() WHERE id = p_loan_id;
    END IF;
END;
$$ LANGUAGE plpgsql;