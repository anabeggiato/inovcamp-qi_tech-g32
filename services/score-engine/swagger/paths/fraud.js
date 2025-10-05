/**
 * @swagger
 * /fraud/analyze:
 *   post:
 *     summary: Analisar Transação em Tempo Real
 *     description: Analisa transação em tempo real usando sistema inspirado no Sift Science
 *     tags: [Fraud Detection (Sift-Inspired)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, amount]
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 123
 *                 description: ID do usuário
 *               transactionId:
 *                 type: string
 *                 example: "TXN-123"
 *                 description: ID da transação
 *               amount:
 *                 type: number
 *                 example: 500
 *                 description: Valor da transação
 *               paymentMethod:
 *                 type: string
 *                 enum: [pix, boleto, credit_card, debit_card]
 *                 example: "pix"
 *                 description: Método de pagamento
 *               deviceFingerprint:
 *                 type: string
 *                 example: "abc123def456"
 *                 description: Impressão digital do dispositivo
 *               userAgent:
 *                 type: string
 *                 example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                 description: User agent do navegador
 *               location:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: "BR"
 *                   city:
 *                     type: string
 *                     example: "São Paulo"
 *                   latitude:
 *                     type: number
 *                     example: -23.5505
 *                   longitude:
 *                     type: number
 *                     example: -46.6333
 *                 description: Localização da transação
 *     responses:
 *       200:
 *         description: Análise de fraude concluída
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FraudAnalysis'
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
 * /fraud/events:
 *   post:
 *     summary: Registrar Evento de Fraude
 *     description: Registra um evento de fraude no sistema
 *     tags: [Fraud Detection (Sift-Inspired)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, eventType]
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 123
 *                 description: ID do usuário
 *               eventType:
 *                 type: string
 *                 example: "SUSPICIOUS_TRANSACTION"
 *                 description: Tipo do evento de fraude
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 example: "medium"
 *                 description: Severidade do evento
 *               payload:
 *                 type: object
 *                 description: Dados adicionais do evento (JSON)
 *                 example: {"attempts": 2, "device": "mobile"}
 *     responses:
 *       200:
 *         description: Evento de fraude registrado com sucesso
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
 *                           example: "FRAUD-123"
 *                         userId:
 *                           type: integer
 *                           example: 123
 *                         eventType:
 *                           type: string
 *                           example: "SUSPICIOUS_TRANSACTION"
 *                         description:
 *                           type: string
 *                           example: "Transação suspeita detectada"
 *                         severity:
 *                           type: string
 *                           example: "medium"
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
 * /fraud/{userId}/risk:
 *   get:
 *     summary: Consultar Risco do Usuário
 *     description: Consulta o nível de risco atual do usuário
 *     tags: [Fraud Detection (Sift-Inspired)]
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
 *         description: Risco do usuário consultado com sucesso
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
 *                         riskLevel:
 *                           type: string
 *                           example: "LOW"
 *                           enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
 *                         riskScore:
 *                           type: integer
 *                           example: 25
 *                           minimum: 0
 *                           maximum: 100
 *                         lastAnalysis:
 *                           type: string
 *                           format: date-time
 *                         fraudHistory:
 *                           type: array
 *                           items:
 *                             type: object
 *                         recommendations:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                                 example: "MONITORING"
 *                               message:
 *                                 type: string
 *                                 example: "Continue monitoramento normal"
 *                               priority:
 *                                 type: string
 *                                 example: "LOW"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /fraud/alerts:
 *   get:
 *     summary: Listar Alertas de Fraude
 *     description: Lista alertas de fraude ativos e resolvidos
 *     tags: [Fraud Detection (Sift-Inspired)]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número máximo de alertas
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, resolved, all]
 *           default: active
 *         description: Status dos alertas
 *     responses:
 *       200:
 *         description: Alertas de fraude listados com sucesso
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
 *                         alerts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "ALERT-001"
 *                               userId:
 *                                 type: integer
 *                                 example: 123
 *                               type:
 *                                 type: string
 *                                 example: "HIGH_RISK_TRANSACTION"
 *                               severity:
 *                                 type: string
 *                                 example: "HIGH"
 *                               description:
 *                                 type: string
 *                                 example: "Transação de alto risco detectada"
 *                               status:
 *                                 type: string
 *                                 example: "active"
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                         totalAlerts:
 *                           type: integer
 *                           example: 2
 *                         filters:
 *                           type: object
 *                           properties:
 *                             limit:
 *                               type: integer
 *                               example: 50
 *                             status:
 *                               type: string
 *                               example: "active"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

