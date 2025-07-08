import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';
import { SecondaryButton, OutlineButton, DangerButton } from '../../ui/Button';

interface Document {
  id: string;
  title: string;
  filename: string;
  description?: string;
  type: 'script' | 'contract' | 'callsheet' | 'storyboard' | 'concept' | 'legal' | 'schedule' | 'other';
  category: 'pre_production' | 'production' | 'post_production' | 'admin' | 'legal';
  status: 'draft' | 'review' | 'approved' | 'final' | 'archived';
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
  comments: any[];
  relatedTasks?: string[];
  approvalRequired?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

interface DocumentListProps {
  documents: Document[];
  viewMode: 'grid' | 'list';
  selectedDocument: string | null;
  onDocumentSelect: (documentId: string) => void;
  onDocumentUpdate?: (documentId: string, updates: Partial<Document>) => void;
  onDocumentDelete?: (documentId: string) => void;
  currentUser: {
    name: string;
    role: string;
    permissions: string[];
  };
  formatFileSize: (bytes: number) => string;
  getDocumentTypeIcon: (type: string) => string;
  getStatusColor: (status: string) => string;
}

export function DocumentList({ 
  documents, 
  viewMode,
  selectedDocument, 
  onDocumentSelect,
  onDocumentUpdate,
  onDocumentDelete,
  currentUser,
  formatFileSize,
  getDocumentTypeIcon,
  getStatusColor
}: DocumentListProps) {
  const [hoveredDocument, setHoveredDocument] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const canEditDocument = (doc: Document) => {
    return doc.permissions.canEdit.includes(currentUser.name) || 
           currentUser.permissions.includes('admin') ||
           doc.uploadedBy === currentUser.name;
  };

  const canDeleteDocument = (doc: Document) => {
    return currentUser.permissions.includes('admin') ||
           doc.uploadedBy === currentUser.name;
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Včera';
    if (diffDays <= 7) return `Před ${diffDays} dny`;
    
    return date.toLocaleDateString('cs-CZ');
  };

  const getDocumentPreview = (doc: Document) => {
    // Placeholder pro document preview logic
    if (doc.mimeType.startsWith('image/')) {
      return `📷 Obrázek`;
    }
    if (doc.mimeType === 'application/pdf') {
      return `📄 PDF dokument`;
    }
    if (doc.mimeType.includes('video')) {
      return `🎥 Video`;
    }
    return `📄 ${getFileExtension(doc.filename)}`;
  };

  const handleQuickStatusChange = (docId: string, newStatus: string) => {
    if (onDocumentUpdate) {
      onDocumentUpdate(docId, { status: newStatus as any });
    }
  };

  const handleDeleteConfirm = (docId: string) => {
    if (onDocumentDelete) {
      onDocumentDelete(docId);
    }
    setShowDeleteModal(null);
  };

  if (documents.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon>📄</EmptyIcon>
        <EmptyTitle>Žádné dokumenty</EmptyTitle>
        <EmptyDescription>
          Zatím nebyly nahrány žádné dokumenty odpovídající vybraným filtrům.
        </EmptyDescription>
      </EmptyState>
    );
  }

