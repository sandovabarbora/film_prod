import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const HubContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: ${({ theme }) => theme.spacing.lg};
  height: calc(100vh - 200px);
`;

const MainFeed = styled.div`
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const LiveSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const LiveCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`;

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  
  .dot {
    width: 8px;
    height: 8px;
    background: ${({ theme }) => theme.colors.status.error};
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const UpdateItem = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gray[850]};
  border-radius: 8px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const UpdateAlert = styled(UpdateItem)`
  border-left: 3px solid ${({ theme }) => theme.colors.status.error};
`;

const UpdateSchedule = styled(UpdateItem)`
  border-left: 3px solid ${({ theme }) => theme.colors.status.warning};
`;

const UpdateCompleted = styled(UpdateItem)`
  border-left: 3px solid ${({ theme }) => theme.colors.status.success};
`;

const UpdateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  
  .user {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    font-weight: 600;
  }
  
  .time {
    color: ${({ theme }) => theme.colors.gray[500]};
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  color: ${({ theme }) => theme.colors.primary.light};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[700]};
    transform: translateY(-2px);
  }
`;

const WeatherWidget = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gray[850]};
  border-radius: 8px;
  
  .temp {
    font-size: ${({ theme }) => theme.sizes.h3};
    font-weight: 700;
  }
  
  .condition {
    text-align: right;
    
    .main {
      font-weight: 600;
    }
    
    .sub {
      color: ${({ theme }) => theme.colors.gray[500]};
      font-size: ${({ theme }) => theme.sizes.small};
    }
  }
`;

const AIInsight = styled(motion.div)`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.accent.main}20, 
    ${({ theme }) => theme.colors.accent.muted}10
  );
  border: 1px solid ${({ theme }) => theme.colors.accent.main}50;
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  .title {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.accent.main};
  }
  
  .content {
    font-size: ${({ theme }) => theme.sizes.small};
    line-height: 1.6;
  }
`;

// Update type
type UpdateType = 'alert' | 'schedule' | 'completed';

interface Update {
  id: string;
  type: UpdateType;
  user: string;
  role: string;
  content: string;
  time: string;
}

// Mock real-time updates
const mockUpdates: Update[] = [
  {
    id: '1',
    type: 'alert',
    user: 'Sarah Johnson',
    role: '1st AD',
    content: 'Weather alert: Rain expected at 3 PM. Moving Scene 24 to Stage 3.',
    time: '2 min ago'
  },
  {
    id: '2',
    type: 'schedule',
    user: 'Mike Wilson',
    role: 'Sound',
    content: 'Equipment delay - additional mics arriving by 10 AM.',
    time: '15 min ago'
  },
  {
    id: '3',
    type: 'completed',
    user: 'Jane Smith',
    role: 'DOP',
    content: 'Scene 23A wrapped. Great take! Moving to Scene 24.',
    time: '45 min ago'
  }
];

export const RealTimeHub: React.FC = () => {
  const [updates] = useState<Update[]>(mockUpdates);
  const [onlineCount, setOnlineCount] = useState(27);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        return Math.max(0, prev + change);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderUpdate = (update: Update) => {
    const content = (
      <>
        <UpdateHeader>
          <div className="user">
            <span>{update.user}</span>
            <span style={{ color: '#999' }}>• {update.role}</span>
          </div>
          <div className="time">{update.time}</div>
        </UpdateHeader>
        <div>{update.content}</div>
      </>
    );

    const animationProps = {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    };

    switch (update.type) {
      case 'alert':
        return (
          <UpdateAlert key={update.id} {...animationProps}>
            {content}
          </UpdateAlert>
        );
      case 'schedule':
        return (
          <UpdateSchedule key={update.id} {...animationProps}>
            {content}
          </UpdateSchedule>
        );
      case 'completed':
        return (
          <UpdateCompleted key={update.id} {...animationProps}>
            {content}
          </UpdateCompleted>
        );
      default:
        return null;
    }
  };

  return (
    <HubContainer>
      <MainFeed>
        <AIInsight
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="title">
            <span>🤖</span> AI Production Assistant
          </div>
          <div className="content">
            Based on current weather patterns and crew availability, I recommend 
            completing all exterior shots by 2 PM. There's a 70% chance of rain 
            after 3 PM. Scene 26 could be moved to tomorrow for better lighting conditions.
          </div>
        </AIInsight>

        <h3 style={{ marginBottom: '1rem' }}>Live Production Feed</h3>
        
        <AnimatePresence>
          {updates.map(update => renderUpdate(update))}
        </AnimatePresence>
      </MainFeed>

      <LiveSidebar>
        <LiveCard>
          <LiveIndicator>
            <div className="dot" />
            <span>Live on Set</span>
          </LiveIndicator>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {onlineCount} crew members
          </div>
          <div style={{ color: '#999', fontSize: '0.875rem' }}>
            Currently on location
          </div>
        </LiveCard>

        <LiveCard>
          <h4 style={{ marginBottom: '1rem' }}>Current Weather</h4>
          <WeatherWidget>
            <div className="temp">22°C</div>
            <div className="condition">
              <div className="main">Partly Cloudy</div>
              <div className="sub">Rain at 3 PM</div>
            </div>
          </WeatherWidget>
        </LiveCard>

        <LiveCard>
          <h4 style={{ marginBottom: '1rem' }}>Quick Actions</h4>
          <QuickActions>
            <ActionButton>
              <span>📢</span>
              Announce
            </ActionButton>
            <ActionButton>
              <span>🚨</span>
              Emergency
            </ActionButton>
            <ActionButton>
              <span>☕</span>
              Break Call
            </ActionButton>
            <ActionButton>
              <span>🎬</span>
              Wrap Call
            </ActionButton>
          </QuickActions>
        </LiveCard>
      </LiveSidebar>
    </HubContainer>
  );
};
