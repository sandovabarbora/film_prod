// src/pages/Dashboard.tsx - Cinema Grade Dashboard
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    {
      id: 'new-project',
      title: 'Nový projekt',
      description: 'Založit filmový projekt',
      icon: '🎬',
      gradient: 'sunset',
      onClick: () => navigate('/films'),
    },
    {
      id: 'add-crew',
      title: 'Přidat štáb',
      description: 'Nové členy týmu',
      icon: '👥',
      gradient: 'ocean',
      onClick: () => navigate('/crew'),
    },
    {
      id: 'schedule',
      title: 'Naplánovat natáčení',
      description: 'Vytvořit harmonogram',
      icon: '📅',
      gradient: 'success',
      onClick: () => navigate('/schedule'),
    },
    {
      id: 'documents',
      title: 'Upload dokumenty',
      description: 'Skripty a materiály',
      icon: '📄',
      gradient: 'text',
      onClick: () => navigate('/documents'),
    },
  ];

  const projects = [
    {
      id: '1',
      title: 'Letní příběh',
      status: 'production',
      progress: 65,
      daysLeft: 12,
      budget: { used: 450000, total: 800000 },
      team: 24,
      scenes: { completed: 45, total: 72 },
    },
    {
      id: '2', 
      title: 'Městské legendy',
      status: 'pre_production',
      progress: 30,
      daysLeft: 45,
      budget: { used: 120000, total: 600000 },
      team: 18,
      scenes: { completed: 12, total: 58 },
    },
    {
      id: '3',
      title: 'Dokumentární série',
      status: 'post_production',
      progress: 85,
      daysLeft: 8,
      budget: { used: 280000, total: 350000 },
      team: 12,
      scenes: { completed: 34, total: 34 },
    },
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Natáčení - Scéna 15',
      time: 'Dnes 09:00',
      location: 'Studio A',
      type: 'shooting',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Meeting s režisérem',
      time: 'Zítra 14:00',
      location: 'Kancelář',
      type: 'meeting',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Deadline - Post produkce',
      time: 'Za 3 dny',
      location: 'Remote',
      type: 'deadline',
      priority: 'high',
    },
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      development: { label: 'Vývoj', color: 'development' },
      pre_production: { label: 'Příprava', color: 'preProduction' },
      production: { label: 'Natáčení', color: 'production' },
      post_production: { label: 'Postprodukce', color: 'postProduction' },
      completed: { label: 'Dokončeno', color: 'completed' },
    };
    return statusMap[status] || { label: status, color: 'cancelled' };
  };

  return (
    <DashboardContainer>
      {/* Hero Section */}
      <HeroSection className="glass-light fade-in-up">
        <HeroContent>
          <WelcomeText>Vítejte zpět,</WelcomeText>
          <UserName className="gradient-text">{user?.display_name || user?.username}! 👋</UserName>
          <HeroStats>
            <span>3 aktivní projekty</span>
            <StatDivider>•</StatDivider>
            <span>2 úkoly dnes</span>
            <StatDivider>•</StatDivider>
            <span>67% průměrný pokrok</span>
          </HeroStats>
        </HeroContent>
        
        <HeroMetrics>
          <MetricCard className="delay-100">
            <MetricValue>3</MetricValue>
            <MetricLabel>Aktivní projekty</MetricLabel>
          </MetricCard>
          <MetricCard className="delay-200">
            <MetricValue>24</MetricValue>
            <MetricLabel>Členů štábu</MetricLabel>
          </MetricCard>
          <MetricCard className="delay-300">
            <MetricValue>67%</MetricValue>
            <MetricLabel>Průměrný pokrok</MetricLabel>
          </MetricCard>
        </HeroMetrics>
      </HeroSection>

      {/* Quick Actions */}
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>Rychlé akce</SectionTitle>
          <SectionSubtitle>Nejčastěji používané funkce</SectionSubtitle>
        </SectionHeader>
        
        <QuickActionsGrid>
          {quickActions.map((action, index) => (
            <ActionCard 
              key={action.id} 
              className={`glass-light interactive delay-${(index + 1) * 100}`}
              onClick={action.onClick}
            >
              <ActionIcon>{action.icon}</ActionIcon>
              <ActionContent>
                <ActionTitle>{action.title}</ActionTitle>
                <ActionDescription>{action.description}</ActionDescription>
              </ActionContent>
              <ActionGradient gradient={action.gradient} />
            </ActionCard>
          ))}
        </QuickActionsGrid>
      </SectionContainer>

      {/* Main Dashboard Grid */}
      <DashboardGrid>
        {/* Projects Column */}
        <ProjectsSection>
          <SectionHeader>
            <SectionTitle>Aktuální projekty</SectionTitle>
            <ViewAllButton onClick={() => navigate('/films')}>
              Zobrazit všechny →
            </ViewAllButton>
          </SectionHeader>
          
          <ProjectsList>
            {projects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                className={`glass-medium interactive delay-${(index + 1) * 150}`}
                onClick={() => navigate(`/films/${project.id}`)}
              >
                <ProjectHeader>
                  <ProjectInfo>
                    <ProjectTitle>{project.title}</ProjectTitle>
                    <ProjectMeta>
                      <StatusBadge color={getStatusInfo(project.status).color}>
                        {getStatusInfo(project.status).label}
                      </StatusBadge>
                      <ProjectDays>{project.daysLeft} dní zbývá</ProjectDays>
                    </ProjectMeta>
                  </ProjectInfo>
                  <ProjectTeam>
                    <TeamIcon>👥</TeamIcon>
                    <TeamCount>{project.team}</TeamCount>
                  </ProjectTeam>
                </ProjectHeader>

                <ProjectMetrics>
                  <MetricRow>
                    <MetricInfo>
                      <MetricName>Pokrok</MetricName>
                      <MetricValue>{project.progress}%</MetricValue>
                    </MetricInfo>
                    <ProgressBar>
                      <ProgressFill width={project.progress} color="primary" />
                    </ProgressBar>
                  </MetricRow>

                  <MetricRow>
                    <MetricInfo>
                      <MetricName>Rozpočet</MetricName>
                      <MetricValue>
                        {Math.round(project.budget.used / 1000)}k / {Math.round(project.budget.total / 1000)}k
                      </MetricValue>
                    </MetricInfo>
                    <ProgressBar>
                      <ProgressFill 
                        width={(project.budget.used / project.budget.total) * 100} 
                        color="warning"
                      />
                    </ProgressBar>
                  </MetricRow>

                  <MetricRow>
                    <MetricInfo>
                      <MetricName>Scény</MetricName>
                      <MetricValue>
                        {project.scenes.completed} / {project.scenes.total}
                      </MetricValue>
                    </MetricInfo>
                    <ProgressBar>
                      <ProgressFill 
                        width={(project.scenes.completed / project.scenes.total) * 100} 
                        color="success"
                      />
                    </ProgressBar>
                  </MetricRow>
                </ProjectMetrics>
              </ProjectCard>
            ))}
          </ProjectsList>
        </ProjectsSection>

        {/* Events & Info Column */}
        <SidebarSection>
          {/* Upcoming Events */}
          <EventsSection className="glass-light fade-in-up delay-400">
            <SectionTitle>Nadcházející události</SectionTitle>
            
            <EventsList>
              {upcomingEvents.map((event, index) => (
                <EventCard key={event.id} priority={event.priority}>
                  <EventIcon type={event.type}>
                    {event.type === 'shooting' && '🎬'}
                    {event.type === 'meeting' && '🤝'}
                    {event.type === 'deadline' && '⏰'}
                  </EventIcon>
                  <EventContent>
                    <EventTitle>{event.title}</EventTitle>
                    <EventTime>{event.time}</EventTime>
                    <EventLocation>📍 {event.location}</EventLocation>
                  </EventContent>
                  <EventPriority priority={event.priority} />
                </EventCard>
              ))}
            </EventsList>

            <ViewCalendarButton onClick={() => navigate('/schedule')}>
              Zobrazit kalendář
            </ViewCalendarButton>
          </EventsSection>

          {/* Weather Widget */}
          <WeatherSection className="glass-medium fade-in-up delay-500">
            <WeatherHeader>
              <WeatherTitle>Počasí pro natáčení</WeatherTitle>
              <WeatherLocation>Praha, CZ</WeatherLocation>
            </WeatherHeader>
            
            <WeatherContent>
              <WeatherMain>
                <WeatherIcon>☀️</WeatherIcon>
                <WeatherTemp>18°C</WeatherTemp>
              </WeatherMain>
              <WeatherDetails>
                <WeatherDesc>Slunečno</WeatherDesc>
                <WeatherWind>Vítr: 5 km/h</WeatherWind>
                <WeatherHumidity>Vlhkost: 65%</WeatherHumidity>
              </WeatherDetails>
            </WeatherContent>

            <WeatherButton onClick={() => navigate('/weather')}>
              Týdenní předpověď
            </WeatherButton>
          </WeatherSection>

          {/* Quick Stats */}
          <StatsSection className="glass-heavy fade-in-up delay-600">
            <StatsTitle>Dnešní přehled</StatsTitle>
            <StatsGrid>
              <StatItem>
                <StatIcon>🎬</StatIcon>
                <StatValue>3</StatValue>
                <StatLabel>Scény dnes</StatLabel>
              </StatItem>
              <StatItem>
                <StatIcon>👥</StatIcon>
                <StatValue>12</StatValue>
                <StatLabel>Štáb online</StatLabel>
              </StatItem>
              <StatItem>
                <StatIcon>📄</StatIcon>
                <StatValue>5</StatValue>
                <StatLabel>Nové dokumenty</StatLabel>
              </StatItem>
              <StatItem>
                <StatIcon>💬</StatIcon>
                <StatValue>7</StatValue>
                <StatLabel>Zprávy</StatLabel>
              </StatItem>
            </StatsGrid>
          </StatsSection>
        </SidebarSection>
      </DashboardGrid>
    </DashboardContainer>
  );
}

