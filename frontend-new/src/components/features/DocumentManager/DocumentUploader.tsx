import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface DocumentUploaderProps {
  onUpload: (files: File[], metadata: DocumentMetadata) => void;
  onCancel: () => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // bytes
  maxFiles?: number;
  currentUser: {
    name: string;
    role: string;
    permissions: string[];
  };
}

interface DocumentMetadata {
  title: string;
  description: string;
  type: 'script' | 'schedule' | 'budget' | 'contract' | 'technical' | 'legal' | 'creative' | 'other';
  tags: string[];
  isConfidential: boolean;
  approvalRequired: boolean;
  permissions: {
    canView: string[];
    canEdit: string[];
    canApprove: string[];
  };
}

export function DocumentUploader({
  onUpload,
  onCancel,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.mp4', '.mov'],
  maxFileSize = 100 * 1024 * 1024, // 100MB
  maxFiles = 10,
  currentUser
}: DocumentUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metadata form state
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    title: '',
    description: '',
    type: 'other',
    tags: [],
    isConfidential: false,
    approvalRequired: false,
    permissions: {
      canView: [],
      canEdit: [currentUser.name],
      canApprove: []
    }
  });

  const [currentTag, setCurrentTag] = useState('');

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

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFileList = e.target.files;
    if (selectedFileList) {
      const filesArray = Array.from(selectedFileList);
      handleFiles(filesArray);
    }
  };

  const handleFiles = (files: File[]) => {
    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        alert(`Soubor ${file.name} je příliš velký. Maximum je ${formatFileSize(maxFileSize)}.`);
        return false;
      }

      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension)) {
        alert(`Soubor ${file.name} má nepodporovaný formát.`);
        return false;
      }

      return true;
    });

    if (selectedFiles.length + validFiles.length > maxFiles) {
      alert(`Můžete nahrát maximálně ${maxFiles} souborů.`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));

    // Auto-fill title if only one file
    if (validFiles.length === 1 && !metadata.title) {
      setMetadata(prev => ({
        ...prev,
        title: validFiles[0].name.replace(/\.[^/.]+$/, '')
      }));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const addTag = () => {
    if (currentTag.trim() && !metadata.tags.includes(currentTag.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      alert('Vyberte alespoň jeden soubor');
      return;
    }

    if (!metadata.title.trim()) {
      alert('Zadejte název dokumentu');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await onUpload(selectedFiles, metadata);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Nahrávání se nezdařilo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const documentTypes = [
    { value: 'script', label: 'Scénář' },
    { value: 'schedule', label: 'Harmonogram' },
    { value: 'budget', label: 'Rozpočet' },
    { value: 'contract', label: 'Smlouva' },
    { value: 'technical', label: 'Technická dokumentace' },
    { value: 'legal', label: 'Právní dokument' },
    { value: 'creative', label: 'Kreativní materiál' },
    { value: 'other', label: 'Ostatní' }
  ];

  return (
    <UploaderContainer>
      <UploaderHeader>
        <UploaderTitle>📤 Nahrát dokumenty</UploaderTitle>
        <CloseButton onClick={onCancel}>✕</CloseButton>
      </UploaderHeader>

      <UploaderContent>
        <form onSubmit={handleSubmit}>
          {/* File Upload Area */}
          <UploadArea
            $dragActive={dragActive}
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
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {selectedFiles.length === 0 ? (
              <UploadPrompt>
                <UploadIcon>📁</UploadIcon>
                <UploadText>
                  Přetáhněte soubory sem nebo klikněte pro výběr
                </UploadText>
                <UploadSubtext>
                  Podporované formáty: {acceptedTypes.join(', ')}
                  <br />
                  Maximální velikost: {formatFileSize(maxFileSize)}
                </UploadSubtext>
              </UploadPrompt>
            ) : (
              <SelectedFiles>
                {selectedFiles.map((file, index) => (
                  <FileItem key={index}>
                    <FileIcon>📄</FileIcon>
                    <FileInfo>
                      <FileName>{file.name}</FileName>
                      <FileSize>{formatFileSize(file.size)}</FileSize>
                    </FileInfo>
                    <RemoveFileButton 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      ✕
                    </RemoveFileButton>
                  </FileItem>
                ))}
                <AddMoreButton type="button">
                  ➕ Přidat další soubory
                </AddMoreButton>
              </SelectedFiles>
            )}
          </UploadArea>

          {/* Metadata Form */}
          {selectedFiles.length > 0 && (
            <MetadataForm>
              <FormSection>
                <SectionTitle>Informace o dokumentu</SectionTitle>
                
                <FormGroup>
                  <Label>Název dokumentu *</Label>
                  <Input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Zadejte název dokumentu"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Popis</Label>
                  <Textarea
                    value={metadata.description}
                    onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Volitelný popis dokumentu"
                    rows={3}
                  />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <Label>Typ dokumentu</Label>
                    <Select
                      value={metadata.type}
                      onChange={(e) => setMetadata(prev => ({ 
                        ...prev, 
                        type: e.target.value as DocumentMetadata['type']
                      }))}
                    >
                      {documentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>

                  <CheckboxGroup>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={metadata.isConfidential}
                        onChange={(e) => setMetadata(prev => ({ 
                          ...prev, 
                          isConfidential: e.target.checked 
                        }))}
                      />
                      🔒 Důvěrný dokument
                    </CheckboxLabel>

                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={metadata.approvalRequired}
                        onChange={(e) => setMetadata(prev => ({ 
                          ...prev, 
                          approvalRequired: e.target.checked 
                        }))}
                      />
                      ✅ Vyžaduje schválení
                    </CheckboxLabel>
                  </CheckboxGroup>
                </FormRow>

                <FormGroup>
                  <Label>Tagy</Label>
                  <TagInput>
                    <Input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Přidat tag"
                    />
                    <AddTagButton type="button" onClick={addTag}>
                      Přidat
                    </AddTagButton>
                  </TagInput>
                  
                  {metadata.tags.length > 0 && (
                    <TagList>
                      {metadata.tags.map(tag => (
                        <Tag key={tag}>
                          {tag}
                          <TagRemove onClick={() => removeTag(tag)}>✕</TagRemove>
                        </Tag>
                      ))}
                    </TagList>
                  )}
                </FormGroup>
              </FormSection>
            </MetadataForm>
          )}

          {/* Upload Progress */}
          {uploading && (
            <ProgressSection>
              <ProgressLabel>Nahrávání... {uploadProgress}%</ProgressLabel>
              <ProgressBar>
                <ProgressFill $progress={uploadProgress} />
              </ProgressBar>
            </ProgressSection>
          )}

          {/* Actions */}
          <FormActions>
            <Button type="button" onClick={onCancel} disabled={uploading}>
              Zrušit
            </Button>
            <Button 
              type="submit" 
              disabled={selectedFiles.length === 0 || uploading || !metadata.title.trim()}
            >
              {uploading ? `Nahrávání... ${uploadProgress}%` : `Nahrát ${selectedFiles.length} souborů`}
            </Button>
          </FormActions>
        </form>
      </UploaderContent>
    </UploaderContainer>
  );
}

// Styled Components
const UploaderContainer = styled(Card)`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
`;

const UploaderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
`;

const UploaderTitle = styled.h2`
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  background: none;
  border: none;
  color: #8b8b8b;
  font-size: 1.25rem;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
`;

const UploaderContent = styled.div`
  padding: 2rem;
`;

const UploadArea = styled.div<{ $dragActive: boolean }>`
  border: 2px dashed ${props => props.$dragActive 
    ? '#667eea' 
    : 'rgba(255, 255, 255, 0.2)'
  };
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$dragActive 
    ? 'rgba(103, 126, 234, 0.1)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  margin-bottom: 2rem;

  &:hover {
    border-color: #667eea;
    background: rgba(103, 126, 234, 0.1);
  }
`;

const UploadPrompt = styled.div``;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const UploadText = styled.div`
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.div`
  color: #8b8b8b;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const SelectedFiles = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`;

const FileIcon = styled.div`
  font-size: 1.5rem;
`;

const FileInfo = styled.div`
  flex: 1;
  text-align: left;
`;

const FileName = styled.div`
  color: #fff;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
`;

const RemoveFileButton = styled.button`
  padding: 0.25rem 0.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 4px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
  }
`;

const AddMoreButton = styled.button`
  padding: 0.75rem;
  background: rgba(103, 126, 234, 0.1);
  border: 1px dashed rgba(103, 126, 234, 0.4);
  border-radius: 8px;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(103, 126, 234, 0.2);
  }
`;

const MetadataForm = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FormSection = styled.div``;

const SectionTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #fff;
  font-size: 1.1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-family: inherit;
  font-size: 0.875rem;

  &::placeholder {
    color: #8b8b8b;
  }

  &:focus {
    outline: none;
    border-color: rgba(103, 126, 234, 0.4);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;

  &::placeholder {
    color: #8b8b8b;
  }

  &:focus {
    outline: none;
    border-color: rgba(103, 126, 234, 0.4);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: rgba(103, 126, 234, 0.4);
  }

  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #8b8b8b;
  font-size: 0.875rem;
  cursor: pointer;

  input[type="checkbox"] {
    accent-color: #667eea;
  }
`;

const TagInput = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const AddTagButton = styled.button`
  padding: 0.75rem 1rem;
  background: rgba(103, 126, 234, 0.2);
  border: 1px solid rgba(103, 126, 234, 0.4);
  border-radius: 6px;
  color: #667eea;
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: rgba(103, 126, 234, 0.3);
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: rgba(103, 126, 234, 0.2);
  border: 1px solid rgba(103, 126, 234, 0.4);
  border-radius: 4px;
  color: #667eea;
  font-size: 0.75rem;
`;

const TagRemove = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 0;
  font-size: 0.75rem;

  &:hover {
    color: #ef4444;
  }
`;

const ProgressSection = styled.div`
  margin-bottom: 2rem;
`;

const ProgressLabel = styled.div`
  color: #fff;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

export default DocumentUploader;
