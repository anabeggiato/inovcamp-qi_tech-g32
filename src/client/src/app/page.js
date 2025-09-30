"use client"

import CardCiclo from "./components/CardCiclo";
import ForStudentsSection from "./components/ForStudentsSection";
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
          <CardCiclo icon={<BarChart3 className="text-white" />} title="1. Análise de Risco" description="Score preditivo baseado em desempenho acadêmico, não apenas histórico de crédito." />
          <CardCiclo icon={<Users className="text-white" />} title="2. Matching P2P" description="Conectamos automaticamente estudantes com múltiplos investidores interessados." />
          <CardCiclo icon={<Lock className="text-white" />} title="3. Custódia Segura" description="Recursos mantidos em carteira de custódia e liberados diretamente para a instituição." />
          <CardCiclo icon={<TrendingUp className="text-white" />} title="4. Retorno Distribuído" description="Pagamentos do estudante retornam proporcionalmente aos investidores." />
        </div>
      </section>

      {/*Seção para estuidantes */}
      <div>
        <div className="rounded-full bg-primary/10 text-primary text-center p-2 w-[12%]">Para estudantes</div>
        <ForStudentsSection />
      </div>
    </div>
  )
}
