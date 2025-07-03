import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from '../services/api';

export const useProductions = () => {
  return useQuery({
    queryKey: ['productions'],
    queryFn: async () => {
      const response = await api.get(apiEndpoints.productions.list);
      return response.data.results || response.data;
    },
  });
};

export const useProductionDetail = (id: string) => {
  return useQuery({
    queryKey: ['production', id],
    queryFn: async () => {
      const response = await api.get(apiEndpoints.productions.detail(id));
      return response.data;
    },
    enabled: !!id,
  });
};

export const useProductionDashboard = (id: string) => {
  return useQuery({
    queryKey: ['production-dashboard', id],
    queryFn: async () => {
      const response = await api.get(apiEndpoints.productions.dashboard(id));
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useUpdateProductionStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.post(apiEndpoints.productions.updateStatus(id), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['production-dashboard', variables.id] });
    },
  });
};
