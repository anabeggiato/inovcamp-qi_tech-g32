/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('custody_accounts', function (table) {
        table.string('id').primary(); // user_1, user_2, etc.
        table.integer('user_id').notNullable();
        table.string('user_type').notNullable(); // investor, student, institution, qi_edu
        table.decimal('available_balance', 15, 2).defaultTo(0);
        table.decimal('blocked_amount', 15, 2).defaultTo(0);
        table.decimal('total_balance', 15, 2).defaultTo(0);
        table.string('status').defaultTo('active'); // active, blocked, closed
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Índices
        table.index('user_id');
        table.index('user_type');
        table.index('status');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('custody_accounts');
};
