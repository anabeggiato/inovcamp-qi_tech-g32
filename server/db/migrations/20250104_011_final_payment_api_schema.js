/**
 * Migration Final - Payment API Schema Corrections
 * Consolida todas as correções de schema necessárias para a Payment API
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    console.log('🔧 Aplicando correções finais do schema da Payment API...');
    
    // 1. Adicionar colunas faltantes na tabela users
    console.log('📝 Corrigindo tabela users...');
    await knex.raw(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS user_type TEXT,
        ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 0
    `);
    
    // 2. Adicionar colunas faltantes na tabela institutions
    console.log('📝 Corrigindo tabela institutions...');
    await knex.raw(`
        ALTER TABLE institutions 
        ADD COLUMN IF NOT EXISTS email TEXT,
        ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 0
    `);
    
    // 3. Adicionar colunas faltantes na tabela loans
    console.log('📝 Corrigindo tabela loans...');
    await knex.raw(`
        ALTER TABLE loans 
        ADD COLUMN IF NOT EXISTS loan_id TEXT,
        ADD COLUMN IF NOT EXISTS description TEXT
    `);
    
    // 4. Adicionar colunas faltantes na tabela ledger
    console.log('📝 Corrigindo tabela ledger...');
    await knex.raw(`
        ALTER TABLE ledger 
        ADD COLUMN IF NOT EXISTS loan_id TEXT,
        ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2)
    `);
    
    // 5. Adicionar colunas faltantes na tabela custody_accounts
    console.log('📝 Corrigindo tabela custody_accounts...');
    await knex.raw(`
        ALTER TABLE custody_accounts 
        ADD COLUMN IF NOT EXISTS email TEXT,
        ADD COLUMN IF NOT EXISTS blocked_amount DECIMAL(15,2) DEFAULT 0
    `);
    
    // 6. Adicionar colunas faltantes na tabela payment_transactions
    console.log('📝 Corrigindo tabela payment_transactions...');
    await knex.raw(`
        ALTER TABLE payment_transactions 
        ADD COLUMN IF NOT EXISTS payment_id TEXT,
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS from_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
    `);
    
    // 7. Criar tabelas auxiliares se não existirem
    console.log('📝 Criando tabelas auxiliares...');
    
    // Tabela user_balances
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS user_balances (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            available_balance DECIMAL(15,2) DEFAULT 0,
            blocked_amount DECIMAL(15,2) DEFAULT 0,
            total_balance DECIMAL(15,2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id)
        )
    `);
    
    // Tabela transfers
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS transfers (
            id SERIAL PRIMARY KEY,
            from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            amount DECIMAL(15,2) NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            transfer_type TEXT,
            loan_id INTEGER REFERENCES loans(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `);
    
    // 8. Criar índices para performance
    console.log('📝 Criando índices...');
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type)',
        'CREATE INDEX IF NOT EXISTS idx_users_balance ON users(balance)',
        'CREATE INDEX IF NOT EXISTS idx_institutions_balance ON institutions(balance)',
        'CREATE INDEX IF NOT EXISTS idx_loans_loan_id ON loans(loan_id)',
        'CREATE INDEX IF NOT EXISTS idx_ledger_loan_id ON ledger(loan_id)',
        'CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(payment_id)',
        'CREATE INDEX IF NOT EXISTS idx_payment_transactions_from_user ON payment_transactions(from_user_id)',
        'CREATE INDEX IF NOT EXISTS idx_payment_transactions_to_user ON payment_transactions(to_user_id)',
        'CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_transfers_from_user ON transfers(from_user_id)',
        'CREATE INDEX IF NOT EXISTS idx_transfers_to_user ON transfers(to_user_id)',
        'CREATE INDEX IF NOT EXISTS idx_transfers_loan_id ON transfers(loan_id)',
        'CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status)'
    ];
    
    for (const indexQuery of indexes) {
        try {
            await knex.raw(indexQuery);
        } catch (error) {
            console.log(`⚠️  Índice pode já existir: ${indexQuery.split(' ')[5]}`);
        }
    }
    
    console.log('✅ Schema da Payment API corrigido com sucesso!');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    console.log('🔄 Revertendo correções do schema...');
    
    // Remover tabelas auxiliares
    await knex.schema.dropTableIfExists('transfers');
    await knex.schema.dropTableIfExists('user_balances');
    
    // Remover colunas adicionadas (com tratamento de erro)
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
            table.dropColumn('blocked_amount');
        });
    } catch (error) {
        console.log('Colunas email/blocked_amount podem não existir');
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
    
    console.log('✅ Reversão concluída');
};
