/**
 * @swagger
 * /academic-data:
 *   get:
 *     summary: Lista todos os dados acadêmicos
 *     description: Retorna uma lista com todos os dados acadêmicos dos estudantes (endpoint para debug)
 *     tags: [Academic Data]
 *     responses:
 *       200:
 *         description: Lista de dados acadêmicos recuperada com sucesso
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
 *                         $ref: '#/components/schemas/Student'
 *             example:
 *               success: true
 *               message: "Lista de dados acadêmicos"
 *               data:
 *                 - studentId: 1
 *                   name: "Alice Silva"
 *                   cpf: "123.456.789-00"
 *                   institution: "Faculdade Exemplo"
 *                   period: "2025-1"
 *                   gradeAvg: 8.5
 *                   attendancePct: 92
 *                   scholarshipPercentage: 50
 *                   status: "active"
 *                   courses:
 *                     - name: "Matemática"
 *                       grade: 9.0
 *                       attendance: 95
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
 * /academic-data/{studentId}:
 *   get:
 *     summary: Busca dados acadêmicos de um estudante
 *     description: Retorna os dados acadêmicos completos de um estudante específico
 *     tags: [Academic Data]
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
 *         description: Dados acadêmicos recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Student'
 *             example:
 *               success: true
 *               message: "Dados acadêmicos recuperados com sucesso"
 *               data:
 *                 studentId: 1
 *                 name: "Alice Silva"
 *                 cpf: "123.456.789-00"
 *                 institution: "Faculdade Exemplo"
 *                 period: "2025-1"
 *                 gradeAvg: 8.5
 *                 attendancePct: 92
 *                 scholarshipPercentage: 50
 *                 status: "active"
 *                 courses:
 *                   - name: "Matemática"
 *                     grade: 9.0
 *                     attendance: 95
 *                   - name: "Física"
 *                     grade: 8.0
 *                     attendance: 90
 *                   - name: "Química"
 *                     grade: 8.5
 *                     attendance: 91
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
 *   post:
 *     summary: Atualiza dados acadêmicos de um estudante
 *     description: Atualiza os dados acadêmicos de um estudante específico
 *     tags: [Academic Data]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único do estudante
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStudentData'
 *           example:
 *             name: "Alice Silva Santos"
 *             cpf: "123.456.789-00"
 *             institution: "Faculdade Exemplo"
 *             period: "2025-1"
 *             gradeAvg: 8.7
 *             attendancePct: 94
 *             scholarshipPercentage: 60
 *             status: "active"
 *     responses:
 *       200:
 *         description: Dados acadêmicos atualizados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Student'
 *             example:
 *               success: true
 *               message: "Dados acadêmicos atualizados com sucesso"
 *               data:
 *                 studentId: 1
 *                 name: "Alice Silva Santos"
 *                 cpf: "123.456.789-00"
 *                 institution: "Faculdade Exemplo"
 *                 period: "2025-1"
 *                 gradeAvg: 8.7
 *                 attendancePct: 94
 *                 scholarshipPercentage: 60
 *                 status: "active"
 *                 courses:
 *                   - name: "Matemática"
 *                     grade: 9.0
 *                     attendance: 95
 *                 lastUpdated: "2025-10-04T17:00:41.916Z"
 *               timestamp: "2025-10-04T17:00:41.916Z"
 *               statusCode: 200
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidId:
 *                 summary: ID inválido
 *                 value:
 *                   success: false
 *                   message: "ID do estudante inválido"
 *                   timestamp: "2025-10-04T17:00:23.617Z"
 *                   statusCode: 400
 *               invalidScholarship:
 *                 summary: Porcentagem de bolsa inválida
 *                 value:
 *                   success: false
 *                   message: "Porcentagem de bolsa deve ser um número entre 0 e 100"
 *                   timestamp: "2025-10-04T17:00:23.617Z"
 *                   statusCode: 400
 *               invalidCpf:
 *                 summary: CPF inválido
 *                 value:
 *                   success: false
 *                   message: "CPF deve estar no formato XXX.XXX.XXX-XX"
 *                   timestamp: "2025-10-04T17:00:23.617Z"
 *                   statusCode: 400
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
