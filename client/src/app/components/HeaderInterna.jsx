"use client"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function HeaderInterna() {
    const router = useRouter()
    const { user, logout } = useAuth()

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
                <h1 className='text-4xl text-black font-bold'>Olá, {user?.name || 'Usuário'}!</h1>
                <p className="text-sm">
                    {user?.role === 'student'
                        ? 'Acompanhe seu financiamento e desempenho acadêmico'
                        : 'Gerencie seus investimentos e oportunidades'
                    }
                </p>
            </div>

            {/* botões */}
            <div className="flex justify-end space-x-6">
                <button className="border border-border text-black rounded-lg p-2 hover:bg-primary/80 hover:text-white" onClick={logout}>
                    Sair
                </button>
            </div>
        </nav>

    )
}
