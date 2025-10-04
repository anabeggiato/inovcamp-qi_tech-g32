const express = require('express');
const cors = require('cors');
const { createServiceLogger } = require('../shared/logger');
const { createResponse, handleError, isValidId } = require('../shared/utils');
require('dotenv').config();

const app = express();
const PORT = process.env.FACULTY_API_PORT || 3001;
const logger = createServiceLogger('faculty-api');

// Middleware
app.use(cors());
app.use(express.json());

// Dados mock baseados no seed do banco
const mockAcademicData = {
  1: { // Alice Silva
    studentId: 1,
    name: "Alice Silva",
    institution: "Faculdade Exemplo",
    period: "2025-1",
    gradeAvg: 8.5,
    attendancePct: 92,
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
    institution: null,
    period: null,
    gradeAvg: null,
    attendancePct: null,
    status: "not_student",
    courses: [],
    lastUpdated: new Date().toISOString()
  },
  3: { // Charlie Souza
    studentId: 3,
    name: "Charlie Souza",
    institution: "Faculdade Exemplo",
    period: "2025-1",
    gradeAvg: 7.2,
    attendancePct: 85,
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
app.get('/academic-data/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const studentIdNum = parseInt(studentId);

    logger.info(`Buscando dados acadêmicos para estudante ${studentId}`);

    // Validação
    if (!isValidId(studentIdNum)) {
      return res.status(400).json(createResponse(false, 'ID do estudante inválido'));
    }

    if (!mockAcademicData[studentIdNum]) {
      return res.status(404).json(createResponse(false, 'Estudante não encontrado'));
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
app.post('/academic-data/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const studentIdNum = parseInt(studentId);
    const updateData = req.body;

    logger.info(`Atualizando dados acadêmicos para estudante ${studentId}`, updateData);

    // Validação
    if (!isValidId(studentIdNum)) {
      return res.status(400).json(createResponse(false, 'ID do estudante inválido'));
    }

    if (!mockAcademicData[studentIdNum]) {
      return res.status(404).json(createResponse(false, 'Estudante não encontrado'));
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
  console.log(`   GET  /academic-data/:studentId`);
  console.log(`   GET  /academic-data`);
  console.log(`   POST /academic-data/:studentId`);
  console.log(`   GET  /health`);
});

module.exports = app;