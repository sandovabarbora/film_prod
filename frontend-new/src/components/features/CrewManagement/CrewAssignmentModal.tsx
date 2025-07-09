// src/components/features/CrewManagement/CrewAssignmentModal.tsx - WITH API PROJECTS + POSITIONS
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Calendar, DollarSign, FileText, MapPin, FolderOpen } from 'lucide-react';
import type { DepartmentWithPositions } from '../../../types/crew';
import crewService from '../../../services/crewService';
import projectService from '../../../services/projectService';
import Button from '../../ui/Button';

interface CrewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignmentData: AssignmentData) => Promise<void>;
  selectedCrewIds: string[];
  title: string;
  isProjectSpecific?: boolean;
  currentProjectId?: string; // NEW - ID aktuálního projektu pokud jsme v project view
}

interface AssignmentData {
  projectId?: string;
  position: string;
  positionId?: string;
  departmentId?: string;
  startDate: string;
  endDate: string;
  dailyRate?: number;
  notes?: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  start_date?: string;
  end_date?: string;
}

// Styled Components (same dark theme)
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-family: 'JetBrains Mono', monospace;
`;

const ModalContent = styled(motion.div)`
  background: #1a1b23;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(103, 126, 234, 0.2);
  color: #f9fafb;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(103, 126, 234, 0.1);
  
  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #667eea;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormSection = styled.div`
  h3 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 500;
    color: #667eea;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
  display: flex;
  flex-direction: column;
  ${({ $fullWidth }) => $fullWidth && 'grid-column: 1 / -1;'}
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #f9fafb;
  margin-bottom: 0.5rem;
  
  .required {
    color: #ef4444;
  }
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${({ $hasError }) => $hasError ? '#ef4444' : 'rgba(103, 126, 234, 0.2)'};
  border-radius: 8px;
  background: rgba(15, 16, 21, 0.9);
  color: #f9fafb;
  font-size: 0.875rem;
  font-family: 'JetBrains Mono', monospace;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(103, 126, 234, 0.1);
    background: rgba(10, 11, 16, 0.95);
  }
  
  &::placeholder {
    color: #6b7280;
  }
  
  &[type="date"] {
    position: relative;
    color-scheme: dark;
    
    &::-webkit-calendar-picker-indicator {
      background-color: #667eea;
      border-radius: 3px;
      cursor: pointer;
      filter: invert(1);
    }
    
    &::-webkit-inner-spin-button,
    &::-webkit-clear-button {
      display: none;
    }
  }
  
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px rgba(15, 16, 21, 0.9) inset !important;
    -webkit-text-fill-color: #f9fafb !important;
    color: #f9fafb !important;
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${({ $hasError }) => $hasError ? '#ef4444' : 'rgba(103, 126, 234, 0.2)'};
  border-radius: 8px;
  background: rgba(15, 16, 21, 0.9);
  color: #f9fafb;
  font-size: 0.875rem;
  font-family: 'JetBrains Mono', monospace;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(103, 126, 234, 0.1);
    background: rgba(10, 11, 16, 0.95);
  }
  
  option {
    background: #1a1b23;
    color: #f9fafb;
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${({ $hasError }) => $hasError ? '#ef4444' : 'rgba(103, 126, 234, 0.2)'};
  border-radius: 8px;
  background: rgba(15, 16, 21, 0.9);
  color: #f9fafb;
  font-size: 0.875rem;
  font-family: 'JetBrains Mono', monospace;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(103, 126, 234, 0.1);
    background: rgba(10, 11, 16, 0.95);
  }
  
  &::placeholder {
    color: #6b7280;
  }
`;

const SelectedCrewInfo = styled.div`
  background: rgba(103, 126, 234, 0.1);
  border: 1px solid rgba(103, 126, 234, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: #667eea;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  p {
    margin: 0;
    color: #8b8b8b;
    font-size: 0.75rem;
  }
