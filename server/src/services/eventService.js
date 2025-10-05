const { db } = require('../../db');
const { apiIntegration } = require('./apiIntegration.service');

/**
 * Serviço de Eventos - Sistema baseado em eventos para automação
 * Mais eficiente que polling por tempo
 */
class EventService {

    constructor() {
        this.eventHandlers = new Map();
        this.isListening = false;
        this.setupEventHandlers();

        console.log('🎯 EventService inicializado');
    }

    /**
     * Configurar handlers de eventos
     */
    setupEventHandlers() {
        // Evento: Novo usuário cadastrado
        this.eventHandlers.set('user.created', this.handleUserCreated.bind(this));

        // Evento: Usuário atualizado
        this.eventHandlers.set('user.updated', this.handleUserUpdated.bind(this));

        // Evento: Novo empréstimo criado
        this.eventHandlers.set('loan.created', this.handleLoanCreated.bind(this));

        // Evento: Nova oferta criada
        this.eventHandlers.set('offer.created', this.handleOfferCreated.bind(this));

        // Evento: Transação criada
        this.eventHandlers.set('transaction.created', this.handleTransactionCreated.bind(this));

        // Evento: Dados acadêmicos atualizados
        this.eventHandlers.set('academic.updated', this.handleAcademicUpdated.bind(this));

        // Evento: Parcela vencida
        this.eventHandlers.set('installment.due', this.handleInstallmentDue.bind(this));
    }

    /**
     * Iniciar escuta de eventos
     */
    async startListening() {
        if (this.isListening) {
            console.log('⚠️ EventService já está escutando');
            return;
        }

        console.log('👂 Iniciando escuta de eventos...');
        this.isListening = true;

        // ✅ SISTEMA BASEADO EM EVENTOS - Sem polling!
        // Os eventos são disparados diretamente pelos controllers
        console.log('✅ EventService iniciado - sistema baseado em eventos (sem polling)');
    }

    /**
     * Parar escuta de eventos
     */
    stopListening() {
        if (!this.isListening) {
            console.log('⚠️ EventService não está escutando');
            return;
        }

        console.log('🛑 Parando escuta de eventos...');
        this.isListening = false;

        console.log('✅ EventService parado');
    }

    // ✅ MÉTODOS DE POLLING REMOVIDOS - Sistema agora é baseado em eventos!

    /**
     * Emitir evento
     */
    async emitEvent(eventType, data) {
        const handler = this.eventHandlers.get(eventType);
        if (handler) {
            try {
                console.log(`🎯 Evento disparado: ${eventType}`);
                await handler(data);
            } catch (error) {
                console.error(`❌ Erro no handler do evento ${eventType}:`, error);
            }
        }
    }

    // ===== EVENT HANDLERS =====

    /**
     * Handler: Novo usuário criado
     */
    async handleUserCreated(user) {
        console.log(`👤 Processando novo usuário: ${user.name} (ID: ${user.id})`);

        // Onboarding automático
        await this.processUserOnboarding(user);

        // Criar conta de custódia
        await this.createCustodyAccount(user);

        // Calcular score inicial
        await this.calculateInitialScore(user);
    }

    /**
     * Handler: Usuário atualizado
     */
    async handleUserUpdated(user) {
        console.log(`🔄 Usuário atualizado: ${user.name} (ID: ${user.id})`);

        // Recalcular score se necessário
        if (user.role === 'student') {
            await this.recalculateStudentScore(user);
        }
    }

    /**
     * Handler: Novo empréstimo criado
     */
    async handleLoanCreated(loan) {
        console.log(`💰 Novo empréstimo: R$ ${loan.amount} (ID: ${loan.id})`);

        // Buscar matches automáticos
        await this.findMatchesForLoan(loan);
    }

    /**
     * Handler: Nova oferta criada
     */
    async handleOfferCreated(offer) {
        console.log(`🎯 Nova oferta: R$ ${offer.amount_available} (ID: ${offer.id})`);

        // Buscar empréstimos compatíveis
        await this.findLoansForOffer(offer);
    }

    /**
     * Handler: Nova transação criada
     */
    async handleTransactionCreated(transaction) {
        console.log(`💳 Nova transação: R$ ${transaction.amount} (ID: ${transaction.id})`);

        // Análise de fraude em tempo real
        await this.analyzeTransactionFraud(transaction);
    }

    /**
     * Handler: Dados acadêmicos atualizados
     */
    async handleAcademicUpdated(academicData) {
        console.log(`📚 Dados acadêmicos atualizados: Estudante ${academicData.studentId}`);

        // Recalcular score baseado em performance
        await this.updateScoreFromAcademicData(academicData);
    }

