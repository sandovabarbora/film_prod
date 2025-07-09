import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import type { CrewMember } from '../../types';

interface CrewDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  crewMember: CrewMember | null;
  onDelete: () => Promise<void>;
}

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
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 
    0 0 0 1px rgba(239, 68, 68, 0.1),
    0 10px 40px -10px rgba(0, 0, 0, 0.8),
    0 0 80px -20px rgba(239, 68, 68, 0.3);
  z-index: 1;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(239, 68, 68, 0.1);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
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

const ModalBody = styled.div`
  padding: 2rem 1.5rem;
`;

const WarningIcon = styled.div`
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  color: #ef4444;
`;

const Message = styled.p`
  text-align: center;
  color: #e5e7eb;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  font-family: 'JetBrains Mono', monospace;
`;

const CrewInfo = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const CrewName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #f9fafb;
  font-family: 'JetBrains Mono', monospace;
`;

const CrewDetails = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #9ca3af;
  font-family: 'JetBrains Mono', monospace;
`;

const WarningText = styled.p`
  text-align: center;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(239, 68, 68, 0.1);
`;

const DeleteButton = styled(Button)`
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.8) 0%, 
    rgba(220, 38, 38, 0.8) 100%);
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    box-shadow: 
      0 4px 12px -2px rgba(239, 68, 68, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
`;

const CrewDeleteModal: React.FC<CrewDeleteModalProps> = ({
  isOpen,
  onClose,
  crewMember,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Failed to delete crew member:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!crewMember) return null;

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
                <Trash2 size={20} />
                Delete Crew Member
              </ModalTitle>
              <CloseButton onClick={onClose}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <WarningIcon>
                <AlertTriangle size={32} />
              </WarningIcon>

              <Message>
                Are you sure you want to delete this crew member?
              </Message>

              <CrewInfo>
                <CrewName>
                  {crewMember.display_name || `${crewMember.first_name} ${crewMember.last_name}`}
                </CrewName>
                <CrewDetails>
                  {crewMember.primary_position_title || 'No position'} • {crewMember.email}
                </CrewDetails>
              </CrewInfo>

              <WarningText>
                ⚠️ This action cannot be undone
              </WarningText>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <DeleteButton
                icon={<Trash2 size={16} />}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Crew Member'}
              </DeleteButton>
            </ModalFooter>
          </ModalContent>
        </ModalWrapper>
      )}
    </AnimatePresence>
  );
};

export default CrewDeleteModal;
