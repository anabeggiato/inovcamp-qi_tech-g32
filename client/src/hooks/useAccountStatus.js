import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';

export const useAccountStatus = () => {
    const [accountStatus, setAccountStatus] = useState({
        custodyAccount: null,
        creditScore: null,
        riskBand: null,
        fraudStatus: null,
        onboardingComplete: false,
        loading: true
    });

    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);

    useEffect(() => {
        fetchAccountStatus();
        fetchNotifications();
    }, []);

    const fetchAccountStatus = async () => {
        try {
            setAccountStatus(prev => ({ ...prev, loading: true }));

            // Simular dados por enquanto (quando a API estiver pronta)
            const mockStatus = {
                custodyAccount: {
                    id: 'custody_123',
                    status: 'active',
                    balance: 0,
                    created_at: new Date().toISOString()
                },
                creditScore: 750,
                riskBand: 'B',
                fraudStatus: 'approved',
                onboardingComplete: true
            };

            setAccountStatus({
                ...mockStatus,
                loading: false
            });

        } catch (error) {
            console.error('Erro ao buscar status da conta:', error);
            setAccountStatus(prev => ({ ...prev, loading: false }));
        }
    };

    const fetchNotifications = async () => {
        try {
            setNotificationsLoading(true);

            // Simular notificações por enquanto
            const mockNotifications = [
                {
                    id: 1,
                    type: 'welcome',
                    title: 'Bem-vindo! Sua conta foi configurada',
                    message: 'Sua conta de custódia foi criada e seu score inicial foi calculado.',
                    status: 'unread',
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    type: 'score_update',
                    title: 'Score calculado',
                    message: 'Seu score de crédito inicial é 750 (Banda B).',
                    status: 'unread',
                    created_at: new Date().toISOString()
                }
            ];

            setNotifications(mockNotifications);
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
        } finally {
            setNotificationsLoading(false);
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await userService.markNotificationAsRead(notificationId);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, status: 'read' }
                        : notif
                )
            );
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
        }
    };

    const getUnreadNotificationsCount = () => {
        return notifications.filter(notif => notif.status === 'unread').length;
    };

    return {
        accountStatus,
        notifications,
        notificationsLoading,
        fetchAccountStatus,
        fetchNotifications,
        markNotificationAsRead,
        getUnreadNotificationsCount
    };
};
