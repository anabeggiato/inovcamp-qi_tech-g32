/**
 * Migration para adicionar coluna amount_funded à tabela loans
 * Esta coluna rastreia o valor já financiado de um empréstimo
 */
exports.up = async function (knex) {
    await knex.schema.alterTable("loans", (table) => {
        table.specificType("amount_funded", "numeric").notNullable().defaultTo(0);
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable("loans", (table) => {
        table.dropColumn("amount_funded");
    });
};
