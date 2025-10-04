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
}

module.exports = {
  StudentsController
};
