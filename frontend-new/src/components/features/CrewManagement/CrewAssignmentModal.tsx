import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Save, User, Briefcase, Calendar, DollarSign, Search, Star } from 'lucide-react';

interface CrewMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_primary: string;
  primary_position: {
    id: number;
    title: string;
    department: {
      id: number;
      name: string;
    };
  };
  is_available: boolean;
  skills?: string[];
  experience_years?: number;
}

interface CrewAssignmentFormData {
  crew_member_id: number;
  role: string;
  start_date: string;
  end_date: string;
  daily_rate: number | string;
  is_key_personnel: boolean;
  notes: string;
}

interface CrewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CrewAssignmentFormData) => Promise<void>;
  projectId: number;
  projectStartDate: string;
  projectEndDate: string;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div<{ $isOpen: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  padding: 2rem;
  max-width: 800px;
  width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  transform: ${({ $isOpen }) => $isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)'};
  transition: all 0.3s ease;
  box-shadow: ${({ theme }) => theme.shadows.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const CrewSelectionSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.secondary};
    z-index: 1;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const CrewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background};
`;

const CrewCard = styled.div<{ $selected: boolean; $available: boolean }>`
  padding: 1rem;
  border: 2px solid ${({ $selected, $available, theme }) => {
    if ($selected) return theme.colors.primary;
    if (!$available) return theme.colors.gray[600];
    return theme.colors.border;
  }};
  border-radius: 10px;
  background: ${({ $selected, $available, theme }) => {
    if ($selected) return theme.colors.primary + '10';
    if (!$available) return theme.colors.gray[800] + '50';
    return theme.colors.surface;
  }};
  cursor: ${({ $available }) => $available ? 'pointer' : 'not-allowed'};
  transition: all 0.2s;
  opacity: ${({ $available }) => $available ? 1 : 0.6};
  
  &:hover {
    ${({ $available, theme }) => $available && `
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.md};
    `}
  }
`;

const CrewName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const CrewPosition = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const CrewDepartment = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.5rem;
`;

const CrewMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const AvailabilityBadge = styled.span<{ $available: boolean }>`
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  background: ${({ $available, theme }) => 
    $available ? theme.colors.success + '20' : theme.colors.gray[500] + '20'
  };
  color: ${({ $available, theme }) => 
    $available ? theme.colors.success : theme.colors.gray[500]
  };
`;