  return (
    <DocumentListContainer>
      {viewMode === 'grid' && (
        <DocumentGrid>
          {documents.map(doc => (
            <DocumentCard
              key={doc.id}
              $isSelected={selectedDocument === doc.id}
              $status={doc.status}
              onMouseEnter={() => setHoveredDocument(doc.id)}
              onMouseLeave={() => setHoveredDocument(null)}
              onClick={() => onDocumentSelect(doc.id)}
            >
              <DocumentCardHeader>
                <DocumentTypeIcon>{getDocumentTypeIcon(doc.type)}</DocumentTypeIcon>
                <DocumentActions $isVisible={hoveredDocument === doc.id}>
                  {canEditDocument(doc) && (
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        // Quick edit logic
                      }}
                      title="Rychlé úpravy"
                    >
                      ✏️
                    </ActionButton>
                  )}
                  {canDeleteDocument(doc) && (
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteModal(doc.id);
                      }}
                      title="Smazat dokument"
                    >
                      🗑️
                    </ActionButton>
                  )}
                </DocumentActions>
              </DocumentCardHeader>

              <DocumentPreview>
                <PreviewArea>
                  {getDocumentPreview(doc)}
                </PreviewArea>
                <DocumentOverlay>
                  <VersionBadge>v{doc.version}</VersionBadge>
                  <StatusBadge $color={getStatusColor(doc.status)}>
                    {doc.status}
                  </StatusBadge>
                </DocumentOverlay>
              </DocumentPreview>

              <DocumentInfo>
                <DocumentTitle>{doc.title}</DocumentTitle>
                <DocumentFilename>{doc.filename}</DocumentFilename>
                
                {doc.description && (
                  <DocumentDescription>{doc.description}</DocumentDescription>
                )}

                <DocumentMeta>
                  <MetaItem>
                    <MetaIcon>📏</MetaIcon>
                    <MetaText>{formatFileSize(doc.size)}</MetaText>
                  </MetaItem>
                  
                  <MetaItem>
                    <MetaIcon>⏰</MetaIcon>
                    <MetaText>{formatDate(doc.lastModified)}</MetaText>
                  </MetaItem>
                  
                  <MetaItem>
                    <MetaIcon>👤</MetaIcon>
                    <MetaText>{doc.uploadedBy}</MetaText>
                  </MetaItem>
                </DocumentMeta>

                {doc.tags.length > 0 && (
                  <DocumentTags>
                    {doc.tags.slice(0, 3).map(tag => (
                      <DocumentTag key={tag}>{tag}</DocumentTag>
                    ))}
                    {doc.tags.length > 3 && (
                      <MoreTags>+{doc.tags.length - 3}</MoreTags>
                    )}
                  </DocumentTags>
                )}

                {/* Quick Actions */}
                <QuickActions>
                  {doc.status === 'draft' && canEditDocument(doc) && (
                    <QuickActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickStatusChange(doc.id, 'review');
                      }}
                    >
                      📤 Poslat na review
                    </QuickActionButton>
                  )}
                  
                  {doc.status === 'review' && doc.approvalRequired && (
                    <QuickActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickStatusChange(doc.id, 'approved');
                      }}
                    >
                      ✅ Schválit
                    </QuickActionButton>
                  )}
                </QuickActions>
              </DocumentInfo>
            </DocumentCard>
          ))}
        </DocumentGrid>
      )}

      {viewMode === 'list' && (
        <DocumentTable>
          <TableHeader>
            <HeaderCell $width="40%">Dokument</HeaderCell>
            <HeaderCell $width="15%">Typ</HeaderCell>
            <HeaderCell $width="10%">Status</HeaderCell>
            <HeaderCell $width="10%">Velikost</HeaderCell>
            <HeaderCell $width="15%">Upraveno</HeaderCell>
            <HeaderCell $width="10%">Akce</HeaderCell>
          </TableHeader>

          <TableBody>
            {documents.map(doc => (
              <TableRow
                key={doc.id}
                $isSelected={selectedDocument === doc.id}
                onClick={() => onDocumentSelect(doc.id)}
                onMouseEnter={() => setHoveredDocument(doc.id)}
                onMouseLeave={() => setHoveredDocument(null)}
              >
                <TableCell $width="40%">
                  <DocumentRowInfo>
                    <DocumentRowIcon>{getDocumentTypeIcon(doc.type)}</DocumentRowIcon>
                    <DocumentRowContent>
                      <DocumentRowTitle>{doc.title}</DocumentRowTitle>
                      <DocumentRowFilename>{doc.filename}</DocumentRowFilename>
                      <DocumentRowMeta>
                        v{doc.version} • {doc.uploadedBy}
                        {doc.tags.length > 0 && (
                          <TagsPreview>
                            • {doc.tags.slice(0, 2).join(', ')}
                            {doc.tags.length > 2 && '...'}
                          </TagsPreview>
                        )}
                      </DocumentRowMeta>
                    </DocumentRowContent>
                  </DocumentRowInfo>
                </TableCell>

                <TableCell $width="15%">
                  <TypeBadge>{doc.type}</TypeBadge>
                </TableCell>

                <TableCell $width="10%">
                  <StatusBadge $color={getStatusColor(doc.status)}>
                    {doc.status}
                  </StatusBadge>
                </TableCell>

                <TableCell $width="10%">
                  {formatFileSize(doc.size)}
                </TableCell>

                <TableCell $width="15%">
                  {formatDate(doc.lastModified)}
                </TableCell>

                <TableCell $width="10%">
                  <TableActions $isVisible={hoveredDocument === doc.id}>
                    {canEditDocument(doc) && (
                      <TableActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit logic
                        }}
                        title="Upravit"
                      >
                        ✏️
                      </TableActionButton>
                    )}
                    {canDeleteDocument(doc) && (
                      <TableActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteModal(doc.id);
                        }}
                        title="Smazat"
                      >
                        🗑️
                      </TableActionButton>
                    )}
                  </TableActions>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocumentTable>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal onClick={() => setShowDeleteModal(null)}>
          <DeleteModalContent onClick={e => e.stopPropagation()}>
            <DeleteModalHeader>
              <h3>Smazat dokument</h3>
              <p>Opravdu chcete smazat tento dokument? Tato akce je nevratná.</p>
            </DeleteModalHeader>
            
            <DeleteModalActions>
              <OutlineButton onClick={() => setShowDeleteModal(null)}>
                Zrušit
              </OutlineButton>
              <DangerButton onClick={() => handleDeleteConfirm(showDeleteModal)}>
                Smazat dokument
              </DangerButton>
            </DeleteModalActions>
          </DeleteModalContent>
        </DeleteModal>
      )}
    </DocumentListContainer>
  );
}

