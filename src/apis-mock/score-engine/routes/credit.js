const express = require('express');
const { createServiceLogger } = require('../../shared/logger');
const { createResponse, handleError } = require('../../shared/utils');
const scoreEngine = require('../services/scoreEngine');
const fraudDetector = require('../services/fraudDetector');

const router = express.Router();
const logger = createServiceLogger('credit-routes');

/**
 * POST /credit/analyze
 * Análise de crédito completa (combina score + antifraude)
 */
router.post('/analyze', async (req, res) => {
    try {
        const {
            userId,
            requestedAmount,
            loanTerm,
            transactionData
        } = req.body;

        if (!userId || !requestedAmount) {
            return res.status(400).json(createResponse(false, 'userId e requestedAmount são obrigatórios'));
        }

        logger.info(`Analisando crédito para usuário ${userId}`, { requestedAmount, loanTerm });

        // 1. Calcula score do usuário
        const score = await scoreEngine.calculateScore(userId);

        // 2. Analisa transação se fornecida
        let fraudAnalysis = null;
        if (transactionData) {
            fraudAnalysis = await fraudDetector.analyzeTransaction({
                userId,
                ...transactionData
            });
        }

        // 3. Determina elegibilidade
        const eligibility = determineEligibility(score, fraudAnalysis, requestedAmount);

        // 4. Calcula condições de crédito
        const creditConditions = calculateCreditConditions(score, requestedAmount, loanTerm);

        const analysis = {
            userId,
            requestedAmount,
            loanTerm,
            score: {
                value: score.score,
                band: score.riskBand,
                confidence: score.confidence
            },
            fraudAnalysis,
            eligibility,
            creditConditions,
            analyzedAt: new Date().toISOString()
        };

        res.json(createResponse(true, 'Análise de crédito concluída', analysis));
    } catch (error) {
        logger.error('Erro ao analisar crédito', error);
        res.status(500).json(handleError(error, 'analyze-credit'));
    }
});



// Funções auxiliares

/**
 * Determina elegibilidade para crédito
 */
function determineEligibility(score, fraudAnalysis, requestedAmount) {
    const scoreValue = score.score;
    const riskBand = score.riskBand;

    // Verifica se há análise de fraude
    if (fraudAnalysis && fraudAnalysis.riskLevel === 'CRITICAL') {
        return {
            eligible: false,
            reason: 'Risco crítico de fraude detectado',
            riskLevel: 'CRITICAL'
        };
    }

    if (fraudAnalysis && fraudAnalysis.riskLevel === 'HIGH') {
        return {
            eligible: false,
            reason: 'Alto risco de fraude detectado',
            riskLevel: 'HIGH'
        };
    }

    // Verifica elegibilidade baseada no score
    if (riskBand === 'A' || riskBand === 'B') {
        return {
            eligible: true,
            reason: 'Score excelente ou bom',
            riskLevel: 'LOW'
        };
    }

    if (riskBand === 'C') {
        // Para faixa C, verifica o valor solicitado
        const maxAmount = 15000; // Limite fixo para faixa C
        if (requestedAmount <= maxAmount) {
            return {
                eligible: true,
                reason: 'Score regular, mas valor dentro do limite',
                riskLevel: 'MEDIUM'
            };
        } else {
            return {
                eligible: false,
                reason: 'Valor solicitado excede limite para score regular',
                riskLevel: 'MEDIUM'
            };
        }
    }

    if (riskBand === 'D' || riskBand === 'E') {
        return {
            eligible: false,
            reason: 'Score baixo ou muito baixo',
            riskLevel: 'HIGH'
        };
    }

    return {
        eligible: false,
        reason: 'Score insuficiente',
        riskLevel: 'UNKNOWN'
    };
}

/**
 * Calcula condições de crédito
 */
function calculateCreditConditions(score, requestedAmount, loanTerm) {
    const scoreValue = score.score;
    const riskBand = score.riskBand;

    const baseInterestRate = 0.02; // 2% ao mês base
    let interestRate = baseInterestRate;

    // Ajusta taxa baseada no score
    switch (riskBand) {
        case 'A':
            interestRate = baseInterestRate * 0.8; // 20% de desconto
            break;
        case 'B':
            interestRate = baseInterestRate * 0.9; // 10% de desconto
            break;
        case 'C':
            interestRate = baseInterestRate * 1.1; // 10% de acréscimo
            break;
        case 'D':
            interestRate = baseInterestRate * 1.3; // 30% de acréscimo
            break;
        case 'E':
            interestRate = baseInterestRate * 1.5; // 50% de acréscimo
            break;
    }

    const monthlyPayment = calculateMonthlyPayment(requestedAmount, interestRate, loanTerm);
    const totalAmount = monthlyPayment * loanTerm;
    const totalInterest = totalAmount - requestedAmount;

    return {
        interestRate: Math.round(interestRate * 10000) / 100, // Em %
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        term: loanTerm,
        riskBand
    };
}

/**
 * Calcula pagamento mensal
 */
function calculateMonthlyPayment(principal, monthlyRate, months) {
    if (monthlyRate === 0) {
        return principal / months;
    }

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

    return monthlyPayment;
}



module.exports = router;
