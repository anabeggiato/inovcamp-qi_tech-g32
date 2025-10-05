const { createServiceLogger } = require('../../../shared/logger');

const logger = createServiceLogger('fraud-analyzer');

/**
 * Fraud Analyzer - Módulo de Análise de Fraude
 * Inspirado no Serasa Experian para análise de histórico de fraudes
 */
class FraudAnalyzer {
    constructor() {
        this.weights = {
            severity: 0.4,        // 40% - Severidade das fraudes
            recency: 0.3,         // 30% - Recência das fraudes
            frequency: 0.3        // 30% - Frequência das fraudes
        };
    }

    /**
     * Busca dados de fraude do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Dados de fraude
     */
    async getFraudData(userId) {
        try {
            const { query } = require('../../../shared/database');

            // Busca dados reais no banco
            const result = await query(`
                SELECT 
                    id,
                    type,
                    severity,
                    payload,
                    created_at
                FROM frauds 
                WHERE user_id = $1 
                ORDER BY created_at DESC
            `, [userId]);

            if (result.rows.length === 0) {
                logger.info(`Nenhuma fraude encontrada para usuário ${userId}`);
                return {
                    frauds: [],
                    totalFrauds: 0,
                    severity: 'none',
                    recency: null,
                    frequency: 0
                };
            }

            // Processa dados reais
            const frauds = result.rows.map(row => ({
                id: row.id,
                type: row.type,
                severity: this.mapSeverity(row.severity),
                date: row.created_at.toISOString().split('T')[0],
                description: row.payload?.description || `Fraude do tipo ${row.type}`,
                resolved: row.payload?.resolved || false
            }));

            const totalFrauds = frauds.length;
            const overallSeverity = this.calculateOverallSeverity(frauds);
            const recency = this.calculateRecency(frauds);
            const frequency = this.calculateFrequency(frauds);

            logger.info(`Dados de fraude reais encontrados para usuário ${userId}:`, {
                totalFrauds,
                overallSeverity,
                recency,
                frequency
            });

            return {
                frauds,
                totalFrauds,
                severity: overallSeverity,
                recency,
                frequency
            };

        } catch (error) {
            logger.error(`Erro ao buscar dados de fraude para usuário ${userId}:`, error);
            return {
                frauds: [],
                totalFrauds: 0,
                severity: 'none',
                recency: null,
                frequency: 0
            };
        }
    }

    mapSeverity(severity) {
        // Mapeia severidade numérica para string
        if (severity >= 4) return 'critical';
        if (severity >= 3) return 'high';
        if (severity >= 2) return 'medium';
        if (severity >= 1) return 'low';
        return 'none';
    }

    /**
     * Calcula score baseado na severidade das fraudes
     * @param {string} severity - Severidade da fraude
     * @returns {number} Score de severidade (0-100)
     */
    calculateSeverityScore(severity) {
        switch (severity) {
            case 'none':
                return 100;
            case 'low':
                return 80;
            case 'medium':
                return 60;
            case 'high':
                return 40;
            case 'critical':
                return 20;
            default:
                return 50;
        }
    }

    /**
     * Calcula score baseado na recência das fraudes
     * @param {number} recency - Recência em dias
     * @returns {number} Score de recência (0-100)
     */
    calculateRecencyScore(recency) {
        if (recency === null) return 100; // Sem fraudes

        if (recency <= 30) return 20;      // Muito recente
        if (recency <= 90) return 40;      // Recente
        if (recency <= 180) return 60;     // Moderadamente recente
        if (recency <= 365) return 80;     // Antigo
        return 90; // Muito antigo
    }

    /**
     * Calcula score baseado na frequência das fraudes
     * @param {number} frequency - Frequência de fraudes
     * @returns {number} Score de frequência (0-100)
     */
    calculateFrequencyScore(frequency) {
        if (frequency === 0) return 100;   // Sem fraudes
        if (frequency <= 0.1) return 80;   // Baixa frequência
        if (frequency <= 0.2) return 60;   // Frequência moderada
        if (frequency <= 0.3) return 40;   // Alta frequência
        if (frequency <= 0.5) return 20;   // Muito alta frequência
        return 10; // Frequência crítica
    }

    /**
     * Calcula severidade geral baseada nas fraudes
     * @param {Array} frauds - Lista de fraudes
     * @returns {string} Severidade geral
     */
    calculateOverallSeverity(frauds) {
        if (frauds.length === 0) return 'none';

        const severities = frauds.map(f => f.severity);
        const severityWeights = {
            'critical': 5,
            'high': 4,
            'medium': 3,
            'low': 2,
            'none': 1
        };

        const weightedSeverity = severities.reduce((sum, severity) => {
            return sum + (severityWeights[severity] || 1);
        }, 0) / severities.length;

        if (weightedSeverity >= 4.5) return 'critical';
        if (weightedSeverity >= 3.5) return 'high';
        if (weightedSeverity >= 2.5) return 'medium';
        if (weightedSeverity >= 1.5) return 'low';
        return 'none';
    }

