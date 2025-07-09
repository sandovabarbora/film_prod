import React, { useState } from 'react';
import styled from 'styled-components';
import { useCrew } from '../../../hooks/useCrew';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface.elevated};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  min-width: 250px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent.muted};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface.elevated};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const StatsBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.accent.primary};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CrewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CrewCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const CrewCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Avatar = styled.div<{ $status: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme, $status }) => 
    $status === 'available' ? theme.colors.success.primary :
    $status === 'on_set' ? theme.colors.warning.primary :
    theme.colors.error.primary
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ theme, $status }) => 
      $status === 'available' ? theme.colors.success.primary :
      $status === 'on_set' ? theme.colors.warning.primary :
      theme.colors.error.primary
    };
    border: 2px solid ${({ theme }) => theme.colors.surface.primary};
  }
`;

const CrewInfo = styled.div`
  flex: 1;
`;

const CrewName = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const CrewRole = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CrewDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

const DetailLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DetailValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ theme, $status }) => 
    $status === 'available' ? theme.colors.success.muted :
    $status === 'on_set' ? theme.colors.warning.muted :
    theme.colors.error.muted
  };
  color: ${({ theme, $status }) => 
    $status === 'available' ? theme.colors.success.primary :
    $status === 'on_set' ? theme.colors.warning.primary :
    theme.colors.error.primary
  };
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorState = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.error.primary};
  background: ${({ theme }) => theme.colors.error.muted};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

interface Props {
  onCrewSelect?: (crewId: string) => void;
  onAddCrew?: () => void;
}

export const CrewList: React.FC<Props> = ({ onCrewSelect, onAddCrew }) => {
  const {
    crew,
    departments,
    stats,
    loading,
    error,
    filters,
    setFilters,
    refresh
  } = useCrew();

  const [localSearch, setLocalSearch] = useState('');

  // Update filters with debouncing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: localSearch }));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [localSearch, setFilters]);

  const getCrewStatus = (member: any) => {
    return member.is_available ? 'available' : 'on_set';
  };

  const getCrewInitials = (member: any) => {
    return `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`.toUpperCase();
  };

  const formatStatusText = (status: string) => {
    const statusMap = {
      'available': 'Available',
      'on_set': 'On Set',
      'off': 'Off Duty',
      'unavailable': 'Unavailable'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  if (loading && crew.length === 0) {
    return <LoadingState>Loading crew...</LoadingState>;
  }

  if (error) {
    return (
      <ErrorState>
        <h3>Error loading crew</h3>
        <p>{error}</p>
        <Button onClick={refresh} variant="secondary" size="sm">
          Try Again
        </Button>
      </ErrorState>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Crew Management</Title>
        <Controls>
          <SearchInput
            type="text"
            placeholder="Search crew members..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <FilterSelect
            value={filters.department || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value || undefined }))}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any || undefined }))}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="on_set">On Set</option>
            <option value="off">Off Duty</option>
            <option value="unavailable">Unavailable</option>
          </FilterSelect>
          {onAddCrew && (
            <Button onClick={onAddCrew} variant="primary">
              Add Crew Member
            </Button>
          )}
        </Controls>
      </Header>

      <StatsBar>
        <StatItem>
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>Total Crew</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{stats.available}</StatNumber>
          <StatLabel>Available</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{stats.onSet}</StatNumber>
          <StatLabel>On Set</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{stats.departments}</StatNumber>
          <StatLabel>Departments</StatLabel>
        </StatItem>
      </StatsBar>

      <CrewGrid>
        {crew.map(member => {
          const status = getCrewStatus(member);
          const initials = getCrewInitials(member);
          
          return (
            <CrewCard
              key={member.id}
              onClick={() => onCrewSelect?.(member.id.toString())}
            >
              <CrewCardHeader>
                <Avatar $status={status}>
                  {initials}
                </Avatar>
                <CrewInfo>
                  <CrewName>
                    {member.first_name} {member.last_name}
                  </CrewName>
                  <CrewRole>
                    {member.primary_position?.title || 'No position assigned'}
                  </CrewRole>
                </CrewInfo>
                <StatusBadge $status={status}>
                  {formatStatusText(status)}
                </StatusBadge>
              </CrewCardHeader>
              
              <CrewDetails>
                <DetailRow>
                  <DetailLabel>Department:</DetailLabel>
                  <DetailValue>
                    {member.primary_position?.department?.name || 'Unassigned'}
                  </DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Phone:</DetailLabel>
                  <DetailValue>{member.phone_primary || 'N/A'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Email:</DetailLabel>
                  <DetailValue>{member.email}</DetailValue>
                </DetailRow>
                {member.emergency_contact && (
                  <DetailRow>
                    <DetailLabel>Emergency:</DetailLabel>
                    <DetailValue>{member.emergency_contact}</DetailValue>
                  </DetailRow>
                )}
              </CrewDetails>
            </CrewCard>
          );
        })}
      </CrewGrid>

      {crew.length === 0 && !loading && (
        <LoadingState>
          {filters.search || filters.department || filters.status 
            ? 'No crew members match your filters'
            : 'No crew members found'
          }
        </LoadingState>
      )}
    </Container>
  );
};
