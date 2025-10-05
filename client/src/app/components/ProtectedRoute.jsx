"use client"
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ children, requiredRole = null }) {
    const { user, loading, requireAuth } = useAuth();

    useEffect(() => {
        if (!loading) {
            requireAuth(requiredRole);
        }
    }, [loading, requireAuth, requiredRole]);

    // Mostrar loading enquanto verifica autenticação
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    // Se não está autenticado ou não tem o role necessário, não renderiza nada
    // O hook useAuth já redirecionou o usuário
    if (!user || (requiredRole && user.role !== requiredRole)) {
        return null;
    }

    return children;
}
