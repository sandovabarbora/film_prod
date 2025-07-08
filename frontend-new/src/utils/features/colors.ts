// Color utilities pro status colors a theme

export const statusColors = {
  // Project statuses
  development: '#6B7280',
  pre_production: '#F59E0B',
  production: '#EF4444', 
  post_production: '#8B5CF6',
  completed: '#10B981',
  on_hold: '#9CA3AF',
  cancelled: '#6B7280',
  
  // Task statuses
  not_started: '#6B7280',
  in_progress: '#3B82F6',
  delayed: '#F59E0B',
  blocked: '#EF4444',
  
  // Document statuses
  draft: '#6B7280',
  review: '#F59E0B',
  approved: '#10B981',
  final: '#3B82F6',
  archived: '#9CA3AF',
  
  // Priority levels
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#DC2626',
  
  // Budget statuses
  on_track: '#10B981',
  warning: '#F59E0B',
  
  // Milestone types
  deadline: '#EF4444',
  review_milestone: '#F59E0B',
  delivery: '#10B981',
  approval: '#3B82F6'
};

export const categoryColors = {
  pre_production: '#8B5CF6',
  production: '#EF4444',
  post_production: '#10B981',
  admin: '#6B7280',
  legal: '#F59E0B'
};

export function getStatusColor(status: string): string {
  return statusColors[status as keyof typeof statusColors] || '#6B7280';
}

export function getCategoryColor(category: string): string {
  return categoryColors[category as keyof typeof categoryColors] || '#6B7280';
}

export function getPriorityColor(priority: string): string {
  const colors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#DC2626'
  };
  return colors[priority as keyof typeof colors] || '#6B7280';
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#10B981'; // Green
  if (percentage >= 80) return '#3B82F6';  // Blue
  if (percentage >= 60) return '#F59E0B';  // Orange
  if (percentage >= 40) return '#F59E0B';  // Orange
  return '#EF4444'; // Red
}

export function getBudgetStatusColor(spent: number, allocated: number): string {
  const utilization = (spent / allocated) * 100;
  
  if (utilization > 100) return statusColors.critical;
  if (utilization > 90) return statusColors.warning;
  if (utilization > 80) return statusColors.warning;
  
  return statusColors.on_track;
}
