const { generateId } = require('../../shared/utils');
const { query } = require('../../shared/database');
const AcademicCalculator = require('./calculators/academicCalculator');
const AttendanceCalculator = require('./calculators/attendanceCalculator');
const FraudAnalyzer = require('./calculators/fraudAnalyzer');
const RiskClassifier = require('./calculators/riskClassifier');

/**
 * QI-EDU Score Engine - Inspirado no Serasa Experian
 * Sistema de score de crédito 0-1000 com faixas A-E
 */
class ScoreEngine {
    constructor() {
        this.academicCalculator = new AcademicCalculator();
        this.attendanceCalculator = new AttendanceCalculator();
        this.fraudAnalyzer = new FraudAnalyzer();
        this.riskClassifier = new RiskClassifier();

        // Pesos dos módulos (Serasa-inspired)
        this.weights = {
            academic: 0.35,      // 35% - Performance acadêmica
            attendance: 0.25,    // 25% - Frequência
            fraud: 0.25,         // 25% - Histórico de fraudes
            risk: 0.15           // 15% - Análise de risco comportamental
        };

        // Faixas de score (Serasa-inspired)
        this.scoreBands = {
            A: { min: 800, max: 1000, description: "Excelente" },
            B: { min: 700, max: 799, description: "Bom" },
            C: { min: 600, max: 699, description: "Regular" },
            D: { min: 500, max: 599, description: "Ruim" },
            E: { min: 0, max: 499, description: "Muito Ruim" }
        };
    }

