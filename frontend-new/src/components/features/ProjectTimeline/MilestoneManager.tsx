import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../ui/Button';

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
  status: string;
}

interface MilestoneManagerProps {
  milestones: TimelineMilestone[];
  tasks: TimelineTask[];
  selectedMilestone: string | null;
  onMilestoneSelect: (milestoneId: string) => void;
  onMilestoneUpdate?: (milestoneId: string, updates: Partial<TimelineMilestone>) => void;
}

export function MilestoneManager({ 
  milestones, 
  tasks,
  selectedMilestone, 
  onMilestoneSelect,
  onMilestoneUpdate
}: MilestoneManagerProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Filtrování milestones
  const filteredMilestones = milestones.filter(milestone => {
    const statusMatch = filterStatus === 'all' || milestone.status === filterStatus;
    const typeMatch = filterType === 'all' || milestone.type === filterType;
    return statusMatch && typeMatch;
  });

  // Řazení podle data
  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: '#3B82F6',
      current: '#F59E0B', 
      completed: '#10B981',
      missed: '#EF4444'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const getImportanceColor = (importance: string) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626'
    };
    return colors[importance as keyof typeof colors] || '#6B7280';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      deadline: '🎯',
      review: '👁️',
      delivery: '📦',
      approval: '✅'
    };
    return icons[type as keyof typeof icons] || '📌';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Dnes';
    if (diffDays === 1) return 'Zítra';
    if (diffDays === -1) return 'Včera';
    if (diffDays > 0) return `Za ${diffDays} dní`;
    if (diffDays < 0) return `Před ${Math.abs(diffDays)} dny`;
    
    return date.toLocaleDateString('cs-CZ');
  };

  const getRelatedTasksInfo = (taskIds: string[]) => {
    const relatedTasks = tasks.filter(task => taskIds.includes(task.id));
    const completed = relatedTasks.filter(task => task.status === 'completed').length;
    return { total: relatedTasks.length, completed, tasks: relatedTasks };
  };

  return (
    <MilestoneManagerContainer>
      {/* Header & Filters */}
      <MilestoneHeader>
        <GlassCard>
          <CardContent>
            <HeaderRow>
              <HeaderInfo>
                <h3>Správa milestones</h3>
                <MilestoneStats>
                  <StatItem>
                    <StatValue>{milestones.filter(m => m.status === 'upcoming').length}</StatValue>
                    <StatLabel>Nadcházející</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{milestones.filter(m => m.status === 'current').length}</StatValue>
                    <StatLabel>Aktuální</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{milestones.filter(m => m.status === 'completed').length}</StatValue>
                    <StatLabel>Dokončené</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{milestones.filter(m => m.status === 'missed').length}</StatValue>
                    <StatLabel>Promeškané</StatLabel>
                  </StatItem>
                </MilestoneStats>
              </HeaderInfo>

              <FilterControls>
                <FilterGroup>
                  <FilterLabel>Status:</FilterLabel>
                  <FilterSelect 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Všechny</option>
                    <option value="upcoming">Nadcházející</option>
                    <option value="current">Aktuální</option>
                    <option value="completed">Dokončené</option>
                    <option value="missed">Promeškané</option>
                  </FilterSelect>
                </FilterGroup>

                <FilterGroup>
                  <FilterLabel>Typ:</FilterLabel>
                  <FilterSelect 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">Všechny typy</option>
                    <option value="deadline">Deadlines</option>
                    <option value="review">Review</option>
                    <option value="delivery">Delivery</option>
                    <option value="approval">Approval</option>
                  </FilterSelect>
                </FilterGroup>
              </FilterControls>
            </HeaderRow>
          </CardContent>
        </GlassCard>
      </MilestoneHeader>

      {/* Milestones List */}
      <MilestonesList>
        {sortedMilestones.map(milestone => {
          const relatedTasksInfo = getRelatedTasksInfo(milestone.relatedTasks);
          const isSelected = selectedMilestone === milestone.id;
          
          return (
            <MilestoneCard 
              key={milestone.id}
              $isSelected={isSelected}
              $status={milestone.status}
              onClick={() => onMilestoneSelect(milestone.id)}
            >
              <MilestoneCardHeader>
                <MilestoneIconContainer>
                  <MilestoneTypeIcon>{getTypeIcon(milestone.type)}</MilestoneTypeIcon>
                  <ImportanceIndicator $color={getImportanceColor(milestone.importance)} />
                </MilestoneIconContainer>

                <MilestoneMainInfo>
                  <MilestoneTitle>{milestone.title}</MilestoneTitle>
                  <MilestoneMeta>
                    <StatusBadge $color={getStatusColor(milestone.status)}>
                      {milestone.status}
                    </StatusBadge>
                    <TypeBadge>{milestone.type}</TypeBadge>
                    <ImportanceBadge $color={getImportanceColor(milestone.importance)}>
                      {milestone.importance}
                    </ImportanceBadge>
                  </MilestoneMeta>
                </MilestoneMainInfo>

                <MilestoneDateInfo>
                  <MilestoneDate>{formatDate(milestone.date)}</MilestoneDate>
                  <MilestoneFullDate>
                    {new Date(milestone.date).toLocaleDateString('cs-CZ')}
                  </MilestoneFullDate>
                </MilestoneDateInfo>
              </MilestoneCardHeader>

              {milestone.description && (
                <MilestoneDescription>{milestone.description}</MilestoneDescription>
              )}

              {/* Related Tasks */}
              {relatedTasksInfo.total > 0 && (
                <RelatedTasks>
                  <RelatedTasksHeader>
                    <RelatedTasksTitle>Související úkoly:</RelatedTasksTitle>
                    <RelatedTasksProgress>
                      {relatedTasksInfo.completed}/{relatedTasksInfo.total} dokončeno
                    </RelatedTasksProgress>
                  </RelatedTasksHeader>
                  
                  <RelatedTasksBar>
                    <TasksProgressBar>
                      <TasksProgressFill 
                        $percentage={(relatedTasksInfo.completed / relatedTasksInfo.total) * 100}
                      />
                    </TasksProgressBar>
                  </RelatedTasksBar>

                  <RelatedTasksList>
                    {relatedTasksInfo.tasks.slice(0, 3).map(task => (
                      <RelatedTaskItem key={task.id}>
                        <TaskStatusIcon $completed={task.status === 'completed'}>
                          {task.status === 'completed' ? '✅' : '⏳'}
                        </TaskStatusIcon>
                        <TaskTitle>{task.title}</TaskTitle>
                      </RelatedTaskItem>
                    ))}
                    
                    {relatedTasksInfo.total > 3 && (
                      <MoreTasksIndicator>
                        +{relatedTasksInfo.total - 3} dalších úkolů
                      </MoreTasksIndicator>
                    )}
                  </RelatedTasksList>
                </RelatedTasks>
              )}

              {/* Deliverables */}
              {milestone.deliverables && milestone.deliverables.length > 0 && (
                <Deliverables>
                  <DeliverablesTitle>Dodávky:</DeliverablesTitle>
                  <DeliverablesList>
                    {milestone.deliverables.map(deliverable => (
                      <DeliverableItem key={deliverable}>
                        📄 {deliverable}
                      </DeliverableItem>
                    ))}
                  </DeliverablesList>
                </Deliverables>
              )}
            </MilestoneCard>
          );
        })}
      </MilestonesList>

      {/* Empty State */}
      {sortedMilestones.length === 0 && (
        <EmptyState>
          <EmptyIcon>🎯</EmptyIcon>
          <EmptyTitle>Žádné milestones</EmptyTitle>
          <EmptyDescription>
            {filterStatus === 'all' && filterType === 'all'
              ? 'Zatím nebyly vytvořeny žádné milestones.'
              : 'Žádné milestones neodpovídají vybraným filtrům.'
            }
          </EmptyDescription>
        </EmptyState>
      )}
    </MilestoneManagerContainer>
  );
}

