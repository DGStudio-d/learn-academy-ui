import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Video, 
  Calendar, 
  Clock,
  Users,
  ExternalLink,
  Play,
  FileText,
  Download,
  Loader2,
  CalendarDays,
  MapPin,
  Bell,
  CheckCircle,
  AlertCircle,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  useStudentMeetings, 
  useMeetingResources, 
  useDownloadMeetingResource,
  useMeetingAttendanceHistory,
  useJoinMeeting
} from '../../hooks/useStudent';
import { toast } from '../ui/use-toast';

interface MeetingAccessInterfaceProps {
  meetings: any;
  isLoading: boolean;
}

export function MeetingAccessInterface({ meetings, isLoading }: MeetingAccessInterfaceProps) {
  const navigate = useNavigate();
  const { data: allMeetingsData, isLoading: allMeetingsLoading } = useStudentMeetings();
  const { data: attendanceHistory } = useMeetingAttendanceHistory();
  const joinMeetingMutation = useJoinMeeting();
  const downloadResourceMutation = useDownloadMeetingResource();

  const handleJoinMeeting = async (meetingId: number) => {
    try {
      const result = await joinMeetingMutation.mutateAsync(meetingId);
      // Navigate to meeting room with session data
      navigate(`/meeting/${meetingId}?session=${result.session_id}`);
      toast({
        title: "Joining Meeting",
        description: "You are being connected to the meeting room.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join meeting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadResource = async (meetingId: number, resourceId: number) => {
    try {
      await downloadResourceMutation.mutateAsync({ meetingId, resourceId });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  const upcomingMeetings = meetings?.data?.data || [];
  const allMeetings = allMeetingsData?.data?.data || [];

  const renderUpcomingMeetings = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    if (upcomingMeetings.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No upcoming meetings</h3>
          <p className="text-sm">Check back later for scheduled sessions with your teachers</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {upcomingMeetings.map((meeting: any) => {
          const meetingDate = new Date(meeting.scheduled_at);
          const now = new Date();
          const isLive = meetingDate <= now && meetingDate.getTime() + (meeting.duration * 60 * 1000) > now.getTime();
          const isStartingSoon = meetingDate.getTime() - now.getTime() < 15 * 60 * 1000 && meetingDate > now; // 15 minutes

          return (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isLive ? 'bg-red-500/10' : isStartingSoon ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                      }`}>
                        <Video className={`h-5 w-5 ${
                          isLive ? 'text-red-500' : isStartingSoon ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                        <CardDescription>{meeting.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {isLive && (
                      <Badge variant="destructive" className="animate-pulse">
                        Live Now
                      </Badge>
                    )}
                    {isStartingSoon && !isLive && (
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700">
                        Starting Soon
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {meeting.duration || 60} min
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Teacher Info */}
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={meeting.teacher?.profile_image} />
                    <AvatarFallback>
                      {meeting.teacher?.name?.split(' ').map((n: string) => n[0]).join('') || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{meeting.teacher?.name || 'Teacher'}</p>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                  </div>
                </div>

                {/* Meeting Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>{meetingDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{meeting.attendees?.length || 0} attendees</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Online</span>
                  </div>
                </div>

                {/* Meeting Resources */}
                <MeetingResourcesSection 
                  meetingId={meeting.id} 
                  onDownload={handleDownloadResource}
                />

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleJoinMeeting(meeting.id)}
                    disabled={(!isLive && !isStartingSoon) || joinMeetingMutation.isPending}
                    variant={isLive ? "default" : isStartingSoon ? "secondary" : "outline"}
                  >
                    {joinMeetingMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : isLive ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Join Now
                      </>
                    ) : isStartingSoon ? (
                      <>
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Scheduled
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(meeting.meeting_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                {/* Time until meeting */}
                {!isLive && meetingDate > now && (
                  <div className="text-center text-sm text-muted-foreground">
                    {isStartingSoon ? (
                      <span className="text-yellow-600 font-medium">
                        Starting in {Math.ceil((meetingDate.getTime() - now.getTime()) / (1000 * 60))} minutes
                      </span>
                    ) : (
                      <span>
                        Starts in {Math.ceil((meetingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderAllMeetings = () => {
    if (allMeetingsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    if (allMeetings.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No meetings scheduled</h3>
          <p className="text-sm">Your teachers will schedule meetings for your programs</p>
        </div>
      );
    }

    // Group meetings by status
    const now = new Date();
    const upcoming = allMeetings.filter((m: any) => new Date(m.scheduled_at) > now);
    const past = allMeetings.filter((m: any) => new Date(m.scheduled_at) <= now);

    return (
      <div className="space-y-6">
        {/* Upcoming Meetings */}
        {upcoming.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
            <div className="grid gap-4">
              {upcoming.map((meeting: any) => (
                <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Video className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">{meeting.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(meeting.scheduled_at).toLocaleString()} • {meeting.duration || 60} min
                          </p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleJoinMeeting(meeting.id)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Meetings */}
        {past.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Past Meetings</h3>
            <div className="grid gap-4">
              {past.slice(0, 10).map((meeting: any) => (
                <Card key={meeting.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-500/10 rounded-lg">
                          <Video className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">{meeting.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(meeting.scheduled_at).toLocaleString()} • {meeting.duration || 60} min
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Meeting Center</h2>
        <p className="text-muted-foreground">Join live sessions and access meeting resources</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="flex items-center space-x-2">
            <Play className="h-4 w-4" />
            <span>Upcoming</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>All Meetings</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Attendance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {renderUpcomingMeetings()}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {renderAllMeetings()}
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <AttendanceHistorySection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Meeting Resources Component
const MeetingResourcesSection: React.FC<{
  meetingId: number;
  onDownload: (meetingId: number, resourceId: number) => void;
}> = ({ meetingId, onDownload }) => {
  const { data: resources, isLoading } = useMeetingResources(meetingId);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading resources...</span>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Resources</h4>
      <div className="flex flex-wrap gap-2">
        {resources.map((resource) => (
          <Button 
            key={resource.id} 
            variant="outline" 
            size="sm"
            onClick={() => onDownload(meetingId, resource.id)}
          >
            <FileText className="h-3 w-3 mr-1" />
            {resource.name}
            <Download className="h-3 w-3 ml-1" />
          </Button>
        ))}
      </div>
    </div>
  );
};

// Attendance History Component
const AttendanceHistorySection: React.FC = () => {
  const { data: attendanceData, isLoading } = useMeetingAttendanceHistory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!attendanceData?.data?.data || attendanceData.data.data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Attendance History</h3>
        <p className="text-sm">Your meeting attendance will appear here after joining meetings</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Attendance History</h3>
        <Badge variant="outline">
          {attendanceData.data.data.length} meetings attended
        </Badge>
      </div>

      <ScrollArea className="h-96">
        <div className="space-y-3">
          {attendanceData.data.data.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Meeting #{record.meeting_id}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {record.joined_at && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Joined: {new Date(record.joined_at).toLocaleString()}</span>
                        </div>
                      )}
                      {record.left_at && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Left: {new Date(record.left_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    {record.duration_minutes && (
                      <div className="text-sm text-muted-foreground">
                        Duration: {record.duration_minutes} minutes
                      </div>
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
                    {record.attendance_status === 'no_show' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {record.attendance_status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};