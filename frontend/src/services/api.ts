import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for sending/receiving httpOnly cookies
});

// Interceptor to handle global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Broadcast an event so AuthContext can log the user out
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
