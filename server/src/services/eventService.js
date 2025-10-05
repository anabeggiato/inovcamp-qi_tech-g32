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

        // Evento: Match aprovado (investidor aceita empréstimo)
        this.eventHandlers.set('match.approved', this.handleMatchApproved.bind(this));

        // Evento: Empréstimo desembolsado (implementar se necessário)
        // this.eventHandlers.set('loan.disbursed', this.handleLoanDisbursed.bind(this));

        // Evento: Match criado
        this.eventHandlers.set('match.created', this.handleMatchCreated.bind(this));

        // Evento: Notificação enviada
        this.eventHandlers.set('notification.send', this.handleNotificationSend.bind(this));
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

        // Iniciar jobs baseados em tempo
        this.startInstallmentCollectionJob();
        this.startContinuousAntifraudJob();
        this.startRiskMonitoringJob();
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

        // Parar jobs baseados em tempo
        if (this.installmentCollectionInterval) {
            clearInterval(this.installmentCollectionInterval);
            this.installmentCollectionInterval = null;
        }

        if (this.antifraudInterval) {
            clearInterval(this.antifraudInterval);
            this.antifraudInterval = null;
        }

        if (this.riskMonitoringInterval) {
            clearInterval(this.riskMonitoringInterval);
            this.riskMonitoringInterval = null;
        }

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
    async handleAcademicUpdated(eventData) {
        try {
            const { academicData } = eventData;
            console.log(`📚 Dados acadêmicos atualizados: Estudante ${academicData.studentId}`);

            // Recalcular score baseado em performance
            await this.updateScoreFromAcademicData(academicData);

            // Disparar notificação se score melhorou significativamente
            await this.checkScoreImprovement(academicData.studentId);

        } catch (error) {
            console.error(`❌ Erro ao processar dados acadêmicos atualizados:`, error);
        }
    }

    /**
     * Handler: Parcela vencida
     */
    async handleInstallmentDue(installment) {
        console.log(`⏰ Parcela vencida: R$ ${installment.amount} (ID: ${installment.id})`);

        // Processar cobrança
        await this.processInstallmentPayment(installment);
    }

    /**
     * Handler: Novo empréstimo criado
     */
    async handleLoanCreated(eventData) {
        try {
            const { loan } = eventData;
            console.log(`💰 Novo empréstimo criado: R$ ${loan.amount} (ID: ${loan.id})`);

            // Buscar matches automáticos para este empréstimo
            await this.findAutomaticMatches(loan);

        } catch (error) {
            console.error(`❌ Erro ao processar novo empréstimo:`, error);
        }
    }

    /**
     * Handler: Nova oferta criada
     */
    async handleOfferCreated(eventData) {
        try {
            const { offer } = eventData;
            console.log(`💎 Nova oferta criada: R$ ${offer.amount_available} (ID: ${offer.id})`);

            // Buscar empréstimos compatíveis para esta oferta
            await this.findCompatibleLoans(offer);

        } catch (error) {
            console.error(`❌ Erro ao processar nova oferta:`, error);
        }
    }

    /**
     * Handler: Match criado
     */
    async handleMatchCreated(eventData) {
        try {
            const { match, loan, offer } = eventData;
            console.log(`🤝 Match criado: ${match.id} - R$ ${match.amount_matched}`);

            // Disparar notificação para o investidor
            await this.emitEvent('notification.send', {
                type: 'match_created',
                user_id: offer.investor_id,
                title: 'Nova Oportunidade de Investimento!',
                message: `Um empréstimo de R$ ${match.amount_matched} está disponível para sua oferta.`,
                data: {
                    match_id: match.id,
                    loan_id: loan.id,
                    amount: match.amount_matched,
                    borrower_name: loan.borrower_name
                }
            });

            // Disparar notificação para o estudante
            await this.emitEvent('notification.send', {
                type: 'match_created',
                user_id: loan.borrower_id,
                title: 'Oferta de Investimento Recebida!',
                message: `Sua solicitação de empréstimo de R$ ${match.amount_matched} recebeu uma oferta de investimento.`,
                data: {
                    match_id: match.id,
                    offer_id: offer.id,
                    amount: match.amount_matched,
                    rate: match.rate
                }
            });

        } catch (error) {
            console.error(`❌ Erro ao processar match criado:`, error);
        }
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
            console.log(`📊 Recalculando score para estudante ${academicData.studentId}`);

            // Buscar score atual
            const currentUser = await db('users')
                .select('credit_score', 'risk_band', 'name')
                .where('id', academicData.studentId)
                .first();

            if (!currentUser) {
                console.error(`❌ Usuário ${academicData.studentId} não encontrado`);
                return;
            }

            const oldScore = currentUser.credit_score;
            const oldRiskBand = currentUser.risk_band;

            // Recalcular score via Score Engine
            const scoreData = await apiIntegration.calculateScore(academicData.studentId, {
                academic_data: academicData,
                recalculate: true
            });

            if (scoreData.success) {
                const newScore = scoreData.data.score;
                const newRiskBand = scoreData.data.riskBand;

                // Atualizar no banco
                await db('users')
                    .where('id', academicData.studentId)
                    .update({
                        credit_score: newScore,
                        risk_band: newRiskBand,
                        updated_at: new Date()
                    });

                // Registrar histórico de score
                await db('scores').insert({
                    user_id: academicData.studentId,
                    score: newScore,
                    risk_band: newRiskBand,
                    fraud_score: scoreData.data.fraudScore || 0,
                    fraud_status: scoreData.data.fraudStatus || 'ok',
                    academic_score: scoreData.data.academicScore || 0,
                    attendance_score: scoreData.data.attendanceScore || 0,
                    payment_score: scoreData.data.paymentScore || 0,
                    created_at: new Date()
                });

                console.log(`📊 Score atualizado: ${oldScore} → ${newScore} (${oldRiskBand} → ${newRiskBand})`);

                // Verificar se houve melhoria significativa
                const scoreImprovement = newScore - oldScore;
                if (scoreImprovement >= 50) {
                    console.log(`🎉 Melhoria significativa no score: +${scoreImprovement} pontos`);
                }

            } else {
                console.error(`❌ Erro ao recalcular score:`, scoreData.error);
            }

        } catch (error) {
            console.error(`❌ Erro ao atualizar score por dados acadêmicos:`, error);
        }
    }

    /**
     * Verificar melhoria no score e enviar notificação
     */
    async checkScoreImprovement(studentId) {
        try {
            // Buscar scores recentes
            const recentScores = await db('scores')
                .select('score', 'risk_band', 'created_at')
                .where('user_id', studentId)
                .orderBy('created_at', 'desc')
                .limit(2);

            if (recentScores.length >= 2) {
                const currentScore = recentScores[0].score;
                const previousScore = recentScores[1].score;
                const improvement = currentScore - previousScore;

                if (improvement >= 50) {
                    // Buscar dados do usuário
                    const user = await db('users')
                        .select('name', 'email')
                        .where('id', studentId)
                        .first();

                    if (user) {
                        await this.emitEvent('notification.send', {
                            type: 'score_improvement',
                            user_id: studentId,
                            title: 'Score Melhorado! 🎉',
                            message: `Parabéns! Seu score de crédito melhorou ${improvement} pontos e agora é ${currentScore}.`,
                            data: {
                                old_score: previousScore,
                                new_score: currentScore,
                                improvement: improvement
                            }
                        });

                        console.log(`🎉 Notificação de melhoria enviada para ${user.name}: +${improvement} pontos`);
                    }
                }
            }

        } catch (error) {
            console.error(`❌ Erro ao verificar melhoria no score:`, error);
        }
    }

    /**
     * Processar pagamento de parcela
     */
    async processInstallmentPayment(installment) {
        try {
            console.log(`💳 Processando pagamento da parcela ${installment.id} - R$ ${installment.amount}`);

            // Buscar dados do empréstimo
            const loan = await db('loans')
                .select('*')
                .where('id', installment.loan_id)
                .first();

            if (!loan) {
                console.error(`❌ Empréstimo não encontrado para parcela ${installment.id}`);
                return;
            }

            // Verificar saldo do usuário via Payment API
            const balance = await apiIntegration.getUserBalance(loan.borrower_id);

            if (balance.success && balance.data?.balance >= installment.amount) {
                console.log(`💰 Saldo suficiente: R$ ${balance.data.balance} >= R$ ${installment.amount}`);

                // Processar pagamento via Payment API
                const paymentResult = await apiIntegration.createPayment({
                    from_user_id: loan.borrower_id,
                    to_user_id: loan.school_id, // Pagamento para a faculdade
                    amount: installment.amount,
                    payment_method: 'automatic',
                    description: `Pagamento automático - Parcela ${installment.installment_number} - Empréstimo ${loan.id}`,
                    installment_id: installment.id,
                    loan_id: loan.id
                });

                if (paymentResult.success) {
                    // Atualizar status da parcela
                    await db('loan_installments')
                        .where('id', installment.id)
                        .update({
                            status: 'paid',
                            paid_at: new Date(),
                            payment_id: paymentResult.data?.paymentId,
                            updated_at: new Date()
                        });

                    console.log(`✅ Parcela ${installment.id} paga automaticamente`);

                    // Disparar notificação de pagamento
                    await this.emitEvent('notification.send', {
                        type: 'installment_paid',
                        user_id: loan.borrower_id,
                        title: 'Parcela Paga Automaticamente',
                        message: `Sua parcela ${installment.installment_number} de R$ ${installment.amount} foi paga automaticamente.`,
                        data: {
                            installment_id: installment.id,
                            amount: installment.amount,
                            payment_id: paymentResult.data?.paymentId
                        }
                    });

                } else {
                    console.error(`❌ Erro no pagamento da parcela ${installment.id}:`, paymentResult.error);
                    await this.markInstallmentAsFailed(installment, paymentResult.error);
                }

            } else {
                console.log(`⚠️ Saldo insuficiente: R$ ${balance.data?.balance || 0} < R$ ${installment.amount}`);
                await this.markInstallmentAsOverdue(installment);
            }

        } catch (error) {
            console.error(`❌ Erro ao processar parcela ${installment.id}:`, error);
            await this.markInstallmentAsFailed(installment, error.message);
        }
    }

    /**
     * Marcar parcela como atrasada
     */
    async markInstallmentAsOverdue(installment) {
        try {
            await db('loan_installments')
                .where('id', installment.id)
                .update({
                    status: 'overdue',
                    updated_at: new Date()
                });

            console.log(`⚠️ Parcela ${installment.id} marcada como atrasada`);

            // Disparar notificação de atraso
            const loan = await db('loans')
                .select('borrower_id')
                .where('id', installment.loan_id)
                .first();

            if (loan) {
                await this.emitEvent('notification.send', {
                    type: 'installment_overdue',
                    user_id: loan.borrower_id,
                    title: 'Parcela em Atraso',
                    message: `Sua parcela ${installment.installment_number} de R$ ${installment.amount} está em atraso.`,
                    data: {
                        installment_id: installment.id,
                        amount: installment.amount,
                        due_date: installment.due_date
                    }
                });
            }

        } catch (error) {
            console.error(`❌ Erro ao marcar parcela como atrasada:`, error);
        }
    }

    /**
     * Marcar parcela como falha no pagamento
     */
    async markInstallmentAsFailed(installment, errorMessage) {
        try {
            await db('loan_installments')
                .where('id', installment.id)
                .update({
                    status: 'payment_failed',
                    error_message: errorMessage,
                    updated_at: new Date()
                });

            console.log(`❌ Parcela ${installment.id} marcada como falha no pagamento`);

        } catch (error) {
            console.error(`❌ Erro ao marcar parcela como falha:`, error);
        }
    }

    /**
     * Handler: Match aprovado (investidor aceita empréstimo)
     * Processa o repasse de dinheiro para a faculdade
     */
    async handleMatchApproved(eventData) {
        try {
            const { match, loan, offer } = eventData;

            console.log(`🎯 Processando match aprovado: ${match.id}`);
            console.log(`💰 Valor: R$ ${match.amount_matched}`);
            console.log(`👨‍🎓 Estudante: ${loan.borrower_id}`);
            console.log(`🏦 Faculdade: ${loan.school_id}`);

            // 1. Atualizar status do empréstimo para "funded"
            await db('loans')
                .where('id', loan.id)
                .update({
                    status: 'funded',
                    funded_at: new Date(),
                    updated_at: new Date()
                });

            console.log(`✅ Empréstimo ${loan.id} marcado como financiado`);

            // 2. Processar repasse via Payment API
            try {
                const disbursementData = {
                    loan_id: loan.id,
                    match_id: match.id,
                    amount: match.amount_matched,
                    from_investor: offer.investor_id,
                    to_school: loan.school_id,
                    student_id: loan.borrower_id,
                    description: `Desembolso P2P - Empréstimo ${loan.id} - Match ${match.id}`
                };

                const disbursementResult = await apiIntegration.processDisbursement(disbursementData);

                if (disbursementResult.success) {
                    console.log(`🏦 Repasse processado: ${disbursementResult.paymentId}`);

                    // 3. Atualizar status do match para "disbursed"
                    await db('matches')
                        .where('id', match.id)
                        .update({
                            status: 'disbursed',
                            disbursed_at: new Date(),
                            payment_id: disbursementResult.paymentId,
                            updated_at: new Date()
                        });

                    console.log(`✅ Match ${match.id} marcado como desembolsado`);

                    // 4. Gerar contrato digital
                    await this.generateContract(loan, match, offer);

                    // 5. Disparar evento de desembolso concluído (comentado por enquanto)
                    // await this.emitEvent('loan.disbursed', {
                    //     loan,
                    //     match,
                    //     disbursement: disbursementResult
                    // });

                } else {
                    console.error(`❌ Erro no repasse: ${disbursementResult.error}`);

                    // Marcar match como erro
                    await db('matches')
                        .where('id', match.id)
                        .update({
                            status: 'disbursement_failed',
                            error_message: disbursementResult.error,
                            updated_at: new Date()
                        });
                }

            } catch (paymentError) {
                console.error(`❌ Erro na API de pagamentos:`, paymentError);

                // Marcar match como erro
                await db('matches')
                    .where('id', match.id)
                    .update({
                        status: 'disbursement_failed',
                        error_message: paymentError.message,
                        updated_at: new Date()
                    });
            }

        } catch (error) {
            console.error(`❌ Erro ao processar match aprovado:`, error);
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
     * Buscar matches automáticos para um empréstimo
     */
    async findAutomaticMatches(loan) {
        try {
            console.log(`🔍 Buscando matches automáticos para empréstimo ${loan.id}`);

            // Buscar ofertas ativas compatíveis
            const compatibleOffers = await db('offers')
                .select('offers.*', 'users.name as investor_name')
                .join('users', 'offers.investor_id', 'users.id')
                .where('offers.status', 'active')
                .where('offers.amount_available', '>=', loan.amount)
                .where('offers.term_months', '>=', loan.term_months)
                .orderBy('offers.min_rate', 'asc')
                .limit(5);

            console.log(`📊 Encontradas ${compatibleOffers.length} ofertas compatíveis`);

            // Criar matches para as melhores ofertas
            for (const offer of compatibleOffers) {
                try {
                    const matchAmount = Math.min(parseFloat(loan.amount), parseFloat(offer.amount_available));

                    const [newMatch] = await db('matches').insert({
                        loan_id: loan.id,
                        offer_id: offer.id,
                        amount_matched: matchAmount,
                        rate: offer.min_rate,
                        status: 'pending',
                        created_at: new Date(),
                        updated_at: new Date()
                    }).returning('*');

                    console.log(`✅ Match automático criado: ${newMatch.id} (R$ ${matchAmount})`);

                    // Disparar evento de match criado
                    await this.emitEvent('match.created', {
                        match: newMatch,
                        loan: loan,
                        offer: offer
                    });

                } catch (matchError) {
                    console.error(`❌ Erro ao criar match automático:`, matchError);
                }
            }

        } catch (error) {
            console.error(`❌ Erro ao buscar matches automáticos:`, error);
        }
    }

    /**
     * Handler: Enviar notificação
     */
    async handleNotificationSend(eventData) {
        try {
            const { type, user_id, title, message, data } = eventData;

            console.log(`📧 Enviando notificação: ${type} para usuário ${user_id}`);
            console.log(`   Título: ${title}`);
            console.log(`   Mensagem: ${message}`);

            // Buscar dados do usuário
            const user = await db('users')
                .select('name', 'email', 'role')
                .where('id', user_id)
                .first();

            if (!user) {
                console.error(`❌ Usuário ${user_id} não encontrado para notificação`);
                return;
            }

            // Criar registro de notificação no banco
            const [notification] = await db('notifications').insert({
                user_id: user_id,
                type: type,
                title: title,
                message: message,
                data: JSON.stringify(data || {}),
                status: 'sent',
                sent_at: new Date(),
                created_at: new Date(),
                updated_at: new Date()
            }).returning('*');

            console.log(`✅ Notificação ${notification.id} registrada para ${user.name}`);

            // Simular envio (em produção seria email/SMS/push)
            await this.simulateNotificationDelivery(notification, user);

        } catch (error) {
            console.error(`❌ Erro ao enviar notificação:`, error);
        }
    }

    /**
     * Simular entrega de notificação
     */
    async simulateNotificationDelivery(notification, user) {
        try {
            // Simular delay de entrega
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Atualizar status para entregue
            await db('notifications')
                .where('id', notification.id)
                .update({
                    status: 'delivered',
                    delivered_at: new Date(),
                    updated_at: new Date()
                });

            console.log(`📬 Notificação ${notification.id} entregue para ${user.name} (${user.email})`);

            // Log da notificação (simulando email/SMS)
            console.log(`\n📧 === NOTIFICAÇÃO ENVIADA ===`);
            console.log(`Para: ${user.name} <${user.email}>`);
            console.log(`Tipo: ${notification.type}`);
            console.log(`Título: ${notification.title}`);
            console.log(`Mensagem: ${notification.message}`);
            if (notification.data) {
                console.log(`Dados: ${notification.data}`);
            }
            console.log(`===============================\n`);

        } catch (error) {
            console.error(`❌ Erro ao simular entrega:`, error);
        }
    }

    /**
     * Buscar empréstimos compatíveis para uma oferta
     */
    async findCompatibleLoans(offer) {
        try {
            console.log(`🔍 Buscando empréstimos compatíveis para oferta ${offer.id}`);

            // Buscar empréstimos pendentes compatíveis
            const compatibleLoans = await db('loans')
                .select('loans.*', 'users.name as borrower_name', 'scores.score', 'scores.risk_band')
                .join('users', 'loans.borrower_id', 'users.id')
                .leftJoin('scores', 'loans.borrower_id', 'scores.user_id')
                .where('loans.status', 'pending')
                .where('loans.amount', '<=', offer.amount_available)
                .where('loans.term_months', '<=', offer.term_months)
                .where('scores.score', '>', 40) // Score mínimo
                .where('scores.risk_band', '!=', 'high') // Não alto risco
                .orderBy('scores.score', 'desc')
                .limit(5);

            console.log(`📊 Encontrados ${compatibleLoans.length} empréstimos compatíveis`);

            // Criar matches para os melhores empréstimos
            for (const loan of compatibleLoans) {
                try {
                    const matchAmount = Math.min(parseFloat(loan.amount), parseFloat(offer.amount_available));

                    const [newMatch] = await db('matches').insert({
                        loan_id: loan.id,
                        offer_id: offer.id,
                        amount_matched: matchAmount,
                        rate: offer.min_rate,
                        status: 'pending',
                        created_at: new Date(),
                        updated_at: new Date()
                    }).returning('*');

                    console.log(`✅ Match automático criado: ${newMatch.id} (R$ ${matchAmount})`);

                    // Disparar evento de match criado
                    await this.emitEvent('match.created', {
                        match: newMatch,
                        loan: loan,
                        offer: offer
                    });

                } catch (matchError) {
                    console.error(`❌ Erro ao criar match automático:`, matchError);
                }
            }

        } catch (error) {
            console.error(`❌ Erro ao buscar empréstimos compatíveis:`, error);
        }
    }

    /**
     * Iniciar job de cobrança automática de parcelas
     */
    startInstallmentCollectionJob() {
        console.log('⏰ Iniciando job de cobrança automática de parcelas...');

        // Executar a cada 1 hora (3600000 ms)
        this.installmentCollectionInterval = setInterval(async () => {
            try {
                await this.processDueInstallments();
            } catch (error) {
                console.error('❌ Erro no job de cobrança:', error);
            }
        }, 3600000); // 1 hora

        // Executar imediatamente na primeira vez
        setTimeout(async () => {
            try {
                await this.processDueInstallments();
            } catch (error) {
                console.error('❌ Erro na primeira execução do job de cobrança:', error);
            }
        }, 5000); // 5 segundos após inicialização

        console.log('✅ Job de cobrança automática iniciado (executa a cada 1 hora)');
    }

    /**
     * Processar parcelas vencidas
     */
    async processDueInstallments() {
        try {
            console.log('🔍 Verificando parcelas vencidas...');

            // Buscar parcelas vencidas
            const dueInstallments = await db('loan_installments')
                .select('loan_installments.*', 'loans.borrower_id', 'users.name as borrower_name', 'users.email')
                .join('loans', 'loan_installments.loan_id', 'loans.id')
                .join('users', 'loans.borrower_id', 'users.id')
                .where('loan_installments.status', 'pending')
                .where('loan_installments.due_date', '<=', new Date())
                .orderBy('loan_installments.due_date', 'asc');

            console.log(`📊 Encontradas ${dueInstallments.length} parcelas vencidas`);

            for (const installment of dueInstallments) {
                try {
                    // Disparar evento de parcela vencida
                    await this.emitEvent('installment.due', installment);
                    console.log(`🎯 Evento installment.due disparado para parcela ${installment.id}`);

                } catch (error) {
                    console.error(`❌ Erro ao processar parcela ${installment.id}:`, error);
                }
            }

        } catch (error) {
            console.error('❌ Erro ao verificar parcelas vencidas:', error);
        }
    }

    /**
     * Iniciar job de antifraude contínuo
     */
    startContinuousAntifraudJob() {
        console.log('🛡️ Iniciando job de antifraude contínuo...');

        // Executar a cada 30 minutos (1800000 ms)
        this.antifraudInterval = setInterval(async () => {
            try {
                await this.runContinuousAntifraud();
            } catch (error) {
                console.error('❌ Erro no job de antifraude:', error);
            }
        }, 1800000); // 30 minutos

        // Executar imediatamente na primeira vez
        setTimeout(async () => {
            try {
                await this.runContinuousAntifraud();
            } catch (error) {
                console.error('❌ Erro na primeira execução do job de antifraude:', error);
            }
        }, 10000); // 10 segundos após inicialização

        console.log('✅ Job de antifraude contínuo iniciado (executa a cada 30 minutos)');
    }

    /**
     * Executar análise de antifraude contínua
     */
    async runContinuousAntifraud() {
        try {
            console.log('🛡️ Executando análise de antifraude contínua...');

            // Buscar usuários ativos
            const activeUsers = await db('users')
                .select('users.*', 'scores.score', 'scores.risk_band')
                .leftJoin('scores', 'users.id', 'scores.user_id')
                .where('users.role', 'student')
                .where('users.status', 'active')
                .orderBy('scores.created_at', 'desc');

            console.log(`📊 Analisando ${activeUsers.length} usuários ativos`);

            for (const user of activeUsers) {
                try {
                    // Verificar sinais de risco
                    const riskSignals = await this.detectRiskSignals(user);

                    if (riskSignals.length > 0) {
                        console.log(`⚠️ Sinais de risco detectados para ${user.name}:`, riskSignals);

                        // Atualizar status de fraude
                        await this.updateFraudStatus(user, riskSignals);

                        // Disparar notificação se risco alto
                        if (riskSignals.some(signal => signal.severity === 'high')) {
                            await this.emitEvent('notification.send', {
                                type: 'risk_alert',
                                user_id: user.id,
                                title: 'Alerta de Risco Detectado',
                                message: `Sinais de risco foram detectados em sua conta. Verifique seus dados acadêmicos.`,
                                data: {
                                    risk_signals: riskSignals,
                                    user_id: user.id
                                }
                            });
                        }
                    }

                } catch (error) {
                    console.error(`❌ Erro ao analisar usuário ${user.id}:`, error);
                }
            }

        } catch (error) {
            console.error('❌ Erro na análise de antifraude contínua:', error);
        }
    }

    /**
     * Detectar sinais de risco para um usuário
     */
    async detectRiskSignals(user) {
        const riskSignals = [];

        try {
            // 1. Verificar dados acadêmicos via Faculty API
            const academicData = await apiIntegration.getAcademicData(user.id);

            if (academicData.success) {
                const academic = academicData.data;

                // Verificar frequência baixa
                if (academic.attendancePct < 70) {
                    riskSignals.push({
                        type: 'low_attendance',
                        severity: 'medium',
                        description: `Frequência baixa: ${academic.attendancePct}%`,
                        value: academic.attendancePct
                    });
                }

                // Verificar notas baixas
                if (academic.gradeAvg < 6.0) {
                    riskSignals.push({
                        type: 'low_grades',
                        severity: 'medium',
                        description: `Notas baixas: ${academic.gradeAvg}`,
                        value: academic.gradeAvg
                    });
                }

                // Verificar status acadêmico
                if (academic.status === 'suspended' || academic.status === 'dropped') {
                    riskSignals.push({
                        type: 'academic_status',
                        severity: 'high',
                        description: `Status acadêmico: ${academic.status}`,
                        value: academic.status
                    });
                }
            }

            // 2. Verificar histórico de pagamentos
            const paymentHistory = await apiIntegration.getUserTransactions(user.id);

            if (paymentHistory.success) {
                const transactions = paymentHistory.data.transactions || [];
                const overdueCount = transactions.filter(t => t.status === 'overdue').length;

                if (overdueCount > 2) {
                    riskSignals.push({
                        type: 'payment_history',
                        severity: 'high',
                        description: `Múltiplos atrasos: ${overdueCount} parcelas`,
                        value: overdueCount
                    });
                }
            }

            // 3. Verificar transações suspeitas
            const recentTransactions = await db('transactions')
                .select('*')
                .where('user_id', user.id)
                .where('created_at', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Últimos 7 dias
                .orderBy('created_at', 'desc');

            if (recentTransactions.length > 10) {
                riskSignals.push({
                    type: 'high_activity',
                    severity: 'medium',
                    description: `Alta atividade: ${recentTransactions.length} transações em 7 dias`,
                    value: recentTransactions.length
                });
            }

        } catch (error) {
            console.error(`❌ Erro ao detectar sinais de risco para usuário ${user.id}:`, error);
        }

        return riskSignals;
    }

    /**
     * Atualizar status de fraude do usuário
     */
    async updateFraudStatus(user, riskSignals) {
        try {
            // Calcular score de fraude baseado nos sinais
            let fraudScore = 0;
            let fraudStatus = 'ok';

            for (const signal of riskSignals) {
                switch (signal.severity) {
                    case 'high':
                        fraudScore += 30;
                        break;
                    case 'medium':
                        fraudScore += 15;
                        break;
                    case 'low':
                        fraudScore += 5;
                        break;
                }
            }

            // Determinar status
            if (fraudScore >= 50) {
                fraudStatus = 'high_risk';
            } else if (fraudScore >= 25) {
                fraudStatus = 'medium_risk';
            } else if (fraudScore > 0) {
                fraudStatus = 'low_risk';
            }

            // Atualizar no banco
            await db('users')
                .where('id', user.id)
                .update({
                    fraud_score: fraudScore,
                    fraud_status: fraudStatus,
                    updated_at: new Date()
                });

            // Registrar no histórico de fraudes (tabela já existe)
            await db('frauds').insert({
                user_id: user.id,
                fraud_score: fraudScore,
                fraud_status: fraudStatus,
                risk_signals: JSON.stringify(riskSignals),
                detected_at: new Date()
            });

            console.log(`🛡️ Status de fraude atualizado para ${user.name}: ${fraudStatus} (score: ${fraudScore})`);

        } catch (error) {
            console.error(`❌ Erro ao atualizar status de fraude:`, error);
        }
    }

    /**
     * Gerar contrato digital
     */
    async generateContract(loan, match, offer) {
        try {
            console.log(`📄 Gerando contrato digital para empréstimo ${loan.id}`);

            // Buscar dados completos
            const borrower = await db('users')
                .select('name', 'email', 'cpf', 'birth_date')
                .where('id', loan.borrower_id)
                .first();

            const investor = await db('users')
                .select('name', 'email', 'cpf')
                .where('id', offer.investor_id)
                .first();

            const school = await db('institutions')
                .select('name', 'cnpj')
                .where('id', loan.school_id)
                .first();

            // Gerar número do contrato
            const contractNumber = `CTR-${Date.now()}-${loan.id}`;

            // Criar dados do contrato
            const contractData = {
                contract_number: contractNumber,
                generated_at: new Date().toISOString(),
                status: 'generated',

                // Dados das partes
                borrower: {
                    id: loan.borrower_id,
                    name: borrower.name,
                    email: borrower.email,
                    cpf: borrower.cpf,
                    birth_date: borrower.birth_date
                },
                investor: {
                    id: offer.investor_id,
                    name: investor.name,
                    email: investor.email,
                    cpf: investor.cpf
                },
                school: {
                    id: loan.school_id,
                    name: school.name,
                    cnpj: school.cnpj
                },

                // Termos do contrato
                terms: {
                    loan_amount: parseFloat(loan.amount),
                    term_months: loan.term_months,
                    interest_rate: parseFloat(match.rate),
                    installment_amount: parseFloat(loan.amount) / loan.term_months,
                    origination_fee: parseFloat(loan.origination_pct || 0),
                    custody_fee: parseFloat(loan.custody_pct_monthly || 0),
                    marketplace_fee: parseFloat(loan.marketplace_pct || 0)
                },

                // Dados do match
                match: {
                    id: match.id,
                    amount_matched: parseFloat(match.amount_matched),
                    rate: parseFloat(match.rate),
                    created_at: match.created_at
                },

                // Cláusulas do contrato
                clauses: [
                    "O mutuário se compromete a pagar as parcelas mensais no prazo estabelecido",
                    "Em caso de atraso, será cobrada multa de 2% ao mês",
                    "O investidor receberá os juros conforme taxa acordada",
                    "A QI-EDU atua como intermediária e cobra taxas de administração",
                    "O contrato pode ser rescindido em caso de inadimplência superior a 90 dias"
                ]
            };

            // Atualizar empréstimo com dados do contrato
            await db('loans')
                .where('id', loan.id)
                .update({
                    contract_json: JSON.stringify(contractData),
                    status: 'contracted',
                    updated_at: new Date()
                });

            console.log(`✅ Contrato ${contractNumber} gerado e salvo`);

            // Disparar notificações
            await this.emitEvent('notification.send', {
                type: 'contract_generated',
                user_id: loan.borrower_id,
                title: 'Contrato Gerado!',
                message: `Seu contrato de empréstimo ${contractNumber} foi gerado e está disponível.`,
                data: {
                    contract_number: contractNumber,
                    loan_id: loan.id,
                    amount: loan.amount
                }
            });

            await this.emitEvent('notification.send', {
                type: 'contract_generated',
                user_id: offer.investor_id,
                title: 'Contrato de Investimento Gerado!',
                message: `O contrato ${contractNumber} para seu investimento foi gerado.`,
                data: {
                    contract_number: contractNumber,
                    match_id: match.id,
                    amount: match.amount_matched
                }
            });

        } catch (error) {
            console.error(`❌ Erro ao gerar contrato:`, error);
        }
    }

    /**
     * Iniciar job de monitoramento de risco (evasão)
     */
    startRiskMonitoringJob() {
        console.log('📊 Iniciando job de monitoramento de risco...');

        // Executar a cada 6 horas (21600000 ms)
        this.riskMonitoringInterval = setInterval(async () => {
            try {
                await this.runRiskMonitoring();
            } catch (error) {
                console.error('❌ Erro no job de monitoramento de risco:', error);
            }
        }, 21600000); // 6 horas

        // Executar imediatamente na primeira vez
        setTimeout(async () => {
            try {
                await this.runRiskMonitoring();
            } catch (error) {
                console.error('❌ Erro na primeira execução do job de monitoramento:', error);
            }
        }, 15000); // 15 segundos após inicialização

        console.log('✅ Job de monitoramento de risco iniciado (executa a cada 6 horas)');
    }

    /**
     * Executar monitoramento de risco de evasão
     */
    async runRiskMonitoring() {
        try {
            console.log('📊 Executando monitoramento de risco de evasão...');

            // Buscar estudantes com empréstimos ativos
            const activeStudents = await db('loans')
                .select(
                    'loans.*',
                    'users.name as student_name',
                    'users.email as student_email',
                    'users.id as student_id',
                    'institutions.name as school_name'
                )
                .join('users', 'loans.borrower_id', 'users.id')
                .join('institutions', 'loans.school_id', 'institutions.id')
                .where('loans.status', 'active')
                .where('users.role', 'student');

            console.log(`📊 Monitorando ${activeStudents.length} estudantes com empréstimos ativos`);

            for (const student of activeStudents) {
                try {
                    // Verificar sinais de evasão
                    const riskSignals = await this.detectEvasionSignals(student);

                    if (riskSignals.length > 0) {
                        console.log(`⚠️ Sinais de evasão detectados para ${student.student_name}:`, riskSignals);

                        // Calcular score de evasão
                        const evasionScore = this.calculateEvasionScore(riskSignals);

                        // Atualizar status de risco
                        await this.updateEvasionStatus(student, evasionScore, riskSignals);

                        // Disparar alertas se necessário
                        if (evasionScore >= 70) {
                            await this.triggerEvasionAlerts(student, evasionScore, riskSignals);
                        }
                    }

                } catch (error) {
                    console.error(`❌ Erro ao monitorar estudante ${student.student_id}:`, error);
                }
            }

        } catch (error) {
            console.error('❌ Erro no monitoramento de risco:', error);
        }
    }

    /**
     * Detectar sinais de evasão
     */
    async detectEvasionSignals(student) {
        const signals = [];

        try {
            // 1. Verificar dados acadêmicos
            const academicData = await apiIntegration.getAcademicData(student.student_id);

            if (academicData.success) {
                const academic = academicData.data;

                // Frequência muito baixa
                if (academic.attendancePct < 50) {
                    signals.push({
                        type: 'very_low_attendance',
                        severity: 'high',
                        description: `Frequência crítica: ${academic.attendancePct}%`,
                        value: academic.attendancePct,
                        weight: 30
                    });
                }

                // Status acadêmico problemático
                if (academic.status === 'dropped' || academic.status === 'suspended') {
                    signals.push({
                        type: 'academic_dropout',
                        severity: 'critical',
                        description: `Status acadêmico: ${academic.status}`,
                        value: academic.status,
                        weight: 50
                    });
                }

                // Notas muito baixas
                if (academic.gradeAvg < 4.0) {
                    signals.push({
                        type: 'very_low_grades',
                        severity: 'high',
                        description: `Notas críticas: ${academic.gradeAvg}`,
                        value: academic.gradeAvg,
                        weight: 25
                    });
                }
            }

            // 2. Verificar histórico de pagamentos
            const paymentHistory = await apiIntegration.getUserTransactions(student.student_id);

            if (paymentHistory.success) {
                const transactions = paymentHistory.data.transactions || [];
                const overdueCount = transactions.filter(t => t.status === 'overdue').length;
                const failedCount = transactions.filter(t => t.status === 'failed').length;

                // Múltiplos atrasos
                if (overdueCount >= 3) {
                    signals.push({
                        type: 'multiple_overdue',
                        severity: 'high',
                        description: `Múltiplos atrasos: ${overdueCount} parcelas`,
                        value: overdueCount,
                        weight: 20
                    });
                }

                // Pagamentos falhados
                if (failedCount >= 2) {
                    signals.push({
                        type: 'payment_failures',
                        severity: 'medium',
                        description: `Falhas de pagamento: ${failedCount}`,
                        value: failedCount,
                        weight: 15
                    });
                }
            }

            // 3. Verificar atividade na plataforma
            const lastLogin = await db('users')
                .select('last_login')
                .where('id', student.student_id)
                .first();

            if (lastLogin && lastLogin.last_login) {
                const daysSinceLogin = Math.floor((Date.now() - new Date(lastLogin.last_login)) / (1000 * 60 * 60 * 24));

                if (daysSinceLogin > 30) {
                    signals.push({
                        type: 'inactive_user',
                        severity: 'medium',
                        description: `Usuário inativo há ${daysSinceLogin} dias`,
                        value: daysSinceLogin,
                        weight: 10
                    });
                }
            }

        } catch (error) {
            console.error(`❌ Erro ao detectar sinais de evasão:`, error);
        }

        return signals;
    }

    /**
     * Calcular score de evasão
     */
    calculateEvasionScore(signals) {
        let totalScore = 0;

        for (const signal of signals) {
            totalScore += signal.weight;
        }

        // Normalizar para 0-100
        return Math.min(totalScore, 100);
    }

    /**
     * Atualizar status de evasão
     */
    async updateEvasionStatus(student, evasionScore, signals) {
        try {
            let riskLevel = 'low';

            if (evasionScore >= 70) {
                riskLevel = 'high';
            } else if (evasionScore >= 40) {
                riskLevel = 'medium';
            }

            // Atualizar no banco
            await db('loans')
                .where('id', student.id)
                .update({
                    evasion_score: evasionScore,
                    risk_level: riskLevel,
                    updated_at: new Date()
                });

            console.log(`📊 Status de evasão atualizado para ${student.student_name}: ${riskLevel} (score: ${evasionScore})`);

        } catch (error) {
            console.error(`❌ Erro ao atualizar status de evasão:`, error);
        }
    }

    /**
     * Disparar alertas de evasão
     */
    async triggerEvasionAlerts(student, evasionScore, signals) {
        try {
            console.log(`🚨 ALERTA DE EVASÃO: ${student.student_name} (score: ${evasionScore})`);

            // Notificar o estudante
            await this.emitEvent('notification.send', {
                type: 'evasion_alert',
                user_id: student.student_id,
                title: 'Alerta de Risco Acadêmico',
                message: `Detectamos sinais de risco em sua jornada acadêmica. Entre em contato conosco para suporte.`,
                data: {
                    evasion_score: evasionScore,
                    risk_signals: signals,
                    loan_id: student.id
                }
            });

            // Notificar administradores (simulado)
            console.log(`📧 Notificação enviada para administradores sobre ${student.student_name}`);
            console.log(`📊 Score de evasão: ${evasionScore}`);
            console.log(`⚠️ Sinais detectados:`, signals.map(s => s.description).join(', '));

        } catch (error) {
            console.error(`❌ Erro ao disparar alertas de evasão:`, error);
        }
    }

    /**
     * Obter status do serviço
     */
    getStatus() {
        return {
            isListening: this.isListening,
            eventHandlers: Array.from(this.eventHandlers.keys()),
            installmentCollectionActive: !!this.installmentCollectionInterval,
            antifraudActive: !!this.antifraudInterval,
            riskMonitoringActive: !!this.riskMonitoringInterval,
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
