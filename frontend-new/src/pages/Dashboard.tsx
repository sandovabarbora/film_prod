// src/pages/Dashboard.tsx - JetBrains-Style Modern Dashboard
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Calendar, Users, DollarSign, TrendingUp, Clock, 
  Film, Camera, MapPin, Star, Award, Target, Zap, AlertCircle,
  CheckCircle, XCircle, Activity, BarChart3, PieChart, 
  ArrowUp, ArrowDown, Eye, Edit, Plus, Bell, Code, Terminal,
  Cpu, Database, GitBranch, Layers, Monitor, Server
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// JetBrains-style Container
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
  padding: ${({ theme }) => theme.spacing[6]};
  
  /* JetBrains-style grid pattern */
  background-image: 
    linear-gradient(rgba(102, 126, 234, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(102, 126, 234, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
`;

const DashboardGrid = styled.div`
  display: grid;
  max-width: 1600px;
  margin: 0 auto;
  gap: ${({ theme }) => theme.spacing[6]};
  grid-template-areas:
    "hero hero hero sidebar"
    "metrics metrics metrics sidebar"
    "projects projects analytics sidebar"
    "timeline timeline timeline sidebar";
  grid-template-columns: 1fr 1fr 1fr 320px;
  
  @media (max-width: 1400px) {
    grid-template-areas:
      "hero hero hero"
      "metrics metrics metrics"
      "projects projects analytics"
      "timeline timeline sidebar";
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-areas:
      "hero"
      "metrics"
      "projects"
      "analytics"
      "timeline"
      "sidebar";
    grid-template-columns: 1fr;
  }
`;

// JetBrains-style Hero Section
const HeroSection = styled(motion.section)`
  grid-area: hero;
  background: ${({ theme }) => theme.colors.glass.surface};
  backdrop-filter: ${({ theme }) => theme.cinema.backdrop.medium};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing[8]};
  position: relative;
  overflow: hidden;
  
  /* JetBrains-style accent border */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme }) => theme.colors.gradients.primary};
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
`;

const WelcomeText = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: ${({ theme }) => theme.typography.fontWeight.light};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  
  /* JetBrains-style gradient text */
  background: ${({ theme }) => theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const TimeStamp = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  letter-spacing: 0.5px;
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const HeroStatItem = styled(motion.div)`
  background: ${({ theme }) => theme.colors.glass.surface};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  transition: ${({ theme }) => theme.transitions.cinema};
  
  &:hover {
    background: ${({ theme }) => theme.colors.glass.surfaceHover};
    border-color: ${({ theme }) => theme.colors.text.accent};
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  color: ${({ theme }) => theme.colors.text.accent};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const StatValue = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatLabel = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// JetBrains-style Metrics Grid
const MetricsGrid = styled.section`
  grid-area: metrics;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const MetricCard = styled(motion.div)<{ $accent?: string }>`
  background: ${({ theme }) => theme.colors.glass.surface};
  backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing[6]};
  position: relative;
  overflow: hidden;
  transition: ${({ theme }) => theme.transitions.cinema};
  
  &:hover {
    background: ${({ theme }) => theme.colors.glass.surfaceHover};
    border-color: ${({ theme }) => theme.colors.text.accent};
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.cinema};
  }
  
  /* JetBrains-style accent indicator */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ $accent, theme }) => $accent || theme.colors.text.accent};
  }
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const MetricIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: ${({ theme }) => theme.colors.text.accent}15;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.accent};
`;

const MetricChange = styled.span<{ $positive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ $positive, theme }) => 
    $positive ? theme.colors.status.wrap : theme.colors.status.shoot
  };
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const MetricValue = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const MetricLabel = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// JetBrains-style Projects Section
const ProjectsSection = styled(motion.section)`
  grid-area: projects;
  background: ${({ theme }) => theme.colors.glass.surface};
  backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing[6]};
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.glass.border};
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ViewAllButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  color: ${({ theme }) => theme.colors.text.accent};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: ${({ theme }) => theme.transitions.normal};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.text.accent}15;
    border-color: ${({ theme }) => theme.colors.text.accent};
  }
`;

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const ProjectCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.glass.surface};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[4]};
  transition: ${({ theme }) => theme.transitions.cinema};
  cursor: pointer;
  position: relative;
  
  &:hover {
    background: ${({ theme }) => theme.colors.glass.surfaceHover};
    border-color: ${({ theme }) => theme.colors.text.accent};
    transform: translateX(4px);
  }
  
  /* JetBrains-style hover accent */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    background: ${({ theme }) => theme.colors.text.accent};
    transition: width 0.3s ease;
  }
  
  &:hover::before {
    width: 3px;
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const ProjectTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 1px;
  background: ${({ $status, theme }) => {
    const colors = {
      production: theme.colors.status.shoot,
      pre_production: theme.colors.status.prep,
      post_production: theme.colors.status.post,
      completed: theme.colors.status.wrap,
    };
    return colors[$status] + '20';
  }};
  color: ${({ $status, theme }) => {
    const colors = {
      production: theme.colors.status.shoot,
      pre_production: theme.colors.status.prep,
      post_production: theme.colors.status.post,
      completed: theme.colors.status.wrap,
    };
    return colors[$status];
  }};
  border: 1px solid ${({ $status, theme }) => {
    const colors = {
      production: theme.colors.status.shoot,
      pre_production: theme.colors.status.prep,
      post_production: theme.colors.status.post,
      completed: theme.colors.status.wrap,
    };
    return colors[$status];
  }};
`;

const ProjectMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-top: ${({ theme }) => theme.spacing[3]};
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const MetaLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetaValue = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.glass.border};
  border-radius: 2px;
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacing[3]};
`;

const ProgressFill = styled.div<{ $width: number }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ theme }) => theme.colors.gradients.primary};
  transition: width 0.8s ease;
`;

// Analytics a další sekce - stejný JetBrains styl...
const AnalyticsSection = styled(motion.section)`
  grid-area: analytics;
  background: ${({ theme }) => theme.colors.glass.surface};
  backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing[6]};
`;

const ChartPlaceholder = styled.div`
  height: 200px;
  background: ${({ theme }) => theme.colors.glass.surface};
  border: 2px dashed ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const TimelineSection = styled(motion.section)`
  grid-area: timeline;
  background: ${({ theme }) => theme.colors.glass.surface};
  backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing[6]};
`;

const TimelineItem = styled(motion.div)`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[3]} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.glass.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const TimelineDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  margin-top: ${({ theme }) => theme.spacing[1]};
  flex-shrink: 0;
  box-shadow: 0 0 0 3px ${({ $color }) => $color}20;
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineDate = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const TimelineTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

// Sidebar - JetBrains style
const Sidebar = styled.aside`
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const SidebarWidget = styled(motion.div)<{ $variant?: string }>`
  background: ${({ theme }) => theme.colors.glass.surface};
  backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing[5]};
  position: relative;
  overflow: hidden;
  
  ${({ $variant, theme }) => $variant === 'accent' && `
    background: ${theme.colors.gradients.primary};
    color: white;
    border: none;
    
    * {
      color: white !important;
    }
  `}
