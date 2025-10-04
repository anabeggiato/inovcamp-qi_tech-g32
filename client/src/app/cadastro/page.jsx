"use client"
import { useState } from 'react'
import { GraduationCap, DollarSign, ArrowLeft } from 'lucide-react'

export default function Register() {
    // Mapeamento da seleção de roles do frontend (em português) para o backend (em inglês)
    const roleMapping = {
        'Estudante': 'student',
        'Investidor': 'investor'
    };

    // Estado para armazenar as informações do usuário
    const [user, setUser] = useState({
        name: '',
        cpf: '',
        email: '',
        password: '',
        role: 'Estudante',  // Valor inicial em português
    });

    // Função para alterar a seleção do role
    const handleSelectRole = (role) => {
        setUser(prevState => ({ ...prevState, role }));
    };

    // Função para atualizar as informações do usuário
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Quando for enviar os dados para o backend, fazemos o mapeamento do role
    const handleSubmit = () => {
        const dataToSend = {
            ...user,
            role: roleMapping[user.role],  // Mapeando o role para o valor esperado pelo backend
        };

        // Enviar dataToSend para o backend (exemplo fictício)
        console.log('Enviando dados para o backend:', dataToSend);
        // Aqui você pode fazer uma requisição para a API do backend, como um fetch ou axios.
    };

    return (
        <div className='w-screen h-screen bg-brand-gradient flex flex-col items-center justify-center'>
            <div className='w-[25%] mb-2'>
                <button className='flex items-center gap-2 py-4 text-white hover:text-gray-300'>
                    <ArrowLeft className='text-sm' />
                    <p className=' text-md '>Voltar</p>
                </button>
            </div>

            <section className='bg-white w-[25%] rounded-2xl z-1 flex flex-col align-center items-center justify-between p-8 shadow-2xl'>
                <h3 className='font-semibold pb-1 text-2xl'>Criar Conta</h3>
                <p className='text-sm text-gray-400'>Escolha o tipo de conta e comece sua jornada</p>
                <div className="flex bg-gray-200 w-full rounded-lg p-1 mt-4">
                    <button
                        onClick={() => handleSelectRole('Estudante')}
                        className={`w-[50%] rounded-md p-1 flex items-center justify-center gap-2 ${user.role === 'Estudante' ? 'bg-white text-black shadow-md' : 'text-gray-500'}`}
                    >
                        <GraduationCap /> Estudante
                    </button>
                    <button
                        onClick={() => handleSelectRole('Investidor')}
                        className={`w-[50%] rounded-md p-1 flex items-center justify-center gap-2 ${user.role === 'Investidor' ? 'bg-white text-black shadow-md' : 'text-gray-500'}`}
                    >
                        <DollarSign className='text-sm' /> Investidor
                    </button>
                </div>

                <div className='w-full'>
                    <div className='flex flex-col w-full mt-4 space-y-1 py-2'>
                        <label className='text-sm'>Nome Completo</label>
                        <input
                            type="text"
                            placeholder='João Silva'
                            name="name"
                            value={user.name}
                            onChange={handleInputChange}
                            className='border border-border rounded-md p-1'
                        />
                    </div>

                    <div className='flex flex-col w-full mt-4 space-y-1 py-2'>
                        <label className='text-sm'>CPF</label>
                        <input
                            type="text"
                            placeholder='123.456.789-00'
                            name="cpf"
                            value={user.cpf}
                            onChange={handleInputChange}
                            className='border border-border rounded-md p-1'
                        />
                    </div>

                    <div className='flex flex-col w-full mt-4 space-y-1 py-2'>
                        <label className='text-sm'>Email</label>
                        <input
                            type="email"
                            placeholder='joao@email.com'
                            name="email"
                            value={user.email}
                            onChange={handleInputChange}
                            className='border border-border rounded-md p-1'
                        />
                    </div>

                    <div className='flex flex-col w-full mt-4 space-y-1 py-2'>
                        <label className='text-sm'>Senha</label>
                        <input
                            type="password"
                            placeholder='******'
                            name="password"
                            value={user.password}
                            onChange={handleInputChange}
                            className='border border-border rounded-md p-1'
                        />
                    </div>

                    <div className='flex flex-col w-full mt-4 space-y-1 py-2'>
                        <label className='text-sm'>Confirmar Senha</label>
                        <input
                            type="password"
                            placeholder='******'
                            className='border border-border rounded-md p-1'
                        />
                    </div>

                    <button
                        className={`flex items-center justify-center gap-2 p-2 text-white w-full rounded-lg mt-4 ${user.role === "Estudante" ? "bg-primary hover:bg-primary/90" : "bg-sea-green hover:bg-sea-green/90"}`}
                        onClick={handleSubmit} // Adicionando a lógica de envio do formulário
                    >
                        {user.role === "Estudante" ? <GraduationCap /> : <DollarSign />}
                        Criar Conta de {user.role}
                    </button>
                    <p className='w-full text-center text-gray-500 pt-4'>
                        Já tem uma conta? <a href="/login" className='text-primary'>Entrar</a>
                    </p>
                </div>
            </section>
        </div>
    )
}
