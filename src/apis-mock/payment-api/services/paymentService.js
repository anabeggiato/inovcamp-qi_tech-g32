const { generateId } = require('../../shared/utils');
const { query, transaction } = require('../../shared/database');
const { createServiceLogger } = require('../../shared/logger');
const {
    calculateCompoundInterest,
    calculateDistribution,
    calculateEarlyPayment,
    calculateLatePayment,
    calculateInstallmentStatus
} = require('../utils/calculations');
const custodyService = require('../custody/custodyService');
const paymentMethods = require('../payment-methods/paymentMethods');
const ledgerService = require('../ledger/ledgerService');

const logger = createServiceLogger('payment-service');

/**
 * Serviço de Pagamentos
 * Gerencia todo o fluxo de pagamentos e custódia
 */

// Simulação de dados em memória
let paymentPlans = {};
let transactions = {};
let ledger = {};

/**
 * Busca empréstimo por ID
 */
async function getLoanById(loanId) {
    try {
        logger.info(`Buscando empréstimo ID: ${loanId}`);
        
        const result = await query(`
            SELECT * FROM loans WHERE id = $1
        `, [loanId]);
        
        logger.info(`Resultado da query: ${JSON.stringify(result.rows)}`);
        
        if (result.rows.length === 0) {
            logger.warn(`Empréstimo ${loanId} não encontrado`);
            return null;
        }
        
        logger.info(`Empréstimo encontrado: ${JSON.stringify(result.rows[0])}`);
        return result.rows[0];
    } catch (error) {
        logger.error('Erro ao buscar empréstimo', error);
        throw error;
    }
}

/**
 * Opções de timing de pagamento
 */
const PAYMENT_TIMING_OPTIONS = {
    during_studies: {
        name: 'Durante os Estudos',
        description: 'Começa a pagar 3 meses após o empréstimo',
        interestRateAdjustment: -0.05, // 5% de desconto
        startDelayMonths: 3
    },

    after_graduation: {
        name: 'Após a Graduação',
        description: 'Começa a pagar 6 meses após a formatura',
        interestRateAdjustment: 0.01, // 1% a mais de juros
        gracePeriodMonths: 6
    },

    hybrid: {
        name: 'Híbrido',
        description: 'Paga simbólico durante + completo após',
        symbolicAmount: 50,
        gracePeriodMonths: 6
    }
};

/**
 * Cria plano de pagamento baseado no timing escolhido
 * @param {Object} loan - Dados do empréstimo
 * @param {string} paymentTiming - Timing escolhido
 * @returns {Object} Plano de pagamento
 */
