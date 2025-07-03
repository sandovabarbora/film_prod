import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CalendarContainer = styled.div`
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  h3 {
    font-size: ${({ theme }) => theme.sizes.h4};
  }
`;

const CalendarNav = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  
  button {
    background: transparent;
    border: 1px solid ${({ theme }) => theme.colors.gray[700]};
    color: ${({ theme }) => theme.colors.primary.light};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    border-radius: 8px;
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.fast};
    
    &:hover {
      background: ${({ theme }) => theme.colors.gray[800]};
      border-color: ${({ theme }) => theme.colors.accent.main};
    }
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: ${({ theme }) => theme.colors.gray[700]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 8px;
  overflow: hidden;
`;

const DayHeader = styled.div`
  background: ${({ theme }) => theme.colors.gray[800]};
  padding: ${({ theme }) => theme.spacing.sm};
  text-align: center;
  font-weight: 600;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.gray[400]};
`;

const DayCell = styled.div<{ isToday?: boolean; hasShoot?: boolean; isWeekend?: boolean }>`
  background: ${({ theme, isWeekend }) => 
    isWeekend ? theme.colors.gray[850] : theme.colors.gray[900]};
  padding: ${({ theme }) => theme.spacing.sm};
  min-height: 100px;
  position: relative;
  cursor: ${({ hasShoot }) => hasShoot ? 'pointer' : 'default'};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[800]};
  }
  
  ${({ isToday, theme }) => isToday && `
    background: ${theme.colors.accent.main}10;
    border: 2px solid ${theme.colors.accent.main};
  `}
`;

const DayNumber = styled.div<{ isToday?: boolean }>`
  font-weight: ${({ isToday }) => isToday ? 700 : 500};
  color: ${({ theme, isToday }) => 
    isToday ? theme.colors.accent.main : theme.colors.gray[400]};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ShootBadge = styled.div<{ type: 'production' | 'prep' | 'wrap' }>`
  background: ${({ theme, type }) => {
    switch(type) {
      case 'production': return theme.colors.accent.main;
      case 'prep': return theme.colors.status.warning;
      case 'wrap': return theme.colors.status.success;
      default: return theme.colors.gray[700];
    }
  }};
  color: ${({ theme }) => theme.colors.primary.light};
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  
  button {
    background: transparent;
    border: 1px solid ${({ theme }) => theme.colors.gray[700]};
    color: ${({ theme }) => theme.colors.gray[400]};
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    border-radius: 6px;
    cursor: pointer;
    font-size: ${({ theme }) => theme.sizes.small};
    
    &.active {
      background: ${({ theme }) => theme.colors.accent.main};
      border-color: ${({ theme }) => theme.colors.accent.main};
      color: ${({ theme }) => theme.colors.primary.light};
    }
  }
`;

// Typ pro shoot days
interface ShootDay {
  type: 'prep' | 'production' | 'wrap';
  production: string;
}

export const ScheduleCalendar: React.FC = () => {
  const [view, setView] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock schedule data s proper typing
  const shootDays: Record<number, ShootDay> = {
    15: { type: 'prep', production: 'Project Sunset' },
    16: { type: 'production', production: 'Project Sunset' },
    17: { type: 'production', production: 'Project Sunset' },
    18: { type: 'production', production: 'Project Sunset' },
    22: { type: 'production', production: 'Night Scenes' },
    23: { type: 'production', production: 'Night Scenes' },
    25: { type: 'wrap', production: 'Project Sunset' },
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date().getDate();

  return (
    <CalendarContainer>
      <CalendarHeader>
        <h3>Production Schedule - November 2024</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ViewToggle>
            <button 
              className={view === 'month' ? 'active' : ''}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button 
              className={view === 'week' ? 'active' : ''}
              onClick={() => setView('week')}
            >
              Week
            </button>
          </ViewToggle>
          <CalendarNav>
            <button>←</button>
            <button>Today</button>
            <button>→</button>
          </CalendarNav>
        </div>
      </CalendarHeader>
      
      <CalendarGrid>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <DayHeader key={day}>{day}</DayHeader>
        ))}
        
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <DayCell key={`empty-${i}`} isWeekend={i === 0 || i === 6} />
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayOfWeek = (firstDayOfMonth + i) % 7;
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const shoot = shootDays[day];
          
          return (
            <DayCell 
              key={day}
              isToday={day === today}
              hasShoot={!!shoot}
              isWeekend={isWeekend}
            >
              <DayNumber isToday={day === today}>{day}</DayNumber>
              {shoot && (
                <ShootBadge type={shoot.type}>
                  {shoot.production}
                </ShootBadge>
              )}
            </DayCell>
          );
        })}
      </CalendarGrid>
    </CalendarContainer>
  );
};
