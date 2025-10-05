/**
 * Migração segura para corrigir schema da Payment API
 * Verifica se as colunas existem antes de adicioná-las
 */
exports.up = async function (knex) {
    // 1. Adicionar colunas faltantes na tabela users (se não existirem)
    const usersColumns = await knex.raw(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
    `);
    
    const usersColumnNames = usersColumns.rows.map(row => row.column_name);
    
    if (!usersColumnNames.includes('user_type')) {
        await knex.schema.alterTable('users', (table) => {
            table.text('user_type').nullable();
        });
    }
    
    if (!usersColumnNames.includes('balance')) {
        await knex.schema.alterTable('users', (table) => {
            table.decimal('balance', 15, 2).defaultTo(0);
        });
    }

    // 2. Adicionar colunas faltantes na tabela institutions (se não existirem)
    const institutionsColumns = await knex.raw(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'institutions' AND table_schema = 'public'
    `);
    
    const institutionsColumnNames = institutionsColumns.rows.map(row => row.column_name);
    
    if (!institutionsColumnNames.includes('email')) {
        await knex.schema.alterTable('institutions', (table) => {
            table.text('email').nullable();
        });
    }
    
    if (!institutionsColumnNames.includes('balance')) {
        await knex.schema.alterTable('institutions', (table) => {
            table.decimal('balance', 15, 2).defaultTo(0);
        });
    }

    // 3. Adicionar colunas faltantes na tabela loans (se não existirem)
    const loansColumns = await knex.raw(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'loans' AND table_schema = 'public'
    `);
    
    const loansColumnNames = loansColumns.rows.map(row => row.column_name);
    
    if (!loansColumnNames.includes('loan_id')) {
        await knex.schema.alterTable('loans', (table) => {
            table.text('loan_id').nullable();
        });
    }
    
    if (!loansColumnNames.includes('description')) {
        await knex.schema.alterTable('loans', (table) => {
            table.text('description').nullable();
        });
    }

    // 4. Adicionar colunas faltantes na tabela ledger (se não existirem)
    const ledgerColumns = await knex.raw(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'ledger' AND table_schema = 'public'
    `);
    
    const ledgerColumnNames = ledgerColumns.rows.map(row => row.column_name);
    
    if (!ledgerColumnNames.includes('loan_id')) {
        await knex.schema.alterTable('ledger', (table) => {
            table.text('loan_id').nullable();
        });
    }
    
    if (!ledgerColumnNames.includes('balance')) {
        await knex.schema.alterTable('ledger', (table) => {
            table.decimal('balance', 15, 2).nullable();
        });
    }

    // 5. Criar tabela de saldos se não existir
    const userBalancesExists = await knex.schema.hasTable('user_balances');
    if (!userBalancesExists) {
        await knex.schema.createTable('user_balances', (table) => {
            table.increments('id').primary();
            table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.decimal('available_balance', 15, 2).defaultTo(0);
            table.decimal('blocked_amount', 15, 2).defaultTo(0);
            table.decimal('total_balance', 15, 2).defaultTo(0);
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
            
            table.unique('user_id');
            table.index('user_id');
        });
    }

    // 6. Criar tabela de transferências se não existir
    const transfersExists = await knex.schema.hasTable('transfers');
    if (!transfersExists) {
        await knex.schema.createTable('transfers', (table) => {
            table.increments('id').primary();
            table.integer('from_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.integer('to_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.decimal('amount', 15, 2).notNullable();
            table.text('description').nullable();
            table.text('status').defaultTo('pending');
            table.text('transfer_type').nullable();
            table.integer('loan_id').nullable().references('id').inTable('loans').onDelete('SET NULL');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
            
            table.index('from_user_id');
            table.index('to_user_id');
            table.index('loan_id');
            table.index('status');
        });
    }

    // 7. Adicionar colunas faltantes na tabela custody_accounts (se não existirem)
    const custodyColumns = await knex.raw(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'custody_accounts' AND table_schema = 'public'
    `);
    
    const custodyColumnNames = custodyColumns.rows.map(row => row.column_name);
    
    if (!custodyColumnNames.includes('email')) {
        await knex.schema.alterTable('custody_accounts', (table) => {
            table.text('email').nullable();
        });
    }

    // 8. Adicionar colunas faltantes na tabela payment_transactions (se não existirem)
    const paymentColumns = await knex.raw(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' AND table_schema = 'public'
    `);
    
    const paymentColumnNames = paymentColumns.rows.map(row => row.column_name);
    
    if (!paymentColumnNames.includes('payment_id')) {
        await knex.schema.alterTable('payment_transactions', (table) => {
            table.text('payment_id').nullable();
        });
    }
    
    if (!paymentColumnNames.includes('description')) {
        await knex.schema.alterTable('payment_transactions', (table) => {
            table.text('description').nullable();
        });
    }
    
    if (!paymentColumnNames.includes('from_user_id')) {
        await knex.schema.alterTable('payment_transactions', (table) => {
            table.integer('from_user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
        });
    }
    
    if (!paymentColumnNames.includes('to_user_id')) {
        await knex.schema.alterTable('payment_transactions', (table) => {
            table.integer('to_user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
        });
    }

    // 9. Criar índices para performance (se não existirem)
    try {
        await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type)');
        await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_users_balance ON users(balance)');
        await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_institutions_balance ON institutions(balance)');
        await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_loans_loan_id ON loans(loan_id)');
        await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_ledger_loan_id ON ledger(loan_id)');
        await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(payment_id)');
        await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_payment_transactions_from_user ON payment_transactions(from_user_id)');
        await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_payment_transactions_to_user ON payment_transactions(to_user_id)');
    } catch (error) {
        console.log('Alguns índices já existem, continuando...');
    }
};

exports.down = async function (knex) {
    // Remover tabelas criadas
    await knex.schema.dropTableIfExists('transfers');
    await knex.schema.dropTableIfExists('user_balances');
    
    // Remover colunas adicionadas (se existirem)
    try {
        await knex.schema.alterTable('users', (table) => {
            table.dropColumn('user_type');
            table.dropColumn('balance');
        });
    } catch (error) {
        console.log('Colunas user_type/balance podem não existir');
    }
    
    try {
        await knex.schema.alterTable('institutions', (table) => {
            table.dropColumn('email');
            table.dropColumn('balance');
        });
    } catch (error) {
        console.log('Colunas email/balance podem não existir');
    }
    
    try {
        await knex.schema.alterTable('loans', (table) => {
            table.dropColumn('loan_id');
            table.dropColumn('description');
        });
    } catch (error) {
        console.log('Colunas loan_id/description podem não existir');
    }
    
    try {
        await knex.schema.alterTable('ledger', (table) => {
            table.dropColumn('loan_id');
            table.dropColumn('balance');
        });
    } catch (error) {
        console.log('Colunas loan_id/balance podem não existir');
    }
    
    try {
        await knex.schema.alterTable('custody_accounts', (table) => {
            table.dropColumn('email');
        });
    } catch (error) {
        console.log('Coluna email pode não existir');
    }
    
    try {
        await knex.schema.alterTable('payment_transactions', (table) => {
            table.dropColumn('payment_id');
            table.dropColumn('description');
            table.dropColumn('from_user_id');
            table.dropColumn('to_user_id');
        });
    } catch (error) {
        console.log('Colunas podem não existir');
    }
};
