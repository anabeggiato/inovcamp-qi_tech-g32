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
};

exports.down = async function (knex) {
  await knex.schema.raw(`DROP VIEW IF EXISTS balances;`);
};
