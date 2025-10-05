// src/services/userService.js
import { http } from './http';

export const userService = {
    // Buscar dados completos do usuário
    async getUserProfile() {
        try {
            const response = await http.get('/users/profile');
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar perfil do usuário');
        }
    },

    // Buscar status da conta (custódia, score, etc.)
    async getAccountStatus() {
        try {
            const response = await http.get('/users/account-status');
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar status da conta');
        }
    },

    // Buscar notificações do usuário
    async getNotifications() {
        try {
            const response = await http.get('/notifications');
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar notificações');
        }
    },

    // Marcar notificação como lida
    async markNotificationAsRead(notificationId) {
        try {
            const response = await http.put(`/notifications/${notificationId}/read`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao marcar notificação como lida');
        }
    }
};
