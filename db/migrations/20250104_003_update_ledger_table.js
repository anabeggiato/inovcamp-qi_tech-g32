exports.up = async function (knex) {
    await knex.schema.alterTable("ledger", (table) => {
        // Campos para melhor rastreabilidade
        table.text("transaction_type").nullable(); // 'loan_creation', 'payment', 'fee', 'refund', 'escrow_transfer'
        table
            .integer("installment_id")
            .nullable()
            .references("id")
            .inTable("installments");
        table.text("description").nullable(); // Descrição mais detalhada
        table.text("external_reference").nullable(); // Referência externa (ID do PIX, boleto, etc.)

        // Campos para categorização
        table.text("category").nullable(); // 'principal', 'interest', 'fee', 'penalty', 'discount'
        table.text("subcategory").nullable(); // 'origination', 'marketplace', 'custody', 'late_fee', 'early_discount'
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable("ledger", (table) => {
        table.dropColumn("transaction_type");
        table.dropColumn("installment_id");
        table.dropColumn("description");
        table.dropColumn("external_reference");
        table.dropColumn("category");
        table.dropColumn("subcategory");
    });
};