    /**
     * Calcula recência da fraude mais recente
     * @param {Array} frauds - Lista de fraudes
     * @returns {number} Recência em dias
     */
    calculateRecency(frauds) {
        if (frauds.length === 0) return null;

        const now = new Date();
        const mostRecentFraud = frauds.reduce((latest, fraud) => {
            const fraudDate = new Date(fraud.date);
            return fraudDate > latest ? fraudDate : latest;
        }, new Date(0));

        const diffTime = Math.abs(now - mostRecentFraud);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Calcula frequência de fraudes
     * @param {Array} frauds - Lista de fraudes
     * @returns {number} Frequência de fraudes
     */
    calculateFrequency(frauds) {
        if (frauds.length === 0) return 0;

        // Calcula frequência baseada no número de fraudes por ano
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

        const recentFrauds = frauds.filter(fraud => {
            const fraudDate = new Date(fraud.date);
            return fraudDate >= oneYearAgo;
        });

        return recentFrauds.length / 12; // Fraudes por mês
    }

    /**
     * Calcula score de fraude completo
     * @param {number} userId - ID do usuário
     * @returns {Object} Resultado do cálculo de fraude
     */
    async calculateScore(userId) {
        try {
            logger.info(`Calculando score de fraude para o usuário: ${userId}`);

            const fraudData = await this.getFraudData(userId);

            // Calcula métricas
            const overallSeverity = this.calculateOverallSeverity(fraudData.frauds);
            const recency = this.calculateRecency(fraudData.frauds);
            const frequency = this.calculateFrequency(fraudData.frauds);

            // Calcula scores individuais
            const severityScore = this.calculateSeverityScore(overallSeverity);
            const recencyScore = this.calculateRecencyScore(recency);
            const frequencyScore = this.calculateFrequencyScore(frequency);

            // Calcula score final ponderado
            const fraudScore = (
                severityScore * this.weights.severity +
                recencyScore * this.weights.recency +
                frequencyScore * this.weights.frequency
            );

            const result = {
                score: Math.round(fraudScore * 100) / 100,
                breakdown: {
                    severityScore: Math.round(severityScore * 100) / 100,
                    recencyScore: Math.round(recencyScore * 100) / 100,
                    frequencyScore: Math.round(frequencyScore * 100) / 100,
                    overallSeverity,
                    recency,
                    frequency,
                    totalFrauds: fraudData.totalFrauds,
                    unresolvedFrauds: fraudData.frauds.filter(f => !f.resolved).length
                },
                weight: 0.25, // Peso no score final
                metadata: {
                    fraudTypes: [...new Set(fraudData.frauds.map(f => f.type))],
                    calculationMethod: 'weighted_average',
                    lastUpdated: new Date().toISOString()
                }
            };

            logger.info(`Score de fraude calculado: ${result.score} para usuário ${userId}`);
            return result;

        } catch (error) {
            logger.error(`Erro ao calcular score de fraude para usuário ${userId}:`, error);

            // Retorna score neutro em caso de erro
            return {
                score: 80.0,
                breakdown: {
                    severityScore: 80.0,
                    recencyScore: 80.0,
                    frequencyScore: 80.0,
                    overallSeverity: 'none',
                    recency: null,
                    frequency: 0,
                    totalFrauds: 0,
                    unresolvedFrauds: 0
                },
                weight: 0.25,
                metadata: {
                    fraudTypes: [],
                    calculationMethod: 'error_fallback',
                    lastUpdated: new Date().toISOString(),
                    error: error.message
                }
            };
        }
    }

    /**
     * Gera recomendações baseadas no score de fraude
     * @param {Object} result - Resultado do cálculo
     * @returns {Array} Lista de recomendações
     */
    generateRecommendations(result) {
        const recommendations = [];

        if (result.score < 50) {
            recommendations.push({
                type: 'FRAUD_ALERT',
                message: 'Alto risco de fraude detectado',
                priority: 'CRITICAL',
                action: 'ALERT'
            });
        } else if (result.score < 70) {
            recommendations.push({
                type: 'FRAUD_MONITORING',
                message: 'Aumentar monitoramento antifraude',
                priority: 'HIGH',
                action: 'MONITOR'
            });
        }

        if (result.breakdown.overallSeverity === 'critical') {
            recommendations.push({
                type: 'SEVERITY_ALERT',
                message: 'Fraudes de alta severidade detectadas',
                priority: 'CRITICAL',
                action: 'BLOCK'
            });
        }

        if (result.breakdown.recency <= 30) {
            recommendations.push({
                type: 'RECENCY_ALERT',
                message: 'Fraudes recentes detectadas',
                priority: 'HIGH',
                action: 'MONITOR'
            });
        }

        if (result.breakdown.frequency > 0.2) {
            recommendations.push({
                type: 'FREQUENCY_ALERT',
                message: 'Alta frequência de fraudes',
                priority: 'HIGH',
                action: 'MONITOR'
            });
        }

        if (result.breakdown.unresolvedFrauds > 0) {
            recommendations.push({
                type: 'UNRESOLVED_FRAUDS',
                message: 'Fraudes não resolvidas pendentes',
                priority: 'MEDIUM',
                action: 'RESOLVE'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                type: 'CLEAN_RECORD',
                message: 'Histórico de fraude limpo - manter monitoramento',
                priority: 'LOW',
                action: 'MAINTAIN'
            });
        }

        return recommendations;
    }
}

module.exports = FraudAnalyzer;
