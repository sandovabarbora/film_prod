import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../ui/Button';

interface Document {
  id: string;
  title: string;
  filename: string;
  description?: string;
  type: string;
  status: string;
  version: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  tags: string[];
  permissions: {
    canView: string[];
    canEdit: string[];
    canApprove: string[];
  };
  versions: any[];
  comments: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: string;
    type: 'comment' | 'suggestion' | 'approval' | 'rejection';
    resolved?: boolean;
  }>;
  approvalRequired?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
  onCommentAdd?: (documentId: string, comment: any) => void;
  onApprovalRequest?: (documentId: string) => void;
  onApprovalAction?: (documentId: string, action: 'approve' | 'reject', comment?: string) => void;
  onVersionView: () => void;
  currentUser: {
    name: string;
    role: string;
    permissions: string[];
  };
  formatFileSize: (bytes: number) => string;
  getStatusColor: (status: string) => string;
}

export function DocumentViewer({ 
  document, 
  onClose,
  onCommentAdd,
  onApprovalRequest,
  onApprovalAction,
  onVersionView,
  currentUser,
  formatFileSize,
  getStatusColor
}: DocumentViewerProps) {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'suggestion'>('comment');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const canApprove = document.permissions.canApprove.includes(currentUser.name) || 
                    currentUser.permissions.includes('admin');
  
  const canComment = document.permissions.canView.includes(currentUser.name) ||
                    currentUser.permissions.includes('admin');

  const handleAddComment = () => {
    if (newComment.trim() && onCommentAdd) {
      onCommentAdd(document.id, {
        author: currentUser.name,
        content: newComment.trim(),
        type: commentType
      });
      setNewComment('');
    }
  };

  const handleApprovalAction = (action: 'approve' | 'reject') => {
    if (onApprovalAction) {
      onApprovalAction(document.id, action, newComment || undefined);
    }
    setShowApprovalModal(false);
    setNewComment('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ');
  };

  const getCommentIcon = (type: string) => {
    const icons = {
      comment: '💬',
      suggestion: '💡',
      approval: '✅',
      rejection: '❌'
    };
    return icons[type as keyof typeof icons] || '💬';
  };

  const getDocumentPreview = () => {
    // Placeholder pro document preview
    if (document.mimeType.startsWith('image/')) {
      return (
        <ImagePreview>
          <PreviewPlaceholder>
            📷 Náhled obrázku
            <br />
            {document.filename}
          </PreviewPlaceholder>
        </ImagePreview>
      );
    }
    
    if (document.mimeType === 'application/pdf') {
      return (
        <PDFPreview>
          <PreviewPlaceholder>
            📄 PDF Dokument
            <br />
            {document.filename}
            <br />
            <ViewerNote>PDF viewer bude implementován v další iteraci</ViewerNote>
          </PreviewPlaceholder>
        </PDFPreview>
      );
    }

    return (
      <GenericPreview>
        <PreviewPlaceholder>
          📄 {document.filename}
          <br />
          <ViewerNote>Preview pro tento typ souboru není dostupný</ViewerNote>
        </PreviewPlaceholder>
      </GenericPreview>
    );
  };

  return (
    <ViewerContainer>
      {/* Header */}
      <ViewerHeader>
        <HeaderLeft>
          <BackButton onClick={onClose}>
            ← Zpět na seznam
          </BackButton>
          <DocumentTitleSection>
            <DocumentTitle>{document.title}</DocumentTitle>
            <DocumentFilename>{document.filename}</DocumentFilename>
          </DocumentTitleSection>
        </HeaderLeft>

        <HeaderActions>
          <SecondaryButton onClick={onVersionView} size="sm">
            📚 Verze ({document.versions.length})
          </SecondaryButton>
          
          {document.status === 'draft' && onApprovalRequest && (
            <PrimaryButton 
              onClick={() => onApprovalRequest(document.id)}
              size="sm"
            >
              📤 Poslat ke schválení
            </PrimaryButton>
          )}
          
          {document.status === 'review' && canApprove && (
            <PrimaryButton 
              onClick={() => setShowApprovalModal(true)}
              size="sm"
            >
              ✅ Schválit/Zamítnout
            </PrimaryButton>
          )}
        </HeaderActions>
      </ViewerHeader>

      <ViewerContent>
        {/* Document Preview */}
        <DocumentPreviewSection>
          <GlassCard>
            <CardHeader>
              <PreviewHeader>
                <h3>Náhled dokumentu</h3>
                <DocumentMeta>
                  <StatusBadge $color={getStatusColor(document.status)}>
                    {document.status}
                  </StatusBadge>
                  <VersionBadge>v{document.version}</VersionBadge>
                  <SizeBadge>{formatFileSize(document.size)}</SizeBadge>
                </DocumentMeta>
              </PreviewHeader>
            </CardHeader>
            <CardContent>
              <PreviewContainer>
                {getDocumentPreview()}
              </PreviewContainer>
            </CardContent>
          </GlassCard>
        </DocumentPreviewSection>

        {/* Document Info & Comments */}
        <DocumentSidebar>
          {/* Document Info */}
          <GlassCard>
            <CardHeader>
              <h4>Informace o dokumentu</h4>
            </CardHeader>
            <CardContent>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Typ:</InfoLabel>
                  <InfoValue>{document.type}</InfoValue>
                </InfoItem>
                
                <InfoItem>
                  <InfoLabel>Nahrál:</InfoLabel>
                  <InfoValue>{document.uploadedBy}</InfoValue>
                </InfoItem>
                
                <InfoItem>
                  <InfoLabel>Nahráno:</InfoLabel>
                  <InfoValue>{formatDate(document.uploadedAt)}</InfoValue>
                </InfoItem>
                
                <InfoItem>
                  <InfoLabel>Upraveno:</InfoLabel>
                  <InfoValue>{formatDate(document.lastModified)}</InfoValue>
                </InfoItem>
                
                {document.approvedBy && (
                  <InfoItem>
                    <InfoLabel>Schválil:</InfoLabel>
                    <InfoValue>{document.approvedBy}</InfoValue>
                  </InfoItem>
                )}
              </InfoGrid>

              {document.description && (
                <DocumentDescription>
                  <InfoLabel>Popis:</InfoLabel>
                  <DescriptionText>{document.description}</DescriptionText>
                </DocumentDescription>
              )}

              {document.tags.length > 0 && (
                <DocumentTagsSection>
                  <InfoLabel>Tagy:</InfoLabel>
                  <TagsList>
                    {document.tags.map(tag => (
                      <DocumentTag key={tag}>{tag}</DocumentTag>
                    ))}
                  </TagsList>
                </DocumentTagsSection>
              )}
            </CardContent>
          </GlassCard>

          {/* Comments Section */}
          <GlassCard>
            <CardHeader>
              <h4>Komentáře ({document.comments.length})</h4>
            </CardHeader>
            <CardContent>
              <CommentsSection>
                <CommentsList>
                  {document.comments.map(comment => (
                    <CommentItem key={comment.id} $type={comment.type}>
                      <CommentHeader>
                        <CommentAuthor>
                          <CommentIcon>{getCommentIcon(comment.type)}</CommentIcon>
                          {comment.author}
                        </CommentAuthor>
                        <CommentTime>{formatDate(comment.timestamp)}</CommentTime>
                      </CommentHeader>
                      
                      <CommentContent>{comment.content}</CommentContent>
                      
                      {comment.type === 'suggestion' && !comment.resolved && (
                        <CommentActions>
                          <CommentActionButton>
                            ✅ Vyřešit
                          </CommentActionButton>
                        </CommentActions>
                      )}
                    </CommentItem>
                  ))}
                  
                  {document.comments.length === 0 && (
                    <EmptyComments>
                      Zatím žádné komentáře
                    </EmptyComments>
                  )}
                </CommentsList>

                {/* Add Comment Form */}
                {canComment && (
                  <AddCommentForm>
                    <CommentTypeSelector>
                      <CommentTypeButton
                        $isActive={commentType === 'comment'}
                        onClick={() => setCommentType('comment')}
                      >
                        💬 Komentář
                      </CommentTypeButton>
                      <CommentTypeButton
                        $isActive={commentType === 'suggestion'}
                        onClick={() => setCommentType('suggestion')}
                      >
                        💡 Návrh
                      </CommentTypeButton>
                    </CommentTypeSelector>
                    
                    <CommentTextarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={commentType === 'comment' 
                        ? 'Napište komentář...' 
                        : 'Napište návrh na úpravu...'
                      }
                      rows={3}
                    />
                    
                    <CommentActions>
                      <PrimaryButton 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        size="sm"
                      >
                        {commentType === 'comment' ? 'Přidat komentář' : 'Odeslat návrh'}
                      </PrimaryButton>
                    </CommentActions>
                  </AddCommentForm>
                )}
              </CommentsSection>
            </CardContent>
          </GlassCard>
        </DocumentSidebar>
      </ViewerContent>

      {/* Approval Modal */}
      {showApprovalModal && (
        <ApprovalModal onClick={() => setShowApprovalModal(false)}>
          <ApprovalModalContent onClick={e => e.stopPropagation()}>
            <ApprovalModalHeader>
              <h3>Schválení dokumentu</h3>
              <p>Rozhodněte o schválení dokumentu "{document.title}"</p>
            </ApprovalModalHeader>
            
            <ApprovalForm>
              <CommentTextarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Volitelný komentář k rozhodnutí..."
                rows={3}
              />
            </ApprovalForm>
            
            <ApprovalModalActions>
              <OutlineButton onClick={() => setShowApprovalModal(false)}>
                Zrušit
              </OutlineButton>
              <SecondaryButton onClick={() => handleApprovalAction('reject')}>
                ❌ Zamítnout
              </SecondaryButton>
              <PrimaryButton onClick={() => handleApprovalAction('approve')}>
                ✅ Schválit
              </PrimaryButton>
            </ApprovalModalActions>
          </ApprovalModalContent>
        </ApprovalModal>
      )}
    </ViewerContainer>
  );
}

