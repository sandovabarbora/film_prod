// src/services/apiClient.ts
import axios from 'axios';
import type * as ApiTypes from '../types';

// Typy pro axios
type AxiosInstance = any;
type AxiosRequestConfig = any;
type AxiosResponse<T> = { data: T };

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) throw new Error('No refresh token');

            const response = await axios.post(`${this.baseURL}/auth/token/refresh/`, {
              refresh: refreshToken,
            });

            const { access } = response.data;
            localStorage.setItem('access_token', access);
            
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private async get<T>(url: string): Promise<T> {
    const response = await this.client.get(url);
    return response.data;
  }

  private async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  private async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  private async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }

  // Auth API
  auth = {
    login: async (credentials: ApiTypes.LoginCredentials): Promise<ApiTypes.AuthTokens> => {
      const data = await this.post<ApiTypes.AuthTokens>('/auth/token/', credentials);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      return data;
    },

    logout: async (): Promise<void> => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          await this.post('/auth/logout/', { refresh: refreshToken });
        } catch (error) {
          console.warn('Logout request failed:', error);
        }
      }
      this.clearTokens();
    },

    getCurrentUser: (): Promise<ApiTypes.User> => 
      this.get<ApiTypes.User>('/auth/profile/'),

    refreshToken: async (): Promise<ApiTypes.AuthTokens> => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');
      
      return this.post<ApiTypes.AuthTokens>('/auth/token/refresh/', { 
        refresh: refreshToken 
      });
    },
  };

  // Productions API
  productions = {
    list: (): Promise<ApiTypes.ApiResponse<ApiTypes.Production>> => 
      this.get<ApiTypes.ApiResponse<ApiTypes.Production>>('/productions/'),

    get: (id: string): Promise<ApiTypes.Production> => 
      this.get<ApiTypes.Production>(`/productions/${id}/`),

    create: (data: Partial<ApiTypes.Production>): Promise<ApiTypes.Production> => 
      this.post<ApiTypes.Production>('/productions/', data),

    update: (id: string, data: Partial<ApiTypes.Production>): Promise<ApiTypes.Production> => 
      this.patch<ApiTypes.Production>(`/productions/${id}/`, data),

    delete: (id: string): Promise<void> => 
      this.delete<void>(`/productions/${id}/`),
  };
}

export const apiClient = new ApiClient();
export default apiClient;
