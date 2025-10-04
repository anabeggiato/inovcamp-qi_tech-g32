"use client"
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react';

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const user = {
        email, password
    }

    return (
        <div className='w-screen h-screen bg-brand-gradient flex flex-col items-center justify-center'>
            <div className='w-[25%] mb-2'>
                <button className='flex items-center gap-2 py-4 text-white hover:text-gray-300'>
                    <ArrowLeft className='text-sm' />
                    <p className=' text-md '>Voltar</p>
                </button>
            </div>

            <section className='bg-white w-[25%] h-[50%] rounded-2xl z-1 flex flex-col align-center items-center justify-between p-8 shadow-2xl'>
                <h3 className='font-semibold pb-1 text-2xl'>Bem-vindo de volta</h3>
                <p className='text-sm text-gray-400'>Entre com suas credenciais para acessar sua conta</p>

                <div className='flex flex-col w-full mt-4 space-y-1 py-2'>
                    <label className='text-sm'>Email</label>
                    <input type='email' placeholder="seu@email.com" className='border border-border rounded-md p-1' onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className='flex flex-col w-full mb-4 space-y-1'>
                    <label className='text-sm'>Senha</label>
                    <input type='password' placeholder='Digite sua senha' className='border border-border rounded-md p-1' onChange={(e) => setPassword(e.target.value)} />
                </div>

                <div className='w-full flex justify-between'>
                    <div className="space-x-1">
                        <input type='checkbox' />
                        <label className='text-gray-400 font-regular'>Lembrar de mim</label>
                    </div>

                    <a href='/#' className='text-primary underline'>Esqueceu a senha?</a>
                </div>

                <button className='bg-primary p-2 text-white w-full rounded-lg mt-4 hover:bg-primary/90'>Entrar</button>

                <p className='text-gray-500'>Não tem uma conta? <a href="/cadastro" className='text-primary underline'>Cadastre-se</a></p>
            </section>
        </div>
    )
}
