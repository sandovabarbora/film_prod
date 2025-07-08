// src/components/features/TeamManagement/TeamManagement.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';
import { PrimaryButton, OutlineButton, SecondaryButton } from '../../ui/Button';
import type { TeamMember } from '../../../types/project';

interface TeamManagementProps {
  projectId: string;
  team: {
    total: number;
    active: number;
    roles: TeamMember[];
  };
}

export function TeamManagement({ projectId, team }: TeamManagementProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Mock team data
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      userId: 'user1',
      name: 'Jana Nováková',
      email: 'jana@example.com',
      role: 'Režisér',
      department: 'Režie',
      joinedAt: '2024-03-01',
      status: 'active',
      permissions: ['read', 'write', 'manage']
    },
    {
      id: '2',
      userId: 'user2',
      name: 'Petr Svoboda',
      email: 'petr@example.com',
      role: 'Producent',
      department: 'Produkce',
      joinedAt: '2024-03-01',
      status: 'active',
      permissions: ['read', 'write', 'manage', 'admin']
    },
    {
      id: '3',
      userId: 'user3',
      name: 'Tomáš Dvořák',
      email: 'tomas@example.com',
      role: 'Kameraman',
      department: 'Kamera',
      joinedAt: '2024-03-15',
      status: 'active',
      permissions: ['read', 'write']
    },
    {
      id: '4',
      userId: 'user4',
      name: 'Marie Svobodová',
      email: 'marie@example.com',
      role: 'Střihač',
      department: 'Postprodukce',
      joinedAt: '2024-04-01',
      status: 'pending',
      permissions: ['read']
    }
  ];

  const getStatusColor = (status: TeamMember['status']) => {
    const colors = {
      active: '#48BB78',
      inactive: '#A0AEC0',
      pending: '#ED8936'
    };
    return colors[status];
  };

  const getStatusLabel = (status: TeamMember['status']) => {
    const labels = {
      active: 'Aktivní',
      inactive: 'Neaktivní',
      pending: 'Čeká na potvrzení'
    };
    return labels[status];
  };

  const getDepartmentIcon = (department: string) => {
    const icons: Record<string, string> = {
      'Režie': '🎬',
      'Produkce': '💼',
      'Kamera': '📹',
      'Osvětlení': '💡',
      'Zvuk': '🎵',
      'Střih': '✂️',
      'Postprodukce': '🎨',
      'Casting': '👥',
      'Kostým': '👗',
      'Scénografie': '🏗️'
    };
    return icons[department] || '👤';
  };

  return (
    <TeamContainer>
      {/* Team Overview */}
      <TeamHeader>
        <HeaderLeft>
          <TeamTitle>Správa týmu</TeamTitle>
          <TeamStats>
            <StatItem>
              <StatIcon>👥</StatIcon>
              <StatValue>{team.active}</StatValue>
              <StatLabel>Aktivní členové</StatLabel>
            </StatItem>
            <StatItem>
              <StatIcon>⏳</StatIcon>
              <StatValue>{teamMembers.filter(m => m.status === 'pending').length}</StatValue>
              <StatLabel>Čeká na potvrzení</StatLabel>
            </StatItem>
            <StatItem>
              <StatIcon>🏢</StatIcon>
              <StatValue>{new Set(teamMembers.map(m => m.department)).size}</StatValue>
              <StatLabel>Oddělení</StatLabel>
            </StatItem>
          </TeamStats>
        </HeaderLeft>
        
        <HeaderActions>
          <OutlineButton>📤 Exportovat</OutlineButton>
          <PrimaryButton onClick={() => setShowAddMember(true)}>
            + Přidat člena
          </PrimaryButton>
        </HeaderActions>
      </TeamHeader>

      {/* Team Grid */}
      <TeamGrid>
        {teamMembers.map(member => (
          <MemberCard key={member.id} onClick={() => setSelectedMember(member)}>
            <MemberHeader>
              <MemberAvatar>
                {member.name.split(' ').map(n => n[0]).join('')}
              </MemberAvatar>
              <MemberInfo>
                <MemberName>{member.name}</MemberName>
                <MemberRole>{member.role}</MemberRole>
              </MemberInfo>
              <StatusBadge $color={getStatusColor(member.status)}>
                {getStatusLabel(member.status)}
              </StatusBadge>
            </MemberHeader>

            <MemberDetails>
              <DetailRow>
                <DetailIcon>{getDepartmentIcon(member.department)}</DetailIcon>
                <DetailText>{member.department}</DetailText>
              </DetailRow>
              <DetailRow>
                <DetailIcon>📧</DetailIcon>
                <DetailText>{member.email}</DetailText>
              </DetailRow>
              <DetailRow>
                <DetailIcon>📅</DetailIcon>
                <DetailText>
                  Připojen {new Date(member.joinedAt).toLocaleDateString('cs-CZ')}
                </DetailText>
              </DetailRow>
            </MemberDetails>

            <MemberActions>
              <ActionButton>✏️</ActionButton>
              <ActionButton>💬</ActionButton>
              <ActionButton $danger>🗑️</ActionButton>
            </MemberActions>
          </MemberCard>
        ))}

        {/* Add Member Card */}
        <AddMemberCard onClick={() => setShowAddMember(true)}>
          <AddIcon>+</AddIcon>
          <AddText>Přidat nového člena</AddText>
        </AddMemberCard>
      </TeamGrid>

      {/* Department View */}
      <DepartmentSection>
        <SectionTitle>Rozložení podle oddělení</SectionTitle>
        <DepartmentGrid>
          {Array.from(new Set(teamMembers.map(m => m.department))).map(dept => {
            const deptMembers = teamMembers.filter(m => m.department === dept);
            return (
              <DepartmentCard key={dept}>
                <DepartmentHeader>
                  <DepartmentIcon>{getDepartmentIcon(dept)}</DepartmentIcon>
                  <DepartmentName>{dept}</DepartmentName>
                  <DepartmentCount>{deptMembers.length}</DepartmentCount>
                </DepartmentHeader>
                <DepartmentMembers>
                  {deptMembers.map(member => (
                    <DepartmentMember key={member.id}>
                      <MemberAvatar $small>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </MemberAvatar>
                      <span>{member.name}</span>
                    </DepartmentMember>
                  ))}
                </DepartmentMembers>
              </DepartmentCard>
            );
          })}
        </DepartmentGrid>
      </DepartmentSection>

      {/* Permissions Overview */}
      <PermissionsSection>
        <GlassCard padding="xl">
          <CardHeader>
            <h3>Přehled oprávnění</h3>
          </CardHeader>
          <CardContent>
            <PermissionsGrid>
              <PermissionCard>
                <PermissionIcon>👑</PermissionIcon>
                <PermissionTitle>Administrátor</PermissionTitle>
                <PermissionCount>
                  {teamMembers.filter(m => m.permissions.includes('admin')).length}
                </PermissionCount>
              </PermissionCard>
              <PermissionCard>
                <PermissionIcon>⚙️</PermissionIcon>
                <PermissionTitle>Správce</PermissionTitle>
                <PermissionCount>
                  {teamMembers.filter(m => m.permissions.includes('manage')).length}
                </PermissionCount>
              </PermissionCard>
              <PermissionCard>
                <PermissionIcon>✏️</PermissionIcon>
                <PermissionTitle>Editor</PermissionTitle>
                <PermissionCount>
                  {teamMembers.filter(m => m.permissions.includes('write')).length}
                </PermissionCount>
              </PermissionCard>
              <PermissionCard>
                <PermissionIcon>👁️</PermissionIcon>
                <PermissionTitle>Pouze čtení</PermissionTitle>
                <PermissionCount>
                  {teamMembers.filter(m => m.permissions.length === 1 && m.permissions.includes('read')).length}
                </PermissionCount>
              </PermissionCard>
            </PermissionsGrid>
          </CardContent>
        </GlassCard>
      </PermissionsSection>

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetailModal>
          <ModalOverlay onClick={() => setSelectedMember(null)} />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Detail člena týmu</ModalTitle>
              <CloseButton onClick={() => setSelectedMember(null)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <MemberDetailContent>
                <DetailAvatar>
                  {selectedMember.name.split(' ').map(n => n[0]).join('')}
                </DetailAvatar>
                <DetailInfo>
                  <DetailName>{selectedMember.name}</DetailName>
                  <DetailEmail>{selectedMember.email}</DetailEmail>
                  <DetailMeta>
                    <MetaItem>
                      <MetaLabel>Role:</MetaLabel>
                      <MetaValue>{selectedMember.role}</MetaValue>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Oddělení:</MetaLabel>
                      <MetaValue>{selectedMember.department}</MetaValue>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Status:</MetaLabel>
                      <MetaValue>
                        <StatusBadge $color={getStatusColor(selectedMember.status)}>
                          {getStatusLabel(selectedMember.status)}
                        </StatusBadge>
                      </MetaValue>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Připojen:</MetaLabel>
                      <MetaValue>
                        {new Date(selectedMember.joinedAt).toLocaleDateString('cs-CZ')}
                      </MetaValue>
                    </MetaItem>
                  </DetailMeta>
                </DetailInfo>
              </MemberDetailContent>
            </ModalBody>
            <ModalFooter>
              <SecondaryButton onClick={() => setSelectedMember(null)}>
                Zavřít
              </SecondaryButton>
              <OutlineButton>Upravit</OutlineButton>
              <PrimaryButton>Poslat zprávu</PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </MemberDetailModal>
      )}
    </TeamContainer>
  );
}

