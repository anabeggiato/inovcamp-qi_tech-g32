const express = require('express');
const { createServiceLogger } = require('../../shared/logger');
const { createResponse, handleError } = require('../../shared/utils');
const paymentService = require('../services/paymentService');
const custodyService = require('../custody/custodyService');
const ledgerService = require('../ledger/ledgerService');

const router = express.Router();
const logger = createServiceLogger('payments-main');

/**
 * POST /api/payments
 * Criar novo pagamento (chamado pelo backend principal)
 */
router.post('/', async (req, res) => {
    try {
        const {
            from_user_id,
            to_user_id,
            amount,
            payment_method,
            description,
            installment_id,
            loan_id
        } = req.body;

        if (!from_user_id || !to_user_id || !amount || !payment_method) {
            return res.status(400).json(createResponse(false, 'Dados obrigatórios: from_user_id, to_user_id, amount, payment_method'));
        }

        logger.info('Criando novo pagamento', { from_user_id, to_user_id, amount, payment_method });

        // Criar pagamento no sistema
        const payment = await paymentService.createPayment({
            from_user_id,
            to_user_id,
            amount,
            payment_method,
            description,
            installment_id,
            loan_id
        });

        res.json(createResponse(true, 'Pagamento criado com sucesso', payment));
    } catch (error) {
        logger.error('Erro ao criar pagamento', error);
        res.status(500).json(handleError(error, 'create-payment'));
    }
});

/**
 * GET /api/payments/balance
 * Obter saldo do usuário
 */
router.get('/balance', async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json(createResponse(false, 'user_id é obrigatório'));
        }

        logger.info(`Consultando saldo do usuário ${user_id}`);

        const balance = await custodyService.getAccountBalance(`user_${user_id}`);

        res.json(createResponse(true, 'Saldo consultado com sucesso', {
            user_id,
            balance: balance.availableBalance,
            blocked: balance.blockedAmount,
            total: balance.availableBalance + balance.blockedAmount
        }));
    } catch (error) {
        logger.error('Erro ao consultar saldo', error);
        res.status(500).json(handleError(error, 'get-balance'));
    }
});

/**
 * GET /api/payments/transactions
 * Obter histórico de transações
 */
router.get('/transactions', async (req, res) => {
    try {
        const { user_id, limit = 50, offset = 0 } = req.query;

        if (!user_id) {
            return res.status(400).json(createResponse(false, 'user_id é obrigatório'));
        }

        logger.info(`Consultando transações do usuário ${user_id}`);

        const transactions = await ledgerService.getUserTransactions(user_id, limit, offset);

        res.json(createResponse(true, 'Transações consultadas com sucesso', {
            user_id,
            transactions,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: transactions.length
            }
        }));
    } catch (error) {
        logger.error('Erro ao consultar transações', error);
        res.status(500).json(handleError(error, 'get-transactions'));
    }
});

/**
 * POST /api/payments/transfer
 * Transferir valores entre contas
 */
router.post('/transfer', async (req, res) => {
    try {
        const {
            from_user_id,
            to_user_id,
            amount,
            description
        } = req.body;

        if (!from_user_id || !to_user_id || !amount) {
            return res.status(400).json(createResponse(false, 'Dados obrigatórios: from_user_id, to_user_id, amount'));
        }

        logger.info('Transferindo valores entre contas', { from_user_id, to_user_id, amount });

        // Verificar saldo
        const fromBalance = await custodyService.getAccountBalance(`user_${from_user_id}`);
        if (fromBalance.availableBalance < amount) {
            return res.status(400).json(createResponse(false, 'Saldo insuficiente para transferência'));
        }

        // Realizar transferência
        const transfer = await custodyService.transferBetweenAccounts(
            `user_${from_user_id}`,
            `user_${to_user_id}`,
            amount,
            description || `Transferência de ${from_user_id} para ${to_user_id}`
        );

        res.json(createResponse(true, 'Transferência realizada com sucesso', transfer));
    } catch (error) {
        logger.error('Erro ao transferir valores', error);
        res.status(500).json(handleError(error, 'transfer'));
    }
});

/**
 * GET /api/payments/fees
 * Obter taxas cobradas
 */
router.get('/fees', async (req, res) => {
    try {
        const { user_id, period = 'month' } = req.query;

        if (!user_id) {
            return res.status(400).json(createResponse(false, 'user_id é obrigatório'));
        }

        logger.info(`Consultando taxas do usuário ${user_id}`);

        const fees = await ledgerService.getUserFees(user_id, period);

        res.json(createResponse(true, 'Taxas consultadas com sucesso', {
            user_id,
            period,
            fees,
            total_fees: fees.reduce((sum, fee) => sum + fee.amount, 0)
        }));
    } catch (error) {
        logger.error('Erro ao consultar taxas', error);
        res.status(500).json(handleError(error, 'get-fees'));
    }
});

