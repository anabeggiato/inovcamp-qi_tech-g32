const { generateId } = require('../../shared/utils');
const { query } = require('../../shared/database');

/**
 * QI-EDU Fraud Detector - Inspirado no Sift Science
 * Sistema de detecção de fraude em tempo real
 */
class FraudDetector {
    constructor() {
        // Configurações de risco (Sift-inspired)
        this.riskThresholds = {
            LOW: { min: 0, max: 30, action: "APPROVE" },
            MEDIUM: { min: 31, max: 60, action: "REVIEW" },
            HIGH: { min: 61, max: 80, action: "DECLINE" },
            CRITICAL: { min: 81, max: 100, action: "BLOCK" }
        };

        // Fatores de risco e seus pesos
        this.riskFactors = {
            VELOCITY: { weight: 0.25 },
            DEVICE: { weight: 0.20 },
            LOCATION: { weight: 0.15 },
            BEHAVIOR: { weight: 0.20 },
            PATTERN: { weight: 0.20 }
        };
    }

    /**
     * Analisa transação em tempo real (Sift-inspired)
     * @param {Object} transaction - Dados da transação
     * @returns {Object} Resultado da análise
     */
    async analyzeTransaction(transaction) {
        try {
            console.log(`[FRAUD] Analisando transação ${transaction.id || 'unknown'}`);

            const analysis = {
                transactionId: transaction.id || generateId('TXN'),
                userId: transaction.userId,
                timestamp: new Date().toISOString(),
                factors: [],
                riskScore: 0,
                riskLevel: 'LOW',
                decision: 'APPROVE',
                confidence: 0.95,
                recommendations: []
            };

            // Analisa cada fator de risco
            const velocityScore = await this.analyzeVelocity(transaction);
            const deviceScore = await this.analyzeDevice(transaction);
            const locationScore = await this.analyzeLocation(transaction);
            const behaviorScore = await this.analyzeBehavior(transaction);
            const patternScore = await this.analyzePattern(transaction);

            // Adiciona fatores à análise
            analysis.factors = [
                {
                    type: 'VELOCITY',
                    score: velocityScore,
                    weight: this.riskFactors.VELOCITY.weight,
                },
                {
                    type: 'DEVICE',
                    score: deviceScore,
                    weight: this.riskFactors.DEVICE.weight,
                },
                {
                    type: 'LOCATION',
                    score: locationScore,
                    weight: this.riskFactors.LOCATION.weight,
                },
                {
                    type: 'BEHAVIOR',
                    score: behaviorScore,
                    weight: this.riskFactors.BEHAVIOR.weight,
                },
                {
                    type: 'PATTERN',
                    score: patternScore,
                    weight: this.riskFactors.PATTERN.weight,
                }
            ];

            // Calcula score de risco ponderado
            analysis.riskScore = Math.round(
                velocityScore * this.riskFactors.VELOCITY.weight +
                deviceScore * this.riskFactors.DEVICE.weight +
                locationScore * this.riskFactors.LOCATION.weight +
                behaviorScore * this.riskFactors.BEHAVIOR.weight +
                patternScore * this.riskFactors.PATTERN.weight
            );

            // Determina nível de risco e decisão
            const riskLevel = this.getRiskLevel(analysis.riskScore);
            analysis.riskLevel = riskLevel;
            analysis.decision = this.riskThresholds[riskLevel].action;

            // Gera recomendações
            analysis.recommendations = this.generateRecommendations(analysis);

            // Calcula confiança baseada na qualidade dos dados
            analysis.confidence = this.calculateConfidence(analysis.factors);

            // Salva análise no banco
            await this.saveFraudAnalysis(analysis);

            console.log(`[FRAUD] Análise concluída: ${analysis.riskScore} (${analysis.riskLevel}) - ${analysis.decision}`);

            return analysis;

        } catch (error) {
            console.error(`[FRAUD] Erro ao analisar transação:`, error);
            throw error;
        }
    }

