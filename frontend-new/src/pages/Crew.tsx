import React, { useState } from 'react';
import styled from 'styled-components';
import { Users, Plus, Search, Filter, Mail, Phone, Camera, Mic, Lightbulb, Edit } from 'lucide-react';

const CrewContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const CrewLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
`;

const DepartmentSidebar = styled.div`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  background: ${({ theme }) => theme.colors.gray[700]};
  border: 1px solid ${({ theme }) => theme.colors.gray[600]};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const DepartmentList = styled.div``;

const DepartmentTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
`;

const Department = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: ${props => props.$active ? props.theme.colors.gray[700] : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.text.primary : props.theme.colors.text.secondary};
  border: none;
  border-radius: 6px;
  text-align: left;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[700]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const DepartmentCount = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CrewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CrewCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
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

const CrewAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
`;

const CrewName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const CrewRole = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const CrewDepartment = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[700]};
`;

const ContactItem = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[700]};
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.p`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatLabel = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Crew: React.FC = () => {
  const [activeDepartment, setActiveDepartment] = useState('all');
  
  const departments = [
    { id: 'all', name: 'All Departments', count: 45 },
    { id: 'camera', name: 'Camera', count: 8, icon: Camera },
    { id: 'lighting', name: 'Lighting', count: 6, icon: Lightbulb },
    { id: 'sound', name: 'Sound', count: 5, icon: Mic },
    { id: 'production', name: 'Production', count: 10 },
    { id: 'art', name: 'Art Department', count: 7 },
    { id: 'costume', name: 'Costume', count: 4 },
    { id: 'makeup', name: 'Hair & Makeup', count: 5 },
  ];
  
  // Mock crew data
  const crewMembers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Director of Photography',
      department: 'camera',
      email: 'john.doe@filmflow.com',
      phone: '+420 123 456 789',
      daysWorked: 12,
      callSheets: 12,
      availability: 'Available'
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Gaffer',
      department: 'lighting',
      email: 'jane.smith@filmflow.com',
      phone: '+420 987 654 321',
      daysWorked: 10,
      callSheets: 12,
      availability: 'Available'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Sound Mixer',
      department: 'sound',
      email: 'mike.j@filmflow.com',
      phone: '+420 555 123 456',
      daysWorked: 11,
      callSheets: 12,
      availability: 'On Set'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      role: 'Production Designer',
      department: 'art',
      email: 'sarah.w@filmflow.com',
      phone: '+420 555 987 654',
      daysWorked: 15,
      callSheets: 15,
      availability: 'Available'
    },
    {
      id: 5,
      name: 'Tom Brown',
      role: '1st AC',
      department: 'camera',
      email: 'tom.b@filmflow.com',
      phone: '+420 555 246 810',
      daysWorked: 12,
      callSheets: 12,
      availability: 'Available'
    },
    {
      id: 6,
      name: 'Emma Davis',
      role: 'Costume Designer',
      department: 'costume',
      email: 'emma.d@filmflow.com',
      phone: '+420 555 135 790',
      daysWorked: 8,
      callSheets: 10,
      availability: 'Prep Day'
    },
  ];
  
  const filteredCrew = activeDepartment === 'all' 
    ? crewMembers 
    : crewMembers.filter(member => member.department === activeDepartment);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <CrewContainer>
      <PageHeader>
        <Title>Crew Management</Title>
        <HeaderActions>
          <Button>
            <Filter size={18} />
            Filter
          </Button>
          <Button>
            <Plus size={18} />
            Add Crew Member
          </Button>
        </HeaderActions>
      </PageHeader>
      
      <CrewLayout>
        <DepartmentSidebar>
          <SearchBar>
            <Search />
            <SearchInput placeholder="Search crew..." />
          </SearchBar>
          
          <DepartmentList>
            <DepartmentTitle>Departments</DepartmentTitle>
            {departments.map(dept => (
              <Department
                key={dept.id}
                $active={activeDepartment === dept.id}
                onClick={() => setActiveDepartment(dept.id)}
              >
                <span>{dept.name}</span>
                <DepartmentCount>{dept.count}</DepartmentCount>
              </Department>
            ))}
          </DepartmentList>
        </DepartmentSidebar>
        
        <CrewGrid>
          {filteredCrew.map(member => (
            <CrewCard key={member.id}>
              <CrewHeader>
                <CrewInfo>
                  <CrewName>{member.name}</CrewName>
                  <CrewRole>{member.role}</CrewRole>
                  <CrewDepartment>{member.department}</CrewDepartment>
                </CrewInfo>
                <CrewAvatar>{getInitials(member.name)}</CrewAvatar>
              </CrewHeader>
              
              <ContactInfo>
                <ContactItem href={`mailto:${member.email}`}>
                  <Mail />
                  {member.email}
                </ContactItem>
                <ContactItem href={`tel:${member.phone}`}>
                  <Phone />
                  {member.phone}
                </ContactItem>
              </ContactInfo>
              
              <StatsRow>
                <Stat>
                  <StatValue>{member.daysWorked}</StatValue>
                  <StatLabel>Days Worked</StatLabel>
                </Stat>
                <Stat>
                  <StatValue>{member.callSheets}</StatValue>
                  <StatLabel>Call Sheets</StatLabel>
                </Stat>
                <Stat>
                  <StatValue>{member.availability}</StatValue>
                  <StatLabel>Status</StatLabel>
                </Stat>
              </StatsRow>
            </CrewCard>
          ))}
        </CrewGrid>
      </CrewLayout>
    </CrewContainer>
  );
};

export default Crew;