    /**
     * Calcula score completo do usuário (0-1000)
     * @param {number} userId - ID do usuário
     * @returns {Object} Score completo com breakdown
     */
    async calculateScore(userId) {
        try {
            console.log(`[SCORE] Iniciando cálculo de score Serasa-style para usuário ${userId}`);

            // Executa todos os cálculos em paralelo
            const [
                academicResult,
                attendanceResult,
                fraudResult,
                riskResult
            ] = await Promise.all([
                this.academicCalculator.calculateScore(userId),
                this.attendanceCalculator.calculateScore(userId),
                this.fraudAnalyzer.calculateScore(userId),
                this.riskClassifier.calculateScore(userId)
            ]);

            // Calcula score final ponderado (0-1000)
            const finalScore = Math.round((
                academicResult.score * this.weights.academic +
                attendanceResult.score * this.weights.attendance +
                fraudResult.score * this.weights.fraud +
                riskResult.score * this.weights.risk
            ) * 10); // Multiplica por 10 para escala 0-1000

            console.log(`[SCORE] Cálculo detalhado:`, {
                academic: academicResult.score * this.weights.academic,
                attendance: attendanceResult.score * this.weights.attendance,
                fraud: fraudResult.score * this.weights.fraud,
                risk: riskResult.score * this.weights.risk,
                finalScore
            });

            // Determina faixa de risco
            const riskBand = this.getRiskBand(finalScore);
            console.log(`[SCORE] RiskBand calculado:`, riskBand);

            // Gera fatores negativos (Serasa-style)
            const negativeFactors = this.generateNegativeFactors({
                academic: academicResult,
                attendance: attendanceResult,
                fraud: fraudResult,
                risk: riskResult
            });

            // Gera recomendações específicas
            const recommendations = this.generateRecommendations({
                score: finalScore,
                band: riskBand,
                factors: negativeFactors,
                breakdown: {
                    academic: academicResult,
                    attendance: attendanceResult,
                    fraud: fraudResult,
                    risk: riskResult
                }
            });

            const scoreData = {
                id: generateId('SCORE'),
                userId,
                score: finalScore,
                riskBand: riskBand.letter,
                riskBandDescription: riskBand.description,
                confidence: this.calculateConfidence(academicResult, attendanceResult, fraudResult, riskResult),
                breakdown: {
                    academic: {
                        score: Math.round(academicResult.score * 10),
                        weight: this.weights.academic,
                        factors: academicResult.breakdown
                    },
                    attendance: {
                        score: Math.round(attendanceResult.score * 10),
                        weight: this.weights.attendance,
                        factors: attendanceResult.breakdown
                    },
                    fraud: {
                        score: Math.round(fraudResult.score * 10),
                        weight: this.weights.fraud,
                        factors: fraudResult.breakdown
                    },
                    risk: {
                        score: Math.round(riskResult.score * 10),
                        weight: this.weights.risk,
                        factors: riskResult.breakdown
                    }
                },
                negativeFactors,
                recommendations,
                calculatedAt: new Date().toISOString(),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
                weights: this.weights
            };

            // Salva no banco de dados
            await this.saveScore(scoreData);

            console.log(`[SCORE] Score calculado: ${finalScore} (Faixa ${riskBand ? riskBand.letter : 'UNDEFINED'}) para usuário ${userId}`);
            console.log(`[SCORE] RiskBand object:`, riskBand);

            return scoreData;

        } catch (error) {
            console.error(`[SCORE] Erro ao calcular score para usuário ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Determina faixa de risco baseada no score
     * @param {number} score - Score final (0-1000)
     * @returns {Object} Faixa de risco
     */
    getRiskBand(score) {
        console.log(`[SCORE] Determinando faixa para score: ${score}`);

        // Verifica se o score é um número válido
        if (typeof score !== 'number' || isNaN(score)) {
            console.log(`[SCORE] Score inválido: ${score}, usando faixa E`);
            return {
                letter: 'E',
                description: 'Muito Ruim',
                min: 0,
                max: 499
            };
        }

        // Verifica cada faixa em ordem decrescente (A -> E)
        const bands = ['A', 'B', 'C', 'D', 'E'];

        for (const letter of bands) {
            const band = this.scoreBands[letter];
            console.log(`[SCORE] Testando faixa ${letter}: ${band.min}-${band.max}`);

            if (score >= band.min && score <= band.max) {
                console.log(`[SCORE] Score ${score} pertence à faixa ${letter}`);
                return {
                    letter,
                    description: band.description,
                    min: band.min,
                    max: band.max
                };
            }
        }

        console.log(`[SCORE] Score ${score} não se encaixou em nenhuma faixa, usando E`);
        return {
            letter: 'E',
            description: 'Muito Ruim',
            min: 0,
            max: 499
        };
    }

    /**
     * Gera fatores negativos (Serasa-style)
     * @param {Object} modules - Resultados dos módulos
     * @returns {Array} Lista de fatores negativos
     */
    generateNegativeFactors(modules) {
        const factors = [];

        // Fatores acadêmicos
        if (modules.academic.score < 60) {
            factors.push({
                code: "ACAD_001",
                description: "Performance acadêmica abaixo da média",
                impact: "HIGH",
                category: "ACADEMIC"
            });
        }

        if (modules.academic.breakdown?.consistencyScore < 50) {
            factors.push({
                code: "ACAD_002",
                description: "Inconsistência nas notas acadêmicas",
                impact: "MEDIUM",
                category: "ACADEMIC"
            });
        }

        // Fatores de frequência
        if (modules.attendance.score < 70) {
            factors.push({
                code: "ATT_001",
                description: "Frequência escolar baixa",
                impact: "HIGH",
                category: "ATTENDANCE"
            });
        }

        // Fatores de fraude
        if (modules.fraud.score < 80) {
            factors.push({
                code: "FRAUD_001",
                description: "Histórico de fraudes detectado",
                impact: "CRITICAL",
                category: "FRAUD"
            });
        }

        // Fatores de risco comportamental
        if (modules.risk.score < 60) {
            factors.push({
                code: "RISK_001",
                description: "Padrões comportamentais inconsistentes",
                impact: "MEDIUM",
                category: "BEHAVIORAL"
            });
        }

        return factors;
    }

    /**
     * Gera recomendações específicas (Serasa-style)
     * @param {Object} scoreData - Dados do score
     * @returns {Array} Lista de recomendações
     */
    generateRecommendations(scoreData) {
        const recommendations = [];

        // Recomendações baseadas na faixa
        switch (scoreData.band) {
            case 'A':
                recommendations.push({
                    type: "CREDIT_APPROVAL",
                    message: "Candidato ideal para crédito educacional",
                    priority: "LOW",
                    action: "APPROVE"
                });
                break;
            case 'B':
                recommendations.push({
                    type: "CREDIT_APPROVAL",
                    message: "Bom candidato para crédito com condições favoráveis",
                    priority: "LOW",
                    action: "APPROVE"
                });
                break;
            case 'C':
                recommendations.push({
                    type: "CREDIT_REVIEW",
                    message: "Candidato aceitável com análise adicional recomendada",
                    priority: "MEDIUM",
                    action: "REVIEW"
                });
                break;
            case 'D':
                recommendations.push({
                    type: "CREDIT_DECLINE",
                    message: "Alto risco de crédito, aprovação não recomendada",
                    priority: "HIGH",
                    action: "DECLINE"
                });
                break;
            case 'E':
                recommendations.push({
                    type: "CREDIT_DECLINE",
                    message: "Risco crítico, crédito não aprovado",
                    priority: "CRITICAL",
                    action: "DECLINE"
                });
                break;
        }

        // Recomendações baseadas em fatores negativos
        scoreData.factors.forEach(factor => {
            switch (factor.code) {
                case "ACAD_001":
                    recommendations.push({
                        type: "ACADEMIC_SUPPORT",
                        message: "Recomenda-se acompanhamento pedagógico",
                        priority: "MEDIUM",
                        action: "SUPPORT"
                    });
                    break;
                case "ATT_001":
                    recommendations.push({
                        type: "ATTENDANCE_MONITORING",
                        message: "Monitorar frequência escolar",
                        priority: "HIGH",
                        action: "MONITOR"
                    });
                    break;
                case "FRAUD_001":
                    recommendations.push({
                        type: "FRAUD_MONITORING",
                        message: "Aumentar monitoramento antifraude",
                        priority: "CRITICAL",
                        action: "MONITOR"
                    });
                    break;
            }
        });

        return recommendations;
    }

    /**
     * Calcula confiança do score
     * @param {Object} modules - Resultados dos módulos
     * @returns {number} Confiança (0-1)
     */
    calculateConfidence(academic, attendance, fraud, risk) {
        // Confiança baseada na qualidade dos dados
        let confidence = 1.0;

        // Reduz confiança se algum módulo tem dados insuficientes
        if (academic.score === 0) confidence -= 0.2;
        if (attendance.score === 0) confidence -= 0.15;
        if (fraud.score === 0) confidence -= 0.1;
        if (risk.score === 0) confidence -= 0.1;

        return Math.max(0.5, Math.round(confidence * 100) / 100);
    }

    /**
     * Salva score no banco de dados
     * @param {Object} scoreData - Dados do score
     */
    async saveScore(scoreData) {
        try {
            // 1. Salva o score na tabela scores (histórico)
            await query(`
                INSERT INTO scores (
                    user_id, score, risk_band, reason_json, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                scoreData.userId,
                scoreData.score,
                scoreData.riskBand, // Salva o risk_band no campo dedicado
                JSON.stringify({
                    riskBand: scoreData.riskBand,
                    riskBandDescription: scoreData.riskBandDescription,
                    confidence: scoreData.confidence,
                    breakdown: scoreData.breakdown,
                    negativeFactors: scoreData.negativeFactors,
                    recommendations: scoreData.recommendations,
                    weights: scoreData.weights,
                    validUntil: scoreData.validUntil
                }),
                new Date(),
                new Date()
            ]);

            // 2. Atualiza os campos na tabela users (snapshot mais recente)
            const fraudScore = scoreData.breakdown.fraud.score;
            const fraudStatus = this.determineFraudStatus(fraudScore);

            await query(`
                UPDATE users 
                SET 
                    credit_score = $1,
                    risk_band = $2,
                    fraud_score = $3,
                    fraud_status = $4,
                    updated_at = $5
                WHERE id = $6
            `, [
                scoreData.score,        // credit_score
                scoreData.riskBand,     // risk_band
                fraudScore,             // fraud_score
                fraudStatus,            // fraud_status
                new Date(),             // updated_at
                scoreData.userId        // id
            ]);

            console.log(`[SCORE] Score salvo no banco para usuário ${scoreData.userId}`);
            console.log(`[SCORE] Snapshot atualizado na tabela users: credit_score=${scoreData.score}, risk_band=${scoreData.riskBand}, fraud_score=${fraudScore}, fraud_status=${fraudStatus}`);
        } catch (error) {
            console.error(`[SCORE] Erro ao salvar score no banco:`, error);
            // Não falha o processo se não conseguir salvar
        }
    }