    /**
     * Analisa velocidade de transações
     * @param {Object} transaction - Dados da transação
     * @returns {number} Score de risco (0-100)
     */
    async analyzeVelocity(transaction) {
        try {
            // Busca transações recentes do usuário
            const result = await query(`
                SELECT COUNT(*) as count, 
                       MAX(created_at) as last_transaction
                FROM payment_transactions 
                WHERE user_id = $1 
                AND created_at >= NOW() - INTERVAL '1 hour'
            `, [transaction.userId]);

            const recentCount = parseInt(result.rows[0]?.count || 0);
            const lastTransaction = result.rows[0]?.last_transaction;

            let velocityScore = 0;

            // Penaliza alta frequência de transações
            if (recentCount >= 10) velocityScore = 80; // Muito alto
            else if (recentCount >= 5) velocityScore = 60; // Alto
            else if (recentCount >= 3) velocityScore = 40; // Médio
            else if (recentCount >= 1) velocityScore = 20; // Baixo

            // Penaliza transações muito próximas
            if (lastTransaction) {
                const timeDiff = Date.now() - new Date(lastTransaction).getTime();
                const minutesDiff = timeDiff / (1000 * 60);

                if (minutesDiff < 1) velocityScore = Math.max(velocityScore, 70); // Menos de 1 minuto
                else if (minutesDiff < 5) velocityScore = Math.max(velocityScore, 50); // Menos de 5 minutos
            }

            return velocityScore;
        } catch (error) {
            console.error(`[FRAUD] Erro ao analisar velocidade:`, error);
            return 50; // Score neutro em caso de erro
        }
    }

    /**
     * Analisa dispositivo
     * @param {Object} transaction - Dados da transação
     * @returns {number} Score de risco (0-100)
     */
    async analyzeDevice(transaction) {
        try {
            const deviceFingerprint = transaction.deviceFingerprint || 'unknown';
            const userAgent = transaction.userAgent || 'unknown';

            let deviceScore = 0;

            // Verifica se é um dispositivo conhecido
            const result = await query(`
                SELECT COUNT(*) as count
                FROM frauds 
                WHERE user_id = $1 
                AND payload->>'device_fingerprint' = $2
                AND created_at >= NOW() - INTERVAL '30 days'
            `, [transaction.userId, deviceFingerprint]);

            const deviceHistory = parseInt(result.rows[0]?.count || 0);

            if (deviceHistory > 0) {
                deviceScore = 20; // Dispositivo com histórico de fraude
            } else if (deviceFingerprint === 'unknown') {
                deviceScore = 40; // Dispositivo desconhecido
            } else {
                deviceScore = 10; // Dispositivo conhecido e limpo
            }

            // Verifica user agent suspeito
            if (userAgent.includes('bot') || userAgent.includes('crawler')) {
                deviceScore = Math.max(deviceScore, 80);
            }

            return deviceScore;
        } catch (error) {
            console.error(`[FRAUD] Erro ao analisar dispositivo:`, error);
            return 30; // Score neutro em caso de erro
        }
    }

    /**
     * Analisa localização
     * @param {Object} transaction - Dados da transação
     * @returns {number} Score de risco (0-100)
     */
    async analyzeLocation(transaction) {
        try {
            const location = transaction.location || {};
            const { country, city, latitude, longitude } = location;

            let locationScore = 0;

            // Verifica se a localização é conhecida
            if (!country || !city) {
                locationScore = 30; // Localização desconhecida
            } else {
                // Verifica se é uma localização suspeita
                const suspiciousCountries = ['XX', 'ZZ']; // Códigos de países suspeitos
                if (suspiciousCountries.includes(country)) {
                    locationScore = 70;
                } else {
                    locationScore = 10; // Localização normal
                }
            }

            // Verifica se a localização mudou drasticamente
            const result = await query(`
                SELECT payload->>'location' as location
                FROM frauds 
                WHERE user_id = $1 
                AND created_at >= NOW() - INTERVAL '7 days'
                ORDER BY created_at DESC 
                LIMIT 1
            `, [transaction.userId]);

            if (result.rows.length > 0) {
                const lastLocation = result.rows[0].location;
                if (lastLocation && this.calculateDistance(location, lastLocation) > 1000) {
                    locationScore = Math.max(locationScore, 50); // Mudança drástica de localização
                }
            }

            return locationScore;
        } catch (error) {
            console.error(`[FRAUD] Erro ao analisar localização:`, error);
            return 20; // Score neutro em caso de erro
        }
    }

