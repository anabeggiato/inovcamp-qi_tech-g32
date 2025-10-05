// src/utils/errorHandler.js

/**
 * Extrai mensagem de erro amigável de diferentes tipos de erro
 */
export const extractErrorMessage = (error) => {
    console.log('Extracting error message from:', error);

    // Se já é uma string, retorna como está
    if (typeof error === 'string') {
        return error;
    }

    // Se é um objeto Error
    if (error instanceof Error) {
        const message = error.message;
        console.log('Error message:', message);

        // Extrair mensagem de erro HTTP formatada
        if (message.includes('HTTP') && message.includes('em')) {
            // Formato: "HTTP 400 em /auth/register - Senha deve ter pelo menos 6 caracteres"
            const parts = message.split(' - ');
            if (parts.length > 1) {
                const cleanMessage = parts[1].trim();
                console.log('Extracted clean message:', cleanMessage);
                return cleanMessage;
            }
        }

        return message;
    }

    // Se é um objeto com propriedade message
    if (error && typeof error === 'object' && error.message) {
        return error.message;
    }

    // Se é um objeto de resposta da API
    if (error && typeof error === 'object' && error.data) {
        return error.data.message || 'Erro desconhecido';
    }

    // Se é um objeto com propriedade response (axios)
    if (error && typeof error === 'object' && error.response) {
        const responseData = error.response.data;
        if (responseData && responseData.message) {
            return responseData.message;
        }
        return `Erro ${error.response.status}: ${error.response.statusText}`;
    }

    console.log('Unknown error type, returning default message');
    return 'Erro desconhecido';
};

/**
 * Mapeia códigos de erro HTTP para mensagens amigáveis
 */
export const getHttpErrorMessage = (status, message) => {
    const errorMessages = {
        400: 'Dados inválidos fornecidos',
        401: 'Credenciais inválidas',
        403: 'Acesso negado',
        404: 'Recurso não encontrado',
        409: 'Conflito - recurso já existe',
        422: 'Dados inválidos',
        500: 'Erro interno do servidor',
        503: 'Serviço temporariamente indisponível'
    };

    // Se temos uma mensagem específica do servidor, usa ela
    if (message && !message.includes('HTTP')) {
        return message;
    }

    // Caso contrário, usa a mensagem padrão para o código
    return errorMessages[status] || 'Erro inesperado';
};

/**
 * Valida campos específicos e retorna mensagens de erro
 */
export const validateRegistrationFields = (user) => {
    const errors = [];

    if (!user.name || user.name.trim().length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        errors.push('Email inválido');
    }

    if (!user.cpf || user.cpf.replace(/\D/g, '').length !== 11) {
        errors.push('CPF deve ter 11 dígitos');
    }

    if (!user.password || user.password.length < 6) {
        errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (!user.role) {
        errors.push('Tipo de conta é obrigatório');
    }

    return errors;
};

/**
 * Formata lista de erros para exibição
 */
export const formatErrors = (errors) => {
    if (Array.isArray(errors)) {
        return errors.join('. ');
    }
    return errors;
};
