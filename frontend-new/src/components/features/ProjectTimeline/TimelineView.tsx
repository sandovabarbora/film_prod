import React, { useMemo, useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card, GlassCard } from '../../ui/Card';

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

type TimeScale = 'days' | 'weeks' | 'months';

export function TimelineView({ 
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
}: TimelineViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Výpočet timeline dat
  const timelineData = useMemo(() => {
    const projectStart = new Date(startDate);
    const projectEnd = new Date(endDate);
    const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generování časových jednotek podle měřítka
    const timeUnits = generateTimeUnits(projectStart, projectEnd, timeScale);
    
    // Mapování tasků na pozice
    const taskPositions = tasks.map(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      const startOffset = Math.ceil((taskStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
      const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...task,
        startOffset,
        duration: Math.max(1, duration),
        endOffset: startOffset + duration
      };
    });

    // Mapování milestones na pozice
    const milestonePositions = milestones.map(milestone => {
      const milestoneDate = new Date(milestone.date);
      const offset = Math.ceil((milestoneDate.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...milestone,
        offset
      };
    });

    return {
      totalDays,
      timeUnits,
      taskPositions,
      milestonePositions,
      projectStart,
      projectEnd
    };
  }, [tasks, milestones, startDate, endDate, timeScale]);

  const handleTaskDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleTaskDrop = (taskId: string, newStartOffset: number) => {
    if (onTaskUpdate && draggedTask === taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const newStartDate = new Date(timelineData.projectStart);
        newStartDate.setDate(newStartDate.getDate() + newStartOffset);
        
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + task.duration);
        
        onTaskUpdate(taskId, {
          startDate: newStartDate.toISOString(),
          endDate: newEndDate.toISOString()
        });
      }
    }
    setDraggedTask(null);
  };

  const getTaskRowIndex = (taskId: string) => {
    return tasks.findIndex(t => t.id === taskId);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      pre_production: '#8B5CF6',
      production: '#EF4444', 
      post_production: '#10B981',
      admin: '#6B7280'
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  return (
    <TimelineContainer ref={containerRef}>
      <GlassCard>
        <TimelineHeader>
          <h3>Gantt Chart</h3>
          <TimelineInfo>
            {tasks.length} úkolů, {milestones.length} milestones
          </TimelineInfo>
        </TimelineHeader>

        <TimelineContent>
          {/* Task List Side Panel */}
          <TaskListPanel>
            <TaskListHeader>
              <TaskListTitle>Úkoly</TaskListTitle>
            </TaskListHeader>
            
            <TaskList>
              {timelineData.taskPositions.map((task, index) => (
                <TaskRow 
                  key={task.id}
                  $isSelected={selectedTask === task.id}
                  $category={task.category}
                  onClick={() => onTaskSelect(task.id)}
                >
                  <TaskInfo>
                    <TaskTitle>{task.title}</TaskTitle>
                    <TaskMeta>
                      <TaskStatus $color={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </TaskStatus>
                      <TaskPriority $color={getPriorityColor(task.priority)}>
                        {task.priority}
                      </TaskPriority>
                      {task.assignee && (
                        <TaskAssignee>👤 {task.assignee}</TaskAssignee>
                      )}
                    </TaskMeta>
                  </TaskInfo>
                  
                  <TaskProgress>
                    <ProgressBar>
                      <ProgressFill $percentage={task.progress} />
                    </ProgressBar>
                    <ProgressValue>{task.progress}%</ProgressValue>
                  </TaskProgress>
                </TaskRow>
              ))}
            </TaskList>
          </TaskListPanel>

          {/* Timeline Chart */}
          <TimelineChart>
            {/* Time Scale Header */}
            <TimeScaleHeader>
              {timelineData.timeUnits.map((unit, index) => (
                <TimeUnit key={index} $scale={timeScale}>
                  {formatTimeUnit(unit, timeScale)}
                </TimeUnit>
              ))}
            </TimeScaleHeader>

            {/* Chart Grid */}
            <ChartGrid>
              {/* Grid Lines */}
              <GridLines>
                {timelineData.timeUnits.map((_, index) => (
                  <GridLine key={index} />
                ))}
              </GridLines>

              {/* Task Bars */}
              <TaskBars>
                {timelineData.taskPositions.map((task, rowIndex) => (
                  <TaskBarContainer key={task.id} $rowIndex={rowIndex}>
                    <TaskBar
                      $startOffset={task.startOffset}
                      $duration={task.duration}
                      $totalDays={timelineData.totalDays}
                      $color={getStatusColor(task.status)}
                      $isSelected={selectedTask === task.id}
                      $isDragging={draggedTask === task.id}
                      draggable
                      onDragStart={() => handleTaskDragStart(task.id)}
                      onDragEnd={() => setDraggedTask(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskSelect(task.id);
                      }}
                    >
                      <TaskBarProgress 
                        $percentage={task.progress}
                        $color={getStatusColor(task.status)}
                      />
                      
                      <TaskBarContent>
                        <TaskBarTitle>{task.title}</TaskBarTitle>
                        <TaskBarDuration>{task.duration}d</TaskBarDuration>
                      </TaskBarContent>

                      {/* Priority Indicator */}
                      {task.priority === 'critical' && (
                        <PriorityIndicator $color={getPriorityColor(task.priority)} />
                      )}
                    </TaskBar>

                    {/* Dependencies */}
                    {showDependencies && task.dependencies.length > 0 && (
                      <Dependencies>
                        {task.dependencies.map(depId => {
                          const depTask = timelineData.taskPositions.find(t => t.id === depId);
                          if (!depTask) return null;
                          
                          const depRowIndex = getTaskRowIndex(depId);
                          return (
                            <DependencyLine
                              key={depId}
                              $fromRow={depRowIndex}
                              $toRow={rowIndex}
                              $fromEnd={depTask.endOffset}
                              $toStart={task.startOffset}
                              $totalDays={timelineData.totalDays}
                            />
                          );
                        })}
                      </Dependencies>
                    )}
                  </TaskBarContainer>
                ))}
              </TaskBars>

              {/* Milestones */}
              <Milestones>
                {timelineData.milestonePositions.map(milestone => (
                  <MilestoneMarker
                    key={milestone.id}
                    $offset={milestone.offset}
                    $totalDays={timelineData.totalDays}
                    $type={milestone.type}
                    $status={milestone.status}
                    $isSelected={selectedMilestone === milestone.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMilestoneSelect(milestone.id);
                    }}
                    title={`${milestone.title} - ${new Date(milestone.date).toLocaleDateString('cs-CZ')}`}
                  >
                    <MilestoneIcon $type={milestone.type}>
                      {getMilestoneIcon(milestone.type)}
                    </MilestoneIcon>
                    <MilestoneLabel>{milestone.title}</MilestoneLabel>
                  </MilestoneMarker>
                ))}
              </Milestones>

              {/* Today Indicator */}
              <TodayIndicator 
                $offset={calculateTodayOffset(timelineData.projectStart)}
                $totalDays={timelineData.totalDays}
              />
            </ChartGrid>
          </TimelineChart>
        </TimelineContent>
      </GlassCard>
    </TimelineContainer>
  );
}

