import { CheckCircle2 } from 'lucide-react'

export default function DiferencialsContainer() {
    return (
        <div className='w-[80%] border-2 border-border rounded-lg py-8'>
            <h2 className='font-bold text-4xl text-black mb-6'>Nossos Diferencias</h2>

            <div className='grid grid-cols-2 justify-items-center'>
                <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                        <CheckCircle2 className='text-success-green'/>
                        <p>Score baseado em mérito acadêmico, não apenas histórico de crédito</p>
                    </div>

                    <div className='flex items-center space-x-2'>
                        <CheckCircle2 className='text-success-green'/>
                        <p>Carteira de custódia para segurança do investimento</p>
                    </div>

                    <div className='flex items-center space-x-2'>
                        <CheckCircle2 className='text-success-green'/>
                        <p>Sistema antifraude em tempo real</p>
                    </div>
                </div>

                <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                        <CheckCircle2 className='text-success-green'/>
                        <p>Matching inteligente com múltiplos investidores</p>
                    </div>

                    <div className='flex items-center space-x-2'>
                        <CheckCircle2 className='text-success-green'/>
                        <p>Pagamento direto à instituição de ensino</p>
                    </div>

                    <div className='flex items-center space-x-2'>
                        <CheckCircle2 className='text-success-green'/>
                        <p>Liquidação automática dos retornos</p>
                    </div>
                </div>
            </div>
        </div>


    )
}
