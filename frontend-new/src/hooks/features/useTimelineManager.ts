import { useState, useCallback, useMemo } from 'react';

interface TimelineTask {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
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
  relatedTasks: string[];
}

export function useTimelineManager(projectId: string) {
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [milestones, setMilestones] = useState<TimelineMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Timeline analytics
  const analytics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const delayedTasks = tasks.filter(t => t.status === 'delayed').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    
    const overallProgress = totalTasks > 0 
      ? tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks 
      : 0;
    
    const upcomingMilestones = milestones.filter(m => {
      const milestoneDate = new Date(m.date);
      const today = new Date();
      const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      return m.status === 'upcoming' && milestoneDate <= in30Days;
    }).length;
    
    const criticalTasks = tasks.filter(t => 
      t.priority === 'critical' && t.status !== 'completed'
    ).length;

    // Critical path analysis (simplified)
    const criticalPath = calculateCriticalPath(tasks);
    
    const currentPhaseProgress = (phase: string) => {
      const phaseTasks = tasks.filter(t => t.category === phase);
      if (phaseTasks.length === 0) return 0;
      return phaseTasks.reduce((sum, task) => sum + task.progress, 0) / phaseTasks.length;
    };

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
      currentPhaseProgress: {
        pre_production: currentPhaseProgress('pre_production'),
        production: currentPhaseProgress('production'),
        post_production: currentPhaseProgress('post_production'),
        admin: currentPhaseProgress('admin')
      }
    };
  }, [tasks, milestones]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<TimelineTask>) => {
    setIsLoading(true);
    try {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
      
      console.log('Task updated:', taskId, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTask = useCallback(async (task: Omit<TimelineTask, 'id'>) => {
    setIsLoading(true);
    try {
      const newTask: TimelineTask = {
        ...task,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      setTasks(prev => [...prev, newTask]);
      console.log('Task added:', newTask);
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMilestone = useCallback(async (milestoneId: string, updates: Partial<TimelineMilestone>) => {
    setIsLoading(true);
    try {
      setMilestones(prev => prev.map(milestone => 
        milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
      ));
      
      console.log('Milestone updated:', milestoneId, updates);
    } catch (error) {
      console.error('Failed to update milestone:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMilestone = useCallback(async (milestone: Omit<TimelineMilestone, 'id'>) => {
    setIsLoading(true);
    try {
      const newMilestone: TimelineMilestone = {
        ...milestone,
        id: `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      setMilestones(prev => [...prev, newMilestone]);
      console.log('Milestone added:', newMilestone);
    } catch (error) {
      console.error('Failed to add milestone:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tasks,
    setTasks,
    milestones,
    setMilestones,
    analytics,
    isLoading,
    updateTask,
    addTask,
    updateMilestone,
    addMilestone
  };
}

// Helper function pro critical path calculation
function calculateCriticalPath(tasks: TimelineTask[]): string[] {
  // Simplified version - v reálné aplikaci by použil komplexní algoritmus
  const criticalTasks = tasks.filter(task => 
    task.priority === 'critical' || 
    task.dependencies.length === 0 ||
    task.status === 'blocked'
  );
  
  return criticalTasks.map(task => task.id);
}
