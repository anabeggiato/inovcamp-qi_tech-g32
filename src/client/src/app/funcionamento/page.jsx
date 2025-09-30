import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CardFinanciamento from '../components/CardFinanciamento'
import {
  TrendingUp,
  Shield,
  Users,
  Zap,
  BarChart3,
  Lock,
} from "lucide-react";
import Fluxo from '../components/Fluxo';
import DiferencialsContainer from '../components/DiferencialsContainer';
import CardDiferencial from '../components/CardDiferencial';

export default function Funcionamento() {
  return (
    <div className="min-h-screen w-screen bg-background mt-15">
      <Header />
      <main className="flex flex-col items-center px-64 text-center text-gray-500">
        <div className='w-[50%] py-6'>
          <h1 className='bg-brand-gradient bg-clip-text text-transparent font-bold text-5xl mb-6'>Como funciona o QI-EDU</h1>
          <span className='text-lg'>Uma plataforma de Lending as a Service (LaaS) P2P especializada em educação. Não é um subsídio, mas um empréstimo real gerenciado por tecnologia de ponta.</span>
        </div>

        <div className='rounded-lg border-2 border-border p-8 text-left space-y-4 w-[80%]'>
          <h3 className='font-bold text-3xl text-black'>A bolsa de Valores do Crédito Educacional</h3>
          <p>O QI-EDU funciona como uma Bolsa de Valores do Crédito Educacional, onde múltiplos investidores financiam o curso de um único aluno, e esse aluno retorna o dinheiro com juros, diretamente para eles.</p>
          <p>Transformamos o alto risco do crédito educacional em uma oportunidade segura para Investidores e justa para o Aluno através de tecnologia avançada de gestão de risco.</p>
        </div>

        <h2 className='font-bold text-4xl text-black my-12'>O Ciclo Completo do Financiamento</h2>
        <div className='grid grid-cols-2 justify-items-center gap-4 w-[80%]'>
          <CardFinanciamento icon={<BarChart3 className='text-white'/>} title="1. Análise de Risco" subtitle="O aluno se cadastra na plataforma e o sistema executa o Score Preditivo" description="Usa notas acadêmicas, frequência e dados de fraude para dar um Score mais preciso que o SPC/Serasa." />
          <CardFinanciamento icon={<Users className='text-white'/>} title="2. Matching P2P" subtitle="O sistema casa automaticamente o pedido do aluno com investidores" description="O empréstimo é fechado entre várias partes, distribuindo o risco de forma inteligente." />
          <CardFinanciamento icon={<Lock className='text-white'/>} title="3. Desembolso Seguro" subtitle="O dinheiro é depositado na Carteira de Custódia" description="De lá, ele é repassado diretamente à faculdade em parcelas mensais programadas." />
          <CardFinanciamento icon={<TrendingUp className='text-white'/>} title="4. Retorno aos Investidores" subtitle="Após a formatura, o aluno começa a pagar as parcelas" description="O pagamento é liquidado pelo sistema, e o principal + juros são distribuídos de volta para os Investidores." />
        </div>

        <Fluxo />

        <DiferencialsContainer />

        <section className='grid grid-cols-3 w-[80%] mt-12 mb-32 gap-4'>
          <CardDiferencial icon={<BarChart3 />} title="Score Preditivo" description="Análise baseada em desempenho acadêmico, não apenas histórico bancário" color="purple"/>
          <CardDiferencial icon={<Lock />} title="Custódia Segura" description="Recursos protegidos até confirmação de matrícula e frequência" color="blue"/>
          <CardDiferencial icon={<Users />} title="P2P Inteligente" description="Risco distribuído entre múltiplos investidores para maior segurança" color="green"/>
        </section>
      </main>

      <Footer />
    </div>
  )
}
