import React, { useState, useEffect } from 'react';
import CrewAddModal from '../features/CrewManagement/CrewAddModal';
import type { CrewMember, Department, Position, CrewMemberFormData, DepartmentWithPositions } from '../../types';

interface CrewEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: any) => Promise<void>;
  crewMember: CrewMember | null;
  departments: Department[];
  positions: Position[];
}

const CrewEditModal: React.FC<CrewEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  crewMember,
  departments,
  positions
}) => {
  const [departmentsWithPositions, setDepartmentsWithPositions] = useState<DepartmentWithPositions[]>([]);

  // Vytvořit departments with positions z props
  useEffect(() => {
    if (departments.length > 0 && positions.length > 0) {
      console.log('🔧 Building departments with positions from props');
      console.log('📊 Departments:', departments.length, 'Positions:', positions.length);
      
      const mapped = departments.map(dept => {
        const deptPositions = positions.filter(pos => 
          pos.department_name === dept.name || 
          (pos.department && pos.department.id === dept.id)
        );
        
        console.log(`🏢 ${dept.name}: ${deptPositions.length} positions`);
        
        return {
          ...dept,
          positions: deptPositions.map(pos => ({
            id: pos.id,
            title: pos.title,
            level: pos.level,
            daily_rate_min: pos.daily_rate_min,
            daily_rate_max: pos.daily_rate_max
          }))
        };
      });
      
      setDepartmentsWithPositions(mapped);
    }
  }, [departments, positions]);

  const getInitialData = (): CrewMemberFormData | undefined => {
    if (!crewMember) return undefined;
    
    let positionId: string | undefined;
    
    if (crewMember.primary_position?.id) {
      positionId = crewMember.primary_position.id;
    } else if (crewMember.primary_position_title && positions.length > 0) {
      const foundPosition = positions.find(p => p.title === crewMember.primary_position_title);
      positionId = foundPosition?.id;
    }
    
    return {
      first_name: crewMember.first_name || '',
      last_name: crewMember.last_name || '',
      email: crewMember.email || '',
      phone_primary: crewMember.phone_primary || '',
      emergency_contact_name: crewMember.emergency_contact_name || '',
      emergency_contact_phone: crewMember.emergency_contact_phone || '',
      primary_position_id: positionId,
      daily_rate: crewMember.daily_rate || 1500,
      union_member: crewMember.union_member || false,
      has_vehicle: crewMember.has_vehicle || true,
      notes: crewMember.notes || ''
    };
  };
  
  return (
    <CrewAddModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSave}
      initialData={getInitialData()}
      departmentsWithPositions={departmentsWithPositions}
    />
  );
};

export default CrewEditModal;
export { CrewEditModal };
