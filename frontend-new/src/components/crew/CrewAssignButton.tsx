import React from 'react';
import styled from 'styled-components';
import { UserCheck, UserX } from 'lucide-react';
import Button from '../ui/Button';
import type { CrewMember } from '../../types';

interface CrewAssignButtonProps {
  crewMember: CrewMember;
  project: any;
  isAssigned?: boolean;
  onAssign: (member: CrewMember) => Promise<void>;
  onUnassign: (member: CrewMember) => Promise<void>;
}

const CrewAssignButton: React.FC<CrewAssignButtonProps> = ({
  crewMember,
  project,
  isAssigned,
  onAssign,
  onUnassign
}) => {
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (isAssigned) {
        await onUnassign(crewMember);
      } else {
        await onAssign(crewMember);
      }
    } catch (error) {
      console.error('Failed to assign/unassign crew:', error);
    }
  };

  return (
    <Button
      variant={isAssigned ? "secondary" : "primary"}
      size="sm"
      icon={isAssigned ? <UserX size={14} /> : <UserCheck size={14} />}
      onClick={handleClick}
    >
      {isAssigned ? 'Unassign' : 'Assign'}
    </Button>
  );
};

export default CrewAssignButton;
