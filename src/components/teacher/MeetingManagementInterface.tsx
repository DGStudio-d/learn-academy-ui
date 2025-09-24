import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  Clock,
  Play,
  Pause,
  Square,
  Download,
  FileText,
  Bell,
  Settings,
  BarChart3,
  UserCheck,
  UserX,
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  useMeetingSession,
  useMeetingAttendanceRecords,
  useStartMeetingRecording,
  useStopMeetingRecording,
  useSendMeetingNotifications,
  useMeetingNotifications
} from '../../hooks/useTeacher';
import { toast } from '../ui/use-toast';
import type { Meeting, MeetingSession, MeetingAttendanceRecord } from '../../types/api';

interface MeetingManagementInterfaceProps {
  meeting: Meeting;
  isLive?: boolean;
  onClose?: () => void;
}

export const MeetingManagementInterface: React.FC<MeetingManagementInterfaceProps> = ({
  meeting,
  isLive = false,
  onClose
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isRecordingActive, setIsRecordingActive] = useState(false);

  // API hooks
  const { data: sessionData, isLoading: sessionLoading } = useMeetingSession(meeting.id);
  const { data: attendanceRecords, isLoading: attendanceLoading } = useMeetingAttendanceRecords(meeting.id);
  const { data: notifications } = useMeetingNotifications(meeting.id);
  const startRecordingMutation = useStartMeetingRecording();
  const stopRecordingMutation = useStopMeetingRecording();
  const sendNotificationMutation = useSendMeetingNotifications();

  // Recording timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecordingActive) {
      timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecordingActive]);

  // Update recording status from session data
  useEffect(() => {
    if (sessionData) {
      setIsRecordingActive(sessionData.recording_status === 'recording');
    }
  }, [sessionData]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      await startRecordingMutation.mutateAsync(meeting.id);
      setIsRecordingActive(true);
      setRecordingDuration(0);
      toast({
        title: "Recording Started",
        description: "Meeting recording has been started successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await stopRecordingMutation.mutateAsync(meeting.id);
      setIsRecordingActive(false);
      toast({
        title: "Recording Stopped",
        description: `Recording saved successfully. Duration: ${formatDuration(result.duration)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendNotification = async (type: 'reminder' | 'started' | 'ended') => {
    try {
      await sendNotificationMutation.mutateAsync({
        meetingId: meeting.id,
        notificationData: { type }
      });
      toast({
        title: "Notification Sent",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} notification sent to all participants.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAttendanceStats = () => {
    if (!attendanceRecords) return { total: 0, joined: 0, present: 0, absent: 0 };
    
    const total = attendanceRecords.length;
    const joined = attendanceRecords.filter(record => record.attendance_status === 'joined').length;
    const present = attendanceRecords.filter(record => 
      record.attendance_status === 'joined' || record.attendance_status === 'left'
    ).length;
    const absent = attendanceRecords.filter(record => record.attendance_status === 'no_show').length;

    return { total, joined, present, absent };
  };

  const attendanceStats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{meeting.title}</h2>
          <p className="text-muted-foreground">
            {format(new Date(meeting.scheduled_at), 'EEEE, MMMM dd, yyyy • HH:mm')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isLive && (
            <Badge variant="destructive" className="animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-2" />
              Live
            </Badge>
          )}
          <Badge variant="outline">
            {meeting.duration || 60} min
          </Badge>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{attendanceStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Invited</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{attendanceStats.joined}</p>
                <p className="text-sm text-muted-foreground">Currently Joined</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{attendanceStats.present}</p>
                <p className="text-sm text-muted-foreground">Attended</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{attendanceStats.absent}</p>
                <p className="text-sm text-muted-foreground">No Show</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recording Controls */}
      {isLive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Recording Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {isRecordingActive ? (
                  <Button 
                    variant="destructive" 
                    onClick={handleStopRecording}
                    disabled={stopRecordingMutation.isPending}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStartRecording}
                    disabled={startRecordingMutation.isPending}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                )}
                
                {isRecordingActive && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-mono text-lg">{formatDuration(recordingDuration)}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSendNotification('started')}
                  disabled={sendNotificationMutation.isPending}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notify Started
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSendNotification('ended')}
                  disabled={sendNotificationMutation.isPending}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notify Ended
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meeting Details */}
            <Card>
              <CardHeader>
                <CardTitle>Meeting Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {meeting.description || 'No description provided'}
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Program</p>
                    <p className="text-muted-foreground">{meeting.program?.name}</p>
                  </div>
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">{meeting.duration || 60} minutes</p>
                  </div>
                  <div>
                    <p className="font-medium">Meeting URL</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-muted-foreground truncate">{meeting.meeting_url}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(meeting.meeting_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Status</p>
                    <Badge variant={isLive ? "destructive" : "secondary"}>
                      {isLive ? 'Live' : 'Scheduled'}
                    </Badge>
                  </div>
                </div>

                {meeting.recording_url && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Recording</h4>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Recording
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Live Session Info */}
            {sessionData && (
              <Card>
                <CardHeader>
                  <CardTitle>Live Session</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Session ID</p>
                      <p className="text-muted-foreground font-mono">{sessionData.session_id}</p>
                    </div>
                    <div>
                      <p className="font-medium">Started At</p>
                      <p className="text-muted-foreground">
                        {format(new Date(sessionData.start_time), 'HH:mm:ss')}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Participants</p>
                      <p className="text-muted-foreground">{sessionData.participants?.length || 0}</p>
                    </div>
                    <div>
                      <p className="font-medium">Recording Status</p>
                      <Badge variant={sessionData.recording_status === 'recording' ? "destructive" : "secondary"}>
                        {sessionData.recording_status}
                      </Badge>
                    </div>
                  </div>

                  {sessionData.participants && sessionData.participants.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Active Participants</h4>
                        <div className="space-y-2">
                          {sessionData.participants.map((participant, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={participant.user?.profile_image} />
                                  <AvatarFallback className="text-xs">
                                    {participant.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{participant.user?.name || 'Unknown'}</span>
                                {participant.is_host && (
                                  <Badge variant="secondary" className="text-xs">Host</Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                {participant.audio_enabled ? (
                                  <Mic className="h-3 w-3 text-green-500" />
                                ) : (
                                  <MicOff className="h-3 w-3 text-red-500" />
                                )}
                                {participant.video_enabled ? (
                                  <Video className="h-3 w-3 text-green-500" />
                                ) : (
                                  <VideoOff className="h-3 w-3 text-red-500" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Attendance Tracking</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {attendanceStats.present}/{attendanceStats.total} Present
                  </Badge>
                  <Progress 
                    value={(attendanceStats.present / attendanceStats.total) * 100} 
                    className="w-24"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : attendanceRecords && attendanceRecords.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {attendanceRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={record.user?.profile_image} />
                            <AvatarFallback className="text-xs">
                              {record.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{record.user?.name}</p>
                            <p className="text-sm text-muted-foreground">{record.user?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right text-sm">
                            {record.joined_at && (
                              <p>Joined: {format(new Date(record.joined_at), 'HH:mm')}</p>
                            )}
                            {record.left_at && (
                              <p>Left: {format(new Date(record.left_at), 'HH:mm')}</p>
                            )}
                            {record.duration_minutes && (
                              <p className="text-muted-foreground">
                                Duration: {record.duration_minutes}m
                              </p>
                            )}
                          </div>
                          
                          <Badge 
                            variant={
                              record.attendance_status === 'joined' ? 'default' :
                              record.attendance_status === 'left' ? 'secondary' :
                              record.attendance_status === 'no_show' ? 'destructive' :
                              'outline'
                            }
                          >
                            {record.attendance_status === 'joined' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {record.attendance_status === 'no_show' && <XCircle className="h-3 w-3 mr-1" />}
                            {record.attendance_status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Attendance Data</h3>
                  <p className="text-muted-foreground">
                    Attendance will be tracked when participants join the meeting
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Resources</CardTitle>
              <CardDescription>
                Files and links shared with participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {meeting.resources && meeting.resources.length > 0 ? (
                <div className="space-y-3">
                  {meeting.resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{resource.name}</p>
                          {resource.description && (
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {resource.file_type || 'Unknown'}
                            </Badge>
                            {resource.file_size && (
                              <span className="text-xs text-muted-foreground">
                                {(resource.file_size / 1024 / 1024).toFixed(1)} MB
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {resource.is_downloadable && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {resource.file_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(resource.file_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Resources</h3>
                  <p className="text-muted-foreground">
                    No files or resources have been shared for this meeting
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notifications</CardTitle>
                <Button 
                  size="sm"
                  onClick={() => handleSendNotification('reminder')}
                  disabled={sendNotificationMutation.isPending}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notifications && notifications.length > 0 ? (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{notification.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {notification.sent_at 
                              ? format(new Date(notification.sent_at), 'MMM dd, HH:mm')
                              : 'Pending'
                            }
                          </span>
                        </div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge 
                            variant={
                              notification.status === 'sent' ? 'default' :
                              notification.status === 'failed' ? 'destructive' :
                              'secondary'
                            }
                            className="text-xs"
                          >
                            {notification.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                  <p className="text-muted-foreground">
                    No notifications have been sent for this meeting yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeetingManagementInterface;