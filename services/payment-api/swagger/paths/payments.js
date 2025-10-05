/**
 * @swagger
 * /payments/options:
 *   get:
 *     summary: Listar Opções de Pagamento
 *     description: Retorna as opções de timing de pagamento disponíveis
 *     tags: [Payment Options]
 *     responses:
 *       200:
 *         description: Opções listadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: 'object'
 *                   properties:
 *                     data:
 *                       type: 'array'
 *                       items:
 *                         $ref: '#/components/schemas/PaymentTimingOption'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /payments/create-plan:
 *   post:
 *     summary: Criar Plano de Pagamento
 *     description: Cria um plano de pagamento para um empréstimo baseado no timing escolhido
 *     tags: [Payment Plans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: 'object'
 *             required: [loan, paymentTiming]
 *             properties:
 *               loan:
 *                 type: 'object'
 *                 required: [id, amount, term_months, interest_rate]
 *                 properties:
 *                   id:
 *                     type: 'string'
 *                     example: 'LOAN-123'
 *                     description: 'ID do empréstimo'
 *                   amount:
 *                     type: 'number'
 *                     example: 10000
 *                     description: 'Valor do empréstimo'
 *                   term_months:
 *                     type: 'integer'
 *                     example: 20
 *                     description: 'Prazo em meses'
 *                   interest_rate:
 *                     type: 'number'
 *                     example: 0.02
 *                     description: 'Taxa de juros mensal'
 *               paymentTiming:
 *                 type: 'string'
 *                 enum: [during_studies, after_graduation, hybrid]
 *                 example: 'during_studies'
 *                 description: 'Timing de pagamento escolhido'
 *     responses:
 *       200:
 *         description: Plano de pagamento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: 'object'
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PaymentPlan'
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
 * /payments/pay-installment:
 *   post:
 *     summary: Pagar Parcela (Simples)
 *     description: Processa pagamento de uma parcela de forma simples
 *     tags: [Payment Processing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: 'object'
 *             required: [installmentId, paymentMethod]
 *             properties:
 *               installmentId:
 *                 type: 'string'
 *                 example: 'INST-123'
 *                 description: 'ID da parcela'
 *               paymentMethod:
 *                 type: 'string'
 *                 enum: [pix, boleto, credit_card, debit_card]
 *                 example: 'pix'
 *                 description: 'Método de pagamento'
 *               paymentDate:
 *                 type: 'string'
 *                 format: 'date-time'
 *                 example: '2024-01-01T10:00:00Z'
 *                 description: 'Data do pagamento (opcional)'
 *     responses:
 *       200:
 *         description: Pagamento processado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: 'object'
 *                   properties:
 *                     data:
 *                       type: 'object'
 *                       properties:
 *                         transactionId:
 *                           type: 'string'
 *                           example: 'TXN-123'
 *                           description: 'ID da transação'
 *                         installmentId:
 *                           type: 'string'
 *                           example: 'INST-123'
 *                           description: 'ID da parcela'
 *                         paymentMethod:
 *                           type: 'string'
 *                           example: 'pix'
 *                           description: 'Método de pagamento'
 *                         status:
 *                           type: 'string'
 *                           example: 'processing'
 *                           description: 'Status do pagamento'
 *                         paymentDate:
 *                           type: 'string'
 *                           format: 'date-time'
 *                           example: '2024-01-01T10:00:00Z'
 *                           description: 'Data do pagamento'
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
 * /payments/orchestrate:
 *   post:
 *     summary: Orquestrar Pagamento Completo
 *     description: Orquestra pagamento completo com custódia, métodos de pagamento e ledger
 *     tags: [Payment Processing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentOrchestration'
 *     responses:
 *       200:
 *         description: Pagamento orquestrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: 'object'
 *                   properties:
 *                     data:
 *                       type: 'object'
 *                       properties:
 *                         success:
 *                           type: 'boolean'
 *                           example: true
 *                           description: 'Indica se a orquestração foi bem-sucedida'
 *                         paymentId:
 *                           type: 'string'
 *                           example: 'PIX-123'
 *                           description: 'ID do pagamento'
 *                         ledgerId:
 *                           type: 'string'
 *                           example: 'LEDGER-123'
 *                           description: 'ID da entrada no ledger'
 *                         status:
 *                           type: 'string'
 *                           example: 'processing'
 *                           description: 'Status da orquestração'
 *                         message:
 *                           type: 'string'
 *                           example: 'Pagamento em processamento'
 *                           description: 'Mensagem de status'
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
 * /payments/status/{paymentId}:
 *   get:
 *     summary: Consultar Status do Pagamento
 *     description: Consulta o status de um pagamento orquestrado
 *     tags: [Payment Processing]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: 'string'
 *         example: 'PIX-123'
 *         description: 'ID do pagamento'
 *     responses:
 *       200:
 *         description: Status consultado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: 'object'
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PaymentStatus'
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

