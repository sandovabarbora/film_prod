import React, { useState } from 'react';
import styled from 'styled-components';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

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
  onVersionHistory?: (documentId: string) => void;
  onDownload?: (documentId: string) => void;
  onEdit?: (documentId: string) => void;
  currentUser: {
    name: string;
    role: string;
    permissions: string[];
  };
  formatFileSize: (bytes: number) => string;
}

export function DocumentViewer({
  document,
  onClose,
  onCommentAdd,
  onApprovalRequest,
  onApprovalAction,
  onVersionHistory,
  onDownload,
  onEdit,
  currentUser,
  formatFileSize
}: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'comments' | 'history'>('preview');
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'suggestion'>('comment');
  const [approvalComment, setApprovalComment] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');

  const canEdit = currentUser.permissions.includes('admin') || 
                  document.permissions.canEdit.includes(currentUser.name);
  
  const canApprove = currentUser.permissions.includes('admin') || 
                     document.permissions.canApprove.includes(currentUser.name);

  const handleAddComment = () => {
    if (!newComment.trim() || !onCommentAdd) return;

    const comment = {
      id: Date.now().toString(),
      author: currentUser.name,
      content: newComment,
      timestamp: new Date().toISOString(),
      type: commentType,
      resolved: false
    };

    onCommentAdd(document.id, comment);
    setNewComment('');
  };

  const handleApprovalAction = () => {
    if (!onApprovalAction) return;

    onApprovalAction(document.id, approvalAction, approvalComment);
    setShowApprovalDialog(false);
    setApprovalComment('');
  };

  const renderPreview = () => {
    if (document.mimeType.includes('image')) {
      return (
        <ImagePreview>
          <img src={`/api/documents/${document.id}/preview`} alt={document.title} />
        </ImagePreview>
      );
    }

    if (document.mimeType.includes('pdf')) {
      return (
        <PDFPreview>
          <iframe 
            src={`/api/documents/${document.id}/preview`}
            title={document.title}
            width="100%"
            height="600px"
          />
        </PDFPreview>
      );
    }

    if (document.mimeType.includes('text')) {
      return (
        <TextPreview>
          <pre>Textový soubor - náhled bude implementován</pre>
        </TextPreview>
      );
    }

    return (
      <NoPreview>
        <NoPreviewIcon>📄</NoPreviewIcon>
        <NoPreviewTitle>Náhled není k dispozici</NoPreviewTitle>
        <NoPreviewDescription>
          Pro tento typ souboru ({document.mimeType}) není náhled podporován.
        </NoPreviewDescription>
        <Button onClick={() => onDownload?.(document.id)}>
          📥 Stáhnout soubor
        </Button>
      </NoPreview>
    );
  };

  const renderComments = () => {
    const sortedComments = [...document.comments].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
      <CommentsSection>
        <AddCommentForm>
          <CommentTypeSelector>
            <TypeButton 
              $active={commentType === 'comment'}
              onClick={() => setCommentType('comment')}
            >
              💬 Komentář
            </TypeButton>
            <TypeButton 
              $active={commentType === 'suggestion'}
              onClick={() => setCommentType('suggestion')}
            >
              💡 Návrh
            </TypeButton>
          </CommentTypeSelector>

          <CommentTextarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Napište komentář..."
            rows={3}
          />

          <CommentActions>
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              Přidat {commentType === 'comment' ? 'komentář' : 'návrh'}
            </Button>
          </CommentActions>
        </AddCommentForm>

        <CommentsList>
          {sortedComments.length > 0 ? (
            sortedComments.map(comment => (
              <CommentItem key={comment.id} $type={comment.type}>
                <CommentHeader>
                  <CommentAuthor>{comment.author}</CommentAuthor>
                  <CommentTime>
                    {new Date(comment.timestamp).toLocaleDateString('cs-CZ', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CommentTime>
                  <CommentTypeBadge $type={comment.type}>
                    {comment.type === 'comment' ? '💬' : 
                     comment.type === 'suggestion' ? '💡' : 
                     comment.type === 'approval' ? '✅' : '❌'}
                  </CommentTypeBadge>
                </CommentHeader>
                <CommentContent>{comment.content}</CommentContent>
                {comment.resolved && (
                  <CommentResolved>✅ Vyřešeno</CommentResolved>
                )}
              </CommentItem>
            ))
          ) : (
            <EmptyComments>
              <EmptyCommentsIcon>💬</EmptyCommentsIcon>
              <EmptyCommentsText>Zatím žádné komentáře</EmptyCommentsText>
            </EmptyComments>
          )}
        </CommentsList>
      </CommentsSection>
    );
  };

  const renderHistory = () => {
    return (
      <HistorySection>
        <HistoryHeader>
          <h4>Historie verzí</h4>
          <Button onClick={() => onVersionHistory?.(document.id)}>
            📋 Detailní historie
          </Button>
        </HistoryHeader>

        <VersionsList>
          {document.versions.length > 0 ? (
            document.versions.slice(0, 5).map((version, index) => (
              <VersionItem key={index}>
                <VersionNumber>v{version.version || `1.${index}`}</VersionNumber>
                <VersionInfo>
                  <VersionDate>
                    {new Date(version.uploadedAt || document.uploadedAt).toLocaleDateString('cs-CZ')}
                  </VersionDate>
                  <VersionAuthor>od {version.uploadedBy || document.uploadedBy}</VersionAuthor>
                </VersionInfo>
                <VersionActions>
                  <Button onClick={() => console.log('View version', version)}>
                    👁️ Zobrazit
                  </Button>
                </VersionActions>
              </VersionItem>
            ))
          ) : (
            <EmptyHistory>
              <EmptyHistoryIcon>📋</EmptyHistoryIcon>
              <EmptyHistoryText>Žádná historie verzí</EmptyHistoryText>
            </EmptyHistory>
          )}
        </VersionsList>
      </HistorySection>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ViewerContainer>
      <ViewerHeader>
        <HeaderLeft>
          <BackButton onClick={onClose}>
            ← Zpět na seznam
          </BackButton>
          <DocumentInfo>
            <DocumentTitle>{document.title}</DocumentTitle>
            <DocumentMeta>
              {document.filename} • {formatFileSize(document.size)} • v{document.version}
            </DocumentMeta>
          </DocumentInfo>
        </HeaderLeft>

        <HeaderActions>
          {canEdit && (
            <Button onClick={() => onEdit?.(document.id)}>
              ✏️ Upravit
            </Button>
          )}
          
          <Button onClick={() => onDownload?.(document.id)}>
            📥 Stáhnout
          </Button>

          {canApprove && document.approvalRequired && document.status !== 'approved' && (
            <Button onClick={() => setShowApprovalDialog(true)}>
              ✅ Schválit/Zamítnout
            </Button>
          )}
        </HeaderActions>
      </ViewerHeader>

      <ViewerTabs>
        <TabButton 
          $active={activeTab === 'preview'} 
          onClick={() => setActiveTab('preview')}
        >
          👁️ Náhled
        </TabButton>
        <TabButton 
          $active={activeTab === 'comments'} 
          onClick={() => setActiveTab('comments')}
        >
          💬 Komentáře ({document.comments.length})
        </TabButton>
        <TabButton 
          $active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
        >
          📋 Historie
        </TabButton>
      </ViewerTabs>

      <ViewerContent>
        {activeTab === 'preview' && renderPreview()}
        {activeTab === 'comments' && renderComments()}
        {activeTab === 'history' && renderHistory()}
      </ViewerContent>

      {showApprovalDialog && (
        <ApprovalDialog>
          <DialogOverlay onClick={() => setShowApprovalDialog(false)} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schválení dokumentu</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <ActionSelector>
                <ActionButton 
                  $active={approvalAction === 'approve'}
                  onClick={() => setApprovalAction('approve')}
                >
                  ✅ Schválit
                </ActionButton>
                <ActionButton 
                  $active={approvalAction === 'reject'}
                  onClick={() => setApprovalAction('reject')}
                >
                  ❌ Zamítnout
                </ActionButton>
              </ActionSelector>

              <CommentTextarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="Volitelný komentář k rozhodnutí..."
                rows={3}
              />
            </DialogBody>

            <DialogActions>
              <Button onClick={() => setShowApprovalDialog(false)}>
                Zrušit
              </Button>
              <Button onClick={handleApprovalAction}>
                {approvalAction === 'approve' ? 'Schválit' : 'Zamítnout'}
              </Button>
            </DialogActions>
          </DialogContent>
        </ApprovalDialog>
      )}
    </ViewerContainer>
  );
}

// Styled Components
const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const ViewerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
`;

const BackButton = styled.button`
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DocumentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const DocumentTitle = styled.h2`
  margin: 0 0 0.25rem 0;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DocumentMeta = styled.div`
  color: #8b8b8b;
  font-size: 0.875rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ViewerTabs = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
`;

const TabButton = styled.button<{ $active?: boolean }>`
  padding: 1rem 1.5rem;
  background: ${props => props.$active 
    ? 'rgba(103, 126, 234, 0.2)' 
    : 'transparent'
  };
  border: none;
  border-bottom: 2px solid ${props => props.$active 
    ? '#667eea' 
    : 'transparent'
  };
  color: ${props => props.$active ? '#667eea' : '#8b8b8b'};
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const ViewerContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 2rem;
`;

const ImagePreview = styled.div`
  text-align: center;
  
  img {
    max-width: 100%;
    max-height: 600px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const PDFPreview = styled.div`
  iframe {
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const TextPreview = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  
  pre {
    color: #fff;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    white-space: pre-wrap;
    margin: 0;
  }
`;

const NoPreview = styled.div`
  text-align: center;
  padding: 3rem;
  color: #8b8b8b;
`;

const NoPreviewIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const NoPreviewTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #8b8b8b;
`;

const NoPreviewDescription = styled.p`
  margin: 0 0 2rem 0;
  font-size: 0.875rem;
`;

const CommentsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AddCommentForm = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
`;

const CommentTypeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const TypeButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.$active 
    ? 'rgba(103, 126, 234, 0.2)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.$active 
    ? 'rgba(103, 126, 234, 0.4)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 6px;
  color: ${props => props.$active ? '#667eea' : '#8b8b8b'};
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  margin-bottom: 1rem;

  &::placeholder {
    color: #8b8b8b;
  }

  &:focus {
    outline: none;
    border-color: rgba(103, 126, 234, 0.4);
  }
`;

const CommentActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CommentItem = styled.div<{ $type: string }>`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid ${props => {
    switch (props.$type) {
      case 'suggestion': return '#f59e0b';
      case 'approval': return '#22c55e';
      case 'rejection': return '#ef4444';
      default: return '#667eea';
    }
  }};
  border-radius: 8px;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const CommentAuthor = styled.div`
  color: #fff;
  font-weight: 500;
  font-size: 0.875rem;
`;

const CommentTime = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
`;

const CommentTypeBadge = styled.div<{ $type: string }>`
  margin-left: auto;
`;

const CommentContent = styled.div`
  color: #8b8b8b;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const CommentResolved = styled.div`
  color: #22c55e;
  font-size: 0.75rem;
  margin-top: 0.5rem;
`;

const EmptyComments = styled.div`
  text-align: center;
  padding: 2rem;
  color: #8b8b8b;
`;

const EmptyCommentsIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const EmptyCommentsText = styled.div`
  font-size: 0.875rem;
`;

const HistorySection = styled.div``;

const HistoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  h4 {
    margin: 0;
    color: #fff;
  }
`;

const VersionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VersionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`;

const VersionNumber = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: rgba(103, 126, 234, 0.2);
  color: #667eea;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const VersionInfo = styled.div`
  flex: 1;
`;

const VersionDate = styled.div`
  color: #fff;
  font-size: 0.875rem;
`;

const VersionAuthor = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
`;

const VersionActions = styled.div``;

const EmptyHistory = styled.div`
  text-align: center;
  padding: 2rem;
  color: #8b8b8b;
`;

const EmptyHistoryIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const EmptyHistoryText = styled.div`
  font-size: 0.875rem;
`;

const ApprovalDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DialogOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
`;

const DialogContent = styled.div`
  position: relative;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
`;

const DialogHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const DialogTitle = styled.h3`
  margin: 0;
  color: #fff;
`;

const DialogBody = styled.div`
  padding: 1.5rem;
`;

const ActionSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ActionButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 0.75rem;
  background: ${props => props.$active 
    ? 'rgba(103, 126, 234, 0.2)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.$active 
    ? 'rgba(103, 126, 234, 0.4)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 6px;
  color: ${props => props.$active ? '#667eea' : '#8b8b8b'};
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DialogActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

export default DocumentViewer;
