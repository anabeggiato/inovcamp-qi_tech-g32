/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('loans', function (table) {
        table.integer('evasion_score').defaultTo(0);
        table.text('risk_level').defaultTo('low');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('loans', function (table) {
        table.dropColumn('evasion_score');
        table.dropColumn('risk_level');
    });
};
