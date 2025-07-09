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
  comments: any[];
  approvalRequired?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

interface DocumentListProps {
  documents: Document[];
  onDocumentSelect?: (document: Document) => void;
  onDocumentEdit?: (document: Document) => void;
  onDocumentDelete?: (documentId: string) => void;
  onDocumentDownload?: (document: Document) => void;
  currentUser: {
    name: string;
    role: string;
    permissions: string[];
  };
  formatFileSize: (bytes: number) => string;
  searchQuery?: string;
  filterType?: string;
  filterStatus?: string;
}

export function DocumentList({
  documents,
  onDocumentSelect,
  onDocumentEdit,
  onDocumentDelete,
  onDocumentDownload,
  currentUser,
  formatFileSize,
  searchQuery = '',
  filterType = 'all',
  filterStatus = 'all'
}: DocumentListProps) {
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  // Filtrování a řazení dokumentů
  const filteredAndSortedDocuments = documents
    .filter(doc => {
      const matchesSearch = searchQuery === '' || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = filterType === 'all' || doc.type === filterType;
      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: 'name' | 'date' | 'size' | 'type') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleSelectDocument = (documentId: string, isSelected: boolean) => {
    setSelectedDocuments(prev => 
      isSelected 
        ? [...prev, documentId]
        : prev.filter(id => id !== documentId)
    );
  };

  const handleSelectAll = (isSelected: boolean) => {
    setSelectedDocuments(
      isSelected ? filteredAndSortedDocuments.map(doc => doc.id) : []
    );
  };

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎬';
    if (mimeType.includes('audio')) return '🔊';
    if (mimeType.includes('text')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    return '📎';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'draft': '#6b7280',
      'review': '#f59e0b',
      'approved': '#3b82f6',
      'final': '#22c55e',
      'archived': '#9ca3af'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEdit = (document: Document) => {
    return currentUser.permissions.includes('admin') || 
           document.permissions.canEdit.includes(currentUser.name);
  };

  const canDelete = (document: Document) => {
    return currentUser.permissions.includes('admin') || 
           document.uploadedBy === currentUser.name;
  };

  return (
    <DocumentListContainer>
      <ListHeader>
        <ListTitle>
          📁 Dokumenty ({filteredAndSortedDocuments.length})
        </ListTitle>
        
        {selectedDocuments.length > 0 && (
          <BulkActions>
            <span>{selectedDocuments.length} vybraných</span>
            <Button onClick={() => console.log('Bulk download')}>
              📥 Stáhnout
            </Button>
            <Button onClick={() => console.log('Bulk delete')}>
              🗑️ Smazat
            </Button>
          </BulkActions>
        )}
      </ListHeader>

      <DocumentTable>
        <TableHeader>
          <HeaderRow>
            <CheckboxCell>
              <input
                type="checkbox"
                checked={selectedDocuments.length === filteredAndSortedDocuments.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </CheckboxCell>
            <SortableHeader onClick={() => handleSort('name')}>
              Název 
              {sortBy === 'name' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </SortableHeader>
            <SortableHeader onClick={() => handleSort('type')}>
              Typ
              {sortBy === 'type' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </SortableHeader>
            <SortableHeader onClick={() => handleSort('size')}>
              Velikost
              {sortBy === 'size' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </SortableHeader>
            <SortableHeader onClick={() => handleSort('date')}>
              Upraveno
              {sortBy === 'date' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </SortableHeader>
            <HeaderCell>Stav</HeaderCell>
            <HeaderCell>Akce</HeaderCell>
          </HeaderRow>
        </TableHeader>

        <TableBody>
          {filteredAndSortedDocuments.map(document => (
            <DocumentRow key={document.id}>
              <CheckboxCell>
                <input
                  type="checkbox"
                  checked={selectedDocuments.includes(document.id)}
                  onChange={(e) => handleSelectDocument(document.id, e.target.checked)}
                />
              </CheckboxCell>
              
              <DocumentCell onClick={() => onDocumentSelect?.(document)}>
                <DocumentInfo>
                  <DocumentIcon>{getDocumentIcon(document.mimeType)}</DocumentIcon>
                  <DocumentDetails>
                    <DocumentTitle>{document.title}</DocumentTitle>
                    <DocumentFilename>{document.filename}</DocumentFilename>
                    {document.description && (
                      <DocumentDescription>{document.description}</DocumentDescription>
                    )}
                  </DocumentDetails>
                </DocumentInfo>
              </DocumentCell>
              
              <TypeCell>
                <TypeBadge>{document.type}</TypeBadge>
              </TypeCell>
              
              <SizeCell>
                {formatFileSize(document.size)}
              </SizeCell>
              
              <DateCell>
                <DateInfo>
                  <div>{formatDate(document.lastModified)}</div>
                  <DateBy>od {document.uploadedBy}</DateBy>
                </DateInfo>
              </DateCell>
              
              <StatusCell>
                <StatusBadge $status={document.status}>
                  {document.status}
                </StatusBadge>
              </StatusCell>
              
              <ActionsCell>
                <ActionButton onClick={() => onDocumentSelect?.(document)}>
                  👁️
                </ActionButton>
                <ActionButton onClick={() => onDocumentDownload?.(document)}>
                  📥
                </ActionButton>
                {canEdit(document) && (
                  <ActionButton onClick={() => onDocumentEdit?.(document)}>
                    ✏️
                  </ActionButton>
                )}
                {canDelete(document) && (
                  <ActionButton 
                    onClick={() => onDocumentDelete?.(document.id)}
                    $danger
                  >
                    🗑️
                  </ActionButton>
                )}
              </ActionsCell>
            </DocumentRow>
          ))}
        </TableBody>
      </DocumentTable>

      {filteredAndSortedDocuments.length === 0 && (
        <EmptyState>
          <EmptyIcon>📂</EmptyIcon>
          <EmptyTitle>Žádné dokumenty nenalezeny</EmptyTitle>
          <EmptyDescription>
            {searchQuery ? 
              'Zkuste upravit vyhledávací kritéria' : 
              'Zatím nejsou nahráné žádné dokumenty'
            }
          </EmptyDescription>
        </EmptyState>
      )}
    </DocumentListContainer>
  );
}

// Styled Components
const DocumentListContainer = styled(Card)`
  padding: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ListTitle = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 1.25rem;
`;

const BulkActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #8b8b8b;
  font-size: 0.875rem;
`;

const DocumentTable = styled.div`
  width: 100%;
`;

const TableHeader = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 40px 2fr 100px 100px 150px 100px 120px;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.5rem;
`;

const CheckboxCell = styled.div`
  display: flex;
  justify-content: center;
`;

const SortableHeader = styled.div`
  color: #fff;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;

  &:hover {
    color: #667eea;
  }
`;

const HeaderCell = styled.div`
  color: #fff;
  font-weight: 600;
  font-size: 0.875rem;
`;

const TableBody = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const DocumentRow = styled.div`
  display: grid;
  grid-template-columns: 40px 2fr 100px 100px 150px 100px 120px;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const DocumentCell = styled.div`
  cursor: pointer;
`;

const DocumentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DocumentIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const DocumentDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const DocumentTitle = styled.div`
  color: #fff;
  font-weight: 500;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DocumentFilename = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DocumentDescription = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TypeCell = styled.div``;

const TypeBadge = styled.div`
  padding: 0.25rem 0.5rem;
  background: rgba(103, 126, 234, 0.2);
  color: #667eea;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
`;

const SizeCell = styled.div`
  color: #8b8b8b;
  font-size: 0.875rem;
`;

const DateCell = styled.div``;

const DateInfo = styled.div``;

const DateBy = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const StatusCell = styled.div``;

const StatusBadge = styled.div<{ $status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
  background: ${props => {
    switch (props.$status) {
      case 'final': return 'rgba(34, 197, 94, 0.2)';
      case 'approved': return 'rgba(59, 130, 246, 0.2)';
      case 'review': return 'rgba(245, 158, 11, 0.2)';
      case 'draft': return 'rgba(156, 163, 175, 0.2)';
      default: return 'rgba(156, 163, 175, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'final': return '#22c55e';
      case 'approved': return '#3b82f6';
      case 'review': return '#f59e0b';
      case 'draft': return '#9ca3af';
      default: return '#9ca3af';
    }
  }};
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: ${props => props.$danger ? '#ef4444' : '#8b8b8b'};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.75rem;

  &:hover {
    background: ${props => props.$danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => props.$danger ? '#ef4444' : '#fff'};
  }
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #8b8b8b;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #8b8b8b;
`;

const EmptyDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
`;

export default DocumentList;
