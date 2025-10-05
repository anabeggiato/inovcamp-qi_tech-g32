/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Criar novo pagamento
 *     description: Cria um novo pagamento (chamado pelo backend principal)
 *     tags: [Payment API - Backend Integration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [from_user_id, to_user_id, amount, payment_method]
 *             properties:
 *               from_user_id:
 *                 type: integer
 *                 example: 2
 *                 description: ID do usuário que está pagando
 *               to_user_id:
 *                 type: integer
 *                 example: 3
 *                 description: ID do usuário que está recebendo
 *               amount:
 *                 type: number
 *                 example: 500
 *                 description: Valor do pagamento
 *               payment_method:
 *                 type: string
 *                 enum: [pix, boleto, credit_card, debit_card]
 *                 example: pix
 *                 description: Método de pagamento
 *               description:
 *                 type: string
 *                 example: "Pagamento parcela 1"
 *                 description: Descrição do pagamento
 *               installment_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID da parcela (opcional)
 *               loan_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID do empréstimo (opcional)
 *     responses:
 *       200:
 *         description: Pagamento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "PAY-123"
 *                         from_user_id:
 *                           type: integer
 *                           example: 2
 *                         to_user_id:
 *                           type: integer
 *                           example: 3
 *                         amount:
 *                           type: number
 *                           example: 500
 *                         payment_method:
 *                           type: string
 *                           example: "pix"
 *                         status:
 *                           type: string
 *                           example: "pending"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Obter detalhes de um pagamento
 *     description: Consulta os detalhes de um pagamento específico
 *     tags: [Payment API - Backend Integration]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pagamento
 *         example: "PAY-123"
 *     responses:
 *       200:
 *         description: Pagamento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "PAY-123"
 *                         from_user_id:
 *                           type: integer
 *                           example: 2
 *                         to_user_id:
 *                           type: integer
 *                           example: 3
 *                         amount:
 *                           type: number
 *                           example: 500
 *                         payment_method:
 *                           type: string
 *                           example: "pix"
 *                         status:
 *                           type: string
 *                           example: "completed"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         processed_at:
 *                           type: string
 *                           format: date-time
 *                         external_id:
 *                           type: string
 *                           example: "EXT-456"
 *       404:
 *         description: Pagamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/payments/balance:
 *   get:
 *     summary: Obter saldo do usuário
 *     description: Consulta o saldo disponível de um usuário
 *     tags: [Payment API - Backend Integration]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 2
 *     responses:
 *       200:
 *         description: Saldo consultado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           example: 2
 *                         balance:
 *                           type: number
 *                           example: 1500.50
 *                           description: Saldo disponível
 *                         blocked:
 *                           type: number
 *                           example: 200.00
 *                           description: Valor bloqueado
 *                         total:
 *                           type: number
 *                           example: 1700.50
 *                           description: Saldo total
 *       400:
 *         description: user_id é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/payments/transactions:
 *   get:
 *     summary: Obter histórico de transações
 *     description: Consulta o histórico de transações de um usuário
 *     tags: [Payment API - Backend Integration]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 2
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número máximo de transações
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de transações para pular
 *     responses:
 *       200:
 *         description: Transações consultadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           example: 2
 *                         transactions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "LED-123"
 *                               account_type:
 *                                 type: string
 *                                 example: "investor"
 *                               amount:
 *                                 type: number
 *                                 example: 500
 *                               dc:
 *                                 type: string
 *                                 example: "C"
 *                               description:
 *                                 type: string
 *                                 example: "Pagamento parcela 1"
 *                               created_at:
 *                                 type: string
 *                                 format: date-time
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             limit:
 *                               type: integer
 *                               example: 50
 *                             offset:
 *                               type: integer
 *                               example: 0
 *                             total:
 *                               type: integer
 *                               example: 25
 *       400:
 *         description: user_id é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/payments/transfer:
 *   post:
 *     summary: Transferir valores entre contas
 *     description: Transfere valores entre contas de usuários
 *     tags: [Payment API - Backend Integration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [from_user_id, to_user_id, amount]
 *             properties:
 *               from_user_id:
 *                 type: integer
 *                 example: 2
 *                 description: ID do usuário que está transferindo
 *               to_user_id:
 *                 type: integer
 *                 example: 3
 *                 description: ID do usuário que está recebendo
 *               amount:
 *                 type: number
 *                 example: 100
 *                 description: Valor da transferência
 *               description:
 *                 type: string
 *                 example: "Transferência entre usuários"
 *                 description: Descrição da transferência
 *     responses:
 *       200:
 *         description: Transferência realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         transfer_id:
 *                           type: string
 *                           example: "TRF-123"
 *                         from_user_id:
 *                           type: integer
 *                           example: 2
 *                         to_user_id:
 *                           type: integer
 *                           example: 3
 *                         amount:
 *                           type: number
 *                           example: 100
 *                         status:
 *                           type: string
 *                           example: "completed"
 *       400:
 *         description: Dados inválidos ou saldo insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/payments/fees:
 *   get:
 *     summary: Obter taxas cobradas
 *     description: Consulta as taxas cobradas de um usuário
 *     tags: [Payment API - Backend Integration]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 2
 *       - in: query
 *         name: period
 *         required: false
 *         schema:
 *           type: string
 *           enum: [month, year]
 *           default: month
 *         description: Período das taxas
 *     responses:
 *       200:
 *         description: Taxas consultadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           example: 2
 *                         period:
 *                           type: string
 *                           example: "month"
 *                         fees:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "FEE-123"
 *                               amount:
 *                                 type: number
 *                                 example: 25.50
 *                               description:
 *                                 type: string
 *                                 example: "Taxa de custódia"
 *                               category:
 *                                 type: string
 *                                 example: "platform_fee"
 *                               created_at:
 *                                 type: string
 *                                 format: date-time
 *                         total_fees:
 *                           type: number
 *                           example: 125.75
 *       400:
 *         description: user_id é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/payments/process:
 *   post:
 *     summary: Processar pagamento
 *     description: Processa um pagamento (simulação interna)
 *     tags: [Payment API - Backend Integration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [payment_id]
 *             properties:
 *               payment_id:
 *                 type: string
 *                 example: "PAY-123"
 *                 description: ID do pagamento a ser processado
 *     responses:
 *       200:
 *         description: Pagamento processado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         payment_id:
 *                           type: string
 *                           example: "PAY-123"
 *                         status:
 *                           type: string
 *                           example: "completed"
 *                         processed_at:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: payment_id é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Webhook de confirmação de pagamento
 *     description: Recebe confirmação de pagamento via webhook
 *     tags: [Payment API - Backend Integration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [payment_id, status]
 *             properties:
 *               payment_id:
 *                 type: string
 *                 example: "PAY-123"
 *                 description: ID do pagamento
 *               status:
 *                 type: string
 *                 enum: [approved, declined, completed, failed]
 *                 example: "approved"
 *                 description: Status do pagamento
 *               external_id:
 *                 type: string
 *                 example: "EXT-456"
 *                 description: ID externo do pagamento
 *     responses:
 *       200:
 *         description: Webhook processado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         payment_id:
 *                           type: string
 *                           example: "PAY-123"
 *                         status:
 *                           type: string
 *                           example: "approved"
 *                         external_id:
 *                           type: string
 *                           example: "EXT-456"
 *                         webhook_received_at:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

