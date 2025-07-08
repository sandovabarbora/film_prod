import React, { useState } from 'react';
import styled from 'styled-components';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../ui/Button';
import { Card, GlassCard } from '../../ui/Card';

type ViewMode = 'overview' | 'categories' | 'chart' | 'forecast' | 'transactions';

interface BudgetControlsProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onAddTransaction: () => void;
  filterByStatus: string;
  onFilterChange: (status: string) => void;
  analytics: {
    totalAllocated: number;
    totalSpent: number;
    utilizationRate: number;
    burnRate: number;
    categoriesWarning: number;
    categoriesCritical: number;
  };
}

export function BudgetControls({ 
  viewMode, 
  onViewChange, 
  onAddTransaction,
  filterByStatus,
  onFilterChange,
  analytics 
}: BudgetControlsProps) {
  const [showExportOptions, setShowExportOptions] = useState(false);

  const viewModes = [
    { 
      id: 'overview' as ViewMode, 
      label: 'Přehled', 
      icon: '📊',
      description: 'Celkový přehled rozpočtu'
    },
    { 
      id: 'categories' as ViewMode, 
      label: 'Kategorie', 
      icon: '📂',
      description: 'Detaily jednotlivých kategorií',
      badge: analytics.categoriesWarning + analytics.categoriesCritical
    },
    { 
      id: 'chart' as ViewMode, 
      label: 'Grafy', 
      icon: '📈',
      description: 'Vizuální analýza dat'
    },
    { 
      id: 'forecast' as ViewMode, 
      label: 'Prognóza', 
      icon: '🔮',
      description: 'Cash flow forecast'
    },
    { 
      id: 'transactions' as ViewMode, 
      label: 'Transakce', 
      icon: '📋',
      description: 'Historie plateb a úprav'
    }
  ];

  const statusFilters = [
    { value: 'all', label: 'Všechny kategorie', icon: '🔍' },
    { value: 'on_track', label: 'V pořádku', icon: '✅' },
    { value: 'warning', label: 'Varování', icon: '⚠️' },
    { value: 'critical', label: 'Kritické', icon: '🚨' }
  ];

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Placeholder pro export funkčnost
    console.log(`Exporting budget data as ${format}`);
    setShowExportOptions(false);
  };

  const getCurrentAlert = () => {
    if (analytics.categoriesCritical > 0) {
      return {
        level: 'critical',
        message: `${analytics.categoriesCritical} kategorií překračuje rozpočet`,
        color: '#EF4444'
      };
    }
    if (analytics.categoriesWarning > 0) {
      return {
        level: 'warning', 
        message: `${analytics.categoriesWarning} kategorií blíží se limitu`,
        color: '#F59E0B'
      };
    }
    if (analytics.utilizationRate > 90) {
      return {
        level: 'warning',
        message: 'Vysoké využití rozpočtu',
        color: '#F59E0B'
      };
    }
    return {
      level: 'success',
      message: 'Rozpočet je pod kontrolou',
      color: '#10B981'
    };
  };

  const currentAlert = getCurrentAlert();

  return (
    <ControlsContainer>
      {/* Main Navigation */}
      <NavigationSection>
        <NavTabs>
          {viewModes.map(mode => (
            <NavTab 
              key={mode.id}
              $isActive={viewMode === mode.id}
              onClick={() => onViewChange(mode.id)}
              title={mode.description}
            >
              <TabIcon>{mode.icon}</TabIcon>
              <TabLabel>{mode.label}</TabLabel>
              {mode.badge && mode.badge > 0 && (
                <TabBadge>{mode.badge}</TabBadge>
              )}
            </NavTab>
          ))}
        </NavTabs>

        {/* Quick Status Alert */}
        <StatusAlert $level={currentAlert.level}>
          <AlertIcon>
            {currentAlert.level === 'critical' && '🚨'}
            {currentAlert.level === 'warning' && '⚠️'}
            {currentAlert.level === 'success' && '✅'}
          </AlertIcon>
          <AlertMessage>{currentAlert.message}</AlertMessage>
        </StatusAlert>
      </NavigationSection>

      {/* Actions & Filters */}
      <ActionsSection>
        {/* Filter Controls */}
        <FilterGroup>
          <FilterLabel>Filtr kategorií:</FilterLabel>
          <StatusFilterTabs>
            {statusFilters.map(filter => (
              <FilterTab
                key={filter.value}
                $isActive={filterByStatus === filter.value}
                onClick={() => onFilterChange(filter.value)}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </FilterTab>
            ))}
          </StatusFilterTabs>
        </FilterGroup>

        {/* Action Buttons */}
        <ActionButtons>
          <PrimaryButton onClick={onAddTransaction}>
            💰 Přidat transakci
          </PrimaryButton>
          
          <ExportButtonGroup>
            <SecondaryButton 
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              📤 Export
            </SecondaryButton>
            
            {showExportOptions && (
              <ExportDropdown>
                <ExportOption onClick={() => handleExport('pdf')}>
                  📄 Exportovat PDF
                </ExportOption>
                <ExportOption onClick={() => handleExport('excel')}>
                  📊 Exportovat Excel
                </ExportOption>
                <ExportOption onClick={() => handleExport('csv')}>
                  📋 Exportovat CSV
                </ExportOption>
              </ExportDropdown>
            )}
          </ExportButtonGroup>

          <OutlineButton onClick={() => window.print()}>
            🖨️ Tisk
          </OutlineButton>
        </ActionButtons>
      </ActionsSection>

      {/* Quick Stats Bar */}
      <QuickStatsBar>
        <StatItem>
          <StatIcon>💳</StatIcon>
          <StatValue>{Math.round(analytics.utilizationRate)}%</StatValue>
          <StatLabel>Využití</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatIcon>🔥</StatIcon>
          <StatValue>{analytics.burnRate.toLocaleString('cs-CZ')} Kč</StatValue>
          <StatLabel>Denní burn rate</StatLabel>
        </StatItem>
        
        <StatItem $alert={analytics.categoriesWarning > 0}>
          <StatIcon>⚠️</StatIcon>
          <StatValue>{analytics.categoriesWarning}</StatValue>
          <StatLabel>Varování</StatLabel>
        </StatItem>
        
        <StatItem $alert={analytics.categoriesCritical > 0}>
          <StatIcon>🚨</StatIcon>
          <StatValue>{analytics.categoriesCritical}</StatValue>
          <StatLabel>Kritické</StatLabel>
        </StatItem>
      </QuickStatsBar>
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

const NavTabs = styled.div`
  display: flex;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xs};
  border: 1px solid ${props => props.theme.colors.border};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const NavTab = styled.button<{ $isActive: boolean }>`
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

const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
`;

const StatusFilterTabs = styled.div`
  display: flex;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.xs};
  border: 1px solid ${props => props.theme.colors.border};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const FilterTab = styled.button<{ $isActive: boolean }>`
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

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  
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

const QuickStatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div<{ $alert?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$alert 
    ? 'rgba(239, 68, 68, 0.1)' 
    : 'transparent'
  };
  border: ${props => props.$alert 
    ? '1px solid rgba(239, 68, 68, 0.3)' 
    : '1px solid transparent'
  };
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