    /**
     * Determina o status de fraude baseado no score
     * @param {number} fraudScore - Score de fraude (0-1000)
     * @returns {string} Status de fraude
     */
    determineFraudStatus(fraudScore) {
        if (fraudScore >= 800) return 'ok';
        if (fraudScore >= 600) return 'warning';
        if (fraudScore >= 400) return 'caution';
        if (fraudScore >= 200) return 'risk';
        return 'critical';
    }

    /**
     * Consulta score do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Score mais recente
     */
    async getScore(userId) {
        try {
            const result = await query(`
                SELECT * FROM scores 
                WHERE user_id = $1 
                ORDER BY created_at DESC 
                LIMIT 1
            `, [userId]);

            if (result.rows.length === 0) {
                return null;
            }

            const score = result.rows[0];
            return {
                id: score.id,
                userId: score.user_id,
                score: parseFloat(score.score),
                reasonJson: typeof score.reason_json === 'string' ? JSON.parse(score.reason_json) : score.reason_json,
                createdAt: score.created_at,
                updatedAt: score.updated_at
            };
        } catch (error) {
            console.error(`[SCORE] Erro ao consultar score:`, error);
            throw error;
        }
    }

    /**
     * Consulta faixa de risco do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Faixa de risco
     */
    async getUserRiskBand(userId) {
        const score = await this.getScore(userId);
        if (!score) return null;

        return {
            userId,
            score: score.score,
            riskBand: score.reasonJson.riskBand,
            riskBandDescription: score.reasonJson.riskBandDescription,
            confidence: score.reasonJson.confidence,
            validUntil: score.reasonJson.validUntil
        };
    }

