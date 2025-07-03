import React, { useState } from 'react';
import styled from 'styled-components';
import { MapPin, Plus, Calendar, Clock, Navigation, Cloud, Image } from 'lucide-react';

const LocationsContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const LocationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const LocationCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
`;

const LocationImage = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background: ${({ theme }) => theme.colors.gray[700]};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 48px;
    height: 48px;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const LocationStatus = styled.div<{ $status: 'confirmed' | 'pending' | 'scouting' }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'confirmed': return props.theme.colors.success;
      case 'pending': return props.theme.colors.warning;
      case 'scouting': return props.theme.colors.primary;
    }
  }};
  color: white;
  text-transform: uppercase;
`;

const LocationInfo = styled.div`
  padding: 1.5rem;
`;

const LocationName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const LocationAddress = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const LocationDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LocationActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[700]};
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  background: ${({ theme }) => theme.colors.gray[700]};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[600]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FilterTab = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.$active ? props.theme.colors.primary + '20' : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.secondary};
  border: 1px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.gray[700]};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Locations: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Mock data
  const locations = [
    {
      id: 1,
      name: 'Downtown Studio - Stage 3',
      address: '123 Film Street, Prague',
      status: 'confirmed' as const,
      shootDates: 'Jan 15-20',
      time: '7:00 AM - 7:00 PM',
      weather: 'Cloudy, 12°C',
      distance: '5.2 km'
    },
    {
      id: 2,
      name: 'Historic Building Exterior',
      address: '456 Old Town Square, Prague',
      status: 'pending' as const,
      shootDates: 'Jan 22-23',
      time: '6:00 AM - 2:00 PM',
      weather: 'Sunny, 15°C',
      distance: '2.8 km'
    },
    {
      id: 3,
      name: 'Modern Office Interior',
      address: '789 Business District, Prague',
      status: 'scouting' as const,
      shootDates: 'TBD',
      time: 'TBD',
      weather: 'Indoor',
      distance: '8.1 km'
    },
    {
      id: 4,
      name: 'Riverside Park',
      address: 'Petřín Park, Prague',
      status: 'confirmed' as const,
      shootDates: 'Jan 25-26',
      time: '5:30 AM - 8:00 PM',
      weather: 'Partly cloudy, 10°C',
      distance: '3.5 km'
    }
  ];
  
  const filteredLocations = activeFilter === 'all' 
    ? locations 
    : locations.filter(loc => loc.status === activeFilter);

  return (
    <LocationsContainer>
      <PageHeader>
        <Title>Locations</Title>
        <Button>
          <Plus size={18} />
          Add Location
        </Button>
      </PageHeader>
      
      <FilterTabs>
        <FilterTab $active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>
          All Locations ({locations.length})
        </FilterTab>
        <FilterTab $active={activeFilter === 'confirmed'} onClick={() => setActiveFilter('confirmed')}>
          Confirmed ({locations.filter(l => l.status === 'confirmed').length})
        </FilterTab>
        <FilterTab $active={activeFilter === 'pending'} onClick={() => setActiveFilter('pending')}>
          Pending ({locations.filter(l => l.status === 'pending').length})
        </FilterTab>
        <FilterTab $active={activeFilter === 'scouting'} onClick={() => setActiveFilter('scouting')}>
          Scouting ({locations.filter(l => l.status === 'scouting').length})
        </FilterTab>
      </FilterTabs>
      
      <LocationsGrid>
        {filteredLocations.map(location => (
          <LocationCard key={location.id}>
            <LocationImage>
              <Image />
              <LocationStatus $status={location.status}>
                {location.status}
              </LocationStatus>
            </LocationImage>
            <LocationInfo>
              <LocationName>{location.name}</LocationName>
              <LocationAddress>
                <MapPin />
                {location.address}
              </LocationAddress>
              <LocationDetails>
                <DetailItem>
                  <Calendar />
                  {location.shootDates}
                </DetailItem>
                <DetailItem>
                  <Clock />
                  {location.time}
                </DetailItem>
                <DetailItem>
                  <Cloud />
                  {location.weather}
                </DetailItem>
                <DetailItem>
                  <Navigation />
                  {location.distance}
                </DetailItem>
              </LocationDetails>
              <LocationActions>
                <ActionButton>View Details</ActionButton>
                <ActionButton>Get Directions</ActionButton>
                <ActionButton>Weather</ActionButton>
              </LocationActions>
            </LocationInfo>
          </LocationCard>
        ))}
      </LocationsGrid>
    </LocationsContainer>
  );
};

export default Locations;