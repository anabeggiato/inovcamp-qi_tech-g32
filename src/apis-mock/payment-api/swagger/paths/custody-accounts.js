/**
 * @swagger
 * /custody/accounts:
 *   post:
 *     summary: Criar conta de custódia
 *     description: Cria uma conta de custódia para um usuário
 *     tags: [Custody Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, user_type]
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 2
 *                 description: ID do usuário
 *               user_type:
 *                 type: string
 *                 enum: [investor, student, institution]
 *                 example: investor
 *                 description: Tipo do usuário
 *               initial_balance:
 *                 type: number
 *                 example: 1000
 *                 default: 0
 *                 description: Saldo inicial da conta
 *     responses:
 *       200:
 *         description: Conta de custódia criada com sucesso
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
 *                           example: "user_2"
 *                         userId:
 *                           type: integer
 *                           example: 2
 *                         userType:
 *                           type: string
 *                           example: "investor"
 *                         availableBalance:
 *                           type: number
 *                           example: 1000
 *                         blockedAmount:
 *                           type: number
 *                           example: 0
 *                         totalBalance:
 *                           type: number
 *                           example: 1000
 *                         status:
 *                           type: string
 *                           example: "active"
 *                         createdAt:
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
 * /custody/accounts/{user_id}:
 *   get:
 *     summary: Obter conta de custódia
 *     description: Consulta a conta de custódia de um usuário
 *     tags: [Custody Accounts]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 2
 *     responses:
 *       200:
 *         description: Conta encontrada
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
 *                           example: "user_2"
 *                         userId:
 *                           type: integer
 *                           example: 2
 *                         userType:
 *                           type: string
 *                           example: "investor"
 *                         availableBalance:
 *                           type: number
 *                           example: 1000
 *                         blockedAmount:
 *                           type: number
 *                           example: 0
 *                         totalBalance:
 *                           type: number
 *                           example: 1000
 *                         status:
 *                           type: string
 *                           example: "active"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Conta não encontrada
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
 * /custody/accounts/{user_id}/deposit:
 *   post:
 *     summary: Depositar valor na conta
 *     description: Deposita um valor na conta de custódia de um usuário
 *     tags: [Custody Accounts]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, payment_method]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *                 description: Valor do depósito
 *               payment_method:
 *                 type: string
 *                 enum: [pix, boleto, credit_card, debit_card]
 *                 example: pix
 *                 description: Método de pagamento
 *               description:
 *                 type: string
 *                 example: "Depósito inicial"
 *                 description: Descrição do depósito
 *     responses:
 *       200:
 *         description: Depósito realizado com sucesso
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
 *                         transactionId:
 *                           type: string
 *                           example: "DEP-123"
 *                         userId:
 *                           type: integer
 *                           example: 2
 *                         amount:
 *                           type: number
 *                           example: 500
 *                         paymentMethod:
 *                           type: string
 *                           example: "pix"
 *                         status:
 *                           type: string
 *                           example: "completed"
 *                         newBalance:
 *                           type: number
 *                           example: 1500
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

