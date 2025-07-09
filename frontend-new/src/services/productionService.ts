// src/services/productionService.ts
import { apiClient } from './apiClient';

export interface Production {
  id: number;
  title: string;
  description: string;
  status: 'development' | 'pre_production' | 'production' | 'post_production' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  budget_total: number;
  location_primary: string;
  created_at: string;
  updated_at: string;
}

export interface Project extends Production {
  crew_count?: number;
  scenes_count?: number;
  progress_percentage?: number;
}

export class ProductionService {
  async getProductions(): Promise<Production[]> {
    const response = await apiClient.get<{ results: Production[] }>('/production/');
    return response.results;
  }

  async getProduction(id: number): Promise<Production> {
    return apiClient.get<Production>(`/production/${id}/`);
  }

  async createProduction(data: Partial<Production>): Promise<Production> {
    return apiClient.post<Production>('/production/', data);
  }

  async updateProduction(id: number, data: Partial<Production>): Promise<Production> {
    return apiClient.patch<Production>(`/production/${id}/`, data);
  }

  async deleteProduction(id: number): Promise<void> {
    return apiClient.delete(`/production/${id}/`);
  }

  async getProjectStats(id: number): Promise<any> {
    return apiClient.get(`/production/${id}/stats/`);
  }
}

export const productionService = new ProductionService();
