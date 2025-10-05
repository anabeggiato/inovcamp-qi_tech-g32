/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('notifications', function (table) {
        table.increments('id').primary();
        table.integer('user_id').notNullable();
        table.string('type').notNullable(); // match_created, loan_disbursed, etc.
        table.string('title').notNullable();
        table.text('message').notNullable();
        table.jsonb('data').defaultTo('{}'); // Dados adicionais
        table.enum('status', ['pending', 'sent', 'delivered', 'failed']).defaultTo('pending');
        table.timestamp('sent_at');
        table.timestamp('delivered_at');
        table.timestamp('read_at');
        table.timestamps(true, true);

        // Índices
        table.index('user_id');
        table.index('type');
        table.index('status');
        table.index('created_at');

        // Foreign key
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('notifications');
};
