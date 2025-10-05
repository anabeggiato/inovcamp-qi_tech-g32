/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('loan_installments', function (table) {
        table.increments('id').primary();
        table.integer('loan_id').notNullable();
        table.integer('installment_number').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.date('due_date').notNullable();
        table.enum('status', ['pending', 'paid', 'overdue', 'payment_failed']).defaultTo('pending');
        table.timestamp('paid_at');
        table.string('payment_id');
        table.text('error_message');
        table.timestamps(true, true);

        // Índices
        table.index('loan_id');
        table.index('due_date');
        table.index('status');
        table.index(['loan_id', 'installment_number']);

        // Foreign key
        table.foreign('loan_id').references('id').inTable('loans').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('loan_installments');
};
