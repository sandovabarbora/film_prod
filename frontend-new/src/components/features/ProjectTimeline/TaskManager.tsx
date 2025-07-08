import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../ui/Button';

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

type SortField = 'title' | 'startDate' | 'priority' | 'progress' | 'assignee';
type SortOrder = 'asc' | 'desc';

export function TaskManager({ 
  tasks, 
  milestones,
  selectedTask, 
  onTaskSelect,
  onTaskUpdate,
  getStatusColor,
  getPriorityColor
}: TaskManagerProps) {
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [editingTask, setEditingTask] = useState<string | null>(null);

  // Řazení úkolů
  const sortedTasks = [...tasks].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    
    if (sortField === 'startDate') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    if (sortField === 'priority') {
      const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      aVal = priorityOrder[aVal as keyof typeof priorityOrder];
      bVal = priorityOrder[bVal as keyof typeof priorityOrder];
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortOrder === 'asc' ? result : -result;
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleProgressUpdate = (taskId: string, newProgress: number) => {
    if (onTaskUpdate) {
      let newStatus = 'in_progress';
      if (newProgress === 0) newStatus = 'not_started';
      if (newProgress === 100) newStatus = 'completed';
      
      onTaskUpdate(taskId, { 
        progress: newProgress,
        status: newStatus as any
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      pre_production: '📝',
      production: '🎥',
      post_production: '✂️',
      admin: '📄'
    };
    return icons[category as keyof typeof icons] || '📋';
  };

  const getUpcomingMilestones = () => {
    const today = new Date();
    const upcoming = milestones.filter(m => {
      const milestoneDate = new Date(m.date);
      return milestoneDate > today && milestoneDate <= new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    });
    return upcoming.slice(0, 3);
  };

  return (
    <TaskManagerContainer>
      {/* Header Controls */}
      <TaskManagerHeader>
        <GlassCard>
          <CardContent>
            <HeaderRow>
              <HeaderInfo>
                <h3>Správa úkolů</h3>
                <TaskStats>
                  <StatItem>
                    <StatValue>{tasks.length}</StatValue>
                    <StatLabel>Celkem úkolů</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{tasks.filter(t => t.status === 'completed').length}</StatValue>
                    <StatLabel>Dokončeno</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{tasks.filter(t => t.status === 'delayed').length}</StatValue>
                    <StatLabel>Zpožděno</StatLabel>
                  </StatItem>
                </TaskStats>
              </HeaderInfo>

              <HeaderActions>
                <SortControls>
                  <SortLabel>Řadit podle:</SortLabel>
                  <SortSelect 
                    value={sortField} 
                    onChange={(e) => handleSort(e.target.value as SortField)}
                  >
                    <option value="startDate">Datum začátku</option>
                    <option value="title">Název</option>
                    <option value="priority">Priorita</option>
                    <option value="progress">Pokrok</option>
                    <option value="assignee">Přiřazeno</option>
                  </SortSelect>
                  <SortOrderButton 
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </SortOrderButton>
                </SortControls>
              </HeaderActions>
            </HeaderRow>
          </CardContent>
        </GlassCard>
      </TaskManagerHeader>

      <TaskManagerContent>
        {/* Upcoming Milestones Sidebar */}
        <MilestonesSidebar>
          <GlassCard>
            <CardHeader>
              <h4>Nadcházející milestones</h4>
            </CardHeader>
            <CardContent>
              <MilestonesList>
                {getUpcomingMilestones().map(milestone => (
                  <MilestoneItem key={milestone.id}>
                    <MilestoneIcon $type={milestone.type}>
                      {milestone.type === 'deadline' && '🎯'}
                      {milestone.type === 'review' && '👁️'}
                      {milestone.type === 'delivery' && '📦'}
                      {milestone.type === 'approval' && '✅'}
                    </MilestoneIcon>
                    <MilestoneInfo>
                      <MilestoneTitle>{milestone.title}</MilestoneTitle>
                      <MilestoneDate>{formatDate(milestone.date)}</MilestoneDate>
                    </MilestoneInfo>
                  </MilestoneItem>
                ))}
                
                {getUpcomingMilestones().length === 0 && (
                  <EmptyMilestones>
                    Žádné nadcházející milestones
                  </EmptyMilestones>
                )}
              </MilestonesList>
            </CardContent>
          </GlassCard>
        </MilestonesSidebar>

        {/* Tasks List */}
        <TasksListContainer>
          <TasksList>
            {sortedTasks.map(task => (
              <TaskCard 
                key={task.id}
                $isSelected={selectedTask === task.id}
                $status={task.status}
                onClick={() => onTaskSelect(task.id)}
              >
                <TaskCardHeader>
                  <TaskTitle>{task.title}</TaskTitle>
                  <TaskActions>
                    <TaskEditButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task.id);
                      }}
                    >
                      ✏️
                    </TaskEditButton>
                  </TaskActions>
                </TaskCardHeader>

                {task.description && (
                  <TaskDescription>{task.description}</TaskDescription>
                )}

                <TaskMeta>
                  <MetaRow>
                    <MetaItem>
                      <MetaIcon>{getCategoryIcon(task.category)}</MetaIcon>
                      <MetaLabel>{task.category.replace('_', ' ')}</MetaLabel>
                    </MetaItem>
                    
                    <MetaItem>
                      <StatusBadge $color={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </StatusBadge>
                    </MetaItem>
                    
                    <MetaItem>
                      <PriorityBadge $color={getPriorityColor(task.priority)}>
                        {task.priority}
                      </PriorityBadge>
                    </MetaItem>
                  </MetaRow>

                  <MetaRow>
                    <MetaItem>
                      <MetaIcon>📅</MetaIcon>
                      <MetaLabel>{formatDate(task.startDate)} - {formatDate(task.endDate)}</MetaLabel>
                    </MetaItem>
                    
                    {task.assignee && (
                      <MetaItem>
                        <MetaIcon>👤</MetaIcon>
                        <MetaLabel>{task.assignee}</MetaLabel>
                      </MetaItem>
                    )}
                    
                    <MetaItem>
                      <MetaIcon>⏰</MetaIcon>
                      <MetaLabel>{task.duration} dní</MetaLabel>
                    </MetaItem>
                  </MetaRow>
                </TaskMeta>

                {/* Progress Section */}
                <TaskProgress>
                  <ProgressHeader>
                    <ProgressLabel>Pokrok</ProgressLabel>
                    <ProgressValue>{task.progress}%</ProgressValue>
                  </ProgressHeader>
                  
                  <ProgressSlider>
                    <ProgressBar>
                      <ProgressFill 
                        $percentage={task.progress}
                        $color={getStatusColor(task.status)}
                      />
                    </ProgressBar>
                    
                    {editingTask === task.id && (
                      <ProgressInput
                        type="range"
                        min="0"
                        max="100"
                        value={task.progress}
                        onChange={(e) => handleProgressUpdate(task.id, Number(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </ProgressSlider>
                </TaskProgress>

                {/* Dependencies */}
                {task.dependencies.length > 0 && (
                  <TaskDependencies>
                    <DependenciesLabel>Závislosti:</DependenciesLabel>
                    <DependenciesList>
                      {task.dependencies.map(depId => {
                        const depTask = tasks.find(t => t.id === depId);
                        return depTask ? (
                          <DependencyItem key={depId}>
                            {depTask.title}
                          </DependencyItem>
                        ) : null;
                      })}
                    </DependenciesList>
                  </TaskDependencies>
                )}

                {/* Tags */}
                {task.tags.length > 0 && (
                  <TaskTags>
                    {task.tags.map(tag => (
                      <TaskTag key={tag}>{tag}</TaskTag>
                    ))}
                  </TaskTags>
                )}

                {/* Budget Info */}
                {(task.estimatedCost || task.actualCost) && (
                  <TaskBudget>
                    {task.estimatedCost && (
                      <BudgetItem>
                        <BudgetLabel>Plánováno:</BudgetLabel>
                        <BudgetValue>{task.estimatedCost.toLocaleString()} Kč</BudgetValue>
                      </BudgetItem>
                    )}
                    {task.actualCost && (
                      <BudgetItem>
                        <BudgetLabel>Skutečnost:</BudgetLabel>
                        <BudgetValue>{task.actualCost.toLocaleString()} Kč</BudgetValue>
                      </BudgetItem>
                    )}
                  </TaskBudget>
                )}
              </TaskCard>
            ))}
          </TasksList>

          {editingTask && (
            <EditingOverlay onClick={() => setEditingTask(null)}>
              <EditingHint>
                Klikněte mimo nebo změňte pokrok pomocí slideru
              </EditingHint>
            </EditingOverlay>
          )}
        </TasksListContainer>
      </TaskManagerContent>
    </TaskManagerContainer>
  );
}

// Styled Components
const TaskManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  height: 100%;
`;

const TaskManagerHeader = styled.div``;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderInfo = styled.div``;

const TaskStats = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.sm};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const HeaderActions = styled.div``;

const SortControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SortLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text};
`;

const SortSelect = styled.select`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SortOrderButton = styled.button`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.lg};
  
  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const TaskManagerContent = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: ${props => props.theme.spacing.lg};
  flex: 1;
  min-height: 0;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MilestonesSidebar = styled.div`
  @media (max-width: 1024px) {
    order: 2;
  }
`;

const MilestonesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const MilestoneItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const MilestoneIcon = styled.div<{ $type: string }>`
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const MilestoneInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MilestoneTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MilestoneDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyMilestones = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  padding: ${props => props.theme.spacing.lg};
`;

const TasksListContainer = styled.div`
  position: relative;
  overflow-y: auto;
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const TaskCard = styled(GlassCard)<{ 
  $isSelected: boolean; 
  $status: string; 
}>`
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  border: 2px solid ${props => props.$isSelected 
    ? props.theme.colors.primary 
    : 'transparent'
  };
  border-left-color: ${props => {
    const colors = {
      not_started: '#6B7280',
      in_progress: '#3B82F6',
      completed: '#10B981',
      delayed: '#F59E0B',
      blocked: '#EF4444'
    };
    return colors[props.$status as keyof typeof colors] || '#6B7280';
  }};
  border-left-width: 4px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const TaskCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const TaskTitle = styled.h4`
  margin: 0;
  color: ${props => props.theme.colors.text};
  flex: 1;
`;

const TaskActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const TaskEditButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: background ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const TaskDescription = styled.p`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const TaskMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const MetaIcon = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const MetaLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const StatusBadge = styled.span<{ $color: string }>`
  padding: 2px 8px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: capitalize;
`;

const PriorityBadge = styled.span<{ $color: string }>`
  padding: 2px 8px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
`;

const TaskProgress = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ProgressLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text};
`;

const ProgressValue = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.primary};
`;

const ProgressSlider = styled.div`
  position: relative;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: ${props => props.theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color};
  transition: width ${props => props.theme.transitions.normal};
`;

const ProgressInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 8px;
  opacity: 0;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: ${props => props.theme.colors.primary};
    border-radius: 50%;
    cursor: pointer;
    opacity: 1;
  }
`;

const TaskDependencies = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DependenciesLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DependenciesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
`;

const DependencyItem = styled.span`
  padding: 2px 6px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const TaskTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const TaskTag = styled.span`
  padding: 2px 8px;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const TaskBudget = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const BudgetItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const BudgetLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const BudgetValue = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const EditingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 100;
  cursor: pointer;
`;

const EditingHint = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  color: ${props => props.theme.colors.text};
  text-align: center;
`;
