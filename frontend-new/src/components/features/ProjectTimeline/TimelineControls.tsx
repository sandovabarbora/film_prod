import React, { useState } from 'react';
import styled from 'styled-components';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../ui/Button';
import { Card } from '../../ui/Card';

type ViewMode = 'gantt' | 'calendar' | 'list' | 'milestones' | 'critical_path';
type TimeScale = 'days' | 'weeks' | 'months';

interface TimelineControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  timeScale: TimeScale;
  onTimeScaleChange: (scale: TimeScale) => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  showDependencies: boolean;
  onToggleDependencies: (show: boolean) => void;
  analytics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    delayedTasks: number;
    blockedTasks: number;
    overallProgress: number;
    upcomingMilestones: number;
    criticalTasks: number;
    currentPhaseProgress: number;
  };
  onAddTask?: () => void;
  onAddMilestone?: () => void;
}

export function TimelineControls({ 
  viewMode, 
  onViewModeChange,
  timeScale,
  onTimeScaleChange,
  filterCategory,
  onFilterCategoryChange,
  filterStatus,
  onFilterStatusChange,
  showDependencies,
  onToggleDependencies,
  analytics,
  onAddTask,
  onAddMilestone
}: TimelineControlsProps) {
  const [showExportOptions, setShowExportOptions] = useState(false);

  const viewModes = [
    { 
      id: 'gantt' as ViewMode, 
      label: 'Gantt', 
      icon: '📊',
      description: 'Gantt chart view'
    },
    { 
      id: 'calendar' as ViewMode, 
      label: 'Kalendář', 
      icon: '📅',
      description: 'Kalendářní pohled'
    },
    { 
      id: 'list' as ViewMode, 
      label: 'Seznam', 
      icon: '📋',
      description: 'Seznam úkolů'
    },
    { 
      id: 'milestones' as ViewMode, 
      label: 'Milestones', 
      icon: '🎯',
      description: 'Správa milestones',
      badge: analytics.upcomingMilestones
    },
    { 
      id: 'critical_path' as ViewMode, 
      label: 'Critical Path', 
      icon: '⚡',
      description: 'Kritická cesta',
      badge: analytics.criticalTasks
    }
  ];

  const timeScales = [
    { id: 'days' as TimeScale, label: 'Dny', icon: '📆' },
    { id: 'weeks' as TimeScale, label: 'Týdny', icon: '📅' },
    { id: 'months' as TimeScale, label: 'Měsíce', icon: '🗓️' }
  ];

  const categories = [
    { value: 'all', label: 'Všechny fáze', icon: '🎬' },
    { value: 'pre_production', label: 'Příprava', icon: '📝' },
    { value: 'production', label: 'Natáčení', icon: '🎥' },
    { value: 'post_production', label: 'Postprodukce', icon: '✂️' },
    { value: 'admin', label: 'Administrativa', icon: '📄' }
  ];

  const statuses = [
    { value: 'all', label: 'Všechny stavy', icon: '🔍' },
    { value: 'not_started', label: 'Nespuštěné', icon: '⏸️' },
    { value: 'in_progress', label: 'Probíhající', icon: '▶️' },
    { value: 'completed', label: 'Dokončené', icon: '✅' },
    { value: 'delayed', label: 'Zpožděné', icon: '⚠️' },
    { value: 'blocked', label: 'Blokované', icon: '🚫' }
  ];

  const getCurrentAlert = () => {
    if (analytics.blockedTasks > 0) {
      return {
        level: 'critical',
        message: `${analytics.blockedTasks} úkolů je blokováno`,
        color: '#EF4444'
      };
    }
    if (analytics.delayedTasks > 0) {
      return {
        level: 'warning',
        message: `${analytics.delayedTasks} úkolů má zpoždění`,
        color: '#F59E0B'
      };
    }
    if (analytics.criticalTasks > 0) {
      return {
        level: 'warning',
        message: `${analytics.criticalTasks} kritických úkolů`,
        color: '#F59E0B'
      };
    }
    return {
      level: 'success',
      message: 'Timeline je v pořádku',
      color: '#10B981'
    };
  };

  const currentAlert = getCurrentAlert();

  const handleExport = (format: 'pdf' | 'msp' | 'csv') => {
    // Placeholder pro export funkčnost
    console.log(`Exporting timeline as ${format}`);
    setShowExportOptions(false);
  };

  return (
    <ControlsContainer>
      {/* Main Navigation */}
      <NavigationSection>
        <ViewModeSelector>
          {viewModes.map(mode => (
            <ViewModeTab
              key={mode.id}
              $isActive={viewMode === mode.id}
              onClick={() => onViewModeChange(mode.id)}
              title={mode.description}
            >
              <TabIcon>{mode.icon}</TabIcon>
              <TabLabel>{mode.label}</TabLabel>
              {mode.badge && mode.badge > 0 && (
                <TabBadge>{mode.badge}</TabBadge>
              )}
            </ViewModeTab>
          ))}
        </ViewModeSelector>

        {/* Status Alert */}
        <StatusAlert $level={currentAlert.level}>
          <AlertIcon>
            {currentAlert.level === 'critical' && '🚨'}
            {currentAlert.level === 'warning' && '⚠️'}
            {currentAlert.level === 'success' && '✅'}
          </AlertIcon>
          <AlertMessage>{currentAlert.message}</AlertMessage>
        </StatusAlert>
      </NavigationSection>

      {/* Controls & Filters */}
      <ControlsSection>
        {/* Time Scale Controls */}
        {(viewMode === 'gantt' || viewMode === 'calendar') && (
          <TimeScaleGroup>
            <ControlLabel>Měřítko:</ControlLabel>
            <TimeScaleTabs>
              {timeScales.map(scale => (
                <TimeScaleTab
                  key={scale.id}
                  $isActive={timeScale === scale.id}
                  onClick={() => onTimeScaleChange(scale.id)}
                >
                  <span>{scale.icon}</span>
                  <span>{scale.label}</span>
                </TimeScaleTab>
              ))}
            </TimeScaleTabs>
          </TimeScaleGroup>
        )}

        {/* Filters */}
        <FiltersGroup>
          <FilterGroup>
            <ControlLabel>Fáze:</ControlLabel>
            <FilterSelect 
              value={filterCategory} 
              onChange={(e) => onFilterCategoryChange(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <ControlLabel>Status:</ControlLabel>
            <FilterSelect 
              value={filterStatus} 
              onChange={(e) => onFilterStatusChange(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
        </FiltersGroup>

        {/* View Options */}
        {viewMode === 'gantt' && (
          <ViewOptionsGroup>
            <ToggleOption>
              <ToggleCheckbox
                type="checkbox"
                checked={showDependencies}
                onChange={(e) => onToggleDependencies(e.target.checked)}
              />
              <ToggleLabel>Zobrazit závislosti</ToggleLabel>
            </ToggleOption>
          </ViewOptionsGroup>
        )}

        {/* Action Buttons */}
        <ActionButtons>
          {onAddTask && (
            <PrimaryButton onClick={onAddTask} size="sm">
              ➕ Přidat úkol
            </PrimaryButton>
          )}
          
          {onAddMilestone && (
            <SecondaryButton onClick={onAddMilestone} size="sm">
              🎯 Přidat milestone
            </SecondaryButton>
          )}

          <ExportButtonGroup>
            <OutlineButton 
              size="sm"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              📤 Export
            </OutlineButton>
            
            {showExportOptions && (
              <ExportDropdown>
                <ExportOption onClick={() => handleExport('pdf')}>
                  📄 Exportovat PDF
                </ExportOption>
                <ExportOption onClick={() => handleExport('msp')}>
                  📊 Microsoft Project
                </ExportOption>
                <ExportOption onClick={() => handleExport('csv')}>
                  📋 Exportovat CSV
                </ExportOption>
              </ExportDropdown>
            )}
          </ExportButtonGroup>
        </ActionButtons>
      </ControlsSection>

      {/* Progress Summary */}
      <ProgressSummary>
        <ProgressCard>
          <ProgressHeader>
            <ProgressTitle>Celkový pokrok</ProgressTitle>
            <ProgressValue>{Math.round(analytics.overallProgress)}%</ProgressValue>
          </ProgressHeader>
          <ProgressBar>
            <ProgressFill $percentage={analytics.overallProgress} />
          </ProgressBar>
        </ProgressCard>

        <StatsGrid>
          <StatItem>
            <StatIcon>📋</StatIcon>
            <StatValue>{analytics.totalTasks}</StatValue>
            <StatLabel>Celkem úkolů</StatLabel>
          </StatItem>

          <StatItem $status="success">
            <StatIcon>✅</StatIcon>
            <StatValue>{analytics.completedTasks}</StatValue>
            <StatLabel>Dokončeno</StatLabel>
          </StatItem>

          <StatItem $status="progress">
            <StatIcon>▶️</StatIcon>
            <StatValue>{analytics.inProgressTasks}</StatValue>
            <StatLabel>Probíhá</StatLabel>
          </StatItem>

          <StatItem $status={analytics.delayedTasks > 0 ? 'warning' : 'neutral'}>
            <StatIcon>⚠️</StatIcon>
            <StatValue>{analytics.delayedTasks}</StatValue>
            <StatLabel>Zpožděno</StatLabel>
          </StatItem>

          <StatItem $status={analytics.blockedTasks > 0 ? 'critical' : 'neutral'}>
            <StatIcon>🚫</StatIcon>
            <StatValue>{analytics.blockedTasks}</StatValue>
            <StatLabel>Blokováno</StatLabel>
          </StatItem>

          <StatItem>
            <StatIcon>🎯</StatIcon>
            <StatValue>{analytics.upcomingMilestones}</StatValue>
            <StatLabel>Nadch. milestones</StatLabel>
          </StatItem>
        </StatsGrid>
      </ProgressSummary>
    </ControlsContainer>
  );
}

// Styled Components
const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const NavigationSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ViewModeSelector = styled.div`
  display: flex;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xs};
  border: 1px solid ${props => props.theme.colors.border};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const ViewModeTab = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: none;
  background: ${props => props.$isActive 
    ? props.theme.colors.primary 
    : 'transparent'
  };
  color: ${props => props.$isActive 
    ? 'white' 
    : props.theme.colors.text
  };
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  position: relative;
  white-space: nowrap;

  &:hover {
    background: ${props => props.$isActive 
      ? props.theme.colors.primary 
      : props.theme.colors.surface
    };
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const TabIcon = styled.span`
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const TabLabel = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const TabBadge = styled.span`
  background: #EF4444;
  color: white;
  border-radius: ${props => props.theme.borderRadius.full};
  padding: 2px 6px;
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  min-width: 18px;
  text-align: center;
`;

const StatusAlert = styled.div<{ $level: 'success' | 'warning' | 'critical' }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => {
    const colors = {
      success: 'rgba(16, 185, 129, 0.1)',
      warning: 'rgba(245, 158, 11, 0.1)',
      critical: 'rgba(239, 68, 68, 0.1)'
    };
    return colors[props.$level];
  }};
  border: 1px solid ${props => {
    const colors = {
      success: 'rgba(16, 185, 129, 0.3)',
      warning: 'rgba(245, 158, 11, 0.3)',
      critical: 'rgba(239, 68, 68, 0.3)'
    };
    return colors[props.$level];
  }};
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const AlertIcon = styled.span`
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const AlertMessage = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const ControlsSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TimeScaleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ControlLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
`;

const TimeScaleTabs = styled.div`
  display: flex;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.xs};
  border: 1px solid ${props => props.theme.colors.border};
`;

const TimeScaleTab = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: none;
  background: ${props => props.$isActive 
    ? props.theme.colors.primary 
    : 'transparent'
  };
  color: ${props => props.$isActive 
    ? 'white' 
    : props.theme.colors.text
  };
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  font-size: ${props => props.theme.typography.fontSize.sm};
  white-space: nowrap;

  &:hover {
    background: ${props => props.$isActive 
      ? props.theme.colors.primary 
      : props.theme.colors.surface
    };
  }
`;

const FiltersGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FilterSelect = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ViewOptionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ToggleOption = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
`;

const ToggleCheckbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${props => props.theme.colors.primary};
`;

const ToggleLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text};
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const ExportButtonGroup = styled.div`
  position: relative;
`;

const ExportDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 10;
  min-width: 180px;
`;

const ExportOption = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: background ${props => props.theme.transitions.fast};
  text-align: left;

  &:hover {
    background: ${props => props.theme.colors.background};
  }

  &:first-child {
    border-radius: ${props => props.theme.borderRadius.lg} ${props => props.theme.borderRadius.lg} 0 0;
  }

  &:last-child {
    border-radius: 0 0 ${props => props.theme.borderRadius.lg} ${props => props.theme.borderRadius.lg};
  }
`;

const ProgressSummary = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProgressCard = styled.div``;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ProgressTitle = styled.h4`
  margin: 0;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const ProgressValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
`;

const ProgressBar = styled.div`
  height: 12px;
  background: ${props => props.theme.colors.border};
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, #059669);
  transition: width ${props => props.theme.transitions.normal};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div<{ $status?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => {
    const colors = {
      success: 'rgba(16, 185, 129, 0.1)',
      progress: 'rgba(59, 130, 246, 0.1)',
      warning: 'rgba(245, 158, 11, 0.1)',
      critical: 'rgba(239, 68, 68, 0.1)',
      neutral: 'transparent'
    };
    return colors[props.$status as keyof typeof colors] || 'transparent';
  }};
  border: 1px solid ${props => {
    const colors = {
      success: 'rgba(16, 185, 129, 0.3)',
      progress: 'rgba(59, 130, 246, 0.3)',
      warning: 'rgba(245, 158, 11, 0.3)',
      critical: 'rgba(239, 68, 68, 0.3)',
      neutral: 'transparent'
    };
    return colors[props.$status as keyof typeof colors] || 'transparent';
  }};
`;

const StatIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;
