const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'QI-EDU Faculty API',
            version: '1.0.0',
            description: 'API Mock para dados acadêmicos das faculdades - QI-EDU Platform',
            contact: {
                name: 'QI-EDU Team',
                email: 'dev@qi-edu.com.br'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Servidor de Desenvolvimento'
            },
            {
                url: 'https://api.qi-edu.com.br',
                description: 'Servidor de Produção'
            }
        ],
        components: {
            schemas: {
                Student: {
                    type: 'object',
                    properties: {
                        studentId: {
                            type: 'integer',
                            example: 1,
                            description: 'ID único do estudante'
                        },
                        name: {
                            type: 'string',
                            example: 'Alice Silva',
                            description: 'Nome completo do estudante'
                        },
                        cpf: {
                            type: 'string',
                            example: '123.456.789-00',
                            pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$',
                            description: 'CPF do estudante no formato XXX.XXX.XXX-XX'
                        },
                        institution: {
                            type: 'string',
                            example: 'Faculdade Exemplo',
                            description: 'Nome da instituição de ensino'
                        },
                        period: {
                            type: 'string',
                            example: '2025-1',
                            description: 'Período letivo atual'
                        },
                        gradeAvg: {
                            type: 'number',
                            format: 'float',
                            example: 8.5,
                            minimum: 0,
                            maximum: 10,
                            description: 'Média geral das notas'
                        },
                        attendancePct: {
                            type: 'number',
                            format: 'float',
                            example: 92,
                            minimum: 0,
                            maximum: 100,
                            description: 'Percentual de frequência'
                        },
                        scholarshipPercentage: {
                            type: 'number',
                            format: 'float',
                            example: 50,
                            minimum: 0,
                            maximum: 100,
                            description: 'Porcentagem de bolsa de estudos'
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'inactive', 'not_student'],
                            example: 'active',
                            description: 'Status do estudante'
                        },
                        courses: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Course'
                            },
                            description: 'Lista de disciplinas cursadas'
                        },
                        lastUpdated: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-10-04T17:00:23.617Z',
                            description: 'Data da última atualização'
                        }
                    },
                    required: ['studentId', 'name', 'cpf', 'status']
                },
                Course: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Matemática',
                            description: 'Nome da disciplina'
                        },
                        grade: {
                            type: 'number',
                            format: 'float',
                            example: 9.0,
                            minimum: 0,
                            maximum: 10,
                            description: 'Nota na disciplina'
                        },
                        attendance: {
                            type: 'number',
                            format: 'float',
                            example: 95,
                            minimum: 0,
                            maximum: 100,
                            description: 'Frequência na disciplina'
                        }
                    },
                    required: ['name', 'grade', 'attendance']
                },
                ScholarshipData: {
                    type: 'object',
                    properties: {
                        studentId: {
                            type: 'integer',
                            example: 1,
                            description: 'ID único do estudante'
                        },
                        name: {
                            type: 'string',
                            example: 'Alice Silva',
                            description: 'Nome completo do estudante'
                        },
                        cpf: {
                            type: 'string',
                            example: '123.456.789-00',
                            pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$',
                            description: 'CPF do estudante no formato XXX.XXX.XXX-XX'
                        },
                        institution: {
                            type: 'string',
                            example: 'Faculdade Exemplo',
                            description: 'Nome da instituição de ensino'
                        },
                        scholarshipPercentage: {
                            type: 'number',
                            format: 'float',
                            example: 50,
                            minimum: 0,
                            maximum: 100,
                            description: 'Porcentagem de bolsa de estudos'
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'inactive', 'not_student'],
                            example: 'active',
                            description: 'Status do estudante'
                        },
                        lastUpdated: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-10-04T17:00:23.617Z',
                            description: 'Data da última atualização'
                        }
                    },
                    required: ['studentId', 'name', 'cpf', 'status']
                },
                UpdateStudentData: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Alice Silva Santos',
                            description: 'Nome completo do estudante'
                        },
                        cpf: {
                            type: 'string',
                            example: '123.456.789-00',
                            pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$',
                            description: 'CPF do estudante no formato XXX.XXX.XXX-XX'
                        },
                        institution: {
                            type: 'string',
                            example: 'Faculdade Exemplo',
                            description: 'Nome da instituição de ensino'
                        },
                        period: {
                            type: 'string',
                            example: '2025-1',
                            description: 'Período letivo atual'
                        },
                        gradeAvg: {
                            type: 'number',
                            format: 'float',
                            example: 8.5,
                            minimum: 0,
                            maximum: 10,
                            description: 'Média geral das notas'
                        },
                        attendancePct: {
                            type: 'number',
                            format: 'float',
                            example: 92,
                            minimum: 0,
                            maximum: 100,
                            description: 'Percentual de frequência'
                        },
                        scholarshipPercentage: {
                            type: 'number',
                            format: 'float',
                            example: 50,
                            minimum: 0,
                            maximum: 100,
                            description: 'Porcentagem de bolsa de estudos'
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'inactive', 'not_student'],
                            example: 'active',
                            description: 'Status do estudante'
                        }
                    }
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                            description: 'Indica se a operação foi bem-sucedida'
                        },
                        message: {
                            type: 'string',
                            example: 'Operação realizada com sucesso',
                            description: 'Mensagem de resposta'
                        },
                        data: {
                            type: 'object',
                            description: 'Dados retornados pela operação'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-10-04T17:00:23.617Z',
                            description: 'Timestamp da resposta'
                        },
                        statusCode: {
                            type: 'integer',
                            example: 200,
                            description: 'Código de status HTTP'
                        }
                    },
                    required: ['success', 'message', 'timestamp', 'statusCode']
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                            description: 'Indica se a operação foi bem-sucedida'
                        },
                        message: {
                            type: 'string',
                            example: 'Erro na operação',
                            description: 'Mensagem de erro'
                        },
                        error: {
                            type: 'string',
                            example: 'Detalhes do erro',
                            description: 'Detalhes do erro'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-10-04T17:00:23.617Z',
                            description: 'Timestamp da resposta'
                        },
                        statusCode: {
                            type: 'integer',
                            example: 400,
                            description: 'Código de status HTTP'
                        }
                    },
                    required: ['success', 'message', 'timestamp', 'statusCode']
                }
            }
        },
        tags: [
            {
                name: 'Health',
                description: 'Endpoints de saúde da API'
            },
            {
                name: 'Academic Data',
                description: 'Gestão de dados acadêmicos dos estudantes'
            },
            {
                name: 'Scholarship Data',
                description: 'Gestão de dados de bolsas de estudo'
            }
        ]
    },
    apis: ['./server.js', './swagger/paths/*.js']
};

const specs = swaggerJSDoc(options);

module.exports = specs;

