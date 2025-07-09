import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, User, Search, UserPlus, X, Check } from 'lucide-react';
import { useCrew } from '../../../hooks/useCrew';
import CrewAddModal from './CrewAddModal';

interface CrewMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  department: string;
  daily_rate: number;
  status: string;
}

interface CrewMemberData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  daily_rate: number | string;
  start_date: string;
  end_date: string;
  emergency_contact: string;
  emergency_phone: string;
  notes: string;
}

interface CrewSelectorProps {
  selectedCrew: string[];
  onCrewChange: (crewIds: string[]) => void;
  maxSelections?: number;
  title?: string;
  subtitle?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  gap: 1rem;
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SearchSection = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.secondary};
    z-index: 1;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const CrewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 0.5rem;
`;

const CrewItem = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${({ $selected, theme }) => 
    $selected ? theme.colors.primary + '10' : 'transparent'
  };
  border: 1px solid ${({ $selected, theme }) => 
    $selected ? theme.colors.primary : theme.colors.border
  };
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }
`;

const CrewAvatar = styled.div<{ $selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $selected, theme }) => 
    $selected ? theme.colors.primary : theme.colors.border
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $selected }) => $selected ? 'white' : '#666'};
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const CrewInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CrewName = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
`;

const CrewDetails = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const CrewBadge = styled.span<{ $color: string }>`
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RateInfo = styled.span`
  color: ${({ theme }) => theme.colors.text.muted};
`;

const SelectedCheckbox = styled.div<{ $selected: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${({ $selected, theme }) => 
    $selected ? theme.colors.primary : theme.colors.border
  };
  border-radius: 4px;
  background: ${({ $selected, theme }) => 
    $selected ? theme.colors.primary : 'transparent'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const SelectedCount = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const getDepartmentColor = (department: string): string => {
  const colors: Record<string, string> = {
    'Camera': '#3B82F6',
    'Sound': '#10B981',
    'Lighting': '#F59E0B',
    'Production': '#EF4444',
    'Art Direction': '#8B5CF6',
  };
  return colors[department] || '#6B7280';
};

const CrewSelector: React.FC<CrewSelectorProps> = ({
  selectedCrew,
  onCrewChange,
  maxSelections = 10,
  title = "Štáb projektu",
  subtitle = "Vyberte členy štábu pro tento projekt"
}) => {
  const { allCrew, departments, positions, loading, addCrewMember } = useCrew();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredCrew = allCrew.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    const name = `${member.first_name} ${member.last_name}`.toLowerCase();
    const email = member.email.toLowerCase();
    const position = member.position.toLowerCase();
    
    return name.includes(searchLower) || 
           email.includes(searchLower) || 
           position.includes(searchLower);
  });

  const handleCrewToggle = (crewId: string) => {
    if (selectedCrew.includes(crewId)) {
      // Remove from selection
      onCrewChange(selectedCrew.filter(id => id !== crewId));
    } else {
      // Add to selection (if under limit)
      if (selectedCrew.length < maxSelections) {
        onCrewChange([...selectedCrew, crewId]);
      }
    }
  };

  const handleAddCrew = () => {
    setIsAddModalOpen(true);
  };

  const handleCrewSave = async (crewData: CrewMemberData) => {
    try {
      const newMember = await addCrewMember(crewData);
      if (newMember) {
        // Auto-select the newly added crew member
        onCrewChange([...selectedCrew, newMember.id]);
      }
    } catch (error) {
      console.error('Failed to add crew member:', error);
      throw error;
    }
  };

  const getCrewInitials = (member: CrewMember) => {
    return `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>Načítání štábu...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderInfo>
          <Title>
            <User />
            {title}
          </Title>
          <Subtitle>{subtitle}</Subtitle>
        </HeaderInfo>
        <AddButton onClick={handleAddCrew}>
          <UserPlus />
          Přidat nového
        </AddButton>
      </Header>

      <SearchSection>
        <Search size={16} />
        <SearchInput
          type="text"
          placeholder="Hledat podle jména, emailu nebo pozice..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchSection>

      <CrewList>
        {filteredCrew.length === 0 ? (
          <EmptyState>
            <User />
            <div>
              {searchTerm ? 
                'Žádní členové štábu nevyhovují vašemu hledání.' : 
                'Zatím nejsou přidáni žádní členové štábu.'
              }
            </div>
          </EmptyState>
        ) : (
          filteredCrew.map(member => {
            const isSelected = selectedCrew.includes(member.id);
            const departmentColor = getDepartmentColor(member.department);
            
            return (
              <CrewItem
                key={member.id}
                $selected={isSelected}
                onClick={() => handleCrewToggle(member.id)}
              >
                <CrewAvatar $selected={isSelected}>
                  {getCrewInitials(member)}
                </CrewAvatar>
                
                <CrewInfo>
                  <CrewName>
                    {member.first_name} {member.last_name}
                  </CrewName>
                  <CrewDetails>
                    <CrewBadge $color={departmentColor}>
                      {member.department}
                    </CrewBadge>
                    <span>{member.position}</span>
                    <RateInfo>
                      ${member.daily_rate.toLocaleString()}/den
                    </RateInfo>
                  </CrewDetails>
                </CrewInfo>

                <SelectedCheckbox $selected={isSelected}>
                  {isSelected && <Check />}
                </SelectedCheckbox>
              </CrewItem>
            );
          })
        )}
      </CrewList>

      <SelectedCount>
        Vybráno: {selectedCrew.length} z {maxSelections} členů
      </SelectedCount>

      <CrewAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCrewSave}
        departments={departments}
        positions={positions}
      />
    </Container>
  );
};

export default CrewSelector;
