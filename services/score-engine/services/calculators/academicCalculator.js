const { createServiceLogger } = require('../../../shared/logger');

const logger = createServiceLogger('academic-calculator');

/**
 * Academic Calculator - Módulo de Análise Acadêmica
 * Inspirado no Serasa Experian para análise de performance acadêmica
 */
class AcademicCalculator {
    constructor() {
        this.weights = {
            gradeAverage: 0.5,    // 50% - Média de notas
            consistency: 0.3,     // 30% - Consistência nas notas
            evolution: 0.2        // 20% - Evolução acadêmica
        };
    }

    /**
     * Busca dados acadêmicos do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Dados acadêmicos
     */
    async getAcademicPerformance(userId) {
        try {
            const { query } = require('../../../shared/database');

            // Busca dados reais no banco
            const result = await query(`
                SELECT 
                    grade_avg,
                    attendance_pct,
                    status,
                    meta,
                    created_at
                FROM academic_performance 
                WHERE user_id = $1 
                ORDER BY created_at DESC 
                LIMIT 5
            `, [userId]);

            if (result.rows.length === 0) {
                logger.warn(`Nenhum dado acadêmico encontrado para usuário ${userId}, usando dados padrão`);
                return this.getDefaultAcademicData(userId);
            }

            // Processa dados reais
            const performances = result.rows;
            const grade_avg = performances[0].grade_avg || 7.0;
            const grades_history = performances.map(p => p.grade_avg).filter(g => g !== null);
            const grades_trend = [...grades_history].reverse(); // Mais recente primeiro

            logger.info(`Dados acadêmicos reais encontrados para usuário ${userId}:`, {
                grade_avg,
                total_records: performances.length,
                grades_history
            });

            return {
                grade_avg,
                grades_history: grades_history.length > 0 ? grades_history : [grade_avg],
                grades_trend: grades_trend.length > 0 ? grades_trend : [grade_avg],
                consistency: this.calculateConsistency(grades_history.length > 0 ? grades_history : [grade_avg]) / 100,
                evolution: this.calculateEvolution(grades_trend.length > 0 ? grades_trend : [grade_avg]) / 100
            };

        } catch (error) {
            logger.error(`Erro ao buscar dados acadêmicos para usuário ${userId}:`, error);
            return this.getDefaultAcademicData(userId);
        }
    }

    getDefaultAcademicData(userId) {
        // Dados padrão baseados no ID do usuário para consistência
        const profiles = [
            { grade_avg: 9.2, grades_history: [8.5, 9.0, 9.2, 9.5, 9.0] },
            { grade_avg: 8.1, grades_history: [7.5, 8.0, 8.2, 8.5, 8.0] },
            { grade_avg: 7.3, grades_history: [6.5, 7.0, 7.5, 7.8, 7.0] },
            { grade_avg: 7.8, grades_history: [9.0, 6.5, 8.5, 7.0, 8.5] }
        ];

        const profileIndex = userId % profiles.length;
        const profile = profiles[profileIndex];

        return {
            grade_avg: profile.grade_avg,
            grades_history: profile.grades_history,
            grades_trend: [...profile.grades_history].reverse(),
            consistency: 0.70,
            evolution: 0.70
        };
    }

    /**
     * Calcula score baseado na média de notas
     * @param {number} gradeAvg - Média de notas
     * @returns {number} Score (0-100)
     */
    calculateGradeScore(gradeAvg) {
        if (gradeAvg >= 9.5) return 100;
        if (gradeAvg >= 9.0) return 95;
        if (gradeAvg >= 8.5) return 90;
        if (gradeAvg >= 8.0) return 85;
        if (gradeAvg >= 7.5) return 80;
        if (gradeAvg >= 7.0) return 75;
        if (gradeAvg >= 6.5) return 70;
        if (gradeAvg >= 6.0) return 65;
        if (gradeAvg >= 5.5) return 60;
        if (gradeAvg >= 5.0) return 55;
        if (gradeAvg >= 4.5) return 50;
        if (gradeAvg >= 4.0) return 45;
        if (gradeAvg >= 3.5) return 40;
        if (gradeAvg >= 3.0) return 35;
        if (gradeAvg >= 2.5) return 30;
        if (gradeAvg >= 2.0) return 25;
        if (gradeAvg >= 1.5) return 20;
        if (gradeAvg >= 1.0) return 15;
        return 10; // Abaixo de 1.0
    }

    /**
     * Calcula variância dos dados
     * @param {Array} data - Array de números
     * @returns {number} Variância
     */
    calculateVariance(data) {
        if (data.length === 0) return 0;

        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;

        return variance;
    }

    /**
     * Calcula consistência baseada na variância das notas
     * @param {Array} gradesHistory - Histórico de notas
     * @returns {number} Score de consistência (0-100)
     */
    calculateConsistency(gradesHistory) {
        const variance = this.calculateVariance(gradesHistory);

        // Quanto menor a variância, maior a consistência
        // Normaliza para escala 0-100
        const maxVariance = 4.0; // Variância máxima esperada (notas de 0-10)
        const consistency = Math.max(0, 100 - (variance / maxVariance) * 100);

        return Math.round(consistency * 100) / 100;
    }