// Styled Components
const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const ViewerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  flex: 1;
  min-width: 0;
`;

const BackButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const DocumentTitleSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const DocumentTitle = styled.h2`
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DocumentFilename = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-family: monospace;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ViewerContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: ${props => props.theme.spacing.lg};
  flex: 1;
  min-height: 0;
  padding: ${props => props.theme.spacing.lg};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const DocumentPreviewSection = styled.div`
  min-height: 0;
  overflow: hidden;
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const DocumentMeta = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const StatusBadge = styled.span<{ $color: string }>`
  padding: 2px 8px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: capitalize;
`;

const VersionBadge = styled.span`
  padding: 2px 8px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const SizeBadge = styled.span`
  padding: 2px 8px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const PreviewContainer = styled.div`
  height: 600px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 400px;
  }
`;

const PreviewPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const ViewerNote = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ImagePreview = styled.div`
  height: 100%;
`;

const PDFPreview = styled.div`
  height: 100%;
`;

const GenericPreview = styled.div`
  height: 100%;
`;

const DocumentSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  overflow-y: auto;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoLabel = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const InfoValue = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: right;
`;

const DocumentDescription = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
`;

const DescriptionText = styled.p`
  margin: ${props => props.theme.spacing.sm} 0 0 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.5;
`;

const DocumentTagsSection = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.sm};
`;