`;

const CrewCount = styled.span`
  background: rgba(103, 126, 234, 0.2);
  color: #667eea;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const ProjectStatus = styled.span<{ $status: string }>`
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-left: 0.5rem;
  
  ${({ $status }) => {
    switch ($status) {
      case 'active':
        return 'background: rgba(34, 197, 94, 0.1); color: #22c55e;';
      case 'prep':
        return 'background: rgba(103, 126, 234, 0.1); color: #667eea;';
      case 'post':
        return 'background: rgba(245, 158, 11, 0.1); color: #f59e0b;';
      case 'completed':
        return 'background: rgba(107, 114, 128, 0.1); color: #6b7280;';
      default:
        return 'background: rgba(107, 114, 128, 0.1); color: #6b7280;';
    }
  }}
`;

const LoadingState = styled.div`
  padding: 1rem;
  text-align: center;
  color: #8b8b8b;
  font-size: 0.875rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(103, 126, 234, 0.1);
`;

export const CrewAssignmentModal: React.FC<CrewAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  selectedCrewIds,
  title,
  isProjectSpecific = false,
  currentProjectId
}) => {
  const [formData, setFormData] = useState<AssignmentData>({
    projectId: currentProjectId || '',
    position: '',
    positionId: '',
    departmentId: '',
    startDate: '',
    endDate: '',
    dailyRate: undefined,
    notes: ''
  });

  // State for API data
  const [departments, setDepartments] = useState<DepartmentWithPositions[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Auto-select current project if in project-specific mode
  useEffect(() => {
    if (isProjectSpecific && currentProjectId) {
      setFormData(prev => ({
        ...prev,
        projectId: currentProjectId
      }));
    }
  }, [isProjectSpecific, currentProjectId]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      // Load both departments and projects in parallel
      const [departmentsData, projectsData] = await Promise.allSettled([
        crewService.getDepartmentsWithPositions(),
        projectService.getProjects()
      ]);

      if (departmentsData.status === 'fulfilled') {
        setDepartments(departmentsData.value);
        console.log('📋 Departments loaded for assignment:', departmentsData.value);
      } else {
        console.error('Failed to load departments:', departmentsData.reason);
      }

      if (projectsData.status === 'fulfilled') {
        // Filter active projects for assignment
        const activeProjects = departmentsData.value.filter((p: Project) => 
          p.status === 'active' || p.status === 'prep'
        );
        setProjects(activeProjects);
        console.log('🎬 Projects loaded for assignment:', activeProjects);
      } else {
        console.error('Failed to load projects:', projectsData.reason);
      }
    } catch (error) {
      console.error('Failed to load assignment data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleInputChange = (field: keyof AssignmentData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setFormData(prev => ({
      ...prev,
      departmentId: departmentId,
      positionId: '',
      position: ''
    }));
  };

  const handlePositionChange = (positionId: string) => {
    const position = getCurrentPositions().find(p => p.id.toString() === positionId);
    setFormData(prev => ({
      ...prev,
      positionId: positionId,
      position: position?.title || ''
    }));
  };

  const getCurrentPositions = () => {
    if (!selectedDepartment) return [];
    const dept = departments.find(d => d.id.toString() === selectedDepartment);
    return dept?.positions || [];
  };

  const getSelectedProject = () => {
    return projects.find(p => p.id === formData.projectId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🎯 Assigning crew with data:', formData);
      await onAssign(formData);
      
      // Reset form
      setFormData({
        projectId: currentProjectId || '',
        position: '',
        positionId: '',
        departmentId: '',
        startDate: '',
        endDate: '',
        dailyRate: undefined,
        notes: ''
      });
      setSelectedDepartment('');
      
      onClose();
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    const hasPosition = formData.positionId !== '';
    const hasStartDate = formData.startDate !== '';
    const hasProject = formData.projectId !== '';
    
    return hasPosition && hasStartDate && hasProject && !dataLoading;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContent
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <h2>
              <Users size={20} />
              Přiřadit štáb k projektu
            </h2>
            <Button variant="ghost" icon={<X size={20} />} onClick={onClose} />
          </ModalHeader>

          <ModalBody>
            <SelectedCrewInfo>
              <h4>
                Přiřazení štábu k projektu
                <CrewCount>{selectedCrewIds.length} vybraných členů</CrewCount>
              </h4>
              <p>Vyberte projekt a pozici z dostupných oddělení pro přiřazení vybraných členů štábu.</p>
            </SelectedCrewInfo>

            {dataLoading ? (
              <LoadingState>
                Načítám projekty a oddělení...
              </LoadingState>
            ) : (
              <Form onSubmit={handleSubmit}>
                {/* Project Selection */}
                <FormSection>
                  <h3>
                    <FolderOpen size={16} />
                    Výběr projektu
                  </h3>
                  <FormField $fullWidth>
                    <Label>
                      Projekt <span className="required">*</span>
                    </Label>
                    <Select
                      value={formData.projectId}
                      onChange={(e) => handleInputChange('projectId', e.target.value)}
                      disabled={isProjectSpecific} // Disable if already in project context
                      required
                    >
                      <option value="">-- Vyberte projekt --</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                          <ProjectStatus $status={project.status}>
                            {project.status}
                          </ProjectStatus>
                        </option>
                      ))}
                    </Select>
                    {isProjectSpecific && (
                      <small style={{ color: '#8b8b8b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Přiřazování pro aktuální projekt
                      </small>
                    )}
                  </FormField>
                </FormSection>

                {/* Position Assignment */}
                <FormSection>
                  <h3>
                    <MapPin size={16} />
                    Pozice na projektu
                  </h3>
                  <FormGrid>
                    <FormField>
                      <Label>
                        Oddělení <span className="required">*</span>
                      </Label>
                      <Select
                        value={selectedDepartment}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        required
                      >
                        <option value="">Vyberte oddělení</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </Select>
                    </FormField>

                    <FormField>
                      <Label>
                        Pozice <span className="required">*</span>
                      </Label>
                      <Select
                        value={formData.positionId || ''}
                        onChange={(e) => handlePositionChange(e.target.value)}
                        disabled={!selectedDepartment}
                        required
                      >
                        <option value="">Vyberte pozici</option>
                        {getCurrentPositions().map(pos => (
                          <option key={pos.id} value={pos.id}>
                            {pos.title}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </FormGrid>
                </FormSection>

                {/* Date Range */}
                <FormSection>
                  <h3>
                    <Calendar size={16} />
                    Termíny práce
                  </h3>
                  <FormGrid>
                    <FormField>
                      <Label>
                        Začátek práce <span className="required">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        min={getSelectedProject()?.start_date || undefined}
                        max={getSelectedProject()?.end_date || undefined}
                        required
                      />
                    </FormField>

                    <FormField>
                      <Label>Konec práce</Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        min={formData.startDate}
                        max={getSelectedProject()?.end_date || undefined}
                      />
                    </FormField>
                  </FormGrid>
                </FormSection>

                {/* Financial Terms */}
                <FormSection>
                  <h3>
                    <DollarSign size={16} />
                    Finanční podmínky
                  </h3>
                  <FormField>
                    <Label>Denní sazba (USD)</Label>
                    <Input
                      type="number"
                      value={formData.dailyRate || ''}
                      onChange={(e) => handleInputChange('dailyRate', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="1500"
                      min="0"
                      step="50"
                    />
                  </FormField>
                </FormSection>

                {/* Notes */}
                <FormSection>
                  <h3>
                    <FileText size={16} />
                    Poznámky
                  </h3>
                  <FormField $fullWidth>
                    <Label>Speciální požadavky, dodatečné informace...</Label>
                    <TextArea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Dodatečné informace o přiřazení..."
                      rows={3}
                    />
                  </FormField>
                </FormSection>
              </Form>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Zrušit
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? 'Přiřazuji...' : `Přiřadit štáb (${selectedCrewIds.length})`}
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default CrewAssignmentModal;