    /**
     * Calcula inclinação da linha de tendência
     * @param {Array} data - Array de números
     * @returns {number} Inclinação
     */
    calculateSlope(data) {
        if (data.length < 2) return 0;

        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;
        const n = data.length;

        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += data[i];
            sumXY += (i * data[i]);
            sumXX += (i * i);
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope;
    }

    /**
     * Calcula evolução acadêmica baseada na tendência das notas
     * @param {Array} gradesTrend - Tendência das notas
     * @returns {number} Score de evolução (0-100)
     */
    calculateEvolution(gradesTrend) {
        const slope = this.calculateSlope(gradesTrend);

        // Se a inclinação é positiva, há evolução
        // Normaliza para escala 0-100
        const maxSlope = 0.5; // Inclinação máxima esperada
        const evolution = Math.max(0, Math.min(100, 50 + (slope / maxSlope) * 50));

        return Math.round(evolution * 100) / 100;
    }

    /**
     * Calcula score acadêmico completo
     * @param {number} userId - ID do usuário
     * @returns {Object} Resultado do cálculo acadêmico
     */
    async calculateScore(userId) {
        try {
            logger.info(`Calculando score acadêmico para o usuário: ${userId}`);

            const performance = await this.getAcademicPerformance(userId);

            // Calcula scores individuais
            const gradeScore = this.calculateGradeScore(performance.grade_avg);
            const consistencyScore = this.calculateConsistency(performance.grades_history);
            const evolutionScore = this.calculateEvolution(performance.grades_trend);

            // Calcula score final ponderado
            const academicScore = (
                gradeScore * this.weights.gradeAverage +
                consistencyScore * this.weights.consistency +
                evolutionScore * this.weights.evolution
            );

            const result = {
                score: Math.round(academicScore * 100) / 100,
                breakdown: {
                    gradeScore: Math.round(gradeScore * 100) / 100,
                    consistencyScore: Math.round(consistencyScore * 100) / 100,
                    evolutionScore: Math.round(evolutionScore * 100) / 100,
                    gradeAverage: performance.grade_avg,
                    variance: this.calculateVariance(performance.grades_history),
                    slope: this.calculateSlope(performance.grades_trend)
                },
                weight: 0.35, // Peso no score final
                metadata: {
                    totalGrades: performance.grades_history.length,
                    calculationMethod: 'weighted_average',
                    lastUpdated: new Date().toISOString()
                }
            };

            logger.info(`Score acadêmico calculado: ${result.score} para usuário ${userId}`);
            return result;

        } catch (error) {
            logger.error(`Erro ao calcular score acadêmico para usuário ${userId}:`, error);

            // Retorna score neutro em caso de erro
            return {
                score: 70.0,
                breakdown: {
                    gradeScore: 70.0,
                    consistencyScore: 70.0,
                    evolutionScore: 70.0,
                    gradeAverage: 7.0,
                    variance: 0.0,
                    slope: 0.0
                },
                weight: 0.35,
                metadata: {
                    totalGrades: 0,
                    calculationMethod: 'error_fallback',
                    lastUpdated: new Date().toISOString(),
                    error: error.message
                }
            };
        }
    }

    /**
     * Gera recomendações baseadas no score acadêmico
     * @param {Object} result - Resultado do cálculo
     * @returns {Array} Lista de recomendações
     */
    generateRecommendations(result) {
        const recommendations = [];

        if (result.score < 60) {
            recommendations.push({
                type: 'ACADEMIC_SUPPORT',
                message: 'Recomenda-se acompanhamento pedagógico intensivo',
                priority: 'HIGH',
                action: 'SUPPORT'
            });
        } else if (result.score < 75) {
            recommendations.push({
                type: 'ACADEMIC_MONITORING',
                message: 'Monitorar performance acadêmica regularmente',
                priority: 'MEDIUM',
                action: 'MONITOR'
            });
        }

        if (result.breakdown.consistencyScore < 60) {
            recommendations.push({
                type: 'CONSISTENCY_IMPROVEMENT',
                message: 'Focar na consistência das notas',
                priority: 'MEDIUM',
                action: 'IMPROVE'
            });
        }

        if (result.breakdown.evolutionScore < 60) {
            recommendations.push({
                type: 'EVOLUTION_SUPPORT',
                message: 'Implementar estratégias de melhoria contínua',
                priority: 'MEDIUM',
                action: 'IMPROVE'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                type: 'MAINTAIN_PERFORMANCE',
                message: 'Excelente performance acadêmica! Manter o bom desempenho.',
                priority: 'LOW',
                action: 'MAINTAIN'
            });
        }

        return recommendations;
    }
}

module.exports = AcademicCalculator;
