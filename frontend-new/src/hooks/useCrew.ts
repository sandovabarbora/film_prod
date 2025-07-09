// src/hooks/useCrew.ts - API-powered crew management hook
import { useState, useEffect } from 'react';
import crewService from '../services/crewService';
import type { 
  CrewMember, 
  CrewDepartment, 
  CrewPosition, 
  CrewAssignment,
  CrewMemberData 
} from '../types';

interface CrewStats {
  totalCrew: number;
  activeCrew: number;
  totalDepartments: number;
  totalPositions: number;
  assignedCrew?: number;
}

interface UseCrewReturn {
  // Data
  crew: CrewMember[];
  departments: CrewDepartment[];
  positions: CrewPosition[];
  assignments: CrewAssignment[];
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Actions
  addCrewMember: (memberData: CrewMemberData) => Promise<CrewMember>;
  updateCrewMember: (id: string, memberData: Partial<CrewMemberData>) => Promise<CrewMember>;
  deleteCrewMember: (id: string) => Promise<void>;
  assignCrewToProduction: (
    crewMemberIds: string[], 
    productionId: string, 
    assignmentData: Partial<CrewAssignment>
  ) => Promise<CrewAssignment[]>;
  getCrewAssignments: (productionId?: string) => Promise<CrewAssignment[]>;
  
  // Utilities
  loadCrewData: () => Promise<void>;
  getCrewStats: () => CrewStats;
  getCrewByDepartment: (departmentId: number) => CrewMember[];
  getActiveCrewMembers: () => CrewMember[];
}

export const useCrew = (projectId?: string): UseCrewReturn => {
  // State
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [departments, setDepartments] = useState<CrewDepartment[]>([]);
  const [positions, setPositions] = useState<CrewPosition[]>([]);
  const [assignments, setAssignments] = useState<CrewAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadCrewData();
  }, []);

  // Load assignments when projectId changes
  useEffect(() => {
    if (projectId) {
      loadAssignments(projectId);
    }
  }, [projectId]);

  const loadCrewData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('👥 Loading crew data...');
      
      const [crewData, departmentsData, positionsData] = await Promise.all([
        crewService.getCrewMembers(),
        crewService.getDepartments(),
        crewService.getPositions()
      ]);
      
      setCrew(crewData);
      setDepartments(departmentsData);
      setPositions(positionsData);
      
      console.log('✅ Crew data loaded:', {
        crew: crewData.length,
        departments: departmentsData.length,
        positions: positionsData.length
      });
      
    } catch (err) {
      console.error('❌ Failed to load crew data:', err);
      setError('Nepodařilo se načíst data štábu');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (productionId: string): Promise<void> => {
    try {
      const assignmentsData = await crewService.getCrewAssignments(productionId);
      setAssignments(assignmentsData);
      console.log(`👥 Assignments loaded for project ${productionId}:`, assignmentsData.length);
    } catch (err) {
      console.error('❌ Failed to load crew assignments:', err);
    }
  };

  // Actions
  const addCrewMember = async (memberData: CrewMemberData): Promise<CrewMember> => {
    try {
      console.log('👥 Adding crew member:', memberData);
      
      const newMember = await crewService.createCrewMember(memberData);
      setCrew(prev => [newMember, ...prev]);
      
      console.log('✅ Crew member added:', newMember);
      return newMember;
    } catch (err) {
      console.error('❌ Failed to add crew member:', err);
      throw err;
    }
  };

  const updateCrewMember = async (
    id: string, 
    memberData: Partial<CrewMemberData>
  ): Promise<CrewMember> => {
    try {
      console.log(`👥 Updating crew member ${id}:`, memberData);
      
      const updatedMember = await crewService.updateCrewMember(id, memberData);
      setCrew(prev => prev.map(member => 
        member.id.toString() === id ? updatedMember : member
      ));
      
      console.log('✅ Crew member updated:', updatedMember);
      return updatedMember;
    } catch (err) {
      console.error('❌ Failed to update crew member:', err);
      throw err;
    }
  };

  const deleteCrewMember = async (id: string): Promise<void> => {
    try {
      console.log(`👥 Deleting crew member ${id}`);
      
      await crewService.deleteCrewMember(id);
      setCrew(prev => prev.filter(member => member.id.toString() !== id));
      
      console.log('✅ Crew member deleted:', id);
    } catch (err) {
      console.error('❌ Failed to delete crew member:', err);
      throw err;
    }
  };

  const assignCrewToProduction = async (
    crewMemberIds: string[], 
    productionId: string, 
    assignmentData: Partial<CrewAssignment>
  ): Promise<CrewAssignment[]> => {
    try {
      console.log('👥 Assigning crew to production:', { 
        crewMemberIds, 
        productionId, 
        assignmentData 
      });
      
      const newAssignments = await crewService.assignCrewToProduction(
        crewMemberIds, 
        productionId, 
        assignmentData
      );
      
      setAssignments(prev => [...prev, ...newAssignments]);
      
      console.log('✅ Crew assigned to production:', newAssignments);
      return newAssignments;
    } catch (err) {
      console.error('❌ Failed to assign crew to production:', err);
      throw err;
    }
  };

  const getCrewAssignments = async (productionId?: string): Promise<CrewAssignment[]> => {
    try {
      const assignmentsData = await crewService.getCrewAssignments(productionId);
      if (productionId) {
        setAssignments(assignmentsData);
      }
      return assignmentsData;
    } catch (err) {
      console.error('❌ Failed to get crew assignments:', err);
      throw err;
    }
  };

  // Utility functions
  const getCrewStats = (): CrewStats => {
    const totalCrew = crew.length;
    const activeCrew = crew.filter(member => member.is_active).length;
    const totalDepartments = departments.length;
    const totalPositions = positions.length;
    const assignedCrew = projectId 
      ? assignments.length 
      : undefined;
    
    return {
      totalCrew,
      activeCrew,
      totalDepartments,
      totalPositions,
      assignedCrew
    };
  };

  const getCrewByDepartment = (departmentId: number): CrewMember[] => {
    return crew.filter(member => 
      member.primary_position?.department?.id === departmentId
    );
  };

  const getActiveCrewMembers = (): CrewMember[] => {
    return crew.filter(member => member.is_active);
  };

  return {
    // Data
    crew,
    departments,
    positions,
    assignments,
    
    // Loading states
    loading,
    error,
    
    // Actions
    addCrewMember,
    updateCrewMember,
    deleteCrewMember,
    assignCrewToProduction,
    getCrewAssignments,
    
    // Utilities
    loadCrewData,
    getCrewStats,
    getCrewByDepartment,
    getActiveCrewMembers
  };
};

export default useCrew;
