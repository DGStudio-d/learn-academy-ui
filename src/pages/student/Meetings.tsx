import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  MapPin,
  Search,
  Plus,
  ExternalLink
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface Meeting {
  id: number
  title: string
  teacher: string
  language: string
  type: 'group' | 'individual' | 'workshop'
  date: string
  time: string
  duration: number
  participants: number
  maxParticipants?: number
  status: 'upcoming' | 'ongoing' | 'completed'
  meetingLink?: string
  description: string
}

const mockMeetings: Meeting[] = [
  {
    id: 1,
    title: 'Spanish Conversation Practice',
    teacher: 'María González',
    language: 'Spanish',
    type: 'group',
    date: '2024-03-25',
    time: '14:00',
    duration: 60,
    participants: 6,
    maxParticipants: 8,
    status: 'upcoming',
    meetingLink: 'https://meet.example.com/spanish-conv-1',
    description: 'Practice everyday Spanish conversations and improve your speaking confidence.'
  },
  {
    id: 2,
    title: 'French Grammar Review',
    teacher: 'Jean-Pierre Martin',
    language: 'French',
    type: 'individual',
    date: '2024-03-26',
    time: '16:30',
    duration: 45,
    participants: 1,
    status: 'upcoming',
    meetingLink: 'https://meet.example.com/french-grammar-1',
    description: 'One-on-one session to review past tense and subjunctive mood in French.'
  },
  {
    id: 3,
    title: 'Spanish Culture Workshop',
    teacher: 'Carlos Mendoza',
    language: 'Spanish',
    type: 'workshop',
    date: '2024-03-27',
    time: '18:00',
    duration: 90,
    participants: 12,
    maxParticipants: 15,
    status: 'upcoming',
    description: 'Explore Spanish culture, traditions, and customs from different regions.'
  },
  {
    id: 4,
    title: 'French Pronunciation Clinic',
    teacher: 'Sophie Dubois',
    language: 'French',
    type: 'group',
    date: '2024-03-20',
    time: '15:00',
    duration: 60,
    participants: 5,
    maxParticipants: 6,
    status: 'completed',
    description: 'Master French pronunciation with native speaker guidance.'
  }
]

const getTypeColor = (type: Meeting['type']) => {
  switch (type) {
    case 'individual': return 'bg-blue-100 text-blue-800'
    case 'group': return 'bg-green-100 text-green-800'
    case 'workshop': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusColor = (status: Meeting['status']) => {
  switch (status) {
    case 'upcoming': return 'bg-yellow-100 text-yellow-800'
    case 'ongoing': return 'bg-green-100 text-green-800'
    case 'completed': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function StudentMeetings() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('upcoming')

  const filteredMeetings = mockMeetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.language.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTab = activeTab === 'all' || meeting.status === activeTab
    
    return matchesSearch && matchesTab
  })

  const upcomingMeetings = mockMeetings.filter(m => m.status === 'upcoming')
  const completedMeetings = mockMeetings.filter(m => m.status === 'completed')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Live Sessions</h1>
        <p className="text-muted-foreground">
          Join live classes and practice sessions with teachers and fellow students
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hours This Month
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5</div>
            <p className="text-xs text-muted-foreground">
              +2.5 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sessions Completed
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMeetings.length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by teacher, language, or session name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Request Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingMeetings.filter(meeting => 
              meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              meeting.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
              meeting.language.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((meeting) => (
              <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      <CardDescription>with {meeting.teacher}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getTypeColor(meeting.type)}>
                        {meeting.type}
                      </Badge>
                      <Badge variant="outline">{meeting.language}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {meeting.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(meeting.date).toLocaleDateString()}</span>
                      <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                      <span>{meeting.time} ({meeting.duration} min)</span>
                    </div>
                    
                    {meeting.maxParticipants && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{meeting.participants}/{meeting.maxParticipants} participants</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {meeting.meetingLink ? (
                      <Button className="flex-1" asChild>
                        <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4 mr-2" />
                          Join Meeting
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </a>
                      </Button>
                    ) : (
                      <Button className="flex-1" disabled>
                        <Video className="h-4 w-4 mr-2" />
                        Link Available Soon
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedMeetings.filter(meeting => 
              meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              meeting.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
              meeting.language.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((meeting) => (
              <Card key={meeting.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      <CardDescription>with {meeting.teacher}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(meeting.status)}>
                        completed
                      </Badge>
                      <Badge variant="outline">{meeting.language}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {meeting.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(meeting.date).toLocaleDateString()}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{meeting.duration} min</span>
                  </div>

                  <Button variant="outline" className="w-full" disabled>
                    Session Completed
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMeetings.map((meeting) => (
              <Card key={meeting.id} className={meeting.status === 'completed' ? 'opacity-75' : 'hover:shadow-lg transition-shadow'}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      <CardDescription>with {meeting.teacher}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                      <Badge variant="outline">{meeting.language}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {meeting.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(meeting.date).toLocaleDateString()}</span>
                      <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                      <span>{meeting.time} ({meeting.duration} min)</span>
                    </div>
                  </div>

                  {meeting.status === 'upcoming' && meeting.meetingLink ? (
                    <Button className="w-full" asChild>
                      <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      {meeting.status === 'completed' ? 'Session Completed' : 'Link Available Soon'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredMeetings.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No sessions found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or check back later for new sessions.
            </p>
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}