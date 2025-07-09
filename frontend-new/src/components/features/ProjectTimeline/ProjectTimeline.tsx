import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
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

const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: 100%;
`;

const TimelineHeader = styled(Card)`
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TimelineTitle = styled.h2`
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const TimelineStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`;

const StatNumber = styled.div`
  color: #667eea;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
`;

const TimelineContent = styled.div`
  flex: 1;
  min-height: 400px;
`;

const CalendarView = styled(Card)`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
`;

const CalendarPlaceholder = styled.div`
  padding: 3rem;
  color: #8b8b8b;
`;

const CalendarIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const CalendarMessage = styled.div`
  font-size: 1rem;
`;

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  projectId,
  timeline,
  onTaskUpdate,
  onMilestoneUpdate,
  onAddTask,
  onAddMilestone
}) => {
  // UI state
  const [viewMode, setViewMode] = useState<'gantt' | 'list' | 'calendar' | 'milestones'>('gantt');
  const [timeScale, setTimeScale] = useState<'days' | 'weeks' | 'months'>('weeks');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDependencies, setShowDependencies] = useState(true);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  // Výpočet statistik
  const timelineStats = useMemo(() => {
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

  // Helper functions
  const calculateCriticalPath = (tasks: TimelineTask[]): number => {
    // Simplified critical path calculation
    return tasks.filter(t => t.priority === 'critical').length;
  };

  const calculateProjectDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculatePhaseProgress = (tasks: TimelineTask[], currentPhase: string): number => {
    const phaseTasks = tasks.filter(t => t.category === currentPhase);
    if (phaseTasks.length === 0) return 0;
    return phaseTasks.reduce((sum, task) => sum + task.progress, 0) / phaseTasks.length;
  };

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

  const getStatusColor = (status: string): string => {
    const colors = {
      'completed': '#22c55e',
      'in_progress': '#3b82f6',
      'delayed': '#f59e0b',
      'blocked': '#ef4444',
      'not_started': '#6b7280'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      'critical': '#ef4444',
      'high': '#f59e0b',
      'medium': '#3b82f6',
      'low': '#6b7280'
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  };

  const handleToggleDependencies = () => {
    setShowDependencies(!showDependencies);
  };

  return (
    <TimelineContainer>
      {/* Timeline Header */}
      <TimelineHeader>
        <HeaderContent>
          <TimelineTitle>
            📊 Timeline projektu
          </TimelineTitle>
          <div style={{ color: '#8b8b8b', fontSize: '0.875rem' }}>
            Poslední aktualizace: {new Date(timeline.lastUpdated).toLocaleDateString('cs-CZ')}
          </div>
        </HeaderContent>

        <TimelineStats>
          <StatItem>
            <StatNumber>{timelineStats.totalTasks}</StatNumber>
            <StatLabel>Celkem úkolů</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>{timelineStats.completedTasks}</StatNumber>
            <StatLabel>Dokončeno</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>{timelineStats.inProgressTasks}</StatNumber>
            <StatLabel>Probíhá</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>{Math.round(timelineStats.overallProgress)}%</StatNumber>
            <StatLabel>Celkový progress</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>{timelineStats.upcomingMilestones}</StatNumber>
            <StatLabel>Nadcházející milníky</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>{timelineStats.criticalTasks}</StatNumber>
            <StatLabel>Kritické úkoly</StatLabel>
          </StatItem>
        </TimelineStats>
      </TimelineHeader>

      {/* Timeline Controls */}
      <TimelineControls
        viewMode={viewMode}
        timeScale={timeScale}
        filterCategory={filterCategory}
        filterStatus={filterStatus}
        showDependencies={showDependencies}
        onViewModeChange={setViewMode}
        onTimeScaleChange={setTimeScale}
        onFilterCategoryChange={setFilterCategory}
        onFilterStatusChange={setFilterStatus}
        onToggleDependencies={handleToggleDependencies}
        onAddTask={onAddTask ? () => onAddTask({
          title: 'Nový úkol',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          duration: 1,
          progress: 0,
          status: 'not_started',
          priority: 'medium',
          dependencies: [],
          category: timeline.currentPhase,
          resources: [],
          tags: []
        }) : undefined}
        onAddMilestone={onAddMilestone ? () => onAddMilestone({
          title: 'Nový milník',
          date: new Date().toISOString().split('T')[0],
          type: 'deadline',
          status: 'upcoming',
          importance: 'medium',
          relatedTasks: []
        }) : undefined}
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
            <CalendarPlaceholder>
              <CalendarIcon>📅</CalendarIcon>
              <CalendarMessage>
                Kalendářní pohled bude implementován v příští verzi
              </CalendarMessage>
            </CalendarPlaceholder>
          </CalendarView>
        )}
      </TimelineContent>
    </TimelineContainer>
  );
};

export default ProjectTimeline;
