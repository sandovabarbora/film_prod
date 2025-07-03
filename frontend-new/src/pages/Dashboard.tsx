import React from 'react';
import styled from 'styled-components';
import { Calendar, Users, DollarSign, Film } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PageHeader = styled.div`
  margin-bottom: 3rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatValue = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const QuickActions = styled.section`
  margin-top: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 8px;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[700]};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock data - později nahradíš skutečnými daty z API
  const stats = {
    daysRemaining: 45,
    crewMembers: 24,
    budgetUsed: 67,
    scenesShot: 32
  };
  
  const productionName = "Můj Film"; // TODO: získat z API

  return (
    <DashboardContainer>
      <PageHeader>
        <PageTitle>Production Dashboard</PageTitle>
        <PageSubtitle>
          {productionName ? `${productionName} - Den 1` : 'Vyberte produkci'}
        </PageSubtitle>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatInfo>
              <StatLabel>Zbývá dní</StatLabel>
              <StatValue>{stats.daysRemaining}</StatValue>
            </StatInfo>
            <StatIcon $color="#3B82F6">
              <Calendar />
            </StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatInfo>
              <StatLabel>Členů štábu</StatLabel>
              <StatValue>{stats.crewMembers}</StatValue>
            </StatInfo>
            <StatIcon $color="#10B981">
              <Users />
            </StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatInfo>
              <StatLabel>Využitý rozpočet</StatLabel>
              <StatValue>{stats.budgetUsed}%</StatValue>
            </StatInfo>
            <StatIcon $color="#F59E0B">
              <DollarSign />
            </StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatInfo>
              <StatLabel>Natočených scén</StatLabel>
              <StatValue>{stats.scenesShot}</StatValue>
            </StatInfo>
            <StatIcon $color="#8B5CF6">
              <Film />
            </StatIcon>
          </StatHeader>
        </StatCard>
      </StatsGrid>

      <QuickActions>
        <SectionTitle>Rychlé akce</SectionTitle>
        <ActionGrid>
          <ActionButton>Dnešní plán</ActionButton>
          <ActionButton>Přidat člena štábu</ActionButton>
          <ActionButton>Nahrát dokument</ActionButton>
          <ActionButton>Zobrazit rozpočet</ActionButton>
        </ActionGrid>
      </QuickActions>
    </DashboardContainer>
  );
};

export default Dashboard;