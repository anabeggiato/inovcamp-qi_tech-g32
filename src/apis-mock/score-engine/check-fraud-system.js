// Script para verificar o sistema de score de fraude
const { query } = require('../shared/database');
const FraudAnalyzer = require('./services/calculators/fraudAnalyzer');

async function checkFraudSystem() {
    try {
        console.log('=== SISTEMA DE SCORE DE FRAUDE ===\n');

        // 1. Verifica dados de fraude no banco
        console.log('📊 1. DADOS DE FRAUDE NO BANCO:');
        const fraudResult = await query(`
            SELECT 
                f.id, f.user_id, u.name, u.role, f.type, f.severity, f.payload, f.created_at
            FROM frauds f
            JOIN users u ON f.user_id = u.id
            ORDER BY f.created_at DESC
        `);

        if (fraudResult.rows.length === 0) {
            console.log('❌ Nenhum dado de fraude encontrado no banco');
        } else {
            console.table(fraudResult.rows);
        }

        // 2. Testa o FraudAnalyzer
        console.log('\n🔍 2. TESTE DO FRAUD ANALYZER:');
        const fraudAnalyzer = new FraudAnalyzer();

        const testUsers = [1, 2, 3, 4, 7, 8, 16, 17];

        for (const userId of testUsers) {
            try {
                const fraudData = await fraudAnalyzer.getFraudData(userId);
                const fraudScore = await fraudAnalyzer.calculateScore(userId);

                console.log(`\n👤 Usuário ${userId}:`);
                console.log(`   Total de fraudes: ${fraudData.totalFrauds}`);
                console.log(`   Severidade: ${fraudData.severity}`);
                console.log(`   Recência: ${fraudData.recency} dias`);
                console.log(`   Frequência: ${fraudData.frequency}`);
                console.log(`   Score de fraude: ${fraudScore.score}/100`);
                console.log(`   Breakdown:`, fraudScore.breakdown);

            } catch (error) {
                console.log(`❌ Erro ao analisar usuário ${userId}:`, error.message);
            }
        }

        // 3. Verifica como o score de fraude impacta o score geral
        console.log('\n📈 3. IMPACTO NO SCORE GERAL:');
        console.log('O score de fraude tem peso de 25% no score final (0-1000)');
        console.log('Fórmula: Score Final = (Acadêmico × 35%) + (Frequência × 25%) + (Fraude × 25%) + (Risco × 15%)');

        // 4. Tipos de fraude suportados
        console.log('\n🚨 4. TIPOS DE FRAUDE SUPORTADOS:');
        const fraudTypes = [
            'OTP_failed - Falhas na verificação OTP',
            'IDENTITY_THEFT - Tentativa de uso de identidade falsa',
            'PAYMENT_FRAUD - Tentativa de pagamento com cartão clonado',
            'ACCOUNT_TAKEOVER - Tentativa de acesso não autorizado',
            'MONEY_LAUNDERING - Suspeita de lavagem de dinheiro'
        ];
        fraudTypes.forEach(type => console.log(`   • ${type}`));

        // 5. Níveis de severidade
        console.log('\n⚖️ 5. NÍVEIS DE SEVERIDADE:');
        const severities = [
            '1-2: Baixa (score 80-100)',
            '3: Média (score 60)',
            '4: Alta (score 40)',
            '5: Crítica (score 20)'
        ];
        severities.forEach(sev => console.log(`   • ${sev}`));

    } catch (error) {
        console.error('❌ Erro ao verificar sistema de fraude:', error);
    }
}

checkFraudSystem().then(() => {
    console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
    process.exit(0);
}).catch(error => {
    console.error('Erro geral:', error);
    process.exit(1);
});
