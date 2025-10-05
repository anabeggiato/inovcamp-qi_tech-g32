"use client"
import { useRouter } from "next/navigation"

export default function HeaderInterna() {
    const router = useRouter()

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border 
                grid grid-cols-3 items-center px-64 py-4">

            {/* logo */}
            <div className="flex items-center justify-start h-16" onClick={() => router.push("/")}>
                <div className="w-8 h-8 bg-purple-gradient rounded-lg hover:cursor-pointer" />
                <span className="ml-2 text-xl font-bold bg-brand-gradient bg-clip-text text-transparent hover:cursor-pointer">
                    QI-EDU
                </span>
            </div>

            <div className='w-full text-center space-y-2'>
                <h1 className='text-4xl text-black font-bold'>Olá, Usuário!</h1>
                <p className="text-sm">Acompanhe seu financiamento e sesempenho acadêmico</p>
            </div>

            {/* botões */}
            <div className="flex justify-end space-x-6">
                <button className="border border-border text-black rounded-lg p-2 hover:bg-primary/80 hover:text-white" onClick={() => router.push('/')}>
                    Sair
                </button>
            </div>
        </nav>

    )
}
