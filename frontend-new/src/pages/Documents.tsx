// src/pages/Documents.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, FileText, Upload, Search, Filter, Download, Eye, Edit, Trash2, AlertCircle, Loader2, FolderOpen, File } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { DocumentManager, DocumentSearch, DocumentList, DocumentViewer } from '../components/features/DocumentManager';
import Loading from '../components/common/Loading';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// API Types matching Django models
interface Document {
  id: string;
  title: string;
  filename: string;
  description?: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type: 'script' | 'schedule' | 'budget' | 'contract' | 'technical' | 'legal' | 'creative' | 'other';
  version: string;
  status: 'draft' | 'review' | 'approved' | 'final' | 'archived';
  is_confidential: boolean;
  uploaded_by: {
    id: string;
    first_name: string;
    last_name: string;
  };
  uploaded_at: string;
  updated_at: string;
  tags: string[];
  download_count: number;
  last_downloaded?: string;
  metadata: Record<string, any>;
}

interface DocumentStats {
  total_documents: number;
  documents_by_type: Record<string, number>;
  documents_by_status: Record<string, number>;
  total_size: number;
  recent_uploads: number;
  pending_approvals: number;
}

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #8b8b8b;
  font-size: 0.875rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: #fff;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const PageTitle = styled.h1`
  color: #fff;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
`;

const StatIcon = styled.div`
  color: #667eea;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
`;

const StatNumber = styled.div`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #8b8b8b;
  font-size: 0.875rem;
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchAndFilters = styled.div`
  display: flex;
  gap: 1rem;
  flex: 1;
  max-width: 600px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-family: inherit;
  font-size: 0.875rem;

  &::placeholder {
    color: #8b8b8b;
  }

  &:focus {
    outline: none;
    border-color: rgba(103, 126, 234, 0.4);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 0.75rem 1rem;
  background: ${props => props.$active 
    ? 'rgba(103, 126, 234, 0.2)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.$active 
    ? 'rgba(103, 126, 234, 0.4)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 8px;
  color: ${props => props.$active ? '#667eea' : '#8b8b8b'};
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${props => props.$active 
      ? 'rgba(103, 126, 234, 0.3)' 
      : 'rgba(255, 255, 255, 0.1)'
    };
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

const DocumentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const DocumentCard = styled(Card)`
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(103, 126, 234, 0.4);
  }
`;

const DocumentHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const DocumentIcon = styled.div`
  color: #667eea;
  margin-right: 0.75rem;
`;

const DocumentInfo = styled.div`
  flex: 1;
`;

const DocumentTitle = styled.h3`
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 500;
`;

const DocumentMeta = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
`;

