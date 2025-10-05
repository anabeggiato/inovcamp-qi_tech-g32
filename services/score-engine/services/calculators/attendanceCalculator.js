const { createServiceLogger } = require('../../../shared/logger');

const logger = createServiceLogger('attendance-calculator');

/**
 * Attendance Calculator - Módulo de Análise de Frequência
 * Inspirado no Serasa Experian para análise de frequência escolar
 */
class AttendanceCalculator {
    constructor() {
        this.weights = {
            baseAttendance: 0.6,      // 60% - Frequência base
            penalties: 0.25,          // 25% - Penalidades por faltas
            consistency: 0.15         // 15% - Consistência da frequência
        };
    }

    /**
     * Busca dados de frequência do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Dados de frequência
     */
    async getAttendanceData(userId) {
        try {
            const { query } = require('../../../shared/database');

            // Busca dados reais no banco
            const result = await query(`
                SELECT 
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
                logger.warn(`Nenhum dado de frequência encontrado para usuário ${userId}, usando dados padrão`);
                return this.getDefaultAttendanceData(userId);
            }

            // Processa dados reais
            const performances = result.rows;
            const attendance_pct = performances[0].attendance_pct || 85;
            const history = performances.map(p => p.attendance_pct).filter(a => a !== null);

            // Simula faltas baseadas na frequência (já que não temos tabela específica)
            const absences = this.generateAbsencesFromAttendance(attendance_pct, history);

            logger.info(`Dados de frequência reais encontrados para usuário ${userId}:`, {
                attendance_pct,
                total_records: performances.length,
                history
            });

            return {
                attendance_pct,
                absences,
                history: history.length > 0 ? history : [attendance_pct]
            };

        } catch (error) {
            logger.error(`Erro ao buscar dados de frequência para usuário ${userId}:`, error);
            return this.getDefaultAttendanceData(userId);
        }
    }

    getDefaultAttendanceData(userId) {
        // Dados padrão baseados no ID do usuário para consistência
        const profiles = [
            { attendance_pct: 98, absences: [{ date: '2023-03-15', type: 'justified', reason: 'Consulta médica' }], history: [97, 98, 99, 98, 98] },
            { attendance_pct: 92, absences: [{ date: '2023-01-10', type: 'unjustified' }, { date: '2023-02-05', type: 'justified', reason: 'Emergência familiar' }], history: [90, 91, 92, 93, 92] },
            { attendance_pct: 85, absences: [{ date: '2023-01-15', type: 'unjustified' }, { date: '2023-01-16', type: 'unjustified' }], history: [88, 85, 87, 84, 85] },
            { attendance_pct: 75, absences: [{ date: '2023-01-10', type: 'unjustified' }, { date: '2023-01-11', type: 'unjustified' }], history: [80, 75, 78, 72, 75] }
        ];

        const profileIndex = userId % profiles.length;
        return profiles[profileIndex];
    }

    generateAbsencesFromAttendance(attendance_pct, history) {
        // Gera faltas simuladas baseadas na frequência
        const totalClasses = 100; // Assumindo 100 aulas no período
        const absences = totalClasses - (totalClasses * attendance_pct / 100);

        if (absences <= 0) return [];

        const absencesList = [];
        for (let i = 0; i < Math.floor(absences); i++) {
            absencesList.push({
                date: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                type: Math.random() > 0.3 ? 'unjustified' : 'justified',
                reason: Math.random() > 0.3 ? 'Falta não justificada' : 'Consulta médica'
            });
        }

        return absencesList;
    }

    /**
     * Calcula score baseado na frequência
     * @param {number} attendancePct - Porcentagem de frequência
     * @returns {number} Score base (0-100)
     */
    calculateBaseAttendance(attendancePct) {
        if (attendancePct >= 98) return 100;
        if (attendancePct >= 95) return 95;
        if (attendancePct >= 92) return 90;
        if (attendancePct >= 90) return 85;
        if (attendancePct >= 87) return 80;
        if (attendancePct >= 85) return 75;
        if (attendancePct >= 82) return 70;
        if (attendancePct >= 80) return 65;
        if (attendancePct >= 77) return 60;
        if (attendancePct >= 75) return 55;
        if (attendancePct >= 72) return 50;
        if (attendancePct >= 70) return 45;
        if (attendancePct >= 67) return 40;
        if (attendancePct >= 65) return 35;
        if (attendancePct >= 62) return 30;
        if (attendancePct >= 60) return 25;
        if (attendancePct >= 57) return 20;
        if (attendancePct >= 55) return 15;
        if (attendancePct >= 52) return 10;
        if (attendancePct >= 50) return 5;
        return 0; // Abaixo de 50%
    }

    /**
     * Identifica faltas consecutivas
     * @param {Array} absences - Lista de faltas
     * @returns {number} Número máximo de faltas consecutivas
     */
    getConsecutiveAbsences(absences) {
        if (absences.length === 0) return 0;

        // Filtra apenas faltas não justificadas
        const unjustifiedAbsences = absences
            .filter(a => a.type === 'unjustified')
            .map(a => new Date(a.date))
            .sort((a, b) => a.getTime() - b.getTime());

        if (unjustifiedAbsences.length < 2) return unjustifiedAbsences.length;

        let maxConsecutive = 1;
        let currentConsecutive = 1;

        for (let i = 1; i < unjustifiedAbsences.length; i++) {
            const diffTime = Math.abs(unjustifiedAbsences[i].getTime() - unjustifiedAbsences[i - 1].getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentConsecutive++;
            } else {
                currentConsecutive = 1;
            }
            maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        }

        return maxConsecutive;
    }

    /**
     * Calcula penalidades por faltas
     * @param {Array} absences - Lista de faltas
     * @returns {number} Score com penalidades (0-100)
     */
    calculatePenalties(absences) {
        const consecutiveAbsences = this.getConsecutiveAbsences(absences);
        const totalUnjustifiedAbsences = absences.filter(a => a.type === 'unjustified').length;

        let penalty = 0;

        // Penalidades por faltas consecutivas
        if (consecutiveAbsences >= 5) {
            penalty += 40; // Penalidade severa
        } else if (consecutiveAbsences >= 3) {
            penalty += 25; // Penalidade alta
        } else if (consecutiveAbsences >= 2) {
            penalty += 15; // Penalidade média
        }

        // Penalidades por total de faltas não justificadas
        if (totalUnjustifiedAbsences >= 15) {
            penalty += 35; // Penalidade severa
        } else if (totalUnjustifiedAbsences >= 10) {
            penalty += 25; // Penalidade alta
        } else if (totalUnjustifiedAbsences >= 5) {
            penalty += 15; // Penalidade média
        } else if (totalUnjustifiedAbsences >= 3) {
            penalty += 10; // Penalidade baixa
        }

        // Retorna score com penalidades aplicadas
        return Math.max(0, 100 - penalty);
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
     * Calcula consistência da frequência
     * @param {Array} history - Histórico de frequência
     * @returns {number} Score de consistência (0-100)
     */
    calculateAttendanceConsistency(history) {
        const variance = this.calculateVariance(history);

        // Quanto menor a variância, maior a consistência
        // Normaliza para escala 0-100
        const maxVariance = 100; // Variância máxima esperada (frequência 0-100%)
        const consistency = Math.max(0, 100 - (variance / maxVariance) * 100);

        return Math.round(consistency * 100) / 100;
    }

    /**
     * Calcula score de frequência completo
     * @param {number} userId - ID do usuário
     * @returns {Object} Resultado do cálculo de frequência
     */
    async calculateScore(userId) {
        try {
            logger.info(`Calculando score de frequência para o usuário: ${userId}`);

            const attendance = await this.getAttendanceData(userId);

            // Calcula scores individuais
            const baseScore = this.calculateBaseAttendance(attendance.attendance_pct);
            const penaltyScore = this.calculatePenalties(attendance.absences);
            const consistencyScore = this.calculateAttendanceConsistency(attendance.history);

            // Calcula score final ponderado
            const attendanceScore = (
                baseScore * this.weights.baseAttendance +
                penaltyScore * this.weights.penalties +
                consistencyScore * this.weights.consistency
            );

            const result = {
                score: Math.round(attendanceScore * 100) / 100,
                breakdown: {
                    baseScore: Math.round(baseScore * 100) / 100,
                    penaltyScore: Math.round(penaltyScore * 100) / 100,
                    consistencyScore: Math.round(consistencyScore * 100) / 100,
                    attendancePercentage: attendance.attendance_pct,
                    totalAbsences: attendance.absences.length,
                    unjustifiedAbsences: attendance.absences.filter(a => a.type === 'unjustified').length,
                    consecutiveAbsences: this.getConsecutiveAbsences(attendance.absences),
                    variance: this.calculateVariance(attendance.history)
                },
                weight: 0.25, // Peso no score final
                metadata: {
                    totalClasses: attendance.history.length,
                    calculationMethod: 'weighted_average',
                    lastUpdated: new Date().toISOString()
                }
            };

            logger.info(`Score de frequência calculado: ${result.score} para usuário ${userId}`);
            return result;

        } catch (error) {
            logger.error(`Erro ao calcular score de frequência para usuário ${userId}:`, error);

            // Retorna score neutro em caso de erro
            return {
                score: 75.0,
                breakdown: {
                    baseScore: 75.0,
                    penaltyScore: 75.0,
                    consistencyScore: 75.0,
                    attendancePercentage: 85,
                    totalAbsences: 0,
                    unjustifiedAbsences: 0,
                    consecutiveAbsences: 0,
                    variance: 0.0
                },
                weight: 0.25,
                metadata: {
                    totalClasses: 0,
                    calculationMethod: 'error_fallback',
                    lastUpdated: new Date().toISOString(),
                    error: error.message
                }
            };
        }
    }

    /**
     * Gera recomendações baseadas no score de frequência
     * @param {Object} result - Resultado do cálculo
     * @returns {Array} Lista de recomendações
     */
    generateRecommendations(result) {
        const recommendations = [];

        if (result.score < 60) {
            recommendations.push({
                type: 'ATTENDANCE_ALERT',
                message: 'Frequência muito baixa - risco de reprovação',
                priority: 'CRITICAL',
                action: 'ALERT'
            });
        } else if (result.score < 75) {
            recommendations.push({
                type: 'ATTENDANCE_MONITORING',
                message: 'Monitorar frequência regularmente',
                priority: 'HIGH',
                action: 'MONITOR'
            });
        }

        if (result.breakdown.consecutiveAbsences >= 3) {
            recommendations.push({
                type: 'CONSECUTIVE_ABSENCES',
                message: 'Evitar faltas consecutivas',
                priority: 'HIGH',
                action: 'IMPROVE'
            });
        }

        if (result.breakdown.unjustifiedAbsences >= 5) {
            recommendations.push({
                type: 'UNJUSTIFIED_ABSENCES',
                message: 'Reduzir faltas não justificadas',
                priority: 'MEDIUM',
                action: 'IMPROVE'
            });
        }

        if (result.breakdown.consistencyScore < 70) {
            recommendations.push({
                type: 'CONSISTENCY_IMPROVEMENT',
                message: 'Melhorar consistência da frequência',
                priority: 'MEDIUM',
                action: 'IMPROVE'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                type: 'MAINTAIN_ATTENDANCE',
                message: 'Excelente frequência! Manter o bom desempenho.',
                priority: 'LOW',
                action: 'MAINTAIN'
            });
        }

        return recommendations;
    }
}

module.exports = AttendanceCalculator;