    /**
     * Handler: Parcela vencida
     */
    async handleInstallmentDue(installment) {
        console.log(`⏰ Parcela vencida: R$ ${installment.amount} (ID: ${installment.id})`);

        // Processar cobrança
        await this.processInstallmentPayment(installment);
    }

    // ===== PROCESSING METHODS =====

    /**
     * Processar onboarding de usuário
     */
    async processUserOnboarding(user) {
        try {
            // Validar CPF e idade
            const cpfValid = this.validateCPF(user.cpf);
            const ageValid = this.validateAge(user.birth_date);

            // Atualizar status
            await db('users')
                .where('id', user.id)
                .update({
                    fraud_status: cpfValid && ageValid ? 'approved' : 'rejected',
                    updated_at: new Date()
                });

            console.log(`✅ Onboarding processado para ${user.name}`);

        } catch (error) {
            console.error(`❌ Erro no onboarding do usuário ${user.id}:`, error);
        }
    }

    /**
     * Criar conta de custódia
     */
    async createCustodyAccount(user) {
        try {
            await apiIntegration.createCustodyAccount({
                user_id: user.id,
                user_type: user.role, // ✅ Corrigido: user_type em vez de role
                name: user.name,
                email: user.email
            });

            console.log(`🏦 Conta de custódia criada para ${user.name}`);

        } catch (error) {
            console.error(`❌ Erro ao criar conta de custódia para ${user.id}:`, error);
        }
    }

    /**
     * Calcular score inicial
     */
    async calculateInitialScore(user) {
        try {
            const scoreData = await apiIntegration.calculateScore(user.id, {
                role: user.role,
                initial_score: true
            });

            if (scoreData.success) {
                await db('users')
                    .where('id', user.id)
                    .update({
                        credit_score: scoreData.data.score,
                        risk_band: scoreData.data.riskBand,
                        updated_at: new Date()
                    });

                console.log(`📊 Score inicial calculado para ${user.name}: ${scoreData.data.score}`);
            }

        } catch (error) {
            console.error(`❌ Erro ao calcular score inicial para ${user.id}:`, error);

            // ✅ Fallback: Score padrão quando API falha
            const defaultScore = 750; // Score padrão para novos usuários
            await db('users')
                .where('id', user.id)
                .update({
                    credit_score: defaultScore,
                    risk_band: 'B',
                    updated_at: new Date()
                });

            console.log(`📊 Score padrão aplicado para ${user.name}: ${defaultScore} (API indisponível)`);
        }
    }

    /**
     * Recalcular score de estudante
     */
    async recalculateStudentScore(user) {
        try {
            // Buscar dados acadêmicos
            const academicData = await apiIntegration.getAcademicData(user.id);

            // Recalcular score
            const scoreData = await apiIntegration.calculateScore(user.id, {
                academic_data: academicData.data
            });

            if (scoreData.success) {
                await db('users')
                    .where('id', user.id)
                    .update({
                        credit_score: scoreData.data.score,
                        risk_band: scoreData.data.riskBand,
                        updated_at: new Date()
                    });

                console.log(`📈 Score recalculado para ${user.name}: ${scoreData.data.score}`);
            }

        } catch (error) {
            console.error(`❌ Erro ao recalcular score para ${user.id}:`, error);
        }
    }

    /**
     * Buscar matches para empréstimo
     */
    async findMatchesForLoan(loan) {
        try {
            // Buscar ofertas compatíveis
            const compatibleOffers = await db('offers')
                .select('*')
                .where('status', 'active')
                .where('term_months', loan.term_months)
                .where('amount_available', '>=', loan.amount)
                .limit(5);

            for (const offer of compatibleOffers) {
                await this.createMatch(loan, offer);
            }

        } catch (error) {
            console.error(`❌ Erro ao buscar matches para empréstimo ${loan.id}:`, error);
        }
    }

    /**
     * Buscar empréstimos para oferta
     */
    async findLoansForOffer(offer) {
        try {
            // Buscar empréstimos compatíveis
            const compatibleLoans = await db('loans')
                .select('*')
                .where('status', 'pending')
                .where('term_months', offer.term_months)
                .where('amount', '<=', offer.amount_available)
                .limit(5);

            for (const loan of compatibleLoans) {
                await this.createMatch(loan, offer);
            }

        } catch (error) {
            console.error(`❌ Erro ao buscar empréstimos para oferta ${offer.id}:`, error);
        }
    }