`;

const WidgetTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const NotificationItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.glass.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const metrics = [
    {
      label: 'Active Projects',
      value: '03',
      change: '+02',
      positive: true,
      icon: <Film />,
      accent: '#667eea'
    },
    {
      label: 'Total Budget',
      value: '$2.4M',
      change: '+12%',
      positive: true,
      icon: <DollarSign />,
      accent: '#10b981'
    },
    {
      label: 'Crew Members',
      value: '47',
      change: '+05',
      positive: true,
      icon: <Users />,
      accent: '#f59e0b'
    },
    {
      label: 'Completed Scenes',
      value: '128',
      change: '+15',
      positive: true,
      icon: <CheckCircle />,
      accent: '#ef4444'
    }
  ];

  const projects = [
    {
      id: 1,
      title: 'Cinema Verité',
      status: 'production',
      progress: 68,
      daysLeft: 12,
      budget: 800000,
      location: 'Praha'
    },
    {
      id: 2,
      title: 'Digital Dreams',
      status: 'pre_production',
      progress: 35,
      daysLeft: 45,
      budget: 600000,
      location: 'Brno'
    },
    {
      id: 3,
      title: 'Urban Stories',
      status: 'post_production',
      progress: 92,
      daysLeft: 8,
      budget: 350000,
      location: 'Remote'
    }
  ];

  const timelineEvents = [
    {
      date: 'TODAY',
      title: 'Scene 12-15 Shooting Begins',
      color: '#ef4444'
    },
    {
      date: 'TOMORROW',
      title: 'First Cut Review Session',
      color: '#f59e0b'
    },
    {
      date: '+3 DAYS',
      title: 'New Cast Member Audition',
      color: '#10b981'
    },
    {
      date: '+1 WEEK',
      title: 'Final Budget Approval',
      color: '#667eea'
    }
  ];

  const notifications = [
    {
      id: 1,
      title: 'Director Message Received',
      icon: <Bell size={16} />,
      time: '5m ago'
    },
    {
      id: 2,
      title: 'Schedule Updated',
      icon: <Calendar size={16} />,
      time: '1h ago'
    },
    {
      id: 3,
      title: 'Budget Recalculated',
      icon: <DollarSign size={16} />,
      time: '2h ago'
    }
  ];

  const getStatusLabel = (status: string) => {
    const labels = {
      production: 'SHOOTING',
      pre_production: 'PREP',
      post_production: 'POST',
      completed: 'WRAPPED'
    };
    return labels[status] || status;
  };

  return (
    <DashboardContainer>
      <DashboardGrid>
        {/* Hero Section */}
        <HeroSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <HeroContent>
            <WelcomeText>
              Welcome back, {user?.display_name || user?.username}
            </WelcomeText>
            <TimeStamp>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </TimeStamp>
            <HeroStats>
              <HeroStatItem whileHover={{ scale: 1.02 }}>
                <StatIcon><Activity size={20} /></StatIcon>
                <StatValue>03</StatValue>
                <StatLabel>ACTIVE</StatLabel>
              </HeroStatItem>
              <HeroStatItem whileHover={{ scale: 1.02 }}>
                <StatIcon><Clock size={20} /></StatIcon>
                <StatValue>02</StatValue>
                <StatLabel>URGENT</StatLabel>
              </HeroStatItem>
              <HeroStatItem whileHover={{ scale: 1.02 }}>
                <StatIcon><TrendingUp size={20} /></StatIcon>
                <StatValue>68%</StatValue>
                <StatLabel>PROGRESS</StatLabel>
              </HeroStatItem>
            </HeroStats>
          </HeroContent>
        </HeroSection>

        {/* Metrics Grid */}
        <MetricsGrid>
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              $accent={metric.accent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <MetricHeader>
                <MetricIcon>{metric.icon}</MetricIcon>
                <MetricChange $positive={metric.positive}>
                  {metric.positive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  {metric.change}
                </MetricChange>
              </MetricHeader>
              <MetricValue>{metric.value}</MetricValue>
              <MetricLabel>{metric.label}</MetricLabel>
            </MetricCard>
          ))}
        </MetricsGrid>

        {/* Projects Section */}
        <ProjectsSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SectionHeader>
            <SectionTitle>ACTIVE_PROJECTS</SectionTitle>
            <ViewAllButton onClick={() => navigate('/films')}>
              VIEW_ALL
            </ViewAllButton>
          </SectionHeader>
          <ProjectsList>
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate(`/films/${project.id}`)}
              >
                <ProjectHeader>
                  <ProjectTitle>{project.title}</ProjectTitle>
                  <StatusBadge $status={project.status}>
                    {getStatusLabel(project.status)}
                  </StatusBadge>
                </ProjectHeader>
                <ProjectMeta>
                  <MetaItem>
                    <MetaLabel>LOCATION</MetaLabel>
                    <MetaValue>{project.location}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaLabel>DAYS_LEFT</MetaLabel>
                    <MetaValue>{project.daysLeft}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaLabel>PROGRESS</MetaLabel>
                    <MetaValue>{project.progress}%</MetaValue>
                  </MetaItem>
                </ProjectMeta>
                <ProgressBar>
                  <ProgressFill $width={project.progress} />
                </ProgressBar>
              </ProjectCard>
            ))}
          </ProjectsList>
        </ProjectsSection>

        {/* Analytics Section */}
        <AnalyticsSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <SectionHeader>
            <SectionTitle>ANALYTICS</SectionTitle>
            <ViewAllButton onClick={() => navigate('/budget')}>
              DETAILS
            </ViewAllButton>
          </SectionHeader>
          <ChartPlaceholder>
            <BarChart3 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              BUDGET_ANALYTICS_MODULE
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.625rem', opacity: 0.6, marginTop: '0.5rem' }}>
              Chart.js | D3.js Implementation
            </div>
          </ChartPlaceholder>
        </AnalyticsSection>

        {/* Timeline Section */}
        <TimelineSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <SectionHeader>
            <SectionTitle>TIMELINE</SectionTitle>
          </SectionHeader>
          {timelineEvents.map((event, index) => (
            <TimelineItem
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <TimelineDot $color={event.color} />
              <TimelineContent>
                <TimelineDate>{event.date}</TimelineDate>
                <TimelineTitle>{event.title}</TimelineTitle>
              </TimelineContent>
            </TimelineItem>
          ))}
        </TimelineSection>

        {/* Sidebar */}
        <Sidebar>
          {/* Weather Widget */}
          <SidebarWidget
            $variant="accent"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☀️</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                22°C
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                PRAGUE_SUNNY
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '1rem', opacity: 0.8 }}>
                Perfect weather for outdoor shooting
              </div>
            </div>
          </SidebarWidget>

          {/* Notifications */}
          <SidebarWidget
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
          >
            <WidgetTitle>NOTIFICATIONS</WidgetTitle>
            {notifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
              >
                <div style={{ color: '#667eea' }}>{notification.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontFamily: 'JetBrains Mono, monospace', 
                    fontSize: '0.75rem', 
                    fontWeight: 'medium',
                    marginBottom: '0.25rem'
                  }}>
                    {notification.title}
                  </div>
                  <div style={{ 
                    fontFamily: 'JetBrains Mono, monospace', 
                    fontSize: '0.625rem', 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {notification.time}
                  </div>
                </div>
              </NotificationItem>
            ))}
          </SidebarWidget>
        </Sidebar>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
