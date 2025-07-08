import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';
import { SecondaryButton, OutlineButton } from '../../ui/Button';

interface CashFlowForecastProps {
  categories: Array<{
    id: string;
    category: string;
    allocated: number;
    spent: number;
    forecasted: number;
    status: 'on_track' | 'warning' | 'critical';
  }>;
  analytics: {
    burnRate: number;
    totalAllocated: number;
    totalSpent: number;
  };
  projectId: string;
  formatCurrency: (amount: number) => string;
}

type ForecastPeriod = '1month' | '3months' | '6months' | 'completion';

export function CashFlowForecast({ 
  categories, 
  analytics, 
  projectId, 
  formatCurrency 
}: CashFlowForecastProps) {
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>('3months');
  const [showScenarios, setShowScenarios] = useState(false);

  const forecastPeriods = [
    { id: '1month' as ForecastPeriod, label: '1 měsíc', days: 30 },
    { id: '3months' as ForecastPeriod, label: '3 měsíce', days: 90 },
    { id: '6months' as ForecastPeriod, label: '6 měsíců', days: 180 },
    { id: 'completion' as ForecastPeriod, label: 'Do konce', days: 365 }
  ];

  // Výpočet forecast dat
  const currentPeriod = forecastPeriods.find(p => p.id === forecastPeriod)!;
  const projectedSpend = analytics.burnRate * currentPeriod.days;
  const projectedTotal = analytics.totalSpent + projectedSpend;
  const projectedRemaining = analytics.totalAllocated - projectedTotal;
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + Math.ceil((analytics.totalAllocated - analytics.totalSpent) / analytics.burnRate));

  // Scénáře
  const scenarios = [
    {
      name: 'Optimistický',
      factor: 0.8,
      description: 'Snížení burn rate o 20%',
      color: '#10B981'
    },
    {
      name: 'Realistický',
      factor: 1.0,
      description: 'Současný burn rate',
      color: '#6B7280'
    },
    {
      name: 'Pesimistický',
      factor: 1.2,
      description: 'Zvýšení burn rate o 20%',
      color: '#EF4444'
    }
  ];

  const getScenarioProjection = (factor: number) => {
    const adjustedBurnRate = analytics.burnRate * factor;
    const projectedSpend = adjustedBurnRate * currentPeriod.days;
    const projectedTotal = analytics.totalSpent + projectedSpend;
    const projectedRemaining = analytics.totalAllocated - projectedTotal;
    
    return {
      projectedSpend,
      projectedTotal,
      projectedRemaining,
      daysToCompletion: Math.ceil((analytics.totalAllocated - analytics.totalSpent) / adjustedBurnRate)
    };
  };

  const isOverBudget = projectedTotal > analytics.totalAllocated;

  return (
    <ForecastContainer>
      {/* Forecast Controls */}
      <ForecastHeader>
        <ForecastTitle>
          <h2>Cash Flow prognóza</h2>
          <p>Projekce budoucích výdajů</p>
        </ForecastTitle>
        
        <ForecastControls>
          <PeriodSelector>
            {forecastPeriods.map(period => (
              <PeriodButton
                key={period.id}
                $isActive={forecastPeriod === period.id}
                onClick={() => setForecastPeriod(period.id)}
              >
                {period.label}
              </PeriodButton>
            ))}
          </PeriodSelector>
          
          <SecondaryButton 
            onClick={() => setShowScenarios(!showScenarios)}
          >
            📊 {showScenarios ? 'Skrýt' : 'Zobrazit'} scénáře
          </SecondaryButton>
        </ForecastControls>
      </ForecastHeader>

      {/* Main Forecast */}
      <ForecastContent>
        <MainForecast>
          <GlassCard>
            <CardHeader>
              <h3>Prognóza na {currentPeriod.label}</h3>
            </CardHeader>
            <CardContent>
              <ForecastMetrics>
                <MetricCard $alert={isOverBudget}>
                  <MetricIcon>💰</MetricIcon>
                  <MetricValue $isNegative={projectedRemaining < 0}>
                    {formatCurrency(Math.abs(projectedRemaining))}
                  </MetricValue>
                  <MetricLabel>
                    {projectedRemaining >= 0 ? 'Zbude' : 'Překročení'}
                  </MetricLabel>
                </MetricCard>

                <MetricCard>
                  <MetricIcon>🔥</MetricIcon>
                  <MetricValue>
                    {formatCurrency(analytics.burnRate)}
                  </MetricValue>
                  <MetricLabel>Denní burn rate</MetricLabel>
                </MetricCard>

                <MetricCard>
                  <MetricIcon>📅</MetricIcon>
                  <MetricValue>
                    {Math.ceil((analytics.totalAllocated - analytics.totalSpent) / analytics.burnRate)}
                  </MetricValue>
                  <MetricLabel>Dní do konce</MetricLabel>
                </MetricCard>

                <MetricCard>
                  <MetricIcon>🎯</MetricIcon>
                  <MetricValue>
                    {completionDate.toLocaleDateString('cs-CZ')}
                  </MetricValue>
                  <MetricLabel>Očekávaný konec</MetricLabel>
                </MetricCard>
              </ForecastMetrics>

              {/* Forecast Timeline */}
              <ForecastTimeline>
                <TimelineHeader>
                  <h4>Průběh rozpočtu</h4>
                </TimelineHeader>
                
                <TimelineChart>
                  <TimelineBar>
                    <SpentBar 
                      $percentage={(analytics.totalSpent / analytics.totalAllocated) * 100}
                    />
                    <ProjectedBar 
                      $percentage={(projectedSpend / analytics.totalAllocated) * 100}
                      $startOffset={(analytics.totalSpent / analytics.totalAllocated) * 100}
                    />
                  </TimelineBar>
                  
                  <TimelineLabels>
                    <TimelineLabel $position={0}>Start</TimelineLabel>
                    <TimelineLabel $position={(analytics.totalSpent / analytics.totalAllocated) * 100}>
                      Aktuálně ({Math.round((analytics.totalSpent / analytics.totalAllocated) * 100)}%)
                    </TimelineLabel>
                    <TimelineLabel $position={100}>Konec</TimelineLabel>
                  </TimelineLabels>
                </TimelineChart>
              </ForecastTimeline>
            </CardContent>
          </GlassCard>
        </MainForecast>

        {/* Category Forecasts */}
        <CategoryForecasts>
          <GlassCard>
            <CardHeader>
              <h3>Prognóza按kategorie</h3>
            </CardHeader>
            <CardContent>
              <CategoryForecastList>
                {categories.map(category => {
                  const categoryBurnRate = category.spent / Math.max(1, 30); // Placeholder
                  const categoryProjection = categoryBurnRate * currentPeriod.days;
                  const categoryRemaining = category.allocated - category.spent - categoryProjection;
                  
                  return (
                    <CategoryForecastItem key={category.id}>
                      <CategoryForecastHeader>
                        <CategoryForecastName>{category.category}</CategoryForecastName>
                        <CategoryForecastStatus $isOverBudget={categoryRemaining < 0}>
                          {categoryRemaining >= 0 
                            ? `+${formatCurrency(categoryRemaining)}`
                            : `${formatCurrency(categoryRemaining)}`
                          }
                        </CategoryForecastStatus>
                      </CategoryForecastHeader>
                      
                      <CategoryForecastBar>
                        <ForecastProgressBar>
                          <ForecastProgressFill
                            $percentage={Math.min(100, (category.spent / category.allocated) * 100)}
                            $color="#10B981"
                          />
                          <ForecastProjectionFill
                            $percentage={Math.min(100, (categoryProjection / category.allocated) * 100)}
                            $startOffset={Math.min(100, (category.spent / category.allocated) * 100)}
                            $color="#F59E0B"
                          />
                        </ForecastProgressBar>
                      </CategoryForecastBar>
                    </CategoryForecastItem>
                  );
                })}
              </CategoryForecastList>
            </CardContent>
          </GlassCard>
        </CategoryForecasts>
      </ForecastContent>

      {/* Scenarios */}
      {showScenarios && (
        <ScenariosSection>
          <GlassCard>
            <CardHeader>
              <h3>Scénáře vývoje</h3>
            </CardHeader>
            <CardContent>
              <ScenariosGrid>
                {scenarios.map(scenario => {
                  const projection = getScenarioProjection(scenario.factor);
                  
                  return (
                    <ScenarioCard key={scenario.name} $color={scenario.color}>
                      <ScenarioHeader>
                        <ScenarioName>{scenario.name}</ScenarioName>
                        <ScenarioDescription>{scenario.description}</ScenarioDescription>
                      </ScenarioHeader>
                      
                      <ScenarioMetrics>
                        <ScenarioMetric>
                          <ScenarioMetricLabel>Zbývající rozpočet:</ScenarioMetricLabel>
                          <ScenarioMetricValue $isNegative={projection.projectedRemaining < 0}>
                            {formatCurrency(Math.abs(projection.projectedRemaining))}
                          </ScenarioMetricValue>
                        </ScenarioMetric>
                        
                        <ScenarioMetric>
                          <ScenarioMetricLabel>Dní do konce:</ScenarioMetricLabel>
                          <ScenarioMetricValue>
                            {projection.daysToCompletion}
                          </ScenarioMetricValue>
                        </ScenarioMetric>
                      </ScenarioMetrics>
                    </ScenarioCard>
                  );
                })}
              </ScenariosGrid>
            </CardContent>
          </GlassCard>
        </ScenariosSection>
      )}
    </ForecastContainer>
  );
}

