// Business logic calculations pro filmovou produkci

export function calculateProjectProgress(tasks: any[]): number {
  if (tasks.length === 0) return 0;
  
  const totalProgress = tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
  return Math.round(totalProgress / tasks.length);
}

export function calculateBudgetUtilization(spent: number, allocated: number): number {
  if (allocated === 0) return 0;
  return Math.round((spent / allocated) * 100);
}

export function calculateBurnRate(transactions: any[], days: number = 30): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentExpenses = transactions.filter(t => 
    t.type === 'expense' && new Date(t.date) > cutoffDate
  );
  
  const totalSpent = recentExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  return totalSpent / days;
}

export function calculateProjectionToCompletion(
  currentSpent: number, 
  totalBudget: number, 
  burnRate: number
): {
  daysRemaining: number;
  projectedOverrun: number;
  completionDate: Date;
} {
  const remainingBudget = totalBudget - currentSpent;
  const daysRemaining = burnRate > 0 ? Math.ceil(remainingBudget / burnRate) : Infinity;
  
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysRemaining);
  
  const projectedOverrun = burnRate > 0 && daysRemaining < 0 
    ? Math.abs(remainingBudget) 
    : 0;
  
  return {
    daysRemaining: Math.max(0, daysRemaining),
    projectedOverrun,
    completionDate
  };
}

export function calculateTimelineDelay(
  plannedEndDate: string, 
  currentDate: string = new Date().toISOString()
): {
  isDelayed: boolean;
  delayDays: number;
} {
  const planned = new Date(plannedEndDate);
  const current = new Date(currentDate);
  
  const diffTime = current.getTime() - planned.getTime();
  const delayDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    isDelayed: delayDays > 0,
    delayDays: Math.max(0, delayDays)
  };
}

export function calculateCriticalPath(tasks: any[]): string[] {
  // Simplified critical path calculation
  // V reálné aplikaci by se použil CPM algoritmus
  
  const criticalTasks = tasks.filter(task => 
    task.priority === 'critical' || 
    task.dependencies.length === 0 ||
    task.status === 'blocked' ||
    (task.status !== 'completed' && new Date(task.endDate) < new Date())
  );
  
  return criticalTasks
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .map(task => task.id);
}

export function calculateResourceUtilization(
  tasks: any[], 
  teamMembers: any[]
): Record<string, number> {
  const utilization: Record<string, number> = {};
  
  teamMembers.forEach(member => {
    const memberTasks = tasks.filter(task => 
      task.assignee === member.name && 
      task.status === 'in_progress'
    );
    
    const totalWorkload = memberTasks.reduce((sum, task) => {
      const taskDuration = new Date(task.endDate).getTime() - new Date(task.startDate).getTime();
      const taskDays = taskDuration / (1000 * 60 * 60 * 24);
      return sum + taskDays;
    }, 0);
    
    // Předpokládáme 22 pracovních dní v měsíci
    utilization[member.name] = Math.round((totalWorkload / 22) * 100);
  });
  
  return utilization;
}

export function calculateCashFlowForecast(
  currentSpent: number,
  plannedBudget: number,
  burnRate: number,
  forecastDays: number
): {
  projectedSpend: number;
  projectedTotal: number;
  projectedRemaining: number;
  cashFlowByWeek: Array<{
    week: number;
    spent: number;
    remaining: number;
  }>;
} {
  const projectedSpend = burnRate * forecastDays;
  const projectedTotal = currentSpent + projectedSpend;
  const projectedRemaining = plannedBudget - projectedTotal;
  
  // Cash flow po týdnech
  const cashFlowByWeek = [];
  const weeklyBurnRate = burnRate * 7;
  
  for (let week = 1; week <= Math.ceil(forecastDays / 7); week++) {
    const weekSpent = currentSpent + (weeklyBurnRate * week);
    const weekRemaining = plannedBudget - weekSpent;
    
    cashFlowByWeek.push({
      week,
      spent: Math.min(weekSpent, plannedBudget),
      remaining: Math.max(0, weekRemaining)
    });
  }
  
  return {
    projectedSpend,
    projectedTotal,
    projectedRemaining,
    cashFlowByWeek
  };
}
