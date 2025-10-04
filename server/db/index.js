const knex = require('knex');
const knexfile = require('../../knexfile');

// Configuração do ambiente
const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

// Criar instância do Knex
const db = knex(config);

// Testar conexão
const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Função para fechar conexão
const closeConnection = async () => {
  try {
    await db.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  }
};

module.exports = {
  db,
  testConnection,
  closeConnection
};
