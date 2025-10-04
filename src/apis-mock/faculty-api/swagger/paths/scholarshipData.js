/**
 * @swagger
 * /scholarship-data:
 *   get:
 *     summary: Lista todos os dados de bolsa
 *     description: Retorna uma lista com todos os dados de bolsa dos estudantes (endpoint para debug)
 *     tags: [Scholarship Data]
 *     responses:
 *       200:
 *         description: Lista de dados de bolsa recuperada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ScholarshipData'
 *             example:
 *               success: true
 *               message: "Lista de dados de bolsa"
 *               data:
 *                 - studentId: 1
 *                   name: "Alice Silva"
 *                   cpf: "123.456.789-00"
 *                   institution: "Faculdade Exemplo"
 *                   scholarshipPercentage: 50
 *                   status: "active"
 *                   lastUpdated: "2025-10-04T17:00:23.617Z"
 *                 - studentId: 2
 *                   name: "Bob Santos"
 *                   cpf: "987.654.321-00"
 *                   institution: null
 *                   scholarshipPercentage: null
 *                   status: "not_student"
 *                   lastUpdated: "2025-10-04T17:00:23.617Z"
 *                 - studentId: 3
 *                   name: "Charlie Souza"
 *                   cpf: "456.789.123-00"
 *                   institution: "Faculdade Exemplo"
 *                   scholarshipPercentage: 30
 *                   status: "active"
 *                   lastUpdated: "2025-10-04T17:00:23.617Z"
 *               timestamp: "2025-10-04T17:00:23.617Z"
 *               statusCode: 200
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /scholarship-data/{studentId}:
 *   get:
 *     summary: Busca dados de bolsa de um estudante
 *     description: Retorna os dados específicos de bolsa de um estudante
 *     tags: [Scholarship Data]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único do estudante
 *         example: 1
 *     responses:
 *       200:
 *         description: Dados de bolsa recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ScholarshipData'
 *             example:
 *               success: true
 *               message: "Dados de bolsa recuperados com sucesso"
 *               data:
 *                 studentId: 1
 *                 name: "Alice Silva"
 *                 cpf: "123.456.789-00"
 *                 institution: "Faculdade Exemplo"
 *                 scholarshipPercentage: 50
 *                 status: "active"
 *                 lastUpdated: "2025-10-04T17:00:23.617Z"
 *               timestamp: "2025-10-04T17:00:23.617Z"
 *               statusCode: 200
 *       400:
 *         description: ID do estudante inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "ID do estudante inválido"
 *               timestamp: "2025-10-04T17:00:23.617Z"
 *               statusCode: 400
 *       404:
 *         description: Estudante não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Estudante não encontrado"
 *               timestamp: "2025-10-04T17:00:23.617Z"
 *               statusCode: 404
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
