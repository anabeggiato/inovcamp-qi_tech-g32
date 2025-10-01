exports.up = async function (knex) {
  // users
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.text("name").notNullable();
    table.text("cpf").unique().nullable();
    table.text("email").unique().nullable();
    table.boolean("is_system").defaultTo(false);
    table.text("role").defaultTo("student");
    table.integer("fraud_score").defaultTo(0);
    table.text("fraud_status").defaultTo("ok");
    table.integer("credit_score").defaultTo(0);
    table.text("risk_band").defaultTo("low");
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  // institutions
  await knex.schema.createTable("institutions", (table) => {
    table.increments("id").primary();
    table.text("name").notNullable();
    table.specificType("integration_meta", "jsonb").nullable();
    table
      .integer("institution_user_id")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  // loans
  await knex.schema.createTable("loans", (table) => {
    table.increments("id").primary();
    table
      .integer("borrower_id")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table
      .integer("school_id")
      .references("id")
      .inTable("institutions")
      .onDelete("SET NULL");
    table
      .integer("custody_user_id")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.specificType("amount", "numeric").notNullable();
    table.integer("term_months").notNullable();
    table.text("status").defaultTo("pending");
    table.specificType("contract_json", "jsonb").nullable();
    table.specificType("origination_pct", "numeric").nullable();
    table.specificType("marketplace_pct", "numeric").nullable();
    table.specificType("custody_pct_monthly", "numeric").nullable();
    table.specificType("spread_pct_annual", "numeric").nullable();
    table.specificType("revenue_first_year", "numeric").nullable();
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  // offers
  await knex.schema.createTable("offers", (table) => {
    table.increments("id").primary();
    table
      .integer("investor_id")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table
      .specificType("amount_available", "numeric")
      .notNullable()
      .defaultTo(0);
    table.integer("term_months").notNullable();
    table.specificType("min_rate", "numeric").notNullable().defaultTo(0);
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  // matches
  await knex.schema.createTable("matches", (table) => {
    table.increments("id").primary();
    table
      .integer("loan_id")
      .references("id")
      .inTable("loans")
      .onDelete("CASCADE");
    table
      .integer("offer_id")
      .references("id")
      .inTable("offers")
      .onDelete("CASCADE");
    table.specificType("amount_matched", "numeric").notNullable();
    table.specificType("rate", "numeric").notNullable();
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  // ledger
  await knex.schema.createTable("ledger", (table) => {
    table.increments("id").primary();
    table.text("account_type").notNullable();
    table
      .integer("user_id")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.text("account_ref").nullable();
    table.specificType("amount", "numeric").notNullable();
    table.enu("dc", ["D", "C"]).notNullable();
    table.text("ref").nullable();
    table.specificType("meta", "jsonb").nullable();
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  // frauds
  await knex.schema.createTable("frauds", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.text("type").notNullable();
    table.integer("severity").defaultTo(1);
    table.specificType("payload", "jsonb").nullable();
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  // scores
  await knex.schema.createTable("scores", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.integer("score").notNullable();
    table.text("risk_band").nullable();
    table.specificType("reason_json", "jsonb").nullable();
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  // academic_performance
  await knex.schema.createTable("academic_performance", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .integer("school_id")
      .references("id")
      .inTable("institutions")
      .onDelete("SET NULL");
    table.text("period").nullable();
    table.specificType("grade_avg", "numeric").nullable();
    table.specificType("attendance_pct", "numeric").nullable();
    table.text("status").nullable();
    table.specificType("meta", "jsonb").nullable();
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  // loan_fees (audit trail for monetization)
  await knex.schema.createTable("loan_fees", (table) => {
    table.increments("id").primary();
    table
      .integer("loan_id")
      .references("id")
      .inTable("loans")
      .onDelete("CASCADE");
    table.text("fee_type").notNullable(); // origination | marketplace | custody | spread | analytics
    table.specificType("amount", "numeric(14,2)").notNullable();
    table.date("period_start").nullable();
    table.date("period_end").nullable();
    table.timestamp("charged_at", { useTz: true }).defaultTo(knex.fn.now());
    table.text("ledger_ref").nullable();
    table.specificType("meta", "jsonb").nullable();
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  // índices
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_users_is_system ON users(is_system)"
  );
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)"
  );
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_frauds_user ON frauds(user_id)"
  );
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id)"
  );
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_academic_user ON academic_performance(user_id)"
  );
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_loans_borrower ON loans(borrower_id)"
  );
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_offers_investor ON offers(investor_id)"
  );
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger(user_id)"
  );
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_loan_fees_loan_id ON loan_fees(loan_id)"
  );
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("loan_fees");
  await knex.schema.dropTableIfExists("academic_performance");
  await knex.schema.dropTableIfExists("scores");
  await knex.schema.dropTableIfExists("frauds");
  await knex.schema.dropTableIfExists("ledger");
  await knex.schema.dropTableIfExists("matches");
  await knex.schema.dropTableIfExists("offers");
  await knex.schema.dropTableIfExists("loans");
  await knex.schema.dropTableIfExists("institutions");
  await knex.schema.dropTableIfExists("users");
};
