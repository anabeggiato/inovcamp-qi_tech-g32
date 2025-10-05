"use client"
import CardFastAction from '@/app/components/CardFastAction'
import CardInfoEmprestimo from '@/app/components/CardInfoEmprestimo'
import Footer from '@/app/components/Footer'
import HeaderInterna from '@/app/components/HeaderInterna'
import ProgressBar from '@/app/components/ProgressBar'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AccountStatusCard from '@/app/components/AccountStatusCard'
import NotificationBell from '@/app/components/NotificationBell'
import Solicitation from './Solicitation'
import { DollarSign, Clock, GraduationCap, CheckCircle2, AlertCircle, TrendingUp, FileText } from 'lucide-react'
import { useState } from 'react'

export default function StudentPage() {
    const [showPopup, setShowPopup] = useState(false);

    const institutions = [
        { id: 1, name: "Universidade Federal XPTO" },
        { id: 2, name: "Centro Universitário ABC" },
        { id: 3, name: "Instituto Tecnológico QI" },
    ];

    const scoreData = { credit_score: 845, risk_band: "A", fraud_status: "Sem indícios" };

    return (
        <ProtectedRoute requiredRole="student">
            <div className="min-h-screen w-screen bg-background mt-15">
                <HeaderInterna />
                <main className="flex flex-col items-center px-64 text-center text-gray-500 pt-8 space-y-8">
                    {/*Título*/}
                    <section className='w-full mt-8'>
                        <div className='w-full flex justify-between items-center'>
                            <h1 className='text-3xl font-bold text-black'>Dashboard do Estudante</h1>
                            <div className='flex items-center gap-4'>
                                <NotificationBell />
                                <button className='bg-primary text-white p-2 text-black rounded-lg hover:shadow-md hover:bg-primary/85' onClick={() => setShowPopup(!showPopup)}>Solicitar Crédito</button>
                            </div>
                        </div>
                        <Solicitation showPopup={showPopup} setShowPopup={setShowPopup} institutions={institutions} scoreData={scoreData} onSubmit={(payload) => { console.log("Enviar pro backend:", payload); }} />
                    </section>

                    {/*Status da Conta*/}
                    <section className='w-full'>
                        <AccountStatusCard />
                    </section>

                    {/*Score*/}
                    <section className='flex items-center justify-between w-full border border-border rounded-lg p-8 bg-gradient-to-r from-lilac/15 to-sea-green/15'>
                        <div className='text-left'>
                            <p>Seu Score Acadêmico</p>
                            <h2 className='text-primary'>A+</h2>
                            <p>Score: 850/1000</p>
                        </div>

                        <div>
                            <ProgressBar progress={85} />
                            <p>Excelente! Continue assim para mantere as taxas baixas.</p>
                        </div>
                        <div>
                            <button className='bg-white p-2 text-black rounded-lg hover:bg-primary hover:text-white'>Ver detalhes</button>
                        </div>
                    </section>

                    {/*Infos do empréstimo */}
                    <section className='grid grid-cols-3 w-full justify-items-center gap-8'>
                        <CardInfoEmprestimo title="Valor Financiado" icon={<DollarSign size={16} />} value="N/A" subtitle="Sem empréstimo ativo" />
                        <CardInfoEmprestimo title="Próximo Pagamento" icon={<Clock size={16} />} value="N/A" subtitle="Sem pagamentos pendentes" />
                        <CardInfoEmprestimo title="Status do Curso" icon={<GraduationCap size={16} />} value="N/A" subtitle="Dados não disponíveis" />
                    </section>

                    {/*Status emprestimo e faculdade */}
                    <section className='grid grid-cols-2 gap-8 w-full'>
                        <div className='w-full border border-border rounded-lg p-6 shadow-sm'>
                            <h3 className='text-left gap-2 text-2xl text-black font-medium'>Status do Financiamento</h3>
                            <div className='flex w-full gap-2 text-left mt-4'>
                                <AlertCircle className='text-gray-500 pt-1' size={20} />
                                <p className='flex flex-col text-md'>
                                    <span className='text-gray-600'>Nenhum empréstimo ativo</span>
                                    <span className='text-sm text-gray-500'>Solicite um empréstimo para começar</span>
                                </p>
                            </div>

                            <div className='flex w-full gap-2 text-left mt-4'>
                                <Clock className='text-gray-500 pt-1' size={20} />
                                <p className='flex flex-col text-md'>
                                    <span className='text-gray-600'>Aguardando solicitação</span>
                                    <span className='text-sm text-gray-500'>Complete seu perfil para prosseguir</span>
                                </p>
                            </div>
                        </div>

                        <div className='w-full border border-border rounded-lg p-6 shadow-sm'>
                            <h3 className='text-left gap-2 text-2xl text-black font-medium'>Desempenho Acadêmico</h3>
                            <div className='mt-4 text-black font-medium'>
                                <p className='w-ful flex justify-between'>Média Geral <span className='text-gray-500'>N/A</span></p>
                                <ProgressBar progress={0} />
                            </div>

                            <div className='mt-8 text-black font-medium'>
                                <p className='w-ful flex justify-between'>Frequência <span className='text-gray-500'>N/A</span></p>
                                <ProgressBar progress={0} />
                            </div>

                            <hr className='my-8 border border-border' />

                            <div className='w-full flex rounded-lg bg-gray-50 p-4'>
                                <AlertCircle className='text-gray-500' size={20} />
                                <p className='flex flex-col text-left pl-4 text-sm'>
                                    <span className='text-md text-gray-600'>Dados não disponíveis</span>
                                    Aguardando dados da faculdade para calcular desempenho.
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
