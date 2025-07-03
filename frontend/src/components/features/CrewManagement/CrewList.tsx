import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CrewContainer = styled.div`
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  overflow: hidden;
`;

const CrewHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[700]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchBar = styled.input`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary.light};
  width: 300px;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[500]};
  }
`;

const CrewTable = styled.table`
  width: 100%;
  
  th {
    background: ${({ theme }) => theme.colors.gray[800]};
    padding: ${({ theme }) => theme.spacing.md};
    text-align: left;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray[400]};
    font-size: ${({ theme }) => theme.sizes.small};
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  td {
    padding: ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[800]};
  }
  
  tr:hover td {
    background: ${({ theme }) => theme.colors.gray[850]};
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent.main};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StatusBadge = styled.span<{ status: 'available' | 'on_set' | 'off' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: ${({ theme }) => theme.sizes.small};
  background: ${({ theme, status }) => {
    switch(status) {
      case 'available': return theme.colors.status.success + '20';
      case 'on_set': return theme.colors.accent.main + '20';
      case 'off': return theme.colors.gray[700];
    }
  }};
  color: ${({ theme, status }) => {
    switch(status) {
      case 'available': return theme.colors.status.success;
      case 'on_set': return theme.colors.accent.main;
      case 'off': return theme.colors.gray[500];
    }
  }};
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.accent.main};
  color: ${({ theme }) => theme.colors.primary.light};
  border: none;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent.muted};
  }
`;

export const CrewList: React.FC = () => {
  const [search, setSearch] = useState('');

  // Mock data
  const crewMembers = [
    {
      id: '1',
      name: 'John Doe',
      role: 'Director',
      department: 'Direction',
      phone: '+1 234 567 890',
      status: 'on_set',
      dailyRate: '$1,200',
      initials: 'JD'
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'Director of Photography',
      department: 'Camera',
      phone: '+1 234 567 891',
      status: 'on_set',
      dailyRate: '$1,000',
      initials: 'JS'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      role: 'Sound Mixer',
      department: 'Sound',
      phone: '+1 234 567 892',
      status: 'available',
      dailyRate: '$800',
      initials: 'MW'
    },
    {
      id: '4',
      name: 'Sarah Johnson',
      role: '1st Assistant Director',
      department: 'Direction',
      phone: '+1 234 567 893',
      status: 'on_set',
      dailyRate: '$900',
      initials: 'SJ'
    },
    {
      id: '5',
      name: 'Tom Brown',
      role: 'Gaffer',
      department: 'Lighting',
      phone: '+1 234 567 894',
      status: 'off',
      dailyRate: '$750',
      initials: 'TB'
    },
  ];

  const filteredCrew = crewMembers.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.role.toLowerCase().includes(search.toLowerCase()) ||
    member.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CrewContainer>
      <CrewHeader>
        <h3>Crew Management</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <SearchBar
            type="text"
            placeholder="Search crew..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <AddButton>
            <span>+</span> Add Crew Member
          </AddButton>
        </div>
      </CrewHeader>
      
      <CrewTable>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Department</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Daily Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCrew.map(member => (
            <tr key={member.id}>
              <td>
                <NameCell>
                  <Avatar>{member.initials}</Avatar>
                  {member.name}
                </NameCell>
              </td>
              <td>{member.role}</td>
              <td>{member.department}</td>
              <td>{member.phone}</td>
              <td>
                <StatusBadge status={member.status as any}>
                  {member.status.replace('_', ' ')}
                </StatusBadge>
              </td>
              <td>{member.dailyRate}</td>
              <td>
                <button>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </CrewTable>
    </CrewContainer>
  );
};