    /**
     * Analisa comportamento
     * @param {Object} transaction - Dados da transação
     * @returns {number} Score de risco (0-100)
     */
    async analyzeBehavior(transaction) {
        try {
            let behaviorScore = 0;

            // Analisa horário da transação
            const hour = new Date().getHours();
            if (hour >= 2 && hour <= 5) {
                behaviorScore += 20; // Horário suspeito
            }

            // Analisa dia da semana
            const dayOfWeek = new Date().getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                behaviorScore += 10; // Fim de semana
            }

            // Analisa valor da transação
            const amount = transaction.amount || 0;
            if (amount > 10000) {
                behaviorScore += 30; // Valor alto
            } else if (amount > 5000) {
                behaviorScore += 20; // Valor médio-alto
            }

            // Analisa método de pagamento
            const paymentMethod = transaction.paymentMethod || '';
            if (paymentMethod === 'credit_card') {
                behaviorScore += 10; // Cartão de crédito tem mais risco
            }

            return Math.min(100, behaviorScore);
        } catch (error) {
            console.error(`[FRAUD] Erro ao analisar comportamento:`, error);
            return 25; // Score neutro em caso de erro
        }
    }

    /**
     * Analisa padrões
     * @param {Object} transaction - Dados da transação
     * @returns {number} Score de risco (0-100)
     */
    async analyzePattern(transaction) {
        try {
            let patternScore = 0;

            // Verifica padrões de fraude conhecidos
            const result = await query(`
                SELECT COUNT(*) as count
                FROM frauds 
                WHERE user_id = $1 
                AND created_at >= NOW() - INTERVAL '90 days'
            `, [transaction.userId]);

            const fraudHistory = parseInt(result.rows[0]?.count || 0);

            if (fraudHistory >= 3) {
                patternScore = 80; // Múltiplas fraudes
            } else if (fraudHistory >= 1) {
                patternScore = 50; // Uma fraude
            } else {
                patternScore = 10; // Sem histórico de fraude
            }

            // Verifica se o usuário tem score baixo
            const scoreResult = await query(`
                SELECT score FROM scores 
                WHERE user_id = $1 
                ORDER BY created_at DESC 
                LIMIT 1
            `, [transaction.userId]);

            if (scoreResult.rows.length > 0) {
                const userScore = parseFloat(scoreResult.rows[0].score);
                if (userScore < 500) {
                    patternScore = Math.max(patternScore, 60); // Score muito baixo
                } else if (userScore < 700) {
                    patternScore = Math.max(patternScore, 30); // Score baixo
                }
            }

            return patternScore;
        } catch (error) {
            console.error(`[FRAUD] Erro ao analisar padrões:`, error);
            return 20; // Score neutro em caso de erro
        }
    }

    /**
     * Determina nível de risco baseado no score
     * @param {number} score - Score de risco (0-100)
     * @returns {string} Nível de risco
     */
    getRiskLevel(score) {
        for (const [level, threshold] of Object.entries(this.riskThresholds)) {
            if (score >= threshold.min && score <= threshold.max) {
                return level;
            }
        }
        return 'LOW';
    }

    /**
     * Gera recomendações baseadas na análise
     * @param {Object} analysis - Resultado da análise
     * @returns {Array} Lista de recomendações
     */
    generateRecommendations(analysis) {
        const recommendations = [];

        // Recomendações baseadas no nível de risco
        switch (analysis.riskLevel) {
            case 'LOW':
                recommendations.push({
                    type: 'APPROVAL',
                    message: 'Transação aprovada - baixo risco detectado',
                    priority: 'LOW'
                });
                break;
            case 'MEDIUM':
                recommendations.push({
                    type: 'REVIEW',
                    message: 'Transação requer análise manual - risco médio',
                    priority: 'MEDIUM'
                });
                break;
            case 'HIGH':
                recommendations.push({
                    type: 'DECLINE',
                    message: 'Transação recusada - alto risco detectado',
                    priority: 'HIGH'
                });
                break;
            case 'CRITICAL':
                recommendations.push({
                    type: 'BLOCK',
                    message: 'Transação bloqueada - risco crítico detectado',
                    priority: 'CRITICAL'
                });
                break;
        }

        // Recomendações baseadas em fatores específicos
        analysis.factors.forEach(factor => {
            if (factor.score > 70) {
                recommendations.push({
                    type: 'FACTOR_ALERT',
                    message: `Alto risco detectado em ${factor.type}`,
                    priority: 'HIGH',
                    factor: factor.type
                });
            }
        });

        return recommendations;
    }

    /**
     * Calcula confiança da análise
     * @param {Array} factors - Fatores analisados
     * @returns {number} Confiança (0-1)
     */
    calculateConfidence(factors) {
        // Confiança baseada na qualidade dos dados
        let confidence = 1.0;

        // Reduz confiança se algum fator tem dados insuficientes
        factors.forEach(factor => {
            if (factor.score === 0) {
                confidence -= 0.1; // Dados insuficientes
            }
        });

        return Math.max(0.5, Math.round(confidence * 100) / 100);
    }

    /**
     * Mapeia nível de risco para severidade numérica
     * @param {string} riskLevel - Nível de risco (LOW, MEDIUM, HIGH, VERY_HIGH)
     * @returns {number} Severidade numérica (1-4)
     */
    mapRiskLevelToSeverity(riskLevel) {
        const severityMap = {
            'LOW': 1,
            'MEDIUM': 2,
            'HIGH': 3,
            'VERY_HIGH': 4
        };
        return severityMap[riskLevel] || 1;
    }

    /**
     * Salva análise de fraude no banco
     * @param {Object} analysis - Resultado da análise
     */
    async saveFraudAnalysis(analysis) {
        try {
            await query(`
                INSERT INTO frauds (
                    user_id, type, severity, payload, created_at
                ) VALUES ($1, $2, $3, $4, $5)
            `, [
                analysis.userId,
                'TRANSACTION_ANALYSIS',
                this.mapRiskLevelToSeverity(analysis.riskLevel),
                JSON.stringify({
                    risk_score: analysis.riskScore,
                    risk_level: analysis.riskLevel,
                    decision: analysis.decision,
                    factors: analysis.factors,
                    recommendations: analysis.recommendations
                }),
                new Date()
            ]);

            console.log(`[FRAUD] Análise salva no banco para usuário ${analysis.userId}`);
        } catch (error) {
            console.error(`[FRAUD] Erro ao salvar análise:`, error);
            // Não falha o processo se não conseguir salvar
        }
    }

    /**
     * Calcula distância entre duas localizações
     * @param {Object} loc1 - Localização 1
     * @param {Object} loc2 - Localização 2
     * @returns {number} Distância em km
     */
    calculateDistance(loc1, loc2) {
        if (!loc1.latitude || !loc1.longitude || !loc2.latitude || !loc2.longitude) {
            return 0;
        }

        const R = 6371; // Raio da Terra em km
        const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
        const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

}

module.exports = new FraudDetector();
