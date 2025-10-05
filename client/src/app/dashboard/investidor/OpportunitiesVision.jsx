import { useState } from 'react'
import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { Filter, ChevronDown, Check, GraduationCap, Shield, TrendingUp } from 'lucide-react'

const SCORE_OPTS = [
    { id: 'A+', label: 'A+ (900+)' },
    { id: 'A', label: 'A (800 - 899)' },
    { id: 'B', label: 'B (700 - 799)' },
]

const MAX_VALUE_OPTS = [
    { id: 30000, label: 'Até R$ 30.000', value: 30000 },
    { id: 50000, label: 'Até R$ 50.000', value: 50000 },
    { id: 100000, label: 'Até R$ 100.000', value: 100000 },
]

function MinScoreSelect({ value, onChange }) {

    return (
        <Listbox value={value} onChange={onChange}>
            <div className="relative w-full">
                <Listbox.Button className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-gray-800 flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                    <span className={`${value ? '' : 'text-gray-500'}`}>
                        {value?.label ?? 'Score mínimo'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </Listbox.Button>

                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-1">
                    <Listbox.Options className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-xl py-1">
                        {SCORE_OPTS.map((opt) => (
                            <Listbox.Option
                                key={opt.id}
                                value={opt}
                                className={({ active }) =>
                                    [
                                        "cursor-pointer select-none text-sm px-3 py-2 mx-1 flex items-center justify-between",
                                        "rounded-lg",
                                        active ? "bg-[var(--primary)] text-white" : "text-gray-800 hover:bg-gray-50",
                                    ].join(" ")
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        <span className={selected ? "font-medium" : "font-normal"}>{opt.label}</span>
                                        {selected && <Check className="w-4 h-4" />}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    )
}

function MaxValueSelect({ value, onChange }) {
    return (
        <Listbox value={value} onChange={onChange}>
            <div className="relative w-full">
                <Listbox.Button className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-gray-800 flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                    <span className={`${value ? '' : 'text-gray-500'}`}>
                        {value?.label ?? 'Valor Máximo'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </Listbox.Button>

                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-1">
                    <Listbox.Options className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-xl py-1">
                        {MAX_VALUE_OPTS.map((opt) => (
                            <Listbox.Option
                                key={opt.id}
                                value={opt}
                                className={({ active }) =>
                                    [
                                        "cursor-pointer select-none text-sm px-3 py-2 mx-1 flex items-center justify-between",
                                        "rounded-lg",
                                        active ? "bg-[var(--primary)] text-white" : "text-gray-800 hover:bg-gray-50",
                                    ].join(" ")
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        <span className={selected ? "font-medium" : "font-normal"}>{opt.label}</span>
                                        {selected && <Check className="w-4 h-4" />}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    )
}

export default function OpportunitiesVision() {
    const [minScore, setMinScore] = useState(null)
    const [maxValue, setMaxValue] = useState(null)

    const oportunidades = [
        {
            id: 1,
            nome: "Ana Costa",
            curso: "Medicina",
            universidade: "USP",
            valor: 45000,
            prazo: 60,
            score: "A+",
            scoreNumerico: 920,
            taxa: 9.2,
            mediaNotas: 9.5,
            frequencia: 98,
            descricao: "Estudante de medicina com excelente desempenho acadêmico."
        },
        {
            id: 2,
            nome: "Carlos Mendes",
            curso: "Engenharia da Computação",
            universidade: "UNICAMP",
            valor: 35000,
            prazo: 48,
            score: "A",
            scoreNumerico: 850,
            taxa: 10.5,
            mediaNotas: 8.8,
            frequencia: 95,
            descricao: "Futuro engenheiro de software com forte base em programação."
        },
        {
            id: 3,
            nome: "Beatriz Lima",
            curso: "Arquitetura",
            universidade: "PUC-SP",
            valor: 28000,
            prazo: 48,
            score: "A+",
            scoreNumerico: 890,
            taxa: 9.8,
            mediaNotas: 9.2,
            frequencia: 96,
            descricao: "Estudante dedicada com projetos premiados."
        },
    ];

    const getScoreColor = (score) => {
        if (score === "A+") return "bg-success-green text-white";
        if (score === "A") return "bg-primary text-white";
        return "bg-muted text-gray-500";
    };

    return (
        <div className='w-full space-y-8'>
            <section className='grid grid-cols-4 gap-8 p-4 border border-border rounded-md'>
                <input className='p-2 border border-border rounded-md' placeholder='Buscar por curso...' />

                {/* Score mínimo custom */}
                <MinScoreSelect value={minScore} onChange={setMinScore} />

                {/* Valor máximo custom (retorna número em value.value) */}
                <MaxValueSelect value={maxValue} onChange={setMaxValue} />

                <button className='flex items-center gap-4 justify-center p-2 border border-border rounded-md hover:bg-primary hover:text-white'>
                    <Filter size={20} /> Mais Filtros
                </button>
            </section>

            <section className="space-y-6">
                {oportunidades.map((oport) => (
                    <div key={oport.id} className="border border-border rounded-2xl p-4 hover:shadow-sm transition-all p-8">
                        <div>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-full bg-purple-gradient flex items-center justify-center text-white text-2xl font-bold">
                                        {oport.nome.charAt(0)}
                                    </div>
                                    <div className='text-left'>
                                        <h3 className="text-2xl font-bold">{oport.nome}</h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <GraduationCap className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-500">{oport.curso}</span>
                                            <span className="text-gray-500">•</span>
                                            <span className="text-gray-500">{oport.universidade}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`${getScoreColor(oport.score)} rounded-full px-2 text-sm`}>
                                    Score: {oport.score}
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 my-6 text-left text-sm">{oport.descricao}</p>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Valor Solicitado</div>
                                    <div className="text-xl font-bold">R$ {oport.valor.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Taxa Proposta</div>
                                    <div className="text-xl font-bold text-success">{oport.taxa}% a.a.</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Prazo</div>
                                    <div className="text-xl font-bold">{oport.prazo} meses</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Média de Notas</div>
                                    <div className="text-xl font-bold">{oport.mediaNotas}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Frequência</div>
                                    <div className="text-xl font-bold">{oport.frequencia}%</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg mb-4">
                                <div className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">Risco calculado: Baixo</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-5 w-5 text-success" />
                                    <span className="text-sm font-medium">Retorno esperado: {oport.taxa}% a.a.</span>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button className="flex-1 bg-purple-gradient rounded-lg text-white py-1 hover:bg-primary">
                                    Investir Agora
                                </button>
                                <button variant="outline">Ver Perfil Completo</button>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <section className='flex gap-4 bg-primary/10 rounded-lg border border-border p-8 mb-32'>
                <Shield className="h-10 w-10 text-primary" />
                <div className='text-left'>
                    <span className='font-bold'>Investimento Seguro e Diversificado</span>
                    <p className='text-gray-500 text-sm'>Todos os investimentos passam por análise de risco rigorosa. Nossa tecnologia de score preditivo baseada em IA aumenta a precisão da análise em até 40% comparado aos métodos tradicionais. Recomendamos diversificar em pelo menos 10 estudantes para otimizar retorno e reduzir risco.</p>
                </div>
            </section>
        </div>
    )
}
