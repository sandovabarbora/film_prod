import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../ui/Button';

interface Document {
  id: string;
  title: string;
  filename: string;
  type: string;
}

interface DocumentUploaderProps {
  projectId: string;
  onUploadSuccess: (file: File, metadata: any) => void;
  onCancel: () => void;
  currentUser: {
    name: string;
    role: string;
    permissions: string[];
  };
  existingDocuments: Document[];
}

export function DocumentUploader({ 
  projectId,
  onUploadSuccess, 
  onCancel,
  currentUser,
  existingDocuments
}: DocumentUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form data pro metadata
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    type: 'other',
    category: 'admin',
    tags: '',
    approvalRequired: false
  });

  const documentTypes = [
    { value: 'script', label: 'Scénář', icon: '📝' },
    { value: 'contract', label: 'Smlouva', icon: '📄' },
    { value: 'callsheet', label: 'Call Sheet', icon: '📋' },
    { value: 'storyboard', label: 'Storyboard', icon: '🎨' },
    { value: 'concept', label: 'Koncept', icon: '💡' },
    { value: 'legal', label: 'Právní dokument', icon: '⚖️' },
    { value: 'schedule', label: 'Harmonogram', icon: '📅' },
    { value: 'other', label: 'Ostatní', icon: '📎' }
  ];

  const categories = [
    { value: 'pre_production', label: 'Příprava' },
    { value: 'production', label: 'Natáčení' },
    { value: 'post_production', label: 'Postprodukce' },
    { value: 'admin', label: 'Administrativa' },
    { value: 'legal', label: 'Právní' }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
      
      // Auto-fill title based on filename
      if (files.length === 1 && !metadata.title) {
        const filename = files[0].name;
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
        setMetadata(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      
      // Auto-fill title based on filename
      if (files.length === 1 && !metadata.title) {
        const filename = files[0].name;
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
        setMetadata(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateForm = () => {
    if (selectedFiles.length === 0) return 'Vyberte soubor k nahrání';
    if (!metadata.title.trim()) return 'Zadejte název dokumentu';
    
    // Check for duplicate filenames
    const isDuplicate = existingDocuments.some(doc => 
      doc.filename === selectedFiles[0].name
    );
    if (isDuplicate) return 'Soubor s tímto názvem již existuje';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setUploading(true);
    
    try {
      // Process tags
      const tags = metadata.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const docMetadata = {
        ...metadata,
        tags,
        uploadedBy: currentUser.name,
        uploadedAt: new Date().toISOString(),
        status: 'draft',
        version: '1.0'
      };

      await onUploadSuccess(selectedFiles[0], docMetadata);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Nahrávání se nezdařilo. Zkuste to znovu.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  return (
    <UploaderContainer>
      <GlassCard>
        <CardHeader>
          <HeaderSection>
            <h3>Nahrát nový dokument</h3>
            <CancelButton onClick={onCancel}>✕</CancelButton>
          </HeaderSection>
        </CardHeader>
        
        <CardContent>
          <UploaderForm onSubmit={handleSubmit}>
            {/* File Drop Zone */}
            <DropZone
              $isDragActive={dragActive}
              $hasFiles={selectedFiles.length > 0}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
              />
              
              {selectedFiles.length === 0 ? (
                <DropZoneContent>
                  <DropZoneIcon>📤</DropZoneIcon>
                  <DropZoneText>
                    <strong>Klikněte pro výběr</strong> nebo přetáhněte soubory
                  </DropZoneText>
                  <DropZoneSubtext>
                    Podporované formáty: PDF, DOC, TXT, obrázky, videa
                  </DropZoneSubtext>
                </DropZoneContent>
              ) : (
                <SelectedFiles>
                  {selectedFiles.map((file, index) => (
                    <SelectedFile key={index}>
                      <FileInfo>
                        <FileIcon>📄</FileIcon>
                        <FileDetails>
                          <FileName>{file.name}</FileName>
                          <FileSize>{formatFileSize(file.size)}</FileSize>
                        </FileDetails>
                      </FileInfo>
                      <RemoveButton onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}>
                        ✕
                      </RemoveButton>
                    </SelectedFile>
                  ))}
                </SelectedFiles>
              )}
            </DropZone>

            {/* Metadata Form */}
            {selectedFiles.length > 0 && (
              <MetadataSection>
                <FormGrid>
                  <FormGroup>
                    <FormLabel>Název dokumentu *</FormLabel>
                    <FormInput
                      type="text"
                      value={metadata.title}
                      onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Zadejte název dokumentu"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Typ dokumentu</FormLabel>
                    <FormSelect
                      value={metadata.type}
                      onChange={(e) => setMetadata(prev => ({ ...prev, type: e.target.value }))}
                    >
                      {documentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Kategorie</FormLabel>
                    <FormSelect
                      value={metadata.category}
                      onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>

                  <FormGroup $span={2}>
                    <FormLabel>Popis</FormLabel>
                    <FormTextarea
                      value={metadata.description}
                      onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Volitelný popis dokumentu"
                      rows={3}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Tagy</FormLabel>
                    <FormInput
                      type="text"
                      value={metadata.tags}
                      onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="tag1, tag2, tag3"
                    />
                    <FormHint>Oddělte tagy čárkami</FormHint>
                  </FormGroup>

                  <FormGroup>
                    <CheckboxGroup>
                      <FormCheckbox
                        type="checkbox"
                        id="approval"
                        checked={metadata.approvalRequired}
                        onChange={(e) => setMetadata(prev => ({ ...prev, approvalRequired: e.target.checked }))}
                      />
                      <FormLabel htmlFor="approval">Vyžaduje schválení</FormLabel>
                    </CheckboxGroup>
                  </FormGroup>
                </FormGrid>
              </MetadataSection>
            )}

            {/* Form Actions */}
            <FormActions>
              <OutlineButton type="button" onClick={onCancel}>
                Zrušit
              </OutlineButton>
              
              <PrimaryButton 
                type="submit" 
                disabled={selectedFiles.length === 0 || uploading}
              >
                {uploading ? '📤 Nahrávám...' : '📤 Nahrát dokument'}
              </PrimaryButton>
            </FormActions>
          </UploaderForm>
        </CardContent>
      </GlassCard>
    </UploaderContainer>
  );
}

// Styled Components
const UploaderContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const CancelButton = styled.button`
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

const UploaderForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const DropZone = styled.div<{ $isDragActive: boolean; $hasFiles: boolean }>`
  border: 2px dashed ${props => {
    if (props.$isDragActive) return props.theme.colors.primary;
    if (props.$hasFiles) return props.theme.colors.success;
    return props.theme.colors.border;
  }};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing['2xl']};
  text-align: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  background: ${props => {
    if (props.$isDragActive) return `${props.theme.colors.primary}10`;
    if (props.$hasFiles) return `${props.theme.colors.success}10`;
    return props.theme.colors.background;
  }};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}10;
  }
`;

const DropZoneContent = styled.div``;

const DropZoneIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DropZoneText = styled.p`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const DropZoneSubtext = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const SelectedFiles = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const SelectedFile = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const FileIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
`;

const FileDetails = styled.div``;

const FileName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const FileSize = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  
  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }
`;

const MetadataSection = styled.div`
  border-top: 1px solid ${props => props.theme.colors.border};
  padding-top: ${props => props.theme.spacing.xl};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div<{ $span?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  grid-column: ${props => props.$span ? `span ${props.$span}` : 'span 1'};
`;

const FormLabel = styled.label`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const FormInput = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const FormSelect = styled.select`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const FormTextarea = styled.textarea`
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

const FormHint = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FormCheckbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${props => props.theme.colors.primary};
`;

const FormActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  border-top: 1px solid ${props => props.theme.colors.border};
  padding-top: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
