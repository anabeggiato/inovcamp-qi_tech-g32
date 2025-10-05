const axios = require('axios');

/**
 * Classe para testes de API seguindo boas práticas
 * - Separação de responsabilidades
 * - Tratamento de erros
 * - Logs estruturados
 */
class APITester {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.token = null;
  }

  /**
   * Fazer login e obter token
   */
  async login(email, password) {
    try {
      console.log('🔐 Fazendo login...');
      const response = await axios.post(`${this.baseURL}/api/auth/login`, {
        email,
        password
      });
      
      this.token = response.data.data.token;
      console.log('✅ Login realizado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro no login:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Criar empréstimo
   */
  async createLoan(loanData) {
    try {
      console.log('💰 Criando empréstimo...');
      const response = await axios.post(`${this.baseURL}/api/loans`, loanData, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      console.log('✅ Empréstimo criado:', response.data.data.loan.id);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar empréstimo:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Listar empréstimos
   */
  async listLoans() {
    try {
      console.log('📋 Listando empréstimos...');
      const response = await axios.get(`${this.baseURL}/api/loans`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      console.log(`✅ Encontrados ${response.data.data.total} empréstimos`);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao listar empréstimos:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Testar dados acadêmicos
   */
  async testAcademicData(studentId) {
    try {
      console.log('🎓 Testando dados acadêmicos...');
      const response = await axios.get(`${this.baseURL}/api/students/${studentId}/academic-data`);
      
      console.log('✅ Dados acadêmicos obtidos');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar dados acadêmicos:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Testar score
   */
  async testScore(studentId) {
    try {
      console.log('📊 Testando score...');
      const response = await axios.get(`${this.baseURL}/api/students/${studentId}/score`);
      
      console.log('✅ Score obtido:', response.data.data.score.score);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar score:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Executar todos os testes
   */
  async runAllTests() {
    console.log('🚀 Iniciando testes completos...\n');

    try {
      // 1. Login
      const loginSuccess = await this.login('teste@teste.com', '123456');
      if (!loginSuccess) return;

      // 2. Dados acadêmicos
      await this.testAcademicData(9);

      // 3. Score
      await this.testScore(9);

      // 4. Criar empréstimo
      await this.createLoan({
        amount: 5000,
        purpose: 'Pagamento de mensalidade',
        term_months: 12
      });

      // 5. Listar empréstimos
      await this.listLoans();

      console.log('\n🎉 Todos os testes passaram com sucesso!');

    } catch (error) {
      console.error('\n💥 Falha nos testes:', error.message);
    }
  }
}

// Executar testes
const tester = new APITester();
tester.runAllTests();
