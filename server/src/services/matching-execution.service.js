const { db: knex } = require('../../db');

/**
 * Serviço para execução de matches P2P
 * Implementa a lógica para salvar matches no banco de dados
 */

/**
 * Executa um match entre um investidor e um empréstimo
 * @param {number} investorId - ID do investidor
 * @param {number} offerId - ID da oferta
 * @param {number} loanId - ID do empréstimo
 * @param {number} investmentAmount - Valor do investimento
 * @param {number} rate - Taxa acordada (opcional, usa taxa efetiva se não informada)
 * @returns {Object} Resultado da execução do match
 */
async function executeMatch(investorId, offerId, loanId, investmentAmount, rate = null) {
    const trx = await knex.transaction();

    try {
        console.log(`🔄 Executando match: Investidor ${investorId}, Oferta ${offerId}, Empréstimo ${loanId}, Valor R$ ${investmentAmount}`);

        // 1. Validar se o match é viável
        const validation = await validateInvestment(investorId, offerId, loanId, investmentAmount);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // 2. Buscar dados da oferta e empréstimo
        const offer = await trx('offers')
            .where({ id: offerId, investor_id: investorId })
            .first();

        const loan = await trx('loans')
            .where({ id: loanId, status: 'pending' })
            .first();

        if (!offer || !loan) {
            throw new Error('Oferta ou empréstimo não encontrado');
        }

        // 3. Calcular taxa efetiva se não informada
        if (!rate) {
            const spreadAnnual = parseFloat(loan.spread_pct_annual) || 0;
            const custodyAnnual = (parseFloat(loan.custody_pct_monthly) || 0) * 12;
            const originationAnnual = (parseFloat(loan.origination_pct) || 0) / (parseFloat(loan.term_months) || 1) * 12;
            rate = spreadAnnual + custodyAnnual + originationAnnual;
        }

        // 4. Criar o match
        const [match] = await trx('matches').insert({
            loan_id: loanId,
            offer_id: offerId,
            amount_matched: investmentAmount,
            rate: rate
        }).returning('*');

        console.log(`✅ Match criado com ID: ${match.id}`);

        // 5. Atualizar valor financiado do empréstimo
        const newAmountFunded = parseFloat(loan.amount_funded || 0) + parseFloat(investmentAmount);
        await trx('loans')
            .where('id', loanId)
            .update({
                amount_funded: newAmountFunded,
                updated_at: knex.fn.now()
            });

        console.log(`📊 Empréstimo ${loanId}: R$ ${loan.amount_funded || 0} → R$ ${newAmountFunded} financiado`);

        // 6. Atualizar valor disponível da oferta
        const newAmountAvailable = parseFloat(offer.amount_available) - parseFloat(investmentAmount);
        await trx('offers')
            .where('id', offerId)
            .update({
                amount_available: newAmountAvailable,
                updated_at: knex.fn.now()
            });

        console.log(`💰 Oferta ${offerId}: R$ ${offer.amount_available} → R$ ${newAmountAvailable} disponível`);

        // 7. Verificar se o empréstimo foi totalmente financiado
        const totalAmount = parseFloat(loan.amount);
        const isFullyFunded = newAmountFunded >= totalAmount;

        if (isFullyFunded) {
            await trx('loans')
                .where('id', loanId)
                .update({
                    status: 'matched',
                    updated_at: knex.fn.now()
                });
            console.log(`🎉 Empréstimo ${loanId} totalmente financiado! Status alterado para 'matched'`);
        }

        // 8. Verificar se a oferta foi totalmente utilizada
        const isOfferExhausted = newAmountAvailable <= 0;
        if (isOfferExhausted) {
            console.log(`⚠️ Oferta ${offerId} totalmente utilizada`);
        }

        await trx.commit();

        return {
            success: true,
            match: {
                id: match.id,
                loan_id: loanId,
                offer_id: offerId,
                amount_matched: investmentAmount,
                rate: rate,
                created_at: match.created_at
            },
            loan_updated: {
                id: loanId,
                amount_funded: newAmountFunded,
                amount_remaining: totalAmount - newAmountFunded,
                status: isFullyFunded ? 'matched' : 'pending'
            },
            offer_updated: {
                id: offerId,
                amount_available: newAmountAvailable,
                is_exhausted: isOfferExhausted
            }
        };

    } catch (error) {
        await trx.rollback();
        console.error('❌ Erro ao executar match:', error);
        throw error;
    }
}

