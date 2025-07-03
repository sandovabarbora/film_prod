import React, { useState } from 'react';
import styled from 'styled-components';
import { FileText, Upload, Search, Download, Eye, Trash2, Folder, File, Image, Film, FileSpreadsheet } from 'lucide-react';

const DocumentsContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 2rem;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const DocumentsLayout = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
`;

const Sidebar = styled.div`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: 1.5rem;
`;

const SidebarTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const FolderList = styled.ul`
  list-style: none;
  padding: 0;
`;

const FolderItem = styled.li<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.secondary};
  background: ${props => props.$active ? props.theme.colors.primary + '20' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[700]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const FolderCount = styled.span`
  margin-left: auto;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const DocumentCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const DocumentIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  
  svg {
    width: 32px;
    height: 32px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const DocumentName = styled.h4`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DocumentMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.25rem;
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  background: ${({ theme }) => theme.colors.gray[700]};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[600]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const Documents: React.FC = () => {
  const [activeFolder, setActiveFolder] = useState('all');
  
  const folders = [
    { id: 'all', name: 'All Documents', icon: FileText, count: 42 },
    { id: 'scripts', name: 'Scripts', icon: FileText, count: 8 },
    { id: 'contracts', name: 'Contracts', icon: File, count: 12 },
    { id: 'storyboards', name: 'Storyboards', icon: Image, count: 15 },
    { id: 'budgets', name: 'Budgets', icon: FileSpreadsheet, count: 5 },
    { id: 'videos', name: 'Videos', icon: Film, count: 2 },
  ];
  
  // Mock documents
  const documents = [
    { id: 1, name: 'Final_Script_v3.pdf', type: 'scripts', size: '2.4 MB', modified: '2 hours ago', icon: FileText },
    { id: 2, name: 'Actor_Contract_John.pdf', type: 'contracts', size: '1.1 MB', modified: '1 day ago', icon: File },
    { id: 3, name: 'Scene_12_Storyboard.jpg', type: 'storyboards', size: '4.8 MB', modified: '3 days ago', icon: Image },
    { id: 4, name: 'Budget_Breakdown.xlsx', type: 'budgets', size: '892 KB', modified: '1 week ago', icon: FileSpreadsheet },
    { id: 5, name: 'Location_Agreement.pdf', type: 'contracts', size: '1.5 MB', modified: '2 weeks ago', icon: File },
    { id: 6, name: 'Dailies_Day_5.mp4', type: 'videos', size: '1.2 GB', modified: '3 days ago', icon: Film },
  ];
  
  const filteredDocuments = activeFolder === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === activeFolder);

  return (
    <DocumentsContainer>
      <PageHeader>
        <Title>Documents</Title>
        <Button>
          <Upload size={18} />
          Upload Document
        </Button>
      </PageHeader>
      
      <SearchBar>
        <Search size={20} />
        <SearchInput placeholder="Search documents..." />
      </SearchBar>
      
      <DocumentsLayout>
        <Sidebar>
          <SidebarTitle>Folders</SidebarTitle>
          <FolderList>
            {folders.map(folder => (
              <FolderItem
                key={folder.id}
                $active={activeFolder === folder.id}
                onClick={() => setActiveFolder(folder.id)}
              >
                <folder.icon />
                <span>{folder.name}</span>
                <FolderCount>{folder.count}</FolderCount>
              </FolderItem>
            ))}
          </FolderList>
        </Sidebar>
        
        <DocumentsGrid>
          {filteredDocuments.map(doc => (
            <DocumentCard key={doc.id}>
              <DocumentIcon>
                <doc.icon />
              </DocumentIcon>
              <DocumentName>{doc.name}</DocumentName>
              <DocumentMeta>{doc.size}</DocumentMeta>
              <DocumentMeta>Modified {doc.modified}</DocumentMeta>
              <DocumentActions>
                <ActionButton title="View">
                  <Eye />
                </ActionButton>
                <ActionButton title="Download">
                  <Download />
                </ActionButton>
                <ActionButton title="Delete">
                  <Trash2 />
                </ActionButton>
              </DocumentActions>
            </DocumentCard>
          ))}
        </DocumentsGrid>
      </DocumentsLayout>
    </DocumentsContainer>
  );
};

export default Documents;