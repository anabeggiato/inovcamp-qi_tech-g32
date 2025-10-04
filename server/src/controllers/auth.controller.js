const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { comparePassword } = require('../utils/hash');
const config = require('../../config');

/**
 * Controller para autenticação
 */
class AuthController {
  
  /**
   * Login do usuário
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
      // Validação básica
      if (!req.body.email || !req.body.password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      const { email, password } = req.body;

      // Buscar usuário por email no banco
      const user = await db('users')
        .select('id', 'name', 'email', 'role', 'fraud_status', 'password')
        .where('email', email)
        .first();

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Verificar se a conta está bloqueada
      if (user.fraud_status === 'blocked') {
        return res.status(403).json({
          success: false,
          message: 'Conta bloqueada por motivos de segurança'
        });
      }

      // Verificar senha
      const isValidPassword = await comparePassword(password, user.password || '');

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Retornar dados do usuário (sem senha) e token
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: userWithoutPassword,
          token,
          expiresIn: config.jwt.expiresIn
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verificar token válido
   * GET /api/auth/verify
   */
  static async verify(req, res) {
    try {
      // O middleware de autenticação já validou o token
      // e adicionou as informações do usuário ao req.user
      res.json({
        success: true,
        message: 'Token válido',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Erro na verificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Logout (invalidar token no frontend)
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    try {
      // Em uma implementação mais robusta, você poderia
      // manter uma blacklist de tokens no banco de dados
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

/**
 * Validações para o endpoint de login
 */
const loginValidation = [
  (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres'
      });
    }
    
    next();
  }
];

module.exports = {
  AuthController,
  loginValidation
};
