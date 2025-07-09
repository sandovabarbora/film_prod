// src/pages/Schedule.tsx - Fixed API Error Handling
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Calendar, Clock, Users, MapPin, AlertCircle, Loader2, Plus } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { ScheduleView } from '../components/features/Schedule';
import { ProjectTimeline } from '../components/features/ProjectTimeline';
import Loading from '../components/common/Loading';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// Types - konzistentní s Django modely
interface ShootingDay {
  id: string;
  production: string;
  shoot_date: string;
  day_number: number;
  general_call: string;
  shooting_call: string;
  estimated_wrap?: string;
  actual_wrap?: string;
  primary_location?: {
    id: string;
    name: string;
    address: string;
  };
  weather_forecast: string;
  sunrise?: string;
  sunset?: string;
  notes: string;
  special_requirements: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  total_scenes: number;
  total_pages: number;
  scene_schedules: SceneSchedule[];
}

interface SceneSchedule {
  id: string;
  scene: {
    id: string;
    scene_number: string;
    scene_name: string;
    estimated_pages: number;
    location?: string;
  };
  day_order: number;
  estimated_start: string;
  estimated_duration: string;
  actual_start?: string;
  actual_end?: string;
  status: 'scheduled' | 'setup' | 'rehearsal' | 'shooting' | 'completed' | 'postponed' | 'cancelled';
  setup_notes: string;
  completion_notes: string;
}

interface StatusUpdate {
  id: string;
  update_type: 'day_start' | 'first_shot' | 'scene_complete' | 'meal_break' | 'back_from_meal' | 'company_move' | 'weather_hold' | 'wrap' | 'general';
  current_scene?: {
    id: string;
    scene_number: string;
    scene_name: string;
  };
  message: string;
  timestamp: string;
  scenes_completed: number;
  setups_completed: number;
  pages_shot: number;
  posted_by?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface ProductionCalendar {
  production_id: string;
  prep_start?: string;
  prep_end?: string;
  principal_start?: string;
  principal_end?: string;
  post_start?: string;
  post_end?: string;
  wrap_date?: string;
  total_shoot_days: number;
  total_prep_days: number;
  total_post_days: number;
}

// Styled Components
const PageContainer = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: #0f1015;
  color: #f9fafb;
  font-family: 'JetBrains Mono', monospace;
`;

const BackButton = styled(Button)`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  margin: 1rem 0 2rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #667eea;
`;

const ProjectInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled(Card)`
  padding: 1rem;
  text-align: center;
`;

const InfoLabel = styled.div`
  font-size: 0.75rem;
  color: #8b8b8b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active 
    ? 'rgba(103, 126, 234, 0.2)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.$active 
    ? 'rgba(103, 126, 234, 0.4)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 8px;
  color: ${props => props.$active ? '#667eea' : '#8b8b8b'};
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active 
      ? 'rgba(103, 126, 234, 0.3)' 
      : 'rgba(255, 255, 255, 0.1)'
    };
  }
`;

const ErrorCard = styled(Card)`
  padding: 2rem;
  text-align: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
`;

const LoadingCard = styled(Card)`
  padding: 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #8b8b8b;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const MockDataNotice = styled.div`
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #fb923c;
  font-size: 0.875rem;
  text-align: center;
