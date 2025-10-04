exports.up = async function (knex) {
    await knex.schema.alterTable("loans", (table) => {
        // Campos para timing de pagamento
        table.text("payment_timing").notNullable().defaultTo("during_studies"); // 'during_studies', 'after_graduation', 'hybrid'
        table.timestamp("payment_timing_chosen_at").nullable();

        // Campos para cálculo de parcelas
        table.specificType("interest_rate", "numeric(5,4)").nullable(); // 0.0200 = 2%
        table.integer("due_day").nullable(); // Dia do mês (ex: 10)
        table.integer("total_installments").nullable(); // Número total de parcelas
        table.specificType("monthly_payment", "numeric(10,2)").nullable(); // Valor da parcela

        // Campos para datas
        table.date("first_due_date").nullable(); // Primeira parcela
        table.date("last_due_date").nullable(); // Última parcela
        table.date("graduation_date").nullable(); // Data de formatura (para pagamento após)
        table.integer("grace_period_months").defaultTo(6); // Período de carência após formatura

        // Campos para pagamento híbrido
        table.specificType("symbolic_payment_amount", "numeric(10,2)").nullable(); // Valor simbólico
        table.integer("symbolic_payment_months").nullable(); // Meses de pagamento simbólico
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable("loans", (table) => {
        table.dropColumn("payment_timing");
        table.dropColumn("payment_timing_chosen_at");
        table.dropColumn("interest_rate");
        table.dropColumn("due_day");
        table.dropColumn("total_installments");
        table.dropColumn("monthly_payment");
        table.dropColumn("first_due_date");
        table.dropColumn("last_due_date");
        table.dropColumn("graduation_date");
        table.dropColumn("grace_period_months");
        table.dropColumn("symbolic_payment_amount");
        table.dropColumn("symbolic_payment_months");
    });
};