// Styled Components (stejný pattern jako TaskManager)
const MilestoneManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  height: 100%;
`;

const MilestoneHeader = styled.div``;

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

const MilestoneStats = styled.div`
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

const FilterControls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FilterLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text};
`;

const FilterSelect = styled.select`
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

const MilestonesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  overflow-y: auto;
`;

const MilestoneCard = styled(GlassCard)<{ 
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
      upcoming: '#3B82F6',
      current: '#F59E0B', 
      completed: '#10B981',
      missed: '#EF4444'
    };
    return colors[props.$status as keyof typeof colors] || '#6B7280';
  }};
  border-left-width: 4px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const MilestoneCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const MilestoneIconContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MilestoneTypeIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
`;

const ImportanceIndicator = styled.div<{ $color: string }>`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: ${props => props.$color};
  border: 2px solid white;
  border-radius: 50%;
`;

const MilestoneMainInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MilestoneTitle = styled.h4`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.text};
`;

const MilestoneMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
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

const TypeBadge = styled.span`
  padding: 2px 8px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: capitalize;
`;

const ImportanceBadge = styled.span<{ $color: string }>`
  padding: 2px 8px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
`;

const MilestoneDateInfo = styled.div`
  text-align: right;
`;

const MilestoneDate = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
`;

const MilestoneFullDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const MilestoneDescription = styled.p`
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const RelatedTasks = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const RelatedTasksHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const RelatedTasksTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const RelatedTasksProgress = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const RelatedTasksBar = styled.div`
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const TasksProgressBar = styled.div`
  height: 4px;
  background: ${props => props.theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
`;

const TasksProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.theme.colors.primary};
  transition: width ${props => props.theme.transitions.normal};
`;

const RelatedTasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const RelatedTaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const TaskStatusIcon = styled.span<{ $completed: boolean }>`
  opacity: ${props => props.$completed ? 1 : 0.5};
`;

const TaskTitle = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text};
`;

const MoreTasksIndicator = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  padding: ${props => props.theme.spacing.xs};
  border-top: 1px dashed ${props => props.theme.colors.border};
`;

const Deliverables = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const DeliverablesTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const DeliverablesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const DeliverableItem = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const EmptyTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.text};
`;

const EmptyDescription = styled.p`
  margin: 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;
