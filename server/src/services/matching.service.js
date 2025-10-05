const { db: knex } = require('../../db');

/**
 * Serviço de Matching P2P para a plataforma QI-EDU
 * Implementa a lógica para encontrar empréstimos elegíveis para uma oferta de investidor
 */

/**
 * Calcula a taxa efetiva de um empréstimo
 * @param {Object} loan - Objeto do empréstimo com as taxas
 * @returns {number} Taxa efetiva anual em percentual
 */
function calculateEffectiveRate(loan) {
    const spreadAnnual = parseFloat(loan.spread_pct_annual) || 0;
    const custodyAnnual = (parseFloat(loan.custody_pct_monthly) || 0) * 12;
    const originationAnnual = (parseFloat(loan.origination_pct) || 0) / (parseFloat(loan.term_months) || 1) * 12;

    return spreadAnnual + custodyAnnual + originationAnnual;
}

/**
 * Busca empréstimos elegíveis para uma oferta específica de investidor
 * @param {number} investorId - ID do investidor
 * @param {number} offerId - ID da oferta do investidor
 * @returns {Array} Lista de empréstimos elegíveis
 */
async function getEligibleLoansForInvestorOffer(investorId, offerId) {
    try {
        // Primeiro, buscar a oferta do investidor para validar os critérios
        const offer = await knex('offers')
            .where({ id: offerId, investor_id: investorId })
            .first();

        if (!offer) {
            throw new Error('Oferta não encontrada ou não pertence ao investidor');
        }

        // Verificar se a oferta ainda tem valor disponível
        if (parseFloat(offer.amount_available) <= 0) {
            return []; // Oferta sem valor disponível
        }

        // Buscar empréstimos elegíveis com JOINs necessários
        const eligibleLoans = await knex('loans')
            .select([
                'loans.id as loan_id',
                'loans.borrower_id',
                'loans.amount as amount_requested',
                'loans.amount_funded',
                'loans.term_months',
                'loans.status',
                'loans.origination_pct',
                'loans.marketplace_pct',
                'loans.custody_pct_monthly',
                'loans.spread_pct_annual',
                'loans.contract_json',
                'users.name as borrower_name',
                'scores.score',
                'scores.risk_band',
                'institutions.name as school_name'
            ])
            .leftJoin('users', 'loans.borrower_id', 'users.id')
            .leftJoin('scores', 'loans.borrower_id', 'scores.user_id')
            .leftJoin('institutions', 'loans.school_id', 'institutions.id')
            .where('loans.status', 'pending')
            .where('users.role', 'student')
            .where(function () {
                // Filtro de valor: empréstimo deve ter valor restante > 0
                this.whereRaw('(loans.amount - COALESCE(loans.amount_funded, 0)) > 0');
            })
            .where(function () {
                // Filtro de prazo: prazo do empréstimo deve ser <= prazo da oferta
                this.where('loans.term_months', '<=', offer.term_months);
            })
            .where(function () {
                // Filtro de score/risco: score deve ser > 40 e risk_band não deve ser 'high'
                this.where('scores.score', '>', 40)
                    .andWhere('scores.risk_band', '!=', 'high');
            });

        // Filtrar por taxa efetiva e processar resultados
        const processedLoans = eligibleLoans
            .map(loan => {
                // Calcular valor restante
                const amountRemaining = parseFloat(loan.amount_requested) - parseFloat(loan.amount_funded || 0);

                // Calcular taxa efetiva
                const loanEffectiveRate = calculateEffectiveRate(loan);

                // Verificar se a taxa efetiva atende ao critério mínimo da oferta
                if (loanEffectiveRate < parseFloat(offer.min_rate)) {
                    return null; // Empréstimo não atende critério de taxa mínima
                }

                // Extrair informações adicionais do contract_json
                let purpose = null;
                try {
                    const contractData = typeof loan.contract_json === 'string'
                        ? JSON.parse(loan.contract_json)
                        : loan.contract_json || {};
                    purpose = contractData.purpose || null;
                } catch (error) {
                    console.warn('Erro ao parsear contract_json:', error);
                }

                return {
                    loan_id: loan.loan_id,
                    borrower_id: loan.borrower_id,
                    borrower_name: loan.borrower_name,
                    amount_requested: parseFloat(loan.amount_requested),
                    amount_remaining: amountRemaining,
                    term_months: loan.term_months,
                    score: loan.score,
                    risk_band: loan.risk_band,
                    loan_effective_rate: loanEffectiveRate,
                    school_name: loan.school_name,
                    purpose: purpose,
                    // Informações adicionais para o investidor
                    max_investment_amount: Math.min(amountRemaining, parseFloat(offer.amount_available)),
                    offer_min_rate: parseFloat(offer.min_rate),
                    offer_term_months: offer.term_months
                };
            })
            .filter(loan => loan !== null) // Remover empréstimos que não passaram no filtro de taxa
            .sort((a, b) => {
                // Ordenação: primeiro por risk_band (low < medium < high), depois por score decrescente
                const riskOrder = { 'low': 1, 'medium': 2, 'high': 3 };
                const riskComparison = riskOrder[a.risk_band] - riskOrder[b.risk_band];

                if (riskComparison !== 0) {
                    return riskComparison;
                }

                return b.score - a.score; // Score decrescente
            });

        return processedLoans;

    } catch (error) {
        console.error('Erro ao buscar empréstimos elegíveis:', error);
        throw error;
    }
}

