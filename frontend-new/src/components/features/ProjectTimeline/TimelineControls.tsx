import React, { useState } from 'react';
import styled from 'styled-components';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface TimelineControlsProps {
  viewMode: 'gantt' | 'list' | 'calendar' | 'milestones';
  timeScale: 'days' | 'weeks' | 'months';
  filterCategory: string;
  filterStatus: string;
  showDependencies: boolean;
  onViewModeChange: (mode: 'gantt' | 'list' | 'calendar' | 'milestones') => void;
  onTimeScaleChange: (scale: 'days' | 'weeks' | 'months') => void;
  onFilterCategoryChange: (category: string) => void;
  onFilterStatusChange: (status: string) => void;
  onToggleDependencies: () => void;
  onAddTask?: () => void;
  onAddMilestone?: () => void;
  onExportTimeline?: () => void;
}

const ControlsContainer = styled(Card)`
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  align-items: start;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ControlLabel = styled.label`
  color: #8b8b8b;
  font-size: 0.875rem;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ToggleButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.$active 
    ? 'rgba(103, 126, 234, 0.2)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.$active 
    ? 'rgba(103, 126, 234, 0.4)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 6px;
  color: ${props => props.$active ? '#667eea' : '#8b8b8b'};
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${props => props.$active 
      ? 'rgba(103, 126, 234, 0.3)' 
      : 'rgba(255, 255, 255, 0.1)'
    };
  }
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: rgba(103, 126, 234, 0.4);
    background: rgba(255, 255, 255, 0.1);
  }

  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #8b8b8b;
  font-size: 0.875rem;
  cursor: pointer;

  input[type="checkbox"] {
    accent-color: #667eea;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  viewMode,
  timeScale,
  filterCategory,
  filterStatus,
  showDependencies,
  onViewModeChange,
  onTimeScaleChange,
  onFilterCategoryChange,
  onFilterStatusChange,
  onToggleDependencies,
  onAddTask,
  onAddMilestone,
  onExportTimeline
}) => {

  const viewModes = [
    { id: 'gantt' as const, label: '📊 Gantt', icon: '📊' },
    { id: 'list' as const, label: '📋 Seznam', icon: '📋' },
    { id: 'calendar' as const, label: '📅 Kalendář', icon: '📅' },
    { id: 'milestones' as const, label: '🎯 Milníky', icon: '🎯' }
  ];

  const timeScales = [
    { id: 'days' as const, label: 'Dny' },
    { id: 'weeks' as const, label: 'Týdny' },
    { id: 'months' as const, label: 'Měsíce' }
  ];

  const categories = [
    { id: 'all', label: 'Všechny kategorie' },
    { id: 'pre_production', label: 'Pre-produkce' },
    { id: 'production', label: 'Produkce' },
    { id: 'post_production', label: 'Post-produkce' },
    { id: 'admin', label: 'Administrativa' }
  ];

  const statuses = [
    { id: 'all', label: 'Všechny stavy' },
    { id: 'not_started', label: 'Nezapočato' },
    { id: 'in_progress', label: 'Probíhá' },
    { id: 'completed', label: 'Dokončeno' },
    { id: 'delayed', label: 'Opožděno' },
    { id: 'blocked', label: 'Blokováno' }
  ];

  return (
    <ControlsContainer>
      <ControlsGrid>
        {/* View Mode */}
        <ControlGroup>
          <ControlLabel>Zobrazení</ControlLabel>
          <ButtonGroup>
            {viewModes.map(mode => (
              <ToggleButton
                key={mode.id}
                $active={viewMode === mode.id}
                onClick={() => onViewModeChange(mode.id)}
              >
                {mode.label}
              </ToggleButton>
            ))}
          </ButtonGroup>
        </ControlGroup>

        {/* Time Scale - only for Gantt view */}
        {viewMode === 'gantt' && (
          <ControlGroup>
            <ControlLabel>Časová škála</ControlLabel>
            <ButtonGroup>
              {timeScales.map(scale => (
                <ToggleButton
                  key={scale.id}
                  $active={timeScale === scale.id}
                  onClick={() => onTimeScaleChange(scale.id)}
                >
                  {scale.label}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </ControlGroup>
        )}

        {/* Category Filter */}
        <ControlGroup>
          <ControlLabel>Kategorie</ControlLabel>
          <Select 
            value={filterCategory} 
            onChange={(e) => onFilterCategoryChange(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </Select>
        </ControlGroup>

        {/* Status Filter */}
        <ControlGroup>
          <ControlLabel>Stav</ControlLabel>
          <Select 
            value={filterStatus} 
            onChange={(e) => onFilterStatusChange(e.target.value)}
          >
            {statuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </Select>
        </ControlGroup>

        {/* Dependencies Toggle - only for Gantt view */}
        {viewMode === 'gantt' && (
          <ControlGroup>
            <ControlLabel>Možnosti</ControlLabel>
            <CheckboxWrapper>
              <input
                type="checkbox"
                checked={showDependencies}
                onChange={onToggleDependencies}
              />
              Zobrazit závislosti
            </CheckboxWrapper>
          </ControlGroup>
        )}
      </ControlsGrid>

      <ActionButtons>
        {onAddTask && (
          <Button onClick={onAddTask}>
            ➕ Přidat úkol
          </Button>
        )}
        {onAddMilestone && (
          <Button onClick={onAddMilestone}>
            🎯 Přidat milník
          </Button>
        )}
        {onExportTimeline && (
          <Button onClick={onExportTimeline}>
            📤 Export
          </Button>
        )}
      </ActionButtons>
    </ControlsContainer>
  );
};

export default TimelineControls;
