// 20250930_003_create_functions.js
exports.up = async function (knex) {
  await knex.schema.raw(`
  -- create_institution_user
  CREATE OR REPLACE FUNCTION create_institution_user(p_institution_id INT) RETURNS INT AS $$
  DECLARE v_user_id INT; v_institution_name TEXT;
  BEGIN
    SELECT name INTO v_institution_name FROM institutions WHERE id = p_institution_id;
    IF v_institution_name IS NULL THEN RAISE EXCEPTION 'Institution % not found', p_institution_id; END IF;

    SELECT institution_user_id INTO v_user_id FROM institutions WHERE id = p_institution_id;
    IF v_user_id IS NOT NULL THEN RETURN v_user_id; END IF;

    INSERT INTO users (nome, cpf, email, is_system, role, created_at, updated_at)
    VALUES (concat('INSTITUTION:', v_institution_name), NULL, concat('institution+', p_institution_id, '@internal'), TRUE, 'institution', now(), now())
    RETURNING id INTO v_user_id;

    UPDATE institutions SET institution_user_id = v_user_id WHERE id = p_institution_id;
    RETURN v_user_id;
  END;
  $$ LANGUAGE plpgsql;
  `);

  await knex.schema.raw(`
  -- ledger_transfer
  CREATE OR REPLACE FUNCTION ledger_transfer(
    p_from_user INT, p_to_user INT, p_amount NUMERIC, p_account_type TEXT, p_ref TEXT, p_meta JSONB DEFAULT '{}'::jsonb
  ) RETURNS VOID AS $$
  BEGIN
    IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;

    INSERT INTO ledger (account_type, user_id, amount, dc, ref, meta, created_at)
    VALUES (p_account_type, p_from_user, p_amount, 'D', p_ref, p_meta, now());

    INSERT INTO ledger (account_type, user_id, amount, dc, ref, meta, created_at)
    VALUES (p_account_type, p_to_user, p_amount, 'C', p_ref, p_meta, now());
  END;
  $$ LANGUAGE plpgsql;
  `);

  await knex.schema.raw(`
  -- match_loan
  CREATE OR REPLACE FUNCTION match_loan(p_loan_id INT) RETURNS VOID AS $$
  DECLARE v_loan_amount NUMERIC; v_remaining NUMERIC; v_offer RECORD;
  BEGIN
    SELECT amount INTO v_loan_amount FROM loans WHERE id = p_loan_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Loan % not found', p_loan_id; END IF;

    v_remaining := v_loan_amount;

    FOR v_offer IN SELECT * FROM offers WHERE amount_available > 0 ORDER BY created_at FOR UPDATE LOOP
      EXIT WHEN v_remaining <= 0;
      IF v_offer.amount_available <= v_remaining THEN
        INSERT INTO matches (loan_id, offer_id, amount_matched, rate, created_at)
        VALUES (p_loan_id, v_offer.id, v_offer.amount_available, v_offer.min_rate, now());

        v_remaining := v_remaining - v_offer.amount_available;
        UPDATE offers SET amount_available = 0, updated_at = now() WHERE id = v_offer.id;
      ELSE
        INSERT INTO matches (loan_id, offer_id, amount_matched, rate, created_at)
        VALUES (p_loan_id, v_offer.id, v_remaining, v_offer.min_rate, now());

        UPDATE offers SET amount_available = amount_available - v_remaining, updated_at = now() WHERE id = v_offer.id;
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
  `);

  await knex.schema.raw(`
  -- create_custody_for_loan
  CREATE OR REPLACE FUNCTION create_custody_for_loan(p_loan_id INT) RETURNS INT AS $$
  DECLARE v_loan RECORD; v_custody_user INT;
  BEGIN
    SELECT * INTO v_loan FROM loans WHERE id = p_loan_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Loan % not found', p_loan_id; END IF;

    IF v_loan.custody_user_id IS NOT NULL THEN RETURN v_loan.custody_user_id; END IF;

    INSERT INTO users (nome, cpf, email, is_system, role, created_at, updated_at)
    VALUES (concat('CUSTODY:LOAN:', p_loan_id), NULL, concat('custody+loan+', p_loan_id, '@internal'), TRUE, 'custody', now(), now())
    RETURNING id INTO v_custody_user;

    UPDATE loans SET custody_user_id = v_custody_user, updated_at = now() WHERE id = p_loan_id;
    RETURN v_custody_user;
  END;
  $$ LANGUAGE plpgsql;
  `);

  await knex.schema.raw(`
  -- recompute_score_for_user
  CREATE OR REPLACE FUNCTION recompute_score_for_user(p_user_id INT) RETURNS VOID AS $$
  DECLARE v_academic_avg NUMERIC; v_max_fraud INT; v_score NUMERIC; v_risk TEXT;
  BEGIN
    SELECT AVG(
      CASE WHEN ap.grade_avg IS NULL THEN 0
           WHEN ap.grade_avg <= 10 THEN ap.grade_avg * 10
           ELSE ap.grade_avg END
    ) INTO v_academic_avg FROM academic_performance ap WHERE ap.user_id = p_user_id;

    IF v_academic_avg IS NULL THEN v_academic_avg := 50; END IF;
    SELECT COALESCE(MAX(severity),0) INTO v_max_fraud FROM frauds WHERE user_id = p_user_id;

    v_score := round((v_academic_avg * 0.6) + ((100 - v_max_fraud) * 0.4));

    IF v_score >= 760 THEN v_risk := 'A';
    ELSIF v_score >= 650 THEN v_risk := 'B';
    ELSIF v_score >= 500 THEN v_risk := 'C';
    ELSE v_risk := 'D';
    END IF;

    INSERT INTO scores (user_id, score, risk_band, reason_json, created_at)
    VALUES (p_user_id, v_score::INT, v_risk, jsonb_build_object('academic_avg', v_academic_avg, 'max_fraud', v_max_fraud), now());

    UPDATE users SET credit_score = v_score::INT, risk_band = v_risk, updated_at = now() WHERE id = p_user_id;
  END;
  $$ LANGUAGE plpgsql;
  `);

  await knex.schema.raw(`
  -- release_to_institution
  CREATE OR REPLACE FUNCTION release_to_institution(p_loan_id INT) RETURNS VOID AS $$
  DECLARE v_loan RECORD; v_custody_user INT; v_institution_user INT; v_amount NUMERIC;
  BEGIN
    SELECT * INTO v_loan FROM loans WHERE id = p_loan_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Loan % not found', p_loan_id; END IF;

    IF v_loan.status NOT IN ('matched') THEN RAISE EXCEPTION 'Loan % is not matched and cannot be disbursed', p_loan_id; END IF;

    v_custody_user := v_loan.custody_user_id;
    IF v_custody_user IS NULL THEN v_custody_user := create_custody_for_loan(p_loan_id); END IF;

    IF v_loan.school_id IS NULL THEN RAISE EXCEPTION 'Loan % has no school_id', p_loan_id; END IF;
    v_institution_user := create_institution_user(v_loan.school_id);

    v_amount := v_loan.amount;

    PERFORM ledger_transfer(v_custody_user, v_institution_user, v_amount, 'disbursement', concat('loan_', p_loan_id), jsonb_build_object('loan_id', p_loan_id));

    UPDATE loans SET status = 'disbursed', updated_at = now() WHERE id = p_loan_id;
  END;
  $$ LANGUAGE plpgsql;
  `);
};

exports.down = async function (knex) {
  // drop functions in reverse
  await knex.schema.raw(
    "DROP FUNCTION IF EXISTS release_to_institution(INT) CASCADE;"
  );
  await knex.schema.raw(
    "DROP FUNCTION IF EXISTS recompute_score_for_user(INT) CASCADE;"
  );
  await knex.schema.raw(
    "DROP FUNCTION IF EXISTS create_custody_for_loan(INT) CASCADE;"
  );
  await knex.schema.raw("DROP FUNCTION IF EXISTS match_loan(INT) CASCADE;");
  await knex.schema.raw(
    "DROP FUNCTION IF EXISTS ledger_transfer(INT,INT,NUMERIC,TEXT,TEXT,JSONB) CASCADE;"
  );
  await knex.schema.raw(
    "DROP FUNCTION IF EXISTS create_institution_user(INT) CASCADE;"
  );
};