/**
 * POST /api/payments/process
 * Processar pagamento (simulação interna)
 */
router.post('/process', async (req, res) => {
    try {
        const { payment_id } = req.body;

        if (!payment_id) {
            return res.status(400).json(createResponse(false, 'payment_id é obrigatório'));
        }

        logger.info(`Processando pagamento ${payment_id}`);

        const result = await paymentService.processPayment(payment_id);

        res.json(createResponse(true, 'Pagamento processado', result));
    } catch (error) {
        logger.error('Erro ao processar pagamento', error);
        res.status(500).json(handleError(error, 'process-payment'));
    }
});

/**
 * POST /api/payments/webhook
 * Webhook de confirmação de pagamento
 */
router.post('/webhook', async (req, res) => {
    try {
        const { payment_id, status, external_id } = req.body;

        logger.info(`Webhook recebido para pagamento ${payment_id}`, { status, external_id });

        const result = await paymentService.handleWebhook(payment_id, status, external_id);

        res.json(createResponse(true, 'Webhook processado', result));
    } catch (error) {
        logger.error('Erro ao processar webhook', error);
        res.status(500).json(handleError(error, 'webhook'));
    }
});

/**
 * POST /api/disburse
 * Processar desembolso (repasse de dinheiro para faculdade)
 */
router.post('/disburse', async (req, res) => {
    try {
        const {
            loan_id,
            match_id,
            amount,
            from_investor,
            to_school,
            student_id,
            description
        } = req.body;

        if (!loan_id || !match_id || !amount || !from_investor || !to_school || !student_id) {
            return res.status(400).json(createResponse(false, 'Dados obrigatórios: loan_id, match_id, amount, from_investor, to_school, student_id'));
        }

        logger.info('Processando desembolso', {
            loan_id,
            match_id,
            amount,
            from_investor,
            to_school,
            student_id
        });

        // 1. Verificar saldo do investidor
        const investorBalance = await custodyService.getAccountBalance(`user_${from_investor}`);
        if (investorBalance.availableBalance < amount) {
            return res.status(400).json(createResponse(false, 'Saldo insuficiente do investidor para desembolso'));
        }

        // 2. Bloquear valor do investidor
        await custodyService.blockAmount(`user_${from_investor}`, amount, `Desembolso - Match ${match_id}`);

        // 3. Criar pagamento de desembolso
        const disbursementPayment = await paymentService.createPayment({
            from_user_id: from_investor,
            to_user_id: to_school,
            amount: amount,
            payment_method: 'disbursement',
            description: description || `Desembolso P2P - Empréstimo ${loan_id}`,
            loan_id: loan_id,
            match_id: match_id
        });

        // 4. Processar pagamento
        const processedPayment = await paymentService.processPayment(disbursementPayment.id);

        // 5. Transferir para conta da faculdade
        await custodyService.transferBetweenAccounts(
            `user_${from_investor}`,
            `institution_${to_school}`,
            amount,
            description || `Desembolso P2P - Empréstimo ${loan_id}`
        );

        // 6. Registrar no ledger
        await ledgerService.createLedgerEntry({
            id: `DISB_${Date.now()}`,
            fromAccount: `user_${from_investor}`,
            toAccount: `institution_${to_school}`,
            amount: amount,
            description: description || `Desembolso P2P - Empréstimo ${loan_id}`,
            category: 'disbursement',
            subcategory: 'p2p_loan',
            loan_id: loan_id,
            match_id: match_id
        });

        logger.info(`Desembolso processado com sucesso: ${disbursementPayment.id}`);

        res.json(createResponse(true, 'Desembolso processado com sucesso', {
            paymentId: disbursementPayment.id,
            status: 'completed',
            amount: amount,
            from_investor: from_investor,
            to_school: to_school,
            student_id: student_id,
            loan_id: loan_id,
            match_id: match_id
        }));

    } catch (error) {
        logger.error('Erro ao processar desembolso', error);
        res.status(500).json(handleError(error, 'disburse'));
    }
});

/**
 * GET /api/payments/:id
 * Obter detalhes de um pagamento específico
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        logger.info(`Consultando pagamento ${id}`);

        const payment = await paymentService.getPaymentById(id);

        if (!payment) {
            return res.status(404).json(createResponse(false, 'Pagamento não encontrado'));
        }

        res.json(createResponse(true, 'Pagamento encontrado', payment));
    } catch (error) {
        logger.error('Erro ao consultar pagamento', error);
        res.status(500).json(handleError(error, 'get-payment'));
    }
});

module.exports = router;
