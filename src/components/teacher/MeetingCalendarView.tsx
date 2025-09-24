import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  Users,
  Video,
  Filter,
  Grid3X3,
  List,
  Loader2
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO
} from 'date-fns';
import { cn } from '../../lib/utils';
import { useMeetingCalendar, useTeacherPrograms } from '../../hooks/useTeacher';
import type { Meeting } from '../../types/api';

interface MeetingCalendarViewProps {
  onCreateMeeting?: () => void;
  onEditMeeting?: (meeting: Meeting) => void;
  onViewMeeting?: (meeting: Meeting) => void;
}

export const MeetingCalendarView: React.FC<MeetingCalendarViewProps> = ({
  onCreateMeeting,
  onEditMeeting,
  onViewMeeting
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');

  const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
  
  const { data: programs } = useTeacherPrograms();
  const { data: meetings, isLoading } = useMeetingCalendar(
    startDate, 
    endDate, 
    selectedProgram === 'all' ? undefined : parseInt(selectedProgram)
  );

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const getMeetingsForDate = (date: Date) => {
    if (!meetings) return [];
    return meetings.filter(meeting => 
      isSameDay(parseISO(meeting.scheduled_at), date)
    );
  };

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map(day => {
          const dayMeetings = getMeetingsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[120px] p-2 border border-border/50 bg-background",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                isDayToday && "bg-primary/5 border-primary/20"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-sm font-medium",
                  isDayToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                )}>
                  {format(day, 'd')}
                </span>
                {isCurrentMonth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => onCreateMeeting?.()}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-1">
                {dayMeetings.slice(0, 3).map(meeting => (
                  <div
                    key={meeting.id}
                    className="p-1 rounded text-xs bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors"
                    onClick={() => onViewMeeting?.(meeting)}
                  >
                    <div className="font-medium truncate">{meeting.title}</div>
                    <div className="flex items-center space-x-1 text-blue-600">
                      <Clock className="h-2 w-2" />
                      <span>{format(parseISO(meeting.scheduled_at), 'HH:mm')}</span>
                    </div>
                  </div>
                ))}
                {dayMeetings.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayMeetings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    if (!meetings || meetings.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Meetings Scheduled</h3>
          <p className="text-sm mb-4">No meetings found for the selected period</p>
          {onCreateMeeting && (
            <Button onClick={onCreateMeeting}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          )}
        </div>
      );
    }

    // Group meetings by date
    const groupedMeetings = meetings.reduce((groups, meeting) => {
      const date = format(parseISO(meeting.scheduled_at), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(meeting);
      return groups;
    }, {} as Record<string, Meeting[]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedMeetings)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, dateMeetings]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                {format(parseISO(date), 'EEEE, MMMM dd, yyyy')}
                <Badge variant="secondary" className="ml-2">
                  {dateMeetings.length} meeting{dateMeetings.length !== 1 ? 's' : ''}
                </Badge>
              </h3>
              
              <div className="grid gap-3">
                {dateMeetings
                  .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
                  .map(meeting => (
                    <Card 
                      key={meeting.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onViewMeeting?.(meeting)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{meeting.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {meeting.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(parseISO(meeting.scheduled_at), 'HH:mm')} - 
                                  {format(
                                    new Date(parseISO(meeting.scheduled_at).getTime() + (meeting.duration || 60) * 60000),
                                    'HH:mm'
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{meeting.attendees?.length || 0} attendees</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Video className="h-3 w-3" />
                                <span>{meeting.duration || 60}min</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="outline">
                              {meeting.program?.name}
                            </Badge>
                            {meeting.recurring_pattern && (
                              <Badge variant="secondary" className="text-xs">
                                Recurring
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meeting Calendar</h2>
          <p className="text-muted-foreground">
            View and manage your scheduled meetings
          </p>
        </div>
        {onCreateMeeting && (
          <Button onClick={onCreateMeeting}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Month Navigation */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Program Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs?.data.data.map(program => (
                  <SelectItem key={program.id} value={program.id.toString()}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            {viewMode === 'month' ? renderCalendarGrid() : renderListView()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeetingCalendarView;