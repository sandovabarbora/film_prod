import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api'; // Změna z { api } na api

// Typy pro produkci
interface Production {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'pre-production' | 'production' | 'post-production' | 'completed';
  budget: number;
  created_at: string;
  updated_at: string;
}

interface ProductionStats {
  total_crew: number;
  total_locations: number;
  total_equipment: number;
  days_remaining: number;
  budget_used_percentage: number;
}

// API volání
const productionApi = {
  getAll: () => api.get<Production[]>('/productions/').then(res => res.data),
  getById: (id: number) => api.get<Production>(`/productions/${id}/`).then(res => res.data),
  getStats: (id: number) => api.get<ProductionStats>(`/productions/${id}/stats/`).then(res => res.data),
  create: (data: Partial<Production>) => api.post<Production>('/productions/', data).then(res => res.data),
  update: (id: number, data: Partial<Production>) => api.put<Production>(`/productions/${id}/`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/productions/${id}/`),
};

// Hooks
export const useProductions = () => {
  return useQuery({
    queryKey: ['productions'],
    queryFn: productionApi.getAll,
  });
};

export const useProduction = (id: number) => {
  return useQuery({
    queryKey: ['production', id],
    queryFn: () => productionApi.getById(id),
    enabled: !!id,
  });
};

export const useProductionStats = (id: number) => {
  return useQuery({
    queryKey: ['production-stats', id],
    queryFn: () => productionApi.getStats(id),
    enabled: !!id,
  });
};

export const useCreateProduction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productions'] });
    },
  });
};

export const useUpdateProduction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Production> }) => 
      productionApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productions'] });
      queryClient.invalidateQueries({ queryKey: ['production', variables.id] });
    },
  });
};

export const useDeleteProduction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productionApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productions'] });
    },
  });
};

// Hook pro dashboard - kombinuje data z více endpointů
export const useProductionDashboard = (productionId?: number) => {
  const productions = useProductions();
  const production = useProduction(productionId || 0);
  const stats = useProductionStats(productionId || 0);
  
  return {
    productions: productions.data || [],
    currentProduction: production.data,
    stats: stats.data,
    isLoading: productions.isLoading || production.isLoading || stats.isLoading,
    error: productions.error || production.error || stats.error,
  };
};