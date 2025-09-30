import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
    return (
        <footer className='flex flex-col items-center text-center text-gray-500 border-t-1 border-border w-screen'>
            <div className='grid grid-cols-4 text-left justify-items-center py-8 w-[90%] border-b-1 border-border'>
                <div className='text-left'>
                    <div className="flex items-center justify-start h-16">
                        <div className="w-8 h-8 bg-purple-gradient rounded-lg" />
                        <span className="ml-2 text-xl font-bold bg-brand-gradient bg-clip-text text-transparent">
                            QI-EDU
                        </span>
                    </div>
                    <p>Transformando o futuro da educação através do financiamento colaborativo.</p>
                </div>

                <div className="space-y-4">
                    <span className="font-bold text-black mb-4">Plataforma</span>
                    <p className="mt-2">Como funciona</p>
                    <p>Para Estudantes</p>
                    <p>Para Investidores</p>
                </div>

                <div className="space-y-4">
                    <span className="font-bold text-black mb-4">Empresa</span>
                    <p className="mt-2">Sobre nós</p>
                    <p>FAQ</p>
                    <p>Contato</p>
                </div>

                <div className="space-y-4">
                    <span className="font-bold text-black mb-4">Siga-nos</span>
                    <div className="flex space-x-2 mt-2">
                        <Facebook />
                        <Instagram />
                        <Linkedin />
                        <Twitter />
                    </div>
                </div>
            </div>

            <hr className="text-gray-500"/>

            <p className="py-12 text-sm">© 2025 QI-EDU. Todos os direitos reservados. Powered by QI Tech.</p>
        </footer>
    )
}
