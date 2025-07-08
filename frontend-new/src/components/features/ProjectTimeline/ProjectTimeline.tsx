import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../ui/Button';
import { TimelineView } from './TimelineView';
import { MilestoneManager } from './MilestoneManager';
import { TaskManager } from './TaskManager';
import { TimelineControls } from './TimelineControls';

interface TimelineTask {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  duration: number; // dny
  progress: number; // 0-100%
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dependencies: string[]; // IDs jiných tasků
  category: 'pre_production' | 'production' | 'post_production' | 'admin';
  estimatedCost?: number;
  actualCost?: number;
  resources: string[];
  tags: string[];
}

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

interface ProjectTimelineProps {
  projectId: string;
  timeline: {
    tasks: TimelineTask[];
    milestones: TimelineMilestone[];
    startDate: string;
    endDate: string;
    currentPhase: 'pre_production' | 'production' | 'post_production';
    lastUpdated: string;
  };
  onTaskUpdate?: (taskId: string, updates: Partial<TimelineTask>) => void;
  onMilestoneUpdate?: (milestoneId: string, updates: Partial<TimelineMilestone>) => void;
  onAddTask?: (task: Omit<TimelineTask, 'id'>) => void;
  onAddMilestone?: (milestone: Omit<TimelineMilestone, 'id'>) => void;
}

type ViewMode = 'gantt' | 'calendar' | 'list' | 'milestones' | 'critical_path';
type TimeScale = 'days' | 'weeks' | 'months';

