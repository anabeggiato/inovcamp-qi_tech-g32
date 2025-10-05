import { CheckCircle2 } from 'lucide-react'

export default function StudentExampleSection() {
    return (
        <section className='flex items-center my-4 pr-2 items-center w-[80%]'>
            <div className='w-[50%] text-left'>
                <h2 className='text-5xl font-bold text-black'>Veja um Exemplo Real</h2>

                <p className='text-lg text-gray-500 my-6'>João tem média 9.0 e frequência de 95%. Ele precisa de R$ 35.000 para seu curso de 4 anos.</p>

                <div className='space-y-4 pb-4'>
                    <p className='flex items-center gap-4'>
                        <CheckCircle2 className='text-success-green' />
                        <div>
                            <span className='text-black'>Score: A+</span>
                            <p className='text-sm'>Excelente desempenho acadêmico</p>
                        </div>
                    </p>

                    <p className='flex items-center gap-4'>
                        <CheckCircle2 className='text-success-green' />
                        <div>
                            <span className='text-black'>Taxa: 8.5% a.a.</span>
                            <p className='text-sm'>Abaixo da média do mercado</p>
                        </div>
                    </p>

                    <p className='flex items-center gap-4'>
                        <CheckCircle2 className='text-success-green' />
                        <div>
                            <span className='text-black'>Prazo: 48 meses</span>
                            <p className='text-sm'>Após formatura</p>
                        </div>
                    </p>

                    <p className='flex items-center gap-4'>
                        <CheckCircle2 className='text-success-green' />
                        <div>
                            <span className='text-black'>Parcela: R$ 850/mês</span>
                            <p className='text-sm'>Valor compatível com salário inicial</p>
                        </div>
                    </p>
                </div>
            </div>

            <div className='w-[50%] h-full flex items-start justify-end'>
                <div className="flex flex-col items-center justify-center w-[90%] bg-white p-6 py-8 rounded-xl shadow-[0_0_40px_10px_rgba(147,51,234,0.2)]">
                    <div className='flex flex-col items-center my-2 gap-2'>
                        <div className='bg-purple-gradient w-20 h-20 rounded-full text-3xl text-white flex items-center justify-center'>J</div>
                        <div>
                            <span>João Silva</span>
                            <p>Engenharia - Insper</p>
                        </div>
                    </div>
                    <div className='flex w-full items-center justify-between bg-success-green/10 p-4 rounded-lg'>
                        <p className='text-lg text-black'>Score</p>
                        <span className='text-success-green font-bold text-2xl'>A+</span>
                    </div>

                    <div className='w-full mt-4 space-y-2'>
                        <p className='flex justify-between text-gray-500 text-sm'>Valor Aprovado <span className='font-semibold text-black'>R$ 35.000</span></p>
                        <p className='flex justify-between text-gray-500 text-sm'>Taxa <span className='font-semibold text-success-green'>8.5%a.a.</span></p>
                        <p className='flex justify-between text-gray-500 text-sm'>Prazo <span className='font-semibold text-black'>48 meses</span></p>
                        <p className='flex justify-between text-gray-500 text-sm'>Parcela <span className='font-semibold text-black'>R$ 850/mês</span></p>
                    </div>
                </div>
            </div>
        </section>
    )
}
