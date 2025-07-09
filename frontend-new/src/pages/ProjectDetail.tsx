import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, 
  Edit, 
  Settings, 
  Trash2, 
  Film, 
  Target, 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  Plus,
  Mail,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import { CrewAssignmentModal } from '../components/features/CrewManagement';

// Lokální typy pro ProjectDetail
interface Project {
  id: number;
  title: string;
  description: string;
  status: 'development' | 'pre_production' | 'production' | 'post_production' | 'completed' | 'cancelled';
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
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ProjectInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProjectTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'development': return theme.colors.warning + '20';
      case 'pre_production': return theme.colors.info + '20';
      case 'production': return theme.colors.success + '20';
      case 'post_production': return theme.colors.primary + '20';
      case 'completed': return theme.colors.success + '20';
      case 'cancelled': return theme.colors.error + '20';
      default: return theme.colors.neutral + '20';
    }
  }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'development': return theme.colors.warning;
      case 'pre_production': return theme.colors.info;
      case 'production': return theme.colors.success;
      case 'post_production': return theme.colors.primary;
      case 'completed': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.neutral;
    }
  }};
  border: 1px solid ${({ $status, theme }) => {
    switch ($status) {
      case 'development': return theme.colors.warning + '40';
      case 'pre_production': return theme.colors.info + '40';
      case 'production': return theme.colors.success + '40';
      case 'post_production': return theme.colors.primary + '40';
      case 'completed': return theme.colors.success + '40';
      case 'cancelled': return theme.colors.error + '40';
      default: return theme.colors.neutral + '40';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ $variant?: 'danger' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ $variant }) => $variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${({ $variant }) => $variant === 'danger' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 6px;
  color: ${({ $variant, theme }) => $variant === 'danger' ? theme.colors.error : theme.colors.text.secondary};
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $variant }) => $variant === 'danger' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.08)'};
    color: ${({ $variant, theme }) => $variant === 'danger' ? theme.colors.error : theme.colors.text.primary};
  }
`;

const TabsContainer = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
`;

const TabsList = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
`;

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: ${({ $active }) => $active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.text.primary : theme.colors.text.secondary};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const TabContent = styled.div`
  padding: 2rem;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
`;

const InfoCardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const InfoCardDescription = styled.p`
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  font-size: 0.875rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
`;

const SectionTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CrewSection = styled.div`
  margin-top: 1rem;
`;

const CrewSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const AddCrewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}dd;
  }
`;

const CrewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const CrewCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const CrewCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CrewCardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${CrewCard}:hover & {
    opacity: 1;
  }
`;

const CrewActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}20;
    border-color: ${({ theme }) => theme.colors.primary}40;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  &.danger:hover {
    background: ${({ theme }) => theme.colors.error}20;
    border-color: ${({ theme }) => theme.colors.error}40;
    color: ${({ theme }) => theme.colors.error};
  }
`;

const CrewInfo = styled.div`
  flex: 1;
`;

const CrewName = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CrewRole = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const KeyPersonnelBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary}40;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
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

  const handleSaveCrewAssignment = async (formData: any) => {
    try {
      console.log('Saving crew assignment:', formData);
      
      // Mock crew data pro mapování ID na jména
      const mockCrewMembers = [
        { id: 1, first_name: "Jana", last_name: "Svobodová", email: "jana.svobodova@email.com" },
        { id: 2, first_name: "Tomáš", last_name: "Novák", email: "tomas.novak@email.com" },
        { id: 3, first_name: "Petra", last_name: "Dvořáková", email: "petra.dvorakova@email.com" },
        { id: 4, first_name: "Martin", last_name: "Černý", email: "martin.cerny@email.com" }
      ];
      
      if (editingAssignment) {
        // EDIT MODE: Aktualizace existujícího člena
        setCrewAssignments(prev => prev.map(assignment => 
          assignment.id === editingAssignment.id 
            ? {
                ...assignment,
                role: formData.role,
                start_date: formData.start_date,
                end_date: formData.end_date,
                daily_rate: Number(formData.daily_rate),
                is_key_personnel: formData.is_key_personnel
              }
            : assignment
        ));
      } else {
        // ADD MODE: Přidání nového člena
        const selectedMember = mockCrewMembers.find(member => member.id === formData.crew_member_id);
        
        if (!selectedMember) {
          throw new Error('Člen štábu nebyl nalezen');
        }
        
        const newAssignment: CrewAssignment = {
          id: Date.now(), // Dočasné ID
          crew_member: {
            id: formData.crew_member_id,
            first_name: selectedMember.first_name,
            last_name: selectedMember.last_name,
            email: selectedMember.email,
            primary_position: {
              title: formData.role,
              department: { name: "Obecné" }
            }
          },
          role: formData.role,
          start_date: formData.start_date,
          end_date: formData.end_date,
          daily_rate: Number(formData.daily_rate),
          is_key_personnel: formData.is_key_personnel
        };
        
        setCrewAssignments(prev => [...prev, newAssignment]);
      }
      
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

  const handleRemoveCrewMember = async (assignmentId: number) => {
    try {
      if (confirm('Opravdu chcete odebrat tohoto člena z projektu?')) {
        setCrewAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
      }
    } catch (error) {
      console.error('Error removing crew member:', error);
    }
  };

  const handleEditCrewAssignment = (assignment: CrewAssignment) => {
    setEditingAssignment(assignment);
    setIsCrewModalOpen(true);
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
      </DetailContainer>
    );
  }

  if (!project) {
    return (
      <DetailContainer>
        <div>Projekt nenalezen</div>
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
            <OverviewGrid>
              <InfoCard>
                <InfoCardTitle>
                  <Film size={20} />
                  Informace o projektu
                </InfoCardTitle>
                <InfoCardDescription>
                  {project.description}
                </InfoCardDescription>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Stav projektu</InfoLabel>
                    <InfoValue>{getStatusLabel(project.status)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Doba trvání</InfoLabel>
                    <InfoValue>{calculateProjectDuration()}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Začátek natáčení</InfoLabel>
                    <InfoValue>{formatDate(project.start_date)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Konec natáčení</InfoLabel>
                    <InfoValue>{formatDate(project.end_date)}</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </InfoCard>

              <InfoCard>
                <InfoCardTitle>
                  <DollarSign size={20} />
                  Rozpočet
                </InfoCardTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Celkový rozpočet</InfoLabel>
                    <InfoValue>{formatCurrency(project.budget_total)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Náklady štábu</InfoLabel>
                    <InfoValue>{formatCurrency(calculateTotalCrewCost())}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Zbývající rozpočet</InfoLabel>
                    <InfoValue>{formatCurrency(project.budget_total - calculateTotalCrewCost())}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Využití rozpočtu</InfoLabel>
                    <InfoValue>{Math.round((calculateTotalCrewCost() / project.budget_total) * 100)}%</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </InfoCard>

              <InfoCard>
                <InfoCardTitle>
                  <MapPin size={20} />
                  Lokace
                </InfoCardTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Hlavní lokace</InfoLabel>
                    <InfoValue>{project.location_primary}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Počet lokací</InfoLabel>
                    <InfoValue>12 míst</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </InfoCard>

              <InfoCard>
                <InfoCardTitle>
                  <Users size={20} />
                  Tým
                </InfoCardTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Celkem štábu</InfoLabel>
                    <InfoValue>{crewAssignments.length} lidí</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Klíčoví pracovníci</InfoLabel>
                    <InfoValue>{crewAssignments.filter(a => a.is_key_personnel).length} lidí</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </InfoCard>
            </OverviewGrid>
          )}

          {activeTab === 'crew' && (
            <CrewSection>
              <CrewSectionHeader>
                <SectionTitle>Štáb projektu</SectionTitle>
                <AddCrewButton onClick={handleAddCrewMember}>
                  <Plus size={16} />
                  Přidat člena štábu
                </AddCrewButton>
              </CrewSectionHeader>
              
              <CrewGrid>
                {crewAssignments.map((assignment) => (
                  <CrewCard key={assignment.id}>
                    <CrewCardHeader>
                      <CrewInfo>
                        <CrewName>
                          {assignment.crew_member.first_name} {assignment.crew_member.last_name}
                        </CrewName>
                        <CrewRole>{assignment.role}</CrewRole>
                      </CrewInfo>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        {assignment.is_key_personnel && (
                          <KeyPersonnelBadge>Klíčový</KeyPersonnelBadge>
                        )}
                        <CrewCardActions>
                          <CrewActionButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCrewAssignment(assignment);
                            }}
                            title="Upravit člena"
                          >
                            <Edit size={16} />
                          </CrewActionButton>
                          <CrewActionButton 
                            className="danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCrewMember(assignment.id);
                            }}
                            title="Odebrat člena"
                          >
                            <Trash2 size={16} />
                          </CrewActionButton>
                        </CrewCardActions>
                      </div>
                    </CrewCardHeader>
                    <CrewDetails>
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

      {/* Modal se renderuje pouze když máme platný projekt */}
      {project && (
        <CrewAssignmentModal
          isOpen={isCrewModalOpen}
          onClose={() => {
            setIsCrewModalOpen(false);
            setEditingAssignment(null);
          }}
          onSave={handleSaveCrewAssignment}
          projectId={project.id}
          projectStartDate={project.start_date}
          projectEndDate={project.end_date}
          assignment={editingAssignment}
          isEditing={!!editingAssignment}
        />
      )}
    </DetailContainer>
  );
};

export default ProjectDetail;
