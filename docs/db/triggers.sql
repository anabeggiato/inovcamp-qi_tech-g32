-- -- triggers que mantêm snapshots em users
-- triggers AFTER INSERT em frauds e scores que atualizam imediatamente os campos snapshot em users (fraud_score, fraud_status, credit_score, risk_band).

-- 1) Ao inserir fraud: recalcula fraud_score do usuário (ex.: MAX severity) e define fraud_status
CREATE OR REPLACE FUNCTION trg_after_insert_fraud() RETURNS TRIGGER AS $$
DECLARE
    v_max_severity INT;
    v_status TEXT;
BEGIN
    SELECT MAX(severity) INTO v_max_severity FROM frauds WHERE user_id = NEW.user_id;

    IF v_max_severity IS NULL THEN
        v_max_severity := 0;
    END IF;

    -- exemplo de thresholds (ajuste conforme política do time)
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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_insert_fraud ON frauds;
CREATE TRIGGER after_insert_fraud
AFTER INSERT ON frauds
FOR EACH ROW
EXECUTE PROCEDURE trg_after_insert_fraud();


-- 2) Ao inserir score: atualiza snapshot credit_score e risk_band
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

DROP TRIGGER IF EXISTS after_insert_score ON scores;
CREATE TRIGGER after_insert_score
AFTER INSERT ON scores
FOR EACH ROW
EXECUTE PROCEDURE trg_after_insert_score();