const { query } = require('./shared/database');

async function testLoan() {
    try {
        console.log('🔍 Testando busca de empréstimo...');
        
        const result = await query(`
            SELECT * FROM loans WHERE id = $1
        `, [2]);
        
        console.log('📊 Resultado da query:', result.rows);
        console.log('📈 Número de linhas:', result.rows.length);
        
        if (result.rows.length > 0) {
            console.log('✅ Empréstimo encontrado:', result.rows[0]);
        } else {
            console.log('❌ Empréstimo não encontrado');
        }
        
    } catch (error) {
        console.error('💥 Erro:', error);
    } finally {
        process.exit();
    }
}

testLoan();
