import apiClient from './apiClient';
import type { AxiosRequestConfig } from 'axios';

// Wrapper který vrací přímo data
const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }> {
    const response = await apiClient.get<T>(url, config);
    return { data: response.data };
  },

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<{ data: T }> {
    const response = await apiClient.post<T>(url, data, config);
    return { data: response.data };
  },

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<{ data: T }> {
    const response = await apiClient.put<T>(url, data, config);
    return { data: response.data };
  },

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<{ data: T }> {
    const response = await apiClient.patch<T>(url, data, config);
    return { data: response.data };
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }> {
    const response = await apiClient.delete<T>(url, config);
    return { data: response.data };
  }
};

export default api;
