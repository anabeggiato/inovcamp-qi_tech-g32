const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'QI-EDU Payment API',
            version: '1.0.0',
            description: 'API Mock para simulação de pagamentos, custódia e ledger - QI-EDU Platform',
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
                url: 'http://localhost:3002',
                description: 'Servidor de Desenvolvimento'
            },
            {
                url: 'https://api.qi-edu.com.br',
                description: 'Servidor de Produção'
            }
        ],
        components: {
            schemas: {
                PaymentTimingOption: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'during_studies',
                            description: 'Identificador único da opção'
                        },
                        name: {
                            type: 'string',
                            example: 'Durante os Estudos',
                            description: 'Nome da opção'
                        },
                        description: {
                            type: 'string',
                            example: 'Começa a pagar 3 meses após o empréstimo',
                            description: 'Descrição da opção'
                        }
                    }
                },
                PaymentPlan: {
                    type: 'object',
                    properties: {
                        loanId: {
                            type: 'string',
                            example: 'LOAN-123',
                            description: 'ID do empréstimo'
                        },
                        timing: {
                            type: 'string',
                            example: 'during_studies',
                            description: 'Timing escolhido'
                        },
                        totalAmount: {
                            type: 'number',
                            example: 10000,
                            description: 'Valor total do empréstimo'
                        },
                        monthlyPayment: {
                            type: 'number',
                            example: 500,
                            description: 'Valor da parcela mensal'
                        },
                        interestRate: {
                            type: 'number',
                            example: 0.02,
                            description: 'Taxa de juros mensal'
                        },
                        firstPayment: {
                            type: 'string',
                            format: 'date',
                            example: '2024-02-01',
                            description: 'Data do primeiro pagamento'
                        },
                        lastPayment: {
                            type: 'string',
                            format: 'date',
                            example: '2024-12-01',
                            description: 'Data do último pagamento'
                        },
                        installments: {
                            type: 'integer',
                            example: 20,
                            description: 'Número total de parcelas'
                        },
                        installmentsList: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Installment'
                            },
                            description: 'Lista de parcelas'
                        }
                    }
                },
                Installment: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'INST-123',
                            description: 'ID da parcela'
                        },
                        loan_id: {
                            type: 'string',
                            example: 'LOAN-123',
                            description: 'ID do empréstimo'
                        },
                        number: {
                            type: 'integer',
                            example: 1,
                            description: 'Número da parcela'
                        },
                        amount: {
                            type: 'number',
                            example: 500,
                            description: 'Valor da parcela'
                        },
                        principal_amount: {
                            type: 'number',
                            example: 400,
                            description: 'Valor do principal'
                        },
                        interest_amount: {
                            type: 'number',
                            example: 100,
                            description: 'Valor dos juros'
                        },
                        due_date: {
                            type: 'string',
                            format: 'date',
                            example: '2024-02-01',
                            description: 'Data de vencimento'
                        },
                        payment_phase: {
                            type: 'string',
                            example: 'during_studies',
                            description: 'Fase do pagamento'
                        },
                        is_symbolic: {
                            type: 'boolean',
                            example: false,
                            description: 'Se é pagamento simbólico'
                        },
                        investor_share: {
                            type: 'number',
                            example: 475,
                            description: 'Parte do investidor'
                        },
                        qi_edu_fee_share: {
                            type: 'number',
                            example: 25,
                            description: 'Parte da QI-EDU'
                        },
                        status: {
                            type: 'string',
                            example: 'pending',
                            enum: ['pending', 'paid', 'overdue', 'paid_early', 'paid_late'],
                            description: 'Status da parcela'
                        }
                    }
                },
                PaymentOrchestration: {
                    type: 'object',
                    required: ['loanId', 'installmentId', 'paymentMethod', 'amount', 'fromAccount', 'toAccount'],
                    properties: {
                        loanId: {
                            type: 'string',
                            example: 'LOAN-123',
                            description: 'ID do empréstimo'
                        },
                        installmentId: {
                            type: 'string',
                            example: 'INST-123',
                            description: 'ID da parcela'
                        },
                        paymentMethod: {
                            type: 'string',
                            enum: ['pix', 'boleto', 'credit_card', 'debit_card'],
                            example: 'pix',
                            description: 'Método de pagamento'
                        },
                        amount: {
                            type: 'number',
                            example: 500,
                            description: 'Valor do pagamento'
                        },
                        fromAccount: {
                            type: 'string',
                            example: 'CUST-123',
                            description: 'Conta de origem (custódia)'
                        },
                        toAccount: {
                            type: 'string',
                            example: 'CUST-456',
                            description: 'Conta de destino (custódia)'
                        },
                        description: {
                            type: 'string',
                            example: 'Pagamento parcela 1',
                            description: 'Descrição do pagamento'
                        },
                        cardData: {
                            type: 'object',
                            properties: {
                                number: {
                                    type: 'string',
                                    example: '4111111111111111',
                                    description: 'Número do cartão'
                                },
                                expiryMonth: {
                                    type: 'string',
                                    example: '12',
                                    description: 'Mês de expiração'
                                },
                                expiryYear: {
                                    type: 'string',
                                    example: '2025',
                                    description: 'Ano de expiração'
                                },
                                cvv: {
                                    type: 'string',
                                    example: '123',
                                    description: 'Código de segurança'
                                },
                                holderName: {
                                    type: 'string',
                                    example: 'João Silva',
                                    description: 'Nome do portador'
                                }
                            },
                            description: 'Dados do cartão (apenas para credit_card)'
                        },
                        installments: {
                            type: 'integer',
                            example: 1,
                            description: 'Número de parcelas (apenas para credit_card)'
                        },
                        bankAccount: {
                            type: 'object',
                            properties: {
                                accountNumber: {
                                    type: 'string',
                                    example: '12345-6',
                                    description: 'Número da conta'
                                },
                                bankCode: {
                                    type: 'string',
                                    example: '001',
                                    description: 'Código do banco'
                                },
                                agency: {
                                    type: 'string',
                                    example: '1234',
                                    description: 'Agência'
                                }
                            },
                            description: 'Dados da conta bancária (apenas para debit_card)'
                        }
                    }
                },
                PaymentStatus: {
                    type: 'object',
                    properties: {
                        payment: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    example: 'PIX-123',
                                    description: 'ID do pagamento'
                                },
                                type: {
                                    type: 'string',
                                    example: 'pix',
                                    description: 'Tipo do pagamento'
                                },
                                amount: {
                                    type: 'number',
                                    example: 500,
                                    description: 'Valor do pagamento'
                                },
                                status: {
                                    type: 'string',
                                    example: 'approved',
                                    enum: ['pending', 'processing', 'approved', 'declined', 'completed', 'failed'],
                                    description: 'Status do pagamento'
                                },
                                createdAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2024-01-01T10:00:00Z',
                                    description: 'Data de criação'
                                },
                                approvedAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2024-01-01T10:05:00Z',
                                    description: 'Data de aprovação'
                                }
                            }
                        },
                        ledger: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: {
                                        type: 'string',
                                        example: 'LEDGER-123',
                                        description: 'ID da entrada no ledger'
                                    },
                                    fromAccount: {
                                        type: 'string',
                                        example: 'CUST-123',
                                        description: 'Conta de origem'
                                    },
                                    toAccount: {
                                        type: 'string',
                                        example: 'CUST-456',
                                        description: 'Conta de destino'
                                    },
                                    amount: {
                                        type: 'number',
                                        example: 500,
                                        description: 'Valor da transação'
                                    },
                                    description: {
                                        type: 'string',
                                        example: 'Pagamento parcela 1 - PIX',
                                        description: 'Descrição da transação'
                                    },
                                    status: {
                                        type: 'string',
                                        example: 'completed',
                                        description: 'Status da transação'
                                    }
                                }
                            },
                            description: 'Entradas no ledger'
                        },
                        custody: {
                            type: 'string',
                            example: 'processed',
                            description: 'Status na custódia'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                            description: 'Indica se a operação foi bem-sucedida'
                        },
                        message: {
                            type: 'string',
                            example: 'Erro ao processar pagamento',
                            description: 'Mensagem de erro'
                        },
                        error: {
                            type: 'string',
                            example: 'Saldo insuficiente',
                            description: 'Detalhes do erro'
                        }
                    }
                },
                Success: {
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
                            description: 'Mensagem de sucesso'
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
                name: 'Payment Options',
                description: 'Opções de timing de pagamento'
            },
            {
                name: 'Payment Plans',
                description: 'Criação e gestão de planos de pagamento'
            },
            {
                name: 'Payment Processing',
                description: 'Processamento de pagamentos'
            },
            {
                name: 'Installments',
                description: 'Gestão de parcelas'
            },
            {
                name: 'Payment API - Backend Integration',
                description: 'Endpoints para integração com o backend principal'
            },
            {
                name: 'Custody Accounts',
                description: 'Gestão de contas de custódia'
            }
        ]
    },
    apis: ['./routes/*.js', './swagger/paths/*.js']
};

const specs = swaggerJSDoc(options);

module.exports = specs;
