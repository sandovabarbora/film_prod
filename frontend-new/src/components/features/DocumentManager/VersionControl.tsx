import React, { useState } from 'react';
import styled from 'styled-components';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

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

interface Document {
  id: string;
  title: string;
  filename: string;
  version: string;
  versions: DocumentVersion[];
  status: string;
}

interface VersionControlProps {
  document: Document;
  onVersionUpload?: (documentId: string, file: File, changeLog: string) => void;
  onBackToViewer: () => void;
  currentUser: {
    name: string;
    role: string;
    permissions: string[];
  };
  formatFileSize: (bytes: number) => string;
}

export function VersionControl({ 
  document, 
  onVersionUpload,
  onBackToViewer,
  currentUser,
  formatFileSize
}: VersionControlProps) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [changeLog, setChangeLog] = useState('');
  const [uploading, setUploading] = useState(false);

  // Řazení verzí od nejnovější
  const sortedVersions = [...document.versions].sort((a, b) => {
    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
  });

  const canUploadVersion = currentUser.permissions.includes('admin') || 
                          document.versions.some(v => v.uploadedBy === currentUser.name);

  const getVersionNumber = (version: string) => {
    const parts = version.split('.');
    return {
      major: parseInt(parts[0]) || 1,
      minor: parseInt(parts[1]) || 0,
      patch: parseInt(parts[2]) || 0
    };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewVersionFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionFile || !onVersionUpload) return;

    setUploading(true);
    try {
      await onVersionUpload(document.id, newVersionFile, changeLog);
      setShowUploadForm(false);
      setNewVersionFile(null);
      setChangeLog('');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
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

  return (
    <VersionControlContainer>
      <VersionHeaderSection>
        <HeaderLeft>
          <BackButton onClick={onBackToViewer}>
            ← Zpět na dokument
          </BackButton>
          <DocumentTitleSection>
            <DocumentTitle>{document.title}</DocumentTitle>
            <CurrentVersion>Aktuální verze: {document.version}</CurrentVersion>
          </DocumentTitleSection>
        </HeaderLeft>
        
        <HeaderActions>
          {canUploadVersion && (
            <Button onClick={() => setShowUploadForm(!showUploadForm)}>
              📤 Nahrát novou verzi
            </Button>
          )}
        </HeaderActions>
      </VersionHeaderSection>

      <VersionContent>
        {showUploadForm && (
          <UploadVersionForm>
            <UploadFormHeader>
              <h3>Nahrát novou verzi</h3>
            </UploadFormHeader>
            
            <form onSubmit={handleUploadSubmit}>
              <FormGroup>
                <label>Soubor:</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  required
                  accept=".pdf,.doc,.docx,.txt"
                />
              </FormGroup>
              
              <FormGroup>
                <label>Popis změn:</label>
                <textarea
                  value={changeLog}
                  onChange={(e) => setChangeLog(e.target.value)}
                  placeholder="Popište co se v této verzi změnilo..."
                  required
                  rows={3}
                />
              </FormGroup>
              
              <FormActions>
                <Button type="button" onClick={() => setShowUploadForm(false)}>
                  Zrušit
                </Button>
                <Button type="submit" disabled={!newVersionFile || uploading}>
                  {uploading ? 'Nahrávám...' : 'Nahrát verzi'}
                </Button>
              </FormActions>
            </form>
          </UploadVersionForm>
        )}

        <VersionsList>
          <Card>
            <CardHeader>
              <h3>Historie verzí</h3>
              <p>{sortedVersions.length} verzí</p>
            </CardHeader>
            
            <CardContent>
              {sortedVersions.length > 0 ? (
                sortedVersions.map((version) => (
                  <VersionItem key={version.id}>
                    <VersionInfo>
                      <VersionNumber>v{version.version}</VersionNumber>
                      <VersionDetails>
                        <div>
                          <strong>{version.filename}</strong>
                          <span> • {formatFileSize(version.size)}</span>
                        </div>
                        <VersionMeta>
                          {formatDate(version.uploadedAt)} • {version.uploadedBy}
                        </VersionMeta>
                        {version.changeLog && (
                          <ChangeLog>{version.changeLog}</ChangeLog>
                        )}
                      </VersionDetails>
                    </VersionInfo>
                    
                    <VersionStatus $status={version.status}>
                      {version.status}
                    </VersionStatus>
                    
                    <VersionActions>
                      <Button size="sm">📥 Stáhnout</Button>
                      <Button size="sm">👁️ Zobrazit</Button>
                    </VersionActions>
                  </VersionItem>
                ))
              ) : (
                <EmptyVersions>
                  <EmptyIcon>📄</EmptyIcon>
                  <EmptyTitle>Žádné verze</EmptyTitle>
                  <EmptyDescription>
                    Tento dokument zatím nemá žádné verze.
                  </EmptyDescription>
                </EmptyVersions>
              )}
            </CardContent>
          </Card>
        </VersionsList>
      </VersionContent>
    </VersionControlContainer>
  );
}

// Styled Components
const VersionControlContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: 100%;
`;

const VersionHeaderSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;
`;

const BackButton = styled.button`
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DocumentTitleSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const DocumentTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CurrentVersion = styled.div`
  font-size: 0.875rem;
  color: #8b8b8b;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const VersionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem;
`;

const UploadVersionForm = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
`;

const UploadFormHeader = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    margin: 0;
    color: #fff;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #fff;
    font-size: 0.875rem;
  }
  
  input, textarea {
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #fff;
    font-family: inherit;
    
    &:focus {
      outline: none;
      border-color: rgba(103, 126, 234, 0.4);
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const VersionsList = styled.div`
  flex: 1;
`;

const CardHeader = styled.div`
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h3 {
    margin: 0 0 0.25rem 0;
    color: #fff;
  }
  
  p {
    margin: 0;
    color: #8b8b8b;
    font-size: 0.875rem;
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const VersionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const VersionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
`;

const VersionNumber = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: rgba(103, 126, 234, 0.2);
  color: #667eea;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
`;

const VersionDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const VersionMeta = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const ChangeLog = styled.div`
  color: #8b8b8b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  font-style: italic;
`;

const VersionStatus = styled.div<{ $status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
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

const VersionActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EmptyVersions = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #8b8b8b;
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #8b8b8b;
`;

const EmptyDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
`;

export default VersionControl;
