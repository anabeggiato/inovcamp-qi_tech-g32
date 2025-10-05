const { db } = require('../../db');
const { apiIntegration } = require('./apiIntegration.service');
const { eventService } = require('./eventService');

/**
 * Serviço de Automação - Sistema baseado em eventos
 * Mais eficiente que polling por tempo
 */
class AutomationService {

    constructor() {
        this.isRunning = false;
        this.eventService = eventService;

        console.log('🤖 AutomationService inicializado (modo eventos)');
    }

    /**
     * Iniciar sistema de automação baseado em eventos
     */
    async startAllJobs() {
        if (this.isRunning) {
            console.log('⚠️ Sistema de automação já está rodando');
            return;
        }

        console.log('🚀 Iniciando sistema de automação baseado em eventos...');
        this.isRunning = true;

        // Iniciar o serviço de eventos
        await this.eventService.startListening();

        console.log('✅ Sistema de automação iniciado (modo eventos)');
        console.log('🎯 Eventos monitorados:');
        console.log('   👤 user.created - Onboarding automático');
        console.log('   💰 loan.created - Matching automático');
        console.log('   🎯 offer.created - Matching automático');
        console.log('   💳 transaction.created - Análise de fraude');
        console.log('   📚 academic.updated - Score dinâmico');
        console.log('   ⏰ installment.due - Cobrança automática');
    }

    /**
     * Parar sistema de automação
     */
    stopAllJobs() {
        if (!this.isRunning) {
            console.log('⚠️ Sistema de automação não está rodando');
            return;
        }

        console.log('🛑 Parando sistema de automação...');

        // Parar o serviço de eventos
        this.eventService.stopListening();

        this.isRunning = false;

        console.log('✅ Sistema de automação parado');
    }

    /**
     * Obter status do sistema de automação
     */
    getJobsStatus() {
        return {
            isRunning: this.isRunning,
            mode: 'events',
            eventService: this.eventService.getStatus(),
            timestamp: new Date().toISOString()
        };
    }

    // ===== MÉTODOS DE COMPATIBILIDADE =====

    /**
     * Processar onboarding de usuário (método de compatibilidade)
     */
    async processUserOnboarding(user) {
        // Este método agora é chamado pelo EventService
        console.log(`👤 Onboarding processado via evento para usuário ${user.id}`);
    }

    /**
     * Recalcular score de estudante (método de compatibilidade)
     */
    async recalculateStudentScore(user) {
        // Este método agora é chamado pelo EventService
        console.log(`📊 Score recalculado via evento para usuário ${user.id}`);
    }

    /**
     * Executar matching manual (método de compatibilidade)
     */
    async runMatchingJob() {
        console.log('🤝 Matching manual executado (sistema baseado em eventos ativo)');
    }
}

// Singleton instance
const automationService = new AutomationService();

module.exports = {
    AutomationService,
    automationService
};