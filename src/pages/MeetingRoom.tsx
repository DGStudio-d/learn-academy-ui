import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Users, 
  MessageSquare,
  Share2,
  Settings,
  Clock,
  PhoneOff,
  FileText,
  Download,
  Link,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Monitor,
  Hand,
  Loader2
} from 'lucide-react';
import { useStudentMeeting } from '../hooks/useStudent';

export function MeetingRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Meeting state
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('participants');
  const [chatMessages, setChatMessages] = useState<Array<{
    id: number;
    sender: string;
    message: string;
    timestamp: Date;
    isTeacher?: boolean;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // API hooks
  const { data: meeting, isLoading: meetingLoading, error: meetingError } = useStudentMeeting(Number(meetingId));

  // Meeting timer
  useEffect(() => {
    if (isConnected) {
      const timer = setInterval(() => {
        setMeetingDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinMeeting = () => {
    setIsConnected(true);
    toast({
      title: "Joined meeting",
      description: "You have successfully joined the meeting."
    });
  };

  const handleLeaveMeeting = () => {
    toast({
      title: "Left meeting",
      description: "You have left the meeting."
    });
    navigate('/dashboard');
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toast({
      description: `Video ${!isVideoOn ? 'enabled' : 'disabled'}`
    });
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    toast({
      description: `Microphone ${!isAudioOn ? 'enabled' : 'disabled'}`
    });
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast({
      description: `Speaker ${!isSpeakerOn ? 'enabled' : 'disabled'}`
    });
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast({
      description: `Screen sharing ${!isScreenSharing ? 'started' : 'stopped'}`
    });
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    toast({
      description: `Hand ${!isHandRaised ? 'raised' : 'lowered'}`
    });
  };

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: 'You',
        message: newMessage.trim(),
        timestamp: new Date(),
        isTeacher: false
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  // Loading and error states
  if (meetingLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading meeting...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (meetingError || !meeting) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Meeting Unavailable</CardTitle>
              <CardDescription>
                {meetingError?.message || 'Unable to load meeting details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Pre-join lobby
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container py-12">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{meeting.title}</CardTitle>
              <CardDescription className="text-lg">{meeting.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Meeting Info */}
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={meeting.teacher?.profile_image} alt={meeting.teacher?.name} />
                    <AvatarFallback className="text-lg">
                      {meeting.teacher?.name?.split(' ').map((n: string) => n[0]).join('') || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <div className="text-xl font-semibold">{meeting.teacher?.name || 'Teacher'}</div>
                    <div className="text-muted-foreground">Instructor</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{meeting.duration || 60} min</div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{meeting.attendees?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Attendees</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{meeting.resources?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Resources</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Video className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">HD</div>
                    <div className="text-sm text-muted-foreground">Quality</div>
                  </div>
                </div>
              </div>

              {/* Meeting Resources Preview */}
              {meeting.resources && meeting.resources.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Meeting Resources</h3>
                  <div className="grid gap-2">
                    {meeting.resources.slice(0, 3).map((resource: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{resource.name || `Resource ${index + 1}`}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Pre-join Controls */}
              <div className="space-y-4">
                <h3 className="font-semibold text-center">Check your setup</h3>
                <div className="flex justify-center space-x-4">
                  <Button
                    variant={isVideoOn ? "default" : "outline"}
                    size="lg"
                    onClick={toggleVideo}
                  >
                    {isVideoOn ? <Video className="h-5 w-5 mr-2" /> : <VideoOff className="h-5 w-5 mr-2" />}
                    {isVideoOn ? 'Camera On' : 'Camera Off'}
                  </Button>
                  <Button
                    variant={isAudioOn ? "default" : "outline"}
                    size="lg"
                    onClick={toggleAudio}
                  >
                    {isAudioOn ? <Mic className="h-5 w-5 mr-2" /> : <MicOff className="h-5 w-5 mr-2" />}
                    {isAudioOn ? 'Mic On' : 'Mic Off'}
                  </Button>
                  <Button
                    variant={isSpeakerOn ? "default" : "outline"}
                    size="lg"
                    onClick={toggleSpeaker}
                  >
                    {isSpeakerOn ? <Volume2 className="h-5 w-5 mr-2" /> : <VolumeX className="h-5 w-5 mr-2" />}
                    {isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={handleJoinMeeting} size="lg" className="bg-green-600 hover:bg-green-700">
                  <Video className="h-5 w-5 mr-2" />
                  Join Meeting
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Main meeting interface
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Enhanced Meeting Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">{meeting.title}</h1>
            <Badge variant="secondary" className="bg-green-600">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(meetingDuration)}
            </Badge>
            {isHandRaised && (
              <Badge variant="secondary" className="bg-yellow-600">
                <Hand className="h-3 w-3 mr-1" />
                Hand Raised
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {meeting.attendees?.length || 0} participants
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Generate participant video tiles */}
            {Array.from({ length: meeting.attendees?.length || 3 }, (_, index) => {
              const participant = meeting.attendees?.[index] || {
                id: index + 1,
                name: index === 0 ? meeting.teacher?.name || 'Teacher' : `Student ${index}`,
                isTeacher: index === 0,
                profile_image: meeting.teacher?.profile_image
              };
              
              return (
                <Card key={participant.id} className="bg-gray-900 border-gray-800 relative overflow-hidden">
                  <CardContent className="p-0 h-full flex items-center justify-center">
                    {/* Video placeholder with enhanced UI */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={participant.profile_image} alt={participant.name} />
                        <AvatarFallback className="text-white bg-gray-700 text-lg">
                          {participant.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Screen sharing indicator */}
                      {isScreenSharing && index === 0 && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="bg-blue-600">
                            <Monitor className="h-3 w-3 mr-1" />
                            Sharing
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Enhanced participant info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{participant.name}</span>
                          {participant?.isTeacher && (
                            <Badge variant="secondary" className="text-xs bg-purple-600">
                              Teacher
                            </Badge>
                          )}
                        </div>
                        
                        {/* Audio/Video indicators */}
                        <div className="flex items-center space-x-1">
                          {!isAudioOn && (
                            <div className="p-1 bg-red-600 rounded-full">
                              <MicOff className="h-3 w-3" />
                            </div>
                          )}
                          {!isVideoOn && (
                            <div className="p-1 bg-red-600 rounded-full">
                              <VideoOff className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
        {/* Enhanced Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="participants" className="text-xs">
                <Users className="h-4 w-4 mr-1" />
                People
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-xs">
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs">
                <FileText className="h-4 w-4 mr-1" />
                Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="flex-1 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Participants ({meeting.attendees?.length || 0})</h3>
                  {Array.from({ length: meeting.attendees?.length || 3 }, (_, index) => {
                    const participant = meeting.attendees?.[index] || {
                      name: index === 0 ? meeting.teacher?.name || 'Teacher' : `Student ${index}`,
                      isTeacher: index === 0
                    };
                    
                    return (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {participant.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{participant.name}</div>
                          {participant?.isTeacher && (
                            <div className="text-xs text-purple-400">Teacher</div>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium">{msg.sender}</span>
                        <span className="text-xs text-gray-400">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm bg-gray-800 p-2 rounded">{msg.message}</div>
                    </div>
                  ))}
                  {chatMessages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-8">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-gray-800">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-400"
                  />
                  <Button size="sm" onClick={sendChatMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="flex-1 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Meeting Resources</h3>
                  {meeting.resources && meeting.resources.length > 0 ? (
                    meeting.resources.map((resource: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <div>
                            <div className="text-sm font-medium">{resource.name || `Resource ${index + 1}`}</div>
                            <div className="text-xs text-gray-400">{resource.type || 'Document'}</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 text-sm py-8">
                      No resources shared yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Enhanced Controls */}
      <div className="bg-gray-900 border-t border-gray-800 p-4">
        <div className="container flex items-center justify-center space-x-3">
          {/* Audio Control */}
          <Button
            variant={isAudioOn ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full h-14 w-14 p-0"
            title={isAudioOn ? "Mute microphone" : "Unmute microphone"}
          >
            {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>
          
          {/* Video Control */}
          <Button
            variant={isVideoOn ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full h-14 w-14 p-0"
            title={isVideoOn ? "Turn off camera" : "Turn on camera"}
          >
            {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>
          
          {/* Speaker Control */}
          <Button
            variant={isSpeakerOn ? "default" : "outline"}
            size="lg"
            onClick={toggleSpeaker}
            className="rounded-full h-14 w-14 p-0"
            title={isSpeakerOn ? "Mute speaker" : "Unmute speaker"}
          >
            {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </Button>
          
          {/* Screen Share */}
          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={toggleScreenShare}
            className="rounded-full h-14 w-14 p-0"
            title={isScreenSharing ? "Stop sharing" : "Share screen"}
          >
            <Monitor className="h-6 w-6" />
          </Button>
          
          {/* Raise Hand */}
          <Button
            variant={isHandRaised ? "default" : "outline"}
            size="lg"
            onClick={toggleHandRaise}
            className="rounded-full h-14 w-14 p-0"
            title={isHandRaised ? "Lower hand" : "Raise hand"}
          >
            <Hand className="h-6 w-6" />
          </Button>
          
          {/* Settings */}
          <Button
            variant="outline"
            size="lg"
            className="rounded-full h-14 w-14 p-0"
            title="Settings"
          >
            <Settings className="h-6 w-6" />
          </Button>
          
          {/* Leave Meeting */}
          <Button
            variant="destructive"
            size="lg"
            onClick={handleLeaveMeeting}
            className="rounded-full h-14 w-14 p-0"
            title="Leave meeting"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;
