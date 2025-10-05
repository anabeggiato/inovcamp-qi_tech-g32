const { db } = require('../../db');
const eventService = require('../services/eventService');

/**
 * Controller para sistema de matching P2P
 * Seguindo boas práticas: responsabilidade única, tratamento de erros, validações
 */
class MatchingController {

  /**
   * Executar matching entre ofertas e empréstimos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async executeMatching(req, res) {
    try {
      const { loan_id, offer_id } = req.body;

      console.log(`🔍 Executando matching entre empréstimo ${loan_id} e oferta ${offer_id}`);

      // Validações
      const validation = await MatchingController._validateMatching(loan_id, offer_id);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }

      // Executar matching
      const matchResult = await MatchingController._createMatch(loan_id, offer_id);

      // Se o matching foi bem-sucedido, disparar evento e processar pagamento
      if (matchResult.success) {
        try {
          // Disparar evento de match aprovado
          await eventService.emitEvent('match.approved', {
            match: matchResult.match,
            loan: matchResult.loan,
            offer: matchResult.offer
          });
          console.log('🎯 Evento match.approved disparado');

          // Processar pagamento via API
          await MatchingController._processPayment(matchResult.match);
          console.log('✅ Pagamento processado com sucesso');
        } catch (paymentError) {
          console.error('❌ Erro ao processar pagamento:', paymentError);
          // Não falhar o matching por erro de pagamento
        }
      }

      res.json({
        success: true,
        message: 'Matching executado com sucesso',
        data: matchResult
      });

    } catch (error) {
      console.error('❌ Erro ao executar matching:', error);
      MatchingController._handleError(res, error, 'executar matching');
    }
  }

  /**
   * Listar matches de um empréstimo
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getLoanMatches(req, res) {
    try {
      const { loan_id } = req.params;

      console.log(`🔍 Listando matches do empréstimo ${loan_id}`);

      const matches = await db('matches')
        .select(
          'matches.*',
          'offers.amount_available',
          'offers.min_rate',
          'users.name as investor_name',
          'users.email as investor_email'
        )
        .join('offers', 'matches.offer_id', 'offers.id')
        .join('users', 'offers.investor_id', 'users.id')
        .where('matches.loan_id', loan_id)
        .orderBy('matches.created_at', 'desc');

      res.json({
        success: true,
        message: 'Matches do empréstimo',
        data: {
          matches,
          total: matches.length,
          loan_id
        }
      });

    } catch (error) {
      console.error('❌ Erro ao listar matches:', error);
      MatchingController._handleError(res, error, 'listar matches');
    }
  }

  /**
   * Listar matches de uma oferta
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getOfferMatches(req, res) {
    try {
      const { offer_id } = req.params;

      console.log(`🔍 Listando matches da oferta ${offer_id}`);

      const matches = await db('matches')
        .select(
          'matches.*',
          'loans.amount',
          'loans.term_months',
          'users.name as borrower_name',
          'users.email as borrower_email'
        )
        .join('loans', 'matches.loan_id', 'loans.id')
        .join('users', 'loans.borrower_id', 'users.id')
        .where('matches.offer_id', offer_id)
        .orderBy('matches.created_at', 'desc');

      res.json({
        success: true,
        message: 'Matches da oferta',
        data: {
          matches,
          total: matches.length,
          offer_id
        }
      });

    } catch (error) {
      console.error('❌ Erro ao listar matches da oferta:', error);
      MatchingController._handleError(res, error, 'listar matches da oferta');
    }
  }

  /**
   * Aprovar um match (investidor aceita o empréstimo)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async approveMatch(req, res) {
    try {
      const { match_id } = req.params;
      const { investor_id } = req.body;

      console.log(`✅ Aprovando match ${match_id} pelo investidor ${investor_id}`);

      // Buscar o match
      const match = await db('matches')
        .select('matches.*', 'loans.*', 'offers.*')
        .join('loans', 'matches.loan_id', 'loans.id')
        .join('offers', 'matches.offer_id', 'offers.id')
        .where('matches.id', match_id)
        .where('offers.investor_id', investor_id)
        .first();

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Match não encontrado ou investidor não autorizado'
        });
      }

      if (match.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Match já foi processado'
        });
      }

      // Atualizar status do match para aprovado
      await db('matches')
        .where('id', match_id)
        .update({
          status: 'approved',
          approved_at: new Date(),
          updated_at: new Date()
        });

      // Disparar evento de match aprovado
      await eventService.emitEvent('match.approved', {
        match: { ...match, status: 'approved' },
        loan: match,
        offer: match
      });

      console.log(`🎯 Evento match.approved disparado para match ${match_id}`);

      res.json({
        success: true,
        message: 'Match aprovado com sucesso',
        data: {
          match_id,
          status: 'approved',
          amount: match.amount_matched
        }
      });

    } catch (error) {
      console.error('❌ Erro ao aprovar match:', error);
      MatchingController._handleError(res, error, 'aprovar match');
    }
  }

  /**
   * Buscar matches automáticos (algoritmo de matching)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async findAutomaticMatches(req, res) {
    try {
      console.log('🔍 Buscando matches automáticos');

      // Buscar empréstimos pendentes
      const pendingLoans = await db('loans')
        .select('*')
        .where('status', 'pending')
        .orderBy('created_at', 'desc');

      // Buscar ofertas ativas
      const activeOffers = await db('offers')
        .select('*')
        .where('status', 'active')
        .orderBy('created_at', 'desc');

      const matches = [];

      // Algoritmo de matching simples
      for (const loan of pendingLoans) {
        for (const offer of activeOffers) {
          // Verificar compatibilidade
          if (MatchingController._isCompatible(loan, offer)) {
            matches.push({
              loan_id: loan.id,
              offer_id: offer.id,
              loan_amount: loan.amount,
              offer_amount: offer.amount_available,
              compatibility_score: MatchingController._calculateCompatibilityScore(loan, offer)
            });
          }
        }
      }

      // Ordenar por score de compatibilidade
      matches.sort((a, b) => b.compatibility_score - a.compatibility_score);

      res.json({
        success: true,
        message: 'Matches automáticos encontrados',
        data: {
          matches,
          total: matches.length,
          pending_loans: pendingLoans.length,
          active_offers: activeOffers.length
        }
      });

    } catch (error) {
      console.error('❌ Erro ao buscar matches automáticos:', error);
      MatchingController._handleError(res, error, 'buscar matches automáticos');
    }
  }

  // ===== MÉTODOS PRIVADOS (HELPERS) =====

  /**
   * Validar matching
   * @private
   */
  static async _validateMatching(loan_id, offer_id) {
    // Verificar se empréstimo existe e está pendente
    const loan = await db('loans')
      .select('*')
      .where('id', loan_id)
      .where('status', 'pending')
      .first();

    if (!loan) {
      return {
        isValid: false,
        message: 'Empréstimo não encontrado ou não está disponível para matching'
      };
    }

    // Verificar se oferta existe e está ativa
    const offer = await db('offers')
      .select('*')
      .where('id', offer_id)
      .where('status', 'active')
      .first();

    if (!offer) {
      return {
        isValid: false,
        message: 'Oferta não encontrada ou não está ativa'
      };
    }

    // Verificar se já existe matching
    const existingMatch = await db('matches')
      .select('*')
      .where('loan_id', loan_id)
      .where('offer_id', offer_id)
      .first();

    if (existingMatch) {
      return {
        isValid: false,
        message: 'Matching já existe entre este empréstimo e oferta'
      };
    }

    return { isValid: true };
  }

