import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Calendar, Users, DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useProductions, useProductionDashboard } from '../hooks/useProduction';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.gray[850]};
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.sizes.h1};
  color: ${({ theme }) => theme.colors.primary.light};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.gray[400]};
  font-size: ${({ theme }) => theme.sizes.body};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[800]};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
    border-color: ${({ theme }) => theme.colors.gray[700]};
  }
`;

const StatContent = styled.div``;

const StatLabel = styled.p`
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatValue = styled.p`
  font-size: ${({ theme }) => theme.sizes.h3};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.light};
`;

const IconWrapper = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  background: ${({ color }) => color};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${({ theme }) => theme.colors.gray[400]};
`;

const ErrorState = styled.div`
  background: ${({ theme }) => theme.colors.status.error}20;
  border: 1px solid ${({ theme }) => theme.colors.status.error};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.status.error};
  margin: ${({ theme }) => theme.spacing.xl} 0;
`;

const Dashboard: React.FC = () => {
  const [currentProductionId, setCurrentProductionId] = useState<string>('');
  const { data: productions, isLoading: loadingProductions } = useProductions();
  const { data: dashboard, isLoading: loadingDashboard, error } = useProductionDashboard(currentProductionId);

  useEffect(() => {
    // Get the first production as default
    if (productions && productions.length > 0 && !currentProductionId) {
      setCurrentProductionId(productions[0].id);
      localStorage.setItem('currentProductionId', productions[0].id);
    }
  }, [productions, currentProductionId]);

  if (loadingProductions || loadingDashboard) {
    return (
      <Container>
        <LoadingState>Loading production data...</LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Production Dashboard</Title>
        </Header>
        <ErrorState>
          Failed to load dashboard data. Please try again later.
        </ErrorState>
      </Container>
    );
  }

  const stats = [
    { 
      name: 'Days Remaining', 
      value: dashboard?.schedule?.days_remaining || '-',
      icon: Calendar, 
      color: '#3B82F6' 
    },
    { 
      name: 'Crew Members', 
      value: dashboard?.crew_total || '0',
      icon: Users, 
      color: '#10B981' 
    },
    { 
      name: 'Budget Used', 
      value: dashboard?.budget?.percentage_used ? `${dashboard.budget.percentage_used}%` : '-',
      icon: DollarSign, 
      color: '#F59E0B' 
    },
    { 
      name: 'Scenes Shot', 
      value: dashboard?.scenes_completed && dashboard?.total_scenes 
        ? `${dashboard.scenes_completed}/${dashboard.total_scenes}`
        : '-',
      icon: Clock, 
      color: '#8B5CF6' 
    },
  ];

  return (
    <Container>
      <Header>
        <Title>Production Dashboard</Title>
        <Subtitle>
          {productions && productions.length > 0 
            ? `${productions[0].title} - Day ${dashboard?.current_day || 1}`
            : 'Welcome back! Here\'s your production overview.'}
        </Subtitle>
      </Header>

      <StatsGrid>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <StatCard key={stat.name}>
              <StatContent>
                <StatLabel>{stat.name}</StatLabel>
                <StatValue>{stat.value}</StatValue>
              </StatContent>
              <IconWrapper color={stat.color}>
                <Icon size={24} color="white" />
              </IconWrapper>
            </StatCard>
          );
        })}
      </StatsGrid>

      {/* Add more dashboard components here */}
    </Container>
  );
};

export default Dashboard;
