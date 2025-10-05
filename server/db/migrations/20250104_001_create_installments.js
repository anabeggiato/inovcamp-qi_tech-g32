exports.up = async function (knex) {
    await knex.schema.createTable("installments", (table) => {
        table.increments("id").primary();
        table
            .integer("loan_id")
            .references("id")
            .inTable("loans")
            .onDelete("CASCADE");
        table.integer("number").notNullable(); // 1, 2, 3, 4...
        table.specificType("amount", "numeric(10,2)").notNullable(); // Valor total da parcela
        table.specificType("principal_amount", "numeric(10,2)").notNullable(); // Principal
        table.specificType("interest_amount", "numeric(10,2)").notNullable(); // Juros
        table.date("due_date").notNullable();
        table.boolean("paid").defaultTo(false);
        table.date("payment_date").nullable();
        table.specificType("paid_amount", "numeric(10,2)").nullable(); // Valor efetivamente pago
        table.specificType("discount_amount", "numeric(10,2)").defaultTo(0); // Desconto por antecipação
        table.specificType("late_fee_amount", "numeric(10,2)").defaultTo(0); // Multa por atraso

        // Campos para flexibilidade de pagamento
        table.text("payment_phase").notNullable(); // 'during_studies', 'after_graduation', 'hybrid'
        table.boolean("is_symbolic").defaultTo(false); // Se é pagamento simbólico
        table.specificType("symbolic_amount", "numeric(10,2)").nullable(); // Valor simbólico

        table.specificType("investor_share", "numeric(10,2)").notNullable(); // Parte do investidor
        table.specificType("qi_edu_fee_share", "numeric(10,2)").notNullable(); // Taxas QI-EDU
        table.text("status").defaultTo("pending"); // pending, paid, overdue, partially_paid, paid_early, paid_late
        table.text("payment_method").nullable(); // 'pix', 'boleto', 'debito'
        table.text("transaction_id").nullable(); // ID da transação

        table
            .integer("ledger_entry_id")
            .nullable()
            .references("id")
            .inTable("ledger");
        table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
    });

    // Índices para performance
    await knex.schema.raw("CREATE INDEX IF NOT EXISTS idx_installments_loan ON installments(loan_id)");
    await knex.schema.raw("CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date)");
    await knex.schema.raw("CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status)");
    await knex.schema.raw("CREATE INDEX IF NOT EXISTS idx_installments_payment_phase ON installments(payment_phase)");
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("installments");
};

