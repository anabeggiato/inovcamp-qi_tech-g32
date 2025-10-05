/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void>} 
 */
exports.seed = async function (knex) {
    // Deletar dados existentes
    await knex('loan_installments').del();

    // Buscar empréstimos existentes
    const loans = await knex('loans').select('id', 'amount', 'term_months');

    if (loans.length === 0) {
        console.log('⚠️ Nenhum empréstimo encontrado para criar parcelas');
        return;
    }

    const installments = [];

    for (const loan of loans) {
        const installmentAmount = parseFloat(loan.amount) / loan.term_months;
        const today = new Date();

        for (let i = 1; i <= loan.term_months; i++) {
            const dueDate = new Date(today);
            dueDate.setMonth(dueDate.getMonth() + i);

            // Criar algumas parcelas vencidas para teste
            let status = 'pending';
            if (i <= 2) {
                status = 'pending'; // Parcelas futuras
            } else if (i === 3) {
                status = 'pending'; // Parcela vencida hoje
                dueDate.setDate(dueDate.getDate() - 1);
            } else if (i === 4) {
                status = 'overdue'; // Parcela atrasada
                dueDate.setDate(dueDate.getDate() - 5);
            }

            installments.push({
                loan_id: loan.id,
                installment_number: i,
                amount: installmentAmount,
                due_date: dueDate,
                status: status,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
    }

    // Inserir parcelas
    await knex('loan_installments').insert(installments);

    console.log(`✅ ${installments.length} parcelas criadas para ${loans.length} empréstimos`);
};
