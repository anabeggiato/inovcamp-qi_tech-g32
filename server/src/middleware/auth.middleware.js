const jwt = require('jsonwebtoken');
const { db } = require('../../db');
const config = require('../../config');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e se o usuário existe
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Buscar usuário no banco
    const user = await db('users')
      .select('id', 'name', 'email', 'role', 'fraud_status')
      .where('id', decoded.id || decoded.userId)
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o usuário não está bloqueado por fraude
    if (user.fraud_status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Conta bloqueada por motivos de segurança'
      });
    }

    // Adicionar informações do usuário ao request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {string[]} allowedRoles - Array de roles permitidos
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Role insuficiente.'
      });
    }

    next();
  };
};

/**
 * Middleware opcional - não falha se não houver token
 * Útil para endpoints que podem funcionar com ou sem autenticação
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await db('users')
        .select('id', 'name', 'email', 'role', 'fraud_status')
        .where('id', decoded.id || decoded.userId)
        .first();

      if (user && user.fraud_status !== 'blocked') {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};
