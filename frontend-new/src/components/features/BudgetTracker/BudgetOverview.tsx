import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';

interface BudgetOverviewProps {
  budget: {
    total: number;
    allocated: number;
    spent: number;
    remaining: number;
    categories: Array<{
      id: string;
      category: string;
      allocated: number;
      spent: number;
      status: 'on_track' | 'warning' | 'critical';
    }>;
  };
  analytics: {
    totalAllocated: number;
    totalSpent: number;
    utilizationRate: number;
    forecastVariance: number;
    categoriesOverBudget: number;
    categoriesWarning: number;
    categoriesCritical: number;
    burnRate: number;
  };
  onCategorySelect: (categoryId: string) => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
}

export function BudgetOverview({ 
  budget, 
  analytics, 
  onCategorySelect, 
  formatCurrency, 
  getStatusColor 
}: BudgetOverviewProps) {

  const utilizationPercentage = Math.min(100, analytics.utilizationRate);
  const isOverBudget = analytics.totalSpent > analytics.totalAllocated;
  const isWarning = analytics.utilizationRate > 80;

  return (
    <OverviewContainer>
      {/* Main Budget Summary */}
      <MainSummary>
        <SummaryCard variant="glass">
          <CardHeader>
            <SummaryTitle>Celkový rozpočet</SummaryTitle>
            <SummarySubtitle>Aktuální stav projektu</SummarySubtitle>
          </CardHeader>
          <CardContent>
            <BudgetProgressSection>
              <BudgetAmounts>
                <MainAmount $isOverBudget={isOverBudget}>
                  {formatCurrency(budget.remaining)}
                </MainAmount>
                <AmountLabel>Zbývá k využití</AmountLabel>
              </BudgetAmounts>
              
              <ProgressIndicator>
                <ProgressRing>
                  <ProgressCircle 
                    $percentage={utilizationPercentage}
                    $color={isOverBudget ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981'}
                  />
                  <ProgressText>
                    <PercentageValue>{Math.round(utilizationPercentage)}%</PercentageValue>
                    <PercentageLabel>využito</PercentageLabel>
                  </ProgressText>
                </ProgressRing>
              </ProgressIndicator>
            </BudgetProgressSection>

            <BudgetBreakdown>
              <BreakdownItem>
                <BreakdownLabel>Alokováno</BreakdownLabel>
                <BreakdownValue>{formatCurrency(analytics.totalAllocated)}</BreakdownValue>
              </BreakdownItem>
              <BreakdownItem>
                <BreakdownLabel>Utraceno</BreakdownLabel>
                <BreakdownValue $color={isOverBudget ? '#EF4444' : '#10B981'}>
                  {formatCurrency(analytics.totalSpent)}
                </BreakdownValue>
              </BreakdownItem>
              <BreakdownItem>
                <BreakdownLabel>Denní burn rate</BreakdownLabel>
                <BreakdownValue>{formatCurrency(analytics.burnRate)}</BreakdownValue>
              </BreakdownItem>
            </BudgetBreakdown>
          </CardContent>
        </SummaryCard>
      </MainSummary>

      {/* Key Metrics Grid */}
      <MetricsGrid>
        <MetricCard $alertLevel={analytics.categoriesWarning > 0 ? 'warning' : 'success'}>
          <MetricIcon>⚠️</MetricIcon>
          <MetricValue>{analytics.categoriesWarning}</MetricValue>
          <MetricLabel>Kategorie v warning</MetricLabel>
        </MetricCard>

        <MetricCard $alertLevel={analytics.categoriesCritical > 0 ? 'critical' : 'success'}>
          <MetricIcon>🚨</MetricIcon>
          <MetricValue>{analytics.categoriesCritical}</MetricValue>
          <MetricLabel>Kritické kategorie</MetricLabel>
        </MetricCard>

        <MetricCard $alertLevel={analytics.categoriesOverBudget > 0 ? 'critical' : 'success'}>
          <MetricIcon>💸</MetricIcon>
          <MetricValue>{analytics.categoriesOverBudget}</MetricValue>
          <MetricLabel>Přečerpané kategorie</MetricLabel>
        </MetricCard>

        <MetricCard $alertLevel={analytics.forecastVariance > 0 ? 'warning' : 'success'}>
          <MetricIcon>📈</MetricIcon>
          <MetricValue>
            {analytics.forecastVariance > 0 ? '+' : ''}{formatCurrency(Math.abs(analytics.forecastVariance))}
          </MetricValue>
          <MetricLabel>Forecast variance</MetricLabel>
        </MetricCard>
      </MetricsGrid>

      {/* Categories Quick View */}
      <CategoriesQuickView>
        <GlassCard>
          <CardHeader>
            <h3>Kategorie rozpočtu</h3>
            <QuickViewSubtitle>Klikněte na kategorii pro detail</QuickViewSubtitle>
          </CardHeader>
          <CardContent>
            <CategoriesList>
              {budget.categories.map(category => {
                const utilizationPercent = (category.spent / category.allocated) * 100;
                const isOverBudget = category.spent > category.allocated;
                
                return (
                  <CategoryQuickItem 
                    key={category.id}
                    onClick={() => onCategorySelect(category.id)}
                    $status={category.status}
                  >
                    <CategoryInfo>
                      <CategoryName>{category.category}</CategoryName>
                      <CategoryProgress>
                        <ProgressBar>
                          <ProgressFill 
                            $percentage={Math.min(100, utilizationPercent)}
                            $color={getStatusColor(category.status)}
                          />
                        </ProgressBar>
                        <ProgressLabel>
                          {formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
                          {isOverBudget && <OverBudgetIndicator>!</OverBudgetIndicator>}
                        </ProgressLabel>
                      </CategoryProgress>
                    </CategoryInfo>
                    
                    <CategoryMetrics>
                      <StatusDot $color={getStatusColor(category.status)} />
                      <UtilizationBadge $status={category.status}>
                        {Math.round(utilizationPercent)}%
                      </UtilizationBadge>
                    </CategoryMetrics>
                  </CategoryQuickItem>
                );
              })}
            </CategoriesList>
          </CardContent>
        </GlassCard>
      </CategoriesQuickView>
    </OverviewContainer>
  );
}

// Animations
const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }
  50% { 
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
  }
`;

const progressAnimation = keyframes`
  from { stroke-dashoffset: 440; }
  to { stroke-dashoffset: var(--target-offset); }
`;

// Styled Components
const OverviewContainer = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.xl};
  grid-template-areas:
    "summary metrics"
    "categories categories";
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  
  @media (max-width: 1024px) {
    grid-template-areas:
      "summary"
      "metrics"
      "categories";
    grid-template-columns: 1fr;
  }
`;

const MainSummary = styled.div`
  grid-area: summary;
`;

const SummaryCard = styled(GlassCard)`
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1) 0%, 
    rgba(6, 78, 59, 0.1) 100%
  );
  border: 1px solid rgba(16, 185, 129, 0.2);
  animation: ${pulseGlow} 3s ease-in-out infinite;
`;

const SummaryTitle = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  background: linear-gradient(135deg, #10B981, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SummarySubtitle = styled.p`
  margin: ${props => props.theme.spacing.xs} 0 0 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const BudgetProgressSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing['2xl']};
  margin: ${props => props.theme.spacing.xl} 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const BudgetAmounts = styled.div`
  flex: 1;
`;

const MainAmount = styled.div<{ $isOverBudget: boolean }>`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.$isOverBudget ? '#EF4444' : '#10B981'};
  line-height: 1;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const AmountLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProgressRing = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
`;

const ProgressCircle = styled.div<{ $percentage: number; $color: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    ${props => props.$color} ${props => props.$percentage * 3.6}deg,
    ${props => props.theme.colors.border} ${props => props.$percentage * 3.6}deg
  );
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    width: 100px;
    height: 100px;
    background: ${props => props.theme.colors.surface};
    border-radius: 50%;
  }
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1;
`;

const PercentageValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
`;

const PercentageLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const BudgetBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.lg};
  padding-top: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BreakdownItem = styled.div`
  text-align: center;
`;

const BreakdownLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const BreakdownValue = styled.div<{ $color?: string }>`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.$color || props.theme.colors.text};
`;

const MetricsGrid = styled.div`
  grid-area: metrics;
  display: grid;
  gap: ${props => props.theme.spacing.md};
  grid-template-columns: repeat(2, 1fr);
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MetricCard = styled(Card)<{ $alertLevel: 'success' | 'warning' | 'critical' }>`
  text-align: center;
  background: ${props => {
    const colors = {
      success: 'rgba(16, 185, 129, 0.1)',
      warning: 'rgba(245, 158, 11, 0.1)',
      critical: 'rgba(239, 68, 68, 0.1)'
    };
    return colors[props.$alertLevel];
  }};
  border: 1px solid ${props => {
    const colors = {
      success: 'rgba(16, 185, 129, 0.3)',
      warning: 'rgba(245, 158, 11, 0.3)',
      critical: 'rgba(239, 68, 68, 0.3)'
    };
    return colors[props.$alertLevel];
  }};
`;

const MetricIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const CategoriesQuickView = styled.div`
  grid-area: categories;
`;

const QuickViewSubtitle = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const CategoriesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const CategoryQuickItem = styled.button<{ $status: string }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => {
    const colors = {
      on_track: 'rgba(16, 185, 129, 0.2)',
      warning: 'rgba(245, 158, 11, 0.2)',
      critical: 'rgba(239, 68, 68, 0.2)'
    };
    return colors[props.$status as keyof typeof colors] || props.theme.colors.border;
  }};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  text-align: left;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const CategoryInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CategoryName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CategoryProgress = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: ${props => props.theme.colors.border};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color};
  transition: width ${props => props.theme.transitions.normal};
`;

const ProgressLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const OverBudgetIndicator = styled.span`
  color: #EF4444;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const CategoryMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const StatusDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color};
`;

const UtilizationBadge = styled.div<{ $status: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  background: ${props => {
    const colors = {
      on_track: 'rgba(16, 185, 129, 0.2)',
      warning: 'rgba(245, 158, 11, 0.2)',
      critical: 'rgba(239, 68, 68, 0.2)'
    };
    return colors[props.$status as keyof typeof colors] || props.theme.colors.background;
  }};
  color: ${props => {
    const colors = {
      on_track: '#10B981',
      warning: '#F59E0B',
      critical: '#EF4444'
    };
    return colors[props.$status as keyof typeof colors] || props.theme.colors.text;
  }};
`;
