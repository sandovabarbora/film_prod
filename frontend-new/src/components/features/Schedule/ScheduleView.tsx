import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Calendar, Clock, Plus, Edit, Trash2, Users, MapPin,
  ChevronLeft, ChevronRight, Filter, Search
} from 'lucide-react';

interface ScheduleEvent {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  date: string;
  location: string;
  event_type: 'shooting' | 'meeting' | 'rehearsal' | 'travel' | 'setup';
  crew_assigned: number[];
  equipment_needed: string[];
  status: 'planned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ScheduleViewProps {
  projectId: number;
}

const ScheduleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ScheduleHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const CalendarControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MonthNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CurrentMonth = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  min-width: 200px;
  text-align: center;
`;

const ViewToggle = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${({ $active, theme }) => 
    $active ? theme.colors.primary : 'transparent'
  };
  color: ${({ $active, theme }) => 
    $active ? 'white' : theme.colors.text.secondary
  };
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $active, theme }) => 
      $active ? theme.colors.primaryDark : theme.colors.border
    };
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
`;

const ActionButton = styled.button<{ $variant?: 'primary' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${({ $variant, theme }) => 
    $variant === 'primary' ? theme.colors.primary : 'transparent'
  };
  color: ${({ $variant }) => 
    $variant === 'primary' ? 'white' : ({ theme }) => theme.colors.text.secondary
  };
  border: 1px solid ${({ $variant, theme }) => 
    $variant === 'primary' ? theme.colors.primary : theme.colors.border
  };
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: ${({ theme }) => theme.colors.border};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin-bottom: 1px;
`;

const DayHeader = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  text-align: center;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
`;

const CalendarDay = styled.div<{ $isToday?: boolean; $isOtherMonth?: boolean; $hasEvents?: boolean }>`
  min-height: 120px;
  background: ${({ $isOtherMonth, theme }) => 
    $isOtherMonth ? theme.colors.background : theme.colors.surface
  };
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  ${({ $isToday, theme }) => $isToday && `
    background: ${theme.colors.primary}10;
    border: 2px solid ${theme.colors.primary};
  `}
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}05;
  }
`;

const DayNumber = styled.div<{ $isToday?: boolean; $isOtherMonth?: boolean }>`
  font-weight: ${({ $isToday }) => $isToday ? '700' : '500'};
  color: ${({ $isOtherMonth, $isToday, theme }) => {
    if ($isToday) return theme.colors.primary;
    if ($isOtherMonth) return theme.colors.text.muted;
    return theme.colors.text.primary;
  }};
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const EventItem = styled.div<{ $type: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  background: ${({ $type, theme }) => {
    switch ($type) {
      case 'shooting': return theme.colors.primary;
      case 'meeting': return theme.colors.info;
      case 'rehearsal': return theme.colors.warning;
      case 'travel': return theme.colors.accent.main;
      case 'setup': return theme.colors.success;
      default: return theme.colors.gray[500];
    }
  }};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.8;
    transform: scale(1.02);
  }
`;

const ListView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ListHeader = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  position: relative;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.secondary};
    width: 16px;
    height: 16px;
  }
`;

const EventCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const EventTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.25rem 0;
`;

const EventTime = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const EventActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EventActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const EventDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.75rem;
`;

const EventDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  svg {
    width: 14px;
    height: 14px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'planned': return theme.colors.gray[500] + '20';
      case 'confirmed': return theme.colors.info + '20';
      case 'in_progress': return theme.colors.warning + '20';
      case 'completed': return theme.colors.success + '20';
      case 'cancelled': return theme.colors.error + '20';
      default: return theme.colors.gray[500] + '20';
    }
  }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'planned': return theme.colors.gray[500];
      case 'confirmed': return theme.colors.info;
      case 'in_progress': return theme.colors.warning;
      case 'completed': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.gray[500];
    }
  }};
`;

