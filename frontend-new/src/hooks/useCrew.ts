import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from '../services/api';

interface CrewMember {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  department_name: string;
  role: string;
  role_name: string;
  status: 'active' | 'wrapped' | 'on_hold' | 'released';
  daily_rate?: number;
  start_date?: string;
  end_date?: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface CrewRole {
  id: string;
  name: string;
  department: string;
  department_name: string;
  description?: string;
}

interface CrewFilters {
  department?: string;
  status?: string;
  search?: string;
}

export const useDepartments = () => {
  return useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get(apiEndpoints.crew.departments);
      return response.data;
    },
  });
};

export const useCrewRoles = (departmentId?: string) => {
  return useQuery<CrewRole[]>({
    queryKey: ['crew-roles', departmentId],
    queryFn: async () => {
      const url = departmentId 
        ? `${apiEndpoints.crew.roles}?department=${departmentId}`
        : apiEndpoints.crew.roles;
      const response = await api.get(url);
      return response.data;
    },
  });
};

export const useCrew = (productionId: string, filters?: CrewFilters) => {
  return useQuery<CrewMember[]>({
    queryKey: ['crew', productionId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('production', productionId);
      
      if (filters?.department) params.append('department', filters.department);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      
      const response = await api.get(`${apiEndpoints.crew.list}?${params.toString()}`);
      return response.data.results || response.data;
    },
    enabled: !!productionId,
  });
};

export const useCrewMember = (id: string) => {
  return useQuery({
    queryKey: ['crew-member', id],
    queryFn: async () => {
      const response = await api.get(apiEndpoints.crew.detail(id));
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCrewByDepartment = (productionId: string) => {
  return useQuery({
    queryKey: ['crew-by-department', productionId],
    queryFn: async () => {
      const response = await api.get(
        `${apiEndpoints.crew.list}by_department/?production=${productionId}`
      );
      return response.data;
    },
    enabled: !!productionId,
  });
};

export const useTodayOnSet = (productionId: string) => {
  return useQuery({
    queryKey: ['crew-today', productionId],
    queryFn: async () => {
      const response = await api.get(
        `${apiEndpoints.crew.list}today_on_set/?production=${productionId}`
      );
      return response.data;
    },
    enabled: !!productionId,
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useAddCrewMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<CrewMember> & { production_id: string }) => {
      const response = await api.post(apiEndpoints.crew.list, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crew', variables.production_id] });
      queryClient.invalidateQueries({ queryKey: ['crew-by-department'] });
    },
  });
};

export const useUpdateCrewMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CrewMember> }) => {
      const response = await api.patch(apiEndpoints.crew.detail(id), data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crew'] });
      queryClient.invalidateQueries({ queryKey: ['crew-member', data.id] });
    },
  });
};

export const useUpdateCrewStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.post(`${apiEndpoints.crew.detail(id)}update_status/`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew'] });
    },
  });
};