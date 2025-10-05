import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = () => {
            try {
                const token = authService.isAuthenticated();
                const userData = authService.getUser();

                if (token && userData) {
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Erro ao inicializar autenticação:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            if (response?.success) {
                setUser(response.data.user);
                return response;
            }
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        router.push('/login');
    };

    const requireAuth = (requiredRole = null) => {
        if (loading) return false;

        if (!user) {
            router.push('/login');
            return false;
        }

        if (requiredRole && user.role !== requiredRole) {
            // Redirecionar para o dashboard correto baseado no role
            if (user.role === 'student') {
                router.push('/dashboard/estudante');
            } else if (user.role === 'investor') {
                router.push('/dashboard/investidor');
            } else {
                router.push('/');
            }
            return false;
        }

        return true;
    };

    return {
        user,
        loading,
        login,
        logout,
        requireAuth,
        isAuthenticated: !!user
    };
};
