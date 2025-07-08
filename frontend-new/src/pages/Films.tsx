// src/pages/Films.tsx - Project Management Hub
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Card, GlassCard } from '../components/ui/Card';
import { PrimaryButton, OutlineButton, SecondaryButton } from '../components/ui/Button';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'development' | 'pre_production' | 'production' | 'post_production' | 'completed' | 'on_hold';
  type: 'feature' | 'documentary' | 'short' | 'commercial' | 'series';
  director: string;
  producer: string;
  budget: {
    total: number;
    used: number;
    remaining: number;
  };
  timeline: {
    startDate: string;
    endDate: string;
    currentPhase: string;
  };
  progress: {
    overall: number;
    preProduction: number;
    production: number;
    postProduction: number;
  };
  team: {
    total: number;
    active: number;
    roles: Array<{ role: string; person: string; }>;
  };
  scenes: {
    total: number;
    completed: number;
    inProgress: number;
  };
  locations: number;
  equipment: string[];
  tags: string[];
  poster?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastUpdate: string;
}

type ViewMode = 'grid' | 'list' | 'timeline';
type FilterStatus = 'all' | Project['status'];
type SortBy = 'name' | 'status' | 'progress' | 'deadline' | 'priority';

export default function Films(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // State management
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Mock data - v reálné app by přišla z API
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: '1',
        title: 'Letní příběh',
        description: 'Romantický drama o lásce během prázdnin v malém městě.',
        status: 'production',
        type: 'feature',
        director: 'Jana Nováková',
        producer: 'Petr Svoboda',
        budget: { total: 800000, used: 450000, remaining: 350000 },
        timeline: { 
          startDate: '2024-03-01', 
          endDate: '2024-09-30', 
          currentPhase: 'Natáčení hlavních scén' 
        },
        progress: { overall: 67, preProduction: 100, production: 65, postProduction: 0 },
        team: { 
          total: 24, 
          active: 22,
          roles: [
            { role: 'Režie', person: 'Jana Nováková' },
            { role: 'Produkce', person: 'Petr Svoboda' },
            { role: 'Kamera', person: 'Tomáš Dvořák' }
          ]
        },
        scenes: { total: 72, completed: 45, inProgress: 8 },
        locations: 12,
        equipment: ['Kamery', 'Osvětlení', 'Zvuk'],
        tags: ['drama', 'romance', 'léto'],
        priority: 'high',
        lastUpdate: '2 hodiny'
      },
      {
        id: '2',
        title: 'Městské legendy',
        description: 'Thriller o záhadných událostech v nočním městě.',
        status: 'pre_production',
        type: 'feature',
        director: 'Martin Černý',
        producer: 'Eva Procházková',
        budget: { total: 600000, used: 120000, remaining: 480000 },
        timeline: { 
          startDate: '2024-05-01', 
          endDate: '2024-12-31', 
          currentPhase: 'Casting a lokace' 
        },
        progress: { overall: 30, preProduction: 45, production: 0, postProduction: 0 },
        team: { 
          total: 18, 
          active: 15,
          roles: [
            { role: 'Režie', person: 'Martin Černý' },
            { role: 'Produkce', person: 'Eva Procházková' }
          ]
        },
        scenes: { total: 58, completed: 0, inProgress: 12 },
        locations: 8,
        equipment: ['Kamery', 'Osvětlení'],
        tags: ['thriller', 'mystery', 'město'],
        priority: 'medium',
        lastUpdate: '1 den'
      },
      {
        id: '3',
        title: 'Dokumentární série',
        description: 'Série o českých řemeslnících a jejich příbězích.',
        status: 'post_production',
        type: 'documentary',
        director: 'Klára Svobodová',
        producer: 'David Novák',
        budget: { total: 350000, used: 280000, remaining: 70000 },
        timeline: { 
          startDate: '2024-01-01', 
          endDate: '2024-08-31', 
          currentPhase: 'Střih a postprodukce' 
        },
        progress: { overall: 85, preProduction: 100, production: 100, postProduction: 70 },
        team: { 
          total: 12, 
          active: 8,
          roles: [
            { role: 'Režie', person: 'Klára Svobodová' },
            { role: 'Produkce', person: 'David Novák' },
            { role: 'Střih', person: 'Jiří Krejčí' }
          ]
        },
        scenes: { total: 34, completed: 34, inProgress: 0 },
        locations: 15,
        equipment: ['Kamery', 'Zvuk', 'Střižna'],
        tags: ['dokumentární', 'řemesla', 'tradice'],
        priority: 'high',
        lastUpdate: '30 minut'
      }
    ];

    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 800);
  }, []);

  // Filter and sort logic
  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'progress':
          return b.progress.overall - a.progress.overall;
        case 'deadline':
          return new Date(a.timeline.endDate).getTime() - new Date(b.timeline.endDate).getTime();
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

  // Helper functions
  const getStatusInfo = (status: Project['status']) => {
    const statusMap = {
      development: { label: 'Vývoj', color: '#6B73FF', bgColor: '#6B73FF20' },
      pre_production: { label: 'Příprava', color: '#9F7AEA', bgColor: '#9F7AEA20' },
      production: { label: 'Natáčení', color: '#F56500', bgColor: '#F5650020' },
      post_production: { label: 'Postprodukce', color: '#38B2AC', bgColor: '#38B2AC20' },
      completed: { label: 'Dokončeno', color: '#48BB78', bgColor: '#48BB7820' },
      on_hold: { label: 'Pozastaveno', color: '#A0AEC0', bgColor: '#A0AEC020' }
    };
    return statusMap[status];
  };

  const getPriorityColor = (priority: Project['priority']) => {
    const colors = {
      low: '#48BB78',
      medium: '#ED8936',
      high: '#F56565',
      critical: '#E53E3E'
    };
    return colors[priority];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Načítám projekty...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <FilmsContainer>
      {/* Header Section */}
      <HeaderSection>
        <HeaderContent>
          <PageTitle>Filmové projekty</PageTitle>
          <PageSubtitle>Správa a přehled všech produkčních projektů</PageSubtitle>
        </HeaderContent>
        <HeaderActions>
          <PrimaryButton 
            onClick={() => navigate('/films/new')}
            leftIcon="+"
          >
            Nový projekt
          </PrimaryButton>
        </HeaderActions>
      </HeaderSection>

      {/* Filters and Controls */}
      <ControlsSection>
        <FiltersRow>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Hledat projekty, režiséry, tagy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon>🔍</SearchIcon>
          </SearchContainer>

          <FilterGroup>
            <FilterSelect 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            >
              <option value="all">Všechny stavy</option>
              <option value="development">Vývoj</option>
              <option value="pre_production">Příprava</option>
              <option value="production">Natáčení</option>
              <option value="post_production">Postprodukce</option>
              <option value="completed">Dokončeno</option>
              <option value="on_hold">Pozastaveno</option>
            </FilterSelect>

            <SortSelect 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="name">Název</option>
              <option value="status">Stav</option>
              <option value="progress">Pokrok</option>
              <option value="deadline">Deadline</option>
              <option value="priority">Priorita</option>
            </SortSelect>
          </FilterGroup>
        </FiltersRow>

        <ViewControls>
          <ViewModeButtons>
            <ViewModeButton 
              $active={viewMode === 'grid'} 
              onClick={() => setViewMode('grid')}
            >
              ⊞ Mřížka
            </ViewModeButton>
            <ViewModeButton 
              $active={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
            >
              ☰ Seznam
            </ViewModeButton>
            <ViewModeButton 
              $active={viewMode === 'timeline'} 
              onClick={() => setViewMode('timeline')}
            >
              ⟶ Timeline
            </ViewModeButton>
          </ViewModeButtons>

          <ResultsInfo>
            {filteredAndSortedProjects.length} z {projects.length} projektů
          </ResultsInfo>
        </ViewControls>
      </ControlsSection>

      {/* Projects Content */}
      <ProjectsContent>
        {filteredAndSortedProjects.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🎬</EmptyIcon>
            <EmptyTitle>Žádné projekty</EmptyTitle>
            <EmptyText>
              {searchQuery || filterStatus !== 'all' 
                ? 'Zkuste změnit filtry nebo vyhledávání'
                : 'Začněte vytvořením prvního projektu'
              }
            </EmptyText>
            {!searchQuery && filterStatus === 'all' && (
              <PrimaryButton onClick={() => navigate('/films/new')}>
                Vytvořit projekt
              </PrimaryButton>
            )}
          </EmptyState>
        ) : (
          <>
            {viewMode === 'grid' && (
              <ProjectsGrid>
                {filteredAndSortedProjects.map((project, index) => (
                  <ProjectCard 
                    key={project.id}
                    $priority={project.priority}
                    onClick={() => navigate(`/films/${project.id}`)}
                  >
                    <CardHeader>
                      <ProjectInfo>
                        <ProjectTitle>{project.title}</ProjectTitle>
                        <ProjectMeta>
                          <StatusBadge $color={getStatusInfo(project.status).color}>
                            {getStatusInfo(project.status).label}
                          </StatusBadge>
                          <ProjectType>{project.type}</ProjectType>
                        </ProjectMeta>
                      </ProjectInfo>
                      <PriorityIndicator $color={getPriorityColor(project.priority)} />
                    </CardHeader>

                    <ProjectDescription>{project.description}</ProjectDescription>

                    <ProjectStats>
                      <StatRow>
                        <StatLabel>Pokrok</StatLabel>
                        <StatValue>{project.progress.overall}%</StatValue>
                      </StatRow>
                      <ProgressBar>
                        <ProgressFill $width={project.progress.overall} />
                      </ProgressBar>

                      <StatRow>
                        <StatLabel>Rozpočet</StatLabel>
                        <StatValue>
                          {Math.round(project.budget.used / 1000)}k / {Math.round(project.budget.total / 1000)}k
                        </StatValue>
                      </StatRow>
                      <ProgressBar>
                        <ProgressFill 
                          $width={(project.budget.used / project.budget.total) * 100} 
                          $color="#ED8936"
                        />
                      </ProgressBar>

                      <StatRow>
                        <StatLabel>Tým</StatLabel>
                        <StatValue>{project.team.active}/{project.team.total}</StatValue>
                      </StatRow>
                    </ProjectStats>

                    <ProjectFooter>
                      <FooterInfo>
                        <Director>👤 {project.director}</Director>
                        <LastUpdate>Aktualizace před {project.lastUpdate}</LastUpdate>
                      </FooterInfo>
                      <QuickActions>
                        <QuickAction onClick={(e) => { e.stopPropagation(); /* Handle action */ }}>
                          ⚙️
                        </QuickAction>
                        <QuickAction onClick={(e) => { e.stopPropagation(); /* Handle action */ }}>
                          📊
                        </QuickAction>
                      </QuickActions>
                    </ProjectFooter>
                  </ProjectCard>
                ))}
              </ProjectsGrid>
            )}

            {viewMode === 'list' && (
              <ProjectsList>
                {filteredAndSortedProjects.map((project) => (
                  <ListProjectCard 
                    key={project.id}
                    onClick={() => navigate(`/films/${project.id}`)}
                  >
                    <ListProjectInfo>
                      <ListProjectTitle>{project.title}</ListProjectTitle>
                      <ListProjectMeta>
                        <StatusBadge $color={getStatusInfo(project.status).color}>
                          {getStatusInfo(project.status).label}
                        </StatusBadge>
                        <span>👤 {project.director}</span>
                        <span>📅 {formatDate(project.timeline.endDate)}</span>
                      </ListProjectMeta>
                    </ListProjectInfo>
                    
                    <ListProjectProgress>
                      <ProgressValue>{project.progress.overall}%</ProgressValue>
                      <ProgressBar>
                        <ProgressFill $width={project.progress.overall} />
                      </ProgressBar>
                    </ListProjectProgress>
                    
                    <ListProjectBudget>
                      {formatCurrency(project.budget.used)} / {formatCurrency(project.budget.total)}
                    </ListProjectBudget>
                    
                    <ListProjectTeam>
                      👥 {project.team.active}/{project.team.total}
                    </ListProjectTeam>
                    
                    <PriorityIndicator $color={getPriorityColor(project.priority)} />
                  </ListProjectCard>
                ))}
              </ProjectsList>
            )}

            {viewMode === 'timeline' && (
              <TimelineView>
                <TimelineInfo>Timeline pohled bude implementován v další iteraci</TimelineInfo>
              </TimelineView>
            )}
          </>
        )}
      </ProjectsContent>
    </FilmsContainer>
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
const FilmsContainer = styled.div`
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
  height: 50vh;
  gap: ${props => props.theme.spacing.lg};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${props => props.theme.colors.border};
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const HeaderSection = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: ${props => props.theme.spacing['3xl']};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing.lg};
  }
`;

const HeaderContent = styled.div``;

const PageTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const PageSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const ControlsSection = styled.section`
  margin-bottom: ${props => props.theme.spacing['2xl']};
`;

const FiltersRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  padding-right: 50px;
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.xl};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.md};
  transition: all ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: ${props => props.theme.spacing.lg};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.2rem;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const FilterSelect = styled.select`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SortSelect = styled(FilterSelect)``;

const ViewControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing.md};
  }
`;

