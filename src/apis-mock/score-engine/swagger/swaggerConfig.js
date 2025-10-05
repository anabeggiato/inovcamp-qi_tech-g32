const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'QI-EDU Score Engine API',
            version: '1.0.0',
            description: 'Sistema de Score de Crédito e Antifraude - Inspirado no Serasa Experian + Sift Science',
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
                url: 'http://localhost:3003',
                description: 'Servidor de Desenvolvimento'
            },
            {
                url: 'https://api.qi-edu.com.br',
                description: 'Servidor de Produção'
            }
        ],
        components: {
            schemas: {
                ScoreCalculation: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'SCORE-123',
                            description: 'ID único do score'
                        },
                        userId: {
                            type: 'integer',
                            example: 123,
                            description: 'ID do usuário'
                        },
                        score: {
                            type: 'integer',
                            example: 750,
                            minimum: 0,
                            maximum: 1000,
                            description: 'Score final (0-1000)'
                        },
                        riskBand: {
                            type: 'string',
                            example: 'B',
                            enum: ['A', 'B', 'C', 'D', 'E'],
                            description: 'Faixa de risco (A=Excelente, E=Muito Ruim)'
                        },
                        riskBandDescription: {
                            type: 'string',
                            example: 'Bom',
                            description: 'Descrição da faixa de risco'
                        },
                        confidence: {
                            type: 'number',
                            example: 0.92,
                            minimum: 0,
                            maximum: 1,
                            description: 'Confiança do score (0-1)'
                        },
                        breakdown: {
                            type: 'object',
                            properties: {
                                academic: {
                                    type: 'object',
                                    properties: {
                                        score: { type: 'integer', example: 850 },
                                        weight: { type: 'number', example: 0.35 },
                                        factors: { type: 'object' }
                                    }
                                },
                                attendance: {
                                    type: 'object',
                                    properties: {
                                        score: { type: 'integer', example: 750 },
                                        weight: { type: 'number', example: 0.25 },
                                        factors: { type: 'object' }
                                    }
                                },
                                fraud: {
                                    type: 'object',
                                    properties: {
                                        score: { type: 'integer', example: 900 },
                                        weight: { type: 'number', example: 0.25 },
                                        factors: { type: 'object' }
                                    }
                                },
                                risk: {
                                    type: 'object',
                                    properties: {
                                        score: { type: 'integer', example: 800 },
                                        weight: { type: 'number', example: 0.15 },
                                        factors: { type: 'object' }
                                    }
                                }
                            }
                        },
                        negativeFactors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    code: { type: 'string', example: 'ACAD_001' },
                                    description: { type: 'string', example: 'Performance acadêmica abaixo da média' },
                                    impact: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                                    category: { type: 'string', example: 'ACADEMIC' }
                                }
                            }
                        },
                        recommendations: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', example: 'CREDIT_APPROVAL' },
                                    message: { type: 'string', example: 'Bom candidato para crédito' },
                                    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                                    action: { type: 'string', enum: ['APPROVE', 'REVIEW', 'DECLINE', 'MONITOR'] }
                                }
                            }
                        },
                        calculatedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00Z'
                        },
                        validUntil: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-02-15T10:30:00Z'
                        }
                    }
                },
                FraudAnalysis: {
                    type: 'object',
                    properties: {
                        transactionId: {
                            type: 'string',
                            example: 'TXN-123',
                            description: 'ID da transação'
                        },
                        userId: {
                            type: 'integer',
                            example: 123,
                            description: 'ID do usuário'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00Z'
                        },
                        factors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', example: 'VELOCITY' },
                                    score: { type: 'integer', example: 25, minimum: 0, maximum: 100 },
                                    weight: { type: 'number', example: 0.25 },
                                    description: { type: 'string', example: 'Velocidade de transações normal' }
                                }
                            }
                        },
                        riskScore: {
                            type: 'integer',
                            example: 25,
                            minimum: 0,
                            maximum: 100,
                            description: 'Score de risco final (0-100)'
                        },
                        riskLevel: {
                            type: 'string',
                            example: 'LOW',
                            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                            description: 'Nível de risco'
                        },
                        decision: {
                            type: 'string',
                            example: 'APPROVE',
                            enum: ['APPROVE', 'REVIEW', 'DECLINE', 'BLOCK'],
                            description: 'Decisão da análise'
                        },
                        confidence: {
                            type: 'number',
                            example: 0.95,
                            minimum: 0,
                            maximum: 1,
                            description: 'Confiança da análise'
                        },
                        recommendations: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', example: 'APPROVAL' },
                                    message: { type: 'string', example: 'Transação aprovada - baixo risco detectado' },
                                    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] }
                                }
                            }
                        }
                    }
                },
                CreditAnalysis: {
                    type: 'object',
                    properties: {
                        userId: {
                            type: 'integer',
                            example: 123
                        },
                        requestedAmount: {
                            type: 'number',
                            example: 10000
                        },
                        loanTerm: {
                            type: 'integer',
                            example: 12
                        },
                        score: {
                            type: 'object',
                            properties: {
                                value: { type: 'integer', example: 750 },
                                band: { type: 'string', example: 'B' },
                                confidence: { type: 'number', example: 0.92 }
                            }
                        },
                        fraudAnalysis: {
                            $ref: '#/components/schemas/FraudAnalysis'
                        },
                        eligibility: {
                            type: 'object',
                            properties: {
                                eligible: { type: 'boolean', example: true },
                                reason: { type: 'string', example: 'Score adequado' },
                                riskLevel: { type: 'string', example: 'LOW' }
                            }
                        },
                        creditConditions: {
                            type: 'object',
                            properties: {
                                interestRate: { type: 'number', example: 1.8 },
                                monthlyPayment: { type: 'number', example: 916.67 },
                                totalAmount: { type: 'number', example: 11000 },
                                totalInterest: { type: 'number', example: 1000 },
                                term: { type: 'integer', example: 12 },
                                riskBand: { type: 'string', example: 'B' }
                            }
                        },
                        recommendations: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', example: 'CREDIT_APPROVAL' },
                                    message: { type: 'string', example: 'Bom candidato para crédito' },
                                    priority: { type: 'string', example: 'LOW' },
                                    action: { type: 'string', example: 'APPROVE' }
                                }
                            }
                        },
                        analyzedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00Z'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Erro ao processar solicitação'
                        },
                        error: {
                            type: 'string',
                            example: 'Detalhes do erro'
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Operação realizada com sucesso'
                        },
                        data: {
                            type: 'object',
                            description: 'Dados retornados'
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Health',
                description: 'Endpoints de saúde da API'
            },
            {
                name: 'Scores (Serasa-Inspired)',
                description: 'Sistema de score de crédito 0-1000 com faixas A-E'
            },
            {
                name: 'Fraud Detection (Sift-Inspired)',
                description: 'Sistema de detecção de fraude em tempo real'
            },
            {
                name: 'Credit Analysis',
                description: 'Análise completa de crédito'
            }
        ]
    },
    apis: ['./routes/*.js', './swagger/paths/*.js']
};

const specs = swaggerJSDoc(options);

module.exports = specs;