async function createPaymentPlan(loan, paymentTiming) {
    const { amount, term_months, interest_rate } = loan;
    const baseInterestRate = parseFloat(interest_rate);

    let paymentPlan = {};

    switch (paymentTiming) {
        case 'during_studies':
            paymentPlan = createDuringStudiesPlan(loan, baseInterestRate);
            break;

        case 'after_graduation':
            paymentPlan = createAfterGraduationPlan(loan, baseInterestRate);
            break;

        case 'hybrid':
            paymentPlan = createHybridPlan(loan, baseInterestRate);
            break;

        default:
            throw new Error('Timing de pagamento inválido');
    }

    // Salva o plano no banco de dados
    try {
        await transaction(async (client) => {
            // Atualiza o empréstimo com informações do plano
            await client.query(`
        UPDATE loans 
        SET payment_timing = $1, 
            payment_timing_chosen_at = NOW(),
            interest_rate = $2,
            total_installments = $3,
            monthly_payment = $4,
            first_due_date = $5,
            last_due_date = $6
        WHERE id = $7
      `, [
                paymentTiming,
                paymentPlan.interestRate,
                paymentPlan.installments,
                paymentPlan.monthlyPayment,
                paymentPlan.firstPayment,
                paymentPlan.lastPayment,
                loan.id
            ]);

            // Insere as parcelas
            for (const installment of paymentPlan.installmentsList) {
                await client.query(`
          INSERT INTO installments (
            loan_id, number, amount, principal_amount, interest_amount,
            due_date, payment_phase, is_symbolic, symbolic_amount,
            investor_share, qi_edu_fee_share, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
                    installment.loan_id,
                    installment.number,
                    installment.amount,
                    installment.principal_amount,
                    installment.interest_amount,
                    installment.due_date,
                    installment.payment_phase,
                    installment.is_symbolic,
                    installment.symbolic_amount || null,
                    installment.investor_share,
                    installment.qi_edu_fee_share,
                    installment.status
                ]);
            }
        });

        // Salva também em memória para compatibilidade
        paymentPlans[loan.id] = paymentPlan;

        console.log(`[PAYMENT] Plano de pagamento salvo no banco para empréstimo ${loan.id}`);
    } catch (error) {
        console.error(`[PAYMENT] Erro ao salvar plano no banco:`, error);
        throw error;
    }

    return paymentPlan;
}

/**
 * Cria plano para pagamento durante os estudos
 */
function createDuringStudiesPlan(loan, baseInterestRate) {
    const { amount, term_months } = loan;
    const option = PAYMENT_TIMING_OPTIONS.during_studies;
    const interestRate = baseInterestRate + option.interestRateAdjustment;

    const calculation = calculateCompoundInterest(amount, interestRate, term_months);
    const installments = [];

    for (let i = 1; i <= term_months; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i + option.startDelayMonths);

        const distribution = calculateDistribution(calculation.monthlyPayment);

        installments.push({
            id: generateId('INST'),
            loan_id: loan.id,
            number: i,
            amount: calculation.monthlyPayment,
            principal_amount: calculation.monthlyPayment * 0.8,
            interest_amount: calculation.monthlyPayment * 0.2,
            due_date: dueDate.toISOString().split('T')[0],
            payment_phase: 'during_studies',
            is_symbolic: false,
            investor_share: distribution.investorShare,
            qi_edu_fee_share: distribution.qiEduFeeShare,
            status: 'pending'
        });
    }

    return {
        loanId: loan.id,
        timing: 'during_studies',
        totalAmount: amount,
        monthlyPayment: calculation.monthlyPayment,
        interestRate: interestRate,
        discount: '5%',
        firstPayment: installments.length > 0 ? installments[0].due_date : null,
        lastPayment: installments.length > 0 ? installments[installments.length - 1].due_date : null,
        installments: installments.length,
        installmentsList: installments
    };
}

/**
 * Cria plano para pagamento após a graduação
 */
function createAfterGraduationPlan(loan, baseInterestRate) {
    const { amount, term_months } = loan;
    const option = PAYMENT_TIMING_OPTIONS.after_graduation;
    const interestRate = baseInterestRate + option.interestRateAdjustment;
    const gracePeriod = option.gracePeriodMonths;
    const totalMonths = term_months + gracePeriod;

    const calculation = calculateCompoundInterest(amount, interestRate, totalMonths);
    const installments = [];

    for (let i = 1; i <= totalMonths; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + term_months + gracePeriod + i);

        const distribution = calculateDistribution(calculation.monthlyPayment);

        installments.push({
            id: generateId('INST'),
            loan_id: loan.id,
            number: i,
            amount: calculation.monthlyPayment,
            principal_amount: calculation.monthlyPayment * 0.8,
            interest_amount: calculation.monthlyPayment * 0.2,
            due_date: dueDate.toISOString().split('T')[0],
            payment_phase: 'after_graduation',
            is_symbolic: false,
            investor_share: distribution.investorShare,
            qi_edu_fee_share: distribution.qiEduFeeShare,
            status: 'pending'
        });
    }

    return {
        loanId: loan.id,
        timing: 'after_graduation',
        totalAmount: amount,
        monthlyPayment: calculation.monthlyPayment,
        interestRate: interestRate,
        gracePeriod: gracePeriod,
        firstPayment: installments.length > 0 ? installments[0].due_date : null,
        lastPayment: installments.length > 0 ? installments[installments.length - 1].due_date : null,
        installments: installments.length,
        installmentsList: installments
    };
}

/**
 * Cria plano híbrido
 */
function createHybridPlan(loan, baseInterestRate) {
    const { amount, term_months } = loan;
    const option = PAYMENT_TIMING_OPTIONS.hybrid;
    const symbolicAmount = option.symbolicAmount;
    const gracePeriod = option.gracePeriodMonths;

    // Fase 1: Durante os estudos (pagamento simbólico)
    const duringStudiesInstallments = [];
    for (let i = 1; i <= term_months; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i + 3);

        const distribution = calculateDistribution(symbolicAmount);

        duringStudiesInstallments.push({
            id: generateId('INST'),
            loan_id: loan.id,
            number: i,
            amount: symbolicAmount,
            principal_amount: symbolicAmount * 0.8,
            interest_amount: symbolicAmount * 0.2,
            due_date: dueDate.toISOString().split('T')[0],
            payment_phase: 'hybrid',
            is_symbolic: true,
            symbolic_amount: symbolicAmount,
            investor_share: distribution.investorShare,
            qi_edu_fee_share: distribution.qiEduFeeShare,
            status: 'pending'
        });
    }

    // Fase 2: Após a graduação (pagamento completo)
    const remainingAmount = amount - (symbolicAmount * term_months);
    const afterGraduationMonths = 24; // 2 anos para quitar
    const monthlyPayment = remainingAmount / afterGraduationMonths;

    const afterGraduationInstallments = [];
    for (let i = 1; i <= afterGraduationMonths; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + term_months + gracePeriod + i);

        const distribution = calculateDistribution(monthlyPayment);

        afterGraduationInstallments.push({
            id: generateId('INST'),
            loan_id: loan.id,
            number: term_months + i,
            amount: monthlyPayment,
            principal_amount: monthlyPayment * 0.9,
            interest_amount: monthlyPayment * 0.1,
            due_date: dueDate.toISOString().split('T')[0],
            payment_phase: 'hybrid',
            is_symbolic: false,
            investor_share: distribution.investorShare,
            qi_edu_fee_share: distribution.qiEduFeeShare,
            status: 'pending'
        });
    }

    const allInstallments = [...duringStudiesInstallments, ...afterGraduationInstallments];

    return {
        loanId: loan.id,
        timing: 'hybrid',
        totalAmount: amount,
        symbolicAmount: symbolicAmount,
        monthlyPayment: monthlyPayment,
        gracePeriod: gracePeriod,
        firstPayment: duringStudiesInstallments[0].due_date,
        lastPayment: afterGraduationInstallments[afterGraduationInstallments.length - 1].due_date,
        installments: allInstallments.length,
        installmentsList: allInstallments
    };
}

/**
 * Processa pagamento de uma parcela
 * @param {string} installmentId - ID da parcela
 * @param {string} paymentMethod - Método de pagamento
 * @param {Date} paymentDate - Data do pagamento
 * @returns {Object} Resultado do pagamento
 */
function processPayment(installmentId, paymentMethod, paymentDate) {
    const transactionId = generateId('TXN');
    const paymentDateObj = paymentDate ? new Date(paymentDate) : new Date();

    // Simula processamento assíncrono
    setTimeout(() => {
        // 90% de chance de sucesso
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
            // Atualiza status da parcela
            updateInstallmentStatus(installmentId, 'paid', paymentDateObj);

            // Registra no ledger
            recordPaymentInLedger(installmentId, transactionId, paymentMethod);

            console.log(`[PAYMENT] Parcela ${installmentId} paga com sucesso via ${paymentMethod}`);
        } else {
            console.log(`[PAYMENT] Falha no pagamento da parcela ${installmentId}`);
        }
    }, 1000);

    return {
        transactionId,
        installmentId,
        paymentMethod,
        status: 'processing',
        paymentDate: paymentDateObj.toISOString()
    };
}

/**
 * Atualiza status de uma parcela
 */
function updateInstallmentStatus(installmentId, status, paymentDate) {
    // Em produção, isso seria uma query no banco
    console.log(`[LEDGER] Atualizando parcela ${installmentId} para status ${status}`);
}

/**
 * Registra pagamento no ledger
 */
function recordPaymentInLedger(installmentId, transactionId, paymentMethod) {
    // Em produção, isso seria uma inserção no banco
    console.log(`[LEDGER] Registrando pagamento ${transactionId} no ledger`);
}

/**
 * Busca parcelas de um empréstimo
 */
async function getInstallmentsByLoan(loanId) {
    try {
        const result = await query(`
      SELECT 
        id, loan_id, number, amount, principal_amount, interest_amount,
        due_date, payment_phase, is_symbolic, symbolic_amount,
        investor_share, qi_edu_fee_share, status, payment_method,
        transaction_id, ledger_entry_id, created_at, updated_at
      FROM installments 
      WHERE loan_id = $1 
      ORDER BY number ASC
    `, [loanId]);

        return result.rows;
    } catch (error) {
        console.error(`[PAYMENT] Erro ao buscar parcelas do empréstimo ${loanId}:`, error);
        // Fallback para dados em memória
        const plan = paymentPlans[loanId];
        return plan ? plan.installmentsList : [];
    }
}

/**
 * Gera resumo de pagamentos
 */
async function getPaymentSummary(loanId) {
    try {
        // Busca dados do empréstimo
        const loanResult = await query(`
      SELECT amount, total_installments, monthly_payment
      FROM loans 
      WHERE id = $1
    `, [loanId]);

        if (loanResult.rows.length === 0) {
            return null;
        }

        const loan = loanResult.rows[0];

        // Busca estatísticas das parcelas
        const statsResult = await query(`
      SELECT 
        COUNT(*) as total_installments,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN status != 'paid' THEN amount ELSE 0 END), 0) as remaining_amount
      FROM installments 
      WHERE loan_id = $1
    `, [loanId]);

        const stats = statsResult.rows[0];

        return {
            loanId,
            totalInstallments: parseInt(stats.total_installments),
            paid: parseInt(stats.paid),
            pending: parseInt(stats.pending),
            overdue: parseInt(stats.overdue),
            totalAmount: parseFloat(loan.amount),
            paidAmount: parseFloat(stats.paid_amount),
            remainingAmount: parseFloat(stats.remaining_amount)
        };
    } catch (error) {
        console.error(`[PAYMENT] Erro ao gerar resumo do empréstimo ${loanId}:`, error);
        // Fallback para dados em memória
        const plan = paymentPlans[loanId];
        if (!plan) return null;

        const installments = plan.installmentsList;
        const paid = installments.filter(i => i.status === 'paid').length;
        const pending = installments.filter(i => i.status === 'pending').length;
        const overdue = installments.filter(i => i.status === 'overdue').length;

        return {
            loanId,
            totalInstallments: installments.length,
            paid,
            pending,
            overdue,
            totalAmount: plan.totalAmount,
            paidAmount: installments
                .filter(i => i.status === 'paid')
                .reduce((sum, i) => sum + i.amount, 0),
            remainingAmount: installments
                .filter(i => i.status !== 'paid')
                .reduce((sum, i) => sum + i.amount, 0)
        };
    }
}

/**
 * Orquestra o fluxo completo de pagamento
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Object} Resultado da orquestração
 */
function orchestratePayment(paymentData) {
    const {
        loanId,
        installmentId,
        paymentMethod,
        amount,
        fromAccount,
        toAccount,
        description
    } = paymentData;

    try {
        // 1. Valida saldo na conta de origem
        const fromBalance = custodyService.getAccountBalance(fromAccount);
        if (!fromBalance || fromBalance.availableBalance < amount) {
            throw new Error('Saldo insuficiente para pagamento');
        }

        // 2. Bloqueia valor na conta de origem
        custodyService.blockAmount(fromAccount, amount, `Pagamento parcela ${installmentId}`);

        // 3. Processa pagamento pelo método escolhido
        let paymentResult;
        switch (paymentMethod) {
            case 'pix':
                paymentResult = paymentMethods.generatePIX({
                    amount,
                    description,
                    recipient: toAccount
                });
                break;
            case 'boleto':
                paymentResult = paymentMethods.generateBoleto({
                    amount,
                    description
                });
                break;
            case 'credit_card':
                paymentResult = paymentMethods.processCreditCard({
                    amount,
                    description,
                    cardData: paymentData.cardData,
                    installments: paymentData.installments
                });
                break;
            case 'debit_card':
                paymentResult = paymentMethods.processDebitCard({
                    amount,
                    description,
                    bankAccount: paymentData.bankAccount
                });
                break;
            default:
                throw new Error('Método de pagamento não suportado');
        }

        // 4. Registra no ledger
        const ledgerEntry = ledgerService.createLedgerEntry({
            id: paymentResult.id,
            fromAccount,
            toAccount,
            amount,
            description: `${description} - ${paymentMethod.toUpperCase()}`,
            category: 'payment',
            subcategory: paymentMethod
        });

        // 5. Simula transferência entre contas (após confirmação do pagamento)
        setTimeout(() => {
            if (paymentResult.status === 'approved' || paymentResult.status === 'completed') {
                custodyService.transferBetweenAccounts(
                    fromAccount,
                    toAccount,
                    amount,
                    `Transferência aprovada - ${description}`
                );

                // Libera bloqueio
                custodyService.unblockAmount(fromAccount, amount, `Pagamento aprovado - ${installmentId}`);

                // Registra receita para QI-EDU (5% de taxa)
                const qiEduFee = amount * 0.05;
                ledgerService.createRevenueEntry({
                    id: generateId('FEE'),
                    fromAccount: toAccount,
                    amount: qiEduFee,
                    description: `Taxa QI-EDU - ${description}`,
                    category: 'platform_fee'
                });
            } else {
                // Libera bloqueio em caso de falha
                custodyService.unblockAmount(fromAccount, amount, `Pagamento recusado - ${installmentId}`);
            }
        }, 3000);

        return {
            success: true,
            paymentId: paymentResult.id,
            ledgerId: ledgerEntry.id,
            status: 'processing',
            message: 'Pagamento em processamento'
        };

    } catch (error) {
        return {
            success: false,
            error: error.message,
            status: 'failed'
        };
    }
}

/**
 * Consulta status de um pagamento orquestrado
 * @param {string} paymentId - ID do pagamento
 * @returns {Object} Status do pagamento
 */
function getOrchestratedPaymentStatus(paymentId) {
    const paymentStatus = paymentMethods.getPaymentStatus(paymentId);
    const ledgerEntries = ledgerService.getLedgerEntriesByAccount(paymentId);

    return {
        payment: paymentStatus,
        ledger: ledgerEntries,
        custody: 'processed' // Simula que foi processado na custódia
    };
}

/**
 * Criar novo pagamento (chamado pelo backend principal)
 */
async function createPayment(paymentData) {
    const {
        from_user_id,
        to_user_id,
        amount,
        payment_method,
        description,
        installment_id,
        loan_id
    } = paymentData;

    const paymentId = generateId('PAY');

    // Criar registro de pagamento
    const payment = {
        id: paymentId,
        from_user_id,
        to_user_id,
        amount,
        payment_method,
        description,
        installment_id,
        loan_id,
        status: 'pending',
        created_at: new Date().toISOString(),
        external_id: null
    };

    // Salvar no banco de dados
    try {
        await query(`
            INSERT INTO payment_transactions (
                installment_id, amount, status, external_transaction_id, 
                fees, net_amount, meta, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            installment_id, amount, 'pending', paymentId,
            0, amount, JSON.stringify({
                from_user_id,
                to_user_id,
                payment_method,
                description,
                loan_id
            }), new Date()
        ]);

        // Também salvar em memória para consultas rápidas
        transactions[paymentId] = payment;
    } catch (error) {
        console.error('[PAYMENT] Erro ao salvar no banco:', error);
        // Fallback: salvar apenas em memória
        transactions[paymentId] = payment;
    }

    // Processar pagamento assincronamente
    setTimeout(async () => {
        await processPayment(paymentId);
    }, 2000);

    return payment;
}

/**
 * Obter pagamento por ID
 */
async function getPaymentById(paymentId) {
    try {
        // Buscar no banco de dados
        const result = await query(`
            SELECT * FROM payment_transactions 
            WHERE external_transaction_id = $1
        `, [paymentId]);

        if (result.rows.length > 0) {
            return result.rows[0];
        }

        // Fallback: buscar em memória
        return transactions[paymentId] || null;
    } catch (error) {
        console.error('[PAYMENT] Erro ao buscar no banco:', error);
        // Fallback: buscar em memória
        return transactions[paymentId] || null;
    }
}

/**
 * Processar pagamento (simulação)
 */
async function processPayment(paymentId) {
    const payment = transactions[paymentId];
    if (!payment) {
        throw new Error('Pagamento não encontrado');
    }

    // Simular processamento (90% de sucesso)
    const success = Math.random() > 0.1;

    if (success) {
        payment.status = 'completed';
        payment.processed_at = new Date().toISOString();
        payment.external_id = generateId('EXT');

        // Atualizar no banco de dados
        try {
            await query(`
                UPDATE payment_transactions 
                SET status = $1, processed_at = $2, external_transaction_id = $3
                WHERE external_transaction_id = $4
            `, ['completed', new Date(), payment.external_id, paymentId]);
        } catch (error) {
            console.error('[PAYMENT] Erro ao atualizar no banco:', error);
        }

        // Calcular taxas QI-EDU (conforme documentação)
        const custodyFee = payment.amount * 0.001; // 0,10% ao mês
        const interestSpread = payment.amount * 0.005 / 12; // 0,5% ao ano
        const totalFees = custodyFee + interestSpread;
        const netAmount = payment.amount - totalFees;

        // Registrar no ledger - Pagamento principal
        await ledgerService.createLedgerEntry({
            id: generateId('LED'),
            fromAccount: `user_${payment.from_user_id}`,
            toAccount: `user_${payment.to_user_id}`,
            amount: netAmount,
            description: `${payment.description} (líquido)`,
            category: 'payment',
            subcategory: payment.payment_method
        });

        // Registrar no ledger - Taxa de custódia
        if (custodyFee > 0) {
            await ledgerService.createLedgerEntry({
                id: generateId('LED'),
                fromAccount: `user_${payment.from_user_id}`,
                toAccount: 'qi_edu_revenue',
                amount: custodyFee,
                description: 'Taxa de custódia (0,10% ao mês)',
                category: 'fee',
                subcategory: 'custody_fee'
            });
        }

        // Registrar no ledger - Interest spread
        if (interestSpread > 0) {
            await ledgerService.createLedgerEntry({
                id: generateId('LED'),
                fromAccount: `user_${payment.from_user_id}`,
                toAccount: 'qi_edu_revenue',
                amount: interestSpread,
                description: 'Interest spread (0,5% ao ano)',
                category: 'fee',
                subcategory: 'interest_spread'
            });
        }

        // Atualizar saldos (usar valor líquido)
        await custodyService.transferBetweenAccounts(
            `user_${payment.from_user_id}`,
            `user_${payment.to_user_id}`,
            netAmount,
            `${payment.description} (líquido)`
        );
    } else {
        payment.status = 'failed';
        payment.processed_at = new Date().toISOString();
        payment.error_message = 'Pagamento recusado pelo processador';
    }

    return payment;
}

/**
 * Processar webhook de confirmação
 */
async function handleWebhook(paymentId, status, externalId) {
    const payment = transactions[paymentId];
    if (!payment) {
        throw new Error('Pagamento não encontrado');
    }

    payment.status = status;
    payment.external_id = externalId;
    payment.webhook_received_at = new Date().toISOString();

    if (status === 'approved' || status === 'completed') {
        // Atualizar saldos
        await custodyService.transferBetweenAccounts(
            `user_${payment.from_user_id}`,
            `user_${payment.to_user_id}`,
            payment.amount,
            payment.description
        );
    }

    return payment;
}

module.exports = {
    PAYMENT_TIMING_OPTIONS,
    getLoanById,
    createPaymentPlan,
    processPayment,
    getInstallmentsByLoan,
    getPaymentSummary,
    orchestratePayment,
    getOrchestratedPaymentStatus,
    createPayment,
    getPaymentById,
    handleWebhook
};
