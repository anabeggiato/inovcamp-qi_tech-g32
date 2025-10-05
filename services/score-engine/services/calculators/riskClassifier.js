const { createServiceLogger } = require('../../../shared/logger');

const logger = createServiceLogger('risk-classifier');

/**
 * Risk Classifier - Módulo de Classificação de Risco
 * Inspirado no Serasa Experian para análise de consistência geral e padrões comportamentais
 */
class RiskClassifier {
    constructor() {
        this.weights = {
            consistency: 0.4,      // 40% - Consistência geral
            behavioral: 0.35,     // 35% - Padrões comportamentais
            financial: 0.25       // 25% - Estabilidade financeira
        };
    }

    /**
     * Busca dados de risco do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Dados de risco
     */
    async getRiskData(userId) {
        try {
            // Gera perfil único e consistente baseado no userId
            // Simula dados realistas variando por usuário
            logger.info(`Gerando perfil de risco único para usuário ${userId}`);

            // Usa o userId como seed para gerar dados consistentes
            const seed = userId * 12345; // Seed baseado no userId

            // Gera perfil único baseado no seed
            const profile = this.generateUniqueProfile(seed);

            logger.info(`Perfil gerado para usuário ${userId}:`, {
                riskLevel: profile.riskLevel,
                overallConsistency: profile.consistency.overallConsistency,
                loginPattern: profile.behavioral.loginPattern,
                creditHistory: profile.financial.creditHistory
            });

            return profile;

        } catch (error) {
            logger.error(`Erro ao buscar dados de risco para usuário ${userId}:`, error);
            // Retorna dados neutros em caso de erro
            return this.getDefaultRiskData(userId);
        }
    }

    /**
     * Gera perfil único baseado em seed
     * @param {number} seed - Seed para geração consistente
     * @returns {Object} Perfil de risco único
     */
    generateUniqueProfile(seed) {
        // Função pseudo-aleatória simples baseada em seed
        const random = (min, max) => {
            seed = (seed * 9301 + 49297) % 233280;
            return min + (seed / 233280) * (max - min);
        };

        // Gera valores únicos baseados no seed
        const baseConsistency = random(0.4, 0.95);
        const baseBehavioral = random(0.5, 0.9);
        const baseFinancial = random(0.3, 0.85);

        // Determina nível de risco baseado nos valores gerados
        const avgScore = (baseConsistency + baseBehavioral + baseFinancial) / 3;
        let riskLevel = 'medium';
        if (avgScore >= 0.8) riskLevel = 'low';
        else if (avgScore >= 0.6) riskLevel = 'medium';
        else if (avgScore >= 0.4) riskLevel = 'high';
        else riskLevel = 'very_high';

        // Gera padrões comportamentais baseados no seed
        const loginPatterns = ['regular', 'irregular', 'erratic', 'suspicious'];
        const activityLevels = ['high', 'medium', 'low', 'very_low'];
        const expensePatterns = ['stable', 'variable', 'unstable', 'erratic'];
        const creditHistories = ['excellent', 'good', 'fair', 'poor', 'very_poor'];

        const loginPattern = loginPatterns[Math.floor(random(0, loginPatterns.length))];
        const activityLevel = activityLevels[Math.floor(random(0, activityLevels.length))];
        const expensePattern = expensePatterns[Math.floor(random(0, expensePatterns.length))];
        const creditHistory = creditHistories[Math.floor(random(0, creditHistories.length))];

        return {
            riskLevel,
            consistency: {
                academicConsistency: baseConsistency,
                attendanceConsistency: baseConsistency + random(-0.1, 0.1),
                paymentConsistency: baseConsistency + random(-0.15, 0.05),
                overallConsistency: baseConsistency
            },
            behavioral: {
                loginPattern,
                activityLevel,
                deviceStability: baseBehavioral,
                locationStability: baseBehavioral + random(-0.1, 0.1)
            },
            financial: {
                incomeStability: baseFinancial,
                expensePattern,
                creditHistory,
                debtToIncome: random(0.2, 0.8)
            }
        };
    }

