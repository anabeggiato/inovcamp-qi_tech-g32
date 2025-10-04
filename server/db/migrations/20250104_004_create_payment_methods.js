exports.up = async function (knex) {
    await knex.schema.createTable("payment_methods", (table) => {
        table.increments("id").primary();
        table
            .integer("user_id")
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        table.text("type").notNullable(); // 'pix', 'boleto', 'debito', 'credito'
        table.text("identifier").notNullable(); // Chave PIX, número do cartão, etc.
        table.boolean("is_active").defaultTo(true);
        table.boolean("is_default").defaultTo(false); // Método padrão do usuário
        table.specificType("meta", "jsonb").nullable(); // Dados específicos do método
        table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
    });

    // Índices
    await knex.schema.raw("CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id)");
    await knex.schema.raw("CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type)");
    await knex.schema.raw("CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active)");
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("payment_methods");
};