// Styled Components
const DocumentListContainer = styled.div`
  height: 100%;
  overflow-y: auto;
`;

const DocumentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DocumentCard = styled(GlassCard)<{ 
  $isSelected: boolean; 
  $status: string; 
}>`
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  border: 2px solid ${props => props.$isSelected 
    ? props.theme.colors.primary 
    : 'transparent'
  };
  border-left-color: ${props => {
    const colors = {
      draft: '#6B7280',
      review: '#F59E0B',
      approved: '#10B981',
      final: '#3B82F6',
      archived: '#9CA3AF'
    };
    return colors[props.$status as keyof typeof colors] || '#6B7280';
  }};
  border-left-width: 4px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const DocumentCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DocumentTypeIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
`;

const DocumentActions = styled.div<{ $isVisible: boolean }>`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity ${props => props.theme.transitions.fast};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: background ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const DocumentPreview = styled.div`
  position: relative;
  height: 150px;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.md};
  overflow: hidden;
`;

const PreviewArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.textSecondary};
`;

const DocumentOverlay = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.sm};
  right: ${props => props.theme.spacing.sm};
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const VersionBadge = styled.span`
  padding: 2px 6px;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
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

const DocumentInfo = styled.div``;

const DocumentTitle = styled.h4`
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const DocumentFilename = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.sm};
  font-family: monospace;
`;

const DocumentDescription = styled.p`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DocumentMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const MetaIcon = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const MetaText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const DocumentTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DocumentTag = styled.span`
  padding: 2px 6px;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const MoreTags = styled.span`
  padding: 2px 6px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const QuickActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const QuickActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.primary};
  background: ${props => props.theme.colors.primary}10;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  font-size: ${props => props.theme.typography.fontSize.xs};
  
  &:hover {
    background: ${props => props.theme.colors.primary}20;
  }
`;

// List View Styles
const DocumentTable = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.border};
`;

const TableHeader = styled.div`
  display: flex;
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text};
`;

const HeaderCell = styled.div<{ $width: string }>`
  padding: ${props => props.theme.spacing.md};
  width: ${props => props.$width};
  border-right: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-right: none;
  }
`;

const TableBody = styled.div``;

const TableRow = styled.div<{ $isSelected: boolean }>`
  display: flex;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => props.$isSelected 
    ? props.theme.colors.background 
    : 'transparent'
  };
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div<{ $width: string }>`
  padding: ${props => props.theme.spacing.md};
  width: ${props => props.$width};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  
  &:last-child {
    border-right: none;
  }
`;

const DocumentRowInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  width: 100%;
`;

const DocumentRowIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  flex-shrink: 0;
`;

const DocumentRowContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const DocumentRowTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DocumentRowFilename = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-family: monospace;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DocumentRowMeta = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const TagsPreview = styled.span`
  color: ${props => props.theme.colors.primary};
`;

const TypeBadge = styled.span`
  padding: 2px 8px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: capitalize;
`;

const TableActions = styled.div<{ $isVisible: boolean }>`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity ${props => props.theme.transitions.fast};
`;

const TableActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: background ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['4xl']};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  height: 400px;
`;

const EmptyIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const EmptyTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.text};
`;

const EmptyDescription = styled.p`
  margin: 0;
  max-width: 400px;
`;

// Delete Modal
const DeleteModal = styled.div`
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

const DeleteModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing['2xl']};
  border-radius: ${props => props.theme.borderRadius.lg};
  min-width: 400px;
  max-width: 90vw;
`;

const DeleteModalHeader = styled.div`
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

const DeleteModalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
`;
