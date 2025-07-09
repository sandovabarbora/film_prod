import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { DocumentSearch } from './DocumentSearch';
import { DocumentList } from './DocumentList';
import { DocumentViewer } from './DocumentViewer';
import { DocumentUploader } from './DocumentUploader';
import { VersionControl } from './VersionControl';

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

interface SearchFilters {
  query: string;
  type: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  tags: string[];
  uploadedBy: string;
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortDirection: 'asc' | 'desc';
}

interface DocumentManagerProps {
  projectId?: string;
  currentUser: {
    name: string;
    role: string;
    permissions: string[];
  };
  onDocumentSelect?: (document: Document) => void;
  showUploader?: boolean;
  showSearch?: boolean;
  maxHeight?: string;
  readonly?: boolean;
}

export function DocumentManager({
  projectId,
  currentUser,
  onDocumentSelect,
  showUploader = true,
  showSearch = true,
  maxHeight = '600px',
  readonly = false
}: DocumentManagerProps) {
  // State management
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [currentView, setCurrentView] = useState<'list' | 'viewer' | 'uploader' | 'versions'>('list');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    tags: [],
    uploadedBy: 'all',
    sortBy: 'date',
    sortDirection: 'desc'
  });

  // Statistics
  const [documentStats, setDocumentStats] = useState({
    total: 0,
    byType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    totalSize: 0,
    recentUploads: 0
  });

  // Data fetching
  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  useEffect(() => {
    applyFilters();
  }, [documents, searchFilters]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockDocuments: Document[] = [
        {
          id: '1',
          title: 'Hlavní scénář',
          filename: 'scenar_v3.pdf',
          description: 'Finální verze scénáře po revizi',
          type: 'script',
          status: 'final',
          version: '3.0',
          size: 2048576,
          mimeType: 'application/pdf',
          uploadedBy: 'Jana Novákova',
          uploadedAt: '2024-12-01T10:00:00Z',
          lastModified: '2024-12-10T14:30:00Z',
          tags: ['scénář', 'finální', 'revize'],
          permissions: {
            canView: ['all'],
            canEdit: ['Jana Novákova', currentUser.name],
            canApprove: ['admin']
          },
          versions: [
            { version: '3.0', uploadedAt: '2024-12-10T14:30:00Z', uploadedBy: 'Jana Novákova' },
            { version: '2.1', uploadedAt: '2024-12-05T09:15:00Z', uploadedBy: 'Jana Novákova' },
            { version: '2.0', uploadedAt: '2024-11-28T16:45:00Z', uploadedBy: 'Petr Svoboda' }
          ],
          comments: [],
          approvalRequired: true,
          approvedBy: 'Admin',
          approvedAt: '2024-12-10T15:00:00Z'
        },
        {
          id: '2',
          title: 'Natáčecí harmonogram',
          filename: 'harmonogram_prosinec.xlsx',
          description: 'Detailní harmonogram natáčení pro prosinec',
          type: 'schedule',
          status: 'approved',
          version: '1.2',
          size: 512000,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          uploadedBy: 'Tomáš Dvořák',
          uploadedAt: '2024-11-25T08:00:00Z',
          lastModified: '2024-12-08T11:20:00Z',
          tags: ['harmonogram', 'prosinec', 'natáčení'],
          permissions: {
            canView: ['all'],
            canEdit: ['Tomáš Dvořák', 'admin'],
            canApprove: ['admin']
          },
          versions: [
            { version: '1.2', uploadedAt: '2024-12-08T11:20:00Z', uploadedBy: 'Tomáš Dvořák' },
            { version: '1.1', uploadedAt: '2024-12-01T10:00:00Z', uploadedBy: 'Tomáš Dvořák' }
          ],
          comments: [
            {
              id: '1',
              author: 'Marie Svobodová',
              content: 'Harmonogram vypadá dobře, jen bych upravila časy pro scénu 15.',
              timestamp: '2024-12-08T12:00:00Z',
              type: 'suggestion'
            }
          ]
        },
        {
          id: '3',
          title: 'Rozpočet produkce',
          filename: 'rozpocet_2024.pdf',
          description: 'Detailní rozpočet projektu',
          type: 'budget',
          status: 'review',
          version: '2.0',
          size: 1024000,
          mimeType: 'application/pdf',
          uploadedBy: 'Lukáš Černý',
          uploadedAt: '2024-12-05T14:00:00Z',
          lastModified: '2024-12-09T09:30:00Z',
          tags: ['rozpočet', '2024', 'produkce'],
          permissions: {
            canView: ['admin', 'Lukáš Černý'],
            canEdit: ['Lukáš Černý'],
            canApprove: ['admin']
          },
          versions: [
            { version: '2.0', uploadedAt: '2024-12-09T09:30:00Z', uploadedBy: 'Lukáš Černý' },
            { version: '1.0', uploadedAt: '2024-12-05T14:00:00Z', uploadedBy: 'Lukáš Černý' }
          ],
          comments: [],
          approvalRequired: true
        }
      ];

      setDocuments(mockDocuments);
      calculateStats(mockDocuments);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání dokumentů');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (docs: Document[]) => {
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalSize = 0;
    let recentUploads = 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    docs.forEach(doc => {
      // Count by type
      byType[doc.type] = (byType[doc.type] || 0) + 1;
      
      // Count by status
      byStatus[doc.status] = (byStatus[doc.status] || 0) + 1;
      
      // Total size
      totalSize += doc.size;
      
      // Recent uploads
      if (new Date(doc.uploadedAt) > weekAgo) {
        recentUploads++;
      }
    });

    setDocumentStats({
      total: docs.length,
      byType,
      byStatus,
      totalSize,
      recentUploads
    });
  };

  const applyFilters = () => {
    let filtered = [...documents];

    // Text search
    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.filename.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (searchFilters.type !== 'all') {
      filtered = filtered.filter(doc => doc.type === searchFilters.type);
    }

    // Status filter
    if (searchFilters.status !== 'all') {
      filtered = filtered.filter(doc => doc.status === searchFilters.status);
    }

    // Date filters
    if (searchFilters.dateFrom) {
      filtered = filtered.filter(doc => 
        new Date(doc.lastModified) >= new Date(searchFilters.dateFrom)
      );
    }

    if (searchFilters.dateTo) {
      filtered = filtered.filter(doc => 
        new Date(doc.lastModified) <= new Date(searchFilters.dateTo)
      );
    }

    // Tags filter
    if (searchFilters.tags.length > 0) {
      filtered = filtered.filter(doc =>
        searchFilters.tags.some(tag => doc.tags.includes(tag))
      );
    }

    // User filter
    if (searchFilters.uploadedBy !== 'all') {
      filtered = filtered.filter(doc => doc.uploadedBy === searchFilters.uploadedBy);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (searchFilters.sortBy) {
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

      return searchFilters.sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredDocuments(filtered);
  };

  // Event handlers
  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleResetSearch = () => {
    setSearchFilters({
      query: '',
      type: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      tags: [],
      uploadedBy: 'all',
      sortBy: 'date',
      sortDirection: 'desc'
    });
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setCurrentView('viewer');
    onDocumentSelect?.(document);
  };

  const handleDocumentEdit = (document: Document) => {
    console.log('Edit document:', document.id);
    // TODO: Implement document editing
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (!confirm('Opravdu chcete smazat tento dokument?')) return;

    try {
      // TODO: Implement API call
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      console.log('Document deleted:', documentId);
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Smazání dokumentu se nezdařilo');
    }
  };

  const handleDocumentDownload = (document: Document) => {
    console.log('Download document:', document.id);
    // TODO: Implement download
  };

  const handleDocumentUpload = async (files: File[], metadata: any) => {
    try {
      // TODO: Implement API upload
      console.log('Uploading files:', files, metadata);
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh documents list
      await fetchDocuments();
      
      setCurrentView('list');
      alert('Dokumenty byly úspěšně nahrány');
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleCommentAdd = (documentId: string, comment: any) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, comments: [...doc.comments, comment] }
        : doc
    ));
  };

  const handleApprovalAction = (documentId: string, action: 'approve' | 'reject', comment?: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            status: action === 'approve' ? 'approved' : 'review',
            approvedBy: action === 'approve' ? currentUser.name : undefined,
            approvedAt: action === 'approve' ? new Date().toISOString() : undefined
          }
        : doc
    ));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAvailableTypes = () => {
    return Array.from(new Set(documents.map(doc => doc.type)));
  };

  const getAvailableStatuses = () => {
    return Array.from(new Set(documents.map(doc => doc.status)));
  };

  const getAvailableTags = () => {
    const allTags = documents.flatMap(doc => doc.tags);
    return Array.from(new Set(allTags));
  };

  const getAvailableUsers = () => {
    return Array.from(new Set(documents.map(doc => doc.uploadedBy)));
  };

  // Render different views
  const renderContent = () => {
    switch (currentView) {
      case 'viewer':
        return selectedDocument && (
          <DocumentViewer
            document={selectedDocument}
            onClose={() => setCurrentView('list')}
            onCommentAdd={handleCommentAdd}
            onApprovalAction={handleApprovalAction}
            onVersionHistory={() => setCurrentView('versions')}
            onDownload={handleDocumentDownload}
            onEdit={handleDocumentEdit}
            currentUser={currentUser}
            formatFileSize={formatFileSize}
          />
        );

      case 'uploader':
        return (
          <DocumentUploader
            onUpload={handleDocumentUpload}
            onCancel={() => setCurrentView('list')}
            currentUser={currentUser}
          />
        );

      case 'versions':
        return selectedDocument && (
          <VersionControl
            document={selectedDocument}
            onBackToViewer={() => setCurrentView('viewer')}
            currentUser={currentUser}
            formatFileSize={formatFileSize}
          />
        );

      default:
        return (
          <>
            {showSearch && (
              <DocumentSearch
                onSearch={handleSearch}
                onReset={handleResetSearch}
                initialFilters={searchFilters}
                availableTypes={getAvailableTypes()}
                availableStatuses={getAvailableStatuses()}
                availableTags={getAvailableTags()}
                availableUsers={getAvailableUsers()}
                isLoading={loading}
                resultCount={filteredDocuments.length}
              />
            )}

            <DocumentList
              documents={filteredDocuments}
              onDocumentSelect={handleDocumentSelect}
              onDocumentEdit={handleDocumentEdit}
              onDocumentDelete={handleDocumentDelete}
              onDocumentDownload={handleDocumentDownload}
              currentUser={currentUser}
              formatFileSize={formatFileSize}
              searchQuery={searchFilters.query}
              filterType={searchFilters.type}
              filterStatus={searchFilters.status}
            />
          </>
        );
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner>🔄</LoadingSpinner>
        <LoadingText>Načítání dokumentů...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <ErrorTitle>Chyba při načítání</ErrorTitle>
        <ErrorMessage>{error}</ErrorMessage>
        <Button onClick={fetchDocuments}>
          Zkusit znovu
        </Button>
      </ErrorContainer>
    );
  }

  return (
    <ManagerContainer $maxHeight={maxHeight}>
      {currentView === 'list' && (
        <ManagerHeader>
          <HeaderLeft>
            <ManagerTitle>📁 Správa dokumentů</ManagerTitle>
            <StatsBar>
              <StatItem>
                <StatNumber>{documentStats.total}</StatNumber>
                <StatLabel>dokumentů</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>{formatFileSize(documentStats.totalSize)}</StatNumber>
                <StatLabel>celková velikost</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>{documentStats.recentUploads}</StatNumber>
                <StatLabel>nových tento týden</StatLabel>
              </StatItem>
            </StatsBar>
          </HeaderLeft>

          {showUploader && !readonly && (
            <HeaderActions>
              <Button onClick={() => setCurrentView('uploader')}>
                📤 Nahrát dokumenty
              </Button>
            </HeaderActions>
          )}
        </ManagerHeader>
      )}

      <ManagerContent>
        {renderContent()}
      </ManagerContent>
    </ManagerContainer>
  );
}

// Styled Components
const ManagerContainer = styled.div<{ $maxHeight: string }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: ${props => props.$maxHeight};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
`;

const ManagerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ManagerTitle = styled.h2`
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
`;

const StatsBar = styled.div`
  display: flex;
  gap: 2rem;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const StatNumber = styled.div`
  color: #667eea;
  font-size: 1.25rem;
  font-weight: 700;
`;

const StatLabel = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
  text-align: center;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ManagerContent = styled.div`
  flex: 1;
  overflow: auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #8b8b8b;
`;

const LoadingSpinner = styled.div`
  font-size: 2rem;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 1rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #ef4444;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #ef4444;
`;

const ErrorMessage = styled.p`
  margin: 0 0 2rem 0;
  color: #8b8b8b;
`;

export default DocumentManager;
