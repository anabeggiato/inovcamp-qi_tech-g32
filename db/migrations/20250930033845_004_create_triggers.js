exports.up = async function (knex) {
  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.schema.raw(`
    CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  await knex.schema.raw(`
    CREATE TRIGGER trg_loans_updated_at
    BEFORE UPDATE ON loans
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);
};

exports.down = async function (knex) {
  await knex.schema.raw(`DROP TRIGGER IF EXISTS trg_users_updated_at ON users`);
  await knex.schema.raw(`DROP TRIGGER IF EXISTS trg_loans_updated_at ON loans`);
  await knex.schema.raw(`DROP FUNCTION IF EXISTS set_updated_at()`);
};
