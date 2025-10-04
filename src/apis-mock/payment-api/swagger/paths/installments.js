/**
 * @swagger
 * /installments/{loanId}:
 *   get:
 *     summary: Listar Parcelas do Empréstimo
 *     description: Lista todas as parcelas de um empréstimo específico
 *     tags: [Installments]
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: 'string'
 *         example: 'LOAN-123'
 *         description: 'ID do empréstimo'
 *     responses:
 *       200:
 *         description: Parcelas listadas com sucesso
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
 *                         loanId:
 *                           type: 'string'
 *                           example: 'LOAN-123'
 *                           description: 'ID do empréstimo'
 *                         totalInstallments:
 *                           type: 'integer'
 *                           example: 20
 *                           description: 'Número total de parcelas'
 *                         installments:
 *                           type: 'array'
 *                           items:
 *                             $ref: '#/components/schemas/Installment'
 *                           description: 'Lista de parcelas'
 *       404:
 *         description: Empréstimo não encontrado ou sem parcelas
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
 * /installments/{loanId}/summary:
 *   get:
 *     summary: Resumo de Pagamentos
 *     description: Gera resumo de pagamentos de um empréstimo
 *     tags: [Installments]
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: 'string'
 *         example: 'LOAN-123'
 *         description: 'ID do empréstimo'
 *     responses:
 *       200:
 *         description: Resumo gerado com sucesso
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
 *                         loanId:
 *                           type: 'string'
 *                           example: 'LOAN-123'
 *                           description: 'ID do empréstimo'
 *                         totalInstallments:
 *                           type: 'integer'
 *                           example: 20
 *                           description: 'Número total de parcelas'
 *                         paid:
 *                           type: 'integer'
 *                           example: 5
 *                           description: 'Número de parcelas pagas'
 *                         pending:
 *                           type: 'integer'
 *                           example: 15
 *                           description: 'Número de parcelas pendentes'
 *                         overdue:
 *                           type: 'integer'
 *                           example: 0
 *                           description: 'Número de parcelas em atraso'
 *                         totalAmount:
 *                           type: 'number'
 *                           example: 10000
 *                           description: 'Valor total do empréstimo'
 *                         paidAmount:
 *                           type: 'number'
 *                           example: 2500
 *                           description: 'Valor total pago'
 *                         remainingAmount:
 *                           type: 'number'
 *                           example: 7500
 *                           description: 'Valor restante a pagar'
 *       404:
 *         description: Empréstimo não encontrado
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

