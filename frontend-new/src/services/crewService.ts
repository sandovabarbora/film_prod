// src/services/crewService.ts
import { apiClient } from './apiClient';

export interface CrewMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_primary: string;
  primary_position: {
    id: number;
    title: string;
    department: {
      id: number;
      name: string;
    };
  };
  is_available: boolean;
  emergency_contact: string;
  emergency_phone: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  sort_order: number;
}

export class CrewService {
  async getCrewMembers(): Promise<CrewMember[]> {
    const response = await apiClient.get<{ results: CrewMember[] }>('/crew/crew-members/');
    return response.results;
  }

  async getCrewMember(id: number): Promise<CrewMember> {
    return apiClient.get<CrewMember>(`/crew/crew-members/${id}/`);
  }

  async createCrewMember(data: Partial<CrewMember>): Promise<CrewMember> {
    return apiClient.post<CrewMember>('/crew/crew-members/', data);
  }

  async updateCrewMember(id: number, data: Partial<CrewMember>): Promise<CrewMember> {
    return apiClient.patch<CrewMember>(`/crew/crew-members/${id}/`, data);
  }

  async deleteCrewMember(id: number): Promise<void> {
    return apiClient.delete(`/crew/crew-members/${id}/`);
  }

  async getDepartments(): Promise<Department[]> {
    const response = await apiClient.get<{ results: Department[] }>('/crew/departments/');
    return response.results;
  }

  async getCrewAvailability(date: string): Promise<any> {
    return apiClient.get(`/crew/availability/?date=${date}`);
  }
}

export const crewService = new CrewService();
