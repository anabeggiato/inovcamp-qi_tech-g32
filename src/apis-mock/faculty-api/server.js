const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger/swaggerConfig');
const { createServiceLogger } = require('../shared/logger');
const { createResponse, handleError, isValidId } = require('../shared/utils');
require('dotenv').config();

const app = express();
const PORT = process.env.FACULTY_API_PORT || 3001;
const logger = createServiceLogger('faculty-api');

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'QI-EDU Faculty API Documentation'
}));

// Dados mock baseados no seed do banco
const mockAcademicData = {
    1: { // Alice Silva
        studentId: 1,
        name: "Alice Silva",
        cpf: "123.456.789-00",
        institution: "Faculdade Exemplo",
        period: "2025-1",
        gradeAvg: 8.5,
        attendancePct: 92,
        scholarshipPercentage: 50, // 50% de bolsa
        status: "active",
        courses: [
            { name: "Matemática", grade: 9.0, attendance: 95 },
            { name: "Física", grade: 8.0, attendance: 90 },
            { name: "Química", grade: 8.5, attendance: 91 }
        ],
        lastUpdated: new Date().toISOString()
    },
    2: { // Bob Santos (investidor - sem dados acadêmicos)
        studentId: 2,
        name: "Bob Santos",
        cpf: "987.654.321-00",
        institution: null,
        period: null,
        gradeAvg: null,
        attendancePct: null,
        scholarshipPercentage: null,
        status: "not_student",
        courses: [],
        lastUpdated: new Date().toISOString()
    },
    3: { // Charlie Souza
        studentId: 3,
        name: "Charlie Souza",
        cpf: "456.789.123-00",
        institution: "Faculdade Exemplo",
        period: "2025-1",
        gradeAvg: 7.2,
        attendancePct: 85,
        scholarshipPercentage: 30, // 30% de bolsa
        status: "active",
        courses: [
            { name: "Matemática", grade: 7.5, attendance: 88 },
            { name: "Física", grade: 6.8, attendance: 82 },
            { name: "Química", grade: 7.3, attendance: 85 }
        ],
        lastUpdated: new Date().toISOString()
    }
};

// Endpoints da API Mock de Faculdades

// GET /academic-data/:studentId - Busca dados acadêmicos de um estudante
app.get('/academic-data/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const studentIdNum = parseInt(studentId);

        logger.info(`Buscando dados acadêmicos para estudante ${studentId}`);

        // Validação
        if (!isValidId(studentIdNum)) {
            return res.status(400).json(createResponse(false, 'ID do estudante inválido'));
        }

        // Verifica se o usuário é realmente um estudante
        const { query } = require('../shared/database');
        const userResult = await query('SELECT id, name, role FROM users WHERE id = $1', [studentIdNum]);

        if (userResult.rows.length === 0) {
            return res.status(404).json(createResponse(false, 'Usuário não encontrado'));
        }

        const user = userResult.rows[0];
        if (user.role !== 'student') {
            return res.status(403).json(createResponse(false, `Acesso negado. Usuário ${user.name} não é um estudante (role: ${user.role})`));
        }

        if (!mockAcademicData[studentIdNum]) {
            return res.status(404).json(createResponse(false, 'Dados acadêmicos não encontrados para este estudante'));
        }

        const academicData = mockAcademicData[studentIdNum];

        // Simula delay de rede
        setTimeout(() => {
            res.json(createResponse(true, 'Dados acadêmicos recuperados com sucesso', academicData));
        }, 200);

    } catch (error) {
        logger.error('Erro ao buscar dados acadêmicos:', error);
        res.status(500).json(handleError(error, 'GET /academic-data/:studentId'));
    }
});

// GET /academic-data - Lista todos os estudantes (para debug)
app.get('/academic-data', (req, res) => {
    try {
        logger.info('Listando todos os dados acadêmicos');

        res.json(createResponse(true, 'Lista de dados acadêmicos', Object.values(mockAcademicData)));
    } catch (error) {
        logger.error('Erro ao listar dados acadêmicos:', error);
        res.status(500).json(handleError(error, 'GET /academic-data'));
    }
});

// POST /academic-data/:studentId - Atualiza dados acadêmicos (simulação)
app.post('/academic-data/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const studentIdNum = parseInt(studentId);
        const updateData = req.body;

        logger.info(`Atualizando dados acadêmicos para estudante ${studentId}`, updateData);

        // Validação
        if (!isValidId(studentIdNum)) {
            return res.status(400).json(createResponse(false, 'ID do estudante inválido'));
        }

        // Verifica se o usuário é realmente um estudante
        const { query } = require('../shared/database');
        const userResult = await query('SELECT id, name, role FROM users WHERE id = $1', [studentIdNum]);

        if (userResult.rows.length === 0) {
            return res.status(404).json(createResponse(false, 'Usuário não encontrado'));
        }

        const user = userResult.rows[0];
        if (user.role !== 'student') {
            return res.status(403).json(createResponse(false, `Acesso negado. Usuário ${user.name} não é um estudante (role: ${user.role})`));
        }

        if (!mockAcademicData[studentIdNum]) {
            return res.status(404).json(createResponse(false, 'Dados acadêmicos não encontrados para este estudante'));
        }

        // Validação específica para os novos campos
        if (updateData.scholarshipPercentage !== undefined) {
            if (typeof updateData.scholarshipPercentage !== 'number' ||
                updateData.scholarshipPercentage < 0 ||
                updateData.scholarshipPercentage > 100) {
                return res.status(400).json(createResponse(false, 'Porcentagem de bolsa deve ser um número entre 0 e 100'));
            }
        }

        if (updateData.cpf !== undefined) {
            // Validação básica de CPF (formato XXX.XXX.XXX-XX)
            const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
            if (!cpfRegex.test(updateData.cpf)) {
                return res.status(400).json(createResponse(false, 'CPF deve estar no formato XXX.XXX.XXX-XX'));
            }
        }

        // Atualiza os dados
        mockAcademicData[studentIdNum] = {
            ...mockAcademicData[studentIdNum],
            ...updateData,
            lastUpdated: new Date().toISOString()
        };

        res.json(createResponse(true, 'Dados acadêmicos atualizados com sucesso', mockAcademicData[studentIdNum]));

    } catch (error) {
        logger.error('Erro ao atualizar dados acadêmicos:', error);
        res.status(500).json(handleError(error, 'POST /academic-data/:studentId'));
    }
});

// GET /scholarship-data/:studentId - Busca dados específicos de bolsa de um estudante
app.get('/scholarship-data/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const studentIdNum = parseInt(studentId);

        logger.info(`Buscando dados de bolsa para estudante ${studentId}`);

        // Validação
        if (!isValidId(studentIdNum)) {
            return res.status(400).json(createResponse(false, 'ID do estudante inválido'));
        }

        // Verifica se o usuário é realmente um estudante
        const { query } = require('../shared/database');
        const userResult = await query('SELECT id, name, role FROM users WHERE id = $1', [studentIdNum]);

        if (userResult.rows.length === 0) {
            return res.status(404).json(createResponse(false, 'Usuário não encontrado'));
        }

        const user = userResult.rows[0];
        if (user.role !== 'student') {
            return res.status(403).json(createResponse(false, `Acesso negado. Usuário ${user.name} não é um estudante (role: ${user.role})`));
        }

        if (!mockAcademicData[studentIdNum]) {
            return res.status(404).json(createResponse(false, 'Dados acadêmicos não encontrados para este estudante'));
        }

        const studentData = mockAcademicData[studentIdNum];

        // Retorna apenas os dados relacionados à bolsa
        const scholarshipData = {
            studentId: studentData.studentId,
            name: studentData.name,
            cpf: studentData.cpf,
            institution: studentData.institution,
            scholarshipPercentage: studentData.scholarshipPercentage,
            status: studentData.status,
            lastUpdated: studentData.lastUpdated
        };

        // Simula delay de rede
        setTimeout(() => {
            res.json(createResponse(true, 'Dados de bolsa recuperados com sucesso', scholarshipData));
        }, 200);

    } catch (error) {
        logger.error('Erro ao buscar dados de bolsa:', error);
        res.status(500).json(handleError(error, 'GET /scholarship-data/:studentId'));
    }
});

// GET /scholarship-data - Lista todos os dados de bolsa (para debug)
app.get('/scholarship-data', (req, res) => {
    try {
        logger.info('Listando todos os dados de bolsa');

        const scholarshipDataList = Object.values(mockAcademicData).map(student => ({
            studentId: student.studentId,
            name: student.name,
            cpf: student.cpf,
            institution: student.institution,
            scholarshipPercentage: student.scholarshipPercentage,
            status: student.status,
            lastUpdated: student.lastUpdated
        }));

        res.json(createResponse(true, 'Lista de dados de bolsa', scholarshipDataList));
    } catch (error) {
        logger.error('Erro ao listar dados de bolsa:', error);
        res.status(500).json(handleError(error, 'GET /scholarship-data'));
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json(createResponse(true, 'Faculty API está funcionando', {
        port: PORT,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    }));
});

// Inicia o servidor
app.listen(PORT, () => {
    logger.info(`Faculty API Mock rodando na porta ${PORT}`);
    console.log(`   Faculty API Mock rodando na porta ${PORT}`);
    console.log(`   Endpoints disponíveis:`);
    console.log(`   GET  /academic-data/:studentId     - Busca dados acadêmicos completos`);
    console.log(`   GET  /academic-data                - Lista todos os dados acadêmicos`);
    console.log(`   POST /academic-data/:studentId     - Atualiza dados acadêmicos`);
    console.log(`   GET  /scholarship-data/:studentId  - Busca dados específicos de bolsa`);
    console.log(`   GET  /scholarship-data             - Lista todos os dados de bolsa`);
    console.log(`   GET  /health                       - Health check`);
    console.log(`   GET  /api-docs                     - Documentação Swagger`);
});

module.exports = app;