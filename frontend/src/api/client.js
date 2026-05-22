import axios from 'axios';

const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const baseURL = import.meta.env.VITE_API_BASE_URL || `http://${defaultHost}:8082`;

const api = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor — inject JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = `Unable to reach backend server at ${baseURL}. Please ensure the backend is running.`;
    }
    if (error.response && error.response.status === 401) {
      const path = window.location.pathname;
      const isDashboardPage = path.includes('-dashboard');

      // Skip redirect for auxiliary/background requests
      const requestUrl = error.config?.url || '';
      const isAuxiliaryRequest = requestUrl.includes('login-history');

      // Skip redirect for mutation requests (POST/PUT/DELETE) —
      // let the component-level catch handler show an error instead
      const method = (error.config?.method || '').toUpperCase();
      const isMutationRequest = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

      if (isDashboardPage && !isAuxiliaryRequest && !isMutationRequest) {
        // Only redirect if a core data-loading GET request fails with 401
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
      // Otherwise just let the error propagate without wiping auth state
    }
    return Promise.reject(error);
  }
);

export default api;

