import { CheckCircle2, BarChart3, Heart } from 'lucide-react'

export default function WhyEducation() {
    return (
        <div className='w-[80%] border-2 border-border rounded-lg p-8 my-12 bg-gradient-to-br from-sea-green/5 to-primary/5'>
            <h2 className='font-bold text-4xl text-black text-left mb-6 pl-12'>Por Que Investir em Educação?</h2>

            <div className='flex text-left'>
                <div className='w-[50%] px-12'>
                    <h4 className='flex items-center gap-2 mb-4 text-black font-semibold text-lg'><BarChart3 className='text-sea-green' /> Retorno financeiro</h4>
                    <div className='flex items-center space-x-2 mb-4'>
                        <CheckCircle2 className='text-success-green' />
                        <p>Rentabilidade média de 12% a.a.</p>
                    </div>

                    <div className='flex items-center space-x-2 mb-4'>
                        <CheckCircle2 className='text-success-green' />
                        <p>Risco controlado por tecnologia de IA</p>
                    </div>

                    <div className='flex items-center space-x-2 mb-4'>
                        <CheckCircle2 className='text-success-green' />
                        <p>Diversificação automática em múltiplos ativos</p>
                    </div>

                    <div className='flex items-center space-x-2'>
                        <CheckCircle2 className='text-success-green' />
                        <p>Taxa de inadimplência inferior a 2%</p>
                    </div>
                </div>

                <div className='w-[50%] px-12'>
                    <h4 className='flex items-center gap-2 mb-4 text-black font-semibold text-lg'><Heart className='text-primary' /> Impacto Social</h4>
                    <div className='flex items-center space-x-2 mb-4'>
                        <CheckCircle2 className='text-success-green' />
                        <p>Transforme a vida de estudantes talentosos</p>
                    </div>

                    <div className='flex items-center space-x-2 mb-4'>
                        <CheckCircle2 className='text-success-green' />
                        <p>Democratize o acesso à educação superior</p>
                    </div>

                    <div className='flex items-center space-x-2 mb-4'>
                        <CheckCircle2 className='text-success-green' />
                        <p>Acompanhe a evolução dos seus investidos</p>
                    </div>

                    <div className='flex items-center space-x-2'>
                        <CheckCircle2 className='text-success-green' />
                        <p>Faça parte de uma rede de mudança</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
