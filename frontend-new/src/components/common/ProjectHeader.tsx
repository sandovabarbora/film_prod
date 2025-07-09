import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, DollarSign, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import { useProject } from '../../contexts/ProjectContext';

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const HeaderContainer = styled.div`
  margin-bottom: 2rem;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const BackButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ProjectBreadcrumb = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const BreadcrumbPath = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ProjectName = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #f9fafb;
`;

const ProjectMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const MetaChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  font-size: 0.75rem;
  color: #9ca3af;
`;

const PageHeader = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 300;
  margin: 0 0 0.5rem 0;
  letter-spacing: -1px;
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  color: #9ca3af;
  margin: 0;
`;

const ProjectHeader: React.FC<Props> = ({ title, subtitle, children }) => {
  const navigate = useNavigate();
  const { project, isLoading } = useProject();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <HeaderContainer>
        <div style={{ color: '#6b7280' }}>Loading project...</div>
      </HeaderContainer>
    );
  }

  if (!project) {
    return (
      <HeaderContainer>
        <BackButton 
          variant="outline" 
          onClick={() => navigate('/films')}
          icon={<ArrowLeft size={16} />}
        >
          Back to Projects
        </BackButton>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer>
      <TopRow>
        <ProjectBreadcrumb>
          <BreadcrumbPath>
            <BackButton 
              variant="ghost" 
              onClick={() => navigate(`/films/${project.id}`)}
              icon={<ArrowLeft size={14} />}
            >
              {project.title}
            </BackButton>
          </BreadcrumbPath>
        </ProjectBreadcrumb>
        
        {children}
      </TopRow>

      <ProjectMeta>
        <MetaChip>
          <Calendar size={14} />
          {calculateDuration(project.start_date, project.end_date)} days
        </MetaChip>
        <MetaChip>
          <DollarSign size={14} />
          {formatCurrency(project.budget)}
        </MetaChip>
        <MetaChip>
          <MapPin size={14} />
          {project.location_primary}
        </MetaChip>
      </ProjectMeta>

      <PageHeader>
        <PageTitle>{title}</PageTitle>
        {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
      </PageHeader>
    </HeaderContainer>
  );
};

export default ProjectHeader;
