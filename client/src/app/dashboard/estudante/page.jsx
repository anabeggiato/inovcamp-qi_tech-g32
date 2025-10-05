"use client"
import CardFastAction from '@/app/components/CardFastAction'
import CardInfoEmprestimo from '@/app/components/CardInfoEmprestimo'
import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import ProgressBar from '@/app/components/ProgressBar'
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
        <div className="min-h-screen w-screen bg-background mt-15">
            <Header />
            <main className="flex flex-col items-center px-64 text-center text-gray-500 pt-8 space-y-8">
                {/*Título*/}
                <section className='w-full grid grid-cols-2 mt-8'>
                    <div className='w-full text-left space-y-2'>
                        <h1 className='text-4xl text-black font-bold'>Olá, Usuário!</h1>
                        <p>Acompanhe seu financiamento e sesempenho acadêmico</p>
                    </div>

                    <div className='w-full flex justify-end'>
                        <button className='bg-white p-2 text-black rounded-lg hover:bg-primary hover:text-white' onClick={() => setShowPopup(!showPopup)}>Solicitar Crédito</button>
                    </div>
                    <Solicitation showPopup={showPopup} setShowPopup={setShowPopup} institutions={institutions} scoreData={scoreData} onSubmit={(payload) => { console.log("Enviar pro backend:", payload); }} />
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
                    <CardInfoEmprestimo title="Valor Financiado" icon={<DollarSign size={16} />} value="R$ 35.000" subtitle="Taxa: 8.5% a.a." />
                    <CardInfoEmprestimo title="Próximo Pagamento" icon={<Clock size={16} />} value="Jun/2026" subtitle="Após formatura" />
                    <CardInfoEmprestimo title="Status do Curso" icon={<GraduationCap size={16} />} value="Ativo" subtitle="Frequência: 95%" />
                </section>

                {/*Status emprestimo e faculdade */}
                <section className='grid grid-cols-2 gap-8 w-full'>
                    <div className='w-full border border-border rounded-lg p-6 shadow-sm'>
                        <h3 className='text-left gap-2 text-2xl text-black font-medium'>Status do Financiamento</h3>
                        <div className='flex w-full gap-2 text-left mt-4'>
                            <CheckCircle2 className='text-success-green pt-1' size={20} />
                            <p className='flex flex-col text-md'>
                                <span className='text-black font-medium'>Empréstimo Aprovado</span>
                                15/01/2025
                            </p>
                        </div>

                        <div className='flex w-full gap-2 text-left mt-4'>
                            <CheckCircle2 className='text-success-green pt-1' size={20} />
                            <p className='flex flex-col text-md'>
                                <span className='text-black font-medium'>Matrícula Aprovada</span>
                                01/01/2025
                            </p>
                        </div>

                        <div className='flex w-full gap-2 text-left mt-4'>
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-primary flex items-center justify-center m-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            </div>
                            <p className='flex flex-col text-md'>
                                <span className='text-black font-medium'>Matrícula Aprovada</span>
                                01/01/2025
                            </p>
                        </div>

                        <div className='flex w-full gap-2 text-left mt-4'>
                            <Clock className='pt-1' size={20} />
                            <p className='flex flex-col text-md'>
                                <span className='text-black font-medium'>Matrícula Aprovada</span>
                                01/01/2025
                            </p>
                        </div>
                    </div>

                    <div className='w-full border border-border rounded-lg p-6 shadow-sm'>
                        <h3 className='text-left gap-2 text-2xl text-black font-medium'>Desempenho Acadêmico</h3>
                        <div className='mt-4 text-black font-medium'>
                            <p className='w-ful flex justify-between'>Média Geral <span className='text-success-green'>9.2</span></p>
                            <ProgressBar progress={92} />
                        </div>

                        <div className='mt-8 text-black font-medium'>
                            <p className='w-ful flex justify-between'>Frequência <span className='text-success-green'>95%</span></p>
                            <ProgressBar progress={95} />
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
    )
}
