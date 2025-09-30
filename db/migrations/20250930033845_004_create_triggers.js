// 20250930_004_create_triggers.js
exports.up = async function (knex) {
  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION trg_after_insert_fraud() RETURNS TRIGGER AS $$
    DECLARE v_max_severity INT; v_status TEXT;
    BEGIN
      SELECT MAX(severity) INTO v_max_severity FROM frauds WHERE user_id = NEW.user_id;
      IF v_max_severity IS NULL THEN v_max_severity := 0; END IF;

      IF v_max_severity >= 80 THEN v_status := 'blocked';
      ELSIF v_max_severity >= 50 THEN v_status := 'review';
      ELSE v_status := 'ok';
      END IF;

      UPDATE users SET fraud_score = v_max_severity, fraud_status = v_status, updated_at = now() WHERE id = NEW.user_id;
      PERFORM recompute_score_for_user(NEW.user_id);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS after_insert_fraud ON frauds;
    CREATE TRIGGER after_insert_fraud AFTER INSERT ON frauds FOR EACH ROW EXECUTE PROCEDURE trg_after_insert_fraud();
  `);

  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION trg_after_insert_score() RETURNS TRIGGER AS $$
    BEGIN
      UPDATE users SET credit_score = NEW.score, risk_band = NEW.risk_band, updated_at = now() WHERE id = NEW.user_id;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS after_insert_score ON scores;
    CREATE TRIGGER after_insert_score AFTER INSERT ON scores FOR EACH ROW EXECUTE PROCEDURE trg_after_insert_score();
  `);

  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION trg_after_insert_academic() RETURNS TRIGGER AS $$
    BEGIN
      PERFORM recompute_score_for_user(NEW.user_id);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS after_insert_academic ON academic_performance;
    CREATE TRIGGER after_insert_academic AFTER INSERT ON academic_performance FOR EACH ROW EXECUTE PROCEDURE trg_after_insert_academic();
  `);
};

exports.down = async function (knex) {
  await knex.schema.raw(
    "DROP TRIGGER IF EXISTS after_insert_academic ON academic_performance; DROP FUNCTION IF EXISTS trg_after_insert_academic() CASCADE;"
  );
  await knex.schema.raw(
    "DROP TRIGGER IF EXISTS after_insert_score ON scores; DROP FUNCTION IF EXISTS trg_after_insert_score() CASCADE;"
  );
  await knex.schema.raw(
    "DROP TRIGGER IF EXISTS after_insert_fraud ON frauds; DROP FUNCTION IF EXISTS trg_after_insert_fraud() CASCADE;"
  );
};
