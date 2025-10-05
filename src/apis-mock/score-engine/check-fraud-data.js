// Script para verificar dados de fraude no banco
const { query } = require('../shared/database');

async function checkFraudData() {
    try {
        console.log('=== VERIFICAÇÃO DE DADOS DE FRAUDE ===\n');

        // Verifica dados de fraude
        const fraudResult = await query(`
            SELECT 
                id, user_id, type, severity, payload, created_at
            FROM frauds 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        console.log('📊 Dados de fraude no banco:');
        if (fraudResult.rows.length === 0) {
            console.log('❌ Nenhum dado de fraude encontrado');
        } else {
            console.table(fraudResult.rows);
        }

        // Verifica usuários com dados de fraude
        const usersWithFraud = await query(`
            SELECT 
                u.id, u.name, u.role, u.fraud_score, u.fraud_status,
                COUNT(f.id) as fraud_count,
                MAX(f.severity) as max_severity
            FROM users u
            LEFT JOIN frauds f ON u.id = f.user_id
            GROUP BY u.id, u.name, u.role, u.fraud_score, u.fraud_status
            ORDER BY fraud_count DESC
        `);

        console.log('\n👥 Usuários e seus dados de fraude:');
        console.table(usersWithFraud.rows);

        // Verifica scores calculados
        const scoresResult = await query(`
            SELECT 
                id, user_id, score, risk_band, created_at
            FROM scores 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        console.log('\n📈 Scores calculados:');
        if (scoresResult.rows.length === 0) {
            console.log('❌ Nenhum score encontrado');
        } else {
            console.table(scoresResult.rows);
        }

    } catch (error) {
        console.error('❌ Erro ao verificar dados:', error);
    }
}

checkFraudData().then(() => {
    console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
    process.exit(0);
}).catch(error => {
    console.error('Erro geral:', error);
    process.exit(1);
});