    /**
     * Consulta fatores negativos do usuário
     * @param {number} userId - ID do usuário
     * @returns {Array} Fatores negativos
     */
    async getNegativeFactors(userId) {
        const score = await this.getScore(userId);
        if (!score) return [];

        return score.reasonJson.negativeFactors || [];
    }

    /**
     * Consulta histórico de scores
     * @param {number} userId - ID do usuário
     * @param {number} limit - Limite de resultados
     * @returns {Array} Histórico de scores
     */
    async getScoreHistory(userId, limit = 10) {
        try {
            const result = await query(`
                SELECT * FROM scores 
                WHERE user_id = $1 
                ORDER BY created_at DESC 
                LIMIT $2
            `, [userId, limit]);

            return result.rows.map(score => ({
                id: score.id,
                userId: score.user_id,
                score: parseFloat(score.score),
                reasonJson: typeof score.reason_json === 'string' ? JSON.parse(score.reason_json) : score.reason_json,
                createdAt: score.created_at,
                updatedAt: score.updated_at
            }));
        } catch (error) {
            console.error(`[SCORE] Erro ao consultar histórico:`, error);
            throw error;
        }
    }

    /**
     * Recalcula score do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Novo score
     */
    async recalculateScore(userId) {
        console.log(`[SCORE] Recalculando score para usuário ${userId}`);
        return await this.calculateScore(userId);
    }
}

module.exports = new ScoreEngine();