// Styled Components - Cinema Grade Design
const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: ${props => props.theme.spacing['2xl']};
  background: ${props => props.theme.colors.background};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing.lg};
  }
`;

const HeroSection = styled.section`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${props => props.theme.spacing['3xl']};
  align-items: center;
  padding: ${props => props.theme.spacing['3xl']};
  border-radius: ${props => props.theme.borderRadius['3xl']};
  margin-bottom: ${props => props.theme.spacing['3xl']};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme.colors.gradients.hero};
    opacity: 0.03;
    z-index: -1;
  }

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.xl};
    text-align: center;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const WelcomeText = styled.p`
  font-family: ${props => props.theme.typography.fontFamily.elegant};
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const UserName = styled.h1`
  font-family: ${props => props.theme.typography.fontFamily.display};
  font-size: clamp(${props => props.theme.typography.fontSize['3xl']}, 5vw, ${props => props.theme.typography.fontSize['5xl']});
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin: 0;
  line-height: 1.1;
`;

const HeroStats = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  font-family: ${props => props.theme.typography.fontFamily.mono};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
  }
`;

const StatDivider = styled.span`
  color: ${props => props.theme.colors.primary};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const HeroMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  background: ${props => props.theme.glass.medium.background};
  backdrop-filter: ${props => props.theme.glass.medium.backdrop};
  border: 1px solid ${props => props.theme.glass.medium.border};
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.glassSm};
  }
`;

