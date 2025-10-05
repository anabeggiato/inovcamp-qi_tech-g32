const { db } = require('../../db');
const eventService = require('../services/eventService');

/**
 * Controller para ofertas de investidores
 * Seguindo boas práticas: responsabilidade única, tratamento de erros, validações
 */
class OffersController {

  /**
   * Listar ofertas do investidor
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async list(req, res) {
    try {
      const { id: investorId } = req.user;

      console.log(`🔍 Listando ofertas do investidor ${investorId}`);

      // Buscar ofertas deste investidor
      const offers = await db('offers')
        .select('*')
        .where('investor_id', investorId)
        .orderBy('created_at', 'desc');

      res.json({
        success: true,
        message: 'Lista de ofertas',
        data: {
          offers,
          total: offers.length,
          investorId
        }
      });

    } catch (error) {
      console.error('❌ Erro ao listar ofertas:', error);
      OffersController._handleError(res, error, 'listar ofertas');
    }
  }

  /**
   * Criar nova oferta de investimento
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async create(req, res) {
    try {
      console.log('🔍 Iniciando criação de oferta...');

      const { id: investorId } = req.user;
      const { amount_available, term_months, min_rate } = req.body;

      console.log(`🔍 Investidor ID: ${investorId}`);
      console.log('📊 Dados recebidos:', { amount_available, term_months, min_rate });

      // Validação simples
      if (!amount_available) {
        return res.status(400).json({
          success: false,
          message: 'Valor disponível é obrigatório'
        });
      }

      console.log('💾 Inserindo oferta no banco...');

      const [newOffer] = await db('offers').insert({
        investor_id: investorId,
        amount_available: parseFloat(amount_available),
        term_months: parseInt(term_months) || 12,
        min_rate: parseFloat(min_rate) || 0.08
      }).returning('*');

      console.log('✅ Oferta inserida com sucesso:', newOffer);

      // Disparar evento de nova oferta
      await eventService.emitEvent('offer.created', { offer: newOffer });
      console.log('🎯 Evento offer.created disparado');

      res.status(201).json({
        success: true,
        message: 'Oferta criada com sucesso',
        data: {
          offer: newOffer
        }
      });

    } catch (error) {
      console.error('❌ Erro ao criar oferta:', error.message);
      console.error('❌ Stack trace:', error.stack);

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obter oferta por ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const { id: investorId } = req.user;

      console.log(`🔍 Buscando oferta ${id} para investidor ${investorId}`);

      const offer = await db('offers')
        .select('*')
        .where('id', id)
        .where('investor_id', investorId)
        .first();

      if (!offer) {
        return res.status(404).json({
          success: false,
          message: 'Oferta não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Oferta encontrada',
        data: { offer }
      });

    } catch (error) {
      console.error('❌ Erro ao buscar oferta:', error);
      OffersController._handleError(res, error, 'buscar oferta');
    }
  }

  /**
   * Atualizar oferta
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { id: investorId } = req.user;
      const updateData = req.body;

      console.log(`🔍 Atualizando oferta ${id} para investidor ${investorId}`);

      // Verificar se a oferta existe e pertence ao investidor
      const existingOffer = await db('offers')
        .select('*')
        .where('id', id)
        .where('investor_id', investorId)
        .first();

      if (!existingOffer) {
        return res.status(404).json({
          success: false,
          message: 'Oferta não encontrada'
        });
      }

      // Validações
      const validation = OffersController._validateOfferData(updateData, true);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }

      // Atualizar oferta
      const [updatedOffer] = await db('offers')
        .where('id', id)
        .where('investor_id', investorId)
        .update({
          ...updateData,
          updated_at: new Date()
        })
        .returning('*');

      console.log(`✅ Oferta ${id} atualizada`);

      res.json({
        success: true,
        message: 'Oferta atualizada com sucesso',
        data: { offer: updatedOffer }
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar oferta:', error);
      OffersController._handleError(res, error, 'atualizar oferta');
    }
  }

  // ===== MÉTODOS PRIVADOS (HELPERS) =====

  /**
   * Validar dados da oferta
   * @private
   */
  static _validateOfferData(data, isUpdate = false) {
    const { amount_available, term_months, min_rate } = data;

    if (!isUpdate) {
      if (!amount_available || amount_available <= 0) {
        return {
          isValid: false,
          message: 'Valor disponível é obrigatório e deve ser maior que zero'
        };
      }

      if (!term_months || term_months <= 0) {
        return {
          isValid: false,
          message: 'Prazo em meses é obrigatório e deve ser maior que zero'
        };
      }
    }

    if (min_rate !== undefined && (min_rate < 0 || min_rate > 1)) {
      return {
        isValid: false,
        message: 'Taxa mínima deve estar entre 0 e 1 (0% a 100%)'
      };
    }

    return { isValid: true };
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

module.exports = { OffersController };
