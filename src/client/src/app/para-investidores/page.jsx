import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { DollarSign, ArrowRight, Star, TrendingUp, Shield, Clock, PieChart, Heart } from 'lucide-react'
import CardCiclo from '../components/CardCiclo'
import WorkingContainer from '../components/WorkingContainer'
import StudentRequirementsContainer from '../components/StudentRequirementsContainer'
import WhyEducation from '../components/WhyEducation'
import CardInvestor from '../components/CardInvestor'

export default function page() {
    const investors = [
        {
            title: "Conservador",
            min_sugestion: "10.000",
            max_sugestion: "50.000",
            min_students: 10,
            max_students: 15,
            min_return: 9,
            max_return: 11,
            min_score: "A",
            max_score: "A+",
            risk: "Baixo",
        },
        {
            title: "Moderado",
            min_sugestion: "50.000",
            max_sugestion: "150.000",
            min_students: 15,
            max_students: 25,
            min_return: 11,
            max_return: 13,
            min_score: "B+",
            max_score: "superior",
            risk: "Médio",
        },
        {
            title: "Arrojado",
            min_sugestion: "150.000",
            max_sugestion: "+",
            min_students: 25,
            max_students: "+",
            min_return: 13,
            max_return: 15,
            min_score: "B",
            max_score: "superior",
            risk: "Médio-Alto",
        },
    ]

    return (
        <div className="min-h-screen w-screen bg-background mt-15">
            <Header />
            <main className="flex flex-col items-center px-64 text-center text-gray-500 pt-8">
                <section className='w-[80%] flex flex-col items-center'>
                    <div className="rounded-full bg-sea-green/10 text-sea-green text-center p-2 w-[15%] mb-4">Para investidores</div>
                    <h1 className='font-bold text-5xl text-black mb-6'>Invista no Futuro <br /> <span className='bg-second-gradient bg-clip-text text-transparent '>Com Propósito e Retorno</span></h1>
                    <p className='w-[55%]'>Financie seus estudos com base no seu potencial, não no seu passado. Conquiste taxas melhores sendo um bom aluno.</p>
                    <button className=' flex px-6 py-2 gap-2 bg-second-gradient text-white rounded-lg my-6'><DollarSign /> Começar Agora <ArrowRight /></button>
                </section>

                <section className='w-[80%] grid grid-cols-4 my-12 justify-items-center'>
                    <CardCiclo icon={<TrendingUp className='text-white' />} title="Retornos atrativos" description="Rentabilidade superior à poupança e títulos públicos" bg="green" />
                    <CardCiclo icon={<Shield className='text-white' />} title="Risco Mitigado" description="IA e score preditivo reduzem exposição ao risco" bg="green" />
                    <CardCiclo icon={<PieChart className='text-white' />} title="Diversificação" description="Invista em múltiplos estudantes automaticamente" bg="green" />
                    <CardCiclo icon={<Heart className='text-white' />} title="Impacto Social" description="Transforme vidas enquanto gera retorno" bg="green" />
                </section>

                <WhyEducation />

                <WorkingContainer color="green" type="investor" />

                <section className='w-[80%] my-12 mb-24'>
                    <h2 className="text-5xl font-bold text-center py-4 mb-12 text-black">Encontre Seu Perfil</h2>
                    <div className='grid grid-cols-3 w-full justify-items-center'>
                        {investors.map((inv, i) => (
                            <CardInvestor key={i} {...inv} />
                        ))}
                    </div>
                </section>

                <section className='flex flex-col text-white items-center bg-gradient-to-br from-primary to-sea-green rounded-lg p-8 mb-32 space-y-10 w-[80%]'>
                    <h2 className='text-4xl font-bold'>Comece a investir hoje</h2>
                    <p className='text-lg'>Cadastro gratuito. Sem taxas de entrada. Comece com o valor que quiser.</p>

                    <div className='flex gap-8'>
                        <button className='bg-sea-green flex gap-3 py-2 px-4 rounded-lg'>Criar Conta de Investidor <ArrowRight /></button>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
