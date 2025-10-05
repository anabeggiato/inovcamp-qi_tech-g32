"use client"
import CardFastAction from '@/app/components/CardFastAction'
import CardInfoEmprestimo from '@/app/components/CardInfoEmprestimo'
import Footer from '@/app/components/Footer'
import HeaderInterna from '@/app/components/HeaderInterna'
import ProgressBar from '@/app/components/ProgressBar'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Solicitation from './Solicitation'
import { DollarSign, Clock, GraduationCap, CheckCircle2, AlertCircle, TrendingUp, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { authService } from '@/services/authService'
import { studentService } from '@/services/studentService'

export default function StudentPage() {
    const [showPopup, setShowPopup] = useState(false);
    const [scoreData, setScoreData] = useState({ score: 0, credit_score: 0, risk_band: '-', fraud_status: '-' });
    const [loadingScore, setLoadingScore] = useState(true);

    const institutions = [
        { id: 1, name: "Universidade Federal XPTO" },
        { id: 2, name: "Centro Universitário ABC" },
        { id: 3, name: "Instituto Tecnológico QI" },
    ];

    useEffect(() => {
        const loadScore = async () => {
            try {
                const user = authService.getUser();
                if (!user?.id) {
                    setLoadingScore(false);
                    return;
                }
                const score = await studentService.getScore(user.id);
                setScoreData(score);
            } catch (e) {
                // Keep defaults on error
            } finally {
                setLoadingScore(false);
            }
        };
        loadScore();
    }, []);

    return (
        <ProtectedRoute requiredRole="student">
            <div className="min-h-screen w-screen bg-background mt-15">
                <HeaderInterna />
                <main className="flex flex-col items-center px-64 text-center text-gray-500 pt-8 space-y-8">
                    {/*Título*/}
                    <section className='w-full mt-8'>
                        <div className='w-full flex justify-end'>
                            <button className='bg-primary text-white p-2 text-black rounded-lg hover:shadow-md hover:bg-primary/85' onClick={() => setShowPopup(!showPopup)}>Solicitar Crédito</button>
                        </div>
                        <Solicitation showPopup={showPopup} setShowPopup={setShowPopup} institutions={institutions} scoreData={scoreData} onSubmit={(payload) => { console.log("Enviar pro backend:", payload); }} />
                    </section>

                    {/*Score*/}
                    <section className='flex items-center justify-between w-full border border-border rounded-lg p-8 bg-gradient-to-r from-lilac/15 to-sea-green/15'>
                        <div className='text-left'>
                            <p>Seu Score Acadêmico</p>
                            <h2 className='text-primary'>{(scoreData.risk_band || '-').toString().toUpperCase()}</h2>
                            <p>
                                {loadingScore ? 'Carregando...' : `Score: ${Math.round((scoreData.score ?? scoreData.credit_score) || 0)}`}
                            </p>
                        </div>

                        <div>
                            <ProgressBar progress={Math.min(100, Math.max(0, Math.round(((scoreData.score ?? scoreData.credit_score) || 0)/10)))} />
                            <p>{scoreData.fraud_status && scoreData.fraud_status !== 'unknown' ? `Status de fraude: ${scoreData.fraud_status}` : ' '}</p>
                        </div>
                        <div>
                            <button className='bg-white p-2 text-black rounded-lg hover:bg-primary hover:text-white'>Ver detalhes</button>
                        </div>
                    </section>

                    {/*Infos do empréstimo */}
                    <section className='grid grid-cols-3 w-full justify-items-center gap-8'>
                        <CardInfoEmprestimo
                          title="Valor Financiado"
                          icon={<DollarSign size={16} />}
                          value={
                            scoreData?.loan?.amount != null
                              ? `R$ ${Number(scoreData.loan.amount).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
                              : 'R$ -'
                          }
                          subtitle={"Taxa: 8.5% a.a."}
                        />
                        <CardInfoEmprestimo
                          title="Próximo Pagamento"
                          icon={<Clock size={16} />}
                          value={
                            scoreData?.loan?.nextDueDate
                              ? new Date(scoreData.loan.nextDueDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                                  .replace('.', '')
                                  .replace(/^(\w)/, (m) => m.toUpperCase())
                              : '-'
                          }
                          subtitle={scoreData?.loan?.nextInstallmentAmount != null ? `Parcela: R$ ${Number(scoreData.loan.nextInstallmentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Após formatura'}
                        />
                        <CardInfoEmprestimo
                          title="Status do Curso"
                          icon={<GraduationCap size={16} />}
                          value={scoreData?.academic?.status ? scoreData.academic.status : '-'}
                          subtitle={scoreData?.academic?.attendancePct != null ? `Frequência: ${Math.round(Number(scoreData.academic.attendancePct))}%` : 'Frequência: -'}
                        />
                    </section>

                    {/*Status emprestimo e faculdade */}
                    <section className='grid grid-cols-2 gap-8 w-full'>
                        <div className='w-full border border-border rounded-lg p-6 shadow-sm'>
                            <h3 className='text-left gap-2 text-2xl text-black font-medium'>Status do Financiamento</h3>
                            <div className='flex w-full gap-2 text-left mt-4'>
                                <CheckCircle2 className='text-success-green pt-1' size={20} />
                                <p className='flex flex-col text-md'>
                                    <span className='text-black font-medium'>Empréstimo Aprovado</span>
                                    {(() => {
                                        const d = scoreData?.timeline?.find(e => e.label === 'Empréstimo Aprovado')?.date;
                                        return d ? new Date(d).toLocaleDateString('pt-BR') : '15/01/2025';
                                    })()}
                                </p>
                            </div>

                            <div className='flex w-full gap-2 text-left mt-4'>
                                <CheckCircle2 className='text-success-green pt-1' size={20} />
                                <p className='flex flex-col text-md'>
                                    <span className='text-black font-medium'>Matrícula Aprovada</span>
                                    {(() => {
                                        const d = (scoreData?.timeline || []).find(e => e.label === 'Matrícula Aprovada')?.date;
                                        return d ? new Date(d).toLocaleDateString('pt-BR') : '01/01/2025';
                                    })()}
                                </p>
                            </div>

                            <div className='flex w-full gap-2 text-left mt-4'>
                                <div className="h-3.5 w-3.5 rounded-full border-2 border-primary flex items-center justify-center m-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                </div>
                                <p className='flex flex-col text-md'>
                                    <span className='text-black font-medium'>Matrícula Aprovada</span>
                                    {(() => {
                                        const d = (scoreData?.timeline || []).find(e => e.label === 'Matrícula Aprovada')?.date;
                                        return d ? new Date(d).toLocaleDateString('pt-BR') : '01/01/2025';
                                    })()}
                                </p>
                            </div>

                            <div className='flex w-full gap-2 text-left mt-4'>
                                <Clock className='pt-1' size={20} />
                                <p className='flex flex-col text-md'>
                                    <span className='text-black font-medium'>Matrícula Aprovada</span>
                                    {(() => {
                                        const d = (scoreData?.timeline || []).find(e => e.label === 'Matrícula Aprovada')?.date;
                                        return d ? new Date(d).toLocaleDateString('pt-BR') : '01/01/2025';
                                    })()}
                                </p>
                            </div>
                        </div>

                        <div className='w-full border border-border rounded-lg p-6 shadow-sm'>
                            <h3 className='text-left gap-2 text-2xl text-black font-medium'>Desempenho Acadêmico</h3>
                            <div className='mt-4 text-black font-medium'>
                                <p className='w-ful flex justify-between'>Média Geral <span className='text-success-green'>
                                    {scoreData?.academic?.gradeAvg != null ? Number(scoreData.academic.gradeAvg).toFixed(1) : '-'}
                                </span></p>
                                <ProgressBar progress={Math.min(100, Math.max(0, Math.round(((scoreData?.academic?.gradeAvg ?? 0) <= 10 ? (scoreData.academic?.gradeAvg ?? 0) * 10 : (scoreData.academic?.gradeAvg ?? 0)))))} />
                            </div>

                            <div className='mt-8 text-black font-medium'>
                                <p className='w-ful flex justify-between'>Frequência <span className='text-success-green'>
                                    {scoreData?.academic?.attendancePct != null ? `${Math.round(Number(scoreData.academic.attendancePct))}%` : '-'}
                                </span></p>
                                <ProgressBar progress={Math.min(100, Math.max(0, Math.round(Number(scoreData?.academic?.attendancePct ?? 0))))} />
                            </div>

                            <hr className='my-8 border border-border' />

                            <div className='w-full flex rounded-lg bg-success-green/10 p-4'>
                                <TrendingUp className='text-success-green' size={20} pt-1 />
                                <p className='flex flex-col text-left pl-4 text-sm'>
                                    <span className='text-md text-success-green'>Ótimo Desempenho</span>
                                    Suas notas e frequência estão garantindo as melhores taxas.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/*Ações rápidas*/}
                    <section className='w-full p-6 border border-border rounded-lg mb-8 text-left shadow-sm'>
                        <h3 className='font-semibold text-black text-2xl'>Ações Rápidas</h3>
                        <div className='grid grid-cols-3 gap-4 py-6'>
                            <CardFastAction icon={<FileText size={20} />} text="Ver Contrato" />
                            <CardFastAction icon={<TrendingUp size={20} />} text="Histórico Acadêmico" />
                            <CardFastAction icon={<AlertCircle size={20} />} text="Suporte" />
                        </div>
                    </section>

                </main>
                <Footer />
            </div>
        </ProtectedRoute>
    )
}
