import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';
import { SecondaryButton, OutlineButton } from '../../ui/Button';

interface BudgetChartProps {
  categories: Array<{
    id: string;
    category: string;
    allocated: number;
    spent: number;
    forecasted: number;
    status: 'on_track' | 'warning' | 'critical';
  }>;
  analytics: {
    totalAllocated: number;
    totalSpent: number;
    utilizationRate: number;
  };
  formatCurrency: (amount: number) => string;
}

type ChartType = 'pie' | 'bar' | 'timeline' | 'comparison';

export function BudgetChart({ categories, analytics, formatCurrency }: BudgetChartProps) {
  const [chartType, setChartType] = useState<ChartType>('pie');

  const chartTypes = [
    { id: 'pie' as ChartType, label: 'Pie Chart', icon: '🥧' },
    { id: 'bar' as ChartType, label: 'Bar Chart', icon: '📊' },
    { id: 'timeline' as ChartType, label: 'Timeline', icon: '📈' },
    { id: 'comparison' as ChartType, label: 'Porovnání', icon: '⚖️' }
  ];

  // Příprava dat pro grafy
  const chartData = categories.map(cat => ({
    ...cat,
    utilization: (cat.spent / cat.allocated) * 100,
    remaining: cat.allocated - cat.spent,
    variance: cat.forecasted - cat.allocated
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <ChartContainer>
      {/* Chart Controls */}
      <ChartHeader>
        <ChartTitle>
          <h2>Analýza rozpočtu</h2>
          <p>Vizuální přehled dat</p>
        </ChartTitle>
        
        <ChartControls>
          {chartTypes.map(type => (
            <ChartButton
              key={type.id}
              $isActive={chartType === type.id}
              onClick={() => setChartType(type.id)}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </ChartButton>
          ))}
        </ChartControls>
      </ChartHeader>

      {/* Chart Content */}
      <ChartContent>
        {chartType === 'pie' && (
          <PieChartView>
            <GlassCard>
              <CardHeader>
                <h3>Rozpočet按категoriím</h3>
              </CardHeader>
              <CardContent>
                <PieChartContainer>
                  <PieChart>
                    {/* Simulace pie chart pomocí CSS */}
                    <PieSlice
                      $percentage={30}
                      $color="#10B981"
                      $offset={0}
                    />
                    <PieSlice
                      $percentage={25}
                      $color="#F59E0B"
                      $offset={30}
                    />
                    <PieSlice
                      $percentage={20}
                      $color="#3B82F6"
                      $offset={55}
                    />
                    <PieSlice
                      $percentage={15}
                      $color="#8B5CF6"
                      $offset={75}
                    />
                    <PieSlice
                      $percentage={10}
                      $color="#EF4444"
                      $offset={90}
                    />
                  </PieChart>
                  
                  <PieLegend>
                    {chartData.slice(0, 5).map((cat, index) => (
                      <LegendItem key={cat.id}>
                        <LegendColor $color={getStatusColor(cat.status)} />
                        <LegendLabel>{cat.category}</LegendLabel>
                        <LegendValue>{formatCurrency(cat.allocated)}</LegendValue>
                      </LegendItem>
                    ))}
                  </PieLegend>
                </PieChartContainer>
              </CardContent>
            </GlassCard>
          </PieChartView>
        )}

        {chartType === 'bar' && (
          <BarChartView>
            <GlassCard>
              <CardHeader>
                <h3>Využití rozpočtu</h3>
              </CardHeader>
              <CardContent>
                <BarChartContainer>
                  {chartData.map(cat => (
                    <BarItem key={cat.id}>
                      <BarLabel>{cat.category}</BarLabel>
                      <BarContainer>
                        <Bar
                          $percentage={Math.min(100, cat.utilization)}
                          $color={getStatusColor(cat.status)}
                        />
                        {cat.utilization > 100 && (
                          <OverageBar
                            $percentage={Math.min(50, cat.utilization - 100)}
                          />
                        )}
                      </BarContainer>
                      <BarValue>{Math.round(cat.utilization)}%</BarValue>
                    </BarItem>
                  ))}
                </BarChartContainer>
              </CardContent>
            </GlassCard>
          </BarChartView>
        )}

        {chartType === 'timeline' && (
          <TimelineView>
            <GlassCard>
              <CardHeader>
                <h3>Timeline analýza</h3>
              </CardHeader>
              <CardContent>
                <TimelinePlaceholder>
                  <TimelineIcon>📈</TimelineIcon>
                  <TimelineMessage>
                    Timeline chart bude implementován v další iteraci
                  </TimelineMessage>
                  <TimelineSubMessage>
                    Bude obsahovat burn rate, forecast trends a milestones
                  </TimelineSubMessage>
                </TimelinePlaceholder>
              </CardContent>
            </GlassCard>
          </TimelineView>
        )}

        {chartType === 'comparison' && (
          <ComparisonView>
            <ComparisonGrid>
              <GlassCard>
                <CardHeader>
                  <h3>Budget vs. Actual</h3>
                </CardHeader>
                <CardContent>
                  <ComparisonChart>
                    {chartData.map(cat => (
                      <ComparisonItem key={cat.id}>
                        <ComparisonLabel>{cat.category}</ComparisonLabel>
                        <ComparisonBars>
                          <ComparisonBar $type="allocated">
                            <ComparisonFill 
                              $percentage={100}
                              $color="#6B7280"
                            />
                            <ComparisonValue>
                              {formatCurrency(cat.allocated)}
                            </ComparisonValue>
                          </ComparisonBar>
                          <ComparisonBar $type="spent">
                            <ComparisonFill 
                              $percentage={(cat.spent / cat.allocated) * 100}
                              $color={getStatusColor(cat.status)}
                            />
                            <ComparisonValue>
                              {formatCurrency(cat.spent)}
                            </ComparisonValue>
                          </ComparisonBar>
                        </ComparisonBars>
                      </ComparisonItem>
                    ))}
                  </ComparisonChart>
                </CardContent>
              </GlassCard>

              <GlassCard>
                <CardHeader>
                  <h3>Forecast vs. Budget</h3>
                </CardHeader>
                <CardContent>
                  <ForecastChart>
                    {chartData.map(cat => (
                      <ForecastItem key={cat.id}>
                        <ForecastLabel>{cat.category}</ForecastLabel>
                        <ForecastVariance 
                          $isPositive={cat.variance > 0}
                        >
                          {cat.variance > 0 ? '+' : ''}{formatCurrency(cat.variance)}
                        </ForecastVariance>
                        <ForecastBar>
                          <ForecastFill 
                            $percentage={Math.abs(cat.variance) / cat.allocated * 100}
                            $isPositive={cat.variance > 0}
                          />
                        </ForecastBar>
                      </ForecastItem>
                    ))}
                  </ForecastChart>
                </CardContent>
              </GlassCard>
            </ComparisonGrid>
          </ComparisonView>
        )}
      </ChartContent>
    </ChartContainer>
  );
}

// Styled Components
const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ChartTitle = styled.div`
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

const ChartControls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const ChartButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
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

  &:hover {
    background: ${props => props.$isActive 
      ? props.theme.colors.primary 
      : props.theme.colors.surface
    };
  }
`;

const ChartContent = styled.div`
  min-height: 400px;
`;

const PieChartView = styled.div``;

const PieChartContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing['2xl']};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PieChart = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
    #10B981 0deg 108deg,
    #F59E0B 108deg 198deg,
    #3B82F6 198deg 270deg,
    #8B5CF6 270deg 324deg,
    #EF4444 324deg 360deg
  );
