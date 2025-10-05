"use client";
import { useEffect, useState } from "react";
import { http } from "@/services/http";
import CardInfoEmprestimo from "@/app/components/CardInfoEmprestimo";
import LoanOffer from "./LoanOffer";
import { DollarSign, PieChart, TrendingUp, Users, Plus } from "lucide-react";

export default function GeneralVision() {
    const [portfolio, setPortfolio] = useState(null);
    const [activeInvestments, setActiveInvestments] = useState([]);
    const [showOfferPopup, setShowOfferPopup] = useState(false);
    const [loading, setLoading] = useState(false);

    // 🔹 Buscar o portfólio e os investimentos ativos
    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            const data = await http.get("/investors/portfolio");
            const portfolioData = data.data?.portfolio || {};
            setPortfolio(portfolioData);
            setActiveInvestments(portfolioData.activeInvestments || []);
        } catch (err) {
            console.error("Erro ao buscar portfólio:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const totalInvestido = portfolio?.totalInvested ?? 0;
    const retornoMedio = portfolio?.returns ?? 0;
    const alunosApoiados = portfolio?.activeLoans ?? 0;
    const risco = portfolio?.risk ?? "baixo";

    return (
        <div className="w-full space-y-8">
            {/* 🔸 Header + botão nova oferta */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-black">Visão Geral do Investidor</h2>
                <button
                    onClick={() => setShowOfferPopup(true)}
                    className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:opacity-90"
                >
                    <Plus size={16} />
                    Nova Oferta
                </button>
            </div>

            {/* 🔸 Cards de visão geral */}
            <section className="w-full grid grid-cols-4 gap-8">
                <CardInfoEmprestimo
                    title="Investimento Total"
                    icon={<DollarSign size={16} />}
                    value={`R$ ${totalInvestido.toLocaleString("pt-BR")}`}
                    subtitle="+ 15% este ano"
                />

                <CardInfoEmprestimo
                    title="Retorno Médio"
                    icon={<TrendingUp size={16} />}
                    value={`R$ ${retornoMedio.toLocaleString("pt-BR")}`}
                    subtitle="Acima da média"
                />

                <CardInfoEmprestimo
                    title="Estudantes Apoiados"
                    icon={<Users size={16} />}
                    value={alunosApoiados.toString()}
                    subtitle="23 alunos, 1 formado"
                />

                <CardInfoEmprestimo
                    title="Risco Médio"
                    icon={<PieChart size={16} />}
                    value={risco.toUpperCase()}
                    subtitle="Perfil de risco"
                />
            </section>

            {/* 🔸 Lista de investimentos ativos */}
            <section className="w-full p-8 border border-border rounded-lg mb-32">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl text-black font-semibold">
                        Investimentos Ativos
                    </h3>
                    <button className="p-2 border border-border rounded-md hover:bg-primary hover:text-white">
                        Ver todos
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-8">Carregando...</div>
                ) : activeInvestments.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        Ainda não existem investimentos ativos no momento 💭
                    </div>
                ) : (
                    activeInvestments.map((inv, idx) => (
                        <div
                            key={inv.id || idx}
                            className="flex items-center justify-between w-full p-4 border border-border rounded-2xl my-4 hover:bg-gray-100 transition-all"
                        >
                            {/* 🧑 Info do estudante */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-gradient flex items-center justify-center text-lg text-white font-medium">
                                    {inv.student_name?.[0] || "?"}
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold">{inv.student_name}</p>
                                    <p className="text-sm text-gray-600">{inv.course}</p>
                                </div>
                            </div>

                            {/* 💰 Info financeira */}
                            <div className="flex items-center justify-between w-[40%]">
                                <div className="grid grid-cols-3 gap-8">
                                    <div>
                                        <p className="text-sm text-gray-500">Investido</p>
                                        <span className="font-medium">
                                            R$ {Number(inv.amount).toLocaleString("pt-BR")}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Retorno</p>
                                        <span className="font-medium">
                                            {(inv.expectedAPR * 100).toFixed(1)}% a.a.
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <span className="font-medium capitalize">{inv.status}</span>
                                    </div>
                                </div>

                                <button className="hover:bg-primary hover:text-white p-2 rounded-md">
                                    Ver Detalhes
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </section>

            {/* 🔹 Popup de Nova Oferta */}
            <LoanOffer
                showPopup={showOfferPopup}
                setShowPopup={setShowOfferPopup}
                onSubmit={() => {
                    // Recarrega dados após criar uma oferta
                    fetchPortfolio();
                }}
            />
        </div>
    );
}
