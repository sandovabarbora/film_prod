import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor pro přidání auth tokenu
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor pro refresh token logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        localStorage.setItem('access_token', response.data.access);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpointy
export const apiEndpoints = {
  auth: {
    login: '/auth/token/',
    refresh: '/auth/token/refresh/',
    logout: '/auth/logout/',
    register: '/auth/register/',
    profile: '/auth/profile/',
  },
  productions: {
    list: '/productions/',
    detail: (id: number) => `/productions/${id}/`,
    stats: (id: number) => `/productions/${id}/stats/`,
  },
  crew: {
    list: '/crew/',
    detail: (id: number) => `/crew/${id}/`,
  },
  schedule: {
    list: '/schedule/',
    detail: (id: number) => `/schedule/${id}/`,
  },
  equipment: {
    list: '/equipment/',
    detail: (id: number) => `/equipment/${id}/`,
  },
  locations: {
    list: '/locations/',
    detail: (id: number) => `/locations/${id}/`,
  },
  documents: {
    list: '/documents/',
    detail: (id: number) => `/documents/${id}/`,
    upload: '/documents/upload/',
  },
};

// Default export pro zpětnou kompatibilitu
export default api;