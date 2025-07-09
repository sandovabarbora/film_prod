import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Calendar, List, Search, Plus, Edit, Trash2, MapPin, Users, Clock } from 'lucide-react';

interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  event_type: 'scene' | 'meeting' | 'prep' | 'other';
  crew_assigned: number[];
  equipment_needed: string[];
  status: 'planned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

interface ScheduleViewProps {
  events: ScheduleEvent[];
  onEventSelect: (eventId: string) => void;
  onEventCreate: (eventData: Partial<ScheduleEvent>) => void;
  onEventUpdate: (eventId: string, updates: Partial<ScheduleEvent>) => void;
}

const ScheduleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
`;

const ScheduleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const ViewToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 4px;
`;

const ToggleButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.$active 
    ? 'rgba(103, 126, 234, 0.2)' 
    : 'transparent'
  };
  border: none;
  border-radius: 6px;
  color: ${props => props.$active ? '#667eea' : '#8b8b8b'};
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-family: inherit;

  &::placeholder {
    color: #8b8b8b;
  }

  &:focus {
    outline: none;
    border-color: rgba(103, 126, 234, 0.4);
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(103, 126, 234, 0.2);
  border: 1px solid rgba(103, 126, 234, 0.4);
  border-radius: 8px;
  color: #667eea;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(103, 126, 234, 0.3);
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: rgba(255, 255, 255, 0.1);
`;

const DayHeader = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  text-align: center;
  font-weight: 600;
  color: #fff;
  font-size: 0.875rem;
`;

const CalendarDay = styled.div<{ $isToday?: boolean; $isOtherMonth?: boolean }>`
  min-height: 100px;
  background: ${props => props.$isOtherMonth 
    ? 'rgba(255, 255, 255, 0.02)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  border: ${props => props.$isToday 
    ? '2px solid #667eea' 
    : '1px solid transparent'
  };

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DayNumber = styled.div<{ $isToday?: boolean; $isOtherMonth?: boolean }>`
  font-weight: ${props => props.$isToday ? '700' : '500'};
  color: ${props => props.$isOtherMonth ? '#6b7280' : '#fff'};
  margin-bottom: 0.5rem;
`;

const EventItem = styled.div<{ $status: string }>`
  padding: 0.25rem 0.5rem;
  background: ${props => {
    switch (props.$status) {
      case 'confirmed': return 'rgba(34, 197, 94, 0.2)';
      case 'planned': return 'rgba(59, 130, 246, 0.2)';
      case 'in_progress': return 'rgba(245, 158, 11, 0.2)';
      default: return 'rgba(156, 163, 175, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'confirmed': return '#22c55e';
      case 'planned': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      default: return '#9ca3af';
    }
  }};
  border-radius: 4px;
  font-size: 0.625rem;
  margin-bottom: 0.25rem;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`;

const ListView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EventCard = styled.div`
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const EventHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const EventTitle = styled.h3`
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
`;

const EventTime = styled.div`
  color: #8b8b8b;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EventDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const EventDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #8b8b8b;
  font-size: 0.875rem;
`;

const StatusBadge = styled.div<{ $status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  background: ${props => {
    switch (props.$status) {
      case 'confirmed': return 'rgba(34, 197, 94, 0.2)';
      case 'planned': return 'rgba(59, 130, 246, 0.2)';
      case 'in_progress': return 'rgba(245, 158, 11, 0.2)';
      case 'completed': return 'rgba(103, 126, 234, 0.2)';
      default: return 'rgba(156, 163, 175, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'confirmed': return '#22c55e';
      case 'planned': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'completed': return '#667eea';
      default: return '#9ca3af';
    }
  }};
`;

const EventActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EventActionButton = styled.button`
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #8b8b8b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  events,
  onEventSelect,
  onEventCreate,
  onEventUpdate
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonth.getDate() - i)
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: new Date(year, month, day)
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, day)
      });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => event.date === dateString);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  const days = getDaysInMonth(currentDate);

  return (
    <ScheduleContainer>
      <ScheduleHeader>
        <ViewToggle>
          <ToggleButton 
            $active={viewMode === 'calendar'} 
            onClick={() => setViewMode('calendar')}
          >
            <Calendar size={16} />
            Kalendář
          </ToggleButton>
          <ToggleButton 
            $active={viewMode === 'list'} 
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
            Seznam
          </ToggleButton>
        </ViewToggle>
      </ScheduleHeader>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Hledat události..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <AddButton onClick={() => onEventCreate({})}>
          <Plus size={16} />
          Nová událost
        </AddButton>
      </SearchContainer>

      {viewMode === 'calendar' ? (
        <>
          <CalendarHeader>
            {dayNames.map(day => (
              <DayHeader key={day}>{day}</DayHeader>
            ))}
          </CalendarHeader>
          <CalendarGrid>
            {days.map((day, index) => (
              <CalendarDay
                key={index}
                $isToday={isToday(day.fullDate)}
                $isOtherMonth={!day.isCurrentMonth}
              >
                <DayNumber 
                  $isToday={isToday(day.fullDate)}
                  $isOtherMonth={!day.isCurrentMonth}
                >
                  {day.date}
                </DayNumber>
                {getEventsForDate(day.fullDate).map(event => (
                  <EventItem
                    key={event.id}
                    $status={event.status}
                    onClick={() => onEventSelect(event.id)}
                  >
                    {event.title}
                  </EventItem>
                ))}
              </CalendarDay>
            ))}
          </CalendarGrid>
        </>
      ) : (
        <ListView>
          {filteredEvents.map(event => (
            <EventCard key={event.id}>
              <EventHeader>
                <div>
                  <EventTitle>{event.title}</EventTitle>
                  <EventTime>
                    <Clock size={14} />
                    {event.start_time} - {event.end_time}
                  </EventTime>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <StatusBadge $status={event.status}>
                    {event.status}
                  </StatusBadge>
                  <EventActions>
                    <EventActionButton>
                      <Edit size={14} />
                    </EventActionButton>
                    <EventActionButton>
                      <Trash2 size={14} />
                    </EventActionButton>
                  </EventActions>
                </div>
              </EventHeader>

              <EventDetails>
                <EventDetail>
                  <MapPin size={14} />
                  {event.location}
                </EventDetail>
                <EventDetail>
                  <Users size={14} />
                  {event.crew_assigned.length} členů štábu
                </EventDetail>
                <EventDetail>
                  <Calendar size={14} />
                  {event.event_type}
                </EventDetail>
              </EventDetails>
            </EventCard>
          ))}
        </ListView>
      )}
    </ScheduleContainer>
  );
};

export default ScheduleView;
