import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Save, Users, Calendar, DollarSign, Star, Search } from 'lucide-react';

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
  assignment?: any;
  isEditing?: boolean;
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
  max-width: 700px;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

const CrewMemberSelector = styled.div`
  position: relative;
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

const SearchIcon = styled(Search)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.secondary};
  width: 16px;
  height: 16px;
  pointer-events: none;
`;

const CrewList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 0.25rem;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const CrewListItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}10;
  }
`;

const CrewMemberName = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const CrewMemberInfo = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SelectedCrewMember = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.primary}10;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: 10px;
`;

const CrewAvatar = styled.div`
  width: 48px;
  height: 48px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
`;

const CrewDetails = styled.div`
  flex: 1;
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`;

const CheckboxLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  cursor: pointer;
  
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
  assignment,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<CrewAssignmentFormData>({
    crew_member_id: assignment?.crew_member?.id || 0,
    role: assignment?.role || '',
    start_date: assignment?.start_date || '',
    end_date: assignment?.end_date || '',
    daily_rate: assignment?.daily_rate || '',
    is_key_personnel: assignment?.is_key_personnel || false,
    notes: assignment?.notes || '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showCrewList, setShowCrewList] = useState(false);
  const [availableCrew, setAvailableCrew] = useState<CrewMember[]>([]);
  const [selectedCrewMember, setSelectedCrewMember] = useState<CrewMember | null>(
    assignment?.crew_member || null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableCrew();
    }
  }, [isOpen]);

  const fetchAvailableCrew = async () => {
    try {
      // Mock data - replace with real API call
      const mockCrew: CrewMember[] = [
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
          }
        },
        {
          id: 2,
          first_name: "Tomáš",
          last_name: "Novák",
          email: "tomas.novak@email.com",
          phone_primary: "+420 987 654 321",
          primary_position: {
            id: 2,
            title: "Kameraman",
            department: { id: 2, name: "Kamera" }
          }
        },
        {
          id: 3,
          first_name: "Petra",
          last_name: "Veselá",
          email: "petra.vesela@email.com",
          phone_primary: "+420 555 123 456",
          primary_position: {
            id: 3,
            title: "Zvukařka",
            department: { id: 3, name: "Zvuk" }
          }
        }
      ];
      setAvailableCrew(mockCrew);
    } catch (error) {
      console.error('Error fetching crew members:', error);
    }
  };

  const filteredCrew = availableCrew.filter(member =>
    `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.primary_position.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCrewMemberSelect = (member: CrewMember) => {
    setSelectedCrewMember(member);
    setFormData(prev => ({
      ...prev,
      crew_member_id: member.id,
      role: prev.role || member.primary_position.title
    }));
    setSearchTerm(`${member.first_name} ${member.last_name}`);
    setShowCrewList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrewMember) {
      alert('Vyberte člena štábu');
      return;
    }
    
    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        daily_rate: Number(formData.daily_rate)
      });
      onClose();
    } catch (error) {
      console.error('Failed to save crew assignment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Users />
            {isEditing ? 'Upravit přiřazení štábu' : 'Přiřadit člena štábu'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              <Users />
              Člen štábu
            </Label>
            {selectedCrewMember ? (
              <SelectedCrewMember>
                <CrewAvatar>
                  {getInitials(selectedCrewMember.first_name, selectedCrewMember.last_name)}
                </CrewAvatar>
                <CrewDetails>
                  <CrewMemberName>
                    {selectedCrewMember.first_name} {selectedCrewMember.last_name}
                  </CrewMemberName>
                  <CrewMemberInfo>
                    {selectedCrewMember.primary_position.title} • {selectedCrewMember.primary_position.department.name}
                  </CrewMemberInfo>
                </CrewDetails>
                <Button 
                  type="button" 
                  onClick={() => {
                    setSelectedCrewMember(null);
                    setSearchTerm('');
                    setFormData(prev => ({ ...prev, crew_member_id: 0 }));
                  }}
                >
                  Změnit
                </Button>
              </SelectedCrewMember>
            ) : (
              <CrewMemberSelector>
                <SearchIcon />
                <SearchInput
                  type="text"
                  placeholder="Vyhledat člena štábu..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowCrewList(true);
                  }}
                  onFocus={() => setShowCrewList(true)}
                />
                {showCrewList && searchTerm && (
                  <CrewList>
                    {filteredCrew.map((member) => (
                      <CrewListItem
                        key={member.id}
                        onClick={() => handleCrewMemberSelect(member)}
                      >
                        <CrewMemberName>
                          {member.first_name} {member.last_name}
                        </CrewMemberName>
                        <CrewMemberInfo>
                          {member.primary_position.title} • {member.primary_position.department.name}
                        </CrewMemberInfo>
                      </CrewListItem>
                    ))}
                    {filteredCrew.length === 0 && (
                      <CrewListItem>
                        <CrewMemberInfo>Žádní členové štábu nenalezeni</CrewMemberInfo>
                      </CrewListItem>
                    )}
                  </CrewList>
                )}
              </CrewMemberSelector>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Role v projektu</Label>
            <Input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              placeholder="Hlavní režisér, Asistent kamery..."
              required
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>
                <Calendar />
                Začátek práce
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
                Konec práce
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
              step="50"
            />
          </FormGroup>

          <FormGroup>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                name="is_key_personnel"
                checked={formData.is_key_personnel}
                onChange={handleInputChange}
              />
              <CheckboxLabel>
                <Star size={16} />
                Klíčový člen štábu
              </CheckboxLabel>
            </CheckboxContainer>
          </FormGroup>

          <FormGroup>
            <Label>Poznámky</Label>
            <TextArea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Dodatečné informace o roli..."
            />
          </FormGroup>

          <ModalActions>
            <Button type="button" onClick={onClose}>
              Zrušit
            </Button>
            <Button type="submit" $variant="primary" disabled={isLoading || !selectedCrewMember}>
              <Save />
              {isLoading ? 'Ukládání...' : isEditing ? 'Uložit změny' : 'Přiřadit štáb'}
            </Button>
          </ModalActions>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CrewAssignmentModal;
