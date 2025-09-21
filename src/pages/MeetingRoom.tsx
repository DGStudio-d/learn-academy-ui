import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  PhoneOff
} from 'lucide-react';

// Mock meeting data
const mockMeeting = {
  id: 1,
  title: "Spanish Conversation Practice",
  description: "Weekly conversation practice session focusing on everyday scenarios",
  teacher: {
    name: "Maria Rodriguez",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  startTime: "2024-01-20T14:00:00Z",
  duration: 60, // minutes
  participants: [
    {
      id: 1,
      name: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1494790108755-2616b332c913?w=150&h=150&fit=crop&crop=face",
      isTeacher: false
    },
    {
      id: 2,
      name: "Maria Rodriguez", 
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      isTeacher: true
    },
    {
      id: 3,
      name: "John Smith",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      isTeacher: false
    }
  ]
};

export function MeetingRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

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
      description: `Audio ${!isAudioOn ? 'enabled' : 'disabled'}`
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{mockMeeting.title}</CardTitle>
              <CardDescription>{mockMeeting.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meeting Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mockMeeting.teacher.image} alt={mockMeeting.teacher.name} />
                    <AvatarFallback>
                      {mockMeeting.teacher.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{mockMeeting.teacher.name}</div>
                    <div className="text-sm text-muted-foreground">Teacher</div>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{mockMeeting.duration} minutes</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{mockMeeting.participants.length} participants</span>
                  </div>
                </div>
              </div>
              
              {/* Pre-join Controls */}
              <div className="flex justify-center space-x-4">
                <Button
                  variant={isVideoOn ? "default" : "outline"}
                  size="sm"
                  onClick={toggleVideo}
                >
                  {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant={isAudioOn ? "default" : "outline"}
                  size="sm"
                  onClick={toggleAudio}
                >
                  {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={handleJoinMeeting} className="btn-hero">
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Meeting Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">{mockMeeting.title}</h1>
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(meetingDuration)}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {mockMeeting.participants.length} participants
            </span>
          </div>
        </div>
      </div>
      
      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {mockMeeting.participants.map((participant) => (
            <Card key={participant.id} className="bg-gray-900 border-gray-800 relative overflow-hidden">
              <CardContent className="p-0 h-full flex items-center justify-center">
                {/* Video placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={participant.image} alt={participant.name} />
                    <AvatarFallback className="text-white bg-gray-700">
                      {participant.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Participant info overlay */}
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <span className="text-sm font-medium">{participant.name}</span>
                  {participant.isTeacher && (
                    <Badge variant="secondary" className="text-xs">Teacher</Badge>
                  )}
                </div>
                
                {/* Mute indicator */}
                <div className="absolute bottom-4 right-4">
                  <MicOff className="h-4 w-4 text-red-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-gray-900 border-t border-gray-800 p-4">
        <div className="container flex items-center justify-center space-x-4">
          <Button
            variant={isAudioOn ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full h-12 w-12 p-0"
          >
            {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isVideoOn ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full h-12 w-12 p-0"
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="rounded-full h-12 w-12 p-0"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="rounded-full h-12 w-12 p-0"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="rounded-full h-12 w-12 p-0"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={handleLeaveMeeting}
            className="rounded-full h-12 w-12 p-0"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}