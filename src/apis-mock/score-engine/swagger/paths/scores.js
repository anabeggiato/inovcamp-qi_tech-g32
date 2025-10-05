/**
 * @swagger
 * /scores/calculate:
 *   post:
 *     summary: Calcular Score de Crédito
 *     description: Calcula score completo do usuário usando sistema inspirado no Serasa (0-1000, faixas A-E)
 *     tags: [Scores (Serasa-Inspired)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 123
 *                 description: ID do usuário
 *     responses:
 *       200:
 *         description: Score calculado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ScoreCalculation'
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
 * /scores/{userId}:
 *   get:
 *     summary: Consultar Score do Usuário
 *     description: Consulta o score mais recente de um usuário
 *     tags: [Scores (Serasa-Inspired)]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 123
 *     responses:
 *       200:
 *         description: Score consultado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ScoreCalculation'
 *       404:
 *         description: Score não encontrado
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
 * /scores/{userId}/history:
 *   get:
 *     summary: Consultar Histórico de Scores
 *     description: Consulta o histórico de scores do usuário
 *     tags: [Scores (Serasa-Inspired)]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 123
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de scores no histórico
 *     responses:
 *       200:
 *         description: Histórico de scores consultado com sucesso
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
 *                         userId:
 *                           type: integer
 *                           example: 123
 *                         history:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "SCORE-123"
 *                               userId:
 *                                 type: integer
 *                                 example: 123
 *                               score:
 *                                 type: integer
 *                                 example: 750
 *                               reasonJson:
 *                                 type: object
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                         totalScores:
 *                           type: integer
 *                           example: 5
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