const MetricValue = styled.div`
  font-family: ${props => props.theme.typography.fontFamily.display};
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const SectionContainer = styled.section`
  margin-bottom: ${props => props.theme.spacing['4xl']};
`;

const SectionHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing.md};
  }
`;

const SectionTitle = styled.h2`
  font-family: ${props => props.theme.typography.fontFamily.display};
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const SectionSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.textSecondary};
  margin: ${props => props.theme.spacing.xs} 0 0 0;
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.primaryDark};
    transform: translateX(4px);
  }
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const ActionCard = styled.div`
  position: relative;
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  cursor: pointer;
  overflow: hidden;
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    transform: translateY(-6px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const ActionGradient = styled.div<{ gradient: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: ${props => props.theme.colors.gradients[props.gradient] || props.theme.colors.gradients.sunset};
  border-radius: ${props => props.theme.borderRadius['2xl']} ${props => props.theme.borderRadius['2xl']} 0 0;
`;

const ActionIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ActionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const ActionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const ActionDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing['3xl']};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.xl};
  }
`;

const ProjectsSection = styled.div``;

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const ProjectCard = styled.div`
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProjectInfo = styled.div`
  flex: 1;
`;

const ProjectTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const StatusBadge = styled.span<{ color: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: white;
  background: ${props => props.theme.colors[props.color] || props.theme.colors.primary};
`;

const ProjectDays = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ProjectTeam = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.glass.light.background};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
`;

const TeamIcon = styled.span`
  font-size: 1rem;
`;

const TeamCount = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const ProjectMetrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const MetricRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const MetricInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MetricName = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ProgressBar = styled.div`
  height: 8px;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.theme.colors[props.color] || props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  transition: width 0.6s ease;
`;

const SidebarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const EventsSection = styled.div`
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius['2xl']};
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin: ${props => props.theme.spacing.lg} 0;
`;

const EventCard = styled.div<{ priority: string }>`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.glass.light.background};
  border-left: 3px solid ${props => 
    props.priority === 'high' ? props.theme.colors.error :
    props.priority === 'medium' ? props.theme.colors.warning :
    props.theme.colors.success
  };
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    transform: translateX(4px);
  }
`;

const EventIcon = styled.div<{ type: string }>`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const EventContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const EventTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const EventTime = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: 2px;
`;

const EventLocation = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const EventPriority = styled.div<{ priority: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => 
    props.priority === 'high' ? props.theme.colors.error :
    props.priority === 'medium' ? props.theme.colors.warning :
    props.theme.colors.success
  };
  flex-shrink: 0;
  margin-top: 4px;
`;

const ViewCalendarButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gradients.ocean};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.primary};
  }
`;

const WeatherSection = styled.div`
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius['2xl']};
`;

const WeatherHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const WeatherTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const WeatherLocation = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const WeatherContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const WeatherMain = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const WeatherIcon = styled.div`
  font-size: 3rem;
`;

const WeatherTemp = styled.div`
  font-family: ${props => props.theme.typography.fontFamily.display};
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
`;

const WeatherDetails = styled.div`
  flex: 1;
`;

const WeatherDesc = styled.div`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const WeatherWind = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const WeatherHumidity = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const WeatherButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: none;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const StatsSection = styled.div`
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius['2xl']};
`;

const StatsTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
`;

const StatItem = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.glass.light.background};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const StatIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatValue = styled.div`
  font-family: ${props => props.theme.typography.fontFamily.display};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;