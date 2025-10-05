const matchingService = require('../services/matching.service');

/**
 * Controlador para funcionalidades de matching P2P
 */

/**
 * Busca empréstimos elegíveis para uma oferta específica de investidor
 * GET /api/investors/:investorId/offers/:offerId/eligible-loans
 */
async function getEligibleLoans(req, res) {
    try {
        const { investorId, offerId } = req.params;

        // Validar parâmetros
        if (!investorId || !offerId) {
            return res.status(400).json({
                success: false,
                message: 'ID do investidor e ID da oferta são obrigatórios'
            });
        }

        // Converter para números
        const investorIdNum = parseInt(investorId);
        const offerIdNum = parseInt(offerId);

        if (isNaN(investorIdNum) || isNaN(offerIdNum)) {
            return res.status(400).json({
                success: false,
                message: 'IDs devem ser números válidos'
            });
        }

        // Buscar empréstimos elegíveis
        const eligibleLoans = await matchingService.getEligibleLoansForInvestorOffer(
            investorIdNum,
            offerIdNum
        );

        res.status(200).json({
            success: true,
            data: {
                eligible_loans: eligibleLoans,
                total_count: eligibleLoans.length,
                investor_id: investorIdNum,
                offer_id: offerIdNum
            }
        });

    } catch (error) {
        console.error('Erro ao buscar empréstimos elegíveis:', error);

        if (error.message === 'Oferta não encontrada ou não pertence ao investidor') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * Busca detalhes de um empréstimo específico
 * GET /api/loans/:loanId/details
 */
async function getLoanDetails(req, res) {
    try {
        const { loanId } = req.params;

        // Validar parâmetro
        if (!loanId) {
            return res.status(400).json({
                success: false,
                message: 'ID do empréstimo é obrigatório'
            });
        }

        const loanIdNum = parseInt(loanId);
        if (isNaN(loanIdNum)) {
            return res.status(400).json({
                success: false,
                message: 'ID do empréstimo deve ser um número válido'
            });
        }

        // Buscar detalhes do empréstimo
        const loanDetails = await matchingService.getLoanDetails(loanIdNum);

        if (!loanDetails) {
            return res.status(404).json({
                success: false,
                message: 'Empréstimo não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: loanDetails
        });

    } catch (error) {
        console.error('Erro ao buscar detalhes do empréstimo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * Valida se um investimento é viável
 * POST /api/investors/:investorId/offers/:offerId/validate-investment
 */
async function validateInvestment(req, res) {
    try {
        const { investorId, offerId } = req.params;
        const { loan_id, investment_amount } = req.body;

        // Validar parâmetros
        if (!investorId || !offerId || !loan_id || !investment_amount) {
            return res.status(400).json({
                success: false,
                message: 'Todos os parâmetros são obrigatórios: investorId, offerId, loan_id, investment_amount'
            });
        }

        // Converter para números
        const investorIdNum = parseInt(investorId);
        const offerIdNum = parseInt(offerId);
        const loanIdNum = parseInt(loan_id);
        const investmentAmountNum = parseFloat(investment_amount);

        if (isNaN(investorIdNum) || isNaN(offerIdNum) || isNaN(loanIdNum) || isNaN(investmentAmountNum)) {
            return res.status(400).json({
                success: false,
                message: 'Todos os valores devem ser números válidos'
            });
        }

        if (investmentAmountNum <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valor do investimento deve ser maior que zero'
            });
        }

        // Validar investimento
        const validation = await matchingService.validateInvestment(
            investorIdNum,
            offerIdNum,
            loanIdNum,
            investmentAmountNum
        );

        res.status(200).json({
            success: true,
            data: {
                valid: validation.valid,
                error: validation.error || null,
                investor_id: investorIdNum,
                offer_id: offerIdNum,
                loan_id: loanIdNum,
                investment_amount: investmentAmountNum
            }
        });

    } catch (error) {
        console.error('Erro ao validar investimento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * Busca estatísticas de matching para um investidor
 * GET /api/investors/:investorId/matching-stats
 */
async function getMatchingStats(req, res) {
    try {
        const { investorId } = req.params;

        // Validar parâmetro
        if (!investorId) {
            return res.status(400).json({
                success: false,
                message: 'ID do investidor é obrigatório'
            });
        }

        const investorIdNum = parseInt(investorId);
        if (isNaN(investorIdNum)) {
            return res.status(400).json({
                success: false,
                message: 'ID do investidor deve ser um número válido'
            });
        }

        // Buscar ofertas do investidor
        const knex = require('../../db');
        const offers = await knex('offers')
            .where('investor_id', investorIdNum)
            .select('id', 'amount_available', 'term_months', 'min_rate');

        // Calcular estatísticas
        const totalOffers = offers.length;
        const totalAmountAvailable = offers.reduce((sum, offer) =>
            sum + parseFloat(offer.amount_available), 0
        );

        // Buscar matches existentes
        const matches = await knex('matches')
            .join('offers', 'matches.offer_id', 'offers.id')
            .where('offers.investor_id', investorIdNum)
            .select('matches.amount_matched', 'matches.rate');

        const totalInvested = matches.reduce((sum, match) =>
            sum + parseFloat(match.amount_matched), 0
        );

        const avgRate = matches.length > 0
            ? matches.reduce((sum, match) => sum + parseFloat(match.rate), 0) / matches.length
            : 0;

        res.status(200).json({
            success: true,
            data: {
                investor_id: investorIdNum,
                total_offers: totalOffers,
                total_amount_available: totalAmountAvailable,
                total_invested: totalInvested,
                total_matches: matches.length,
                average_rate: avgRate,
                offers: offers
            }
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas de matching:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    getEligibleLoans,
    getLoanDetails,
    validateInvestment,
    getMatchingStats
};
