import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, AlertCircle, Car, DollarSign } from 'lucide-react';
import crewService from '../../../services/crewService';
import Button from '../../ui/Button';
import type { CrewMemberFormData, DepartmentWithPositions } from '../../../types/crew';

interface CrewAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrewMemberFormData) => Promise<void>;
  initialData?: CrewMemberFormData;
  departmentsWithPositions?: DepartmentWithPositions[];
}

// Base styles pro JetBrains Mono
const jetBrainsStyles = css`
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  letter-spacing: -0.02em;
`;

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
`;

const ModalContent = styled(motion.div)`
  position: relative;
  background: rgba(13, 14, 20, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 
    0 0 0 1px rgba(102, 126, 234, 0.1),
    0 10px 40px -10px rgba(0, 0, 0, 0.8),
    0 0 80px -20px rgba(102, 126, 234, 0.3);
  z-index: 1;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(102, 126, 234, 0.5);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
`;

const ModalTitle = styled.h2`
  ${jetBrainsStyles}
  margin: 0;
  font-size: 1.125rem;
  font-weight: 500;
  color: rgba(102, 126, 234, 0.9);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f9fafb;
  }
`;

const Form = styled.form`
  padding: 1.5rem;
`;

const FormSection = styled.div`
  margin-bottom: 1.5rem;

  h3 {
    ${jetBrainsStyles}
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(102, 126, 234, 0.7);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div<{ $fullWidth?: boolean }>`
  grid-column: ${props => props.$fullWidth ? 'span 2' : 'span 1'};

  @media (max-width: 640px) {
    grid-column: span 1;
  }
`;

const Label = styled.label`
  ${jetBrainsStyles}
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(229, 231, 235, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Input = styled.input`
  ${jetBrainsStyles}
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 6px;
  color: rgba(249, 250, 251, 0.9);
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 
      0 0 0 3px rgba(102, 126, 234, 0.1),
      inset 0 0 0 1px rgba(102, 126, 234, 0.2);
  }

  &::placeholder {
    color: rgba(107, 114, 128, 0.6);
    font-style: italic;
  }
`;

const Select = styled.select`
  ${jetBrainsStyles}
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 6px;
  color: rgba(249, 250, 251, 0.9);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 
      0 0 0 3px rgba(102, 126, 234, 0.1),
      inset 0 0 0 1px rgba(102, 126, 234, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  option {
    background: #0d0e14;
    color: #f9fafb;
  }
`;

const TextArea = styled.textarea`
  ${jetBrainsStyles}
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 6px;
  color: rgba(249, 250, 251, 0.9);
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 
      0 0 0 3px rgba(102, 126, 234, 0.1),
      inset 0 0 0 1px rgba(102, 126, 234, 0.2);
  }

  &::placeholder {
    color: rgba(107, 114, 128, 0.6);
    font-style: italic;
  }
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const CheckboxLabel = styled.label`
  ${jetBrainsStyles}
  display: flex;
  align-items: center;
  color: rgba(229, 231, 235, 0.9);
  font-size: 0.875rem;
  cursor: pointer;
`;

const ErrorMessage = styled.span`
  ${jetBrainsStyles}
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #ef4444;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
`;

const StyledButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  ${jetBrainsStyles}
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  
  ${props => props.$variant === 'secondary' ? css`
    background: transparent;
    color: rgba(156, 163, 175, 0.9);
    border-color: rgba(102, 126, 234, 0.2);
    
    &:hover {
      background: rgba(102, 126, 234, 0.1);
      border-color: rgba(102, 126, 234, 0.3);
      color: rgba(249, 250, 251, 0.9);
    }
  ` : css`
    background: linear-gradient(135deg, 
      rgba(102, 126, 234, 0.8) 0%, 
      rgba(126, 87, 194, 0.8) 100%);
    color: white;
    box-shadow: 
      0 2px 8px -2px rgba(102, 126, 234, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 
        0 4px 12px -2px rgba(102, 126, 234, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CrewAddModal: React.FC<CrewAddModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  departmentsWithPositions
}) => {
  const [formData, setFormData] = useState<CrewMemberFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_primary: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    daily_rate: 1500,
    union_member: false,
    has_vehicle: true,
  });

  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [departments, setDepartments] = useState<DepartmentWithPositions[]>([]);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (departmentsWithPositions && departmentsWithPositions.length > 0) {
        console.log('📦 Using departments from props:', departmentsWithPositions);
        setDepartments(departmentsWithPositions);
      } else {
        loadDepartments();
      }
    }
  }, [isOpen, departmentsWithPositions]);

  useEffect(() => {
    console.log('🔄 CrewAddModal init effect:', {
      isOpen,
      departmentsCount: departments.length,
      hasInitialData: !!initialData,
      initialData
    });
    
    if (isOpen && departments.length > 0) {
      if (initialData) {
        console.log('📝 Setting form with initial data:', initialData);
        
        setFormData({
          first_name: initialData.first_name || '',
          last_name: initialData.last_name || '',
          email: initialData.email || '',
          phone_primary: initialData.phone_primary || '',
          emergency_contact_name: initialData.emergency_contact_name || '',
          emergency_contact_phone: initialData.emergency_contact_phone || '',
          daily_rate: initialData.daily_rate || 1500,
          union_member: initialData.union_member || false,
          has_vehicle: initialData.has_vehicle || true,
          primary_position_id: initialData.primary_position_id,
          notes: initialData.notes || ''
        });
        
        if (initialData.primary_position_id) {
          const positionId = initialData.primary_position_id.toString();
          console.log('🔍 Looking for position ID:', positionId);
          
          for (const dept of departments) {
            console.log(`🏢 Checking department ${dept.name} (ID: ${dept.id})`);
            
            const hasPosition = dept.positions?.some(p => p.id.toString() === positionId);
            if (hasPosition) {
              console.log('✅ Found position in department:', dept.name);
              setSelectedDepartment(dept.id.toString());
              break;
            }
          }
        }
      } else {
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone_primary: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          daily_rate: 1500,
          union_member: false,
          has_vehicle: true,
        });
        setSelectedDepartment('');
      }
    }
  }, [isOpen, initialData, departments]);

  const loadDepartments = async () => {
    setIsLoadingDepartments(true);
    try {
      console.log('📡 Fetching departments with positions...');
      const data = await crewService.getDepartmentsWithPositions();
      console.log('✅ Departments with positions:', data);
      
      if (Array.isArray(data)) {
        setDepartments(data);
      } else {
        console.error('❌ Departments data is not an array:', data);
        setDepartments([]);
      }
    } catch (error) {
      console.error('❌ Failed to load departments:', error);
      setDepartments([]);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const handleInputChange = (field: keyof CrewMemberFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleDepartmentChange = (departmentId: string) => {
    console.log('🏢 Department changed to:', departmentId);
    setSelectedDepartment(departmentId);
    setFormData(prev => ({
      ...prev,
      primary_position_id: undefined
    }));
  };

  const getCurrentPositions = () => {
    if (!selectedDepartment || !Array.isArray(departments)) return [];
    const dept = departments.find(d => d.id.toString() === selectedDepartment);
    console.log('📋 Current positions for dept:', dept?.name, dept?.positions);
    return dept?.positions || [];
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.primary_position_id) {
      newErrors.primary_position_id = 'Position is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Připravit data pro odeslání
      const dataToSubmit = {
        ...formData,
        // Převést position ID na číslo pokud je string
        primary_position_id: formData.primary_position_id ? 
          parseInt(formData.primary_position_id.toString()) : null,
        // Zajistit, že daily_rate je číslo
        daily_rate: formData.daily_rate ? 
          parseInt(formData.daily_rate.toString()) : null,
        // Zajistit správné boolean hodnoty
        union_member: !!formData.union_member,
        has_vehicle: !!formData.has_vehicle
      };
      
      console.log('📤 Submitting data:', dataToSubmit);
      
      await onSubmit(dataToSubmit);
      onClose();
    } catch (error: any) {
      console.error('Failed to save crew member:', error);
      console.error('Error details:', error.response?.data);
      
      // Zobrazit konkrétní chyby z backendu
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const newErrors: Record<string, string> = {};
        
        // Mapovat backend chyby na formulářová pole
        Object.keys(backendErrors).forEach(key => {
          if (Array.isArray(backendErrors[key])) {
            newErrors[key] = backendErrors[key][0];
          } else {
            newErrors[key] = backendErrors[key];
          }
        });
        
        setErrors(newErrors);
      } else {
        setErrors({
          submit: error.response?.data?.detail || 'Failed to save crew member'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalWrapper>
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <ModalContent
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <ModalHeader>
              <ModalTitle>
                <User size={20} />
                {isEditMode ? 'Edit Crew Member' : 'Add Crew Member'}
              </ModalTitle>
              <CloseButton onClick={onClose}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormSection>
                <h3>
                  <User size={16} />
                  Personal Info
                </h3>
                <FormGrid>
                  <FormField>
                    <Label>First Name *</Label>
                    <Input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="enter first name..."
                    />
                    {errors.first_name && (
                      <ErrorMessage>{errors.first_name}</ErrorMessage>
                    )}
                  </FormField>
                  
                  <FormField>
                    <Label>Last Name *</Label>
                    <Input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="enter last name..."
                    />
                    {errors.last_name && (
                      <ErrorMessage>{errors.last_name}</ErrorMessage>
                    )}
                  </FormField>
                </FormGrid>
              </FormSection>

              <FormSection>
                <h3>
                  <Mail size={16} />
                  Contact Info
                </h3>
                <FormGrid>
                  <FormField>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@example.com"
                    />
                    {errors.email && (
                      <ErrorMessage>{errors.email}</ErrorMessage>
                    )}
                  </FormField>
                  
                  <FormField>
                    <Label>Phone (max 15 chars)</Label>
                    <Input
                      type="tel"
                      value={formData.phone_primary}
                      onChange={(e) => handleInputChange('phone_primary', e.target.value)}
                      placeholder="+420 123 456 789"
                      maxLength={15}
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              <FormSection>
                <h3>Department + Position</h3>
                <FormGrid>
                  <FormField>
                    <Label>Department *</Label>
                    <Select
                      value={selectedDepartment}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      disabled={isLoadingDepartments}
                    >
                      <option value="">
                        {isLoadingDepartments ? 'loading departments...' : '[select department]'}
                      </option>
                      {Array.isArray(departments) && departments.map(dept => (
                        <option key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  
                  <FormField>
                    <Label>Position *</Label>
                    <Select
                      value={formData.primary_position_id || ''}
                      onChange={(e) => handleInputChange('primary_position_id', e.target.value)}
                      disabled={!selectedDepartment || isLoadingDepartments}
                    >
                      <option value="">
                        {!selectedDepartment 
                          ? '[select department first]' 
                          : isLoadingDepartments 
                            ? 'loading positions...' 
                            : '[select position]'}
                      </option>
                      {getCurrentPositions().map(pos => (
                        <option key={pos.id} value={pos.id.toString()}>
                          {pos.title}
                        </option>
                      ))}
                    </Select>
                    {errors.primary_position_id && (
                      <ErrorMessage>{errors.primary_position_id}</ErrorMessage>
                    )}
                  </FormField>
                </FormGrid>
              </FormSection>

              <FormSection>
                <h3>
                  <Phone size={16} />
                  Emergency Contact
                </h3>
                <FormGrid>
                  <FormField>
                    <Label>Contact Name</Label>
                    <Input
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                      placeholder="emergency contact name..."
                    />
                  </FormField>
                  
                  <FormField>
                    <Label>Contact Phone (max 15 chars)</Label>
                    <Input
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                      placeholder="+420 987 654 321"
                      maxLength={15}
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              <FormSection>
                <h3>Additional Info</h3>
                <FormGrid>
                  <FormField>
                    <Label>
                      <DollarSign size={16} style={{ display: 'inline' }} />
                      Daily Rate
                    </Label>
                    <Input
                      type="number"
                      value={formData.daily_rate}
                      onChange={(e) => handleInputChange('daily_rate', parseInt(e.target.value) || 0)}
                      placeholder="1500"
                    />
                  </FormField>
                  
                  <FormField>
                    <CheckboxLabel>
                      <Checkbox
                        type="checkbox"
                        checked={formData.union_member}
                        onChange={(e) => handleInputChange('union_member', e.target.checked)}
                      />
                      Union Member
                    </CheckboxLabel>
                    
                    <CheckboxLabel style={{ marginTop: '0.5rem' }}>
                      <Checkbox
                        type="checkbox"
                        checked={formData.has_vehicle}
                        onChange={(e) => handleInputChange('has_vehicle', e.target.checked)}
                      />
                      <Car size={16} style={{ marginRight: '0.5rem' }} />
                      Has Vehicle
                    </CheckboxLabel>
                  </FormField>
                  
                  <FormField $fullWidth>
                    <Label>Notes</Label>
                    <TextArea
                      value={formData.notes || ''}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="crew member notes and bio..."
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              {errors.submit && (
                <ErrorMessage style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  {errors.submit}
                </ErrorMessage>
              )}

              <ModalFooter>
                <StyledButton $variant="secondary" type="button" onClick={onClose}>
                  [cancel]
                </StyledButton>
                <StyledButton type="submit" disabled={isLoading}>
                  {isLoading ? 'saving...' : (isEditMode ? '[save_changes]' : '[add_crew]')}
                </StyledButton>
              </ModalFooter>
            </Form>
          </ModalContent>
        </ModalWrapper>
      )}
    </AnimatePresence>
  );
};

export default CrewAddModal;