/**
 * Valida se um investimento é viável (reutiliza lógica do matching.service.js)
 */
async function validateInvestment(investorId, offerId, loanId, investmentAmount) {
    try {
        // Buscar oferta
        const offer = await knex('offers')
            .where({ id: offerId, investor_id: investorId })
            .first();

        if (!offer) {
            return { valid: false, error: 'Oferta não encontrada' };
        }

        // Buscar empréstimo
        const loan = await knex('loans')
            .where({ id: loanId, status: 'pending' })
            .first();

        if (!loan) {
            return { valid: false, error: 'Empréstimo não encontrado ou não está pendente' };
        }

        // Validar valor disponível na oferta
        if (parseFloat(offer.amount_available) < investmentAmount) {
            return { valid: false, error: 'Valor solicitado excede o disponível na oferta' };
        }

        // Validar valor restante do empréstimo
        const amountRemaining = parseFloat(loan.amount) - parseFloat(loan.amount_funded || 0);
        if (amountRemaining < investmentAmount) {
            return { valid: false, error: 'Valor solicitado excede o restante do empréstimo' };
        }

        // Validar prazo
        if (loan.term_months > offer.term_months) {
            return { valid: false, error: 'Prazo do empréstimo excede o aceito pela oferta' };
        }

        // Validar taxa mínima
        const spreadAnnual = parseFloat(loan.spread_pct_annual) || 0;
        const custodyAnnual = (parseFloat(loan.custody_pct_monthly) || 0) * 12;
        const originationAnnual = (parseFloat(loan.origination_pct) || 0) / (parseFloat(loan.term_months) || 1) * 12;
        const effectiveRate = spreadAnnual + custodyAnnual + originationAnnual;

        if (effectiveRate < parseFloat(offer.min_rate)) {
            return { valid: false, error: 'Taxa efetiva do empréstimo é menor que a mínima aceita' };
        }

        return { valid: true };

    } catch (error) {
        console.error('Erro ao validar investimento:', error);
        return { valid: false, error: 'Erro interno do servidor' };
    }
}

/**
 * Busca matches de um empréstimo específico
 * @param {number} loanId - ID do empréstimo
 * @returns {Array} Lista de matches do empréstimo
 */
async function getLoanMatches(loanId) {
    try {
        const matches = await knex('matches')
            .select([
                'matches.*',
                'offers.investor_id',
                'users.name as investor_name',
                'users.email as investor_email'
            ])
            .join('offers', 'matches.offer_id', 'offers.id')
            .join('users', 'offers.investor_id', 'users.id')
            .where('matches.loan_id', loanId)
            .orderBy('matches.created_at', 'asc');

        return matches;
    } catch (error) {
        console.error('Erro ao buscar matches do empréstimo:', error);
        throw error;
    }
}

/**
 * Busca matches de um investidor específico
 * @param {number} investorId - ID do investidor
 * @returns {Array} Lista de matches do investidor
 */
async function getInvestorMatches(investorId) {
    try {
        const matches = await knex('matches')
            .select([
                'matches.*',
                'loans.borrower_id',
                'loans.amount as loan_amount',
                'loans.term_months',
                'users.name as borrower_name',
                'users.email as borrower_email'
            ])
            .join('offers', 'matches.offer_id', 'offers.id')
            .join('loans', 'matches.loan_id', 'loans.id')
            .join('users', 'loans.borrower_id', 'users.id')
            .where('offers.investor_id', investorId)
            .orderBy('matches.created_at', 'desc');

        return matches;
    } catch (error) {
        console.error('Erro ao buscar matches do investidor:', error);
        throw error;
    }
}

module.exports = {
    executeMatch,
    validateInvestment,
    getLoanMatches,
    getInvestorMatches
};
