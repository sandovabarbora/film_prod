// src/services/projectService.ts - REAL API with unified types
import apiClient from './apiClient';
import type { Project, ProjectsResponse } from '../types';

class ProjectService {
  async getProjects(): Promise<Project[]> {
    try {
      console.log('🎬 Fetching projects from API...');
      const response = await apiClient.get<ProjectsResponse>('/production/productions/');
      
      console.log('✅ Projects API response:', response);
      
      // Handle paginated response
      if (response?.results && Array.isArray(response.results)) {
        return response.results;
      }
      
      // Fallback for direct array
      if (Array.isArray(response)) {
        return response;
      }
      
      console.warn('⚠️ Unexpected projects response format:', response);
      return [];
      
    } catch (error) {
      console.error('❌ Failed to fetch projects:', error);
      throw error;
    }
  }

  async getProject(id: string): Promise<Project> {
    try {
      console.log(`🎬 Fetching project ${id} from API...`);
      const response = await apiClient.get<Project>(`/production/productions/${id}/`);
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch project ${id}:`, error);
      throw error;
    }
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    try {
      console.log('🎬 Creating project:', data);
      const response = await apiClient.post<Project>('/production/productions/', data);
      return response;
    } catch (error) {
      console.error('❌ Failed to create project:', error);
      throw error;
    }
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    try {
      console.log(`🎬 Updating project ${id}:`, data);
      const response = await apiClient.patch<Project>(`/production/productions/${id}/`, data);
      return response;
    } catch (error) {
      console.error(`❌ Failed to update project ${id}:`, error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      console.log(`🎬 Deleting project ${id}`);
      await apiClient.delete(`/production/productions/${id}/`);
    } catch (error) {
      console.error(`❌ Failed to delete project ${id}:`, error);
      throw error;
    }
  }

  // Helper method to get active projects for assignments
  async getActiveProjects(): Promise<Project[]> {
    const allProjects = await this.getProjects();
    return allProjects.filter(project => 
      project.status === 'production' || project.status === 'pre_production'
    );
  }
}

const projectService = new ProjectService();
export default projectService;
