import React, { useState } from 'react';
import styled from 'styled-components';
import { Package, Search, Plus, Filter, Camera, Mic, Lightbulb, Monitor } from 'lucide-react';

const EquipmentContainer = styled.div`
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

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
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

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 2rem;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[700]};
`;

const CategoryTab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: transparent;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.secondary};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const EquipmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const EquipmentCard = styled.div`
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

const EquipmentImage = styled.div`
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

const EquipmentInfo = styled.div`
  padding: 1.5rem;
`;

const EquipmentName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const EquipmentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatusBadge = styled.span<{ $status: 'available' | 'in-use' | 'maintenance' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.$status) {
      case 'available': return props.theme.colors.success + '20';
      case 'in-use': return props.theme.colors.warning + '20';
      case 'maintenance': return props.theme.colors.danger + '20';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'available': return props.theme.colors.success;
      case 'in-use': return props.theme.colors.warning;
      case 'maintenance': return props.theme.colors.danger;
    }
  }};
`;

const Equipment: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All Equipment', icon: Package },
    { id: 'camera', name: 'Cameras', icon: Camera },
    { id: 'sound', name: 'Sound', icon: Mic },
    { id: 'lighting', name: 'Lighting', icon: Lightbulb },
    { id: 'monitors', name: 'Monitors', icon: Monitor },
  ];
  
  // Mock data
  const equipment = [
    { id: 1, name: 'RED Komodo 6K', category: 'camera', model: 'Komodo', status: 'available' as const },
    { id: 2, name: 'ARRI Alexa Mini LF', category: 'camera', model: 'Mini LF', status: 'in-use' as const },
    { id: 3, name: 'Sennheiser MKH 416', category: 'sound', model: 'MKH 416', status: 'available' as const },
    { id: 4, name: 'ARRI SkyPanel S60-C', category: 'lighting', model: 'S60-C', status: 'maintenance' as const },
    { id: 5, name: 'SmallHD 703 UltraBright', category: 'monitors', model: '703 UB', status: 'available' as const },
    { id: 6, name: 'Zoom F8n Pro', category: 'sound', model: 'F8n Pro', status: 'in-use' as const },
  ];
  
  const filteredEquipment = activeCategory === 'all' 
    ? equipment 
    : equipment.filter(item => item.category === activeCategory);

  return (
    <EquipmentContainer>
      <PageHeader>
        <Title>Equipment Management</Title>
        <HeaderActions>
          <Button>
            <Filter size={18} />
            Filter
          </Button>
          <Button>
            <Plus size={18} />
            Add Equipment
          </Button>
        </HeaderActions>
      </PageHeader>
      
      <SearchBar>
        <Search size={20} />
        <SearchInput placeholder="Search equipment..." />
      </SearchBar>
      
      <CategoryTabs>
        {categories.map(({ id, name, icon: Icon }) => (
          <CategoryTab
            key={id}
            $active={activeCategory === id}
            onClick={() => setActiveCategory(id)}
          >
            <Icon size={18} />
            {name}
          </CategoryTab>
        ))}
      </CategoryTabs>
      
      <EquipmentGrid>
        {filteredEquipment.map(item => {
          const Icon = categories.find(c => c.id === item.category)?.icon || Package;
          return (
            <EquipmentCard key={item.id}>
              <EquipmentImage>
                <Icon />
              </EquipmentImage>
              <EquipmentInfo>
                <EquipmentName>{item.name}</EquipmentName>
                <EquipmentDetails>
                  <DetailRow>
                    <span>Model:</span>
                    <span>{item.model}</span>
                  </DetailRow>
                  <DetailRow>
                    <span>Status:</span>
                    <StatusBadge $status={item.status}>
                      {item.status.replace('-', ' ')}
                    </StatusBadge>
                  </DetailRow>
                </EquipmentDetails>
              </EquipmentInfo>
            </EquipmentCard>
          );
        })}
      </EquipmentGrid>
    </EquipmentContainer>
  );
};

export default Equipment;