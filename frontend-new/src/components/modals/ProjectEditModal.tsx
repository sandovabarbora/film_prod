import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../ui/Button';

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
  location_primary: string;
  director?: string;
  producer?: string;
}

interface Props {
  project: Project | null;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => void;
  isOpen?: boolean;
  isEditing?: boolean;
}

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
  padding: 2rem;
  border-radius: 16px;
  min-width: 500px;
  max-width: 90vw;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f9fafb;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h3 {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.875rem;
    color: #667eea;
  }
`;

const ProjectEditModal: React.FC<Props> = ({ 
  project, 
  onClose, 
  onSave, 
  isOpen = true,
  isEditing = false 
}) => {
  // Guard clause - pokud není project a jsme v edit módu, neotevírej modal
  if (isEditing && !project) {
    console.warn('ProjectEditModal: Cannot edit without project data');
    return null;
  }

  if (!isOpen) return null;

  const handleSave = () => {
    // Základní save logika - v reálné aplikaci by zde byl formulář
    const updatedData = {
      title: project?.title || 'New Project',
      description: project?.description || '',
      status: project?.status || 'prep'
    };
    
    console.log('Save project:', project?.id || 'new');
    onSave(updatedData);
  };

  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <ModalContent
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <ModalHeader>
          <h3>{isEditing ? 'Edit Project' : 'Create Project'}</h3>
          <Button variant="ghost" icon={<X size={16} />} onClick={onClose} />
        </ModalHeader>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <p>Project editing form coming soon...</p>
          {project && (
            <p>Project: {project.title}</p>
          )}
          <p>Mode: {isEditing ? 'Edit existing' : 'Create new'}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProjectEditModal;
