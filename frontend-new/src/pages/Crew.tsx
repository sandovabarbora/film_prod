import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Users, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  UserPlus,
  Building,
  Briefcase,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  AlertCircle,
  Download,
  Upload,
  Grid,
  List
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useProject } from '../contexts/ProjectContext';
import crewService from '../services/crewService';
import Button from '../components/ui/Button';
import { CrewDeleteModal, CrewAssignButton } from '../components/crew';
import { CrewEditModal } from '../components/modals';
import type { CrewMember, Department, Position } from '../types';

// Styled Components
const PageContainer = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #f9fafb;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const SearchSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SearchWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: #1a1b23;
  border: 1px solid rgba(103, 126, 234, 0.2);
  border-radius: 8px;
  color: #f9fafb;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #6b7280;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.$active ? 'rgba(102, 126, 234, 0.2)' : '#1a1b23'};
  border: 1px solid ${props => props.$active ? '#667eea' : 'rgba(103, 126, 234, 0.2)'};
  border-radius: 6px;
  color: ${props => props.$active ? '#667eea' : '#9ca3af'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: linear-gradient(135deg, #1a1b23 0%, #13141a 100%);
  border: 1px solid rgba(103, 126, 234, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
`;

const StatLabel = styled.p`
  font-size: 0.875rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.p`
  font-size: 1.75rem;
  font-weight: 700;
  color: #f9fafb;
`;

const CrewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const CrewCard = styled(motion.div)`
  background: #1a1b23;
  border: 1px solid rgba(103, 126, 234, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(103, 126, 234, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const CrewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CrewInfo = styled.div`
  flex: 1;
`;

const CrewName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #f9fafb;
  margin-bottom: 0.25rem;
`;

const CrewPosition = styled.p`
  font-size: 0.875rem;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const CrewMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #9ca3af;

  svg {
    width: 1rem;
    height: 1rem;
    color: #6b7280;
  }
`;

const MetaValue = styled.span`
  color: #e5e7eb;
`;

const DepartmentBadge = styled.div<{ $color?: string }>`
  padding: 0.25rem 0.75rem;
  background: ${props => props.$color ? `${props.$color}20` : 'rgba(102, 126, 234, 0.2)'};
  border: 1px solid ${props => props.$color || '#667eea'};
  border-radius: 9999px;
  font-size: 0.75rem;
  color: ${props => props.$color || '#667eea'};
  font-weight: 500;
`;

const CrewActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(103, 126, 234, 0.1);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
`;

const EmptyIcon = styled.div`
  margin: 0 auto 1rem;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(103, 126, 234, 0.1);
  border-radius: 50%;
  color: #667eea;
`;

const EmptyTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #f9fafb;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  color: #9ca3af;
  margin-bottom: 1.5rem;
`;

// Main Component
const Crew: React.FC = () => {
  const project = null;
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modal states
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    crewMember: CrewMember | null;
  }>({
    isOpen: false,
    crewMember: null
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    crewMember: CrewMember | null;
  }>({
    isOpen: false,
    crewMember: null
  });

  // Check if this is a project-specific crew view
  const isProjectSpecific = !!project;

  // Load data
  const loadData = useCallback(async () => {
    try {
      console.log('🔄 Loading crew data...');
      const [crewData, deptsData, posData] = await Promise.all([
        crewService.getCrewMembers(),
        crewService.getDepartments(),
        crewService.getPositions()
      ]);

      console.log('📊 Data loaded:', {
        crew: crewData.length,
        departments: deptsData.length,
        positions: posData.length
      });

      // Log sample crew member to check structure
      if (crewData.length > 0) {
        console.log('🔍 Sample crew member:', crewData[0]);
      }

      // Check for missing required fields
      const membersWithMissingFields = crewData.filter(member => 
        !member.primary_position || !member.department
      );
      if (membersWithMissingFields.length > 0) {
        console.warn('⚠️ Crew members with missing required fields:', membersWithMissingFields);
      }

      setCrewMembers(crewData);
      setDepartments(deptsData);
      setPositions(posData);
    } catch (error) {
      console.error('❌ Failed to load crew data:', error);
      toast.error('Failed to load crew data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter crew members
  const filteredCrew = crewMembers.filter(member => {
    const matchesSearch = searchQuery === '' || 
      member.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.primary_position_title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = !selectedDepartment ||
      member.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  // Calculate stats
  const stats = {
    total: crewMembers.length,
    active: crewMembers.filter(m => m.status === 'active').length,
    departments: new Set(crewMembers.map(m => m.department)).size,
    avgDailyRate: crewMembers.reduce((sum, m) => sum + (m.daily_rate || 0), 0) / crewMembers.length || 0
  };

  // Handlers
  const handleAddCrew = () => {
    setEditModal({ isOpen: true, crewMember: null });
  };

  const handleEditCrew = (member: CrewMember) => {
    setEditModal({ isOpen: true, crewMember: member });
  };

  const handleDeleteCrew = (member: CrewMember) => {
    setDeleteModal({ isOpen: true, crewMember: member });
  };

  const handleSaveCrew = async (memberData: any) => {
    try {
      console.log('💾 Saving crew member data:', memberData);
      
      // Připravit data pro backend - odstraníme undefined hodnoty
      const dataToSend = {
        first_name: memberData.first_name,
        last_name: memberData.last_name,
        email: memberData.email,
        phone_primary: memberData.phone_primary || '',
        emergency_contact_name: memberData.emergency_contact_name || '',
        emergency_contact_phone: memberData.emergency_contact_phone || '',
        daily_rate: memberData.daily_rate || null,
        union_member: memberData.union_member || false,
        has_vehicle: memberData.has_vehicle || false,
        primary_position: memberData.primary_position_id || null,  // Backend očekává 'primary_position', ne 'primary_position_id'
        notes: memberData.notes || ''
      };
      
      console.log('📤 Sending to backend:', dataToSend);
      
      if (editModal.crewMember) {
        // Update existing
        await crewService.updateCrewMember(editModal.crewMember.id, dataToSend);
        toast.success('Crew member updated successfully');
      } else {
        // Create new
        await crewService.createCrewMember(dataToSend);
        toast.success('Crew member created successfully');
      }
      
      // Reload data
      await loadData();
      
    } catch (error: any) {
      console.error('❌ Failed to save crew member:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to save crew member';
      toast.error(errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.crewMember) return;

    try {
      await crewService.deleteCrewMember(deleteModal.crewMember.id);
      toast.success('Crew member deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Failed to delete crew member:', error);
      toast.error('Failed to delete crew member');
    }
  };

  const handleAssignCrew = async (member: CrewMember) => {
    if (!project) return;
    
    try {
      await crewService.assignCrewToProduction(project.id, member.id, {
        position: member.primary_position?.id,
        start_date: new Date().toISOString(),
        status: 'confirmed'
      });
      toast.success(`${member.display_name} assigned to ${project.title}`);
      await loadData();
    } catch (error) {
      console.error('Failed to assign crew:', error);
      toast.error('Failed to assign crew member');
    }
  };

  const handleUnassignCrew = async (member: CrewMember) => {
    if (!project) return;
    
    try {
      // Find the assignment
      const assignment = member.current_assignments?.find(
        a => a.production === project.id
      );
      
      if (assignment) {
        await crewService.removeCrewFromProduction(project.id, assignment.id);
        toast.success(`${member.display_name} removed from ${project.title}`);
        await loadData();
      }
    } catch (error) {
      console.error('Failed to unassign crew:', error);
      toast.error('Failed to remove crew member');
    }
  };

  const handleExportCrew = () => {
    // TODO: Implement CSV export
    toast.success('Export functionality coming soon');
  };

  const handleImportCrew = () => {
    // TODO: Implement CSV import
    toast.success('Import functionality coming soon');
  };

  return (
    <PageContainer>
      <PageHeader>
        <HeaderTop>
          <Title>
            <Users size={28} />
            {isProjectSpecific ? `${project.title} - Crew` : 'Crew Management'}
          </Title>
          <HeaderActions>
            <Button
              variant="ghost"
              size="sm"
              icon={<Download size={16} />}
              onClick={handleExportCrew}
            >
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Upload size={16} />}
              onClick={handleImportCrew}
            >
              Import
            </Button>
            <Button
              icon={<UserPlus size={16} />}
              onClick={handleAddCrew}
            >
              Add Crew Member
            </Button>
          </HeaderActions>
        </HeaderTop>

        <SearchSection>
          <SearchWrapper>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search crew members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchWrapper>
          <FilterBar>
            <FilterButton
              $active={!selectedDepartment}
              onClick={() => setSelectedDepartment(null)}
            >
              <Building size={16} />
              All Departments
            </FilterButton>
            {departments.map(dept => (
              <FilterButton
                key={dept.id}
                $active={selectedDepartment === dept.name}
                onClick={() => setSelectedDepartment(dept.name)}
              >
                {dept.name}
              </FilterButton>
            ))}
          </FilterBar>
          <FilterBar>
            <FilterButton
              $active={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </FilterButton>
            <FilterButton
              $active={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </FilterButton>
          </FilterBar>
        </SearchSection>
      </PageHeader>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StatLabel>Total Crew</StatLabel>
          <StatValue>{stats.total}</StatValue>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatLabel>Active Members</StatLabel>
          <StatValue>{stats.active}</StatValue>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatLabel>Departments</StatLabel>
          <StatValue>{stats.departments}</StatValue>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatLabel>Avg. Daily Rate</StatLabel>
          <StatValue>${Math.round(stats.avgDailyRate)}</StatValue>
        </StatCard>
      </StatsGrid>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        {loading ? (
          <EmptyState>
            <EmptyTitle>Loading crew members...</EmptyTitle>
          </EmptyState>
        ) : filteredCrew.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <Users size={32} />
            </EmptyIcon>
            <EmptyTitle>No crew members found</EmptyTitle>
            <EmptyText>
              {searchQuery || selectedDepartment
                ? 'Try adjusting your filters'
                : 'Add your first crew member to get started'}
            </EmptyText>
            <Button icon={<Plus size={16} />} onClick={handleAddCrew}>
              Add Crew Member
            </Button>
          </EmptyState>
        ) : (
          <CrewGrid>
            <AnimatePresence>
              {filteredCrew.map((member, index) => {
                const isAssigned = isProjectSpecific && project && 
                  member.current_assignments?.some(a => a.production === project.id);
                
                return (
                  <CrewCard
                    key={member.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <CrewHeader>
                      <CrewInfo>
                        <CrewName>{member.display_name || `${member.first_name} ${member.last_name}`}</CrewName>
                        <CrewPosition>{member.primary_position_title || 'No position'}</CrewPosition>
                        <CrewMeta>
                          <MetaItem>
                            <Mail size={14} />
                            <MetaValue>{member.email || 'No email'}</MetaValue>
                          </MetaItem>
                          <MetaItem>
                            <Phone size={14} />
                            <MetaValue>{member.phone_primary || 'No phone'}</MetaValue>
                          </MetaItem>
                          {member.daily_rate && (
                            <MetaItem>
                              <DollarSign size={14} />
                              <MetaValue>${member.daily_rate}/day</MetaValue>
                            </MetaItem>
                          )}
                        </CrewMeta>
                      </CrewInfo>
                      
                      {member.department && (
                        <DepartmentBadge>
                          {member.department}
                        </DepartmentBadge>
                      )}
                    </CrewHeader>

                    <CrewActions>
                      {isProjectSpecific && project && (
                        <CrewAssignButton
                          crewMember={member}
                          project={project}
                          isAssigned={isAssigned}
                          onAssign={handleAssignCrew}
                          onUnassign={handleUnassignCrew}
                        />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit3 size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCrew(member);
                        }}
                      >
                        Edit
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCrew(member);
                        }}
                      >
                        Delete
                      </Button>
                    </CrewActions>
                  </CrewCard>
                );
              })}
            </AnimatePresence>
          </CrewGrid>
        )}
      </motion.div>

      {/* Modals */}
      <CrewEditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, crewMember: null })}
        crewMember={editModal.crewMember}
        positions={positions}
        departments={departments}
        onSave={handleSaveCrew}
      />

      <CrewDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, crewMember: null })}
        crewMember={deleteModal.crewMember}
        onDelete={handleConfirmDelete}
      />
    </PageContainer>
  );
};

export default Crew;
