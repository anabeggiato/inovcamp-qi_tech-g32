exports.up = async function (knex) {
    await knex.schema.createTable("payment_transactions", (table) => {
        table.increments("id").primary();
        table
            .integer("installment_id")
            .references("id")
            .inTable("installments")
            .onDelete("CASCADE");
        table
            .integer("payment_method_id")
            .nullable()
            .references("id")
            .inTable("payment_methods")
            .onDelete("SET NULL");
        table.specificType("amount", "numeric(10,2)").notNullable();
        table.text("status").notNullable(); // pending, processing, completed, failed, cancelled
        table.text("external_transaction_id").nullable(); // ID da transação externa
        table.specificType("fees", "numeric(10,2)").defaultTo(0); // Taxas de processamento
        table.specificType("net_amount", "numeric(10,2)").nullable(); // Valor líquido após taxas
        table.specificType("meta", "jsonb").nullable(); // Dados da transação
        table.timestamp("processed_at").nullable();
        table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
    });

    // Índices
    await knex.schema.raw("CREATE INDEX IF NOT EXISTS idx_payment_transactions_installment ON payment_transactions(installment_id)");
    await knex.schema.raw("CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status)");
    await knex.schema.raw("CREATE INDEX IF NOT EXISTS idx_payment_transactions_external ON payment_transactions(external_transaction_id)");
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("payment_transactions");
};
