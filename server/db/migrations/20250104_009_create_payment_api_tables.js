/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        // Tabela para armazenar pagamentos orquestrados
        .createTable('orchestrated_payments', function (table) {
            table.string('id').primary(); // PAY-xxx, PIX-xxx, etc.
            table.string('loan_id').notNullable();
            table.string('installment_id').notNullable();
            table.string('payment_method').notNullable(); // pix, boleto, credit_card, debit_card
            table.decimal('amount', 15, 2).notNullable();
            table.string('from_account').notNullable(); // user_1, user_2, etc.
            table.string('to_account').notNullable();
            table.text('description').nullable();
            table.string('status').defaultTo('processing'); // processing, completed, failed, cancelled
            table.string('external_id').nullable(); // ID da transação externa
            table.decimal('fees', 15, 2).defaultTo(0); // Taxas cobradas
            table.decimal('net_amount', 15, 2).nullable(); // Valor líquido
            table.jsonb('meta').nullable(); // Dados adicionais
            table.timestamp('processed_at').nullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());

            // Índices
            table.index('loan_id');
            table.index('installment_id');
            table.index('status');
            table.index('from_account');
            table.index('to_account');
        })

        // Tabela para armazenar planos de pagamento
        .createTable('payment_plans', function (table) {
            table.string('id').primary(); // PLAN-xxx
            table.string('loan_id').notNullable();
            table.decimal('amount', 15, 2).notNullable();
            table.integer('term_months').notNullable();
            table.decimal('interest_rate', 5, 4).notNullable(); // 0.02 = 2%
            table.string('payment_timing').notNullable(); // during_studies, after_graduation, hybrid
            table.jsonb('installments_list').nullable(); // Array de parcelas
            table.string('status').defaultTo('active'); // active, completed, cancelled
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());

            // Índices
            table.index('loan_id');
            table.index('status');
        })

        // Tabela para armazenar transações de custódia (se não existir)
        .createTable('custody_transactions', function (table) {
            table.increments('id').primary();
            table.string('from_account').notNullable();
            table.string('to_account').notNullable();
            table.decimal('amount', 15, 2).notNullable();
            table.text('description').nullable();
            table.string('transaction_type').notNullable(); // deposit, transfer, payment, fee
            table.string('category').nullable(); // payment, fee, transfer, etc.
            table.string('subcategory').nullable(); // pix, boleto, custody_fee, etc.
            table.string('reference_id').nullable(); // ID da operação que gerou a transação
            table.jsonb('meta').nullable(); // Dados adicionais
            table.timestamp('created_at').defaultTo(knex.fn.now());

            // Índices
            table.index('from_account');
            table.index('to_account');
            table.index('transaction_type');
            table.index('reference_id');
        })

        // Tabela para armazenar entradas do ledger da Payment API
        .createTable('payment_ledger', function (table) {
            table.increments('id').primary();
            table.string('entry_id').notNullable(); // LED-xxx
            table.string('from_account').notNullable();
            table.string('to_account').notNullable();
            table.decimal('amount', 15, 2).notNullable();
            table.text('description').nullable();
            table.string('category').notNullable(); // payment, fee, transfer, revenue
            table.string('subcategory').nullable(); // pix, boleto, custody_fee, etc.
            table.string('reference_id').nullable(); // ID da operação relacionada
            table.jsonb('meta').nullable(); // Dados adicionais
            table.timestamp('created_at').defaultTo(knex.fn.now());

            // Índices
            table.index('entry_id');
            table.index('from_account');
            table.index('to_account');
            table.index('category');
            table.index('reference_id');
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('payment_ledger')
        .dropTableIfExists('custody_transactions')
        .dropTableIfExists('payment_plans')
        .dropTableIfExists('orchestrated_payments');
};
