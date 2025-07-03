import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiEndpoints = {
  auth: {
    login: '/auth/login/',
    logout: '/auth/logout/',
    refresh: '/auth/refresh/',
    profile: '/auth/profile/',
  },
  films: {
    list: '/films/',
    detail: (id: string) => `/films/${id}/`,
    create: '/films/',
    update: (id: string) => `/films/${id}/`,
    delete: (id: string) => `/films/${id}/`,
  },
  users: {
    list: '/users/',
    detail: (id: string) => `/users/${id}/`,
    films: (id: string) => `/users/${id}/films/`,
  },
  genres: {
    list: '/genres/',
  },
  upload: {
    image: '/upload/image/',
  },
};
