import React, { useState } from 'react';
import styled from 'styled-components';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../ui/Button';
import { Card, GlassCard, CardContent } from '../../ui/Card';

type ViewMode = 'grid' | 'list' | 'viewer' | 'upload' | 'versions';

interface DocumentSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string;
  onFilterTypeChange: (type: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  analytics: {
    totalDocs: number;
    totalSize: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    pendingApprovals: number;
    recentlyModified: number;
  };
  onUploadClick: () => void;
  currentUser: {
    name: string;
    role: string;
    permissions: string[];
  };
}

export function DocumentSearch({ 
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterCategory,
  onFilterCategoryChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
  analytics,
  onUploadClick,
  currentUser
}: DocumentSearchProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const documentTypes = [
    { value: 'all', label: 'Všechny typy', icon: '📁' },
    { value: 'script', label: 'Scénáře', icon: '📝' },
    { value: 'contract', label: 'Smlouvy', icon: '📄' },
    { value: 'callsheet', label: 'Call Sheets', icon: '📋' },
    { value: 'storyboard', label: 'Storyboardy', icon: '🎨' },
    { value: 'concept', label: 'Koncepty', icon: '💡' },
    { value: 'legal', label: 'Právní dokumenty', icon: '⚖️' },
    { value: 'schedule', label: 'Harmonogramy', icon: '📅' },
    { value: 'other', label: 'Ostatní', icon: '📎' }
  ];

  const categories = [
    { value: 'all', label: 'Všechny fáze', icon: '🎬' },
    { value: 'pre_production', label: 'Příprava', icon: '📝' },
    { value: 'production', label: 'Natáčení', icon: '🎥' },
    { value: 'post_production', label: 'Postprodukce', icon: '✂️' },
    { value: 'admin', label: 'Administrativa', icon: '📊' },
    { value: 'legal', label: 'Právní', icon: '⚖️' }
  ];

  const statuses = [
    { value: 'all', label: 'Všechny stavy', icon: '🔍' },
    { value: 'draft', label: 'Koncept', icon: '✏️' },
    { value: 'review', label: 'Na review', icon: '👁️' },
    { value: 'approved', label: 'Schváleno', icon: '✅' },
    { value: 'final', label: 'Finální', icon: '🔒' },
    { value: 'archived', label: 'Archivováno', icon: '📦' }
  ];

  const sortOptions = [
    { value: 'lastModified', label: 'Datum úpravy' },
    { value: 'uploadedAt', label: 'Datum nahrání' },
    { value: 'title', label: 'Název' },
    { value: 'size', label: 'Velikost' },
    { value: 'type', label: 'Typ' },
    { value: 'status', label: 'Status' }
  ];

  const viewModes = [
    { id: 'grid' as ViewMode, label: 'Mřížka', icon: '⊞' },
    { id: 'list' as ViewMode, label: 'Seznam', icon: '☰' }
  ];

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getQuickFilters = () => {
    const filters = [];
    
    if (analytics.pendingApprovals > 0) {
      filters.push({
        label: `${analytics.pendingApprovals} čeká na schválení`,
        action: () => onFilterStatusChange('review'),
        color: '#F59E0B'
      });
    }

    if (analytics.recentlyModified > 0) {
      filters.push({
        label: `${analytics.recentlyModified} upraveno tento týden`,
        action: () => {}, // Custom filter logic would go here
        color: '#10B981'
      });
    }

    if (analytics.byStatus.draft > 0) {
      filters.push({
        label: `${analytics.byStatus.draft} konceptů`,
        action: () => onFilterStatusChange('draft'),
        color: '#6B7280'
      });
    }

    return filters;
  };

  const getCurrentAlert = () => {
    if (analytics.pendingApprovals > 0) {
      return {
        level: 'warning',
        message: `${analytics.pendingApprovals} dokumentů čeká na schválení`,
        color: '#F59E0B'
      };
    }
    
    if (analytics.byStatus.review > 5) {
      return {
        level: 'info',
        message: `${analytics.byStatus.review} dokumentů na review`,
        color: '#3B82F6'
      };
    }

    return {
      level: 'success',
      message: 'Dokumenty jsou v pořádku',
      color: '#10B981'
    };
  };

  const currentAlert = getCurrentAlert();

  return (
    <SearchContainer>
      {/* Main Search Bar */}
      <SearchHeader>
        <SearchBarSection>
          <SearchInputContainer>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput
              type="text"
              placeholder="Hledat dokumenty, názvy, tagy..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <ClearButton onClick={() => onSearchChange('')}>
                ✕
              </ClearButton>
            )}
          </SearchInputContainer>

          <QuickActions>
            <ViewModeSelector>
              {viewModes.map(mode => (
                <ViewModeButton
                  key={mode.id}
                  $isActive={viewMode === mode.id}
                  onClick={() => onViewModeChange(mode.id)}
                  title={mode.label}
                >
                  {mode.icon}
                </ViewModeButton>
              ))}
            </ViewModeSelector>

            <PrimaryButton onClick={onUploadClick} size="sm">
              📤 Nahrát dokument
            </PrimaryButton>
          </QuickActions>
        </SearchBarSection>

        {/* Status Alert */}
        <StatusAlert $level={currentAlert.level}>
          <AlertIcon>
            {currentAlert.level === 'warning' && '⚠️'}
            {currentAlert.level === 'info' && 'ℹ️'}
            {currentAlert.level === 'success' && '✅'}
          </AlertIcon>
          <AlertMessage>{currentAlert.message}</AlertMessage>
        </StatusAlert>
      </SearchHeader>

      {/* Quick Filters */}
      <QuickFiltersSection>
        <QuickFiltersList>
          {getQuickFilters().map((filter, index) => (
            <QuickFilterButton
              key={index}
              onClick={filter.action}
              $color={filter.color}
            >
              {filter.label}
            </QuickFilterButton>
          ))}
        </QuickFiltersList>

        <FilterToggle onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
          🔧 {showAdvancedFilters ? 'Skrýt' : 'Zobrazit'} filtry
        </FilterToggle>
      </QuickFiltersSection>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <AdvancedFilters>
          <GlassCard>
            <CardContent>
              <FiltersGrid>
                {/* Type Filter */}
                <FilterGroup>
                  <FilterLabel>Typ dokumentu:</FilterLabel>
                  <FilterSelect 
                    value={filterType} 
                    onChange={(e) => onFilterTypeChange(e.target.value)}
                  >
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </FilterSelect>
                </FilterGroup>

                {/* Category Filter */}
                <FilterGroup>
                  <FilterLabel>Fáze projektu:</FilterLabel>
                  <FilterSelect 
                    value={filterCategory} 
                    onChange={(e) => onFilterCategoryChange(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </FilterSelect>
                </FilterGroup>

                {/* Status Filter */}
                <FilterGroup>
                  <FilterLabel>Status:</FilterLabel>
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

                {/* Sort Controls */}
                <FilterGroup>
                  <FilterLabel>Řadit podle:</FilterLabel>
                  <SortControls>
                    <FilterSelect 
                      value={sortBy} 
                      onChange={(e) => onSortByChange(e.target.value)}
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </FilterSelect>
                    <SortOrderButton 
                      onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                      title={sortOrder === 'asc' ? 'Vzestupně' : 'Sestupně'}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </SortOrderButton>
                  </SortControls>
                </FilterGroup>
              </FiltersGrid>

              {/* Filter Actions */}
              <FilterActions>
                <SecondaryButton 
                  size="sm"
                  onClick={() => {
                    onFilterTypeChange('all');
                    onFilterCategoryChange('all');
                    onFilterStatusChange('all');
                    onSearchChange('');
                  }}
                >
                  🔄 Vyčistit filtry
                </SecondaryButton>
              </FilterActions>
            </CardContent>
          </GlassCard>
        </AdvancedFilters>
      )}

      {/* Document Stats */}
      <DocumentStats>
        <StatsCard>
          <StatItem>
            <StatIcon>📁</StatIcon>
            <StatValue>{analytics.totalDocs}</StatValue>
            <StatLabel>Dokumentů</StatLabel>
          </StatItem>

          <StatItem>
            <StatIcon>💾</StatIcon>
            <StatValue>{formatFileSize(analytics.totalSize)}</StatValue>
            <StatLabel>Celková velikost</StatLabel>
          </StatItem>

          <StatItem $status={analytics.pendingApprovals > 0 ? 'warning' : 'neutral'}>
            <StatIcon>⏳</StatIcon>
            <StatValue>{analytics.pendingApprovals}</StatValue>
            <StatLabel>Čeká na schválení</StatLabel>
          </StatItem>

          <StatItem>
            <StatIcon>✅</StatIcon>
            <StatValue>{analytics.byStatus.approved + analytics.byStatus.final}</StatValue>
            <StatLabel>Schváleno</StatLabel>
          </StatItem>

          <StatItem>
            <StatIcon>📝</StatIcon>
            <StatValue>{analytics.byType.script}</StatValue>
            <StatLabel>Scénářů</StatLabel>
          </StatItem>

          <StatItem>
            <StatIcon>📄</StatIcon>
            <StatValue>{analytics.byType.contract}</StatValue>
            <StatLabel>Smluv</StatLabel>
          </StatItem>
        </StatsCard>
      </DocumentStats>
    </SearchContainer>
  );
}

