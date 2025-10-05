import { http } from './http';

export const loansService = {
  async create(payload) {
    // Backend expects authenticated student; http adds Authorization automatically
    return await http.post('/loans', payload);
  },
};

export default loansService;

