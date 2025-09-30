import { ArrowRight } from 'lucide-react'
import WorkingStep from './WorkingStep'

export default function WorkingContainer() {
    return (
        <div className="flex flex-col items-center mb-16 bg-gradient-to-br from-purple/5 to-sea-green/5 border-2 p-8 rounded-lg border-border w-[80%] mt-12">
            <h2 className="font-bold text-4xl text-black mb-6">Como Funciona</h2>

            <div className="grid grid-cols-3 gap-10">
                {[
                    { num: 1, title: "Cadastre-se", desc: "Preencha seus dados e informações acadêmicas" },
                    { num: 2, title: "Receba seu Score", desc: "Analisamos seu desempenho e oferecemos as melhores taxas" },
                    { num: 3, title: "Escolha o Valor", desc: "Solicite o valor que precisa para seu curso" },
                    { num: 4, title: "Aguarde o Matching", desc: "Conectamos você com investidores interessados" },
                    { num: 5, title: "Estude Tranquilo", desc: "O pagamento vai direto para sua faculdade" },
                    { num: 6, title: "Pague no Futuro", desc: "Comece a retornar após se formar e conseguir emprego" },
                ].map((item) => (
                    <div key={item.num} className="flex items-center gap-3">
                        <div className="flex items-center justify-center text-white text-lg w-12 h-12 bg-purple-gradient rounded-full shrink-0">
                            {item.num}
                        </div>
                        <div className="flex flex-col text-left">
                            <h4 className="font-semibold text-black">{item.title}</h4>
                            <p className="text-gray-600">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}