const DocumentStatus = styled.div<{ $status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
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

const DocumentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #8b8b8b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const ErrorCard = styled(Card)`
  padding: 2rem;
  text-align: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
`;

const LoadingCard = styled(Card)`
  padding: 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #8b8b8b;
`;

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const { project, isLoading: projectLoading, error: projectError } = useProject();
  
  // Documents data state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Fetch documents data
  useEffect(() => {
    if (project?.id) {
      fetchDocumentsData(project.id);
    }
  }, [project?.id]);

  const fetchDocumentsData = async (projectId: string) => {
    try {
      setDocumentsLoading(true);
      setDocumentsError(null);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Parallel API calls
      const [documentsRes, statsRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/production/productions/${projectId}/documents/`, { headers }),
        fetch(`${apiUrl}/api/v1/production/productions/${projectId}/documents/stats/`, { headers })
      ]);

      if (!documentsRes.ok) {
        throw new Error(`Documents API error: ${documentsRes.status}`);
      }
      if (!statsRes.ok) {
        throw new Error(`Stats API error: ${statsRes.status}`);
      }

      const [documentsData, statsData] = await Promise.all([
        documentsRes.json(),
        statsRes.json()
      ]);

      setDocuments(documentsData.results || []);
      setDocumentStats(statsData);

    } catch (error) {
      console.error('Error fetching documents data:', error);
      setDocumentsError(error instanceof Error ? error.message : 'Failed to load documents data');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleBackToProject = () => {
    if (project) {
      navigate(`/films/${project.id}`);
    } else {
      navigate('/films');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeIcon = (type: string) => {
    const icons = {
      'script': <FileText size={20} />,
      'schedule': <FileText size={20} />,
      'budget': <FileText size={20} />,
      'contract': <FileText size={20} />,
      'technical': <File size={20} />,
      'legal': <FileText size={20} />,
      'creative': <FileText size={20} />,
      'other': <File size={20} />
    };
    return icons[type as keyof typeof icons] || <File size={20} />;
  };

  const getDocumentTypes = () => {
    const types = new Set(documents.map(doc => doc.document_type));
    return Array.from(types);
  };

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = searchTerm === '' || 
      document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || document.document_type === filterType;
    const matchesStatus = filterStatus === 'all' || document.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDocumentView = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleDocumentDownload = (document: Document) => {
    console.log('Download document:', document.id);
    // TODO: Implement document download
  };

  const handleDocumentEdit = (document: Document) => {
    console.log('Edit document:', document.id);
    // TODO: Implement document editing
  };

  const handleDocumentDelete = (document: Document) => {
    console.log('Delete document:', document.id);
    // TODO: Implement document deletion
  };

  const handleUploadDocument = () => {
    console.log('Upload new document');
    // TODO: Implement document upload
  };

  if (projectLoading) {
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );
  }

  if (projectError || !project) {
    return (
      <PageContainer>
        <ErrorCard>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
          <h3>Chyba při načítání projektu</h3>
          <p>{projectError || 'Projekt nebyl nalezen'}</p>
          <Button onClick={() => navigate('/films')} style={{ marginTop: '1rem' }}>
            Zpět na projekty
          </Button>
        </ErrorCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <BreadcrumbNav>
            <BackButton onClick={handleBackToProject}>
              <ArrowLeft size={16} />
              Zpět na projekt
            </BackButton>
            <span>/</span>
            <span>{project.title}</span>
            <span>/</span>
            <span>Dokumenty</span>
          </BreadcrumbNav>
          
          <PageTitle>
            <FolderOpen />
            Dokumenty projektu
          </PageTitle>
        </div>

        <ActionButtons>
          <Button onClick={handleUploadDocument}>
            <Upload size={16} />
            Nahrát dokument
          </Button>
        </ActionButtons>
      </PageHeader>

      {documentStats && (
        <StatsGrid>
          <StatCard>
            <StatIcon><FileText size={20} /></StatIcon>
            <StatNumber>{documentStats.total_documents}</StatNumber>
            <StatLabel>Celkem dokumentů</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon><FolderOpen size={20} /></StatIcon>
            <StatNumber>{formatFileSize(documentStats.total_size)}</StatNumber>
            <StatLabel>Celková velikost</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon><Upload size={20} /></StatIcon>
            <StatNumber>{documentStats.recent_uploads}</StatNumber>
            <StatLabel>Nové tento týden</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon><Eye size={20} /></StatIcon>
            <StatNumber>{documentStats.pending_approvals}</StatNumber>
            <StatLabel>Čeká na schválení</StatLabel>
          </StatCard>
        </StatsGrid>
      )}

      <ContentHeader>
        <SearchAndFilters>
          <SearchInput
            type="text"
            placeholder="Hledat dokumenty..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          
          <FilterButton 
            $active={filterType === 'all'} 
            onClick={() => setFilterType('all')}
          >
            Všechny typy
          </FilterButton>
          
          {getDocumentTypes().map(type => (
            <FilterButton
              key={type}
              $active={filterType === type}
              onClick={() => setFilterType(type)}
            >
              {type}
            </FilterButton>
          ))}
        </SearchAndFilters>
      </ContentHeader>

      {documentsLoading ? (
        <LoadingCard>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
          <p>Načítání dokumentů...</p>
        </LoadingCard>
      ) : documentsError ? (
        <ErrorCard>
          <AlertCircle size={32} style={{ margin: '0 auto 1rem' }} />
          <h3>Chyba při načítání dokumentů</h3>
          <p>{documentsError}</p>
          <Button onClick={() => fetchDocumentsData(project.id)} style={{ marginTop: '1rem' }}>
            Zkusit znovu
          </Button>
        </ErrorCard>
      ) : (
        <ContentContainer>
          <DocumentGrid>
            {filteredDocuments.map(document => (
              <DocumentCard key={document.id}>
                <DocumentHeader>
                  <DocumentIcon>
                    {getDocumentTypeIcon(document.document_type)}
                  </DocumentIcon>
                  <DocumentInfo>
                    <DocumentTitle>{document.title}</DocumentTitle>
                    <DocumentMeta>
                      {document.filename} • {formatFileSize(document.file_size)}
                    </DocumentMeta>
                    <DocumentMeta>
                      {new Date(document.uploaded_at).toLocaleDateString('cs-CZ')} • v{document.version}
                    </DocumentMeta>
                  </DocumentInfo>
                  <DocumentStatus $status={document.status}>
                    {document.status}
                  </DocumentStatus>
                </DocumentHeader>

                {document.description && (
                  <div style={{ color: '#8b8b8b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {document.description}
                  </div>
                )}

                <DocumentActions>
                  <ActionButton onClick={() => handleDocumentView(document)}>
                    <Eye size={14} />
                  </ActionButton>
                  <ActionButton onClick={() => handleDocumentDownload(document)}>
                    <Download size={14} />
                  </ActionButton>
                  <ActionButton onClick={() => handleDocumentEdit(document)}>
                    <Edit size={14} />
                  </ActionButton>
                  <ActionButton onClick={() => handleDocumentDelete(document)}>
                    <Trash2 size={14} />
                  </ActionButton>
                </DocumentActions>
              </DocumentCard>
            ))}
          </DocumentGrid>

          {filteredDocuments.length === 0 && !documentsLoading && (
            <div style={{ 
              textAlign: 'center', 
              color: '#8b8b8b', 
              padding: '3rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '1px dashed rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📂</div>
              <div>Žádné dokumenty nebyly nalezeny</div>
              {searchTerm && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  Zkuste upravit vyhledávací kritéria
                </div>
              )}
            </div>
          )}
        </ContentContainer>
      )}
    </PageContainer>
  );
};

export default Documents;
