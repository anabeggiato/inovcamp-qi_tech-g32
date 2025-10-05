// src/services/studentService.js
import { http } from './http';

export const studentService = {
  async getScore(studentId) {
    const response = await http.get(`/students/${studentId}/score`);
    // Backend shape: { success, message, data: { student, score } }
    const apiData = response?.data?.score || response?.data?.data?.score || {};
    const numericScore = Number(
      apiData.score ?? apiData.credit_score ?? 0
    );
    const band = (apiData.riskBand ?? apiData.risk_band ?? 'E');
    const academic = apiData.academic || null;
    const loan = apiData.loan || null;
    return {
      raw: response?.data || null,
      score: isNaN(numericScore) ? 0 : numericScore,
      credit_score: isNaN(numericScore) ? 0 : numericScore,
      risk_band: typeof band === 'string' ? band : 'E',
      fraud_score: Number(apiData.fraudScore ?? apiData.fraud_score ?? 0) || 0,
      fraud_status: apiData.fraudStatus ?? apiData.fraud_status ?? 'unknown',
      academic: academic ? {
        gradeAvg: typeof academic.gradeAvg === 'number' ? academic.gradeAvg : (academic.grade_avg ?? null),
        attendancePct: typeof academic.attendancePct === 'number' ? academic.attendancePct : (academic.attendance_pct ?? null),
        status: academic.status ?? null,
        period: academic.period ?? null,
        updatedAt: academic.updatedAt ?? academic.updated_at ?? null,
      } : null,
      loan: loan ? {
        loanId: loan.loanId ?? loan.loan_id ?? null,
        amount: loan.amount != null ? Number(loan.amount) : null,
        status: loan.status ?? null,
        nextDueDate: loan.nextDueDate ?? loan.next_due_date ?? null,
        nextInstallmentAmount: loan.nextInstallmentAmount != null ? Number(loan.nextInstallmentAmount) : (loan.next_installment_amount != null ? Number(loan.next_installment_amount) : null),
      } : null,
    };
  },
};

export default studentService;


