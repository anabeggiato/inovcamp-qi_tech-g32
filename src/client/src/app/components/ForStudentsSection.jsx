import { CheckCircle2, GraduationCap } from 'lucide-react'

export default function ForStudentsSection() {
    return (
        <section className='flex my-4 pr-2 items-center'>
            <div className='w-[50%]'>
                <h2 className='text-5xl font-bold'>Realize Seus Sonhos <br /> <span className='text-primary'>Sem Burocracia</span></h2>

                <p className='text-lg text-gray-500 my-4'>Seu desempenho acadêmico vale mais que seu histórico bancário. Conquiste taxas melhores com boas notas e frequência.</p>

                <div className='space-y-4 pb-4'>
                    <p className='flex items-center gap-4'><CheckCircle2 className='text-success-green' />Score baseado em mérito acadêmico</p>
                    <p className='flex items-center gap-4'><CheckCircle2 className='text-success-green' />Sem necessidade de fiador</p>
                    <p className='flex items-center gap-4'><CheckCircle2 className='text-success-green' />Taxas justas e transparentes</p>
                    <p className='flex items-center gap-4'><CheckCircle2 className='text-success-green' />Pagamento após a formatura</p>
                </div>

                <button className='bg-purple-gradient text-white flex items-center py-2 px-6 rounded-lg gap-4'><GraduationCap /> Começar minha jornada</button>
            </div>

            <div className='w-[50%] h-full flex items-start justify-end'>
                <div class="flex flex-col items-center justify-center w-[90%] bg-white p-6 rounded-xl shadow-[0_0_40px_10px_rgba(147,51,234,0.6)]">
                   <div className='flex w-full items-center justify-between bg-success-green/10 p-4 rounded-lg'>
                    <p className='font-bold text-lg'>Score Acadêmico</p>
                    <span className='text-success-green font-bold text-2xl'>A+</span>
                   </div>

                   <div className='w-full mt-4 space-y-2'>
                    <p className='flex justify-between text-gray-500 text-sm'>Taxa de Juros <span className='font-semibold text-success-green'>8.5%a.a.</span></p>
                    <p className='flex justify-between text-gray-500 text-sm'>Valor Aprovado <span className='font-semibold text-black'>R$ 35.000</span></p>
                    <p className='flex justify-between text-gray-500 text-sm'>Prazo <span className='font-semibold text-black'>48 meses</span></p>
                    <button className='bg-purple-gradient w-full text-white rounded-lg py-2'>Ver Detalhes</button>
                   </div>
                </div>
            </div>
        </section>
    )
}
