// src/services/authService.js
import { http } from './http';

export const authService = {
  // Função para login
  async login({ email, password }) {
    try {
      const response = await http.post('/auth/login', { email, password });
      if (response?.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      return response;
    } catch (error) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  },

  // Função para registro de usuário
  async register({ name, email, cpf, password, role }) {
    try {
      const response = await http.post('/auth/register', { name, email, cpf, password, role });
      if (response?.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      return response;
    } catch (error) {
      throw new Error(error.message || 'Erro ao fazer cadastro');
    }
  },

  // Função para verificar token
  async verify() {
    try {
      const response = await http.get('/auth/verify');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Erro ao verificar token');
    }
  },

  // Função para fazer logout
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Função para verificar se está autenticado
  isAuthenticated() {
    return typeof window !== 'undefined' && !!localStorage.getItem('token');
  },

  // Função para pegar os dados do usuário
  getUser() {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('user')) || null;
      } catch {
        return null;
      }
    }
    return null;
  }
};
