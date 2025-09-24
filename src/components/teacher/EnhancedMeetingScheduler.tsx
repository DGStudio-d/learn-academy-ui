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
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
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
  ExternalLink,
  Bell,
  FileText,
  Upload,
  X,
  Settings,
  Repeat,
  AlertCircle
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, addMonths } from 'date-fns';
import { cn } from '../../lib/utils';
import { 
  useTeacherPrograms, 
  useTeacherStudents, 
  useCreateMeeting,
  useAssignStudentsToMeeting,
  useAddMeetingResource
} from '../../hooks/useTeacher';
import { toast } from '../ui/use-toast';
import type { RecurringPattern, ReminderSettings, MeetingResource } from '../../types/api';

interface EnhancedMeetingSchedulerProps {
  onSave?: (meeting: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

export const EnhancedMeetingScheduler: React.FC<EnhancedMeetingSchedulerProps> = ({ 
  onSave, 
  onCancel, 
  initialData 
}) => {
  const [meetingData, setMeetingData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    program_id: initialData?.program_id || '',
    meeting_url: initialData?.meeting_url || '',
    scheduled_at: initialData?.scheduled_at || '',
    duration: initialData?.duration || 60,
    attendance_tracking_enabled: initialData?.attendance_tracking_enabled ?? true,
    notifications_enabled: initialData?.notifications_enabled ?? true,
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

  // Recurring pattern state
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>({
    frequency: 'weekly',
    interval: 1,
    days_of_week: [],
    end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    max_occurrences: undefined,
  });
  const [isRecurring, setIsRecurring] = useState(false);

  // Reminder settings state
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    email_reminders: true,
    sms_reminders: false,
    reminder_times: [15, 60, 1440], // 15min, 1hr, 1day
    custom_message: '',
  });

  // Resources state
  const [resources, setResources] = useState<Array<{
    name: string;
    description?: string;
    file?: File;
    file_url?: string;
    file_type?: string;
    is_downloadable: boolean;
  }>>([]);

  const { data: programs } = useTeacherPrograms();
  const { data: studentsData } = useTeacherStudents(
    meetingData.program_id ? parseInt(meetingData.program_id) : undefined
  );
  const createMeetingMutation = useCreateMeeting();
  const assignStudentsMutation = useAssignStudentsToMeeting();
  const addResourceMutation = useAddMeetingResource();

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

  const addResource = () => {
    setResources(prev => [...prev, {
      name: '',
      description: '',
      is_downloadable: true,
    }]);
  };

  const updateResource = (index: number, updates: Partial<typeof resources[0]>) => {
    setResources(prev => prev.map((resource, i) => 
      i === index ? { ...resource, ...updates } : resource
    ));
  };

  const removeResource = (index: number) => {
    setResources(prev => prev.filter((_, i) => i !== index));
  };

  const generateRecurringMeetings = () => {
    if (!selectedDate || !isRecurring) return [meetingData];

    const meetings = [];
    let currentDate = new Date(selectedDate);
    const endDate = recurringPattern.end_date ? new Date(recurringPattern.end_date) : addDays(new Date(), 30);
    let occurrenceCount = 0;

    while (currentDate <= endDate && (!recurringPattern.max_occurrences || occurrenceCount < recurringPattern.max_occurrences)) {
      const meetingDateTime = new Date(currentDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      meetingDateTime.setHours(hours, minutes, 0, 0);

      meetings.push({
        ...meetingData,
        scheduled_at: meetingDateTime.toISOString(),
        title: `${meetingData.title} - ${format(meetingDateTime, 'MMM dd, yyyy')}`,
        recurring_pattern: recurringPattern,
      });

      // Calculate next occurrence
      if (recurringPattern.frequency === 'daily') {
        currentDate = addDays(currentDate, recurringPattern.interval);
      } else if (recurringPattern.frequency === 'weekly') {
        currentDate = addWeeks(currentDate, recurringPattern.interval);
      } else if (recurringPattern.frequency === 'monthly') {
        currentDate = addMonths(currentDate, recurringPattern.interval);
      }

      occurrenceCount++;
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
          recurring_pattern: isRecurring ? recurringPattern : undefined,
          reminder_settings: reminderSettings,
          resources: resources.filter(r => r.name.trim()),
        };

        const createdMeeting = await createMeetingMutation.mutateAsync(meetingPayload);
        
        // Assign selected students to the meeting
        if (selectedStudents.length > 0) {
          await assignStudentsMutation.mutateAsync({
            meetingId: createdMeeting.id,
            studentIds: selectedStudents,
          });
        }

        // Add resources if any
        for (const resource of resources.filter(r => r.name.trim())) {
          await addResourceMutation.mutateAsync({
            meetingId: createdMeeting.id,
            resourceData: resource,
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
        <h2 className="text-2xl font-bold">Enhanced Meeting Scheduler</h2>
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="attendance-tracking">Attendance Tracking</Label>
                    <Switch
                      id="attendance-tracking"
                      checked={meetingData.attendance_tracking_enabled}
                      onCheckedChange={(checked) => 
                        setMeetingData({ ...meetingData, attendance_tracking_enabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Enable Notifications</Label>
                    <Switch
                      id="notifications"
                      checked={meetingData.notifications_enabled}
                      onCheckedChange={(checked) => 
                        setMeetingData({ ...meetingData, notifications_enabled: checked })
                      }
                    />
                  </div>
                </div>
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
              <CardTitle className="flex items-center">
                <Repeat className="h-5 w-5 mr-2" />
                Recurring Meeting
              </CardTitle>
              <CardDescription>Set up a recurring meeting schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label htmlFor="enable-recurring">Enable recurring meetings</Label>
              </div>

              {isRecurring && (
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
                    <Input
                      type="date"
                      value={recurringPattern.end_date}
                      onChange={(e) =>
                        setRecurringPattern({ ...recurringPattern, end_date: e.target.value })
                      }
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Maximum Occurrences (optional)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={recurringPattern.max_occurrences || ''}
                      onChange={(e) =>
                        setRecurringPattern({
                          ...recurringPattern,
                          max_occurrences: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="Leave empty for no limit"
                    />
                  </div>

                  {selectedDate && recurringPattern.end_date && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Recurring Schedule Preview</h4>
                      <p className="text-sm text-muted-foreground">
                        This will create approximately{' '}
                        <strong>{generateRecurringMeetings().length}</strong> meetings
                        from {format(selectedDate, 'MMM dd, yyyy')} to{' '}
                        {format(new Date(recurringPattern.end_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure meeting reminders and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-reminders">Email Reminders</Label>
                  <Switch
                    id="email-reminders"
                    checked={reminderSettings.email_reminders}
                    onCheckedChange={(checked) => 
                      setReminderSettings({ ...reminderSettings, email_reminders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-reminders">SMS Reminders</Label>
                  <Switch
                    id="sms-reminders"
                    checked={reminderSettings.sms_reminders || false}
                    onCheckedChange={(checked) => 
                      setReminderSettings({ ...reminderSettings, sms_reminders: checked })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Reminder Times</Label>
                <div className="space-y-2">
                  {[
                    { value: 15, label: '15 minutes before' },
                    { value: 60, label: '1 hour before' },
                    { value: 1440, label: '1 day before' },
                    { value: 10080, label: '1 week before' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        checked={reminderSettings.reminder_times.includes(option.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setReminderSettings({
                              ...reminderSettings,
                              reminder_times: [...reminderSettings.reminder_times, option.value],
                            });
                          } else {
                            setReminderSettings({
                              ...reminderSettings,
                              reminder_times: reminderSettings.reminder_times.filter(t => t !== option.value),
                            });
                          }
                        }}
                      />
                      <Label>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-message">Custom Reminder Message (optional)</Label>
                <Textarea
                  id="custom-message"
                  value={reminderSettings.custom_message}
                  onChange={(e) => 
                    setReminderSettings({ ...reminderSettings, custom_message: e.target.value })
                  }
                  placeholder="Add a custom message to include in reminders..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Meeting Resources
                  </CardTitle>
                  <CardDescription>
                    Add files and links for meeting participants
                  </CardDescription>
                </div>
                <Button onClick={addResource} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {resources.length > 0 ? (
                <div className="space-y-4">
                  {resources.map((resource, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Resource {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeResource(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Resource Name *</Label>
                          <Input
                            value={resource.name}
                            onChange={(e) => updateResource(index, { name: e.target.value })}
                            placeholder="Enter resource name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>File Type</Label>
                          <Select
                            value={resource.file_type || ''}
                            onValueChange={(value) => updateResource(index, { file_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select file type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF Document</SelectItem>
                              <SelectItem value="doc">Word Document</SelectItem>
                              <SelectItem value="ppt">Presentation</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="link">External Link</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={resource.description}
                          onChange={(e) => updateResource(index, { description: e.target.value })}
                          placeholder="Describe this resource..."
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>File or URL</Label>
                        <div className="flex space-x-2">
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                updateResource(index, { file });
                              }
                            }}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground self-center">or</span>
                          <Input
                            value={resource.file_url || ''}
                            onChange={(e) => updateResource(index, { file_url: e.target.value })}
                            placeholder="https://..."
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={resource.is_downloadable}
                          onCheckedChange={(checked) => 
                            updateResource(index, { is_downloadable: !!checked })
                          }
                        />
                        <Label>Allow download</Label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Resources Added</h3>
                  <p className="text-muted-foreground mb-4">
                    Add files, documents, or links for meeting participants
                  </p>
                  <Button onClick={addResource}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Resource
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedMeetingScheduler;