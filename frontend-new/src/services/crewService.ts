import api from './api';
import type { 
  CrewMember, 
  CrewMemberData, 
  Department, 
  Position,
  DepartmentWithPositions,
  CrewAssignment 
} from '../types/crew';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const crewService = {
  // Crew Members
  async getCrewMembers(): Promise<CrewMember[]> {
    console.log('👥 Fetching crew members from API...');
    const response = await api.get<CrewMember[] | PaginatedResponse<CrewMember>>('/crew/members/');
    const data = response.data;
    console.log('✅ Crew API response:', data);
    
    if (data && 'results' in data && Array.isArray(data.results)) {
      console.log('📋 Found paginated response with results array');
      return data.results;
    } else if (Array.isArray(data)) {
      console.log('📋 Found direct array response');
      return data;
    } else {
      console.error('❌ Unexpected response format:', data);
      return [];
    }
  },

  async createCrewMember(data: CrewMemberData): Promise<CrewMember> {
    const response = await api.post<CrewMember>('/crew/members/', data);
    return response.data;
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    console.log('🏢 Fetching departments from API...');
    const response = await api.get<Department[] | PaginatedResponse<Department>>('/crew/departments/');
    const data = response.data;
    console.log('✅ Departments API response:', data);
    
    if (data && 'results' in data && Array.isArray(data.results)) {
      return data.results;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.error('❌ Unexpected departments response format:', data);
      return [];
    }
  },

  async createDepartment(data: Partial<Department>): Promise<Department> {
    const response = await api.post<Department>('/crew/departments/', data);
    return response.data;
  },

  // Positions
  async getPositions(): Promise<Position[]> {
    console.log('💼 Fetching positions from API...');
    const response = await api.get<Position[] | PaginatedResponse<Position>>('/crew/positions/');
    const data = response.data;
    console.log('✅ Positions API response:', data);
    
    if (data && 'results' in data && Array.isArray(data.results)) {
      return data.results;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.error('❌ Unexpected positions response format:', data);
      return [];
    }
  },

  async createPosition(data: Partial<Position>): Promise<Position> {
    const response = await api.post<Position>('/crew/positions/', data);
    return response.data;
  },

  // Departments with Positions - použijeme existující endpointy
  async getDepartmentsWithPositions(): Promise<DepartmentWithPositions[]> {
    console.log('🌐 Getting departments with positions...');
    
    try {
      // Načíst departments a positions paralelně
      const [departments, positions] = await Promise.all([
        this.getDepartments(),
        this.getPositions()
      ]);
      
      console.log('📦 Got departments:', departments);
      console.log('📦 Got positions:', positions);
      
      // Mapovat departments s jejich positions
      const result = departments.map(dept => ({
        ...dept,
        positions: positions
          .filter(pos => {
            // Porovnat podle department_name nebo department.id
            return pos.department_name === dept.name || 
                   (pos.department && pos.department.id === dept.id);
          })
          .map(pos => ({
            id: pos.id,
            title: pos.title,
            level: pos.level,
            daily_rate_min: pos.daily_rate_min,
            daily_rate_max: pos.daily_rate_max
          }))
      }));
      
      console.log('📦 Built departments with positions:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to get departments with positions:', error);
      return [];
    }
  },

  // Crew Assignments
  async assignCrewToProduction(productionId: string, crewMemberId: string, data: any): Promise<CrewAssignment> {
    const response = await api.post<CrewAssignment>(
      `/productions/${productionId}/crew-assignments/`,
      {
        crew_member: crewMemberId,
        ...data
      }
    );
    return response.data;
  },

  async removeCrewFromProduction(productionId: string, assignmentId: string): Promise<void> {
    await api.delete(`/productions/${productionId}/crew-assignments/${assignmentId}/`);
  },

  // Update existing crew member
  async updateCrewMember(id: string, data: Partial<CrewMemberData>): Promise<CrewMember> {
    console.log('📝 Updating crew member:', id, data);
    const response = await api.patch<CrewMember>(`/crew/members/${id}/`, data);
    return response.data;
  },

  // Delete crew member
  async deleteCrewMember(id: string): Promise<void> {
    console.log('🗑️ Deleting crew member:', id);
    await api.delete(`/crew/members/${id}/`);
  }
};

export default crewService;