const ScheduleView: React.FC<ScheduleViewProps> = ({ projectId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchScheduleEvents();
  }, [projectId, currentDate]);

  const fetchScheduleEvents = async () => {
    // Mock data - replace with real API call
    const mockEvents: ScheduleEvent[] = [
      {
        id: 1,
        title: "Natáčení scény 1",
        description: "Úvodní scéna v kavárně",
        start_time: "08:00",
        end_time: "12:00",
        date: "2025-07-15",
        location: "Café Central, Praha",
        event_type: "shooting",
        crew_assigned: [1, 2, 3],
        equipment_needed: ["Kamera RED", "Osvětlení", "Zvuk"],
        status: "confirmed",
        priority: "high"
      },
      {
        id: 2,
        title: "Týmová porada",
        description: "Diskuze o postupu natáčení",
        start_time: "14:00",
        end_time: "15:30",
        date: "2025-07-16",
        location: "Studio A",
        event_type: "meeting",
        crew_assigned: [1, 2],
        equipment_needed: [],
        status: "planned",
        priority: "medium"
      }
    ];
    setEvents(mockEvents);
  };

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
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
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
    return events.filter(event => event.date === dateString);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('cs-CZ', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove seconds
  };

  const getEventTypeLabel = (type: string) => {
    const labels = {
      shooting: 'Natáčení',
      meeting: 'Porada',
      rehearsal: 'Zkouška',
      travel: 'Cesta',
      setup: 'Příprava'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
  const days = getDaysInMonth(currentDate);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ScheduleContainer>
      <ScheduleHeader>
        <CalendarControls>
          <MonthNavigation>
            <NavButton onClick={() => navigateMonth('prev')}>
              <ChevronLeft size={16} />
            </NavButton>
            <CurrentMonth>{formatMonthYear(currentDate)}</CurrentMonth>
            <NavButton onClick={() => navigateMonth('next')}>
              <ChevronRight size={16} />
            </NavButton>
          </MonthNavigation>
          
          <ViewToggle>
            <ViewButton 
              $active={viewMode === 'calendar'} 
              onClick={() => setViewMode('calendar')}
            >
              Kalendář
            </ViewButton>
            <ViewButton 
              $active={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
            >
              Seznam
            </ViewButton>
          </ViewToggle>
        </CalendarControls>

        <ActionButtons>
          <ActionButton>
            <Filter size={16} />
            Filtr
          </ActionButton>
          <ActionButton $variant="primary">
            <Plus size={16} />
            Nová událost
          </ActionButton>
        </ActionButtons>
      </ScheduleHeader>

      {viewMode === 'calendar' ? (
        <>
          <CalendarHeader>
            {dayNames.map(day => (
              <DayHeader key={day}>{day}</DayHeader>
            ))}
          </CalendarHeader>
          
          <CalendarGrid>
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day.fullDate);
              return (
                <CalendarDay
                  key={index}
                  $isToday={isToday(day.fullDate)}
                  $isOtherMonth={!day.isCurrentMonth}
                  $hasEvents={dayEvents.length > 0}
                >
                  <DayNumber 
                    $isToday={isToday(day.fullDate)}
                    $isOtherMonth={!day.isCurrentMonth}
                  >
                    {day.date}
                  </DayNumber>
                  <EventsList>
                    {dayEvents.slice(0, 3).map(event => (
                      <EventItem key={event.id} $type={event.event_type}>
                        {formatTime(event.start_time)} {event.title}
                      </EventItem>
                    ))}
                    {dayEvents.length > 3 && (
                      <EventItem $type="default">
                        +{dayEvents.length - 3} více
                      </EventItem>
                    )}
                  </EventsList>
                </CalendarDay>
              );
            })}
          </CalendarGrid>
        </>
      ) : (
        <ListView>
          <ListHeader>
            <SearchContainer>
              <Search size={16} />
              <SearchInput
                type="text"
                placeholder="Vyhledat události..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
          </ListHeader>

          {filteredEvents.map(event => (
            <EventCard key={event.id}>
              <EventHeader>
                <div>
                  <EventTitle>{event.title}</EventTitle>
                  <EventTime>
                    <Clock size={14} />
                    {event.date} • {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </EventTime>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                  {getEventTypeLabel(event.event_type)}
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
