const matchingExecutionService = require('../services/matching-execution.service');

/**
 * Controlador para execução de matches P2P
 */

/**
 * Executa um match entre investidor e empréstimo
 * POST /api/investors/:investorId/offers/:offerId/execute-match
 */
async function executeMatch(req, res) {
    try {
        const { investorId, offerId } = req.params;
        const { loan_id, investment_amount, rate } = req.body;

        // Validar parâmetros
        if (!investorId || !offerId || !loan_id || !investment_amount) {
            return res.status(400).json({
                success: false,
                message: 'Parâmetros obrigatórios: investorId, offerId, loan_id, investment_amount'
            });
        }

        // Converter para números
        const investorIdNum = parseInt(investorId);
        const offerIdNum = parseInt(offerId);
        const loanIdNum = parseInt(loan_id);
        const investmentAmountNum = parseFloat(investment_amount);
        const rateNum = rate ? parseFloat(rate) : null;

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

        // Executar match
        const result = await matchingExecutionService.executeMatch(
            investorIdNum,
            offerIdNum,
            loanIdNum,
            investmentAmountNum,
            rateNum
        );

        res.status(201).json({
            success: true,
            message: 'Match executado com sucesso',
            data: result
        });

    } catch (error) {
        console.error('Erro ao executar match:', error);

        if (error.message.includes('não encontrado') || error.message.includes('não está pendente')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('excede') || error.message.includes('menor que')) {
            return res.status(400).json({
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
 * Busca matches de um empréstimo
 * GET /api/loans/:loanId/matches
 */
async function getLoanMatches(req, res) {
    try {
        const { loanId } = req.params;

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

        const matches = await matchingExecutionService.getLoanMatches(loanIdNum);

        res.status(200).json({
            success: true,
            data: {
                loan_id: loanIdNum,
                matches: matches,
                total_matches: matches.length,
                total_invested: matches.reduce((sum, match) => sum + parseFloat(match.amount_matched), 0)
            }
        });

    } catch (error) {
        console.error('Erro ao buscar matches do empréstimo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * Busca matches de um investidor
 * GET /api/investors/:investorId/matches
 */
async function getInvestorMatches(req, res) {
    try {
        const { investorId } = req.params;

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

        const matches = await matchingExecutionService.getInvestorMatches(investorIdNum);

        res.status(200).json({
            success: true,
            data: {
                investor_id: investorIdNum,
                matches: matches,
                total_matches: matches.length,
                total_invested: matches.reduce((sum, match) => sum + parseFloat(match.amount_matched), 0),
                average_rate: matches.length > 0
                    ? matches.reduce((sum, match) => sum + parseFloat(match.rate), 0) / matches.length
                    : 0
            }
        });

    } catch (error) {
        console.error('Erro ao buscar matches do investidor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    executeMatch,
    getLoanMatches,
    getInvestorMatches
};