const FormSection = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const CheckboxLabel = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: ${({ theme }) => theme.colors.warning};
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid ${({ $variant, theme }) => 
    $variant === 'primary' ? theme.colors.primary : theme.colors.border
  };
  border-radius: 10px;
  background: ${({ $variant, theme }) => 
    $variant === 'primary' ? theme.colors.primary : 'transparent'
  };
  color: ${({ $variant, theme }) => 
    $variant === 'primary' ? 'white' : theme.colors.text.primary
  };
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $variant, theme }) => 
      $variant === 'primary' ? theme.colors.primaryDark : theme.colors.border
    };
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const CrewAssignmentModal: React.FC<CrewAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectId,
  projectStartDate,
  projectEndDate
}) => {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrewMember, setSelectedCrewMember] = useState<CrewMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCrew, setIsLoadingCrew] = useState(false);

  const [formData, setFormData] = useState<CrewAssignmentFormData>({
    crew_member_id: 0,
    role: '',
    start_date: projectStartDate,
    end_date: projectEndDate,
    daily_rate: '',
    is_key_personnel: false,
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchCrewMembers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCrewMember) {
      setFormData(prev => ({
        ...prev,
        crew_member_id: selectedCrewMember.id,
        role: selectedCrewMember.primary_position.title,
      }));
    }
  }, [selectedCrewMember]);

  const fetchCrewMembers = async () => {
    setIsLoadingCrew(true);
    try {
      // Mock data - replace with real API call
      const mockCrewMembers: CrewMember[] = [
        {
          id: 1,
          first_name: "Jana",
          last_name: "Svobodová",
          email: "jana.svobodova@email.com",
          phone_primary: "+420 123 456 789",
          primary_position: {
            id: 1,
            title: "Režisérka",
            department: { id: 1, name: "Režie" }
          },
          is_available: true,
          skills: ["Drama", "Independent Film", "Casting"],
          experience_years: 15
        },
        {
          id: 2,
          first_name: "Tomáš",
          last_name: "Novák",
          email: "tomas.novak@email.com",
          phone_primary: "+420 123 456 790",
          primary_position: {
            id: 2,
            title: "Kameraman",
            department: { id: 2, name: "Kamera" }
          },
          is_available: true,
          skills: ["4K", "Steadicam", "Drone"],
          experience_years: 12
        },
        {
          id: 3,
          first_name: "Petra",
          last_name: "Dvořáková",
          email: "petra.dvorakova@email.com",
          phone_primary: "+420 123 456 791",
          primary_position: {
            id: 3,
            title: "Zvukař",
            department: { id: 3, name: "Zvuk" }
          },
          is_available: false,
          skills: ["Pro Tools", "Location Sound", "Post-Production"],
          experience_years: 8
        },
        {
          id: 4,
          first_name: "Martin",
          last_name: "Černý",
          email: "martin.cerny@email.com",
          phone_primary: "+420 123 456 792",
          primary_position: {
            id: 4,
            title: "Scénárista",
            department: { id: 4, name: "Scénář" }
          },
          is_available: true,
          skills: ["Drama", "Comedy", "Character Development"],
          experience_years: 20
        }
      ];
      
      setCrewMembers(mockCrewMembers);
    } catch (error) {
      console.error('Error fetching crew members:', error);
    } finally {
      setIsLoadingCrew(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrewMember) return;

    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        daily_rate: Number(formData.daily_rate)
      });
      onClose();
    } catch (error) {
      console.error('Failed to assign crew member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCrewMembers = crewMembers.filter(member =>
    `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.primary_position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.primary_position.department.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <User />
            Přiřadit člena štábu
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <CrewSelectionSection>
            <SectionTitle>
              <Search />
              Vybrat člena štábu
            </SectionTitle>
            
            <SearchContainer>
              <Search size={16} />
              <SearchInput
                type="text"
                placeholder="Hledat podle jména, pozice nebo oddělení..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>

            {isLoadingCrew ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                Načítání štábu...
              </div>
            ) : (
              <CrewGrid>
                {filteredCrewMembers.map((member) => (
                  <CrewCard
                    key={member.id}
                    $selected={selectedCrewMember?.id === member.id}
                    $available={member.is_available}
                    onClick={() => member.is_available && setSelectedCrewMember(member)}
                  >
                    <CrewName>
                      {member.first_name} {member.last_name}
                    </CrewName>
                    <CrewPosition>{member.primary_position.title}</CrewPosition>
                    <CrewDepartment>{member.primary_position.department.name}</CrewDepartment>
                    <CrewMeta>
                      <span>{member.experience_years} let zkušeností</span>
                      <AvailabilityBadge $available={member.is_available}>
                        {member.is_available ? 'Dostupný' : 'Nedostupný'}
                      </AvailabilityBadge>
                    </CrewMeta>
                  </CrewCard>
                ))}
              </CrewGrid>
            )}
          </CrewSelectionSection>

          {selectedCrewMember && (
            <FormSection>
              <SectionTitle>
                <Briefcase />
                Detaily přiřazení
              </SectionTitle>

              <FormGroup>
                <Label>
                  <Briefcase />
                  Role v projektu
                </Label>
                <Input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="Např. Hlavní kameraman, Asistent režie..."
                  required
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>
                    <Calendar />
                    Datum začátku
                  </Label>
                  <Input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <Calendar />
                    Datum konce
                  </Label>
                  <Input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>
                  <DollarSign />
                  Denní sazba (USD)
                </Label>
                <Input
                  type="number"
                  name="daily_rate"
                  value={formData.daily_rate}
                  onChange={handleInputChange}
                  placeholder="1500"
                  min="0"
                  required
                />
              </FormGroup>

              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  name="is_key_personnel"
                  checked={formData.is_key_personnel}
                  onChange={handleInputChange}
                />
                <CheckboxLabel>
                  <Star />
                  Klíčová pozice
                </CheckboxLabel>
              </CheckboxContainer>

              <FormGroup>
                <Label>Poznámky</Label>
                <TextArea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Dodatečné informace o přiřazení..."
                />
              </FormGroup>
            </FormSection>
          )}

          <ModalActions>
            <Button type="button" onClick={onClose}>
              Zrušit
            </Button>
            <Button 
              type="submit" 
              $variant="primary" 
              disabled={isLoading || !selectedCrewMember}
            >
              <Save />
              {isLoading ? 'Přiřazování...' : 'Přiřadit ke štábu'}
            </Button>
          </ModalActions>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CrewAssignmentModal;
