import axios from 'axios';
import { getAuthToken, deleteAuthToken } from '../../services/secureStorage';

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await deleteAuthToken();
    }
    return Promise.reject(error);
  }
);

export function extractApiError(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    'Ha ocurrido un error inesperado.'
  );
}