    /**
     * Criar match
     */
    async createMatch(loan, offer) {
        try {
            // Verificar se já existe match
            const existingMatch = await db('matches')
                .where('loan_id', loan.id)
                .where('offer_id', offer.id)
                .first();

            if (existingMatch) return;

            // Calcular valor do match
            const matchAmount = Math.min(parseFloat(loan.amount), parseFloat(offer.amount_available));

            // Criar match
            const [newMatch] = await db('matches').insert({
                loan_id: loan.id,
                offer_id: offer.id,
                amount_matched: matchAmount,
                rate: offer.min_rate,
                status: 'pending',
                created_at: new Date(),
                updated_at: new Date()
            }).returning('*');

            // Processar pagamento
            await this.processMatchPayment(newMatch);

            console.log(`🤝 Match criado: Loan ${loan.id} + Offer ${offer.id} = R$ ${matchAmount}`);

        } catch (error) {
            console.error(`❌ Erro ao criar match:`, error);
        }
    }

    /**
     * Processar pagamento do match
     */
    async processMatchPayment(match) {
        try {
            await apiIntegration.createPayment({
                match_id: match.id,
                amount: match.amount_matched,
                description: `Desembolso P2P - Match ${match.id}`,
                type: 'disbursement'
            });

            // Atualizar status do match
            await db('matches')
                .where('id', match.id)
                .update({ status: 'completed', updated_at: new Date() });

            console.log(`💳 Pagamento processado para match ${match.id}`);

        } catch (error) {
            console.error(`❌ Erro ao processar pagamento do match ${match.id}:`, error);
        }
    }

    /**
     * Analisar fraude de transação
     */
    async analyzeTransactionFraud(transaction) {
        try {
            const fraudAnalysis = await apiIntegration.analyzeFraud({
                transaction_id: transaction.id,
                amount: transaction.amount,
                user_id: transaction.user_id,
                type: transaction.type
            });

            if (fraudAnalysis.success && fraudAnalysis.data.risk_score > 70) {
                // Atualizar status de fraude do usuário
                await db('users')
                    .where('id', transaction.user_id)
                    .update({
                        fraud_status: 'suspicious',
                        fraud_score: fraudAnalysis.data.risk_score,
                        updated_at: new Date()
                    });

                console.log(`🛡️ Risco de fraude detectado: Transação ${transaction.id}`);
            }

        } catch (error) {
            console.error(`❌ Erro na análise de fraude da transação ${transaction.id}:`, error);
        }
    }

    /**
     * Atualizar score baseado em dados acadêmicos
     */
    async updateScoreFromAcademicData(academicData) {
        try {
            const scoreData = await apiIntegration.calculateScore(academicData.studentId, {
                academic_data: academicData
            });

            if (scoreData.success) {
                await db('users')
                    .where('id', academicData.studentId)
                    .update({
                        credit_score: scoreData.data.score,
                        risk_band: scoreData.data.riskBand,
                        updated_at: new Date()
                    });

                console.log(`📚 Score atualizado por dados acadêmicos: Estudante ${academicData.studentId}`);
            }

        } catch (error) {
            console.error(`❌ Erro ao atualizar score por dados acadêmicos:`, error);
        }
    }

    /**
     * Processar pagamento de parcela
     */
    async processInstallmentPayment(installment) {
        try {
            // Buscar dados do empréstimo
            const loan = await db('loans')
                .select('*')
                .where('id', installment.loan_id)
                .first();

            if (!loan) return;

            // Verificar saldo do usuário
            const balance = await apiIntegration.getUserBalance(loan.borrower_id);

            if (balance.data?.balance >= installment.amount) {
                // Processar pagamento
                await apiIntegration.processPayment({
                    user_id: loan.borrower_id,
                    amount: installment.amount,
                    description: `Pagamento parcela ${installment.installment_number}`,
                    installment_id: installment.id
                });

                // Atualizar status da parcela
                await db('loan_installments')
                    .where('id', installment.id)
                    .update({
                        status: 'paid',
                        paid_at: new Date(),
                        updated_at: new Date()
                    });

                console.log(`✅ Parcela ${installment.id} paga automaticamente`);

            } else {
                // Marcar como atrasada
                await db('loan_installments')
                    .where('id', installment.id)
                    .update({
                        status: 'overdue',
                        updated_at: new Date()
                    });

                console.log(`⚠️ Parcela ${installment.id} marcada como atrasada`);
            }

        } catch (error) {
            console.error(`❌ Erro ao processar parcela ${installment.id}:`, error);
        }
    }

    // ===== UTILITY METHODS =====

    /**
     * Validar CPF
     */
    validateCPF(cpf) {
        return cpf && cpf.length === 14;
    }

    /**
     * Validar idade
     */
    validateAge(birthDate) {
        if (!birthDate) return false;
        const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
        return age >= 18 && age <= 65;
    }

    /**
     * Obter status do serviço
     */
    getStatus() {
        return {
            isListening: this.isListening,
            eventHandlers: Array.from(this.eventHandlers.keys()),
            timestamp: new Date().toISOString()
        };
    }
}

// Singleton instance
const eventService = new EventService();

module.exports = {
    EventService,
    eventService
};
