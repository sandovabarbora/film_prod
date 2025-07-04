import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from '../services/api';

interface ShootingDay {
  id: string;
  production: string;
  date: string;
  day_number: number;
  primary_location: string;
  primary_location_name?: string;
  backup_location?: string;
  weather_dependent: boolean;
  crew_call: string;
  wrap_time?: string;
  estimated_wrap: string;
  lunch_time?: string;
  status: 'planned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  special_equipment?: string;
  special_notes?: string;
  crew_count?: number;
  scheduled_scenes?: ScheduledScene[];
}

interface ScheduledScene {
  id: string;
  scene: string;
  scene_number: string;
  shooting_day: string;
  estimated_start_time: string;
  estimated_duration: string;
  actual_start_time?: string;
  actual_end_time?: string;
  order: number;
  location_detail?: string;
  setup_notes?: string;
}

interface CallSheet {
  id: string;
  shooting_day: string;
  version: number;
  status: string;
  general_call_time: string;
  notes: string;
  weather_forecast?: string;
  sunrise?: string;
  sunset?: string;
  created_at: string;
  crew_calls?: CrewCall[];
}

interface CrewCall {
  id: string;
  crew_member: string;
  crew_member_name: string;
  call_time: string;
  location: string;
  special_instructions?: string;
}

export const useShootingDays = (productionId: string, dateRange?: { start: Date; end: Date }) => {
  return useQuery<ShootingDay[]>({
    queryKey: ['shooting-days', productionId, dateRange],
    queryFn: async () => {
      let url = `${apiEndpoints.schedule.list}?production=${productionId}`;
      
      if (dateRange) {
        url += `&date__gte=${dateRange.start.toISOString().split('T')[0]}`;
        url += `&date__lte=${dateRange.end.toISOString().split('T')[0]}`;
      }
      
      const response = await api.get(url);
      return response.data.results || response.data;
    },
    enabled: !!productionId,
  });
};

export const useShootingDay = (id: string) => {
  return useQuery<ShootingDay>({
    queryKey: ['shooting-day', id],
    queryFn: async () => {
      const response = await api.get(apiEndpoints.schedule.detail(id));
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCallSheet = (shootingDayId: string) => {
  return useQuery<CallSheet>({
    queryKey: ['call-sheet', shootingDayId],
    queryFn: async () => {
      const response = await api.get(
        `${apiEndpoints.schedule.callsheets}?shooting_day=${shootingDayId}`
      );
      const callSheets = response.data.results || response.data;
      return callSheets[0]; // Return latest version
    },
    enabled: !!shootingDayId,
  });
};

export const useCreateShootingDay = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<ShootingDay>) => {
      const response = await api.post(apiEndpoints.schedule.list, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shooting-days', variables.production] });
    },
  });
};

export const useUpdateShootingDay = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ShootingDay> }) => {
      const response = await api.patch(apiEndpoints.schedule.detail(id), data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shooting-days'] });
      queryClient.invalidateQueries({ queryKey: ['shooting-day', data.id] });
    },
  });
};

export const useScheduleScene = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      shooting_day_id: string;
      scene_id: string;
      estimated_start_time: string;
      estimated_duration: string;
      order: number;
    }) => {
      const response = await api.post(
        `${apiEndpoints.schedule.detail(data.shooting_day_id)}schedule_scene/`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shooting-day', variables.shooting_day_id] });
      queryClient.invalidateQueries({ queryKey: ['shooting-days'] });
    },
  });
};

export const useCreateCallSheet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<CallSheet>) => {
      const response = await api.post(apiEndpoints.schedule.callsheets, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['call-sheet', variables.shooting_day] });
    },
  });
};

export const useTodaySchedule = (productionId: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery<ShootingDay | null>({
    queryKey: ['today-schedule', productionId],
    queryFn: async () => {
      const response = await api.get(
        `${apiEndpoints.schedule.list}?production=${productionId}&date=${today}`
      );
      const days = response.data.results || response.data;
      return days[0] || null;
    },
    enabled: !!productionId,
    refetchInterval: 60000, // Refresh every minute
  });
};