// Helper functions
function generateTimeUnits(start: Date, end: Date, scale: TimeScale): Date[] {
  const units: Date[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    units.push(new Date(current));
    
    switch (scale) {
      case 'days':
        current.setDate(current.getDate() + 1);
        break;
      case 'weeks':
        current.setDate(current.getDate() + 7);
        break;
      case 'months':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }
  
  return units;
}

function formatTimeUnit(date: Date, scale: TimeScale): string {
  switch (scale) {
    case 'days':
      return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
    case 'weeks':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1);
      return `T${getWeekNumber(weekStart)}`;
    case 'months':
      return date.toLocaleDateString('cs-CZ', { month: 'short', year: 'numeric' });
    default:
      return '';
  }
}

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((((date.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7);
}

function getMilestoneIcon(type: string): string {
  const icons = {
    deadline: '🎯',
    review: '👁️',
    delivery: '📦',
    approval: '✅'
  };
  return icons[type as keyof typeof icons] || '📌';
}

function calculateTodayOffset(projectStart: Date): number {
  const today = new Date();
  return Math.ceil((today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
}

// Styled Components
const TimelineContainer = styled.div`
  height: 600px;
  overflow: hidden;
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const TimelineInfo = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const TimelineContent = styled.div`
  display: flex;
  height: 540px;
`;

const TaskListPanel = styled.div`
  width: 300px;
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
`;

const TaskListHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
`;

const TaskListTitle = styled.h4`
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const TaskList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const TaskRow = styled.div<{ 
  $isSelected: boolean; 
  $category: string; 
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => props.$isSelected 
    ? props.theme.colors.surface 
    : 'transparent'
  };
  border-left: 3px solid ${props => {
    const colors = {
      pre_production: '#8B5CF6',
      production: '#EF4444', 
      post_production: '#10B981',
      admin: '#6B7280'
    };
    return colors[props.$category as keyof typeof colors] || '#6B7280';
  }};

  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const TaskInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TaskTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  flex-wrap: wrap;
`;

const TaskStatus = styled.span<{ $color: string }>`
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  font-size: ${props => props.theme.typography.fontSize.xs};
  text-transform: capitalize;
`;

const TaskPriority = styled.span<{ $color: string }>`
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  font-size: ${props => props.theme.typography.fontSize.xs};
  text-transform: uppercase;
`;

const TaskAssignee = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const TaskProgress = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.xs};
  min-width: 60px;
`;

const ProgressBar = styled.div`
  width: 50px;
  height: 4px;
  background: ${props => props.theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.theme.colors.primary};
  transition: width ${props => props.theme.transitions.normal};
`;

const ProgressValue = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const TimelineChart = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
`;

const TimeScaleHeader = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
  min-height: 40px;
`;

const TimeUnit = styled.div<{ $scale: TimeScale }>`
  flex: 1;
  min-width: ${props => {
    switch (props.$scale) {
      case 'days': return '40px';
      case 'weeks': return '80px';
      case 'months': return '120px';
      default: return '60px';
    }
  }};
  padding: ${props => props.theme.spacing.sm};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
`;

const ChartGrid = styled.div`
  position: relative;
  flex: 1;
  overflow-y: auto;
`;

const GridLines = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  z-index: 1;
`;

const GridLine = styled.div`
  flex: 1;
  border-right: 1px solid ${props => props.theme.colors.border};
  opacity: 0.3;
`;

const TaskBars = styled.div`
  position: relative;
  z-index: 2;
`;

const TaskBarContainer = styled.div<{ $rowIndex: number }>`
  position: relative;
  height: 60px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const TaskBar = styled.div<{
  $startOffset: number;
  $duration: number;
  $totalDays: number;
  $color: string;
  $isSelected: boolean;
  $isDragging: boolean;
}>`
  position: absolute;
  top: 15px;
  height: 30px;
  left: ${props => (props.$startOffset / props.$totalDays) * 100}%;
  width: ${props => (props.$duration / props.$totalDays) * 100}%;
  background: ${props => props.$color};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: grab;
  transition: all ${props => props.theme.transitions.fast};
  border: 2px solid ${props => props.$isSelected 
    ? props.theme.colors.primary 
    : 'transparent'
  };
  opacity: ${props => props.$isDragging ? 0.7 : 1};
  transform: ${props => props.$isDragging ? 'scale(1.05)' : 'scale(1)'};
  z-index: ${props => props.$isSelected ? 10 : 1};
  
  &:hover {
    transform: scale(1.02);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    cursor: grabbing;
  }
`;

const TaskBarProgress = styled.div<{ $percentage: number; $color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color};
  border-radius: ${props => props.theme.borderRadius.md};
  opacity: 0.8;
`;

const TaskBarContent = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${props => props.theme.spacing.sm};
  z-index: 1;
`;

const TaskBarTitle = styled.span`
  color: white;
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const TaskBarDuration = styled.span`
  color: white;
  font-size: ${props => props.theme.typography.fontSize.xs};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0.9;
`;

const PriorityIndicator = styled.div<{ $color: string }>`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: ${props => props.$color};
  border: 2px solid white;
  border-radius: 50%;
`;

const Dependencies = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const DependencyLine = styled.div<{
  $fromRow: number;
  $toRow: number;
  $fromEnd: number;
  $toStart: number;
  $totalDays: number;
}>`
  position: absolute;
  /* Placeholder pro dependency line styling */
  /* V reálné implementaci by se použil SVG nebo canvas */
`;

const Milestones = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  pointer-events: none;
`;

const MilestoneMarker = styled.div<{
  $offset: number;
  $totalDays: number;
  $type: string;
  $status: string;
  $isSelected: boolean;
}>`
  position: absolute;
  left: ${props => (props.$offset / props.$totalDays) * 100}%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: ${props => {
    const colors = {
      deadline: '#EF4444',
      review: '#F59E0B',
      delivery: '#10B981',
      approval: '#3B82F6'
    };
    return colors[props.$type as keyof typeof colors] || '#6B7280';
  }};
  pointer-events: auto;
  cursor: pointer;
  z-index: ${props => props.$isSelected ? 10 : 5};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -3px;
    width: 8px;
    height: 8px;
    background: ${props => {
      const colors = {
        deadline: '#EF4444',
        review: '#F59E0B',
        delivery: '#10B981',
        approval: '#3B82F6'
      };
      return colors[props.$type as keyof typeof colors] || '#6B7280';
    }};
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const MilestoneIcon = styled.div<{ $type: string }>`
  position: absolute;
  top: 10px;
  left: -8px;
  font-size: 16px;
  z-index: 1;
`;

const MilestoneLabel = styled.div`
  position: absolute;
  top: 30px;
  left: -50px;
  width: 100px;
  text-align: center;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.surface};
  padding: 2px 4px;
  border-radius: ${props => props.theme.borderRadius.sm};
  box-shadow: ${props => props.theme.shadows.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TodayIndicator = styled.div<{
  $offset: number;
  $totalDays: number;
}>`
  position: absolute;
  left: ${props => (props.$offset / props.$totalDays) * 100}%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #DC2626;
  z-index: 8;
  
  &::before {
    content: 'DNES';
    position: absolute;
    top: -20px;
    left: -15px;
    background: #DC2626;
    color: white;
    padding: 2px 6px;
    border-radius: ${props => props.theme.borderRadius.sm};
    font-size: ${props => props.theme.typography.fontSize.xs};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }
`;
