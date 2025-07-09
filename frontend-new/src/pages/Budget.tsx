// src/pages/Budget.tsx - s optional project support
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, AlertTriangle, AlertCircle, Loader2, BarChart3, FileText, Download } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import Loading from '../components/common/Loading';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 2rem;
`;

const PageTitle = styled.h1`
  color: #fff;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 2rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BudgetCard = styled(Card)`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
`;

const Budget: React.FC = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  
  // Use project context pouze pokud existuje (optional)
  const projectContext = useProject(false);
  const project = projectContext?.project;

  const handleBackToProject = () => {
    if (projectId && project) {
      navigate(`/films/${projectId}`);
    } else {
      navigate('/films');
    }
  };

  const getPageTitle = () => {
    if (project) {
      return `Rozpočet - ${project.title}`;
    }
    return 'Rozpočet';
  };

  return (
    <PageContainer>
      {projectId && (
        <Button onClick={handleBackToProject} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} />
          Zpět na projekt
        </Button>
      )}
      
      <PageTitle>
        <DollarSign />
        {getPageTitle()}
      </PageTitle>

      <BudgetCard>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💰</div>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Rozpočtový systém</h3>
        <p style={{ color: '#8b8b8b', marginBottom: '2rem' }}>
          {project 
            ? `Rozpočet pro projekt "${project.title}" bude implementován v další iteraci.`
            : 'Obecný rozpočtový systém bude implementován v další iteraci.'
          }
        </p>
        
        {project && (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            padding: '1rem', 
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <strong style={{ color: '#667eea' }}>Projekt: {project.title}</strong>
            <br />
            <span style={{ color: '#8b8b8b', fontSize: '0.875rem' }}>
              {project.status} • {project.location_primary}
            </span>
          </div>
        )}
      </BudgetCard>
    </PageContainer>
  );
};

export default Budget;
