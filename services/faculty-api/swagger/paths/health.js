/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check da API
 *     description: Verifica se a API está funcionando corretamente
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API funcionando normalmente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         port:
 *                           type: integer
 *                           example: 3001
 *                           description: Porta em que a API está rodando
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                           example: '2025-10-04T17:00:23.617Z'
 *                           description: Timestamp atual
 *                         uptime:
 *                           type: number
 *                           example: 1234.567
 *                           description: Tempo de funcionamento em segundos
 *             example:
 *               success: true
 *               message: "Faculty API está funcionando"
 *               data:
 *                 port: 3001
 *                 timestamp: "2025-10-04T17:00:23.617Z"
 *                 uptime: 1234.567
 *               timestamp: "2025-10-04T17:00:23.617Z"
 *               statusCode: 200
 */

