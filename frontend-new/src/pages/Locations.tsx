import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  MapPin, Plus, Search, Filter, Camera, Clock,
  Star, Navigation, Phone, Calendar, Map
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProjectHeader from '../components/common/ProjectHeader';
import { useProject } from '../contexts/ProjectContext';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'JetBrains Mono', monospace;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const ToolBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
`;

const LeftActions = styled.div`
  display: flex;
  gap: 1rem;
  flex: 1;
`;

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #f9fafb;
  font-family: inherit;
  font-size: 0.875rem;
  min-width: 300px;
  
  &::placeholder {
    color: #6b7280;
  }
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const LocationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const LocationCard = styled(Card)`
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const LocationImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 3rem;
`;

const LocationContent = styled.div`
  padding: 1.5rem;
`;

const LocationHeader = styled.div`
  margin-bottom: 1rem;
`;

const LocationName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const LocationAddress = styled.div`
  color: #9ca3af;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LocationMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SceneCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #667eea;
`;

const LocationRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
`;

const LocationDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #9ca3af;
`;

const LocationActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const StatusBadge = styled.div<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: ${({ $status }) => {
    const colors = {
      confirmed: '#10b98122',
      pending: '#f59e0b22',
      scouted: '#3b82f622'
    };
    return colors[$status] || colors.pending;
  }};
  color: ${({ $status }) => {
    const colors = {
      confirmed: '#10b981',
      pending: '#f59e0b',
      scouted: '#3b82f6'
    };
    return colors[$status] || colors.pending;
  }};
  border: 1px solid ${({ $status }) => {
    const colors = {
      confirmed: '#10b981',
      pending: '#f59e0b',
      scouted: '#3b82f6'
    };
    return colors[$status] || colors.pending;
  }};
`;

const Locations: React.FC = () => {
  const { project } = useProject();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock locations data
  const locations = [
    {
      id: 1,
      name: 'Prague Castle',
      address: 'Hradčany, 119 08 Praha 1',
      scenes: 5,
      rating: 4.8,
      contact: '+420 224 373 368',
      shootDates: '15-16 July 2025',
      status: 'confirmed',
      type: 'Exterior'
    },
    {
      id: 2,
      name: 'Café Louvre',
      address: 'Národní 116/22, 110 00 Praha 1',
      scenes: 3,
      rating: 4.6,
      contact: '+420 224 930 949',
      shootDates: '18 July 2025',
      status: 'confirmed',
      type: 'Interior'
    },
    {
      id: 3,
      name: 'Petřín Tower',
      address: 'Petřínské sady, 118 00 Praha 1',
      scenes: 2,
      rating: 4.9,
      contact: '+420 257 320 112',
      shootDates: '20 July 2025',
      status: 'pending',
      type: 'Exterior'
    },
    {
      id: 4,
      name: 'Film Studios Barrandov',
      address: 'Kříženeckého nám. 1078/5, Praha 5',
      scenes: 12,
      rating: 4.7,
      contact: '+420 267 071 111',
      shootDates: '22-25 July 2025',
      status: 'confirmed',
      type: 'Studio'
    },
    {
      id: 5,
      name: 'Charles Bridge',
      address: 'Karlův most, Praha 1',
      scenes: 4,
      rating: 4.9,
      contact: 'Public space',
      shootDates: 'TBD',
      status: 'scouted',
      type: 'Exterior'
    },
    {
      id: 6,
      name: 'Modern Office Building',
      address: 'Wenceslas Square 56, Praha 1',
      scenes: 8,
      rating: 4.4,
      contact: '+420 222 555 777',
      shootDates: '28-29 July 2025',
      status: 'pending',
      type: 'Interior'
    }
  ];

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < Math.floor(rating) ? '#f59e0b' : 'none'} 
        color="#f59e0b" 
      />
    ));
  };

  if (!project) {
    return (
      <PageContainer>
        <ContentWrapper>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h2>Project Not Found</h2>
            <p>Unable to load project locations</p>
          </div>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <ProjectHeader 
          title="Filming Locations"
          subtitle={`Location management for ${project.title}`}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="ghost" icon={<Map size={16} />}>View Map</Button>
            <Button variant="primary" icon={<Plus size={16} />}>Add Location</Button>
          </div>
        </ProjectHeader>

        <ToolBar>
          <LeftActions>
            <SearchInput
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="ghost" icon={<Filter size={16} />}>Filter</Button>
          </LeftActions>
        </ToolBar>

        <LocationsGrid>
          {filteredLocations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <LocationCard variant="glass">
                <LocationImage>
                  <MapPin size={48} />
                </LocationImage>
                
                <LocationContent>
                  <LocationHeader>
                    <LocationName>{location.name}</LocationName>
                    <LocationAddress>
                      <MapPin size={14} />
                      {location.address}
                    </LocationAddress>
                  </LocationHeader>
                  
                  <LocationMeta>
                    <SceneCount>
                      <Camera size={16} />
                      {location.scenes} scenes
                    </SceneCount>
                    <LocationRating>
                      {renderStars(location.rating)}
                      <span style={{ marginLeft: '0.5rem' }}>{location.rating}</span>
                    </LocationRating>
                  </LocationMeta>
                  
                  <LocationDetails>
                    <DetailItem>
                      <Phone size={16} />
                      {location.contact}
                    </DetailItem>
                    <DetailItem>
                      <Calendar size={16} />
                      {location.shootDates}
                    </DetailItem>
                    <DetailItem>
                      <Clock size={16} />
                      {location.type}
                    </DetailItem>
                  </LocationDetails>
                  
                  <LocationMeta>
                    <StatusBadge $status={location.status}>
                      {location.status}
                    </StatusBadge>
                    
                    <LocationActions>
                      <Button variant="ghost" size="sm" icon={<Navigation size={14} />}>
                        Directions
                      </Button>
                      <Button variant="ghost" size="sm" icon={<Camera size={14} />}>
                        Photos
                      </Button>
                    </LocationActions>
                  </LocationMeta>
                </LocationContent>
              </LocationCard>
            </motion.div>
          ))}
        </LocationsGrid>
      </ContentWrapper>
    </PageContainer>
  );
};

export default Locations;
