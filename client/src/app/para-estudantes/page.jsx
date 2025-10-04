import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { GraduationCap, ArrowRight, Star, TrendingUp, Shield, Clock } from 'lucide-react'
import CardCiclo from '../components/CardCiclo'
import WorkingContainer from '../components/WorkingContainer'
import StudentExampleSection from '../components/StudentExampleSection'
import StudentRequirementsContainer from '../components/StudentRequirementsContainer'

export default function page() {
    return (
        <div className="min-h-screen w-screen bg-background mt-15">
            <Header />
            <main className="flex flex-col items-center px-64 text-center text-gray-500 pt-8">
                <section className='w-[80%] flex flex-col items-center'>
                    <div className="rounded-full bg-primary/10 text-primary text-center p-2 w-[15%] mb-4">Para estudantes</div>
                    <h1 className='font-bold text-5xl text-black mb-6'>Seu Sonho Acadêmico <br /> <span className='bg-purple-gradient bg-clip-text text-transparent '>Começa Aqui</span></h1>
                    <p className='w-[55%]'>Financie seus estudos com base no seu potencial, não no seu passado. Conquiste taxas melhores sendo um bom aluno.</p>
                    <button className=' flex px-6 py-2 gap-2 bg-purple-gradient text-white rounded-lg my-6'><GraduationCap /> Começar Agora <ArrowRight /></button>
                </section>

                <section className='w-[80%] grid grid-cols-4 my-12'>
                    <CardCiclo icon={<Star className='text-white' />} title="Score por Mérito" description="Suas notas e frequência valem mais que seu histórico bancário" />
                    <CardCiclo icon={<TrendingUp className='text-white' />} title="Taxas Justas" description="Quanto melhor seu desempenho, melhores as condições" />
                    <CardCiclo icon={<Shield className='text-white' />} title="Sem Fiador" description="Não precisa de avalista ou garantias tradicionais" />
                    <CardCiclo icon={<Clock className='text-white' />} title="Pague depois" description="Comece a pagar apenas após se formar" />
                </section>

                <WorkingContainer type="student" />

                <StudentExampleSection />

                <StudentRequirementsContainer />

                <section className='flex flex-col text-white items-center bg-second-gradient rounded-lg p-8 mb-32 space-y-10 w-[80%]'>
                    <h2 className='text-4xl font-bold'>Pronto para Transformar o Futuro?</h2>
                    <p className='text-lg'>Faça seu cadastro em menos de 5 minutos e descubra as condições especiais para você.</p>

                    <div className='flex gap-8'>
                        <button className='bg-sea-green flex gap-3 py-2 px-4 rounded-lg'>Criar conta Grátis <ArrowRight /></button>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