/**
 * Busca informações detalhadas de um empréstimo específico
 * @param {number} loanId - ID do empréstimo
 * @returns {Object|null} Informações detalhadas do empréstimo
 */
async function getLoanDetails(loanId) {
    try {
        const loan = await knex('loans')
            .select([
                'loans.*',
                'users.name as borrower_name',
                'users.email as borrower_email',
                'scores.score',
                'scores.risk_band',
                'scores.reason_json',
                'institutions.name as school_name',
                'academic_performance.grade_avg',
                'academic_performance.attendance_pct',
                'academic_performance.status as academic_status'
            ])
            .leftJoin('users', 'loans.borrower_id', 'users.id')
            .leftJoin('scores', 'loans.borrower_id', 'scores.user_id')
            .leftJoin('institutions', 'loans.school_id', 'institutions.id')
            .leftJoin('academic_performance', function () {
                this.on('loans.borrower_id', '=', 'academic_performance.user_id')
                    .andOn('loans.school_id', '=', 'academic_performance.school_id');
            })
            .where('loans.id', loanId)
            .first();

        if (!loan) {
            return null;
        }

        // Processar informações adicionais
        const amountRemaining = parseFloat(loan.amount) - parseFloat(loan.amount_funded || 0);
        const effectiveRate = calculateEffectiveRate(loan);

        let contractData = {};
        try {
            contractData = loan.contract_json ? JSON.parse(loan.contract_json) : {};
        } catch (error) {
            console.warn('Erro ao parsear contract_json:', error);
        }

        let scoreReason = {};
        try {
            scoreReason = loan.reason_json ? JSON.parse(loan.reason_json) : {};
        } catch (error) {
            console.warn('Erro ao parsear reason_json:', error);
        }

        return {
            ...loan,
            amount_remaining: amountRemaining,
            loan_effective_rate: effectiveRate,
            contract_data: contractData,
            score_reason: scoreReason
        };

    } catch (error) {
        console.error('Erro ao buscar detalhes do empréstimo:', error);
        throw error;
    }
}

/**
 * Valida se um investidor pode investir em um empréstimo específico
 * @param {number} investorId - ID do investidor
 * @param {number} offerId - ID da oferta
 * @param {number} loanId - ID do empréstimo
 * @param {number} investmentAmount - Valor do investimento
 * @returns {Object} Resultado da validação
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
        const effectiveRate = calculateEffectiveRate(loan);
        if (effectiveRate < parseFloat(offer.min_rate)) {
            return { valid: false, error: 'Taxa efetiva do empréstimo é menor que a mínima aceita' };
        }

        return { valid: true };

    } catch (error) {
        console.error('Erro ao validar investimento:', error);
        return { valid: false, error: 'Erro interno do servidor' };
    }
}

module.exports = {
    getEligibleLoansForInvestorOffer,
    getLoanDetails,
    validateInvestment,
    calculateEffectiveRate
};
