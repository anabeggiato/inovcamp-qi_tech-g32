import { ArrowRight } from 'lucide-react'
import CardHero from './CardHero'

export default function Hero() {
    return (
        <div className='flex flex-col items-center space-y-8 mt-20 text-center p-8'>
            <div>
                <h1 className='bg-brand-gradient bg-clip-text text-transparent font-bold text-7xl'>O Futuro do</h1>
                <h1 className='bg-brand-gradient bg-clip-text text-transparent font-bold text-7xl'>Financiamento Educacional</h1>
            </div>

            <p className='w-[45%] text-2xl text-gray-400 font-thin'>
                Conectamos estudantes que buscam realizar seus sonhos com investidores que acreditam no poder transformador da educação.
            </p>

            <div className='flex gap-4'>
                <button className='bg-purple-gradient flex items-center gap-4 px-4 py-2 text-white rounded-lg'>Sou Estudante <ArrowRight /></button>
                <button className='flex items-center gap-4 px-4 py-2 border border-gray-300 border-2 rounded-lg hover:bg-primary hover:text-white transition-colors duration-300 ease-in-out'>Sou Investidor <ArrowRight /></button>
            </div>

            <div className='flex space-x-5 mt-16'>
                <CardHero title="R$ 50M +" subtitle="Financiados" />
                <CardHero title="10K+" subtitle="Estudantes Apoiados" />
                <CardHero title="98%" subtitle="Taxa de Retorno" />
            </div>
        </div>
    )
}
