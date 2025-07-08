// src/pages/ProjectDetail.tsx - Kompletní project detail s novými komponenty
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../components/ui/Card';
import { PrimaryButton, OutlineButton, SecondaryButton, DangerButton } from '../components/ui/Button';
import { useProject, useUpdateProject, useDeleteProject, useUpdateProjectStatus } from '../hooks/useProjects';
import { ProjectEditModal } from '../components/features/ProjectEditModal';
import { TeamManagement } from '../components/features/TeamManagement';

// Import našich nových feature komponent
import { 
  BudgetTracker,
  ProjectTimeline,
  DocumentManager
} from '../components/features';

import type { Project } from '../types/project';

type TabType = 'overview' | 'team' | 'budget' | 'timeline' | 'documents' | 'settings';

export default function ProjectDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // API hooks
  const { data: project, isLoading, error } = useProject(id!);
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const updateStatusMutation = useUpdateProjectStatus();

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Mock current user - v reálné aplikaci by byl z auth contextu
  const currentUser = {
    id: 'user-1',
    name: 'Jan Novák',
    role: 'Producer',
    permissions: ['admin', 'edit', 'approve']
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Načítám projekt...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !project) {
    return (
      <ErrorContainer>
        <ErrorIcon>❌</ErrorIcon>
        <ErrorTitle>Projekt nenalezen</ErrorTitle>
        <ErrorDescription>
          Projekt s ID "{id}" neexistuje nebo k němu nemáte přístup.
        </ErrorDescription>
        <PrimaryButton onClick={() => navigate('/films')}>
          ← Zpět na projekty
        </PrimaryButton>
      </ErrorContainer>
    );
  }

  const handleStatusChange = async (newStatus: Project['status']) => {
    try {
      await updateStatusMutation.mutateAsync({ id: project.id, status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleProjectUpdate = async (updates: Partial<Project>) => {
    try {
      await updateProjectMutation.mutateAsync({ id: project.id, updates });
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleProjectDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(project.id);
      navigate('/films');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  // Budget event handlers
  const handleBudgetUpdate = (budgetData: any) => {
    console.log('Budget update:', budgetData);
    // V reálné aplikaci by se volal API endpoint
  };

  const handleTransactionAdd = (transaction: any) => {
    console.log('Add transaction:', transaction);
    // V reálné aplikaci by se volal API endpoint
  };

  // Timeline event handlers
  const handleTaskUpdate = (taskId: string, updates: any) => {
    console.log('Task update:', taskId, updates);
    // V reálné aplikaci by se volal API endpoint
  };

  const handleMilestoneUpdate = (milestoneId: string, updates: any) => {
    console.log('Milestone update:', milestoneId, updates);
    // V reálné aplikaci by se volal API endpoint
  };

  const handleAddTask = (task: any) => {
    console.log('Add task:', task);
    // V reálné aplikaci by se volal API endpoint
  };

  const handleAddMilestone = (milestone: any) => {
    console.log('Add milestone:', milestone);
    // V reálné aplikaci by se volal API endpoint
  };

  // Document event handlers
  const handleDocumentUpload = (file: File, metadata: any) => {
    console.log('Document upload:', file, metadata);
    // V reálné aplikaci by se volal API endpoint
  };

  const handleDocumentUpdate = (documentId: string, updates: any) => {
    console.log('Document update:', documentId, updates);
    // V reálné aplikaci by se volal API endpoint
  };

  const handleDocumentDelete = (documentId: string) => {
    console.log('Document delete:', documentId);
    // V reálné aplikaci by se volal API endpoint
  };

  const handleVersionUpload = (documentId: string, file: File, changeLog: string) => {
    console.log('Version upload:', documentId, file, changeLog);
    // V reálné aplikaci by se volal API endpoint
  };

  const handleCommentAdd = (documentId: string, comment: any) => {
    console.log('Comment add:', documentId, comment);
    // V reálné aplikaci by se volal API endpoint
  };

  const handleApprovalRequest = (documentId: string) => {
    console.log('Approval request:', documentId);
    // V reálné aplikaci by se volal API endpoint
  };

  const handleApprovalAction = (documentId: string, action: 'approve' | 'reject', comment?: string) => {
    console.log('Approval action:', documentId, action, comment);
    // V reálné aplikaci by se volal API endpoint
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      development: { label: 'Vývoj', color: '#6B7280' },
      pre_production: { label: 'Příprava', color: '#F59E0B' },
      production: { label: 'Natáčení', color: '#EF4444' },
      post_production: { label: 'Postprodukce', color: '#8B5CF6' },
      completed: { label: 'Dokončeno', color: '#10B981' },
      on_hold: { label: 'Pozastaveno', color: '#9CA3AF' },
      cancelled: { label: 'Zrušeno', color: '#6B7280' }
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, color: '#6B7280' };
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B', 
      high: '#EF4444',
      critical: '#DC2626'
    };
    return colors[priority as keyof typeof colors] || '#6B7280';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Přehled', icon: '📊' },
    { id: 'team', label: 'Tým', icon: '👥', badge: project.team.total },
    { id: 'budget', label: 'Rozpočet', icon: '💰' },
    { id: 'timeline', label: 'Harmonogram', icon: '📅' },
    { id: 'documents', label: 'Dokumenty', icon: '📄', badge: project.documents?.length },
    { id: 'settings', label: 'Nastavení', icon: '⚙️' }
  ];

  return (
    <ProjectDetailContainer>
      {/* Header Section */}
      <HeaderSection>
        <BackButton onClick={() => navigate('/films')}>
          ← Zpět na projekty
        </BackButton>
        
        <ProjectHeader>
          <HeaderLeft>
            <ProjectTitle>{project.title}</ProjectTitle>
            <ProjectMeta>
              <StatusBadge $color={getStatusInfo(project.status).color}>
                {getStatusInfo(project.status).label}
              </StatusBadge>
              <ProjectType>{project.type}</ProjectType>
              <PriorityIndicator $color={getPriorityColor(project.priority)}>
                {project.priority.toUpperCase()}
              </PriorityIndicator>
              <LastUpdate>
                Aktualizace: {formatDate(project.updatedAt)}
              </LastUpdate>
            </ProjectMeta>
          </HeaderLeft>
          
          <HeaderActions>
            <StatusDropdown
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value as Project['status'])}
              disabled={updateStatusMutation.isLoading}
            >
              <option value="development">Vývoj</option>
              <option value="pre_production">Příprava</option>
              <option value="production">Natáčení</option>
              <option value="post_production">Postprodukce</option>
              <option value="completed">Dokončeno</option>
              <option value="on_hold">Pozastaveno</option>
              <option value="cancelled">Zrušeno</option>
            </StatusDropdown>
            
            <SecondaryButton onClick={() => setShowEditModal(true)}>
              ✏️ Upravit
            </SecondaryButton>
            
            <ActionDropdown>
              <DropdownToggle>⋮</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() => {/* Handle duplicate */}}>
                  📋 Duplikovat projekt
                </DropdownItem>
                <DropdownItem onClick={() => {/* Handle export */}}>
                  📤 Exportovat
                </DropdownItem>
                <DropdownItem onClick={() => {/* Handle archive */}}>
                  📦 Archivovat
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem 
                  $danger 
                  onClick={() => setShowDeleteModal(true)}
                >
                  🗑️ Smazat projekt
                </DropdownItem>
              </DropdownMenu>
            </ActionDropdown>
          </HeaderActions>
        </ProjectHeader>
      </HeaderSection>

      {/* Progress Overview */}
      <ProgressSection>
        <ProgressCard>
          <ProgressHeader>
            <ProgressTitle>Celkový pokrok</ProgressTitle>
            <ProgressValue>{project.progress.overall}%</ProgressValue>
          </ProgressHeader>
          <ProgressBar>
            <ProgressFill $width={project.progress.overall} />
          </ProgressBar>
        </ProgressCard>

        <PhaseProgress>
          <PhaseItem>
            <PhaseLabel>Příprava</PhaseLabel>
            <PhaseBar>
              <PhaseFill $width={project.progress.preProduction} $color="#9F7AEA" />
            </PhaseBar>
            <PhaseValue>{project.progress.preProduction}%</PhaseValue>
          </PhaseItem>
          <PhaseItem>
            <PhaseLabel>Natáčení</PhaseLabel>
            <PhaseBar>
              <PhaseFill $width={project.progress.production} $color="#F56500" />
            </PhaseBar>
            <PhaseValue>{project.progress.production}%</PhaseValue>
          </PhaseItem>
          <PhaseItem>
            <PhaseLabel>Postprodukce</PhaseLabel>
            <PhaseBar>
              <PhaseFill $width={project.progress.postProduction} $color="#38B2AC" />
            </PhaseBar>
            <PhaseValue>{project.progress.postProduction}%</PhaseValue>
          </PhaseItem>
        </PhaseProgress>
      </ProgressSection>

      {/* Tabs Navigation */}
      <TabsSection>
        <TabsList>
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              $isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              <TabIcon>{tab.icon}</TabIcon>
              <TabLabel>{tab.label}</TabLabel>
              {tab.badge && tab.badge > 0 && (
                <TabBadge>{tab.badge}</TabBadge>
              )}
            </TabButton>
          ))}
        </TabsList>
      </TabsSection>

      {/* Tab Content */}
      <TabContent>
        {activeTab === 'overview' && (
          <OverviewContent>
            <OverviewGrid>
              <ProjectOverviewCard>
                <CardHeader>
                  <h3>Detail projektu</h3>
                </CardHeader>
                <CardContent>
                  <ProjectDetails>
                    <DetailRow>
                      <DetailLabel>Režisér:</DetailLabel>
                      <DetailValue>{project.director}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Producent:</DetailLabel>
                      <DetailValue>{project.producer}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Začátek natáčení:</DetailLabel>
                      <DetailValue>{formatDate(project.timeline.startDate)}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Konec natáčení:</DetailLabel>
                      <DetailValue>{formatDate(project.timeline.endDate)}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Lokace:</DetailLabel>
                      <DetailValue>{project.locations.join(', ')}</DetailValue>
                    </DetailRow>
                  </ProjectDetails>
                  
                  {project.description && (
                    <ProjectDescription>
                      <h4>Popis projektu</h4>
                      <p>{project.description}</p>
                    </ProjectDescription>
                  )}
                </CardContent>
              </ProjectOverviewCard>

              <QuickStatsCard>
                <CardHeader>
                  <h3>Rychlý přehled</h3>
                </CardHeader>
                <CardContent>
                  <StatsList>
                    <StatItem>
                      <StatIcon>💰</StatIcon>
                      <StatInfo>
                        <StatValue>{formatCurrency(project.budget.used)}</StatValue>
                        <StatLabel>z {formatCurrency(project.budget.total)} rozpočtu</StatLabel>
                      </StatInfo>
                    </StatItem>
                    
                    <StatItem>
                      <StatIcon>👥</StatIcon>
                      <StatInfo>
                        <StatValue>{project.team.active}</StatValue>
                        <StatLabel>z {project.team.total} členů týmu</StatLabel>
                      </StatInfo>
                    </StatItem>
                    
                    <StatItem>
                      <StatIcon>📄</StatIcon>
                      <StatInfo>
                        <StatValue>{project.documents?.length || 0}</StatValue>
                        <StatLabel>dokumentů</StatLabel>
                      </StatInfo>
                    </StatItem>
                    
                    <StatItem>
                      <StatIcon>📅</StatIcon>
                      <StatInfo>
                        <StatValue>{Math.ceil((new Date(project.timeline.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}</StatValue>
                        <StatLabel>dní do konce</StatLabel>
                      </StatInfo>
                    </StatItem>
                  </StatsList>
                </CardContent>
              </QuickStatsCard>
            </OverviewGrid>
          </OverviewContent>
        )}

        {activeTab === 'team' && (
          <TeamManagement projectId={project.id} team={project.team} />
        )}

        {activeTab === 'budget' && (
          <BudgetTracker 
            projectId={project.id} 
            budget={project.budget}
            onBudgetUpdate={handleBudgetUpdate}
            onTransactionAdd={handleTransactionAdd}
          />
        )}

        {activeTab === 'timeline' && (
          <ProjectTimeline 
            projectId={project.id} 
            timeline={project.timeline}
            onTaskUpdate={handleTaskUpdate}
            onMilestoneUpdate={handleMilestoneUpdate}
            onAddTask={handleAddTask}
            onAddMilestone={handleAddMilestone}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentManager 
            projectId={project.id} 
            documents={project.documents || []}
            currentUser={currentUser}
            onDocumentUpload={handleDocumentUpload}
            onDocumentUpdate={handleDocumentUpdate}
            onDocumentDelete={handleDocumentDelete}
            onVersionUpload={handleVersionUpload}
            onCommentAdd={handleCommentAdd}
            onApprovalRequest={handleApprovalRequest}
            onApprovalAction={handleApprovalAction}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsContent>
            <SettingsGrid>
              <GlassCard padding="xl">
                <CardHeader>
                  <h3>Obecné nastavení</h3>
                </CardHeader>
                <CardContent>
                  <SettingsForm>
                    <FormGroup>
                      <FormLabel>Viditelnost projektu</FormLabel>
                      <FormSelect value={project.visibility}>
                        <option value="private">Soukromý</option>
                        <option value="team">Tým</option>
                        <option value="public">Veřejný</option>
                      </FormSelect>
                    </FormGroup>
                    <FormGroup>
                      <FormLabel>Priorita</FormLabel>
                      <FormSelect value={project.priority}>
                        <option value="low">Nízká</option>
                        <option value="medium">Střední</option>
                        <option value="high">Vysoká</option>
                        <option value="critical">Kritická</option>
                      </FormSelect>
                    </FormGroup>
                  </SettingsForm>
                </CardContent>
              </GlassCard>

              <GlassCard padding="xl">
                <CardHeader>
                  <h3>Nebezpečná zóna</h3>
                </CardHeader>
                <CardContent>
                  <DangerZone>
                    <DangerItem>
                      <DangerInfo>
                        <DangerTitle>Archivovat projekt</DangerTitle>
                        <DangerDescription>
                          Projekt bude přesunut do archivu a nebude viditelný v seznamu aktivních projektů.
                        </DangerDescription>
                      </DangerInfo>
                      <OutlineButton>Archivovat</OutlineButton>
                    </DangerItem>
                    <DangerItem>
                      <DangerInfo>
                        <DangerTitle>Smazat projekt</DangerTitle>
                        <DangerDescription>
                          Tato akce je nevratná. Všechna data projektu budou trvale smazána.
                        </DangerDescription>
                      </DangerInfo>
                      <DangerButton onClick={() => setShowDeleteModal(true)}>
                        Smazat projekt
                      </DangerButton>
                    </DangerItem>
                  </DangerZone>
                </CardContent>
              </GlassCard>
            </SettingsGrid>
          </SettingsContent>
        )}
      </TabContent>

      {/* Modals */}
      {showEditModal && (
        <ProjectEditModal
          project={project}
          onSave={handleProjectUpdate}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal>
          <DeleteModalContent>
            <h3>Smazat projekt</h3>
            <p>Opravdu chcete smazat projekt "{project.title}"? Tato akce je nevratná.</p>
            <DeleteModalActions>
              <OutlineButton onClick={() => setShowDeleteModal(false)}>
                Zrušit
              </OutlineButton>
              <DangerButton 
                onClick={handleProjectDelete}
                disabled={deleteProjectMutation.isLoading}
              >
                {deleteProjectMutation.isLoading ? 'Mazání...' : 'Smazat projekt'}
              </DangerButton>
            </DeleteModalActions>
          </DeleteModalContent>
        </DeleteConfirmModal>
      )}
    </ProjectDetailContainer>
  );
}

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const ProjectDetailContainer = styled.div`
  padding: ${props => props.theme.spacing['2xl']};
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
  animation: ${fadeInUp} 0.6s ease-out;
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.lg};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: ${props => props.theme.spacing.lg};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${props => props.theme.colors.border};
  border-left-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: ${props => props.theme.spacing.lg};
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
`;

const ErrorTitle = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const ErrorDescription = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
  max-width: 400px;
`;

const HeaderSection = styled.div`
  margin-bottom: ${props => props.theme.spacing['2xl']};
`;

const BackButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  margin-bottom: ${props => props.theme.spacing.lg};

  &:hover {
    background: ${props => props.theme.colors.background};
    transform: translateX(-2px);
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProjectTitle = styled.h1`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ $color: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  border: 1px solid ${props => props.$color}40;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const ProjectType = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const PriorityIndicator = styled.span<{ $color: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  border: 1px solid ${props => props.$color}40;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const LastUpdate = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const StatusDropdown = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ActionDropdown = styled.div`
  position: relative;
  
  &:hover > div {
    display: block;
  }
`;

const DropdownToggle = styled.button`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.lg};
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const DropdownMenu = styled.div`
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 10;
  min-width: 200px;
`;

const DropdownItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  border: none;
  background: transparent;
  color: ${props => props.$danger ? '#EF4444' : props.theme.colors.text};
  cursor: pointer;
  transition: background ${props => props.theme.transitions.fast};
  text-align: left;

  &:hover {
    background: ${props => props.theme.colors.background};
  }

  &:first-child {
    border-radius: ${props => props.theme.borderRadius.lg} ${props => props.theme.borderRadius.lg} 0 0;
  }

  &:last-child {
    border-radius: 0 0 ${props => props.theme.borderRadius.lg} ${props => props.theme.borderRadius.lg};
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border};
  margin: ${props => props.theme.spacing.xs} 0;
`;

const ProgressSection = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing['2xl']};
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const ProgressCard = styled(GlassCard)`
  flex: 1;
  padding: ${props => props.theme.spacing.xl};
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProgressTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const ProgressValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
`;

const ProgressBar = styled.div`
  height: 12px;
  background: ${props => props.theme.colors.border};
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $width: number }>`
  height: 100%;
  width: ${props => props.$width}%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, #059669);
  transition: width ${props => props.theme.transitions.normal};
`;

const PhaseProgress = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const PhaseItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const PhaseLabel = styled.div`
  min-width: 100px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const PhaseBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${props => props.theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
`;

const PhaseFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$color};
  transition: width ${props => props.theme.transitions.normal};
`;

const PhaseValue = styled.div`
  min-width: 50px;
  text-align: right;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
`;

const TabsSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const TabsList = styled.div`
  display: flex;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xs};
  border: 1px solid ${props => props.theme.colors.border};
  overflow-x: auto;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: none;
  background: ${props => props.$isActive 
    ? props.theme.colors.primary 
    : 'transparent'
  };
  color: ${props => props.$isActive 
    ? 'white' 
    : props.theme.colors.text
  };
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;
  position: relative;

  &:hover {
    background: ${props => props.$isActive 
      ? props.theme.colors.primary 
      : props.theme.colors.background
    };
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const TabIcon = styled.span`
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const TabLabel = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const TabBadge = styled.span`
  background: #EF4444;
  color: white;
  border-radius: ${props => props.theme.borderRadius.full};
  padding: 2px 6px;
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  min-width: 18px;
  text-align: center;
`;

const TabContent = styled.div`
  min-height: 600px;
`;

const OverviewContent = styled.div``;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectOverviewCard = styled(GlassCard)`
  padding: ${props => props.theme.spacing.xl};
`;

const ProjectDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const DetailLabel = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const DetailValue = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  text-align: right;
`;

const ProjectDescription = styled.div`
  h4 {
    margin: 0 0 ${props => props.theme.spacing.md} 0;
    color: ${props => props.theme.colors.text};
  }
  
  p {
    margin: 0;
    color: ${props => props.theme.colors.textSecondary};
    line-height: 1.6;
  }
`;

const QuickStatsCard = styled(GlassCard)`
  padding: ${props => props.theme.spacing.xl};
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.theme.colors.primary}20;
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const SettingsContent = styled.div``;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SettingsForm = styled.div`
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

const DangerZone = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const DangerItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid #FEE2E2;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: #FEF2F2;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
`;

const DangerInfo = styled.div`
  flex: 1;
`;

const DangerTitle = styled.h4`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: #DC2626;
`;

const DangerDescription = styled.p`
  margin: 0;
  color: #7F1D1D;
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const DeleteConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DeleteModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing['2xl']};
  border-radius: ${props => props.theme.borderRadius.lg};
  max-width: 500px;
  width: 90vw;
  
  h3 {
    margin: 0 0 ${props => props.theme.spacing.md} 0;
    color: ${props => props.theme.colors.text};
  }
  
  p {
    margin: 0 0 ${props => props.theme.spacing.xl} 0;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const DeleteModalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
`;
