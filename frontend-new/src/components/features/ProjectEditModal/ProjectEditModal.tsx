// src/components/features/ProjectEditModal/ProjectEditModal.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PrimaryButton, SecondaryButton } from '../../ui/Button';
import type { Project, UpdateProjectRequest } from '../../../types/project';

interface ProjectEditModalProps {
  project: Project;
  onClose: () => void;
  onSave: (data: Partial<UpdateProjectRequest>) => void;
}

export function ProjectEditModal({ project, onClose, onSave }: ProjectEditModalProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    type: project.type,
    genre: project.genre?.join(', ') || '',
    director: project.director,
    producer: project.producer,
    writer: project.writer || '',
    budget: {
      total: project.budget.total,
      currency: project.budget.currency
    },
    timeline: {
      startDate: project.timeline.startDate.split('T')[0], // Convert to YYYY-MM-DD
      endDate: project.timeline.endDate.split('T')[0]
    },
    priority: project.priority,
    visibility: project.visibility,
    tags: project.tags.join(', '),
    notes: project.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Název je povinný';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Popis je povinný';
    }

    if (!formData.director.trim()) {
      newErrors.director = 'Režisér je povinný';
    }

    if (!formData.producer.trim()) {
      newErrors.producer = 'Producent je povinný';
    }

    if (formData.budget.total <= 0) {
      newErrors['budget.total'] = 'Rozpočet musí být větší než 0';
    }

    if (!formData.timeline.startDate) {
      newErrors['timeline.startDate'] = 'Datum začátku je povinné';
    }

    if (!formData.timeline.endDate) {
      newErrors['timeline.endDate'] = 'Datum konce je povinné';
    }

    if (formData.timeline.startDate && formData.timeline.endDate) {
      if (new Date(formData.timeline.startDate) >= new Date(formData.timeline.endDate)) {
        newErrors['timeline.endDate'] = 'Datum konce musí být po datu začátku';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: Partial<UpdateProjectRequest> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        genre: formData.genre.split(',').map(g => g.trim()).filter(g => g),
        director: formData.director.trim(),
        producer: formData.producer.trim(),
        writer: formData.writer.trim() || undefined,
        budget: formData.budget,
        timeline: formData.timeline,
        priority: formData.priority,
        visibility: formData.visibility,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        notes: formData.notes.trim() || undefined
      };

      await onSave(updateData);
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Upravit projekt</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          <Form onSubmit={handleSubmit}>
            <FormGrid>
              {/* Basic Information */}
              <FormSection>
                <SectionTitle>Základní informace</SectionTitle>
                
                <FormGroup>
                  <Label htmlFor="title">Název projektu *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    $error={!!errors.title}
                    placeholder="Název filmu/projektu"
                  />
                  {errors.title && <ErrorText>{errors.title}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="description">Popis *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    $error={!!errors.description}
                    placeholder="Stručný popis projektu..."
                    rows={3}
                  />
                  {errors.description && <ErrorText>{errors.description}</ErrorText>}
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <Label htmlFor="type">Typ projektu</Label>
                    <Select
                      id="type"
                      value={formData.type}
                      onChange={(e) => handleChange('type', e.target.value)}
                    >
                      <option value="feature">Celovečerní film</option>
                      <option value="documentary">Dokumentární film</option>
                      <option value="short">Krátký film</option>
                      <option value="commercial">Reklama</option>
                      <option value="series">Seriál</option>
                      <option value="music_video">Hudební klip</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="priority">Priorita</Label>
                    <Select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => handleChange('priority', e.target.value)}
                    >
                      <option value="low">Nízká</option>
                      <option value="medium">Střední</option>
                      <option value="high">Vysoká</option>
                      <option value="critical">Kritická</option>
                    </Select>
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <Label htmlFor="genre">Žánry</Label>
                  <Input
                    id="genre"
                    type="text"
                    value={formData.genre}
                    onChange={(e) => handleChange('genre', e.target.value)}
                    placeholder="drama, komedie, thriller (oddělené čárkami)"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="tags">Tagy</Label>
                  <Input
                    id="tags"
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="léto, Praha, rodinný (oddělené čárkami)"
                  />
                </FormGroup>
              </FormSection>

              {/* Team Information */}
              <FormSection>
                <SectionTitle>Tým</SectionTitle>
                
                <FormGroup>
                  <Label htmlFor="director">Režisér *</Label>
                  <Input
                    id="director"
                    type="text"
                    value={formData.director}
                    onChange={(e) => handleChange('director', e.target.value)}
                    $error={!!errors.director}
                    placeholder="Jméno režiséra"
                  />
                  {errors.director && <ErrorText>{errors.director}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="producer">Producent *</Label>
                  <Input
                    id="producer"
                    type="text"
                    value={formData.producer}
                    onChange={(e) => handleChange('producer', e.target.value)}
                    $error={!!errors.producer}
                    placeholder="Jméno producenta"
                  />
                  {errors.producer && <ErrorText>{errors.producer}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="writer">Scenárista</Label>
                  <Input
                    id="writer"
                    type="text"
                    value={formData.writer}
                    onChange={(e) => handleChange('writer', e.target.value)}
                    placeholder="Jméno scenáristy (volitelné)"
                  />
                </FormGroup>
              </FormSection>

              {/* Budget & Timeline */}
              <FormSection>
                <SectionTitle>Rozpočet a časový plán</SectionTitle>
                
                <FormRow>
                  <FormGroup>
                    <Label htmlFor="budget">Celkový rozpočet *</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget.total}
                      onChange={(e) => handleChange('budget.total', parseInt(e.target.value) || 0)}
                      $error={!!errors['budget.total']}
                      placeholder="0"
                      min="0"
                    />
                    {errors['budget.total'] && <ErrorText>{errors['budget.total']}</ErrorText>}
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="currency">Měna</Label>
                    <Select
                      id="currency"
                      value={formData.budget.currency}
                      onChange={(e) => handleChange('budget.currency', e.target.value)}
                    >
                      <option value="CZK">CZK</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </Select>
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <Label htmlFor="startDate">Datum začátku *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.timeline.startDate}
                      onChange={(e) => handleChange('timeline.startDate', e.target.value)}
                      $error={!!errors['timeline.startDate']}
                    />
                    {errors['timeline.startDate'] && <ErrorText>{errors['timeline.startDate']}</ErrorText>}
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="endDate">Datum konce *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.timeline.endDate}
                      onChange={(e) => handleChange('timeline.endDate', e.target.value)}
                      $error={!!errors['timeline.endDate']}
                    />
                    {errors['timeline.endDate'] && <ErrorText>{errors['timeline.endDate']}</ErrorText>}
                  </FormGroup>
                </FormRow>
              </FormSection>

              {/* Settings */}
              <FormSection>
                <SectionTitle>Nastavení</SectionTitle>
                
                <FormGroup>
                  <Label htmlFor="visibility">Viditelnost</Label>
                  <Select
                    id="visibility"
                    value={formData.visibility}
                    onChange={(e) => handleChange('visibility', e.target.value)}
                  >
                    <option value="private">Soukromý</option>
                    <option value="team">Tým</option>
                    <option value="public">Veřejný</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="notes">Poznámky</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Interní poznámky k projektu..."
                    rows={4}
                  />
                </FormGroup>
              </FormSection>
            </FormGrid>
          </Form>
        </ModalBody>

        <ModalFooter>
          <SecondaryButton type="button" onClick={onClose}>
            Zrušit
          </SecondaryButton>
          <PrimaryButton 
            type="submit" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Ukládám...' : 'Uložit změny'}
          </PrimaryButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.lg};
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.xl};
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows['2xl']};
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.text};
    background: ${props => props.theme.colors.surface};
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.xl};
`;

const Form = styled.form`
  width: 100%;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: ${props => props.theme.spacing['2xl']};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  padding-bottom: ${props => props.theme.spacing.md};
  border-bottom: 2px solid ${props => props.theme.colors.primary};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => props.$error ? props.theme.colors.error : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.md};
  transition: all ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? props.theme.colors.error : props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.$error ? props.theme.colors.error : props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const Textarea = styled.textarea<{ $error?: boolean }>`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => props.$error ? props.theme.colors.error : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? props.theme.colors.error : props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.$error ? props.theme.colors.error : props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const ErrorText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.error};
  margin-top: ${props => props.theme.spacing.xs};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
`;
