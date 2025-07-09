import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

interface Project {
  id: string;
  title: string;
}

interface Props {
  project: Project | null;
  onClose: () => void;
  onConfirm: () => void;
  isOpen?: boolean;
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
  min-width: 400px;
  max-width: 90vw;
  border: 1px solid #ef4444;
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
    color: #ef4444;
  }
`;

const WarningContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .icon {
    color: #ef4444;
    margin-top: 0.25rem;
  }
`;

const ProjectDeleteModal: React.FC<Props> = ({ 
  project, 
  onClose, 
  onConfirm, 
  isOpen = true 
}) => {
  // Guard clause - pokud není project, neotevírej modal
  if (!project) {
    console.warn('ProjectDeleteModal: Cannot delete without project data');
    return null;
  }

  if (!isOpen) return null;

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
          <h3>Delete Project</h3>
          <Button variant="ghost" icon={<X size={16} />} onClick={onClose} />
        </ModalHeader>
        
        <WarningContent>
          <AlertTriangle size={24} className="icon" />
          <div>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>
              Are you sure you want to delete "{project.title}"?
            </p>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>
              This action cannot be undone. All project data will be permanently removed.
            </p>
          </div>
        </WarningContent>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete Project</Button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProjectDeleteModal;
