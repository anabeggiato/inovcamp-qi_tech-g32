const { db } = require('../../db');

/**
 * Controller para empréstimos
 * Seguindo boas práticas: responsabilidade única, tratamento de erros, validações
 */
class LoansController {
  
  /**
   * Listar empréstimos com filtros por role
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async list(req, res) {
    try {
      const { role: userRole, id: userId } = req.user;
      
      console.log(`🔍 Listando empréstimos para usuário ${userId} (${userRole})`);

      const loans = await LoansController._getLoansByRole(userRole, userId);

      res.json({
        success: true,
        message: 'Lista de empréstimos',
        data: {
          loans,
          total: loans.length,
          filters: { role: userRole, userId }
        }
      });

    } catch (error) {
      console.error('❌ Erro ao listar empréstimos:', error);
      LoansController._handleError(res, error, 'listar empréstimos');
    }
  }

  /**
   * Obter empréstimo por ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const { role: userRole, id: userId } = req.user;
      
      console.log(`🔍 Buscando empréstimo ${id} para usuário ${userId}`);

      const loan = await LoansController._getLoanById(id, userRole, userId);

      if (!loan) {
        return res.status(404).json({
          success: false,
          message: 'Empréstimo não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Empréstimo encontrado',
        data: { loan }
      });

    } catch (error) {
      console.error('❌ Erro ao buscar empréstimo:', error);
      LoansController._handleError(res, error, 'buscar empréstimo');
    }
  }

  /**
   * Criar novo empréstimo
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async create(req, res) {
    try {
      const { id: userId } = req.user;
      const loanData = req.body;

      console.log(`🔍 Criando empréstimo para usuário ${userId}`);

      // Validações
      const validation = LoansController._validateLoanData(loanData);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }

      // Criar empréstimo
      const newLoan = await LoansController._createLoan(userId, loanData);

      console.log(`✅ Empréstimo criado com ID: ${newLoan.id}`);

      res.status(201).json({
        success: true,
        message: 'Empréstimo solicitado com sucesso',
        data: { loan: newLoan }
      });

    } catch (error) {
      console.error('❌ Erro ao criar empréstimo:', error);
      LoansController._handleError(res, error, 'criar empréstimo');
    }
  }

  /**
   * Atualizar status do empréstimo
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      console.log(`🔍 Atualizando status do empréstimo ${id} para ${status}`);

      const validation = LoansController._validateStatus(status);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }

      const updatedLoan = await LoansController._updateLoanStatus(id, status, reason);

      res.json({
        success: true,
        message: 'Status do empréstimo atualizado com sucesso',
        data: { loan: updatedLoan }
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      LoansController._handleError(res, error, 'atualizar status');
    }
  }

  // ===== MÉTODOS PRIVADOS (HELPERS) =====

  /**
   * Buscar empréstimos baseado no role do usuário
   * @private
   */
  static async _getLoansByRole(userRole, userId) {
    if (userRole === 'student') {
      return await db('loans')
        .select('*')
        .where('borrower_id', userId)
        .orderBy('created_at', 'desc');
    }
    
    return await db('loans')
      .select('*')
      .orderBy('created_at', 'desc');
  }

  /**
   * Buscar empréstimo por ID com verificação de permissão
   * @private
   */
  static async _getLoanById(loanId, userRole, userId) {
    if (userRole === 'student') {
      return await db('loans')
        .select('*')
        .where('id', loanId)
        .where('borrower_id', userId)
        .first();
    }
    
    return await db('loans')
      .select('*')
      .where('id', loanId)
      .first();
  }

  /**
   * Validar dados do empréstimo
   * @private
   */
  static _validateLoanData(data) {
    const { amount, term_months } = data;

    if (!amount || amount <= 0) {
      return {
        isValid: false,
        message: 'Valor do empréstimo é obrigatório e deve ser maior que zero'
      };
    }

    if (!term_months || term_months <= 0) {
      return {
        isValid: false,
        message: 'Prazo do empréstimo é obrigatório e deve ser maior que zero'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar status do empréstimo
   * @private
   */
  static _validateStatus(status) {
    const validStatuses = ['pending', 'approved', 'rejected', 'disbursed', 'completed', 'defaulted'];
    
    if (!validStatuses.includes(status)) {
      return {
        isValid: false,
        message: `Status inválido. Valores aceitos: ${validStatuses.join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Criar empréstimo no banco
   * @private
   */
  static async _createLoan(userId, loanData) {
    const { amount, term_months } = loanData;

    const [newLoan] = await db('loans').insert({
      borrower_id: userId,
      amount,
      term_months,
      status: 'pending'
    }).returning('*');

    return newLoan;
  }

  /**
   * Atualizar status do empréstimo
   * @private
   */
  static async _updateLoanStatus(loanId, status, reason) {
    const [updatedLoan] = await db('loans')
      .where('id', loanId)
      .update({
        status,
        status_reason: reason || '',
        updated_at: new Date()
      })
      .returning('*');

    return updatedLoan;
  }

  /**
   * Tratar erros de forma consistente
   * @private
   */
  static _handleError(res, error, operation) {
    console.error(`❌ Erro ao ${operation}:`, error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = { LoansController };
