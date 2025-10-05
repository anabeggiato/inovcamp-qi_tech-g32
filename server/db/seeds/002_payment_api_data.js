/**
 * Seed específico para dados da Payment API
 */
exports.seed = async function (knex) {
    await knex.transaction(async (trx) => {
        // Limpar dados existentes da Payment API (apenas tabelas que existem)
        const tablesToTruncate = [];
        
        // Verificar quais tabelas existem
        const existingTables = await trx.raw(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN (
                'payment_ledger', 
                'custody_transactions', 
                'payment_plans', 
                'orchestrated_payments',
                'payment_transactions',
                'custody_accounts'
            )
        `);
        
        if (existingTables.rows.length > 0) {
            const tableNames = existingTables.rows.map(row => row.table_name).join(', ');
            await trx.raw(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);
        }

        // Criar contas de custódia para os usuários existentes
        await trx('custody_accounts').insert([
            {
                id: 'user_2', // Alice (estudante) - ID 2
                user_id: 2,
                user_type: 'student',
                available_balance: 0,
                blocked_amount: 0,
                total_balance: 0,
                status: 'active'
            },
            {
                id: 'user_3', // Bob (investidor) - ID 3
                user_id: 3,
                user_type: 'investor',
                available_balance: 10000,
                blocked_amount: 0,
                total_balance: 10000,
                status: 'active'
            },
            {
                id: 'user_4', // Charlie (estudante) - ID 4
                user_id: 4,
                user_type: 'student',
                available_balance: 0,
                blocked_amount: 0,
                total_balance: 0,
                status: 'active'
            },
            {
                id: 'institution_1', // Faculdade - ID 1
                user_id: 1,
                user_type: 'institution',
                available_balance: 5000, // Valor já transferido do empréstimo
                blocked_amount: 0,
                total_balance: 5000,
                status: 'active'
            },
            {
                id: 'qi_edu_system', // Conta da QI-EDU - ID 6
                user_id: 6,
                user_type: 'platform',
                available_balance: 0,
                blocked_amount: 0,
                total_balance: 0,
                status: 'active'
            }
        ]);

        // Criar parcelas para o empréstimo existente
        const loanId = 1;
        const installmentData = [];
        
        for (let i = 1; i <= 12; i++) {
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + i);
            
            installmentData.push({
                loan_id: loanId,
                number: i,
                amount: 500.00,
                principal_amount: 400.00,
                interest_amount: 100.00,
                due_date: dueDate.toISOString().split('T')[0],
                payment_phase: 'during_studies',
                is_symbolic: false,
                investor_share: 475.00,
                qi_edu_fee_share: 25.00,
                status: i <= 3 ? 'paid' : 'pending', // Primeiras 3 parcelas pagas
                payment_method: 'pix',
                transaction_id: i <= 3 ? `TXN-${String(i).padStart(3, '0')}` : null
            });
        }

        await trx('installments').insert(installmentData);

        // Criar transações de pagamento para as parcelas pagas
        const paymentTransactions = [];
        for (let i = 1; i <= 3; i++) {
            paymentTransactions.push({
                installment_id: i,
                amount: 500.00,
                status: 'completed',
                external_transaction_id: `PAY-${String(i).padStart(3, '0')}`,
                fees: 25.00,
                net_amount: 475.00,
                meta: JSON.stringify({
                    from_user_id: 2, // Alice
                    to_user_id: 3, // Bob
                    payment_method: 'pix',
                    description: `Pagamento parcela ${i}`,
                    loan_id: loanId
                }),
                processed_at: new Date().toISOString()
            });
        }

        await trx('payment_transactions').insert(paymentTransactions);

        // Criar plano de pagamento
        await trx('payment_plans').insert({
            id: 'PLAN-001',
            loan_id: 'LOAN-001',
            amount: 6000.00,
            term_months: 12,
            interest_rate: 0.02,
            payment_timing: 'during_studies',
            status: 'active',
            installments_list: JSON.stringify(installmentData)
        });

        // Criar algumas transações de custódia
        await trx('custody_transactions').insert([
            {
                from_account: 'external_bank',
                to_account: 'user_2',
                amount: 10000.00,
                description: 'Depósito inicial do investidor',
                transaction_type: 'deposit',
                category: 'funding',
                subcategory: 'investor_deposit',
                reference_id: 'DEP-001'
            },
            {
                from_account: 'user_2',
                to_account: 'custody_loan_1',
                amount: 5000.00,
                description: 'Transferência para custódia do empréstimo',
                transaction_type: 'transfer',
                category: 'loan_funding',
                subcategory: 'custody_transfer',
                reference_id: 'LOAN-001'
            },
            {
                from_account: 'custody_loan_1',
                to_account: 'institution_1',
                amount: 5000.00,
                description: 'Liberação para instituição',
                transaction_type: 'transfer',
                category: 'disbursement',
                subcategory: 'institution_transfer',
                reference_id: 'LOAN-001'
            }
        ]);

        // Criar entradas do ledger da Payment API
        await trx('payment_ledger').insert([
            {
                entry_id: 'LED-001',
                from_account: 'user_2',
                to_account: 'user_3',
                amount: 475.00,
                description: 'Pagamento parcela 1 (líquido)',
                category: 'payment',
                subcategory: 'pix',
                reference_id: 'PAY-001'
            },
            {
                entry_id: 'LED-002',
                from_account: 'user_2',
                to_account: 'qi_edu_system',
                amount: 25.00,
                description: 'Taxa QI-EDU - parcela 1',
                category: 'fee',
                subcategory: 'platform_fee',
                reference_id: 'PAY-001'
            }
        ]);

        console.log('Payment API seed data created successfully!');
    });
};