  /**
   * Criar match
   * @private
   */
  static async _createMatch(loan_id, offer_id) {
    try {
      // Buscar dados do empréstimo e oferta
      const loan = await db('loans').select('*').where('id', loan_id).first();
      const offer = await db('offers').select('*').where('id', offer_id).first();

      // Calcular valor do match (menor entre empréstimo e oferta)
      const matchAmount = Math.min(parseFloat(loan.amount), parseFloat(offer.amount_available));

      // Criar match
      const [newMatch] = await db('matches').insert({
        loan_id,
        offer_id,
        amount_matched: matchAmount,
        rate: offer.min_rate,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');

      // Atualizar status do empréstimo se totalmente financiado
      const totalMatched = await db('matches')
        .sum('amount_matched as total')
        .where('loan_id', loan_id)
        .first();

      if (totalMatched.total >= parseFloat(loan.amount)) {
        await db('loans')
          .where('id', loan_id)
          .update({ status: 'matched', updated_at: new Date() });
      }

      console.log(`✅ Match criado com ID: ${newMatch.id}`);

      return {
        success: true,
        match: newMatch,
        matchAmount,
        loan,
        offer
      };

    } catch (error) {
      console.error('❌ Erro ao criar match:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processar pagamento via API mockada
   * @private
   */
  static async _processPayment(match) {
    try {
      const axios = require('axios');
      const paymentApiUrl = process.env.PAYMENT_API_URL || 'http://localhost:3002';

      const paymentData = {
        match_id: match.id,
        amount: match.amount_matched,
        from_investor: match.offer_id,
        to_borrower: match.loan_id,
        description: `Desembolso P2P - Match ${match.id}`
      };

      const response = await axios.post(`${paymentApiUrl}/disburse`, paymentData);

      console.log('✅ Pagamento processado:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Erro na API de pagamentos:', error.message);
      throw error;
    }
  }

  /**
   * Verificar compatibilidade entre empréstimo e oferta
   * @private
   */
  static _isCompatible(loan, offer) {
    // Verificar se o prazo é compatível
    if (loan.term_months !== offer.term_months) {
      return false;
    }

    // Verificar se o valor é compatível
    if (parseFloat(offer.amount_available) < parseFloat(loan.amount)) {
      return false;
    }

    return true;
  }

  /**
   * Calcular score de compatibilidade
   * @private
   */
  static _calculateCompatibilityScore(loan, offer) {
    let score = 0;

    // Score por compatibilidade de prazo (40%)
    if (loan.term_months === offer.term_months) {
      score += 40;
    }

    // Score por compatibilidade de valor (30%)
    const valueRatio = parseFloat(offer.amount_available) / parseFloat(loan.amount);
    if (valueRatio >= 1) {
      score += 30;
    } else {
      score += valueRatio * 30;
    }

    // Score por taxa (30%)
    const rateScore = (1 - parseFloat(offer.min_rate)) * 30;
    score += rateScore;

    return Math.round(score);
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

module.exports = { MatchingController };