// Styled Components
const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const SearchHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBarSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  flex: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 500px;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.md} ${props => props.theme.spacing.md} ${props => props.theme.spacing['3xl']};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.md};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.lg};
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  
  &:hover {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};
  }
`;

const QuickActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ViewModeSelector = styled.div`
  display: flex;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
`;

const ViewModeButton = styled.button<{ $isActive: boolean }>`
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
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  font-size: ${props => props.theme.typography.fontSize.lg};

  &:hover {
    background: ${props => props.$isActive 
      ? props.theme.colors.primary 
      : props.theme.colors.surface
    };
  }
`;

const StatusAlert = styled.div<{ $level: 'success' | 'info' | 'warning' }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => {
    const colors = {
      success: 'rgba(16, 185, 129, 0.1)',
      info: 'rgba(59, 130, 246, 0.1)',
      warning: 'rgba(245, 158, 11, 0.1)'
    };
    return colors[props.$level];
  }};
  border: 1px solid ${props => {
    const colors = {
      success: 'rgba(16, 185, 129, 0.3)',
      info: 'rgba(59, 130, 246, 0.3)',
      warning: 'rgba(245, 158, 11, 0.3)'
    };
    return colors[props.$level];
  }};
`;

const AlertIcon = styled.span`
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const AlertMessage = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const QuickFiltersSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const QuickFiltersList = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const QuickFilterButton = styled.button<{ $color: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.$color}40;
  background: ${props => props.$color}10;
  color: ${props => props.$color};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  font-size: ${props => props.theme.typography.fontSize.sm};
  white-space: nowrap;

  &:hover {
    background: ${props => props.$color}20;
    transform: translateY(-1px);
  }
`;

const FilterToggle = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  font-size: ${props => props.theme.typography.fontSize.sm};

  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const AdvancedFilters = styled.div``;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const FilterLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
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

const SortControls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const SortOrderButton = styled.button`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.lg};
  min-width: 40px;
  
  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.md};
`;

const DocumentStats = styled.div``;

const StatsCard = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
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
      warning: 'rgba(245, 158, 11, 0.1)',
      neutral: 'transparent'
    };
    return colors[props.$status as keyof typeof colors] || 'transparent';
  }};
  border: 1px solid ${props => {
    const colors = {
      warning: 'rgba(245, 158, 11, 0.3)',
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
