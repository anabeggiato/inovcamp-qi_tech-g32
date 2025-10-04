import { Users, ArrowRight, Lock, GraduationCap, TrendingUp } from 'lucide-react'


export default function Fluxo() {
    return (
        <div className="flex flex-col items-center mb-16 bg-gradient-to-br from-primary/5 to-sea-green/5 border-2 py-8 rounded-lg border-border w-[80%] mt-12">
            <h2 className='font-bold text-4xl text-black mb-6'>Fluxo do Dinheiro</h2>
            <div className='flex items-center gap-8'>
                <div className='flex flex-col items-center'>
                    <div className='flex justify-center items-center rounded-full w-30 h-30 bg-purple-gradient mb-3'>
                        <Users className='text-white w-10 h-10' />
                    </div>

                    <span>Investidores</span>
                    <p>Depositam o capital</p>
                </div>

                <ArrowRight />

                <div className='flex flex-col items-center'>
                    <div className='flex justify-center items-center rounded-full w-30 h-30 bg-second-gradient mb-3'>
                        <Lock className='text-white w-10 h-10' />
                    </div>

                    <span>Custódia</span>
                    <p>Segurança e controle</p>
                </div>

                <ArrowRight />

                <div className='flex flex-col items-center'>
                    <div className='flex justify-center items-center rounded-full w-30 h-30 bg-purple-gradient mb-3'>
                        <GraduationCap className='text-white w-10 h-10' />
                    </div>

                    <span>Faculdade</span>
                    <p>Recebe pagamentos</p>
                </div>

                <ArrowRight />

                <div className='flex flex-col items-center'>
                    <div className='flex justify-center items-center rounded-full w-30 h-30 bg-second-gradient mb-3'>
                        <TrendingUp className='text-white w-10 h-10' />
                    </div>

                    <span>Retorno</span>
                    <p>Investidores recebem</p>
                </div>
            </div>
        </div>
    )
}
