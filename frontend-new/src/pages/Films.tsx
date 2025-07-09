import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Film, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ProjectEditModal from '../components/features/ProjectEditModal/ProjectEditModal';

interface FilmProject {
  id: number;
  title: string;
  description: string;
  status: 'development' | 'pre_production' | 'production' | 'post_production' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  budget_total: number;
  location_primary: string;
  created_at: string;
}

// ... (all styled components remain the same)

const FilmsContainer = styled.div`
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
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchSection = styled.div`
  position: relative;
  margin-bottom: 2rem;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.secondary};
    z-index: 1;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const ProjectCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ProjectTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'development': return theme.colors.info + '20';
      case 'pre_production': return theme.colors.warning + '20';
      case 'production': return theme.colors.primary + '20';
      case 'post_production': return theme.colors.accent.main + '20';
      case 'completed': return theme.colors.success + '20';
      case 'cancelled': return theme.colors.gray[500] + '20';
      default: return theme.colors.gray[500] + '20';
    }
  }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'development': return theme.colors.info;
      case 'pre_production': return theme.colors.warning;
      case 'production': return theme.colors.primary;
      case 'post_production': return theme.colors.accent.main;
      case 'completed': return theme.colors.success;
      case 'cancelled': return theme.colors.gray[500];
      default: return theme.colors.gray[500];
    }
  }};
`;

const ProjectDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MetaLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetaValue = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const ProjectActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-2px);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.125rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 1rem;
  }
`;

const Films: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<FilmProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<FilmProject | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/production/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.results || data);
      } else {
        console.error('Failed to fetch projects');
        // Mock data for development
        setProjects([
          {
            id: 1,
            title: "Sunset Boulevard",
            description: "A gripping drama about the golden age of Hollywood, following an aging star's desperate attempt to reclaim her fame.",
            status: "production",
            start_date: "2025-06-01",
            end_date: "2025-09-15",
            budget_total: 15000000,
            location_primary: "Los Angeles, CA",
            created_at: "2025-05-15T10:00:00Z"
          },
          {
            id: 2,
            title: "Digital Dreams",
            description: "A sci-fi thriller exploring the boundaries between virtual reality and human consciousness in the near future.",
            status: "pre_production",
            start_date: "2025-08-01",
            end_date: "2025-12-20",
            budget_total: 8500000,
            location_primary: "Prague, Czech Republic",
            created_at: "2025-05-10T14:30:00Z"
          },
          {
            id: 3,
            title: "The Art of Memory",
            description: "An intimate documentary following three artists as they create works inspired by childhood memories.",
            status: "post_production",
            start_date: "2025-03-01",
            end_date: "2025-07-30",
            budget_total: 2800000,
            location_primary: "Various",
            created_at: "2025-02-20T09:15:00Z"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async (formData: any) => {
    try {
      const url = editingProject 
        ? `${import.meta.env.VITE_API_URL}/production/${editingProject.id}/`
        : `${import.meta.env.VITE_API_URL}/production/`;
      
      const method = editingProject ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          ...formData,
          budget_total: Number(formData.budget_total)
        }),
      });

      if (response.ok) {
        await fetchProjects(); // Refresh the list
        setIsModalOpen(false);
        setEditingProject(null);
      } else {
        console.error('Failed to save project');
        throw new Error('Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  };

  const handleEditProject = (project: FilmProject) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleViewProject = (projectId: number) => {
    navigate(`/films/${projectId}`);
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      development: 'Vývoj',
      pre_production: 'Příprava',
      production: 'Natáčení',
      post_production: 'Postprodukce',
      completed: 'Dokončeno',
      cancelled: 'Zrušeno'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (isLoading) {
    return (
      <FilmsContainer>
        <LoadingState>
          <Film size={24} style={{ marginRight: '0.5rem' }} />
          Načítání projektů...
        </LoadingState>
      </FilmsContainer>
    );
  }

  return (
    <FilmsContainer>
      <PageHeader>
        <Title>
          <Film size={40} />
          Filmové projekty
        </Title>
        <AddButton onClick={handleAddProject}>
          <Plus size={16} />
          Nový projekt
        </AddButton>
      </PageHeader>

      <SearchSection>
        <Search size={20} />
        <SearchInput
          type="text"
          placeholder="Vyhledat projekty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchSection>

      {filteredProjects.length === 0 ? (
        <EmptyState>
          <Film size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>Žádné projekty nenalezeny</h3>
          <p>Začněte vytvořením vašeho prvního filmového projektu.</p>
        </EmptyState>
      ) : (
        <ProjectGrid>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id}>
              <ProjectHeader>
                <div>
                  <ProjectTitle>{project.title}</ProjectTitle>
                  <StatusBadge $status={project.status}>
                    {getStatusLabel(project.status)}
                  </StatusBadge>
                </div>
              </ProjectHeader>

              <ProjectDescription>
                {project.description}
              </ProjectDescription>

              <ProjectMeta>
                <MetaItem>
                  <MetaLabel>Rozpočet</MetaLabel>
                  <MetaValue>{formatCurrency(project.budget_total)}</MetaValue>
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Lokace</MetaLabel>
                  <MetaValue>{project.location_primary}</MetaValue>
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Začátek</MetaLabel>
                  <MetaValue>{formatDate(project.start_date)}</MetaValue>
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Konec</MetaLabel>
                  <MetaValue>{formatDate(project.end_date)}</MetaValue>
                </MetaItem>
              </ProjectMeta>

              <ProjectActions>
                <ActionButton onClick={(e) => {
                  e.stopPropagation();
                  handleViewProject(project.id);
                }}>
                  <Eye size={16} />
                  Detail
                </ActionButton>
                <ActionButton onClick={(e) => {
                  e.stopPropagation();
                  handleEditProject(project);
                }}>
                  <Edit size={16} />
                  Upravit
                </ActionButton>
              </ProjectActions>
            </ProjectCard>
          ))}
        </ProjectGrid>
      )}

      <ProjectEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject}
        isEditing={!!editingProject}
      />
    </FilmsContainer>
  );
};

export default Films;
