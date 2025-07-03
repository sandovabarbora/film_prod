import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const apiEndpoints = {
  auth: {
    login: '/auth/token/',
    refresh: '/auth/token/refresh/',
    profile: '/auth/profile/',
  },
  productions: {
    list: '/production/productions/',
    detail: (id: string) => `/production/productions/${id}/`,
    create: '/production/productions/',
    update: (id: string) => `/production/productions/${id}/`,
    delete: (id: string) => `/production/productions/${id}/`,
    dashboard: (id: string) => `/production/productions/${id}/dashboard/`,
    updateStatus: (id: string) => `/production/productions/${id}/update_status/`,
  },
  crew: {
    list: '/crew/members/',
    detail: (id: string) => `/crew/members/${id}/`,
    departments: '/crew/departments/',
  },
  schedule: {
    list: '/schedule/shooting-days/',
    detail: (id: string) => `/schedule/shooting-days/${id}/`,
    callsheets: '/schedule/callsheets/',
  },
  scenes: {
    list: '/production/scenes/',
    detail: (id: string) => `/production/scenes/${id}/`,
    markCompleted: (id: string) => `/production/scenes/${id}/mark_completed/`,
  },
  shots: {
    list: '/production/shots/',
    detail: (id: string) => `/production/shots/${id}/`,
    addTake: (id: string) => `/production/shots/${id}/add_take/`,
    updateStatus: (id: string) => `/production/shots/${id}/update_status/`,
  },
  notifications: {
    channels: '/notifications/channels/',
    messages: '/notifications/messages/',
    alerts: '/notifications/alerts/',
  },
  analytics: {
    dashboard: '/analytics/dashboard/overview/',
    velocity: '/analytics/dashboard/velocity_analysis/',
    efficiency: '/analytics/dashboard/efficiency_breakdown/',
    realtime: '/analytics/dashboard/real_time_metrics/',
  }
};
