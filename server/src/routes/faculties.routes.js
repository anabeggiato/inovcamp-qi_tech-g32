const express = require('express');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth.middleware');
const { apiIntegration } = require('../services/apiIntegration.service');

const router = express.Router();

/**
 * @route   GET /api/faculties
 * @desc    Listar todas as instituições de ensino
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    console.log('🏫 Listando instituições de ensino');

    // Buscar dados acadêmicos via Faculty API para obter lista de instituições
    const academicData = await apiIntegration.getAcademicData('all');

    // Extrair instituições únicas dos dados acadêmicos
    const institutions = [];
    if (academicData.data && Array.isArray(academicData.data)) {
      const uniqueInstitutions = new Set();
      academicData.data.forEach(student => {
        if (student.institution && !uniqueInstitutions.has(student.institution)) {
          uniqueInstitutions.add(student.institution);
          institutions.push({
            name: student.institution,
            students_count: academicData.data.filter(s => s.institution === student.institution).length
          });
        }
      });
    }

    res.json({
      success: true,
      message: 'Instituições listadas com sucesso',
      data: {
        institutions,
        pagination: {
          page: 1,
          limit: 20,
          total: institutions.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar instituições:', error);

    // Fallback com dados mockados
    res.json({
      success: true,
      message: 'Instituições listadas (dados mockados)',
      data: {
        institutions: [
          { name: 'Faculdade Exemplo', students_count: 2 }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1
        },
        note: 'Faculty API indisponível - dados mockados'
      }
    });
  }
});

/**
 * @route   GET /api/faculties/:id
 * @desc    Obter detalhes de uma instituição específica
 * @access  Public
 */
router.get('/:id', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Detalhes da instituição',
    data: {
      institutionId: req.params.id,
      institution: null,
      note: 'Implementar lógica para buscar dados da instituição'
    }
  });
});

/**
 * @route   GET /api/faculties/:id/loans
 * @desc    Listar empréstimos de uma instituição
 * @access  Private (Institution/Admin)
 */
router.get('/:id/loans', authenticateToken, requireRole(['admin', 'system']), (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Empréstimos da instituição',
    data: {
      institutionId: req.params.id,
      loans: [],
      note: 'Implementar lógica para buscar empréstimos da instituição'
    }
  });
});

/**
 * @route   GET /api/faculties/:id/students
 * @desc    Listar estudantes de uma instituição
 * @access  Private (Institution/Admin)
 */
router.get('/:id/students', authenticateToken, requireRole(['admin', 'system']), (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Estudantes da instituição',
    data: {
      institutionId: req.params.id,
      students: [],
      note: 'Implementar lógica para buscar estudantes da instituição'
    }
  });
});

/**
 * @route   GET /api/faculties/:id/analytics
 * @desc    Obter analytics da instituição
 * @access  Private (Institution/Admin)
 */
router.get('/:id/analytics', authenticateToken, requireRole(['admin', 'system']), (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Analytics da instituição',
    data: {
      institutionId: req.params.id,
      analytics: {
        totalStudents: 0,
        activeLoans: 0,
        totalVolume: 0,
        performance: {}
      },
      note: 'Implementar lógica para calcular métricas da instituição'
    }
  });
});

/**
 * @route   POST /api/faculties
 * @desc    Cadastrar nova instituição
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Cadastrar instituição',
    data: {
      note: 'Implementar lógica para cadastrar nova instituição'
    }
  });
});

/**
 * @route   PUT /api/faculties/:id
 * @desc    Atualizar dados da instituição
 * @access  Private (Admin)
 */
router.put('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint placeholder - Atualizar instituição',
    data: {
      institutionId: req.params.id,
      note: 'Implementar lógica para atualizar dados da instituição'
    }
  });
});

/**
 * @route   GET /api/faculties/students/:studentId/academic-data
 * @desc    Obter dados acadêmicos de um estudante
 * @access  Private
 */
router.get('/students/:studentId/academic-data', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;

    console.log(`📚 Buscando dados acadêmicos para estudante ${studentId}`);

    // Verificar se o usuário tem permissão para acessar os dados
    if (req.user.role !== 'admin' && req.user.role !== 'system' && parseInt(userId) !== parseInt(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado - você só pode acessar seus próprios dados acadêmicos'
      });
    }

    // Buscar dados acadêmicos via Faculty API
    const academicData = await apiIntegration.getAcademicData(studentId);

    res.json({
      success: true,
      message: 'Dados acadêmicos obtidos com sucesso',
      data: {
        academicData: academicData.data,
        student: {
          id: studentId,
          name: academicData.data?.name || 'N/A'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados acadêmicos:', error);

    res.status(404).json({
      success: false,
      message: 'Dados acadêmicos não encontrados',
      data: {
        studentId: req.params.studentId,
        note: 'Faculty API indisponível ou estudante não encontrado'
      }
    });
  }
});

/**
 * @route   POST /api/faculties/students/:studentId/academic-data
 * @desc    Atualizar dados acadêmicos de um estudante
 * @access  Private (Admin/System)
 */
router.post('/students/:studentId/academic-data', authenticateToken, requireRole(['admin', 'system']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const updateData = req.body;

    console.log(`📝 Atualizando dados acadêmicos para estudante ${studentId}`);

    // Atualizar dados acadêmicos via Faculty API
    const academicData = await apiIntegration.updateAcademicData(studentId, updateData);

    res.json({
      success: true,
      message: 'Dados acadêmicos atualizados com sucesso',
      data: {
        academicData: academicData.data,
        student: {
          id: studentId,
          name: academicData.data?.name || 'N/A'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar dados acadêmicos:', error);

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar dados acadêmicos',
      error: error.message || 'Faculty API indisponível'
    });
  }
});

/**
 * @route   GET /api/faculties/students/:studentId/scholarship-data
 * @desc    Obter dados de bolsa de um estudante
 * @access  Private
 */
router.get('/students/:studentId/scholarship-data', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;

    console.log(`🎓 Buscando dados de bolsa para estudante ${studentId}`);

    // Verificar se o usuário tem permissão para acessar os dados
    if (req.user.role !== 'admin' && req.user.role !== 'system' && parseInt(userId) !== parseInt(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado - você só pode acessar seus próprios dados de bolsa'
      });
    }

    // Buscar dados de bolsa via Faculty API
    const scholarshipData = await apiIntegration.getScholarshipData(studentId);

    res.json({
      success: true,
      message: 'Dados de bolsa obtidos com sucesso',
      data: {
        scholarshipData: scholarshipData.data,
        student: {
          id: studentId,
          name: scholarshipData.data?.name || 'N/A'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados de bolsa:', error);

    res.status(404).json({
      success: false,
      message: 'Dados de bolsa não encontrados',
      data: {
        studentId: req.params.studentId,
        note: 'Faculty API indisponível ou estudante não encontrado'
      }
    });
  }
});

module.exports = router;
