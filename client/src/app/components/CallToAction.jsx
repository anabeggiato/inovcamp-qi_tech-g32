import { ArrowRight } from 'lucide-react'

export default function CallToAction() {
    return (
        <section className='flex flex-col text-white items-center bg-second-gradient rounded-lg p-8 my-32 space-y-10'>
            <h2 className='text-5xl font-bold'>Pronto para Transformar o Futuro?</h2>
            <p className='text-lg'>Junte-se a milhares de estudantes e investidores que já fazem parte dessa revolução.</p>

            <div className='flex gap-8'>
                <button className='bg-sea-green flex gap-3 py-2 px-4 rounded-lg'>Criar conta Grátis <ArrowRight /></button>
                <button className='border-1 bg-background/20 backdrop-blur-lg flex gap-3 py-2 px-4 rounded-lg hover:bg-background/30'>Saber Mais</button>
            </div>
        </section>
    )
}
