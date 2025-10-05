const { db } = require('../../db');
const { hashPassword } = require('../utils/hash');

/**
 * Controller para estudantes
 */
class StudentsController {
  
  /**
   * Cadastro de estudante
   * POST /api/students
   */
  static async create(req, res) {
    try {
      const { name, email, cpf, password } = req.body;

      console.log('🔍 Iniciando cadastro de estudante:', email);

      // Verificar se o email já existe
      const existingEmail = await db('users').where('email', email).first();
      if (existingEmail) {
        console.log('❌ Email já existe:', email);
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado',
          field: 'email'
        });
      }

      // Verificar se o CPF já existe
      const existingCpf = await db('users').where('cpf', cpf).first();
      if (existingCpf) {
        console.log('❌ CPF já existe:', cpf);
        return res.status(400).json({
          success: false,
          message: 'CPF já cadastrado',
          field: 'cpf'
        });
      }

      console.log('✅ Verificações de duplicata OK');

      // Hash da senha
      const hashedPassword = await hashPassword(password);
      console.log('✅ Senha hasheada');

      // Criar estudante no banco
      const [newStudent] = await db('users').insert({
        name,
        email,
        cpf,
        password: hashedPassword,
        role: 'student',
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');

      console.log('✅ Estudante criado com ID:', newStudent.id);

      // Retornar resposta
      res.status(201).json({
        success: true,
        message: 'Estudante cadastrado com sucesso',
        data: {
          student: {
            id: newStudent.id,
            name: newStudent.name,
            email: newStudent.email,
            cpf: newStudent.cpf,
            role: newStudent.role,
            fraud_status: newStudent.fraud_status,
            created_at: newStudent.created_at
          },
        }
      });

      console.log('✅ Cadastro de estudante concluído com sucesso');

    } catch (error) {
      console.error('❌ Erro no cadastro de estudante:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Listar estudantes
   * GET /api/students
   */
  static async list(req, res) {
    try {
      const students = await db('users')
        .select('id', 'name', 'email', 'cpf', 'role', 'fraud_status', 'created_at')
        .where('role', 'student')
        .orderBy('created_at', 'desc');

      res.json({
        success: true,
        message: 'Lista de estudantes',
        data: {
          students,
          total: students.length
        }
      });

    } catch (error) {
      console.error('Erro ao listar estudantes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estudante por ID
   * GET /api/students/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const student = await db('users')
        .select('id', 'name', 'email', 'cpf', 'role', 'fraud_status', 'created_at')
        .where('id', id)
        .where('role', 'student')
        .first();

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Estudante não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Estudante encontrado',
        data: { student }
      });

    } catch (error) {
      console.error('Erro ao buscar estudante:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar dados acadêmicos do estudante
   * GET /api/students/:id/academic-data
   */
  static async getAcademicData(req, res) {
    try {
      const { id } = req.params;
      const studentId = parseInt(id);

      console.log('🔍 Buscando dados acadêmicos para estudante:', studentId);

      // Verificar se o usuário é um estudante
      const student = await db('users')
        .select('id', 'name', 'email', 'role')
        .where('id', studentId)
        .where('role', 'student')
        .first();

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Estudante não encontrado'
        });
      }

      // Chamar API mockada da faculdade
      const axios = require('axios');
      const facultyApiUrl = process.env.FACULTY_API_URL || 'http://localhost:3001';
      
      try {
        const response = await axios.get(`${facultyApiUrl}/academic-data/${studentId}`);
        
        console.log('✅ Dados acadêmicos obtidos da API da faculdade');
        
        res.json({
          success: true,
          message: 'Dados acadêmicos obtidos com sucesso',
          data: {
            student: {
              id: student.id,
              name: student.name,
              email: student.email
            },
            academicData: response.data.data
          }
        });

      } catch (apiError) {
        console.error('❌ Erro ao chamar API da faculdade:', apiError.message);
        
        // Fallback com dados mockados
        const mockAcademicData = {
          studentId: studentId,
          name: student.name,
          institution: "Faculdade Exemplo",
          period: "2025-1",
          gradeAvg: 8.5,
          attendancePct: 92,
          scholarshipPercentage: 50,
          status: "active",
          courses: [
            { name: "Matemática", grade: 9.0, attendance: 95 },
            { name: "Física", grade: 8.0, attendance: 90 },
            { name: "Química", grade: 8.5, attendance: 91 }
          ],
          lastUpdated: new Date().toISOString(),
          note: "Dados mockados - API da faculdade indisponível"
        };

        res.json({
          success: true,
          message: 'Dados acadêmicos obtidos (fonte: mock)',
          data: {
            student: {
              id: student.id,
              name: student.name,
              email: student.email
            },
            academicData: mockAcademicData
          }
        });
      }

    } catch (error) {
      console.error('❌ Erro ao buscar dados acadêmicos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar score do estudante
   * GET /api/students/:id/score
   */
  static async getScore(req, res) {
    try {
      const { id } = req.params;
      const studentId = parseInt(id);

      console.log('🔍 Buscando score para estudante:', studentId);

      // Verificar se o usuário é um estudante
      const student = await db('users')
        .select('id', 'name', 'email', 'role', 'credit_score', 'risk_band', 'fraud_score', 'fraud_status')
        .where('id', studentId)
        .where('role', 'student')
        .first();

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Estudante não encontrado'
        });
      }

      // Chamar Score Engine API
      const axios = require('axios');
      const scoreApiUrl = process.env.SCORE_API_URL || 'http://localhost:3003';
      
      try {
        // Primeiro, calcular o score
        const calculateResponse = await axios.post(`${scoreApiUrl}/scores/calculate`, {
          userId: studentId
        });

        console.log('✅ Score calculado pelo Score Engine');
        
        res.json({
          success: true,
          message: 'Score obtido com sucesso',
          data: {
            student: {
              id: student.id,
              name: student.name,
              email: student.email
            },
            score: calculateResponse.data.data
          }
        });

      } catch (apiError) {
        console.error('❌ Erro ao chamar Score Engine:', apiError.message);
        
        // Se o Score Engine não estiver disponível, retornar dados do banco
        res.json({
          success: true,
          message: 'Score obtido do banco de dados',
          data: {
            student: {
              id: student.id,
              name: student.name,
              email: student.email
            },
            score: {
              userId: studentId,
              score: student.credit_score || 0,
              riskBand: student.risk_band || 'E',
              fraudScore: student.fraud_score || 0,
              fraudStatus: student.fraud_status || 'unknown',
              note: "Dados do banco - Score Engine indisponível"
            }
          }
        });
      }

    } catch (error) {
      console.error('❌ Erro ao buscar score:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = {
  StudentsController
};
