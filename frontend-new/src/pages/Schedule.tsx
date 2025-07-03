import React, { useState } from 'react';
import styled from 'styled-components';
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const ScheduleContainer = styled.div`
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

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: ${({ theme }) => theme.colors.gray[800]};
  padding: 0.25rem;
  border-radius: 8px;
  width: fit-content;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.$active ? props.theme.colors.gray[700] : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.text.primary : props.theme.colors.text.secondary};
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const WeekView = styled.div`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  overflow: hidden;
`;

const WeekHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[700]};
`;

const WeekTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const WeekNav = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const NavButton = styled.button`
  padding: 0.5rem;
  background: ${({ theme }) => theme.colors.gray[700]};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[600]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const DayColumn = styled.div`
  border-right: 1px solid ${({ theme }) => theme.colors.gray[700]};
  
  &:last-child {
    border-right: none;
  }
`;

const DayHeader = styled.div`
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[700]};
  background: ${({ theme }) => theme.colors.gray[750]};
`;

const DayName = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const DayDate = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DayContent = styled.div`
  min-height: 400px;
  padding: 0.5rem;
`;

const ScheduleItem = styled.div<{ $color?: string }>`
  background: ${props => props.$color || props.theme.colors.primary}20;
  border-left: 3px solid ${props => props.$color || props.theme.colors.primary};
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const ItemTime = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const ItemTitle = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const ItemLocation = styled.p`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const StatusBadge = styled.span<{ $status: 'confirmed' | 'pending' | 'cancelled' }>`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.$status) {
      case 'confirmed': return props.theme.colors.success;
      case 'pending': return props.theme.colors.warning;
      case 'cancelled': return props.theme.colors.danger;
    }
  }};
  color: white;
`;

const Schedule: React.FC = () => {
  const [view, setView] = useState<'week' | 'month' | 'list'>('week');
  
  // Mock schedule data
  const scheduleItems = {
    monday: [
      { time: '7:00 AM - 12:00 PM', title: 'Interior Office - Scene 12-15', location: 'Studio 3', color: '#3B82F6' },
      { time: '1:00 PM - 6:00 PM', title: 'Conference Room', location: 'Studio 3', color: '#3B82F6' },
    ],
    tuesday: [
      { time: '6:00 AM - 11:00 AM', title: 'Exterior Street', location: 'Downtown', color: '#10B981' },
      { time: '2:00 PM - 7:00 PM', title: 'Car Chase Scene', location: 'Highway 5', color: '#F59E0B' },
    ],
    wednesday: [
      { time: '8:00 AM - 5:00 PM', title: 'Studio Day', location: 'Studio 1', color: '#3B82F6' },
    ],
    thursday: [
      { time: '7:00 AM - 3:00 PM', title: 'Park Scenes', location: 'Central Park', color: '#10B981' },
    ],
    friday: [
      { time: '9:00 AM - 12:00 PM', title: 'Pickups', location: 'Various', color: '#8B5CF6' },
      { time: '2:00 PM - 5:00 PM', title: 'ADR Session', location: 'Sound Stage', color: '#8B5CF6' },
    ],
    saturday: [
      { time: 'Day Off', title: 'No Shooting Scheduled', location: '', color: '#6B7280' },
    ],
    sunday: [
      { time: 'Day Off', title: 'No Shooting Scheduled', location: '', color: '#6B7280' },
    ],
  };
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dates = ['Jan 15', 'Jan 16', 'Jan 17', 'Jan 18', 'Jan 19', 'Jan 20', 'Jan 21'];

  return (
    <ScheduleContainer>
      <PageHeader>
        <Title>Production Schedule</Title>
        <Button>
          <Plus size={18} />
          Add Shoot Day
        </Button>
      </PageHeader>
      
      <ViewToggle>
        <ViewButton $active={view === 'week'} onClick={() => setView('week')}>
          Week View
        </ViewButton>
        <ViewButton $active={view === 'month'} onClick={() => setView('month')}>
          Month View
        </ViewButton>
        <ViewButton $active={view === 'list'} onClick={() => setView('list')}>
          List View
        </ViewButton>
      </ViewToggle>
      
      {view === 'week' && (
        <WeekView>
          <WeekHeader>
            <WeekTitle>Week of January 15-21, 2025</WeekTitle>
            <WeekNav>
              <NavButton><ChevronLeft /></NavButton>
              <NavButton>Today</NavButton>
              <NavButton><ChevronRight /></NavButton>
            </WeekNav>
          </WeekHeader>
          
          <DaysGrid>
            {days.map((day, index) => (
              <DayColumn key={day}>
                <DayHeader>
                  <DayName>{day}</DayName>
                  <DayDate>{dates[index]}</DayDate>
                </DayHeader>
                <DayContent>
                  {scheduleItems[day.toLowerCase()].map((item, itemIndex) => (
                    <ScheduleItem key={itemIndex} $color={item.color}>
                      <ItemTime>{item.time}</ItemTime>
                      <ItemTitle>{item.title}</ItemTitle>
                      {item.location && (
                        <ItemLocation>
                          <MapPin />
                          {item.location}
                        </ItemLocation>
                      )}
                    </ScheduleItem>
                  ))}
                </DayContent>
              </DayColumn>
            ))}
          </DaysGrid>
        </WeekView>
      )}
    </ScheduleContainer>
  );
};

export default Schedule;