`;

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const { project, isLoading: projectLoading, error: projectError } = useProject();
  
  // Schedule data state
  const [shootingDays, setShootingDays] = useState<ShootingDay[]>([]);
  const [productionCalendar, setProductionCalendar] = useState<ProductionCalendar | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  
  // UI state
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');

  // Mock data
  const getMockScheduleData = () => {
    return {
      shootingDays: [
        {
          id: '1',
          production: project?.id || '1',
          shoot_date: '2024-03-15',
          day_number: 1,
          general_call: '06:00',
          shooting_call: '08:00',
          estimated_wrap: '18:00',
          primary_location: {
            id: '1',
            name: 'Studio A',
            address: 'Prague Studios, Czech Republic'
          },
          weather_forecast: 'Sunny, 15°C',
          notes: 'Interior scenes',
          special_requirements: 'Special lighting setup',
          status: 'scheduled' as const,
          total_scenes: 5,
          total_pages: 8,
          scene_schedules: [
            {
              id: '1',
              scene: {
                id: '1',
                scene_number: '1A',
                scene_name: 'Opening scene',
                estimated_pages: 2
              },
              day_order: 1,
              estimated_start: '08:00',
              estimated_duration: '02:00',
              status: 'scheduled' as const,
              setup_notes: '',
              completion_notes: ''
            }
          ]
        }
      ],
      productionCalendar: {
        production_id: project?.id || '1',
        prep_start: '2024-03-01',
        prep_end: '2024-03-14',
        principal_start: '2024-03-15',
        principal_end: '2024-04-30',
        post_start: '2024-05-01',
        post_end: '2024-07-15',
        wrap_date: '2024-07-15',
        total_shoot_days: 45,
        total_prep_days: 14,
        total_post_days: 75
      },
      statusUpdates: [
        {
          id: '1',
          update_type: 'general' as const,
          message: 'Prep started successfully',
          timestamp: '2024-03-01T09:00:00Z',
          scenes_completed: 0,
          setups_completed: 0,
          pages_shot: 0
        }
      ]
    };
  };

  // FIXED: Safe API fetch with proper error handling
  const fetchScheduleData = async (projectId: string) => {
    try {
      setScheduleLoading(true);
      setScheduleError(null);
      setIsUsingMockData(false);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // FIXED: Konzistentní API endpointy
      const endpoints = [
        `${apiUrl}/api/v1/production/productions/${projectId}/shooting-days/`,
        `${apiUrl}/api/v1/production/productions/${projectId}/calendar/`,
        `${apiUrl}/api/v1/production/productions/${projectId}/status-updates/`
      ];

      const responses = await Promise.allSettled(
        endpoints.map(url => fetch(url, { headers }))
      );

      // Check if at least one endpoint is working
      const hasWorkingEndpoint = responses.some(result => 
        result.status === 'fulfilled' && result.value.ok
      );

      if (!hasWorkingEndpoint) {
        throw new Error('All schedule API endpoints failed');
      }

      // Process responses with fallbacks
      const [shootingDaysRes, calendarRes, statusUpdatesRes] = responses;

      let shootingDaysData = [];
      let calendarData = null;
      let statusUpdatesData = [];

      // Process each response safely
      if (shootingDaysRes.status === 'fulfilled' && shootingDaysRes.value.ok) {
        try {
          const text = await shootingDaysRes.value.text();
          const data = JSON.parse(text);
          shootingDaysData = data.results || data || [];
        } catch (parseError) {
          console.warn('Failed to parse shooting days data:', parseError);
        }
      }

      if (calendarRes.status === 'fulfilled' && calendarRes.value.ok) {
        try {
          const text = await calendarRes.value.text();
          calendarData = JSON.parse(text);
        } catch (parseError) {
          console.warn('Failed to parse calendar data:', parseError);
        }
      }

      if (statusUpdatesRes.status === 'fulfilled' && statusUpdatesRes.value.ok) {
        try {
          const text = await statusUpdatesRes.value.text();
          const data = JSON.parse(text);
          statusUpdatesData = data.results || data || [];
        } catch (parseError) {
          console.warn('Failed to parse status updates data:', parseError);
        }
      }

      setShootingDays(shootingDaysData);
      setProductionCalendar(calendarData);
      setStatusUpdates(statusUpdatesData);

    } catch (error) {
      console.error('Error fetching schedule data:', error);
      
      // Fallback to mock data
      console.log('🎯 Using mock schedule data as fallback');
      const mockData = getMockScheduleData();
      setShootingDays(mockData.shootingDays);
      setProductionCalendar(mockData.productionCalendar);
      setStatusUpdates(mockData.statusUpdates);
      setIsUsingMockData(true);
      
      setScheduleError(`API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setScheduleLoading(false);
    }
  };

  // Fetch schedule data when project loads
  useEffect(() => {
    if (project?.id) {
      fetchScheduleData(project.id);
    }
  }, [project?.id]);

  const handleBackToProject = () => {
    if (project) {
      navigate(`/films/${project.id}`);
    } else {
      navigate('/films');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilStart = () => {
    if (!productionCalendar?.principal_start) return null;
    const startDate = new Date(productionCalendar.principal_start);
    const today = new Date();
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getScheduleStats = () => {
    const totalDays = shootingDays.length;
    const completedDays = shootingDays.filter(day => day.status === 'completed').length;
    const totalScenes = shootingDays.reduce((sum, day) => sum + day.total_scenes, 0);
    const totalPages = shootingDays.reduce((sum, day) => sum + day.total_pages, 0);
    
    return { totalDays, completedDays, totalScenes, totalPages };
  };

  // Event handlers for schedule interactions
  const handleEventSelect = (eventId: string) => {
    console.log('🎯 Event selected:', eventId);
  };

  const handleEventCreate = (eventData: any) => {
    console.log('🎯 Creating event:', eventData);
  };

  const handleEventUpdate = (eventId: string, eventData: any) => {
    console.log('🎯 Updating event:', eventId, eventData);
  };

  // Transform data for components
  const calculateEndTime = (startTime: string, duration: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const [hours, minutes] = duration.split(':').map(Number);
    start.setHours(start.getHours() + hours);
    start.setMinutes(start.getMinutes() + minutes);
    return start.toTimeString().slice(0, 5);
  };

  const scheduleViewEvents = shootingDays.flatMap(day =>
    day.scene_schedules.map(schedule => ({
      id: schedule.id,
      title: `Scene ${schedule.scene.scene_number}: ${schedule.scene.scene_name}`,
      date: day.shoot_date,
      start_time: schedule.estimated_start,
      end_time: schedule.actual_end || calculateEndTime(schedule.estimated_start, schedule.estimated_duration),
      location: schedule.scene.location || day.primary_location?.name || 'TBD',
      event_type: 'scene',
      crew_assigned: [],
      equipment_needed: [],
      status: schedule.status,
      priority: day.status === 'in_progress' ? 'high' : 'medium'
    }))
  );

  const timelineData = {
    tasks: shootingDays.map(day => ({
      id: day.id,
      title: `Day ${day.day_number} - ${formatDate(day.shoot_date)}`,
      description: `${day.total_scenes} scenes, ${day.total_pages} pages`,
      startDate: day.shoot_date,
      endDate: day.shoot_date,
      duration: 1,
      progress: day.status === 'completed' ? 100 : day.status === 'in_progress' ? 50 : 0,
      status: day.status === 'completed' ? 'completed' as const : 
               day.status === 'in_progress' ? 'in_progress' as const : 'pending' as const,
      assignedTo: [],
      dependencies: []
    })),
    milestones: productionCalendar ? [
      {
        id: 'prep_start',
        title: 'Prep Start',
        date: productionCalendar.prep_start || '',
        type: 'start' as const,
        completed: true
      },
      {
        id: 'principal_start',
        title: 'Principal Photography',
        date: productionCalendar.principal_start || '',
        type: 'major' as const,
        completed: false
      },
      {
        id: 'wrap',
        title: 'Production Wrap',
        date: productionCalendar.wrap_date || '',
        type: 'end' as const,
        completed: false
      }
    ] : []
  };

  if (projectLoading) {
    return <Loading />;
  }

  if (projectError || !project) {
    return (
      <PageContainer>
        <ErrorCard>
          <AlertCircle size={32} style={{ margin: '0 auto 1rem' }} />
          <h3>Chyba při načítání projektu</h3>
          <p>{projectError || 'Project not found'}</p>
          <Button onClick={() => navigate('/films')} style={{ marginTop: '1rem' }}>
            Zpět na projekty
          </Button>
        </ErrorCard>
      </PageContainer>
    );
  }

  const stats = getScheduleStats();
  const daysUntilStart = getDaysUntilStart();

  return (
    <PageContainer>
      <BackButton 
        variant="ghost" 
        icon={<ArrowLeft size={16} />} 
        onClick={handleBackToProject}
      >
        Zpět na projekt
      </BackButton>

      <PageTitle>
        {project.title} • Harmonogram
      </PageTitle>

      {isUsingMockData && (
        <MockDataNotice>
          ⚠️ API nedostupné • Zobrazují se mock data pro demonstraci
        </MockDataNotice>
      )}

      <ProjectInfo>
        <InfoCard>
          <InfoLabel>Celkem dní natáčení</InfoLabel>
          <InfoValue>
            <Calendar size={16} />
            {stats.totalDays}
          </InfoValue>
        </InfoCard>

        <InfoCard>
          <InfoLabel>Dokončené dny</InfoLabel>
          <InfoValue>
            <Clock size={16} />
            {stats.completedDays}/{stats.totalDays}
          </InfoValue>
        </InfoCard>

        <InfoCard>
          <InfoLabel>Celkem scén</InfoLabel>
          <InfoValue>
            <MapPin size={16} />
            {stats.totalScenes}
          </InfoValue>
        </InfoCard>

        {daysUntilStart !== null && (
          <InfoCard>
            <InfoLabel>
              {daysUntilStart > 0 ? 'Dní do začátku' : 'Natáčení'}
            </InfoLabel>
            <InfoValue>
              <Users size={16} />
              {daysUntilStart > 0 ? `${daysUntilStart} dní` : 'Probíhá'}
            </InfoValue>
          </InfoCard>
        )}
      </ProjectInfo>

      <ViewToggle>
        <ToggleButton 
          $active={viewMode === 'calendar'} 
          onClick={() => setViewMode('calendar')}
        >
          📅 Kalendář
        </ToggleButton>
        <ToggleButton 
          $active={viewMode === 'timeline'} 
          onClick={() => setViewMode('timeline')}
        >
          📊 Timeline
        </ToggleButton>
      </ViewToggle>

      {scheduleLoading ? (
        <LoadingCard>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
          <p>Načítání harmonogramu...</p>
        </LoadingCard>
      ) : (
        <ContentContainer>
          {viewMode === 'calendar' && (
            <ScheduleView 
              events={scheduleViewEvents}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
              onEventUpdate={handleEventUpdate}
            />
          )}

          {viewMode === 'timeline' && (
            <ProjectTimeline
              projectId={project.id}
              timeline={timelineData}
              onTaskUpdate={(taskId, updates) => console.log('Update task:', taskId, updates)}
              onMilestoneUpdate={(milestoneId, updates) => console.log('Update milestone:', milestoneId, updates)}
              onAddTask={(task) => console.log('Add task:', task)}
              onAddMilestone={(milestone) => console.log('Add milestone:', milestone)}
            />
          )}

          {scheduleError && !isUsingMockData && (
            <ErrorCard style={{ marginTop: '2rem' }}>
              <AlertCircle size={24} style={{ margin: '0 auto 1rem' }} />
              <h4>Problém s načítáním dat</h4>
              <p>{scheduleError}</p>
              <Button onClick={() => fetchScheduleData(project.id)} style={{ marginTop: '1rem' }}>
                Zkusit znovu
              </Button>
            </ErrorCard>
          )}
        </ContentContainer>
      )}
    </PageContainer>
  );
};

export default Schedule;
