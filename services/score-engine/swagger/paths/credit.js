/**
 * @swagger
 * /credit/analyze:
 *   post:
 *     summary: Análise de Crédito Completa
 *     description: Realiza análise completa de crédito combinando score e antifraude
 *     tags: [Credit Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, requestedAmount]
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 123
 *                 description: ID do usuário
 *               requestedAmount:
 *                 type: number
 *                 example: 10000
 *                 description: Valor solicitado do crédito
 *               loanTerm:
 *                 type: integer
 *                 example: 12
 *                 description: Prazo do empréstimo em meses
 *               transactionData:
 *                 type: object
 *                 description: Dados da transação para análise de fraude
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 10000
 *                   paymentMethod:
 *                     type: string
 *                     example: "pix"
 *                   deviceFingerprint:
 *                     type: string
 *                     example: "abc123def456"
 *                   userAgent:
 *                     type: string
 *                     example: "Mozilla/5.0..."
 *                   location:
 *                     type: object
 *                     properties:
 *                       country:
 *                         type: string
 *                         example: "BR"
 *                       city:
 *                         type: string
 *                         example: "São Paulo"
 *                       latitude:
 *                         type: number
 *                         example: -23.5505
 *                       longitude:
 *                         type: number
 *                         example: -46.6333
 *     responses:
 *       200:
 *         description: Análise de crédito concluída
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CreditAnalysis'
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