`;

const PieSlice = styled.div<{ 
  $percentage: number; 
  $color: string; 
  $offset: number; 
}>`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
`;

const PieLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background: ${props => props.$color};
`;

const LegendLabel = styled.span`
  flex: 1;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const LegendValue = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const BarChartView = styled.div``;

const BarChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const BarItem = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr 80px;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const BarLabel = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const BarContainer = styled.div`
  position: relative;
  height: 24px;
  background: ${props => props.theme.colors.border};
  border-radius: 12px;
  overflow: visible;
`;

const Bar = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color};
  border-radius: 12px;
  transition: width ${props => props.theme.transitions.normal};
`;

const OverageBar = styled.div<{ $percentage: number }>`
  position: absolute;
  top: 0;
  left: 100%;
  height: 100%;
  width: ${props => props.$percentage}%;
  background: repeating-linear-gradient(
    45deg,
    #EF4444,
    #EF4444 4px,
    #FCA5A5 4px,
    #FCA5A5 8px
  );
  border-radius: 0 12px 12px 0;
`;

const BarValue = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  text-align: right;
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const TimelineView = styled.div``;

const TimelinePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['4xl']};
  text-align: center;
`;

const TimelineIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const TimelineMessage = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.text};
`;

const TimelineSubMessage = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
`;

const ComparisonView = styled.div``;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ComparisonChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const ComparisonItem = styled.div``;

const ComparisonLabel = styled.div`
  margin-bottom: ${props => props.theme.spacing.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ComparisonBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const ComparisonBar = styled.div<{ $type: string }>`
  position: relative;
  height: 20px;
  background: ${props => props.theme.colors.border};
  border-radius: 10px;
  overflow: hidden;
`;

const ComparisonFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color};
  transition: width ${props => props.theme.transitions.normal};
`;

const ComparisonValue = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const ForecastChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ForecastItem = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 100px;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ForecastLabel = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ForecastVariance = styled.div<{ $isPositive: boolean }>`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.$isPositive ? '#EF4444' : '#10B981'};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: right;
`;

const ForecastBar = styled.div`
  height: 16px;
  background: ${props => props.theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
`;

const ForecastFill = styled.div<{ $percentage: number; $isPositive: boolean }>`
  height: 100%;
  width: ${props => Math.min(100, props.$percentage)}%;
  background: ${props => props.$isPositive ? '#EF4444' : '#10B981'};
  transition: width ${props => props.theme.transitions.normal};
`;
