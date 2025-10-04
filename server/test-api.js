const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testando API QiTech...\n');

  try {
    // 1. Health Check
    console.log('1. Testando Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('   Database:', healthResponse.data.database);
    if (healthResponse.data.database === 'connected') {
      console.log('   🎉 Conectado ao PostgreSQL!');
    }
    console.log('');

    // 2. Teste de rota raiz
    console.log('2. Testando rota raiz...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ API Info:', rootResponse.data.message);
    console.log('');

    // 3. Teste de login
    console.log('3. Testando login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'alice@test.com',
      password: '123456'
    });
    console.log('✅ Login realizado:', loginResponse.data.message);
    console.log('   Usuário:', loginResponse.data.data.user.name);
    console.log('   Role:', loginResponse.data.data.user.role);
    
    const token = loginResponse.data.data.token;
    console.log('');

    // 4. Teste de endpoint protegido
    console.log('4. Testando endpoint protegido...');
    const profileResponse = await axios.get(`${BASE_URL}/api/students/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Endpoint protegido:', profileResponse.data.message);
    console.log('');

    // 5. Teste de endpoint público
    console.log('5. Testando endpoint público...');
    const facultiesResponse = await axios.get(`${BASE_URL}/api/faculties`);
    console.log('✅ Endpoint público:', facultiesResponse.data.message);
    console.log('');

    console.log('🎉 Todos os testes passaram! API funcionando corretamente.');
    console.log('\n📋 Resumo dos testes:');
    console.log('   ✅ Health Check');
    console.log('   ✅ Rota raiz');
    console.log('   ✅ Login com JWT');
    console.log('   ✅ Endpoint protegido');
    console.log('   ✅ Endpoint público');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    console.log('\n🔧 Verifique se:');
    console.log('   1. O servidor está rodando (npm run dev)');
    console.log('   2. O banco de dados está conectado');
    console.log('   3. As variáveis de ambiente estão configuradas');
    console.log('   4. Os seeds foram executados (npm run seed:run)');
  }
}

// Executar testes
testAPI();
