import { apiClient } from '../api/client';
import { User } from '../../domain/entities/User';

/**
 * Implementación HTTP del contrato de autenticación.
 * Devuelve siempre { user, token } con el usuario ya mapeado a entidad de dominio.
 */
export const authRepository = {
  async login({ email, password }) {
    const { data } = await apiClient.post('/api/auth/login', { email, password });
    return { user: User.fromApi(data.user), token: data.token };
  },

  async register({ email, password }) {
    const { data } = await apiClient.post('/api/auth/register', { email, password });
    return { user: User.fromApi(data.user), token: data.token };
  },

  async me() {
    const { data } = await apiClient.get('/api/auth/me');
    return User.fromApi(data.user);
  },
};
