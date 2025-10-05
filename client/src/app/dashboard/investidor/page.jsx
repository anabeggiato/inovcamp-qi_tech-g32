import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import CardInfoEmprestimo from '@/app/components/CardInfoEmprestimo'
import { DollarSign, PieChart, TrendingUp, Users } from 'lucide-react'

export default function InvestorPage() {
    const investimentos = [
        { letra: "J", nome: "João Silva", curso: "Engenharia", investido: "R$ 15.000", retorno: "+12.3% a.a.", score: "A+" },
        { letra: "J", nome: "João Silva", curso: "Engenharia", investido: "R$ 15.000", retorno: "+12.3% a.a.", score: "A+" },
        { letra: "J", nome: "João Silva", curso: "Engenharia", investido: "R$ 15.000", retorno: "+12.3% a.a.", score: "A+" }
    ]
    return (
        <div>
            <Header />
            <main className='main-layout'>
                {/*Header*/}
                <section className='w-full grid grid-cols-2 mt-8'>
                    <div className='w-full text-left space-y-2'>
                        <h1 className='text-4xl text-black font-bold'>Meu portfolio</h1>
                        <p>Acompanhe seus investimentos e retornos</p>
                    </div>

                    <div className='w-full flex justify-end'>
                        <button className='flex items-center bg-second-gradient p-2 py-1 text-white rounded-lg text-sm gap-2 hover:shadow-md'><DollarSign size={16} /> Oferecer empréstimo</button>
                    </div>
                </section>

                {/*Visão geral investimentos*/}
                <section className='w-full grid grid-cols-4 gap-8'>
                    <CardInfoEmprestimo title="Investimento Total" icon={<DollarSign size={16} />} value="R$ 150.000" subtitle="+ 15% este ano" />
                    <CardInfoEmprestimo title="Retorno Médio" icon={<TrendingUp size={16} />} value="+12.3% a.a." subtitle="Acima da média" />
                    <CardInfoEmprestimo title="Estudantes Apoiados" icon={<Users size={16} />} value="24" subtitle="23 alunos, 1 formado" />
                    <CardInfoEmprestimo title="Taxa de sucesso" icon={<PieChart size={16} />} value="98%" subtitle="Pagamento em dia" />
                </section>

                {/*Alunos*/}
                <section className='w-full p-8 border border-border rounded-lg mb-8'>
                    <div className='flex items-center justify-between'>
                        <h3 className='text-2xl text-black font-semibold'>Investimentos Ativos</h3>
                        <button className='p-2 border border-border rounded-md hover:bg-primary hover:text-white'>Ver todos</button>
                    </div>

                    {investimentos.map((estudante) => (
                        <div className='flex items-center justify-between w-full p-4 border border-border rounded-2xl my-4 hover:bg-gray-100'>
                            <div className='flex items-center gap-4'>
                                <div className='w-10 h-10 rounded-full bg-purple-gradient flex items-center justify-center text-lg text-white font-medium'>{estudante.letra}</div>
                                <div className='text-left'>
                                    <p className='font-semibold'>{estudante.nome}</p>
                                    <p className='text-sm'>{estudante.curso}</p>
                                </div>
                            </div>

                            <div className='flex items-center justify-between w-[40%]'>
                                <div className='grid grid-cols-3 gap-8'>
                                    <div>
                                        <p className='text-sm'>Investido</p>
                                        <span>{estudante.investido}</span>
                                    </div>

                                    <div>
                                        <p className='text-sm'>Retorno</p>
                                        <span>{estudante.retorno}</span>
                                    </div>

                                    <div>
                                        <p className='text-sm'>Score</p>
                                        <span>{estudante.score}</span>
                                    </div>
                                </div>
                                <button className='hover:bg-primary hover:text-white p-2 rounded-md'>Ver Detalhes</button>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
            <Footer />
        </div>
    )
}
