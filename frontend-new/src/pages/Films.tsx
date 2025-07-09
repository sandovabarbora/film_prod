import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, DollarSign, MapPin, Play } from 'lucide-react';

import { Button } from '../components/ui/Button';
import { 
  PageContainer,
  PageHeader,
  PageSubtitle,
  ControlsRow,
  ContentCard,
  ContentCardHeader,
  ContentCardTitle,
  ContentCardFooter,
  StatusBadge
} from '../components/shared';
import projectService from '../services/projectService';
import type { Project } from '../types';
import styled from 'styled-components';

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const ProjectDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectMetrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const MetricIcon = styled.div`
  color: ${({ theme }) => theme.colors.text.accent};
  display: flex;
  align-items: center;
`;

const MetricText = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: 500;
`;

const ProjectMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const MetaLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetaValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const PlayButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradients.primary};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.glow};
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.glowHover};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const ErrorContainer = styled(motion.div)`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing[6]};
  margin-top: ${({ theme }) => theme.spacing[8]};
  color: #ef4444;
  text-align: center;
  backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
  padding: ${({ theme }) => theme.spacing[12]};
  background: ${({ theme }) => theme.colors.glass.surface};
  backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  border: 1px dashed ${({ theme }) => theme.colors.glass.border};
  
  .icon {
    font-size: 3rem;
    margin-bottom: ${({ theme }) => theme.spacing[4]};
    opacity: 0.7;
  }
  
  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
  }
`;

const Films: React.FC = () => {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const projectsData = await projectService.getProjects();
      setProjects(projectsData);
      
      console.log('✅ Projects loaded:', projectsData);
      
    } catch (error) {
      console.error('❌ Failed to load projects:', error);
      setError('Nepodařilo se načíst projekty');
    } finally {
      setIsLoading(false);
    }
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(budget);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      development: 'Vývoj',
      pre_production: 'Příprava',
      production: 'Natáčení',
      post_production: 'Postprodukce',
      completed: 'Dokončeno',
      cancelled: 'Zrušeno'
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          🎬 Načítání projektů...
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader>Filmy & Produkce</PageHeader>
        <ErrorContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
          <br />
          <Button onClick={loadProjects} style={{ marginTop: '1rem' }}>
            Zkusit znovu
          </Button>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <PageHeader>Filmy & Produkce</PageHeader>
        <PageSubtitle>Správa filmových projektů a produkcí</PageSubtitle>
        
        <ControlsRow>
          <div>
            <Button 
              variant="primary" 
              icon={<Plus size={16} />}
              onClick={() => alert('Přidat projekt - Coming soon')}
            >
              Nový projekt
            </Button>
          </div>
        </ControlsRow>

        {projects.length === 0 ? (
          <EmptyState>
            <div className="icon">🎬</div>
            <h3>Žádné projekty</h3>
            <p>Začněte vytvořením nového filmového projektu</p>
          </EmptyState>
        ) : (
          <ProjectsGrid>
            <AnimatePresence>
              {projects.map((project, index) => (
                <ContentCard
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/films/${project.id}`)}
                >
                  <ContentCardHeader>
                    <ContentCardTitle>{project.title}</ContentCardTitle>
                    <StatusBadge $status={project.status}>
                      {getStatusLabel(project.status)}
                    </StatusBadge>
                  </ContentCardHeader>
                  
                  {project.description && (
                    <ProjectDescription>
                      {project.description}
                    </ProjectDescription>
                  )}
                  
                  <ProjectMetrics>
                    <MetricItem>
                      <MetricIcon><DollarSign size={16} /></MetricIcon>
                      <MetricText>{formatBudget(project.budget)}</MetricText>
                    </MetricItem>
                    <MetricItem>
                      <MetricIcon><Calendar size={16} /></MetricIcon>
                      <MetricText>{formatDate(project.start_date)}</MetricText>
                    </MetricItem>
                  </ProjectMetrics>
                  
                  <ContentCardFooter>
                    <ProjectMeta>
                      <MetaLabel>Lokace</MetaLabel>
                      <MetaValue>
                        <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        {project.location_primary}
                      </MetaValue>
                    </ProjectMeta>
                    
                    <PlayButton
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/films/${project.id}`);
                      }}
                    >
                      <Play size={20} fill="currentColor" />
                    </PlayButton>
                  </ContentCardFooter>
                </ContentCard>
              ))}
            </AnimatePresence>
          </ProjectsGrid>
        )}
      </motion.div>
    </PageContainer>
  );
};

export default Films;
