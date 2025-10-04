/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('custody_transactions', function (table) {
        table.string('id').primary();
        table.string('account_id').notNullable();
        table.string('type').notNullable(); // deposit, withdrawal, transfer, block, unblock
        table.decimal('amount', 15, 2).notNullable();
        table.string('payment_method').nullable(); // pix, boleto, credit_card, debit_card
        table.text('description').nullable();
        table.string('status').defaultTo('completed'); // pending, completed, failed
        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Índices
        table.index('account_id');
        table.index('type');
        table.index('status');
        table.index('created_at');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('custody_transactions');
};
