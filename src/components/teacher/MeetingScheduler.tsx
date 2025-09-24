import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Video, 
  Save, 
  Plus,
  Trash2,
  UserPlus,
  UserMinus,
  Copy,
  ExternalLink
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { cn } from '../../lib/utils';
import { 
  useTeacherPrograms, 
  useTeacherStudents, 
  useCreateMeeting,
  useAssignStudentsToMeeting,
  useMeetingAttendees
} from '../../hooks/useTeacher';
import { toast } from '../ui/use-toast';

interface MeetingSchedulerProps {
  onSave?: (meeting: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({ onSave, onCancel, initialData }) => {
  const [meetingData, setMeetingData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    program_id: initialData?.program_id || '',
    meeting_url: initialData?.meeting_url || '',
    scheduled_at: initialData?.scheduled_at || '',
    duration: initialData?.duration || 60,
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData?.scheduled_at ? new Date(initialData.scheduled_at) : new Date()
  );
  const [selectedTime, setSelectedTime] = useState(
    initialData?.scheduled_at 
      ? format(new Date(initialData.scheduled_at), 'HH:mm')
      : '10:00'
  );
  const [selectedStudents, setSelectedStudents] = useState<number[]>(
    initialData?.student_ids || []
  );
  const [recurringPattern, setRecurringPattern] = useState({
    enabled: false,
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    interval: 1,
    endDate: addDays(new Date(), 30),
    daysOfWeek: [] as number[], // 0 = Sunday, 1 = Monday, etc.
  });

  const { data: programs } = useTeacherPrograms();
  const { data: studentsData } = useTeacherStudents(
    meetingData.program_id ? parseInt(meetingData.program_id) : undefined
  );
  const createMeetingMutation = useCreateMeeting();
  const assignStudentsMutation = useAssignStudentsToMeeting();

  const generateMeetingUrl = () => {
    const roomId = `${meetingData.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const url = `https://meet.learnacademy.com/room/${roomId}`;
    setMeetingData({ ...meetingData, meeting_url: url });
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    const allStudentIds = studentsData?.data.data.map(student => student.id) || [];
    setSelectedStudents(allStudentIds);
  };

  const clearStudentSelection = () => {
    setSelectedStudents([]);
  };

  const generateRecurringMeetings = () => {
    if (!selectedDate || !recurringPattern.enabled) return [meetingData];

    const meetings = [];
    let currentDate = new Date(selectedDate);
    const endDate = recurringPattern.endDate;

    while (currentDate <= endDate) {
      const meetingDateTime = new Date(currentDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      meetingDateTime.setHours(hours, minutes, 0, 0);

      meetings.push({
        ...meetingData,
        scheduled_at: meetingDateTime.toISOString(),
        title: `${meetingData.title} - ${format(meetingDateTime, 'MMM dd, yyyy')}`,
      });

      // Calculate next occurrence
      if (recurringPattern.frequency === 'daily') {
        currentDate = addDays(currentDate, recurringPattern.interval);
      } else if (recurringPattern.frequency === 'weekly') {
        currentDate = addDays(currentDate, 7 * recurringPattern.interval);
      } else if (recurringPattern.frequency === 'monthly') {
        currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + recurringPattern.interval));
      }
    }

    return meetings;
  };

  const handleSave = async () => {
    if (!meetingData.title.trim()) {
      toast({
        title: "Error",
        description: "Meeting title is required",
        variant: "destructive",
      });
      return;
    }

    if (!meetingData.program_id || !selectedDate) {
      toast({
        title: "Error",
        description: "Please select a program and date",
        variant: "destructive",
      });
      return;
    }

    if (!meetingData.meeting_url.trim()) {
      toast({
        title: "Error",
        description: "Meeting URL is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const meetings = generateRecurringMeetings();
      
      for (const meeting of meetings) {
        const meetingPayload = {
          ...meeting,
          program_id: parseInt(meeting.program_id),
        };

        const createdMeeting = await createMeetingMutation.mutateAsync(meetingPayload);
        
        // Assign selected students to the meeting
        if (selectedStudents.length > 0) {
          await assignStudentsMutation.mutateAsync({
            meetingId: createdMeeting.id,
            studentIds: selectedStudents,
          });
        }
      }

      toast({
        title: "Success",
        description: `${meetings.length > 1 ? `${meetings.length} meetings` : 'Meeting'} scheduled successfully`,
      });

      if (onSave) {
        onSave(meetings[0]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule meeting",
        variant: "destructive",
      });
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    return eachDayOfInterval({ start, end }).map((date, index) => ({
      day: format(date, 'EEEE'),
      value: index,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meeting Scheduler</h2>
        <div className="flex space-x-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={createMeetingMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {createMeetingMutation.isPending ? 'Scheduling...' : 'Schedule Meeting'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Information</CardTitle>
              <CardDescription>Basic details about your meeting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title *</Label>
                  <Input
                    id="title"
                    value={meetingData.title}
                    onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
                    placeholder="Enter meeting title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program">Program *</Label>
                  <Select
                    value={meetingData.program_id}
                    onValueChange={(value) => setMeetingData({ ...meetingData, program_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs?.data.data.map((program) => (
                        <SelectItem key={program.id} value={program.id.toString()}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={meetingData.description}
                  onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })}
                  placeholder="Describe what this meeting will cover"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="meeting-url">Meeting URL *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateMeetingUrl}
                  >
                    <Video className="h-3 w-3 mr-1" />
                    Generate URL
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Input
                    id="meeting-url"
                    value={meetingData.meeting_url}
                    onChange={(e) => setMeetingData({ ...meetingData, meeting_url: e.target.value })}
                    placeholder="https://meet.learnacademy.com/room/..."
                    className="flex-1"
                  />
                  {meetingData.meeting_url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(meetingData.meeting_url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select
                  value={meetingData.duration.toString()}
                  onValueChange={(value) => setMeetingData({ ...meetingData, duration: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Select Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>

                {selectedDate && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Meeting Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Date:</strong> {format(selectedDate, 'EEEE, MMMM dd, yyyy')}</p>
                      <p><strong>Time:</strong> {selectedTime}</p>
                      <p><strong>Duration:</strong> {meetingData.duration} minutes</p>
                      {selectedDate && selectedTime && (
                        <p><strong>End Time:</strong> {
                          format(
                            new Date(selectedDate.getTime() + 
                              parseInt(selectedTime.split(':')[0]) * 60 * 60 * 1000 + 
                              parseInt(selectedTime.split(':')[1]) * 60 * 1000 + 
                              meetingData.duration * 60 * 1000
                            ), 
                            'HH:mm'
                          )
                        }</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Quick Time Slots</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Assign Students
                  </CardTitle>
                  <CardDescription>
                    Select students to invite to this meeting
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllStudents}
                    disabled={!studentsData?.data.data.length}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearStudentSelection}
                    disabled={selectedStudents.length === 0}
                  >
                    <UserMinus className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {studentsData?.data.data.length ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground mb-4">
                    {selectedStudents.length} of {studentsData.data.data.length} students selected
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {studentsData.data.data.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-2 p-2 border rounded hover:bg-muted cursor-pointer"
                        onClick={() => toggleStudentSelection(student.id)}
                      >
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
                  <p className="text-muted-foreground">
                    {meetingData.program_id 
                      ? 'No students are enrolled in the selected program.'
                      : 'Please select a program first to see enrolled students.'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Meeting</CardTitle>
              <CardDescription>Set up a recurring meeting schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable-recurring"
                  checked={recurringPattern.enabled}
                  onCheckedChange={(checked) => 
                    setRecurringPattern({ ...recurringPattern, enabled: !!checked })
                  }
                />
                <Label htmlFor="enable-recurring">Enable recurring meetings</Label>
              </div>

              {recurringPattern.enabled && (
                <div className="space-y-4 pl-6 border-l-2 border-muted">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={recurringPattern.frequency}
                        onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                          setRecurringPattern({ ...recurringPattern, frequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Repeat every</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          value={recurringPattern.interval}
                          onChange={(e) =>
                            setRecurringPattern({
                              ...recurringPattern,
                              interval: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">
                          {recurringPattern.frequency === 'daily' && 'day(s)'}
                          {recurringPattern.frequency === 'weekly' && 'week(s)'}
                          {recurringPattern.frequency === 'monthly' && 'month(s)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !recurringPattern.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {recurringPattern.endDate ? (
                            format(recurringPattern.endDate, "PPP")
                          ) : (
                            <span>Pick an end date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={recurringPattern.endDate}
                          onSelect={(date) =>
                            setRecurringPattern({ ...recurringPattern, endDate: date || new Date() })
                          }
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {selectedDate && recurringPattern.endDate && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Recurring Schedule Preview</h4>
                      <p className="text-sm text-muted-foreground">
                        This will create approximately{' '}
                        <strong>{generateRecurringMeetings().length}</strong> meetings
                        from {format(selectedDate, 'MMM dd, yyyy')} to{' '}
                        {format(recurringPattern.endDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeetingScheduler;