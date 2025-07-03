import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.main};
  }
`;

const StatNumber = styled.div`
  font-size: ${({ theme }) => theme.sizes.h2};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent.main};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.gray[500]};
  font-size: ${({ theme }) => theme.sizes.small};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const TodaySection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.sizes.h4};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  span {
    color: ${({ theme }) => theme.colors.accent.main};
  }
`;

const CallSheet = styled.div`
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TimelineItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[800]};
  
  &:last-child {
    border-bottom: none;
  }
`;

const Time = styled.div`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.sizes.h5};
  color: ${({ theme }) => theme.colors.accent.main};
  min-width: 80px;
`;

const TimelineContent = styled.div`
  flex: 1;
  
  h4 {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
  
  p {
    color: ${({ theme }) => theme.colors.gray[400]};
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const CrewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const CrewCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gray[800]};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.sizes.small};
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent.main};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }
  
  .info {
    flex: 1;
    
    .name {
      font-weight: 500;
      margin-bottom: 2px;
    }
    
    .role {
      color: ${({ theme }) => theme.colors.gray[500]};
      font-size: ${({ theme }) => theme.sizes.small};
    }
  }
`;

const AlertBanner = styled(motion.div)`
  background: ${({ theme }) => theme.colors.accent.main}20;
  border: 1px solid ${({ theme }) => theme.colors.accent.main};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  
  .icon {
    font-size: ${({ theme }) => theme.sizes.h5};
  }
`;

export const ProductionDashboard: React.FC = () => {
  // Mock data - později z API
  const todaySchedule = {
    date: 'Monday, November 25, 2024',
    production: 'Project Sunset',
    day: 'Day 12 of 45',
    callTime: '06:00',
    location: 'Downtown Studio - Stage 3',
    scenes: ['Scene 23A', 'Scene 24', 'Scene 25B'],
    crew: [
      { name: 'John Doe', role: 'Director', initial: 'JD' },
      { name: 'Jane Smith', role: 'DOP', initial: 'JS' },
      { name: 'Mike Wilson', role: 'Sound', initial: 'MW' },
      { name: 'Sarah Johnson', role: '1st AD', initial: 'SJ' },
    ]
  };

  return (
    <>
      <AlertBanner
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="icon">📍</span>
        <div>
          <strong>Location Change:</strong> Tomorrow's shoot moved to Riverside Park (weather permitting)
        </div>
      </AlertBanner>

      <DashboardGrid>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatNumber>3</StatNumber>
          <StatLabel>Active Productions</StatLabel>
        </StatCard>
        
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatNumber>27</StatNumber>
          <StatLabel>Crew Members Today</StatLabel>
        </StatCard>
        
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatNumber>85%</StatNumber>
          <StatLabel>Schedule Progress</StatLabel>
        </StatCard>
        
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatNumber>$2.3M</StatNumber>
          <StatLabel>Budget Remaining</StatLabel>
        </StatCard>
      </DashboardGrid>

      <TodaySection>
        <SectionTitle>
          <span>📅</span> Today's Schedule - {todaySchedule.date}
        </SectionTitle>
        
        <CallSheet>
          <h3>{todaySchedule.production} - {todaySchedule.day}</h3>
          <p style={{ color: '#999', marginBottom: '1.5rem' }}>
            📍 {todaySchedule.location}
          </p>
          
          <TimelineItem>
            <Time>05:30</Time>
            <TimelineContent>
              <h4>Crew Parking Opens</h4>
              <p>Main lot behind Building A</p>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem>
            <Time>06:00</Time>
            <TimelineContent>
              <h4>General Crew Call</h4>
              <p>Breakfast available in catering tent</p>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem>
            <Time>07:00</Time>
            <TimelineContent>
              <h4>First Shot - {todaySchedule.scenes[0]}</h4>
              <p>INT. OFFICE - DAY (Coverage)</p>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem>
            <Time>13:00</Time>
            <TimelineContent>
              <h4>Lunch Break</h4>
              <p>1 hour - Hot meal service</p>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem>
            <Time>19:00</Time>
            <TimelineContent>
              <h4>Estimated Wrap</h4>
              <p>Please confirm equipment returns with department heads</p>
            </TimelineContent>
          </TimelineItem>
        </CallSheet>

        <SectionTitle>
          <span>👥</span> Today's Crew
        </SectionTitle>
        
        <CrewGrid>
          {todaySchedule.crew.map((member, index) => (
            <CrewCard key={index}>
              <div className="avatar">{member.initial}</div>
              <div className="info">
                <div className="name">{member.name}</div>
                <div className="role">{member.role}</div>
              </div>
            </CrewCard>
          ))}
        </CrewGrid>
      </TodaySection>
    </>
  );
};
