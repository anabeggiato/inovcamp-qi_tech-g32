import { CheckCircle2 } from 'lucide-react'

export default function StudentRequirementsContainer() {
    return (
        <div className='w-[80%] border-2 border-border rounded-lg p-8 my-12'>
            <h2 className='font-bold text-4xl text-black text-left mb-6'>Requisitos Básicos</h2>

            <div className='space-y-4'>
                <div className='flex items-center space-x-2'>
                    <CheckCircle2 className='text-primary' />
                    <p>Estar matriculado ou ter confirmação de matrícula em instituição reconhecida pelo MEC</p>
                </div>

                <div className='flex items-center space-x-2'>
                    <CheckCircle2 className='text-primary' />
                    <p>Apresentar histórico escolar ou comprovante de notas do ensino médio/superior</p>
                </div>

                <div className='flex items-center space-x-2'>
                    <CheckCircle2 className='text-primary' />
                    <p>Ter frequência mínima de 75% (se já estiver cursando)</p>
                </div>

                <div className='flex items-center space-x-2'>
                    <CheckCircle2 className='text-primary' />
                    <p>Ser maior de 18 anos ou ter responsável legal</p>
                </div>

                <div className='flex items-center space-x-2'>
                    <CheckCircle2 className='text-primary' />
                    <p>Apresentar documentos pessoais válidos</p>
                </div>
            </div>
        </div>
    )
}
