import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Calendar, DollarSign, MapPin, FileText, Clock } from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import projectService from '../services/projectService';
import type { Project } from '../types';

const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing[8]};
  max-width: 1200px;
  margin: 0 auto;
`;

const BackButton = styled(Button)`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const ProjectHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const ProjectTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ProjectMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border-radius: 9999px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ $status }) => {
    switch ($status) {
      case 'development':
        return `
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        `;
      case 'pre_production':
        return `
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        `;
      case 'production':
        return `
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        `;
      case 'post_production':
        return `
          background: rgba(139, 92, 246, 0.2);
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.3);
        `;
      case 'completed':
        return `
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
        `;
      default:
        return `
          background: rgba(107, 114, 128, 0.2);
          color: #9ca3af;
          border: 1px solid rgba(107, 114, 128, 0.3);
        `;
    }
  }}
`;

const ProjectDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const QuickActions = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const ActionCard = styled(Card)`
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.cinema};
  
  &:hover {
    transform: translateY(-4px);
    background: ${({ theme }) => theme.colors.glass.surfaceHover};
    border-color: ${({ theme }) => theme.colors.glass.borderHover};
    box-shadow: ${({ theme }) => theme.shadows.cinema};
  }
`;

const ActionIcon = styled.div`
  font-size: 2rem;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.colors.text.accent};
`;

const ActionTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: 600;
  margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;
`;

const ActionDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0;
  line-height: 1.5;
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

const ProjectDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError('Není poskytnut ID projektu');
      setLoading(false);
      return;
    }

    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🎬 Loading project ${projectId}...`);
      
      const projectData = await projectService.getProject(projectId);
      setProject(projectData);
      
      console.log('✅ Project loaded:', projectData);
      
    } catch (error) {
      console.error('❌ Failed to load project:', error);
      setError('Nepodařilo se načíst projekt');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          🎬 Načítání projektu...
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error || !project) {
    return (
      <PageContainer>
        <BackButton 
          variant="ghost" 
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/films')}
        >
          Zpět na filmy
        </BackButton>
        
        <ErrorContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error || 'Projekt nenalezen'}
          <br />
          <small>ID projektu: {projectId}</small>
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
        <BackButton 
          variant="ghost" 
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/films')}
        >
          Zpět na filmy
        </BackButton>
        
        <ProjectHeader>
          <ProjectTitle>{project.title}</ProjectTitle>
          
          <ProjectMeta>
            <MetaItem>
              <StatusBadge $status={project.status}>
                {getStatusLabel(project.status)}
              </StatusBadge>
            </MetaItem>
            <MetaItem>
              <MapPin size={16} />
              {project.location_primary}
            </MetaItem>
            <MetaItem>
              <DollarSign size={16} />
              {formatBudget(project.budget)}
            </MetaItem>
            <MetaItem>
              <Calendar size={16} />
              {formatDate(project.start_date)} - {formatDate(project.end_date)}
            </MetaItem>
          </ProjectMeta>
          
          {project.description && (
            <ProjectDescription>
              {project.description}
            </ProjectDescription>
          )}
        </ProjectHeader>

        <QuickActions>
          <SectionTitle>Rychlé akce</SectionTitle>
          <ActionsGrid>
            <ActionCard 
              variant="glass"
              onClick={() => navigate(`/films/${project.id}/crew`)}
              hover
            >
              <ActionIcon>👥</ActionIcon>
              <ActionTitle>Štáb</ActionTitle>
              <ActionDescription>
                Správa filmového štábu a přiřazení k projektu
              </ActionDescription>
            </ActionCard>
            
            <ActionCard 
              variant="glass"
              onClick={() => alert('Harmonogram - Coming soon')}
              hover
            >
              <ActionIcon>📅</ActionIcon>
              <ActionTitle>Harmonogram</ActionTitle>
              <ActionDescription>
                Plánování natáčení a koordinace štábu
              </ActionDescription>
            </ActionCard>
            
            <ActionCard 
              variant="glass"
              onClick={() => alert('Dokumenty - Coming soon')}
              hover
            >
              <ActionIcon>📄</ActionIcon>
              <ActionTitle>Dokumenty</ActionTitle>
              <ActionDescription>
                Skripty, shoot listy a produkční materiály
              </ActionDescription>
            </ActionCard>
            
            <ActionCard 
              variant="glass"
              onClick={() => alert('Rozpočet - Coming soon')}
              hover
            >
              <ActionIcon>💰</ActionIcon>
              <ActionTitle>Rozpočet</ActionTitle>
              <ActionDescription>
                Finanční plánování a tracking výdajů
              </ActionDescription>
            </ActionCard>
          </ActionsGrid>
        </QuickActions>
      </motion.div>
    </PageContainer>
  );
};

export default ProjectDetail;
