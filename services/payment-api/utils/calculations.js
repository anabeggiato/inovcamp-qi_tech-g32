/**
 * Utilitários para cálculos financeiros
 * Suporta todos os tipos de pagamento: durante estudos, após graduação, híbrido
 */

/**
 * Calcula juros compostos
 * @param {number} principal - Valor principal
 * @param {number} rate - Taxa de juros mensal (ex: 0.02 para 2%)
 * @param {number} periods - Número de períodos
 * @returns {Object} Cálculo detalhado
 */
function calculateCompoundInterest(principal, rate, periods) {
    const monthlyRate = rate;
    const totalAmount = principal * (monthlyRate * Math.pow(1 + monthlyRate, periods)) /
        (Math.pow(1 + monthlyRate, periods) - 1);
    const interest = totalAmount - principal;

    return {
        principal,
        interest,
        totalAmount,
        monthlyPayment: totalAmount,
        rate: rate * 100,
        periods
    };
}

/**
 * Calcula valor do principal em uma parcela específica
 * @param {number} principal - Valor principal total
 * @param {number} rate - Taxa de juros mensal
 * @param {number} totalPeriods - Total de períodos
 * @param {number} currentPeriod - Período atual
 * @returns {number} Valor do principal nesta parcela
 */
function calculatePrincipal(principal, rate, totalPeriods, currentPeriod) {
    const monthlyPayment = principal * (rate * Math.pow(1 + rate, totalPeriods)) /
        (Math.pow(1 + rate, totalPeriods) - 1);

    // Cálculo do principal usando tabela SAC
    const remainingPeriods = totalPeriods - currentPeriod + 1;
    const principalInThisPeriod = principal * (Math.pow(1 + rate, currentPeriod - 1) - 1) /
        (Math.pow(1 + rate, totalPeriods) - 1);

    return Math.min(principalInThisPeriod, monthlyPayment);
}

/**
 * Calcula valor dos juros em uma parcela específica
 * @param {number} principal - Valor principal total
 * @param {number} rate - Taxa de juros mensal
 * @param {number} totalPeriods - Total de períodos
 * @param {number} currentPeriod - Período atual
 * @returns {number} Valor dos juros nesta parcela
 */
function calculateInterest(principal, rate, totalPeriods, currentPeriod) {
    const monthlyPayment = principal * (rate * Math.pow(1 + rate, totalPeriods)) /
        (Math.pow(1 + rate, totalPeriods) - 1);
    const principalInThisPeriod = calculatePrincipal(principal, rate, totalPeriods, currentPeriod);

    return monthlyPayment - principalInThisPeriod;
}

/**
 * Calcula valor de pagamento com desconto por antecipação
 * @param {number} amount - Valor original
 * @param {number} daysBefore - Dias antes do vencimento
 * @returns {Object} Cálculo com desconto
 */
function calculateEarlyPayment(amount, daysBefore) {
    const discountRate = 0.02; // 2% de desconto
    const discount = amount * discountRate;
    const finalAmount = amount - discount;

    return {
        originalAmount: amount,
        discount: discount,
        finalAmount: finalAmount,
        savings: discount,
        discountRate: discountRate * 100
    };
}

/**
 * Calcula valor de pagamento com multa por atraso
 * @param {number} amount - Valor original
 * @param {number} daysLate - Dias de atraso
 * @returns {Object} Cálculo com multa
 */
function calculateLatePayment(amount, daysLate) {
    const lateFeeRate = 0.02; // 2% de multa
    const lateFee = amount * lateFeeRate;
    const finalAmount = amount + lateFee;

    return {
        originalAmount: amount,
        lateFee: lateFee,
        finalAmount: finalAmount,
        penalty: lateFee,
        lateFeeRate: lateFeeRate * 100
    };
}

/**
 * Calcula distribuição de valores para investidor e QI-EDU
 * @param {number} amount - Valor total da parcela
 * @returns {Object} Distribuição
 */
function calculateDistribution(amount) {
    const investorShare = amount * 0.95; // 95% para o investidor
    const qiEduFeeShare = amount * 0.05; // 5% para QI-EDU

    return {
        totalAmount: amount,
        investorShare: investorShare,
        qiEduFeeShare: qiEduFeeShare,
        investorPercentage: 95,
        qiEduPercentage: 5
    };
}

/**
 * Calcula status de uma parcela baseado na data
 * @param {Date} dueDate - Data de vencimento
 * @param {boolean} paid - Se foi paga
 * @param {Date} paymentDate - Data do pagamento
 * @returns {string} Status da parcela
 */
function calculateInstallmentStatus(dueDate, paid, paymentDate) {
    if (paid) {
        if (paymentDate < dueDate) return 'paid_early';
        if (paymentDate > dueDate) return 'paid_late';
        return 'paid';
    }

    const today = new Date();
    const daysDiff = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));

    if (daysDiff > 0) return 'overdue';
    if (daysDiff === 0) return 'due';
    return 'pending';
}

module.exports = {
    calculateCompoundInterest,
    calculatePrincipal,
    calculateInterest,
    calculateEarlyPayment,
    calculateLatePayment,
    calculateDistribution,
    calculateInstallmentStatus
};

