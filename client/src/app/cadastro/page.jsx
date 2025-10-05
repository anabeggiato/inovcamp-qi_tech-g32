"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, DollarSign, ArrowLeft } from 'lucide-react'
import { authService } from '@/services/authService';
import { validateRegistrationFields, formatErrors } from '@/utils/errorHandler';

export default function Register() {
    const router = useRouter();
    const roleMapping = {
        'Estudante': 'student',
        'Investidor': 'investor'
    };

    const [user, setUser] = useState({
        name: '',
        cpf: '',
        email: '',
        password: '',
        role: 'Estudante',
    });

    const handleSelectRole = (role) => {
        setUser(prevState => ({ ...prevState, role }));
    };

    const validateField = (name, value) => {
        const errors = { ...fieldErrors };

        switch (name) {
            case 'name':
                if (!value || value.trim().length < 2) {
                    errors.name = 'Nome deve ter pelo menos 2 caracteres';
                } else {
                    delete errors.name;
                }
                break;
            case 'email':
                if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errors.email = 'Email inválido';
                } else {
                    delete errors.email;
                }
                break;
            case 'cpf':
                if (!value || value.replace(/\D/g, '').length !== 11) {
                    errors.cpf = 'CPF deve ter 11 dígitos';
                } else {
                    delete errors.cpf;
                }
                break;
            case 'password':
                if (!value || value.length < 6) {
                    errors.password = 'Senha deve ter pelo menos 6 caracteres';
                } else {
                    delete errors.password;
                }
                break;
            default:
                break;
        }

        setFieldErrors(errors);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prevState => ({
            ...prevState,
            [name]: value,
        }));

        // Validar campo em tempo real
        validateField(name, value);

        // Limpar erro geral quando usuário começa a digitar
        if (error) {
            setError('');
        }
    };

    // Função para limpar todos os erros
    const clearAllErrors = () => {
        setError('');
        setFieldErrors({});
    };

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setFieldErrors({}); // Limpar erros de campo
        setIsLoading(true);

        // Validação completa dos campos
        const validationErrors = validateRegistrationFields(user);
        if (validationErrors.length > 0) {
            setError(formatErrors(validationErrors));
            setIsLoading(false);
            return;
        }

        const dataToSend = {
            ...user,
            role: roleMapping[user.role],
        };

        try {
            console.log('Enviando dados para cadastro:', dataToSend);
            const response = await authService.register(dataToSend);
            console.log('Resposta do servidor:', response);

            if (response?.success) {
                setSuccess('Cadastro realizado com sucesso! Configurando sua conta...');
                console.log('Cadastro realizado com sucesso!');

                // Aguardar um pouco para mostrar a mensagem de sucesso
                setTimeout(() => {
                    // Redirecionar baseado no role do usuário
                    const userRole = response.data.user.role;
                    if (userRole === 'student') {
                        router.push("/dashboard/estudante");
                    } else if (userRole === 'investor') {
                        router.push("/dashboard/investidor");
                    } else {
                        router.push("/login");
                    }
                }, 2000);
            } else {
                const errorMessage = response?.message || 'Erro ao cadastrar usuário';
                setError(errorMessage);
                console.error('Erro ao cadastrar usuário:', errorMessage);
            }
        } catch (error) {
            // O erro já foi tratado pelo authService com mensagem amigável
            const errorMessage = error.message || 'Erro ao cadastrar usuário';
            setError(errorMessage);
            console.error('Erro ao cadastrar usuário:', error);
        } finally {
            setIsLoading(false);
        }
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
                    {/* Mensagens de feedback - Sempre no topo */}
                    {error && (
                        <div className='w-full mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-md shadow-sm animate-pulse'>
                            <div className='flex items-start'>
                                <div className='flex-shrink-0'>
                                    <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                                        <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                                    </svg>
                                </div>
                                <div className='ml-3 flex-1'>
                                    <h3 className='text-sm font-medium text-red-800'>
                                        ⚠️ Erro no cadastro
                                    </h3>
                                    <div className='mt-2 text-sm text-red-700 break-words font-medium'>
                                        {error}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setError('')}
                                    className='ml-2 text-red-400 hover:text-red-600 transition-colors'
                                    title='Fechar mensagem'
                                >
                                    <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                    {success && (
                        <div className='w-full mb-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-md shadow-sm'>
                            <div className='flex items-start'>
                                <div className='flex-shrink-0'>
                                    <svg className='h-5 w-5 text-green-400' viewBox='0 0 20 20' fill='currentColor'>
                                        <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                                    </svg>
                                </div>
                                <div className='ml-3 flex-1'>
                                    <h3 className='text-sm font-medium text-green-800'>
                                        ✅ Sucesso!
                                    </h3>
                                    <div className='mt-2 text-sm text-green-700'>
                                        {success}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className='flex flex-col w-full mt-4 space-y-1 py-2'>
                        <label className='text-sm'>Nome Completo</label>
                        <input
                            type="text"
                            placeholder='João Silva'
                            name="name"
                            value={user.name}
                            onChange={handleInputChange}
                            className={`border rounded-md p-1 ${fieldErrors.name ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        />
                        {fieldErrors.name && (
                            <span className='text-xs text-red-600'>{fieldErrors.name}</span>
                        )}
                    </div>

                    <div className='flex flex-col w-full mt-4 space-y-1 py-2'>
                        <label className='text-sm'>CPF</label>
                        <input
                            type="text"
                            placeholder='123.456.789-00'
                            name="cpf"
                            value={user.cpf}
                            onChange={handleInputChange}
                            className={`border rounded-md p-1 ${fieldErrors.cpf ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        />
                        {fieldErrors.cpf && (
                            <span className='text-xs text-red-600'>{fieldErrors.cpf}</span>
                        )}
                    </div>

                    <div className='flex flex-col w-full mt-4 space-y-1 py-2'>
                        <label className='text-sm'>Email</label>
                        <input
                            type="email"
                            placeholder='joao@email.com'
                            name="email"
                            value={user.email}
                            onChange={handleInputChange}
                            className={`border rounded-md p-1 ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        />
                        {fieldErrors.email && (
                            <span className='text-xs text-red-600'>{fieldErrors.email}</span>
                        )}
                    </div>

                    <div className='flex flex-col w-full mt-4 space-y-1 py-2'>
                        <label className='text-sm'>Senha</label>
                        <input
                            type="password"
                            placeholder='******'
                            name="password"
                            value={user.password}
                            onChange={handleInputChange}
                            className={`border rounded-md p-1 ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        />
                        {fieldErrors.password && (
                            <span className='text-xs text-red-600'>{fieldErrors.password}</span>
                        )}
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
                        className={`flex items-center justify-center gap-2 p-2 text-white w-full rounded-lg mt-4 ${user.role === "Estudante" ? "bg-primary hover:bg-primary/90" : "bg-sea-green hover:bg-sea-green/90"} ${isLoading || Object.keys(fieldErrors).length > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={handleSubmit}
                        disabled={isLoading || Object.keys(fieldErrors).length > 0}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Criando conta...
                            </>
                        ) : (
                            <>
                                {user.role === "Estudante" ? <GraduationCap /> : <DollarSign />}
                                Criar Conta de {user.role}
                            </>
                        )}
                    </button>
                    <p className='w-full text-center text-gray-500 pt-4'>
                        Já tem uma conta? <a href="/login" className='text-primary'>Entrar</a>
                    </p>
                </div>
            </section>
        </div>
    )
}
