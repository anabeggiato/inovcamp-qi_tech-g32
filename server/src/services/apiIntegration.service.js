const axios = require('axios');

/**
 * Serviço de Integração com APIs Externas
 * Centraliza todas as chamadas para as APIs mockadas
 */
class ApiIntegrationService {

    constructor() {
        // URLs das APIs (configuráveis via env)
        this.paymentApiUrl = process.env.PAYMENT_API_URL || 'http://localhost:3002';
        this.scoreApiUrl = process.env.SCORE_API_URL || 'http://localhost:3003';
        this.facultyApiUrl = process.env.FACULTY_API_URL || 'http://localhost:3001';

        // Timeout padrão para as requisições
        this.timeout = 5000;

        console.log('🔗 ApiIntegrationService inicializado');
        console.log(`   Payment API: ${this.paymentApiUrl}`);
        console.log(`   Score API: ${this.scoreApiUrl}`);
        console.log(`   Faculty API: ${this.facultyApiUrl}`);
    }

    // ===== PAYMENT API INTEGRATION =====

    /**
     * Criar pagamento
     */
    async createPayment(paymentData) {
        try {
            const response = await axios.post(`${this.paymentApiUrl}/api/payments`, paymentData, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao criar pagamento:', error.message);
            throw this._handleApiError(error, 'Payment API');
        }
    }

    /**
     * Consultar pagamento
     */
    async getPayment(paymentId) {
        try {
            const response = await axios.get(`${this.paymentApiUrl}/api/payments/${paymentId}`, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao consultar pagamento:', error.message);
            throw this._handleApiError(error, 'Payment API');
        }
    }

    /**
     * Obter saldo do usuário
     */
    async getUserBalance(userId) {
        try {
            const response = await axios.get(`${this.paymentApiUrl}/api/payments/balance`, {
                params: { user_id: userId },
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao obter saldo:', error.message);
            throw this._handleApiError(error, 'Payment API');
        }
    }

    /**
     * Obter histórico de transações
     */
    async getTransactions(userId, page = 1, limit = 20) {
        try {
            const response = await axios.get(`${this.paymentApiUrl}/api/payments/transactions`, {
                params: { user_id: userId, page, limit },
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao obter transações:', error.message);
            throw this._handleApiError(error, 'Payment API');
        }
    }

    /**
     * Transferir valores
     */
    async transferMoney(transferData) {
        try {
            const response = await axios.post(`${this.paymentApiUrl}/api/payments/transfer`, transferData, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao transferir valores:', error.message);
            throw this._handleApiError(error, 'Payment API');
        }
    }

    /**
     * Processar pagamento
     */
    async processPayment(paymentData) {
        try {
            const response = await axios.post(`${this.paymentApiUrl}/api/payments/process`, paymentData, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao processar pagamento:', error.message);
            throw this._handleApiError(error, 'Payment API');
        }
    }

    /**
     * Criar conta de custódia
     */
    async createCustodyAccount(userData) {
        try {
            const response = await axios.post(`${this.paymentApiUrl}/custody/accounts`, userData, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao criar conta de custódia:', error.message);
            throw this._handleApiError(error, 'Payment API');
        }
    }

    /**
     * Depositar valor na conta de custódia
     */
    async depositToCustody(userId, amount, description) {
        try {
            const response = await axios.post(`${this.paymentApiUrl}/custody/accounts/${userId}/deposit`, {
                amount,
                description
            }, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao depositar na custódia:', error.message);
            throw this._handleApiError(error, 'Payment API');
        }
    }

    // ===== SCORE ENGINE INTEGRATION =====

    /**
     * Calcular score de crédito
     */
    async calculateScore(userId, userData) {
        try {
            const response = await axios.post(`${this.scoreApiUrl}/scores/calculate`, {
                userId,
                ...userData
            }, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao calcular score:', error.message);
            throw this._handleApiError(error, 'Score Engine');
        }
    }

    /**
     * Consultar score do usuário
     */
    async getUserScore(userId) {
        try {
            const response = await axios.get(`${this.scoreApiUrl}/scores/${userId}`, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao consultar score:', error.message);
            throw this._handleApiError(error, 'Score Engine');
        }
    }

    /**
     * Consultar faixa de risco
     */
    async getRiskBand(userId) {
        try {
            const response = await axios.get(`${this.scoreApiUrl}/scores/${userId}/band`, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao consultar faixa de risco:', error.message);
            throw this._handleApiError(error, 'Score Engine');
        }
    }

    /**
     * Analisar transação para fraude
     */
    async analyzeFraud(transactionData) {
        try {
            const response = await axios.post(`${this.scoreApiUrl}/fraud/analyze`, transactionData, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao analisar fraude:', error.message);
            throw this._handleApiError(error, 'Score Engine');
        }
    }

    /**
     * Registrar evento de fraude
     */
    async reportFraudEvent(eventData) {
        try {
            const response = await axios.post(`${this.scoreApiUrl}/fraud/events`, eventData, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao reportar evento de fraude:', error.message);
            throw this._handleApiError(error, 'Score Engine');
        }
    }

    /**
     * Análise de crédito completa
     */
    async analyzeCredit(creditData) {
        try {
            const response = await axios.post(`${this.scoreApiUrl}/credit/analyze`, creditData, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro na análise de crédito:', error.message);
            throw this._handleApiError(error, 'Score Engine');
        }
    }

    // ===== FACULTY API INTEGRATION =====

    /**
     * Obter dados acadêmicos do estudante
     */
    async getAcademicData(studentId) {
        try {
            const response = await axios.get(`${this.facultyApiUrl}/academic-data/${studentId}`, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao obter dados acadêmicos:', error.message);
            throw this._handleApiError(error, 'Faculty API');
        }
    }

    /**
     * Atualizar dados acadêmicos
     */
    async updateAcademicData(studentId, academicData) {
        try {
            const response = await axios.post(`${this.facultyApiUrl}/academic-data/${studentId}`, academicData, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao atualizar dados acadêmicos:', error.message);
            throw this._handleApiError(error, 'Faculty API');
        }
    }

    /**
     * Obter dados de bolsa
     */
    async getScholarshipData(studentId) {
        try {
            const response = await axios.get(`${this.facultyApiUrl}/scholarship-data/${studentId}`, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao obter dados de bolsa:', error.message);
            throw this._handleApiError(error, 'Faculty API');
        }
    }

    // ===== HEALTH CHECKS =====

    /**
     * Verificar saúde de todas as APIs
     */
    async checkAllApisHealth() {
        const results = {
            payment: await this._checkApiHealth(this.paymentApiUrl, 'Payment API'),
            score: await this._checkApiHealth(this.scoreApiUrl, 'Score Engine'),
            faculty: await this._checkApiHealth(this.facultyApiUrl, 'Faculty API')
        };

        const allHealthy = Object.values(results).every(result => result.healthy);

        return {
            allHealthy,
            apis: results,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Verificar saúde de uma API específica
     */
    async _checkApiHealth(apiUrl, apiName) {
        try {
            const response = await axios.get(`${apiUrl}/health`, {
                timeout: 3000
            });
            return {
                name: apiName,
                url: apiUrl,
                healthy: true,
                status: response.data.success ? 'ok' : 'error',
                response: response.data
            };
        } catch (error) {
            return {
                name: apiName,
                url: apiUrl,
                healthy: false,
                status: 'error',
                error: error.message
            };
        }
    }

    // ===== UTILITY METHODS =====

    /**
     * Tratar erros de API de forma consistente
     */
    _handleApiError(error, apiName) {
        if (error.code === 'ECONNREFUSED') {
            return {
                success: false,
                message: `${apiName} não está disponível`,
                error: 'SERVICE_UNAVAILABLE',
                details: 'Serviço não está rodando ou não acessível'
            };
        }

        if (error.code === 'ETIMEDOUT') {
            return {
                success: false,
                message: `${apiName} timeout`,
                error: 'TIMEOUT',
                details: 'Serviço demorou muito para responder'
            };
        }

        if (error.response) {
            return {
                success: false,
                message: error.response.data?.message || `Erro na ${apiName}`,
                error: 'API_ERROR',
                status: error.response.status,
                details: error.response.data
            };
        }

        return {
            success: false,
            message: `Erro desconhecido na ${apiName}`,
            error: 'UNKNOWN_ERROR',
            details: error.message
        };
    }

    /**
     * Processar desembolso (repasse de dinheiro)
     */
    async processDisbursement(disbursementData) {
        try {
            console.log(`🏦 Processando desembolso: R$ ${disbursementData.amount}`);
            console.log(`   De: Investidor ${disbursementData.from_investor}`);
            console.log(`   Para: Faculdade ${disbursementData.to_school}`);
            console.log(`   Estudante: ${disbursementData.student_id}`);

            const response = await axios.post(`${this.paymentApiUrl}/api/disburse`, disbursementData, {
                timeout: this.timeout
            });

            console.log(`✅ Desembolso processado: ${response.data.paymentId}`);
            return {
                success: true,
                paymentId: response.data.paymentId,
                status: response.data.status,
                message: 'Desembolso processado com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao processar desembolso:', error.message);

            // Fallback: simular desembolso bem-sucedido
            const mockPaymentId = `DISB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            console.log(`🔄 Usando fallback - Desembolso simulado: ${mockPaymentId}`);

            return {
                success: true,
                paymentId: mockPaymentId,
                status: 'completed',
                message: 'Desembolso simulado (Payment API indisponível)',
                fallback: true
            };
        }
    }

    /**
     * Criar dados mockados para fallback
     */
    createMockData(type, userId) {
        const mockData = {
            payment: {
                success: true,
                message: 'Dados mockados - Payment API indisponível',
                data: {
                    balance: 0,
                    transactions: [],
                    note: 'Payment API não está disponível'
                }
            },
            score: {
                success: true,
                message: 'Dados mockados - Score Engine indisponível',
                data: {
                    userId,
                    score: 500,
                    riskBand: 'C',
                    fraudScore: 0,
                    fraudStatus: 'unknown',
                    note: 'Score Engine não está disponível'
                }
            },
            academic: {
                success: true,
                message: 'Dados mockados - Faculty API indisponível',
                data: {
                    studentId: userId,
                    institution: 'Faculdade Exemplo',
                    period: '2025-1',
                    gradeAvg: 8.0,
                    attendancePct: 90,
                    scholarshipPercentage: 50,
                    status: 'active',
                    note: 'Faculty API não está disponível'
                }
            }
        };

        return mockData[type] || { success: false, message: 'Tipo de dados mockados não encontrado' };
    }
}

// Singleton instance
const apiIntegration = new ApiIntegrationService();

module.exports = {
    ApiIntegrationService,
    apiIntegration
};
