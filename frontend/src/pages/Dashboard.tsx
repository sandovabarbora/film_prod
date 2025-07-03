import React from 'react';
import styled from 'styled-components';
import { Calendar, Users, DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react';

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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ContentCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[800]};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CardTitle = styled.h2`
  font-size: ${({ theme }) => theme.sizes.h5};
  color: ${({ theme }) => theme.colors.primary.light};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: 600;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[800]};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const ActivityInfo = styled.div``;

const ActivityTitle = styled.p`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary.light};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ActivityTime = styled.p`
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.gray[500]};
`;

const ActivityBadge = styled.span`
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.accent.main};
`;

const AlertItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const AlertContent = styled.div``;

const AlertTitle = styled.p`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary.light};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const AlertDescription = styled.p`
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.gray[500]};
`;

const Dashboard: React.FC = () => {
  const stats = [
    { name: 'Days Remaining', value: '45', icon: Calendar, color: '#3B82F6' },
    { name: 'Crew Members', value: '127', icon: Users, color: '#10B981' },
    { name: 'Budget Used', value: '67%', icon: DollarSign, color: '#F59E0B' },
    { name: 'Scenes Shot', value: '89/145', icon: Clock, color: '#8B5CF6' },
  ];

  return (
    <Container>
      <Header>
        <Title>Production Dashboard</Title>
        <Subtitle>Welcome back! Here's your production overview.</Subtitle>
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

      <ContentGrid>
        <ContentCard>
          <CardTitle>Upcoming Schedule</CardTitle>
          <ActivityList>
            {[1, 2, 3].map((i) => (
              <ActivityItem key={i}>
                <ActivityInfo>
                  <ActivityTitle>Scene {i * 12} - Exterior Downtown</ActivityTitle>
                  <ActivityTime>Call time: 6:00 AM</ActivityTime>
                </ActivityInfo>
                <ActivityBadge>Tomorrow</ActivityBadge>
              </ActivityItem>
            ))}
          </ActivityList>
        </ContentCard>

        <ContentCard>
          <CardTitle>Production Alerts</CardTitle>
          <AlertItem>
            <AlertCircle size={20} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
            <AlertContent>
              <AlertTitle>Weather Advisory</AlertTitle>
              <AlertDescription>Rain expected for Thursday's shoot</AlertDescription>
            </AlertContent>
          </AlertItem>
          <AlertItem>
            <TrendingUp size={20} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <AlertContent>
              <AlertTitle>Ahead of Schedule</AlertTitle>
              <AlertDescription>2 days ahead on principal photography</AlertDescription>
            </AlertContent>
          </AlertItem>
        </ContentCard>
      </ContentGrid>
    </Container>
  );
};

export default Dashboard;
