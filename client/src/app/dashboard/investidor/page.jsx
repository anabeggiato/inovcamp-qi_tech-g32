"use client"
import Footer from '@/app/components/Footer'
import HeaderInterna from '@/app/components/HeaderInterna'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { DollarSign } from 'lucide-react'
import { useState } from 'react'
import GeneralVision from './GeneralVision'
import OpportunitiesVision from './OpportunitiesVision'
import LoanOffer from './LoanOffer'


export default function InvestorPage() {

    const [vision, setVision] = useState('opportunities')
    const [showOffer, setShowOffer] = useState(false);

    return (
        <ProtectedRoute requiredRole="investor">
            <div>
                <HeaderInterna />
                <main className='main-layout'>
                    {/*Header*/}
                    <section className='w-full grid grid-cols-2 mt-16'>
                        <div className='w-full text-left space-y-2'>
                            <h1 className='text-4xl text-black font-bold'>
                                {vision === "general" ? "Meu portfolio" : "Oportunidades de Investimento"}
                            </h1>
                            <p>{vision === "general" ? "Acompanhe seus investimentos e retornos" : "Encontre estudantes alinhados com seu perfil de investimento"}</p>
                        </div>

                        <div className='w-full flex items-center justify-end'>
                            <button className='flex items-center bg-second-gradient p-2 py-1 text-white rounded-lg text-sm gap-2 hover:shadow-md' onClick={() => setShowOffer(!showOffer)}>
                                <DollarSign size={16} /> Oferecer empréstimo
                            </button>
                        </div>
                        {showOffer && <LoanOffer showPopup={showOffer} setShowPopup={setShowOffer} onSubmit={(payload) => { console.log("Enviar pro backend:", payload); }}
                        />}
                    </section>

                    <div className='w-full flex items-start '>
                        <button className={`px-4 py-2 ${vision === "general" ? "border-b border-gray-400 font-medium text-black" : "text-gray-500"}`} onClick={() => setVision("general")}>Investimentos já realizados</button>
                        <button className={`px-4 py-2 ${vision !== "general" ? "border-b border-gray-400 font-medium text-black" : "text-gray-500"}`} onClick={() => setVision("opportunities")}>Investimentos Disponíveis</button>
                    </div>

                    {vision === "general" ? (
                        <GeneralVision />
                    ) : (
                        <OpportunitiesVision />
                    )}
                </main>
                <Footer />
            </div>
        </ProtectedRoute>
    )
}
