exports.up = async function (knex) {
    await knex.schema.alterTable("loans", (table) => {
        // Campos para ofertas de investidores
        table.string("offer_id").nullable(); // ID da oferta que financiou
        table.integer("investor_id").nullable(); // ID do investidor
        table.specificType("offer_amount", "numeric(10,2)").nullable(); // Valor da oferta
        table.specificType("offer_rate", "numeric(5,4)").nullable(); // Taxa da oferta
        table.timestamp("offer_created_at").nullable(); // Data da oferta
        table.timestamp("match_created_at").nullable(); // Data do match
        table.string("match_status").defaultTo("pending"); // Status do match
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable("loans", (table) => {
        table.dropColumn("offer_id");
        table.dropColumn("investor_id");
        table.dropColumn("offer_amount");
        table.dropColumn("offer_rate");
        table.dropColumn("offer_created_at");
        table.dropColumn("match_created_at");
        table.dropColumn("match_status");
    });
};