const ViewModeButtons = styled.div`
  display: flex;
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
`;

const ViewModeButton = styled.button<{ $active: boolean }>`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text};
  border: none;
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.background};
  }
`;

const ResultsInfo = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ProjectsContent = styled.div`
  min-height: 400px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['4xl']};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const EmptyTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const EmptyText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectCard = styled(Card)<{ $priority: string }>`
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  border-left: 4px solid ${props => getPriorityColor(props.$priority)};
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProjectInfo = styled.div`
  flex: 1;
`;

const ProjectTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const StatusBadge = styled.span<{ $color: string }>`
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const ProjectType = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-transform: capitalize;
`;

const PriorityIndicator = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color};
  flex-shrink: 0;
`;

const ProjectDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing.lg};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const StatValue = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ProgressBar = styled.div`
  height: 6px;
  background: ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ProgressFill = styled.div<{ $width: number; $color?: string }>`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$color || props.theme.colors.primary};
  border-radius: inherit;
  transition: width 0.6s ease;
`;

const ProjectFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const FooterInfo = styled.div`
  flex: 1;
`;

const Director = styled.div`
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const LastUpdate = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const QuickAction = styled.button`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    transform: scale(1.1);
  }
`;

// List view components
const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ListProjectCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xl};
  padding: ${props => props.theme.spacing.lg};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    transform: translateX(8px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing.md};
  }
`;

const ListProjectInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ListProjectTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const ListProjectMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ListProjectProgress = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.xs};
  min-width: 100px;
`;

const ProgressValue = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const ListProjectBudget = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  min-width: 120px;
  text-align: right;
`;

const ListProjectTeam = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  min-width: 80px;
  text-align: center;
`;

const TimelineView = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
`;

const TimelineInfo = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

function getPriorityColor(priority: Project['priority']): string {
  const colors = {
    low: '#48BB78',
    medium: '#ED8936',
    high: '#F56565',
    critical: '#E53E3E'
  };
  return colors[priority];
}