// Styled Components
const TeamContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing['2xl']};
`;

const TeamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const TeamTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
`;

const TeamStats = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const StatIcon = styled.span`
  font-size: 1.5rem;
`;

const StatValue = styled.span`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
`;

const StatLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MemberCard = styled(Card)`
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const MemberHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const MemberAvatar = styled.div<{ $small?: boolean }>`
  width: ${props => props.$small ? '32px' : '48px'};
  height: ${props => props.$small ? '32px' : '48px'};
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.$small ? props.theme.typography.fontSize.sm : props.theme.typography.fontSize.md};
  flex-shrink: 0;
`;

const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MemberName = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const MemberRole = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const StatusBadge = styled.span<{ $color: string }>`
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const MemberDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const DetailIcon = styled.span`
  font-size: 1rem;
  width: 20px;
  text-align: center;
`;

const DetailText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const MemberActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  background: ${props => props.$danger ? props.theme.colors.error}10 : props.theme.colors.surface};
  border: 1px solid ${props => props.$danger ? props.theme.colors.error : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.$danger ? props.theme.colors.error}20 : props.theme.colors.background};
    transform: scale(1.1);
  }
`;

const AddMemberCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['2xl']};
  background: ${props => props.theme.colors.surface};
  border: 2px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.xl};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  min-height: 200px;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}05;
  }
`;

const AddIcon = styled.div`
  font-size: 3rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const AddText = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.md};
`;

// Department Section
const DepartmentSection = styled.section``;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xl} 0;
`;

const DepartmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const DepartmentCard = styled(Card)`
  padding: ${props => props.theme.spacing.lg};
`;

const DepartmentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const DepartmentIcon = styled.span`
  font-size: 1.5rem;
`;

const DepartmentName = styled.h4`
  flex: 1;
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const DepartmentCount = styled.span`
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const DepartmentMembers = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const DepartmentMember = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text};
`;

// Permissions Section
const PermissionsSection = styled.section``;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const PermissionCard = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const PermissionIcon = styled.div`
  font-size: 2rem;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const PermissionTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const PermissionCount = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
`;

// Modal Components
const MemberDetailModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.xl};
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  z-index: 1;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const ModalBody = styled.div`
  padding: ${props => props.theme.spacing.xl};
`;

const MemberDetailContent = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
`;

const DetailAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.xl};
  flex-shrink: 0;
`;

const DetailInfo = styled.div`
  flex: 1;
`;

const DetailName = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const DetailEmail = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
`;

const DetailMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const MetaItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MetaLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const MetaValue = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border};
`;