const DocumentTag = styled.span`
  padding: 2px 6px;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const CommentsSection = styled.div`
  max-height: 500px;
  overflow-y: auto;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const CommentItem = styled.div<{ $type: string }>`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  border-left: 3px solid ${props => {
    const colors = {
      comment: '#3B82F6',
      suggestion: '#F59E0B',
      approval: '#10B981',
      rejection: '#EF4444'
    };
    return colors[props.$type as keyof typeof colors] || '#3B82F6';
  }};
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CommentAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const CommentIcon = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const CommentTime = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const CommentContent = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.4;
`;

const CommentActions = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const CommentActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.xs};
  
  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const EmptyComments = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  padding: ${props => props.theme.spacing.xl};
`;

const AddCommentForm = styled.div`
  border-top: 1px solid ${props => props.theme.colors.border};
  padding-top: ${props => props.theme.spacing.lg};
`;

const CommentTypeSelector = styled.div`
  display: flex;
  margin-bottom: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
`;

const CommentTypeButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  padding: ${props => props.theme.spacing.sm};
  border: none;
  background: ${props => props.$isActive 
    ? props.theme.colors.primary 
    : 'transparent'
  };
  color: ${props => props.$isActive 
    ? 'white' 
    : props.theme.colors.text
  };
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  font-size: ${props => props.theme.typography.fontSize.sm};

  &:hover {
    background: ${props => props.$isActive 
      ? props.theme.colors.primary 
      : props.theme.colors.surface
    };
  }
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-family: inherit;
  font-size: ${props => props.theme.typography.fontSize.sm};
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

// Approval Modal
const ApprovalModal = styled.div`
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
`;

const ApprovalModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing['2xl']};
  border-radius: ${props => props.theme.borderRadius.lg};
  min-width: 500px;
  max-width: 90vw;
`;

const ApprovalModalHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  
  h3 {
    margin: 0 0 ${props => props.theme.spacing.sm} 0;
    color: ${props => props.theme.colors.text};
  }
  
  p {
    margin: 0;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const ApprovalForm = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ApprovalModalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
`;
