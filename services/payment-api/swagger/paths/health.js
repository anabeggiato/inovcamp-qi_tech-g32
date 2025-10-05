/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Verifica se a API está funcionando
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API funcionando normalmente
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
 *                         port:
 *                           type: 'integer'
 *                           example: 3002
 *                           description: Porta da API
 *                         timestamp:
 *                           type: 'string'
 *                           format: 'date-time'
 *                           example: '2024-01-01T10:00:00Z'
 *                           description: Timestamp da verificação
 *                         uptime:
 *                           type: 'number'
 *                           example: 3600
 *                           description: Tempo de funcionamento em segundos
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

