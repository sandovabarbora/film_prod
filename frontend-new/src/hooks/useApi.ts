// src/hooks/useApi.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/apiClient';
import { 
  ApiState, 
  ApiError, 
  Production, 
  Scene, 
  CrewMember, 
  CrewAssignment,
  ShootingDay,
  ApiResponse 
} from '../types';

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): ApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, status: 'loading', error: null }));

    try {
      const data = await apiCall();
      setState({ data, status: 'success', error: null });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        const apiError: ApiError = {
          detail: error.response?.data?.detail || error.message || 'Unknown error',
          code: error.response?.data?.code,
          field_errors: error.response?.data?.field_errors,
        };
        setState(prev => ({ ...prev, status: 'error', error: apiError }));
      }
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  return {
    ...state,
    refetch: fetchData,
  };
}

// Mutation hook for create/update/delete operations
export function useMutation<T, D = any>(
  mutationFn: (data: D) => Promise<T>
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const mutate = useCallback(
    async (data: D) => {
      setState(prev => ({ ...prev, status: 'loading', error: null }));

      try {
        const result = await mutationFn(data);
        setState({ data: result, status: 'success', error: null });
        return result;
      } catch (error: any) {
        const apiError: ApiError = {
          detail: error.response?.data?.detail || error.message || 'Unknown error',
          code: error.response?.data?.code,
          field_errors: error.response?.data?.field_errors,
        };
        setState(prev => ({ ...prev, status: 'error', error: apiError }));
        throw apiError;
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, status: 'idle', error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

// Productions
export function useProductions() {
  return useApi(() => apiClient.productions.list());
}

export function useProduction(id: string) {
  return useApi(() => apiClient.productions.get(id), [id]);
}

export function useCreateProduction() {
  return useMutation((data: Partial<Production>) =>
    apiClient.productions.create(data)
  );
}

export function useUpdateProduction() {
  return useMutation(({ id, data }: { id: string; data: Partial<Production> }) =>
    apiClient.productions.update(id, data)
  );
}

// Scenes
export function useScenes(productionId?: string) {
  return useApi(() => apiClient.scenes.list(productionId), [productionId]);
}

export function useScene(id: string) {
  return useApi(() => apiClient.scenes.get(id), [id]);
}

export function useCreateScene() {
  return useMutation((data: Partial<Scene>) =>
    apiClient.scenes.create(data)
  );
}

export function useUpdateScene() {
  return useMutation(({ id, data }: { id: string; data: Partial<Scene> }) =>
    apiClient.scenes.update(id, data)
  );
}

// Crew Members
export function useCrewMembers(productionId?: string) {
  return useApi(() => apiClient.crew.members.list(productionId), [productionId]);
}

export function useCrewMember(id: string) {
  return useApi(() => apiClient.crew.members.get(id), [id]);
}

export function useCreateCrewMember() {
  return useMutation((data: Partial<CrewMember>) =>
    apiClient.crew.members.create(data)
  );
}

export function useUpdateCrewMember() {
  return useMutation(({ id, data }: { id: string; data: Partial<CrewMember> }) =>
    apiClient.crew.members.update(id, data)
  );
}

// Crew Assignments
export function useCrewAssignments(productionId?: string) {
  return useApi(() => apiClient.crew.assignments.list(productionId), [productionId]);
}

export function useCreateCrewAssignment() {
  return useMutation((data: Partial<CrewAssignment>) =>
    apiClient.crew.assignments.create(data)
  );
}

// Shooting Days
export function useShootingDays(productionId?: string) {
  return useApi(() => apiClient.schedule.shootingDays.list(productionId), [productionId]);
}

export function useCreateShootingDay() {
  return useMutation((data: Partial<ShootingDay>) =>
    apiClient.schedule.shootingDays.create(data)
  );
}

export function useUpdateShootingDay() {
  return useMutation(({ id, data }: { id: string; data: Partial<ShootingDay> }) =>
    apiClient.schedule.shootingDays.update(id, data)
  );
}
