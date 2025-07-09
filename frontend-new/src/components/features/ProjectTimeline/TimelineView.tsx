import React, { useMemo, useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card } from '../../ui/Card';

interface TimelineTask {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dependencies: string[];
  category: 'pre_production' | 'production' | 'post_production' | 'admin';
}

interface TimelineMilestone {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'review' | 'delivery' | 'approval';
  status: 'upcoming' | 'current' | 'completed' | 'missed';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

interface TimelineViewProps {
  tasks: TimelineTask[];
  milestones: TimelineMilestone[];
  timeScale: 'days' | 'weeks' | 'months';
  selectedTask: string | null;
  selectedMilestone: string | null;
  showDependencies: boolean;
  onTaskSelect: (taskId: string) => void;
  onMilestoneSelect: (milestoneId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<TimelineTask>) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  startDate: string;
  endDate: string;
}

const TimelineContainer = styled(Card)`
  padding: 2rem;
  height: 600px;
  overflow: auto;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const TimelineContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TaskRow = styled.div<{ $selected?: boolean }>`
  display: grid;
  grid-template-columns: 200px 1fr 100px;
  gap: 1rem;
  padding: 1rem;
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

const TaskInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TaskTitle = styled.div`
  color: #fff;
  font-weight: 500;
  font-size: 0.875rem;
`;

const TaskMeta = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
`;

const TaskBar = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  position: relative;
`;

const ProgressBar = styled.div<{ $progress: number; $status: string }>`
  height: 20px;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$progress}%;
    background: ${props => {
      switch (props.$status) {
        case 'completed': return '#22c55e';
        case 'in_progress': return '#3b82f6';
        case 'delayed': return '#f59e0b';
        case 'blocked': return '#ef4444';
        default: return '#6b7280';
      }
    }};
    transition: width 0.3s ease;
  }
`;

const TaskProgress = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
  text-align: center;
`;

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  milestones,
  timeScale,
  selectedTask,
  selectedMilestone,
  showDependencies,
  onTaskSelect,
  onMilestoneSelect,
  onTaskUpdate,
  getStatusColor,
  getPriorityColor,
  startDate,
  endDate
}) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <TimelineContainer>
      <TimelineContent>
        <div style={{ color: '#8b8b8b', fontSize: '0.875rem', marginBottom: '1rem' }}>
          📊 Timeline View: {tasks.length} úkolů
        </div>
        
        {tasks.map(task => (
          <TaskRow 
            key={task.id} 
            $selected={selectedTask === task.id}
            onClick={() => onTaskSelect(task.id)}
          >
            <TaskInfo>
              <TaskTitle>{task.title}</TaskTitle>
              <TaskMeta>
                {formatDate(task.startDate)} - {formatDate(task.endDate)}
              </TaskMeta>
              <TaskMeta>
                {task.assignee} • {task.category}
              </TaskMeta>
            </TaskInfo>
            
            <TaskBar>
              <ProgressBar 
                $progress={task.progress} 
                $status={task.status}
              />
            </TaskBar>
            
            <TaskProgress>
              {task.progress}%
            </TaskProgress>
          </TaskRow>
        ))}

        {tasks.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#8b8b8b', 
            padding: '3rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px dashed rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
            <div>Žádné úkoly zatím nejsou naplánované</div>
          </div>
        )}
      </TimelineContent>
    </TimelineContainer>
  );
};

export default TimelineView;