export function ProjectTimeline({ 
  projectId, 
  timeline, 
  onTaskUpdate,
  onMilestoneUpdate,
  onAddTask,
  onAddMilestone
}: ProjectTimelineProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('gantt');
  const [timeScale, setTimeScale] = useState<TimeScale>('weeks');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDependencies, setShowDependencies] = useState(true);

  // Výpočet timeline analytics
  const timelineAnalytics = useMemo(() => {
    const tasks = timeline.tasks;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const delayedTasks = tasks.filter(t => t.status === 'delayed').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    
    const overallProgress = totalTasks > 0 
      ? tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks 
      : 0;
    
    const upcomingMilestones = timeline.milestones.filter(m => 
      m.status === 'upcoming' && new Date(m.date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length;
    
    const criticalTasks = tasks.filter(t => 
      t.priority === 'critical' && t.status !== 'completed'
    ).length;

    // Critical path calculation (simplified)
    const criticalPath = calculateCriticalPath(tasks);
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      delayedTasks,
      blockedTasks,
      overallProgress,
      upcomingMilestones,
      criticalTasks,
      criticalPath,
      projectDuration: calculateProjectDuration(timeline.startDate, timeline.endDate),
      currentPhaseProgress: calculatePhaseProgress(tasks, timeline.currentPhase)
    };
  }, [timeline.tasks, timeline.milestones, timeline.startDate, timeline.endDate, timeline.currentPhase]);

  // Filtrování tasků
  const filteredTasks = useMemo(() => {
    return timeline.tasks.filter(task => {
      const categoryMatch = filterCategory === 'all' || task.category === filterCategory;
      const statusMatch = filterStatus === 'all' || task.status === filterStatus;
      return categoryMatch && statusMatch;
    });
  }, [timeline.tasks, filterCategory, filterStatus]);

  const handleTaskSelect = (taskId: string) => {
    setSelectedTask(taskId === selectedTask ? null : taskId);
    setSelectedMilestone(null);
  };

  const handleMilestoneSelect = (milestoneId: string) => {
    setSelectedMilestone(milestoneId === selectedMilestone ? null : milestoneId);
    setSelectedTask(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: '#6B7280',
      in_progress: '#3B82F6',
      completed: '#10B981',
      delayed: '#F59E0B',
      blocked: '#EF4444'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626'
    };
    return colors[priority as keyof typeof colors] || '#6B7280';
  };

  return (
    <TimelineContainer>
      {/* Timeline Controls */}
      <TimelineControls 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        showDependencies={showDependencies}
        onToggleDependencies={setShowDependencies}
        analytics={timelineAnalytics}
        onAddTask={() => onAddTask && onAddTask({
          title: 'Nový úkol',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 7,
          progress: 0,
          status: 'not_started',
          priority: 'medium',
          dependencies: [],
          category: timeline.currentPhase,
          resources: [],
          tags: []
        })}
        onAddMilestone={() => onAddMilestone && onAddMilestone({
          title: 'Nový milestone',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'deadline',
          status: 'upcoming',
          importance: 'medium',
          relatedTasks: []
        })}
      />

      {/* Main Timeline Content */}
      <TimelineContent>
        {viewMode === 'gantt' && (
          <TimelineView 
            tasks={filteredTasks}
            milestones={timeline.milestones}
            timeScale={timeScale}
            selectedTask={selectedTask}
            selectedMilestone={selectedMilestone}
            showDependencies={showDependencies}
            onTaskSelect={handleTaskSelect}
            onMilestoneSelect={handleMilestoneSelect}
            onTaskUpdate={onTaskUpdate}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            startDate={timeline.startDate}
            endDate={timeline.endDate}
          />
        )}

        {viewMode === 'milestones' && (
          <MilestoneManager 
            milestones={timeline.milestones}
            tasks={timeline.tasks}
            selectedMilestone={selectedMilestone}
            onMilestoneSelect={handleMilestoneSelect}
            onMilestoneUpdate={onMilestoneUpdate}
          />
        )}

        {viewMode === 'list' && (
          <TaskManager 
            tasks={filteredTasks}
            milestones={timeline.milestones}
            selectedTask={selectedTask}
            onTaskSelect={handleTaskSelect}
            onTaskUpdate={onTaskUpdate}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
          />
        )}

        {viewMode === 'calendar' && (
          <CalendarView>
            <GlassCard>
              <CardHeader>
                <h3>Kalendářní pohled</h3>
              </CardHeader>
              <CardContent>
                <CalendarPlaceholder>
                  <CalendarIcon>📅</CalendarIcon>
                  <CalendarMessage>
                    Kalendářní pohled bude implementován v další iteraci
                  </CalendarMessage>
                  <CalendarSubMessage>
                    Bude obsahovat měsíční/týdenní view s events a deadlines
                  </CalendarSubMessage>
                </CalendarPlaceholder>
              </CardContent>
            </GlassCard>
          </CalendarView>
        )}

        {viewMode === 'critical_path' && (
          <CriticalPathView>
            <GlassCard>
              <CardHeader>
                <h3>Critical Path Analysis</h3>
              </CardHeader>
              <CardContent>
                <CriticalPathPlaceholder>
                  <CriticalPathIcon>🎯</CriticalPathIcon>
                  <CriticalPathMessage>
                    Critical Path analýza bude implementována v další iteraci
                  </CriticalPathMessage>
                  <CriticalPathSubMessage>
                    Bude identifikovat nejdůležitější sekvence úkolů
                  </CriticalPathSubMessage>
                </CriticalPathPlaceholder>
              </CardContent>
            </GlassCard>
          </CriticalPathView>
        )}
      </TimelineContent>
    </TimelineContainer>
  );
}

// Helper functions
function calculateCriticalPath(tasks: TimelineTask[]): string[] {
  // Simplified critical path calculation
  // V reálné aplikaci by použil komplexní algoritmus
  return tasks
    .filter(t => t.priority === 'critical' || t.dependencies.length === 0)
    .map(t => t.id);
}

function calculateProjectDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function calculatePhaseProgress(tasks: TimelineTask[], currentPhase: string): number {
  const phaseTasks = tasks.filter(t => t.category === currentPhase);
  if (phaseTasks.length === 0) return 0;
  
  return phaseTasks.reduce((sum, task) => sum + task.progress, 0) / phaseTasks.length;
}

// Styled Components
const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
  height: 100%;
`;

const TimelineContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const CalendarView = styled.div``;
const CriticalPathView = styled.div``;

const CalendarPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['4xl']};
  text-align: center;
`;

const CalendarIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const CalendarMessage = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.text};
`;

const CalendarSubMessage = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
`;

const CriticalPathPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['4xl']};
  text-align: center;
`;

const CriticalPathIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const CriticalPathMessage = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.text};
`;

const CriticalPathSubMessage = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
`;
