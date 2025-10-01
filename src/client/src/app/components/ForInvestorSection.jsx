import { CheckCircle2, DollarSign, TrendingUp } from 'lucide-react'

export default function ForStudentsSection() {
    return (
        <section className='flex my-4 pr-2 items-center mt-32'>
            <div className='w-[50%] h-full flex items-start'>
                <div class="flex flex-col items-center justify-center w-[90%] bg-white p-6 rounded-xl shadow-[0_0_40px_10px_rgba(9,175,215,0.2)] space-y-4">
                    <h3 className='text-2xl font-bold text-left w-full'>Seu Portfólio</h3>
                    <div className='flex justify-between items-center w-full bg-primary/10 p-4 rounded-lg'>
                        <div>
                            <p className='text-gray-500 text-sm'>Investimento Total</p>
                            <span className='text-lg font-bold'>R$ 150.000</span>
                        </div>

                        <TrendingUp className='text-success-green font-bold text-lg'/>
                    </div>

                    <div className='w-full mt-4 space-y-2'>
                        <p className='flex justify-between text-gray-500 text-sm'>Retorno Médio <span className='font-semibold text-success-green'>+12.3% a.a.</span></p>
                        <p className='flex justify-between text-gray-500 text-sm'>Estudantes Apoiados <span className='font-semibold text-black'>24</span></p>
                        <p className='flex justify-between text-gray-500 text-sm'>Taxa de sucesso <span className='font-semibold text-success-green'>98%</span></p>
                    </div>
                </div>
            </div>

            <div className='w-[50%]'>
                <div className="rounded-full bg-sea-green/10 text-sea-green text-center p-2 w-[25%] mb-4">Para investidores</div>
                <h2 className='text-5xl font-bold'>Invista no Futuro <br /> <span className='bg-second-gradient bg-clip-text text-transparent'>Com Propósito</span></h2>

                <p className='text-lg text-gray-500 my-4'>Diversifique seu portfólio investindo em educação. Retornos atrativos com impacto social real.</p>

                <div className='space-y-4 pb-4'>
                    <p className='flex items-center gap-4'><CheckCircle2 className='text-success-green' />Retornos superiores à poupança</p>
                    <p className='flex items-center gap-4'><CheckCircle2 className='text-success-green' />Risco mitigado por IA e score preditivo</p>
                    <p className='flex items-center gap-4'><CheckCircle2 className='text-success-green' />Diversificação automática</p>
                    <p className='flex items-center gap-4'><CheckCircle2 className='text-success-green' />Impacto social mensurável</p>
                </div>

                <button className='bg-second-gradient text-white flex items-center py-2 px-6 rounded-lg gap-4 text-sm'><DollarSign /> Começar a investir</button>
            </div>
        </section>
    )
}