// Styled Components
const ForecastContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const ForecastHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ForecastTitle = styled.div`
  h2 {
    margin: 0;
    color: ${props => props.theme.colors.text};
  }
  
  p {
    margin: ${props => props.theme.spacing.xs} 0 0 0;
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
`;

const ForecastControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PeriodSelector = styled.div`
  display: flex;
  background: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
`;

const PeriodButton = styled.button<{ $isActive: boolean }>`
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
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;

  &:hover {
    background: ${props => props.$isActive 
      ? props.theme.colors.primary 
      : props.theme.colors.surface
    };
  }
`;

const ForecastContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainForecast = styled.div``;

const ForecastMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div<{ $alert?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.$alert 
    ? 'rgba(239, 68, 68, 0.1)' 
    : props.theme.colors.background
  };
  border: 1px solid ${props => props.$alert 
    ? 'rgba(239, 68, 68, 0.3)' 
    : props.theme.colors.border
  };
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const MetricIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const MetricValue = styled.div<{ $isNegative?: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.$isNegative ? '#EF4444' : props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ForecastTimeline = styled.div``;

const TimelineHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  
  h4 {
    margin: 0;
    color: ${props => props.theme.colors.text};
  }
`;

const TimelineChart = styled.div`
  position: relative;
`;

const TimelineBar = styled.div`
  position: relative;
  height: 40px;
  background: ${props => props.theme.colors.border};
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SpentBar = styled.div<{ $percentage: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(135deg, #10B981, #059669);
  border-radius: 20px;
`;

const ProjectedBar = styled.div<{ 
  $percentage: number; 
  $startOffset: number; 
}>`
  position: absolute;
  top: 0;
  left: ${props => props.$startOffset}%;
  height: 100%;
  width: ${props => props.$percentage}%;
  background: repeating-linear-gradient(
    45deg,
    #F59E0B,
    #F59E0B 8px,
    #FCD34D 8px,
    #FCD34D 16px
  );
  border-radius: 0 20px 20px 0;
`;

const TimelineLabels = styled.div`
  position: relative;
  height: 20px;
`;

const TimelineLabel = styled.div<{ $position: number }>`
  position: absolute;
  left: ${props => props.$position}%;
  transform: translateX(-50%);
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
`;

const CategoryForecasts = styled.div``;

const CategoryForecastList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const CategoryForecastItem = styled.div``;

const CategoryForecastHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CategoryForecastName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const CategoryForecastStatus = styled.div<{ $isOverBudget: boolean }>`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.$isOverBudget ? '#EF4444' : '#10B981'};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const CategoryForecastBar = styled.div``;

const ForecastProgressBar = styled.div`
  position: relative;
  height: 12px;
  background: ${props => props.theme.colors.border};
  border-radius: 6px;
  overflow: hidden;
`;

const ForecastProgressFill = styled.div<{ 
  $percentage: number; 
  $color: string; 
}>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color};
`;

const ForecastProjectionFill = styled.div<{ 
  $percentage: number; 
  $startOffset: number;
  $color: string; 
}>`
  position: absolute;
  top: 0;
  left: ${props => props.$startOffset}%;
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color};
  opacity: 0.7;
`;

const ScenariosSection = styled.div``;

const ScenariosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ScenarioCard = styled.div<{ $color: string }>`
  padding: ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.$color};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => `${props.$color}08`};
`;

const ScenarioHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ScenarioName = styled.h4`
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  color: ${props => props.theme.colors.text};
`;

const ScenarioDescription = styled.p`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ScenarioMetrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const ScenarioMetric = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ScenarioMetricLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ScenarioMetricValue = styled.span<{ $isNegative?: boolean }>`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.$isNegative ? '#EF4444' : props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;
