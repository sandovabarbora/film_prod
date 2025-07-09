import React, { useState } from 'react';
import styled from 'styled-components';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface TimelineMilestone {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'deadline' | 'review' | 'delivery' | 'approval';
  status: 'upcoming' | 'current' | 'completed' | 'missed';
  importance: 'low' | 'medium' | 'high' | 'critical';
  relatedTasks: string[];
  deliverables?: string[];
}

interface TimelineTask {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
}

interface MilestoneManagerProps {
  milestones: TimelineMilestone[];
  tasks: TimelineTask[];
  selectedMilestone: string | null;
  onMilestoneSelect: (milestoneId: string) => void;
  onMilestoneUpdate?: (milestoneId: string, updates: Partial<TimelineMilestone>) => void;
}

const MilestoneContainer = styled(Card)`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const MilestoneHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: 2rem;
`;

const MilestoneTitle = styled.h3`
  color: #fff;
  margin: 0;
  font-size: 1.25rem;
`;

const MilestoneList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MilestoneItem = styled.div<{ $selected?: boolean; $status?: string }>`
  padding: 1.5rem;
  background: ${props => props.$selected 
    ? 'rgba(103, 126, 234, 0.2)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.$selected 
    ? 'rgba(103, 126, 234, 0.4)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MilestoneItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const MilestoneItemTitle = styled.div`
  color: #fff;
  font-weight: 500;
  font-size: 1rem;
`;

const MilestoneStatus = styled.div<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return 'rgba(34, 197, 94, 0.2)';
      case 'current': return 'rgba(59, 130, 246, 0.2)';
      case 'upcoming': return 'rgba(156, 163, 175, 0.2)';
      case 'missed': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(156, 163, 175, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#22c55e';
      case 'current': return '#3b82f6';
      case 'upcoming': return '#9ca3af';
      case 'missed': return '#ef4444';
      default: return '#9ca3af';
    }
  }};
`;

const MilestoneDate = styled.div`
  color: #8b8b8b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const MilestoneDescription = styled.div`
  color: #8b8b8b;
  font-size: 0.875rem;
`;

export const MilestoneManager: React.FC<MilestoneManagerProps> = ({
  milestones,
  tasks,
  selectedMilestone,
  onMilestoneSelect,
  onMilestoneUpdate
}) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'upcoming': 'Nadcházející',
      'current': 'Aktuální',
      'completed': 'Dokončeno',
      'missed': 'Zmeškaný'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <MilestoneContainer>
      <MilestoneHeader>
        <MilestoneTitle>🎯 Milníky projektu</MilestoneTitle>
      </MilestoneHeader>

      <MilestoneList>
        {milestones.map(milestone => (
          <MilestoneItem
            key={milestone.id}
            $selected={selectedMilestone === milestone.id}
            $status={milestone.status}
            onClick={() => onMilestoneSelect(milestone.id)}
          >
            <MilestoneItemHeader>
              <MilestoneItemTitle>{milestone.title}</MilestoneItemTitle>
              <MilestoneStatus $status={milestone.status}>
                {getStatusLabel(milestone.status)}
              </MilestoneStatus>
            </MilestoneItemHeader>
            
            <MilestoneDate>
              📅 {formatDate(milestone.date)}
            </MilestoneDate>
            
            {milestone.description && (
              <MilestoneDescription>
                {milestone.description}
              </MilestoneDescription>
            )}
            
            {milestone.deliverables && milestone.deliverables.length > 0 && (
              <div style={{ marginTop: '0.5rem', color: '#8b8b8b', fontSize: '0.75rem' }}>
                📦 {milestone.deliverables.length} deliverables
              </div>
            )}
          </MilestoneItem>
        ))}

        {milestones.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#8b8b8b', 
            padding: '3rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px dashed rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
            <div>Žádné milníky zatím nejsou definované</div>
          </div>
        )}
      </MilestoneList>
    </MilestoneContainer>
  );
};

export default MilestoneManager;
