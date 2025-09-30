"use client"

import CardCiclo from "./components/CardCiclo";
import ForStudentsSection from "./components/ForStudentsSection";
import ForInvestorSection from "./components/ForInvestorSection";
import Header from "./components/Header"
import Hero from "./components/Hero"
import {
  TrendingUp,
  Shield,
  Users,
  Zap,
  GraduationCap,
  DollarSign,
  BarChart3,
  Lock,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function Home() {

  return (
    <div className="h-screen w-screen bg-background px-64">
      <Header />
      <Hero />

      {/*Seção como funciona*/}
      <section className="my-32">
        <h2 className="text-5xl font-bold text-center py-4">Como Funciona</h2>
        <p className="text-gray-500 text-2xl text-center pb-4">Um ciclo completo de financiamento inteligente</p>

        <div className="grid grid-cols-4 justify-items-center mt-8">
          <CardCiclo icon={<BarChart3 className="text-white" />} title="1. Análise de Risco" description="Score preditivo baseado em desempenho acadêmico, não apenas histórico de crédito." align="left"/>
          <CardCiclo icon={<Users className="text-white" />} title="2. Matching P2P" description="Conectamos automaticamente estudantes com múltiplos investidores interessados." align="left" />
          <CardCiclo icon={<Lock className="text-white" />} title="3. Custódia Segura" description="Recursos mantidos em carteira de custódia e liberados diretamente para a instituição." align="left" />
          <CardCiclo icon={<TrendingUp className="text-white" />} title="4. Retorno Distribuído" description="Pagamentos do estudante retornam proporcionalmente aos investidores." align="left" />
        </div>
      </section>


      <ForStudentsSection />
      <ForInvestorSection />

      <section className="my-32">
        <h2 className="text-5xl font-bold text-center py-4">Tecnologia e Segurança</h2>
        <p className="text-gray-500 text-2xl text-center pb-4">Powered by QI Tech, a infraestrutura financeira do futuro</p>

        <div className="grid grid-cols-3 justify-items-center mt-8">
          <CardCiclo icon={<Shield className="text-white" />} title="Antifraude Avançado" description="Detecção em tempo real de anomalias e proteção contra fraudes."  />
          <CardCiclo icon={<Zap className="text-white" />} title="Matching Inteligente" description="Algoritmo de IA que conecta o perfil ideal de investidor e estudante." />
          <CardCiclo icon={<Lock className="text-white" />} title="Custódia Segura" description="Recursos protegidos até confirmação de matrícula e frequência." />
          
        </div>
      </section>
    </div>
  )
}
