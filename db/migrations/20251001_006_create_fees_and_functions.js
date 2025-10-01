exports.up = async function (knex) {
  // ensure_platform_user
  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION ensure_platform_user() RETURNS INT AS $$
    DECLARE v_id INT;
    BEGIN
      SELECT id INTO v_id FROM users WHERE is_system = TRUE AND role = 'platform' LIMIT 1;
      IF v_id IS NOT NULL THEN
        RETURN v_id;
      END IF;

      INSERT INTO users (name, cpf, email, is_system, role, created_at, updated_at)
      VALUES ('PLATFORM:QI-EDU', NULL, 'platform@internal', TRUE, 'platform', now(), now())
      RETURNING id INTO v_id;

      RETURN v_id;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // compute_revenue_first_year
  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION compute_revenue_first_year(p_loan_id INT) RETURNS NUMERIC AS $$
    DECLARE
      v_ticket NUMERIC;
      v_orig NUMERIC;
      v_market NUMERIC;
      v_custody NUMERIC;
      v_spread NUMERIC;
      v_total NUMERIC;
    BEGIN
      SELECT amount INTO v_ticket FROM loans WHERE id = p_loan_id;
      IF v_ticket IS NULL THEN
        RAISE EXCEPTION 'Loan % not found', p_loan_id;
      END IF;

      SELECT COALESCE(origination_pct,0), COALESCE(marketplace_pct,0),
             COALESCE(custody_pct_monthly,0), COALESCE(spread_pct_annual,0)
      INTO v_orig, v_market, v_custody, v_spread
      FROM loans WHERE id = p_loan_id;

      v_orig := round((v_ticket * v_orig)::numeric,2);
      v_market := round((v_ticket * v_market)::numeric,2);
      v_custody := round((v_ticket * v_custody * 12)::numeric,2);
      v_spread := round((v_ticket * v_spread)::numeric,2);

      v_total := v_orig + v_market + v_custody + v_spread;

      UPDATE loans SET revenue_first_year = v_total, updated_at = now() WHERE id = p_loan_id;

      RETURN v_total;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // charge_fee_for_loan
  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION charge_fee_for_loan(
      p_loan_id INT,
      p_fee_type TEXT,
      p_amount NUMERIC,
      p_period_start DATE DEFAULT NULL,
      p_period_end DATE DEFAULT NULL,
      p_meta JSONB DEFAULT '{}'::jsonb
    ) RETURNS VOID AS $$
    DECLARE
      v_loan RECORD;
      v_platform INT;
      v_from_user INT;
    BEGIN
      SELECT * INTO v_loan FROM loans WHERE id = p_loan_id FOR UPDATE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Loan % not found', p_loan_id;
      END IF;

      v_platform := ensure_platform_user();

      IF p_fee_type = 'custody' THEN
        v_from_user := v_loan.custody_user_id;
        IF v_from_user IS NULL THEN
          PERFORM create_custody_for_loan(p_loan_id);
          SELECT custody_user_id INTO v_from_user FROM loans WHERE id = p_loan_id;
        END IF;
      ELSE
        v_from_user := v_loan.borrower_id;
      END IF;

      IF v_from_user IS NULL THEN
        RAISE EXCEPTION 'No payer user for loan % and fee %', p_loan_id, p_fee_type;
      END IF;

      PERFORM ledger_transfer(v_from_user, v_platform, p_amount, p_fee_type, concat('loan_', p_loan_id, '_', p_fee_type), p_meta);

      INSERT INTO loan_fees (loan_id, fee_type, amount, period_start, period_end, charged_at, ledger_ref, meta, created_at)
      VALUES (p_loan_id, p_fee_type, p_amount, p_period_start, p_period_end, now(), concat('loan_', p_loan_id, '_', p_fee_type), p_meta, now());
    END;
    $$ LANGUAGE plpgsql;
  `);

  // charge_origination_and_marketplace
  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION charge_origination_and_marketplace(p_loan_id INT) RETURNS VOID AS $$
    DECLARE
      v_ticket NUMERIC;
      v_orig_amt NUMERIC;
      v_market_amt NUMERIC;
      v_orig_pct NUMERIC;
      v_market_pct NUMERIC;
    BEGIN
      SELECT amount, origination_pct, marketplace_pct INTO v_ticket, v_orig_pct, v_market_pct FROM loans WHERE id = p_loan_id;
      IF v_ticket IS NULL THEN
        RAISE EXCEPTION 'Loan % not found', p_loan_id;
      END IF;

      v_orig_amt := round((v_ticket * COALESCE(v_orig_pct,0))::numeric,2);
      v_market_amt := round((v_ticket * COALESCE(v_market_pct,0))::numeric,2);

      IF v_orig_amt > 0 THEN
        PERFORM charge_fee_for_loan(p_loan_id, 'origination', v_orig_amt);
      END IF;
      IF v_market_amt > 0 THEN
        PERFORM charge_fee_for_loan(p_loan_id, 'marketplace', v_market_amt);
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // charge_custody_monthly
  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION charge_custody_monthly(p_loan_id INT, p_charge_date DATE DEFAULT now()::date) RETURNS VOID AS $$
    DECLARE
      v_ticket NUMERIC;
      v_custody_pct NUMERIC;
      v_amount NUMERIC;
      v_period_start DATE;
      v_period_end DATE;
    BEGIN
      SELECT amount, custody_pct_monthly INTO v_ticket, v_custody_pct FROM loans WHERE id = p_loan_id;
      IF v_ticket IS NULL THEN
        RAISE EXCEPTION 'Loan % not found', p_loan_id;
      END IF;

      v_amount := round((v_ticket * COALESCE(v_custody_pct,0))::numeric,2);
      v_period_start := p_charge_date;
      v_period_end := (p_charge_date + interval '1 month - 1 day')::date;

      IF v_amount > 0 THEN
        PERFORM charge_fee_for_loan(p_loan_id, 'custody', v_amount, v_period_start, v_period_end);
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // view revenue_by_loan
  await knex.schema.raw(`
    CREATE OR REPLACE VIEW revenue_by_loan AS
    SELECT
      l.id AS loan_id,
      l.amount AS ticket,
      l.revenue_first_year,
      COALESCE(SUM(CASE WHEN lf.fee_type IS NOT NULL THEN lf.amount ELSE 0 END),0) AS revenue_realized
    FROM loans l
    LEFT JOIN loan_fees lf ON lf.loan_id = l.id
    GROUP BY l.id, l.amount, l.revenue_first_year;
  `);

  // trigger: after disbursed
  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION trg_after_update_loan_disbursed() RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'UPDATE' AND NEW.status = 'disbursed' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
        PERFORM compute_revenue_first_year(NEW.id);
        PERFORM charge_origination_and_marketplace(NEW.id);
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS after_update_loan_disbursed ON loans;
    CREATE TRIGGER after_update_loan_disbursed AFTER UPDATE ON loans FOR EACH ROW EXECUTE PROCEDURE trg_after_update_loan_disbursed();
  `);
};

exports.down = async function (knex) {
  await knex.schema.raw(
    "DROP TRIGGER IF EXISTS after_update_loan_disbursed ON loans; DROP FUNCTION IF EXISTS trg_after_update_loan_disbursed() CASCADE;"
  );
  await knex.schema.raw("DROP VIEW IF EXISTS revenue_by_loan;");
  await knex.schema.raw(
    "DROP FUNCTION IF EXISTS charge_custody_monthly(INT, DATE) CASCADE;"
  );
  await knex.schema.raw(
    "DROP FUNCTION IF EXISTS charge_origination_and_marketplace(INT) CASCADE;"
  );
  await knex.schema.raw(
    "DROP FUNCTION IF EXISTS charge_fee_for_loan(INT, TEXT, NUMERIC, DATE, DATE, JSONB) CASCADE;"
  );
  await knex.schema.raw(
    "DROP FUNCTION IF EXISTS compute_revenue_first_year(INT) CASCADE;"
  );
  await knex.schema.raw(
    "DROP FUNCTION IF EXISTS ensure_platform_user() CASCADE;"
  );
};
