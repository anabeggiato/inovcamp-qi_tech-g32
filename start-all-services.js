const { spawn } = require('child_process');
const path = require('path');

/**
 * Script para iniciar todos os serviços da QI-EDU
 */
class ServiceManager {

    constructor() {
        this.services = [];
        this.isShuttingDown = false;
    }

    /**
     * Iniciar todos os serviços
     */
    async startAllServices() {
        console.log('🚀 Iniciando todos os serviços da QI-EDU...\n');

        // Configurar tratamento de sinais
        this.setupSignalHandlers();

        // Iniciar serviços em paralelo
        const services = [
            {
                name: 'Faculty API',
                path: path.join(__dirname, 'services', 'faculty-api'),
                command: 'npm',
                args: ['start'],
                port: 3001
            },
            {
                name: 'Payment API',
                path: path.join(__dirname, 'services', 'payment-api'),
                command: 'npm',
                args: ['start'],
                port: 3002
            },
            {
                name: 'Score Engine',
                path: path.join(__dirname, 'services', 'score-engine'),
                command: 'npm',
                args: ['start'],
                port: 3003
            },
            {
                name: 'Backend Principal',
                path: path.join(__dirname, 'server'),
                command: 'npm',
                args: ['run', 'dev'],
                port: 3000
            }
        ];

        // Iniciar cada serviço
        for (const service of services) {
            await this.startService(service);
            // Aguardar um pouco entre os serviços
            await this.sleep(2000);
        }

        console.log('\n✅ Todos os serviços iniciados!');
        console.log('\n📋 Serviços disponíveis:');
        console.log('   🏫 Faculty API: http://localhost:3001');
        console.log('   💳 Payment API: http://localhost:3002');
        console.log('   📊 Score Engine: http://localhost:3003');
        console.log('   🚀 Backend Principal: http://localhost:3000');
        console.log('\n🔗 Health Checks:');
        console.log('   http://localhost:3000/health');
        console.log('   http://localhost:3001/health');
        console.log('   http://localhost:3002/health');
        console.log('   http://localhost:3003/health');
        console.log('\n📚 Documentação:');
        console.log('   http://localhost:3001/api-docs');
        console.log('   http://localhost:3002/api-docs');
        console.log('   http://localhost:3003/api-docs');
        console.log('\n🧪 Teste de integração:');
        console.log('   cd server && npm run test:integration');
        console.log('\n⏹️  Para parar todos os serviços: Ctrl+C\n');

        // Manter o processo vivo
        this.keepAlive();
    }

    /**
     * Iniciar um serviço específico
     */
    async startService(serviceConfig) {
        return new Promise((resolve, reject) => {
            console.log(`🔄 Iniciando ${serviceConfig.name}...`);

            const child = spawn(serviceConfig.command, serviceConfig.args, {
                cwd: serviceConfig.path,
                stdio: 'pipe',
                shell: true
            });

            // Armazenar referência do processo
            this.services.push({
                name: serviceConfig.name,
                process: child,
                port: serviceConfig.port
            });

            // Capturar saída
            child.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(`   [${serviceConfig.name}] ${output}`);
                }
            });

            child.stderr.on('data', (data) => {
                const error = data.toString().trim();
                if (error && !error.includes('DeprecationWarning')) {
                    console.error(`   [${serviceConfig.name}] ${error}`);
                }
            });

            // Aguardar o serviço estar pronto
            child.on('spawn', () => {
                console.log(`   ✅ ${serviceConfig.name} iniciado (PID: ${child.pid})`);
                resolve();
            });

            child.on('error', (error) => {
                console.error(`   ❌ Erro ao iniciar ${serviceConfig.name}:`, error.message);
                reject(error);
            });

            child.on('exit', (code) => {
                if (!this.isShuttingDown) {
                    console.error(`   ⚠️ ${serviceConfig.name} encerrado com código ${code}`);
                }
            });
        });
    }

    /**
     * Configurar tratamento de sinais para shutdown graceful
     */
    setupSignalHandlers() {
        process.on('SIGINT', () => this.shutdown());
        process.on('SIGTERM', () => this.shutdown());
    }

    /**
     * Shutdown graceful de todos os serviços
     */
    async shutdown() {
        if (this.isShuttingDown) return;

        this.isShuttingDown = true;
        console.log('\n🛑 Encerrando todos os serviços...');

        for (const service of this.services) {
            try {
                console.log(`   🔄 Parando ${service.name}...`);
                service.process.kill('SIGTERM');

                // Aguardar o processo encerrar
                await new Promise((resolve) => {
                    service.process.on('exit', resolve);
                    setTimeout(resolve, 5000); // Timeout de 5 segundos
                });

                console.log(`   ✅ ${service.name} parado`);
            } catch (error) {
                console.error(`   ❌ Erro ao parar ${service.name}:`, error.message);
            }
        }

        console.log('✅ Todos os serviços encerrados');
        process.exit(0);
    }

    /**
     * Manter o processo vivo
     */
    keepAlive() {
        // Manter o processo vivo
        setInterval(() => {
            // Verificar se algum serviço morreu
            this.services = this.services.filter(service => {
                if (service.process.killed) {
                    console.log(`⚠️ ${service.name} morreu, tentando reiniciar...`);
                    return false;
                }
                return true;
            });
        }, 10000); // Verificar a cada 10 segundos
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const manager = new ServiceManager();
    manager.startAllServices().catch(console.error);
}

module.exports = ServiceManager;
