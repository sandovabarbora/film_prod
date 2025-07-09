import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import CrewAssignmentModal from '../components/features/CrewAssignmentModal/CrewAssignmentModal';
import { 
  ArrowLeft, Film, Users, Calendar, DollarSign, MapPin, 
  Settings, Plus, Edit, Trash2, Clock, Target, Activity
} from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  budget_total: number;
  location_primary: string;
  created_at: string;
}

interface CrewAssignment {
  id: number;
  crew_member: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    primary_position: {
      title: string;
      department: {
        name: string;
      };
    };
  };
  role: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  is_key_personnel: boolean;
}

const DetailContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ProjectInfo = styled.div`
  flex: 1;
`;

const ProjectTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
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

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary': return theme.colors.primary;
      case 'danger': return theme.colors.error;
      default: return 'transparent';
    }
  }};
  color: ${({ $variant }) => 
    $variant ? 'white' : ({ theme }) => theme.colors.text.secondary
  };
  border: 1px solid ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary': return theme.colors.primary;
      case 'danger': return theme.colors.error;
      default: return theme.colors.border;
    }
  }};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const TabsContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabsList = styled.div`
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 1.5rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ $active, theme }) => 
    $active ? theme.colors.primary + '10' : 'transparent'
  };
  color: ${({ $active, theme }) => 
    $active ? theme.colors.primary : theme.colors.text.secondary
  };
  border: none;
  border-bottom: 2px solid ${({ $active, theme }) => 
    $active ? theme.colors.primary : 'transparent'
  };
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary + '05'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const TabContent = styled.div`
  min-height: 400px;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
`;

const InfoCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const InfoCardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const InfoCardValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const InfoCardDescription = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const CrewSection = styled.div``;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CrewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const CrewCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const CrewMemberName = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
`;

const CrewRole = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: ${({ theme }) => theme.colors.primary + '10'};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
`;

const CrewDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [crewAssignments, setCrewAssignments] = useState<CrewAssignment[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<CrewAssignment | null>(null);

  useEffect(() => {
    if (id) {
      fetchProjectDetail(parseInt(id));
    }
  }, [id]);

  const fetchProjectDetail = async (projectId: number) => {
    setIsLoading(true);
    try {
      // Mock data - replace with real API calls
      const mockProject: Project = {
        id: projectId,
        title: "Sunset Boulevard",
        description: "A gripping drama about the golden age of Hollywood, following an aging star's desperate attempt to reclaim her fame. Set in 1950s Los Angeles, this project explores themes of fame, aging, and the ruthless nature of the entertainment industry.",
        status: "production",
        start_date: "2025-06-01",
        end_date: "2025-09-15",
        budget_total: 15000000,
        location_primary: "Los Angeles, CA",
        created_at: "2025-05-15T10:00:00Z"
      };

      const mockCrewAssignments: CrewAssignment[] = [
        {
          id: 1,
          crew_member: {
            id: 1,
            first_name: "Jana",
            last_name: "Svobodová",
            email: "jana.svobodova@email.com",
            primary_position: {
              title: "Režisérka",
              department: { name: "Režie" }
            }
          },
          role: "Hlavní režisérka",
          start_date: "2025-06-01",
          end_date: "2025-09-15",
          daily_rate: 2500,
          is_key_personnel: true
        },
        {
          id: 2,
          crew_member: {
            id: 2,
            first_name: "Tomáš",
            last_name: "Novák",
            email: "tomas.novak@email.com",
            primary_position: {
              title: "Kameraman",
              department: { name: "Kamera" }
            }
          },
          role: "Hlavní kameraman",
          start_date: "2025-06-01",
          end_date: "2025-09-15",
          daily_rate: 1800,
          is_key_personnel: true
        }
      ];

      setProject(mockProject);
      setCrewAssignments(mockCrewAssignments);
    } catch (error) {
      console.error('Error fetching project detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      month: 'long',
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

  const calculateProjectDuration = () => {
    if (!project) return '0 dní';
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} dní`;
  };

  const calculateTotalCrewCost = () => {
    return crewAssignments.reduce((total, assignment) => {
      const start = new Date(assignment.start_date);
      const end = new Date(assignment.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return total + (assignment.daily_rate * days);
    }, 0);
  };

  if (isLoading) {
    return (
      <DetailContainer>
        <LoadingState>Načítání detailu projektu...</LoadingState>
        <CrewAssignmentModal
        isOpen={isCrewModalOpen}
        onClose={() => {
          setIsCrewModalOpen(false);
          setEditingAssignment(null);
        }}
        onSave={handleSaveCrewAssignment}
        projectId={project.id}
        assignment={editingAssignment}
        isEditing={!!editingAssignment}
      />
    </DetailContainer>
    );
  }

  if (!project) {
    return (
      <DetailContainer>
        <div>Projekt nenalezen</div>
        <CrewAssignmentModal
        isOpen={isCrewModalOpen}
        onClose={() => {
          setIsCrewModalOpen(false);
          setEditingAssignment(null);
        }}
        onSave={handleSaveCrewAssignment}
        projectId={project.id}
        assignment={editingAssignment}
        isEditing={!!editingAssignment}
      />
    </DetailContainer>
    );
  }

  return (
    <DetailContainer>
      <Header>
        <BackButton onClick={() => navigate('/films')}>
          <ArrowLeft size={16} />
          Zpět na projekty
        </BackButton>
        
        <ProjectInfo>
          <ProjectTitle>
            <Film size={32} />
            {project.title}
            <StatusBadge $status={project.status}>
              {getStatusLabel(project.status)}
            </StatusBadge>
          </ProjectTitle>
        </ProjectInfo>

        <ActionButtons>
          <ActionButton>
            <Edit size={16} />
            Upravit
          </ActionButton>
          <ActionButton>
            <Settings size={16} />
            Nastavení
          </ActionButton>
          <ActionButton $variant="danger">
            <Trash2 size={16} />
            Smazat
          </ActionButton>
        </ActionButtons>
      </Header>

      <TabsContainer>
        <TabsList>
          <Tab 
            $active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            <Target size={16} />
            Přehled
          </Tab>
          <Tab 
            $active={activeTab === 'crew'} 
            onClick={() => setActiveTab('crew')}
          >
            <Users size={16} />
            Štáb ({crewAssignments.length})
          </Tab>
          <Tab 
            $active={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar size={16} />
            Harmonogram
          </Tab>
          <Tab 
            $active={activeTab === 'budget'} 
            onClick={() => setActiveTab('budget')}
          >
            <DollarSign size={16} />
            Rozpočet
          </Tab>
          <Tab 
            $active={activeTab === 'activity'} 
            onClick={() => setActiveTab('activity')}
          >
            <Activity size={16} />
            Aktivita
          </Tab>
        </TabsList>

        <TabContent>
          {activeTab === 'overview' && (
            <>
              <InfoCardDescription style={{ marginBottom: '2rem', fontSize: '1rem' }}>
                {project.description}
              </InfoCardDescription>
              
              <OverviewGrid>
                <InfoCard>
                  <InfoCardHeader>
                    <DollarSign size={20} />
                    <InfoCardTitle>Celkový rozpočet</InfoCardTitle>
                  </InfoCardHeader>
                  <InfoCardValue>{formatCurrency(project.budget_total)}</InfoCardValue>
                  <InfoCardDescription>
                    Náklady na štáb: {formatCurrency(calculateTotalCrewCost())}
                  </InfoCardDescription>
                </InfoCard>

                <InfoCard>
                  <InfoCardHeader>
                    <Clock size={20} />
                    <InfoCardTitle>Doba realizace</InfoCardTitle>
                  </InfoCardHeader>
                  <InfoCardValue>{calculateProjectDuration()}</InfoCardValue>
                  <InfoCardDescription>
                    {formatDate(project.start_date)} - {formatDate(project.end_date)}
                  </InfoCardDescription>
                </InfoCard>

                <InfoCard>
                  <InfoCardHeader>
                    <MapPin size={20} />
                    <InfoCardTitle>Hlavní lokace</InfoCardTitle>
                  </InfoCardHeader>
                  <InfoCardValue>{project.location_primary}</InfoCardValue>
                  <InfoCardDescription>
                    Primární místo natáčení
                  </InfoCardDescription>
                </InfoCard>

                <InfoCard>
                  <InfoCardHeader>
                    <Users size={20} />
                    <InfoCardTitle>Štáb</InfoCardTitle>
                  </InfoCardHeader>
                  <InfoCardValue>{crewAssignments.length} lidí</InfoCardValue>
                  <InfoCardDescription>
                    {crewAssignments.filter(a => a.is_key_personnel).length} klíčových pozic
                  </InfoCardDescription>
                </InfoCard>
              </OverviewGrid>
            </>
          )}

          {activeTab === 'crew' && (
            <CrewSection>
              <SectionHeader>
                <SectionTitle>Přiřazený štáb</SectionTitle>
                <ActionButton $variant="primary" onClick={handleAddCrewMember}>
                  <Plus size={16} />
                  Přidat člena štábu
                </ActionButton>
              </SectionHeader>

              <CrewGrid>
                {crewAssignments.map((assignment) => (
                  <CrewCard key={assignment.id} onClick={() => handleEditCrewAssignment(assignment)}>
                    <CrewMemberName>
                      {assignment.crew_member.first_name} {assignment.crew_member.last_name}
                      {assignment.is_key_personnel && ' ⭐'}
                    </CrewMemberName>
                    <CrewRole>{assignment.role}</CrewRole>
                    <CrewDetails>
                      <div>
                        <strong>Oddělení:</strong><br />
                        {assignment.crew_member.primary_position.department.name}
                      </div>
                      <div>
                        <strong>Denní sazba:</strong><br />
                        {formatCurrency(assignment.daily_rate)}
                      </div>
                      <div>
                        <strong>Email:</strong><br />
                        {assignment.crew_member.email}
                      </div>
                      <div>
                        <strong>Období:</strong><br />
                        {formatDate(assignment.start_date)} - {formatDate(assignment.end_date)}
                      </div>
                    </CrewDetails>
                  </CrewCard>
                ))}
              </CrewGrid>
            </CrewSection>
          )}

          {activeTab === 'schedule' && (
            <div>
              <SectionTitle>Harmonogram natáčení</SectionTitle>
              <InfoCardDescription>Harmonogram bude implementován v další verzi.</InfoCardDescription>
            </div>
          )}

          {activeTab === 'budget' && (
            <div>
              <SectionTitle>Rozpočet projektu</SectionTitle>
              <InfoCardDescription>Rozpočet bude implementován v další verzi.</InfoCardDescription>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <SectionTitle>Aktivita na projektu</SectionTitle>
              <InfoCardDescription>Log aktivit bude implementován v další verzi.</InfoCardDescription>
            </div>
          )}
        </TabContent>
      </TabsContainer>
      <CrewAssignmentModal
        isOpen={isCrewModalOpen}
        onClose={() => {
          setIsCrewModalOpen(false);
          setEditingAssignment(null);
        }}
        onSave={handleSaveCrewAssignment}
        projectId={project.id}
        assignment={editingAssignment}
        isEditing={!!editingAssignment}
      />
    </DetailContainer>
  );
};

export default ProjectDetail;

  const handleSaveCrewAssignment = async (formData: any) => {
    try {
      // Mock save - replace with real API call
      console.log('Saving crew assignment:', formData);
      await fetchProjectDetail(project!.id); // Refresh data
      setIsCrewModalOpen(false);
      setEditingAssignment(null);
    } catch (error) {
      console.error('Error saving crew assignment:', error);
      throw error;
    }
  };

  const handleAddCrewMember = () => {
    setEditingAssignment(null);
    setIsCrewModalOpen(true);
  };

  const handleEditCrewAssignment = (assignment: CrewAssignment) => {
    setEditingAssignment(assignment);
    setIsCrewModalOpen(true);
  };
