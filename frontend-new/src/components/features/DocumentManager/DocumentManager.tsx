import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../ui/Button';
import { DocumentList } from './DocumentList';
import { DocumentViewer } from './DocumentViewer';
import { DocumentUploader } from './DocumentUploader';
import { DocumentSearch } from './DocumentSearch';
import { VersionControl } from './VersionControl';

interface Document {
  id: string;
  title: string;
  filename: string;
  description?: string;
  type: 'script' | 'contract' | 'callsheet' | 'storyboard' | 'concept' | 'legal' | 'schedule' | 'other';
  category: 'pre_production' | 'production' | 'post_production' | 'admin' | 'legal';
  status: 'draft' | 'review' | 'approved' | 'final' | 'archived';
  version: string;
  size: number; // bytes
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
  versions: DocumentVersion[];
  comments: DocumentComment[];
  relatedTasks?: string[];
  approvalRequired?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

interface DocumentVersion {
  id: string;
  version: string;
  filename: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  changeLog: string;
  status: 'draft' | 'review' | 'approved' | 'final';
}

interface DocumentComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'comment' | 'suggestion' | 'approval' | 'rejection';
  resolved?: boolean;
}

interface DocumentManagerProps {
  projectId: string;
  documents: Document[];
  currentUser: {
    id: string;
    name: string;
    role: string;
    permissions: string[];
  };
  onDocumentUpload?: (file: File, metadata: Partial<Document>) => void;
  onDocumentUpdate?: (documentId: string, updates: Partial<Document>) => void;
  onDocumentDelete?: (documentId: string) => void;
  onVersionUpload?: (documentId: string, file: File, changeLog: string) => void;
  onCommentAdd?: (documentId: string, comment: Omit<DocumentComment, 'id' | 'timestamp'>) => void;
  onApprovalRequest?: (documentId: string) => void;
  onApprovalAction?: (documentId: string, action: 'approve' | 'reject', comment?: string) => void;
}

type ViewMode = 'grid' | 'list' | 'viewer' | 'upload' | 'versions';

export function DocumentManager({ 
  projectId, 
  documents, 
  currentUser,
  onDocumentUpload,
  onDocumentUpdate,
  onDocumentDelete,
  onVersionUpload,
  onCommentAdd,
  onApprovalRequest,
  onApprovalAction
}: DocumentManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastModified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Výpočet document analytics
  const documentAnalytics = useMemo(() => {
    const totalDocs = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
    
    const byStatus = {
      draft: documents.filter(d => d.status === 'draft').length,
      review: documents.filter(d => d.status === 'review').length,
      approved: documents.filter(d => d.status === 'approved').length,
      final: documents.filter(d => d.status === 'final').length,
      archived: documents.filter(d => d.status === 'archived').length
    };

    const byType = {
      script: documents.filter(d => d.type === 'script').length,
      contract: documents.filter(d => d.type === 'contract').length,
      callsheet: documents.filter(d => d.type === 'callsheet').length,
      storyboard: documents.filter(d => d.type === 'storyboard').length,
      concept: documents.filter(d => d.type === 'concept').length,
      legal: documents.filter(d => d.type === 'legal').length,
      schedule: documents.filter(d => d.type === 'schedule').length,
      other: documents.filter(d => d.type === 'other').length
    };

    const pendingApprovals = documents.filter(d => 
      d.approvalRequired && d.status === 'review'
    ).length;

    const recentlyModified = documents.filter(d => {
      const modifiedDate = new Date(d.lastModified);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return modifiedDate > weekAgo;
    }).length;

    return {
      totalDocs,
      totalSize,
      byStatus,
      byType,
      pendingApprovals,
      recentlyModified
    };
  }, [documents]);

  // Filtrování a vyhledávání dokumentů
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Search query
      const matchesSearch = searchQuery === '' || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filters
      const matchesType = filterType === 'all' || doc.type === filterType;
      const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;

      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
  }, [documents, searchQuery, filterType, filterCategory, filterStatus]);

  // Řazení dokumentů
  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      let aVal: any = a[sortBy as keyof Document];
      let bVal: any = b[sortBy as keyof Document];

      if (sortBy === 'lastModified' || sortBy === 'uploadedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortBy === 'size') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? result : -result;
    });
  }, [filteredDocuments, sortBy, sortOrder]);

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocument(documentId);
    setViewMode('viewer');
  };

  const handleUploadSuccess = (file: File, metadata: Partial<Document>) => {
    if (onDocumentUpload) {
      onDocumentUpload(file, metadata);
    }
    setViewMode('grid');
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getDocumentTypeIcon = (type: string) => {
    const icons = {
      script: '📝',
      contract: '📄', 
      callsheet: '📋',
      storyboard: '🎨',
      concept: '💡',
      legal: '⚖️',
      schedule: '📅',
      other: '📎'
    };
    return icons[type as keyof typeof icons] || '📎';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: '#6B7280',
      review: '#F59E0B',
      approved: '#10B981',
      final: '#3B82F6',
      archived: '#9CA3AF'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  return (
    <DocumentManagerContainer>
      {/* Document Search & Controls */}
      <DocumentSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        analytics={documentAnalytics}
        onUploadClick={() => setViewMode('upload')}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <DocumentContent>
        {viewMode === 'grid' && (
          <DocumentList 
            documents={sortedDocuments}
            viewMode="grid"
            selectedDocument={selectedDocument}
            onDocumentSelect={handleDocumentSelect}
            onDocumentUpdate={onDocumentUpdate}
            onDocumentDelete={onDocumentDelete}
            currentUser={currentUser}
            formatFileSize={formatFileSize}
            getDocumentTypeIcon={getDocumentTypeIcon}
            getStatusColor={getStatusColor}
          />
        )}

        {viewMode === 'list' && (
          <DocumentList 
            documents={sortedDocuments}
            viewMode="list"
            selectedDocument={selectedDocument}
            onDocumentSelect={handleDocumentSelect}
            onDocumentUpdate={onDocumentUpdate}
            onDocumentDelete={onDocumentDelete}
            currentUser={currentUser}
            formatFileSize={formatFileSize}
            getDocumentTypeIcon={getDocumentTypeIcon}
            getStatusColor={getStatusColor}
          />
        )}

        {viewMode === 'viewer' && selectedDocument && (
          <DocumentViewer 
            document={documents.find(d => d.id === selectedDocument)!}
            onClose={() => {
              setSelectedDocument(null);
              setViewMode('grid');
            }}
            onCommentAdd={onCommentAdd}
            onApprovalRequest={onApprovalRequest}
            onApprovalAction={onApprovalAction}
            onVersionView={() => setViewMode('versions')}
            currentUser={currentUser}
            formatFileSize={formatFileSize}
            getStatusColor={getStatusColor}
          />
        )}

        {viewMode === 'upload' && (
          <DocumentUploader 
            projectId={projectId}
            onUploadSuccess={handleUploadSuccess}
            onCancel={() => setViewMode('grid')}
            currentUser={currentUser}
            existingDocuments={documents}
          />
        )}

        {viewMode === 'versions' && selectedDocument && (
          <VersionControl 
            document={documents.find(d => d.id === selectedDocument)!}
            onVersionUpload={onVersionUpload}
            onBackToViewer={() => setViewMode('viewer')}
            currentUser={currentUser}
            formatFileSize={formatFileSize}
          />
        )}
      </DocumentContent>
    </DocumentManagerContainer>
  );
}

// Styled Components
const DocumentManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
  height: 100%;
`;

const DocumentContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;
