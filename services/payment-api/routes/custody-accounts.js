const express = require('express');
const { createServiceLogger } = require('../../shared/logger');
const { createResponse, handleError } = require('../../shared/utils');
const custodyService = require('../custody/custodyService');

const router = express.Router();
const logger = createServiceLogger('custody-accounts');

/**
 * POST /custody/accounts
 * Criar conta de custódia para um usuário
 */
router.post('/', async (req, res) => {
    try {
        const { user_id, user_type, initial_balance = 0 } = req.body;

        if (!user_id || !user_type) {
            return res.status(400).json(createResponse(false, 'Dados obrigatórios: user_id, user_type'));
        }

        logger.info('Criando conta de custódia', { user_id, user_type, initial_balance });

        // Criar conta de custódia
        const account = await custodyService.createCustodyAccount({
            userId: user_id,
            userType: user_type,
            initialBalance: initial_balance
        });

        res.json(createResponse(true, 'Conta de custódia criada com sucesso', account));
    } catch (error) {
        logger.error('Erro ao criar conta de custódia', error);
        res.status(500).json(handleError(error, 'create-custody-account'));
    }
});

/**
 * GET /custody/accounts/:user_id
 * Obter conta de custódia de um usuário
 */
router.get('/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        logger.info(`Consultando conta de custódia do usuário ${user_id}`);

        const account = await custodyService.getAccountByUserId(user_id);

        if (!account) {
            return res.status(404).json(createResponse(false, 'Conta de custódia não encontrada'));
        }

        res.json(createResponse(true, 'Conta encontrada', account));
    } catch (error) {
        logger.error('Erro ao consultar conta de custódia', error);
        res.status(500).json(handleError(error, 'get-custody-account'));
    }
});

/**
 * POST /custody/accounts/:user_id/deposit
 * Depositar valor na conta de custódia
 */
router.post('/:user_id/deposit', async (req, res) => {
    try {
        const { user_id } = req.params;
        const { amount, payment_method, description } = req.body;

        if (!amount || !payment_method) {
            return res.status(400).json(createResponse(false, 'Dados obrigatórios: amount, payment_method'));
        }

        logger.info(`Depositando valor na conta do usuário ${user_id}`, { amount, payment_method });

        // Depositar valor
        const deposit = await custodyService.depositToAccount({
            userId: user_id,
            amount: amount,
            paymentMethod: payment_method,
            description: description || `Depósito via ${payment_method}`
        });

        res.json(createResponse(true, 'Depósito realizado com sucesso', deposit));
    } catch (error) {
        logger.error('Erro ao depositar valor', error);
        res.status(500).json(handleError(error, 'deposit-to-account'));
    }
});

module.exports = router;

