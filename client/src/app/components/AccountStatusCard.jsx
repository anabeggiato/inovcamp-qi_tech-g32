"use client"
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Shield, CreditCard } from 'lucide-react';
import { useAccountStatus } from '@/hooks/useAccountStatus';

export default function AccountStatusCard() {
    const { accountStatus } = useAccountStatus();

    if (accountStatus.loading) {
        return (
            <div className="w-full border border-border rounded-lg p-6 shadow-sm">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
            case 'approved':
                return <CheckCircle2 className="text-success-green" size={20} />;
            case 'pending':
                return <Clock className="text-yellow-500" size={20} />;
            case 'rejected':
            case 'blocked':
                return <AlertCircle className="text-red-500" size={20} />;
            default:
                return <Clock className="text-gray-500" size={20} />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'Ativa';
            case 'approved':
                return 'Aprovada';
            case 'pending':
                return 'Pendente';
            case 'rejected':
                return 'Rejeitada';
            case 'blocked':
                return 'Bloqueada';
            default:
                return 'Desconhecido';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
            case 'approved':
                return 'text-success-green';
            case 'pending':
                return 'text-yellow-600';
            case 'rejected':
            case 'blocked':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getRiskBandColor = (band) => {
        switch (band) {
            case 'A':
            case 'A+':
                return 'text-green-600 bg-green-100';
            case 'B':
                return 'text-blue-600 bg-blue-100';
            case 'C':
                return 'text-yellow-600 bg-yellow-100';
            case 'D':
                return 'text-orange-600 bg-orange-100';
            case 'E':
            case 'F':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="w-full border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-left gap-2 text-2xl text-black font-medium mb-4">Status da Conta</h3>

            <div className="space-y-4">
                {/* Conta de Custódia */}
                <div className="flex items-center gap-3">
                    {getStatusIcon(accountStatus.custodyAccount?.status)}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-gray-600" />
                            <span className="text-black font-medium">Conta de Custódia</span>
                        </div>
                        <p className={`text-sm ${getStatusColor(accountStatus.custodyAccount?.status)}`}>
                            {getStatusText(accountStatus.custodyAccount?.status)}
                        </p>
                    </div>
                </div>

                {/* Score de Crédito */}
                <div className="flex items-center gap-3">
                    <TrendingUp className="text-primary" size={20} />
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-black font-medium">Score de Crédito</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBandColor(accountStatus.riskBand)}`}>
                                Banda {accountStatus.riskBand}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {accountStatus.creditScore || 'N/A'} pontos
                        </p>
                    </div>
                </div>

                {/* Status de Fraude */}
                <div className="flex items-center gap-3">
                    <Shield className="text-gray-600" size={20} />
                    <div className="flex-1">
                        <span className="text-black font-medium">Verificação de Segurança</span>
                        <p className={`text-sm ${getStatusColor(accountStatus.fraudStatus)}`}>
                            {getStatusText(accountStatus.fraudStatus)}
                        </p>
                    </div>
                </div>

                {/* Onboarding */}
                <div className="flex items-center gap-3">
                    {accountStatus.onboardingComplete ? (
                        <CheckCircle2 className="text-success-green" size={20} />
                    ) : (
                        <Clock className="text-yellow-500" size={20} />
                    )}
                    <div className="flex-1">
                        <span className="text-black font-medium">Configuração da Conta</span>
                        <p className={`text-sm ${accountStatus.onboardingComplete ? 'text-success-green' : 'text-yellow-600'}`}>
                            {accountStatus.onboardingComplete ? 'Completa' : 'Em andamento...'}
                        </p>
                    </div>
                </div>
            </div>

            {accountStatus.onboardingComplete && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-success-green" size={16} />
                        <span className="text-sm text-green-800 font-medium">
                            Conta criada e ativa! Você está pronto para usar a plataforma.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
