const bcrypt = require('bcryptjs');

/**
 * Gera hash de uma senha
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} - Hash da senha
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compara uma senha com seu hash
 * @param {string} password - Senha em texto plano
 * @param {string} hashedPassword - Hash da senha
 * @returns {Promise<boolean>} - True se a senha confere
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};
