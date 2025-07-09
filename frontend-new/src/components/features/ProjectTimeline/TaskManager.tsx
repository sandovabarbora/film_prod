import React, { useState } from 'react';
import styled from 'styled-components';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface TimelineTask {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dependencies: string[];
  category: 'pre_production' | 'production' | 'post_production' | 'admin';
  estimatedCost?: number;
  actualCost?: number;
  resources: string[];
  tags: string[];
}

interface TimelineMilestone {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'review' | 'delivery' | 'approval';
  status: 'upcoming' | 'current' | 'completed' | 'missed';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

interface TaskManagerProps {
  tasks: TimelineTask[];
  milestones: TimelineMilestone[];
  selectedTask: string | null;
  onTaskSelect: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<TimelineTask>) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

const TaskContainer = styled(Card)`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const TaskHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const TaskTitle = styled.h3`
  color: #fff;
  margin: 0;
  font-size: 1.25rem;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TaskItem = styled.div<{ $selected?: boolean }>`
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

const TaskItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const TaskItemTitle = styled.div`
  color: #fff;
  font-weight: 500;
  font-size: 1rem;
`;

const TaskStatus = styled.div<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return 'rgba(34, 197, 94, 0.2)';
      case 'in_progress': return 'rgba(59, 130, 246, 0.2)';
      case 'delayed': return 'rgba(245, 158, 11, 0.2)';
      case 'blocked': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(156, 163, 175, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#22c55e';
      case 'in_progress': return '#3b82f6';
      case 'delayed': return '#f59e0b';
      case 'blocked': return '#ef4444';
      default: return '#9ca3af';
    }
  }};
`;

const TaskMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  color: #8b8b8b;
  font-size: 0.875rem;
`;

const TaskProgress = styled.div`
  margin-top: 1rem;
`;

const ProgressBar = styled.div<{ $progress: number; $status: string }>`
  height: 8px;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
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

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #8b8b8b;
`;

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  milestones,
  selectedTask,
  onTaskSelect,
  onTaskUpdate,
  getStatusColor,
  getPriorityColor
}) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'not_started': 'Nezapočato',
      'in_progress': 'Probíhá',
      'completed': 'Dokončeno',
      'delayed': 'Opožděno',
      'blocked': 'Blokováno'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'pre_production': 'Pre-produkce',
      'production': 'Produkce',
      'post_production': 'Post-produkce',
      'admin': 'Administrativa'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <TaskContainer>
      <TaskHeader>
        <TaskTitle>📋 Úkoly projektu</TaskTitle>
      </TaskHeader>

      <TaskList>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            $selected={selectedTask === task.id}
            onClick={() => onTaskSelect(task.id)}
          >
            <TaskItemHeader>
              <TaskItemTitle>{task.title}</TaskItemTitle>
              <TaskStatus $status={task.status}>
                {getStatusLabel(task.status)}
              </TaskStatus>
            </TaskItemHeader>
            
            <TaskMeta>
              <div>📅 {formatDate(task.startDate)} - {formatDate(task.endDate)}</div>
              <div>👤 {task.assignee || 'Nepřiřazeno'}</div>
              <div>🏷️ {getCategoryLabel(task.category)}</div>
            </TaskMeta>

            {task.description && (
              <div style={{ color: '#8b8b8b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {task.description}
              </div>
            )}

            <TaskProgress>
              <ProgressBar $progress={task.progress} $status={task.status} />
              <ProgressLabel>
                <span>Progress</span>
                <span>{task.progress}%</span>
              </ProgressLabel>
            </TaskProgress>
          </TaskItem>
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
            <div>Žádné úkoly zatím nejsou vytvořené</div>
          </div>
        )}
      </TaskList>
    </TaskContainer>
  );
};

export default TaskManager;
