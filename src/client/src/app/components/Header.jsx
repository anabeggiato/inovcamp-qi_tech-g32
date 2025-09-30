"use client"
import { useRouter } from "next/navigation"

export default function Header() {
    const router = useRouter()

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border 
                grid grid-cols-3 items-center px-16">

            {/* logo */}
            <div className="flex items-center justify-start h-16" onClick={() => router.push("/")}>
                <div className="w-8 h-8 bg-purple-gradient rounded-lg hover:cursor-pointer" />
                <span className="ml-2 text-xl font-bold bg-brand-gradient bg-clip-text text-transparent hover:cursor-pointer">
                    QI-EDU
                </span>
            </div>

            {/* menu central */}
            <div className="flex items-center justify-center space-x-6 text-gray-600">
                <p className='hover:text-black hover:cursor-pointer' onClick={() => router.push("/funcionamento")}>Como Funciona</p>
                <p className='hover:text-black' onClick={() => router.push("/para-estudantes")}>Para Estudantes</p>
                <p className='hover:text-black'>Para Investidores</p>
                <p className='hover:text-black'>Sobre</p>
            </div>

            {/* botões */}
            <div className="flex justify-end space-x-6">
                <button className="rounded-lg p-2 hover:bg-primary hover:text-white transition-colors duration-300 ease-in-out">
                    Entrar
                </button>
                <button className="bg-purple-gradient text-white rounded-lg p-2">
                    Começar Agora
                </button>
            </div>
        </nav>

    )
}
