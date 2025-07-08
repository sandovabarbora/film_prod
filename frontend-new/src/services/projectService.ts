// src/services/projectService.ts - Project API operations
import { apiClient } from './api';
import type { 
  Project, 
  ProjectsResponse, 
  CreateProjectRequest, 
  UpdateProjectRequest,
  ProjectFilters 
} from '../types/project';

class ProjectService {
  private readonly endpoint = '/projects';

  // Get all projects with filtering
  async getProjects(filters: ProjectFilters = {}): Promise<ProjectsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
    
    return apiClient.get<ProjectsResponse>(url);
  }

  // Get single project by ID
  async getProject(id: string): Promise<Project> {
    return apiClient.get<Project>(`${this.endpoint}/${id}/`);
  }

  // Create new project
  async createProject(data: CreateProjectRequest): Promise<Project> {
    return apiClient.post<Project>(`${this.endpoint}/`, data);
  }

  // Update existing project
  async updateProject(id: string, data: Partial<UpdateProjectRequest>): Promise<Project> {
    return apiClient.patch<Project>(`${this.endpoint}/${id}/`, data);
  }

  // Delete project
  async deleteProject(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}/`);
  }

  // Get project statistics
  async getProjectStats(id: string): Promise<any> {
    return apiClient.get<any>(`${this.endpoint}/${id}/stats/`);
  }

  // Update project status
  async updateProjectStatus(id: string, status: Project['status']): Promise<Project> {
    return apiClient.patch<Project>(`${this.endpoint}/${id}/`, { status });
  }

  // Add team member to project
  async addTeamMember(projectId: string, memberData: any): Promise<any> {
    return apiClient.post<any>(`${this.endpoint}/${projectId}/team/`, memberData);
  }

  // Remove team member from project
  async removeTeamMember(projectId: string, memberId: string): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${projectId}/team/${memberId}/`);
  }

  // Upload project document
  async uploadDocument(projectId: string, file: File, metadata: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const response = await fetch(`${apiClient['baseURL']}${this.endpoint}/${projectId}/documents/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  // Get project timeline/schedule
  async getProjectTimeline(id: string): Promise<any> {
    return apiClient.get<any>(`${this.endpoint}/${id}/timeline/`);
  }

  // Update project budget
  async updateBudget(id: string, budgetData: any): Promise<Project> {
    return apiClient.patch<Project>(`${this.endpoint}/${id}/budget/`, budgetData);
  }

  // Duplicate project
  async duplicateProject(id: string, newTitle: string): Promise<Project> {
    return apiClient.post<Project>(`${this.endpoint}/${id}/duplicate/`, { title: newTitle });
  }

  // Archive project
  async archiveProject(id: string): Promise<Project> {
    return apiClient.patch<Project>(`${this.endpoint}/${id}/`, { status: 'completed' });
  }

  // Get project export data
  async exportProject(id: string, format: 'pdf' | 'excel' | 'json' = 'json'): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}${this.endpoint}/${id}/export/?format=${format}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }
}

export const projectService = new ProjectService();
