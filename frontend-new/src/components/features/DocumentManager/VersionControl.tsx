import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';
import { PrimaryButton, SecondaryButton, OutlineButton, DangerButton } from '../../ui/Button';

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
      major: parseInt(parts[0] || '1'),
      minor: parseInt(parts[1] || '0')
    };
  };

  const generateNextVersion = (currentVersion: string, isMinor: boolean = true) => {
    const { major, minor } = getVersionNumber(currentVersion);
    if (isMinor) {
      return `${major}.${minor + 1}`;
    } else {
      return `${major + 1}.0`;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewVersionFile(e.target.files[0]);
    }
  };

  const handleVersionUpload = async () => {
    if (!newVersionFile || !changeLog.trim() || !onVersionUpload) return;

    setUploading(true);
    try {
      await onVersionUpload(document.id, newVersionFile, changeLog.trim());
      setNewVersionFile(null);
      setChangeLog('');
      setShowUploadForm(false);
    } catch (error) {
      console.error('Version upload failed:', error);
      alert('Nahrávání nové verze se nezdařilo');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: '#6B7280',
      review: '#F59E0B',
      approved: '#10B981',
      final: '#3B82F6'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const getVersionBadgeColor = (version: DocumentVersion, isLatest: boolean) => {
    if (isLatest) return '#10B981';
    if (version.status === 'final') return '#3B82F6';
    return '#6B7280';
  };

  return (
    <VersionControlContainer>
      {/* Header */}
      <VersionHeader>
        <HeaderLeft>
          <BackButton onClick={onBackToViewer}>
            ← Zpět na dokument
          </BackButton>
          <DocumentTitleSection>
            <DocumentTitle>Verze: {document.title}</DocumentTitle>
            <CurrentVersion>
              Aktuální verze: {document.version} • {sortedVersions.length} verzí celkem
            </CurrentVersion>
          </DocumentTitleSection>
        </HeaderLeft>

        <HeaderActions>
          {canUploadVersion && (
            <PrimaryButton 
              onClick={() => setShowUploadForm(true)}
              disabled={showUploadForm}
            >
              📤 Nahrát novou verzi
            </PrimaryButton>
          )}
        </HeaderActions>
      </VersionHeader>

      <VersionContent>
        {/* Upload Form */}
        {showUploadForm && (
          <UploadVersionForm>
            <GlassCard>
              <CardHeader>
                <UploadFormHeader>
                  <h4>Nahrát novou verzi</h4>
                  <CloseButton onClick={() => setShowUploadForm(false)}>✕</CloseButton>
                </UploadFormHeader>
              </CardHeader>
              <CardContent>
                <UploadForm>
                  <FormGroup>
                    <FormLabel>Nová verze souboru</FormLabel>
                    <FileInput>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
                      />
                      {newVersionFile && (
                        <SelectedFileInfo>
                          📄 {newVersionFile.name} ({formatFileSize(newVersionFile.size)})
                        </SelectedFileInfo>
                      )}
                    </FileInput>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Popis změn *</FormLabel>
                    <ChangeLogTextarea
                      value={changeLog}
                      onChange={(e) => setChangeLog(e.target.value)}
                      placeholder="Popište co se v této verzi změnilo..."
                      rows={4}
                      required
                    />
                  </FormGroup>

                  <VersionPreview>
                    <PreviewLabel>Nová verze bude:</PreviewLabel>
                    <NewVersionBadge>
                      v{generateNextVersion(document.version)}
                    </NewVersionBadge>
                  </VersionPreview>

                  <FormActions>
                    <OutlineButton onClick={() => setShowUploadForm(false)}>
                      Zrušit
                    </OutlineButton>
                    <PrimaryButton 
                      onClick={handleVersionUpload}
                      disabled={!newVersionFile || !changeLog.trim() || uploading}
                    >
                      {uploading ? '📤 Nahrávám...' : '📤 Nahrát verzi'}
                    </PrimaryButton>
                  </FormActions>
                </UploadForm>
              </CardContent>
            </GlassCard>
          </UploadVersionForm>
        )}

        {/* Versions List */}
        <VersionsList>
          <GlassCard>
            <CardHeader>
              <h4>Historie verzí</h4>
            </CardHeader>
            <CardContent>
              <VersionsTimeline>
                {sortedVersions.map((version, index) => {
                  const isLatest = index === 0;
                  const isCurrent = version.version === document.version;
                  
                  return (
                    <VersionItem key={version.id} $isLatest={isLatest} $isCurrent={isCurrent}>
                      <VersionItemLeft>
                        <VersionBadge $color={getVersionBadgeColor(version, isLatest)}>
                          v{version.version}
                          {isLatest && <LatestLabel>NEJNOVĚJŠÍ</LatestLabel>}
                          {isCurrent && <CurrentLabel>AKTUÁLNÍ</CurrentLabel>}
                        </VersionBadge>
                        
                        <VersionTimeline>
                          <TimelineDot $color={getVersionBadgeColor(version, isLatest)} />
                          {index < sortedVersions.length - 1 && <TimelineLine />}
                        </VersionTimeline>
                      </VersionItemLeft>

                      <VersionItemContent>
                        <VersionHeader>
                          <VersionTitle>{version.filename}</VersionTitle>
                          <VersionMeta>
                            <StatusBadge $color={getStatusColor(version.status)}>
                              {version.status}
                            </StatusBadge>
                            <SizeInfo>{formatFileSize(version.size)}</SizeInfo>
                          </VersionMeta>
                        </VersionHeader>

                        <VersionInfo>
                          <InfoRow>
                            <InfoIcon>👤</InfoIcon>
                            <InfoText>{version.uploadedBy}</InfoText>
                          </InfoRow>
                          <InfoRow>
                            <InfoIcon>📅</InfoIcon>
                            <InfoText>{formatDate(version.uploadedAt)}</InfoText>
                          </InfoRow>
                        </VersionInfo>

                        {version.changeLog && (
                          <ChangeLogSection>
                            <ChangeLogLabel>Změny v této verzi:</ChangeLogLabel>
                            <ChangeLogText>{version.changeLog}</ChangeLogText>
                          </ChangeLogSection>
                        )}

                        <VersionActions>
                          <SecondaryButton size="sm">
                            👁️ Zobrazit
                          </SecondaryButton>
                          
                          <SecondaryButton size="sm">
                            💾 Stáhnout
                          </SecondaryButton>
                          
                          {!isCurrent && canUploadVersion && (
                            <OutlineButton size="sm">
                              🔄 Obnovit na tuto verzi
                            </OutlineButton>
                          )}
                          
                          {index > 0 && (
                            <OutlineButton size="sm">
                              ⚖️ Porovnat s předchozí
                            </OutlineButton>
                          )}
                        </VersionActions>
                      </VersionItemContent>
                    </VersionItem>
                  );
                })}
              </VersionsTimeline>

              {sortedVersions.length === 0 && (
                <EmptyVersions>
                  <EmptyIcon>📚</EmptyIcon>
                  <EmptyTitle>Žádné verze</EmptyTitle>
                  <EmptyDescription>
                    Zatím nebyly nahrány žádné verze tohoto dokumentu.
                  </EmptyDescription>
                </EmptyVersions>
              )}
            </CardContent>
          </GlassCard>
        </VersionsList>
      </VersionContent>
    </VersionControlContainer>
  );
}

// Styled Components
const VersionControlContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
  height: 100%;
`;

const VersionHeader = styled.div`
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

const CurrentVersion = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const VersionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.lg};
`;

const UploadVersionForm = styled.div``;

const UploadFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  
  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }
`;

const UploadForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const FormLabel = styled.label`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const FileInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  
  input[type="file"] {
    padding: ${props => props.theme.spacing.md};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }
`;

const SelectedFileInfo = styled.div`
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.success}10;
  border: 1px solid ${props => props.theme.colors.success}30;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.success};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ChangeLogTextarea = styled.textarea`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const VersionPreview = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const PreviewLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const NewVersionBadge = styled.span`
  padding: 4px 12px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const FormActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  border-top: 1px solid ${props => props.theme.colors.border};
  padding-top: ${props => props.theme.spacing.lg};
`;

const VersionsList = styled.div``;

const VersionsTimeline = styled.div`
  display: flex;
  flex-direction: column;
`;

const VersionItem = styled.div<{ $isLatest: boolean; $isCurrent: boolean }>`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => {
    if (props.$isLatest) return `${props.theme.colors.success}05`;
    if (props.$isCurrent) return `${props.theme.colors.primary}05`;
    return 'transparent';
  }};
  border: 1px solid ${props => {
    if (props.$isLatest) return `${props.theme.colors.success}20`;
    if (props.$isCurrent) return `${props.theme.colors.primary}20`;
    return 'transparent';
  }};
  margin-bottom: ${props => props.theme.spacing.md};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.background};
    border-color: ${props => props.theme.colors.border};
  }
`;

const VersionItemLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const VersionBadge = styled.div<{ $color: string }>`
  position: relative;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.$color};
  color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
  min-width: 80px;
  box-shadow: ${props => props.theme.shadows.md};
`;

const LatestLabel = styled.div`
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.success};
  color: white;
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  white-space: nowrap;
`;

const CurrentLabel = styled.div`
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  white-space: nowrap;
`;

const VersionTimeline = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-top: ${props => props.theme.spacing.md};
`;

const TimelineDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  background: ${props => props.$color};
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const TimelineLine = styled.div`
  width: 2px;
  height: 60px;
  background: ${props => props.theme.colors.border};
  margin-top: ${props => props.theme.spacing.sm};
`;

const VersionItemContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const VersionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
`;

const VersionTitle = styled.h4`
  margin: 0;
  color: ${props => props.theme.colors.text};
  font-family: monospace;
`;

const VersionMeta = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
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

const SizeInfo = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const VersionInfo = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const InfoIcon = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const InfoText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ChangeLogSection = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  border-left: 3px solid ${props => props.theme.colors.primary};
`;

const ChangeLogLabel = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ChangeLogText = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.4;
`;

const VersionActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const EmptyVersions = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const EmptyTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.text};
`;

const EmptyDescription = styled.p`
  margin: 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;
