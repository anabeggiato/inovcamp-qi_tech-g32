/**
 * Seed - Payment API Test Data
 * Cria dados de teste para a Payment API
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    console.log('🌱 Criando dados de teste para Payment API...');
    
    // Deletar dados existentes (se houver)
    await knex('transfers').del();
    await knex('user_balances').del();
    await knex('custody_accounts').del();
    
    // 1. Criar usuários de teste
    console.log('👥 Criando usuários de teste...');
    
    const users = await knex('users').insert([
        {
            name: 'João Investidor Teste',
            email: 'joao.investidor.teste@example.com',
            role: 'investor',
            user_type: 'investor',
            balance: 0,
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            name: 'Maria Estudante Teste',
            email: 'maria.estudante.teste@example.com',
            role: 'student',
            user_type: 'student',
            balance: 0,
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            name: 'Carlos Investidor Teste',
            email: 'carlos.investidor.teste@example.com',
            role: 'investor',
            user_type: 'investor',
            balance: 0,
            created_at: new Date(),
            updated_at: new Date()
        }
    ]).returning('id');
    
    const [joaoId, mariaId, carlosId] = users.map(u => u.id);
    console.log(`✅ Usuários criados: João(${joaoId}), Maria(${mariaId}), Carlos(${carlosId})`);
    
    // 2. Criar instituição de teste
    console.log('🏫 Criando instituição de teste...');
    const institutions = await knex('institutions').insert([
        {
            name: 'Universidade Payment Teste',
            email: 'contato@universidade-payment-teste.com',
            balance: 0,
            created_at: new Date(),
            updated_at: new Date()
        }
    ]).returning('id');
    
    const institutionId = institutions[0].id;
    console.log(`✅ Instituição criada: ID ${institutionId}`);
    
    // 3. Criar empréstimo de teste
    console.log('💰 Criando empréstimo de teste...');
    const loans = await knex('loans').insert([
        {
            borrower_id: mariaId,
            amount: 15000,
            interest_rate: 0.05,
            term_months: 24,
            status: 'approved',
            loan_id: 'PAYMENT-TEST-LOAN-001',
            description: 'Empréstimo teste para Payment API',
            created_at: new Date(),
            updated_at: new Date()
        }
    ]).returning('id');
    
    const loanId = loans[0].id;
    console.log(`✅ Empréstimo criado: ID ${loanId}`);
    
    // 4. Criar parcelas de teste
    console.log('📅 Criando parcelas de teste...');
    const installments = [];
    for (let i = 1; i <= 24; i++) {
        installments.push({
            loan_id: loanId,
            number: i,
            amount: 750,
            principal_amount: 600,
            interest_amount: 150,
            due_date: new Date(Date.now() + (i * 30 * 24 * 60 * 60 * 1000)),
            paid: false,
            payment_phase: 'during_studies',
            is_symbolic: false,
            investor_share: 0.8,
            qi_edu_fee_share: 0.2,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date()
        });
    }
    
    await knex('installments').insert(installments);
    console.log(`✅ ${installments.length} parcelas criadas`);
    
    // 5. Criar contas de custódia
    console.log('🏦 Criando contas de custódia...');
    
    const custodyAccounts = [
        {
            id: `user_${joaoId}`,
            user_id: joaoId,
            user_type: 'investor',
            available_balance: 0,
            blocked_amount: 0,
            total_balance: 0,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: `user_${mariaId}`,
            user_id: mariaId,
            user_type: 'student',
            available_balance: 0,
            blocked_amount: 0,
            total_balance: 0,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: `user_${carlosId}`,
            user_id: carlosId,
            user_type: 'investor',
            available_balance: 0,
            blocked_amount: 0,
            total_balance: 0,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: `institution_${institutionId}`,
            user_id: institutionId,
            user_type: 'institution',
            available_balance: 0,
            blocked_amount: 0,
            total_balance: 0,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date()
        }
    ];
    
    await knex('custody_accounts').insert(custodyAccounts);
    console.log(`✅ ${custodyAccounts.length} contas de custódia criadas`);
    
    // 6. Criar saldos de usuários
    console.log('💰 Criando saldos de usuários...');
    
    const userBalances = [
        {
            user_id: joaoId,
            available_balance: 0,
            blocked_amount: 0,
            total_balance: 0,
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            user_id: mariaId,
            available_balance: 0,
            blocked_amount: 0,
            total_balance: 0,
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            user_id: carlosId,
            available_balance: 0,
            blocked_amount: 0,
            total_balance: 0,
            created_at: new Date(),
            updated_at: new Date()
        }
    ];
    
    await knex('user_balances').insert(userBalances);
    console.log(`✅ ${userBalances.length} saldos de usuários criados`);
    
    console.log('\n🎉 Dados de teste da Payment API criados com sucesso!');
    console.log('📊 Resumo dos dados criados:');
    console.log(`   👤 Usuários: 3 (2 investidores, 1 estudante)`);
    console.log(`   🏫 Instituições: 1`);
    console.log(`   💰 Empréstimos: 1`);
    console.log(`   📅 Parcelas: 24`);
    console.log(`   🏦 Contas de custódia: 4`);
    console.log(`   💰 Saldos de usuários: 3`);
    
    console.log('\n🔗 IDs para teste:');
    console.log(`   👤 Investidor João: ${joaoId}`);
    console.log(`   👤 Investidor Carlos: ${carlosId}`);
    console.log(`   🎓 Estudante Maria: ${mariaId}`);
    console.log(`   🏫 Instituição: ${institutionId}`);
    console.log(`   💰 Empréstimo: ${loanId}`);
};
