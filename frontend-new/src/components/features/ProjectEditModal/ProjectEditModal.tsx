import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Save, Calendar, DollarSign, MapPin, Film } from 'lucide-react';

interface ProjectFormData {
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  budget_total: number | string;
  location_primary: string;
}

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormData) => Promise<void>;
  project?: any;
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
  max-width: 600px;
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
  min-height: 100px;
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

const Select = styled.select`
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
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

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  project,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'development',
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    budget_total: project?.budget_total || '',
    location_primary: project?.location_primary || '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Film />
            {isEditing ? 'Upravit projekt' : 'Nový projekt'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              <Film />
              Název projektu
            </Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Zadejte název filmu..."
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Popis</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Krátký popis projektu..."
              required
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Status</Label>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="development">Vývoj</option>
                <option value="pre_production">Příprava</option>
                <option value="production">Natáčení</option>
                <option value="post_production">Postprodukce</option>
                <option value="completed">Dokončeno</option>
                <option value="cancelled">Zrušeno</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <DollarSign />
                Rozpočet (USD)
              </Label>
              <Input
                type="number"
                name="budget_total"
                value={formData.budget_total}
                onChange={handleInputChange}
                placeholder="5000000"
                min="0"
              />
            </FormGroup>
          </FormRow>

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
              <MapPin />
              Hlavní lokace
            </Label>
            <Input
              type="text"
              name="location_primary"
              value={formData.location_primary}
              onChange={handleInputChange}
              placeholder="Praha, Česká republika"
              required
            />
          </FormGroup>

          <ModalActions>
            <Button type="button" onClick={onClose}>
              Zrušit
            </Button>
            <Button type="submit" $variant="primary" disabled={isLoading}>
              <Save />
              {isLoading ? 'Ukládání...' : isEditing ? 'Uložit změny' : 'Vytvořit projekt'}
            </Button>
          </ModalActions>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProjectEditModal;
