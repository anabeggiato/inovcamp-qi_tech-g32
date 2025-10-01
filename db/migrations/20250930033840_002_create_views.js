// 20250930_002_create_views.js
exports.up = async function (knex) {
  await knex.schema.raw(`
    CREATE OR REPLACE VIEW balances AS
    SELECT 
      u.id AS user_id,
      COALESCE(SUM(CASE WHEN l.dc='C' THEN l.amount ELSE 0 END),0) - 
      COALESCE(SUM(CASE WHEN l.dc='D' THEN l.amount ELSE 0 END),0) AS balance
    FROM users u
    LEFT JOIN ledger l ON l.user_id = u.id
    GROUP BY u.id;
  `);

  await knex.schema.raw(`
    CREATE OR REPLACE VIEW view_user_loans AS
    SELECT
      u.id AS user_id,
      u.name AS user_name,
      l.id AS loan_id,
      l.amount AS loan_amount,
      l.status AS loan_status,
      l.term_months AS loan_term
    FROM users u
    LEFT JOIN loans l ON u.id = l.borrower_id;
  `);

  await knex.schema.raw(`
    CREATE OR REPLACE VIEW view_loan_matches AS
    SELECT
      l.id AS loan_id,
      l.amount AS loan_amount,
      m.id AS match_id,
      m.amount_matched,
      m.rate,
      o.investor_id
    FROM loans l
    LEFT JOIN matches m ON l.id = m.loan_id
    LEFT JOIN offers o ON m.offer_id = o.id;
  `);
};

exports.down = async function (knex) {
  await knex.schema.raw(`DROP VIEW IF EXISTS view_loan_matches`);
  await knex.schema.raw(`DROP VIEW IF EXISTS view_user_loans`);
  await knex.schema.raw(`DROP VIEW IF EXISTS balances`);
};