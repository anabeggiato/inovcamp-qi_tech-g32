exports.up = async function (knex) {
    await knex.schema.createTable("loan_payment_schedules", (table) => {
        table.increments("id").primary();
        table
            .integer("loan_id")
            .references("id")
            .inTable("loans")
            .onDelete("CASCADE");
        table.text("schedule_type").notNullable(); // 'amortization', 'interest_only', 'balloon'
        table.specificType("total_amount", "numeric(10,2)").notNullable();
        table.specificType("principal_amount", "numeric(10,2)").notNullable();
        table.specificType("interest_amount", "numeric(10,2)").notNullable();
        table.specificType("total_fees", "numeric(10,2)").defaultTo(0);
        table.integer("total_installments").notNullable();
        table.specificType("monthly_payment", "numeric(10,2)").notNullable();
        table.specificType("interest_rate", "numeric(5,4)").notNullable();
        table.date("first_payment_date").notNullable();
        table.date("last_payment_date").notNullable();
        table.boolean("is_active").defaultTo(true);
        table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
    });

    // Índices
    await knex.schema.raw("CREATE INDEX IF NOT EXISTS idx_loan_payment_schedules_loan ON loan_payment_schedules(loan_id)");
    await knex.schema.raw("CREATE INDEX IF NOT EXISTS idx_loan_payment_schedules_active ON loan_payment_schedules(is_active)");
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("loan_payment_schedules");
};