    /**
     * Retorna dados padrão em caso de erro
     * @param {number} userId - ID do usuário
     * @returns {Object} Dados padrão
     */
    getDefaultRiskData(userId) {
        return {
            riskLevel: 'medium',
            consistency: {
                academicConsistency: 0.70,
                attendanceConsistency: 0.70,
                paymentConsistency: 0.70,
                overallConsistency: 0.70
            },
            behavioral: {
                loginPattern: 'regular',
                activityLevel: 'medium',
                deviceStability: 0.70,
                locationStability: 0.70
            },
            financial: {
                incomeStability: 0.70,
                expensePattern: 'stable',
                creditHistory: 'fair',
                debtToIncome: 0.40
            }
        };
    }

    /**
     * Calcula score baseado na consistência geral
     * @param {number} consistency - Consistência geral
     * @returns {number} Score de consistência (0-100)
     */
    calculateConsistencyScore(consistency) {
        return Math.round(consistency * 100);
    }

    /**
     * Calcula score baseado nos padrões comportamentais
     * @param {Object} behavioral - Dados comportamentais
     * @returns {number} Score comportamental (0-100)
     */
    calculateBehavioralScore(behavioral) {
        let score = 0;

        // Padrão de login
        switch (behavioral.loginPattern) {
            case 'regular': score += 30; break;
            case 'irregular': score += 20; break;
            case 'erratic': score += 10; break;
            case 'suspicious': score += 5; break;
        }

        // Nível de atividade
        switch (behavioral.activityLevel) {
            case 'high': score += 30; break;
            case 'medium': score += 20; break;
            case 'low': score += 10; break;
            case 'very_low': score += 5; break;
        }

        // Estabilidade de dispositivo e localização
        score += (behavioral.deviceStability + behavioral.locationStability) * 20;

        return Math.min(100, Math.round(score));
    }

    /**
     * Calcula score baseado na estabilidade financeira
     * @param {Object} financial - Dados financeiros
     * @returns {number} Score financeiro (0-100)
     */
    calculateFinancialScore(financial) {
        let score = 0;

        // Estabilidade de renda
        score += financial.incomeStability * 30;

        // Padrão de gastos
        switch (financial.expensePattern) {
            case 'stable': score += 25; break;
            case 'variable': score += 15; break;
            case 'unstable': score += 10; break;
            case 'erratic': score += 5; break;
        }

        // Histórico de crédito
        switch (financial.creditHistory) {
            case 'excellent': score += 25; break;
            case 'good': score += 20; break;
            case 'fair': score += 15; break;
            case 'poor': score += 10; break;
            case 'very_poor': score += 5; break;
        }

        // Relação dívida/renda (menor é melhor)
        score += (1 - financial.debtToIncome) * 20;

        return Math.min(100, Math.round(score));
    }

    /**
     * Calcula score de risco completo
     * @param {number} userId - ID do usuário
     * @returns {Object} Score de risco com breakdown
     */
    async calculateScore(userId) {
        try {
            logger.info(`Calculando score de risco para o usuário: ${userId}`);

            const riskData = await this.getRiskData(userId);

            // Calcula scores individuais
            const consistencyScore = this.calculateConsistencyScore(riskData.consistency.overallConsistency);
            const behavioralScore = this.calculateBehavioralScore(riskData.behavioral);
            const financialScore = this.calculateFinancialScore(riskData.financial);

            // Score final ponderado
            const finalScore = Math.round((
                consistencyScore * this.weights.consistency +
                behavioralScore * this.weights.behavioral +
                financialScore * this.weights.financial
            ));

            const result = {
                score: finalScore,
                breakdown: {
                    consistencyScore,
                    behavioralScore,
                    financialScore,
                    overallConsistency: riskData.consistency.overallConsistency,
                    loginPattern: riskData.behavioral.loginPattern,
                    activityLevel: riskData.behavioral.activityLevel,
                    deviceStability: riskData.behavioral.deviceStability,
                    locationStability: riskData.behavioral.locationStability,
                    incomeStability: riskData.financial.incomeStability,
                    expensePattern: riskData.financial.expensePattern,
                    creditHistory: riskData.financial.creditHistory,
                    debtToIncome: riskData.financial.debtToIncome
                }
            };

            logger.info(`Score de risco calculado: ${finalScore} para usuário ${userId}`);
            return result;

        } catch (error) {
            logger.error(`Erro ao calcular score de risco para usuário ${userId}:`, error);
            throw error;
        }
    }
}

module.exports = RiskClassifier;