const jwt = require('jsonwebtoken');
const { db } = require('../../db');
const { comparePassword, hashPassword } = require('../utils/hash');
const config = require('../../config');
const { eventService } = require('../services/eventService');

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
   * Cadastro de usuário
   * POST /api/auth/register
   */
  static async register(req, res) {
    try {
      const { name, email, cpf, password, role } = req.body;

      console.log('🔍 Iniciando cadastro para:', email);

      // Verificar se o email já existe
      const existingUser = await db('users').where('email', email).first();
      if (existingUser) {
        console.log('❌ Email já existe:', email);
        return res.status(409).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }

      // Verificar se o CPF já existe
      const existingCpf = await db('users').where('cpf', cpf).first();
      if (existingCpf) {
        console.log('❌ CPF já existe:', cpf);
        return res.status(409).json({
          success: false,
          message: 'CPF já cadastrado'
        });
      }

      console.log('✅ Verificações de duplicata OK');

      // Hash da senha
      const hashedPassword = await hashPassword(password);
      console.log('✅ Senha hasheada');

      // Criar usuário no banco
      const [newUser] = await db('users').insert({
        name,
        email,
        cpf,
        password: hashedPassword,
        role
      }).returning('*');

      console.log('✅ Usuário criado com ID:', newUser.id);

<<<<<<< HEAD
      // 1) Criar conta de custódia via Payment API
      let custodyResult = { status: 'pending' };
      try {
        const axios = require('axios');
        const paymentApiUrl = process.env.PAYMENT_API_URL || 'http://localhost:3002';
        const custodyResp = await axios.post(`${paymentApiUrl}/custody/accounts`, {
          user_id: newUser.id
        }, { timeout: 2000 });
        custodyResult = { status: 'active', data: custodyResp.data };
        console.log('✅ Conta de custódia criada');
      } catch (e) {
        console.warn('⚠️  Falha ao criar conta de custódia (seguindo mesmo assim):', e.message);
      }

      // 2) Calcular score inicial (função do banco)
      try {
        await db.raw('SELECT recompute_score_for_user(?)', [newUser.id]);
      } catch (e) {
        console.warn('⚠️  Falha ao recomputar score inicial:', e.message);
      }

      // 3) Buscar score mais recente na tabela scores
      let initialScore = null;
      try {
        const latest = await db('scores')
          .select('user_id', 'score', 'risk_band', 'reason_json', 'created_at')
          .where('user_id', newUser.id)
          .orderBy('created_at', 'desc')
          .first();
        if (latest) {
          initialScore = {
            userId: latest.user_id,
            score: latest.score,
            riskBand: latest.risk_band,
            details: latest.reason_json,
            source: 'scores_table'
          };
        }
      } catch (e) {
        console.warn('⚠️  Falha ao ler score inicial:', e.message);
      }
=======
      // 🎯 DISPARAR EVENTO IMEDIATAMENTE - Sistema baseado em eventos!
      console.log('🎯 Disparando evento user.created...');
      await eventService.emitEvent('user.created', newUser);
>>>>>>> 3d0729dff7158072ab960b9438e59446a13946c5

      // Gerar token JWT
      const token = jwt.sign(
        {
          userId: newUser.id,
          email,
          role
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      console.log('✅ Token gerado');

      // Retornar resposta
      res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            cpf: newUser.cpf,
            role: newUser.role,
            fraud_status: newUser.fraud_status,
            created_at: newUser.created_at
          },
          onboarding: {
            custody: custodyResult,
            score: initialScore,
            status: (custodyResult.status === 'active') ? 'Conta criada e ativa' : 'Conta pendente'
          },
          token,
          expiresIn: config.jwt.expiresIn
        }
      });

      console.log('✅ Cadastro concluído com sucesso');

    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
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

/**
 * Validações para o endpoint de cadastro
 */
const registerValidation = [
  (req, res, next) => {
    const { name, email, cpf, password, role } = req.body;

    // Campos obrigatórios
    if (!name || !email || !cpf || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios: name, email, cpf, password, role'
      });
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Validação do CPF (formato básico)
    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(cpf.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'CPF deve conter 11 dígitos'
      });
    }

    // Validação da senha
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres'
      });
    }

    // Validação do role
    const validRoles = ['student', 'investor', 'institution'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role deve ser: student, investor ou institution'
      });
    }

    next();
  }
];

module.exports = {
  AuthController,
  loginValidation,
  registerValidation
};
