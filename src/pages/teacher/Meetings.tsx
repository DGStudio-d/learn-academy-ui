import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuth } from '@/contexts/AuthContext'
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Video,
  Users,
  Clock,
  Calendar as CalendarIcon,
  MapPin,
  Link as LinkIcon,
  Settings,
  Save,
  X,
  Phone,
  Monitor,
  Mic,
  MicOff,
  VideoOff,
  Share,
  MessageSquare,
  UserPlus,
  Send
} from 'lucide-react'

interface Meeting {
  id: string
  title: string
  description: string
  type: 'group' | 'individual' | 'webinar'
  language: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All'
  startTime: string
  endTime: string
  duration: number // in minutes
  maxParticipants: number
  currentParticipants: number
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  meetingLink: string
  isRecurring: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly'
  students: string[]
  createdAt: string
}

interface CreateMeetingData {
  title: string
  description: string
  type: 'group' | 'individual' | 'webinar'
  language: string
  level: string
  date: Date | undefined
  startTime: string
  duration: number
  maxParticipants: number
  isRecurring: boolean
  recurringPattern: string
  sendInvitations: boolean
  recordMeeting: boolean
  requireApproval: boolean
}

const TeacherMeetings: React.FC = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterLanguage, setFilterLanguage] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showMeetingDialog, setShowMeetingDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming')

  // Mock meeting data
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Spanish Conversation Practice',
      description: 'Interactive conversation session focusing on daily situations and vocabulary building.',
      type: 'group',
      language: 'Spanish',
      level: 'Intermediate',
      startTime: '2024-03-20T10:00:00',
      endTime: '2024-03-20T11:00:00',
      duration: 60,
      maxParticipants: 8,
      currentParticipants: 6,
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/spanish-conv-001',
      isRecurring: true,
      recurringPattern: 'weekly',
      students: ['maria.rodriguez@email.com', 'john.smith@email.com'],
      createdAt: '2024-03-15'
    },
    {
      id: '2',
      title: 'French Grammar Deep Dive',
      description: 'Comprehensive review of French grammar rules with practical exercises.',
      type: 'group',
      language: 'French',
      level: 'Advanced',
      startTime: '2024-03-20T14:30:00',
      endTime: '2024-03-20T16:00:00',
      duration: 90,
      maxParticipants: 10,
      currentParticipants: 8,
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/french-grammar-002',
      isRecurring: false,
      students: ['emma.johnson@email.com', 'ahmed.hassan@email.com'],
      createdAt: '2024-03-18'
    },
    {
      id: '3',
      title: 'Portuguese Pronunciation Workshop',
      description: 'One-on-one session to improve Portuguese pronunciation and accent.',
      type: 'individual',
      language: 'Portuguese',
      level: 'Beginner',
      startTime: '2024-03-19T09:00:00',
      endTime: '2024-03-19T09:45:00',
      duration: 45,
      maxParticipants: 1,
      currentParticipants: 1,
      status: 'completed',
      meetingLink: 'https://meet.example.com/portuguese-pron-003',
      isRecurring: false,
      students: ['sophie.chen@email.com'],
      createdAt: '2024-03-17'
    }
  ])

  // Create meeting form state
  const [createMeetingData, setCreateMeetingData] = useState<CreateMeetingData>({
    title: '',
    description: '',
    type: 'group',
    language: '',
    level: '',
    date: undefined,
    startTime: '',
    duration: 60,
    maxParticipants: 8,
    isRecurring: false,
    recurringPattern: 'weekly',
    sendInvitations: true,
    recordMeeting: false,
    requireApproval: false
  })

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || meeting.type === filterType
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus
    const matchesLanguage = filterLanguage === 'all' || meeting.language === filterLanguage
    
    return matchesSearch && matchesType && matchesStatus && matchesLanguage
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'group': return <Users className="h-4 w-4" />
      case 'individual': return <Video className="h-4 w-4" />
      case 'webinar': return <Monitor className="h-4 w-4" />
      default: return <Video className="h-4 w-4" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-blue-100 text-blue-800'
      case 'Intermediate': return 'bg-orange-100 text-orange-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      case 'All': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    })
  }

  const handleCreateMeeting = () => {
    if (!createMeetingData.date || !createMeetingData.startTime) return

    const startDateTime = new Date(createMeetingData.date)
    const [hours, minutes] = createMeetingData.startTime.split(':')
    startDateTime.setHours(parseInt(hours), parseInt(minutes))
    
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + createMeetingData.duration)

    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: createMeetingData.title,
      description: createMeetingData.description,
      type: createMeetingData.type,
      language: createMeetingData.language,
      level: createMeetingData.level as any,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: createMeetingData.duration,
      maxParticipants: createMeetingData.maxParticipants,
      currentParticipants: 0,
      status: 'scheduled',
      meetingLink: `https://meet.example.com/meeting-${Date.now()}`,
      isRecurring: createMeetingData.isRecurring,
      recurringPattern: createMeetingData.isRecurring ? createMeetingData.recurringPattern as any : undefined,
      students: [],
      createdAt: new Date().toISOString().split('T')[0]
    }

    setMeetings(prev => [newMeeting, ...prev])
    setShowCreateDialog(false)
    setCreateMeetingData({
      title: '',
      description: '',
      type: 'group',
      language: '',
      level: '',
      date: undefined,
      startTime: '',
      duration: 60,
      maxParticipants: 8,
      isRecurring: false,
      recurringPattern: 'weekly',
      sendInvitations: true,
      recordMeeting: false,
      requireApproval: false
    })
  }

  const handleJoinMeeting = (meeting: Meeting) => {
    // In a real app, this would open the video conferencing tool
    window.open(meeting.meetingLink, '_blank')
  }

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId))
  }

  const getTabMeetings = (status: string) => {
    switch (status) {
      case 'upcoming':
        return filteredMeetings.filter(m => m.status === 'scheduled')
      case 'ongoing':
        return filteredMeetings.filter(m => m.status === 'ongoing')
      case 'completed':
        return filteredMeetings.filter(m => m.status === 'completed')
      default:
        return filteredMeetings
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meeting Management</h1>
          <p className="text-muted-foreground">Schedule and manage your teaching sessions</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <CalendarIcon className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{meetings.filter(m => m.status === 'scheduled').length}</div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Video className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{meetings.filter(m => m.status === 'ongoing').length}</div>
            <div className="text-sm text-muted-foreground">Ongoing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{meetings.reduce((sum, m) => sum + m.currentParticipants, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Participants</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{meetings.reduce((sum, m) => sum + m.duration, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Hours</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="group">Group</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterLanguage} onValueChange={setFilterLanguage}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Portuguese">Portuguese</SelectItem>
                <SelectItem value="German">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Tabs */}
      <div className="flex space-x-4 border-b">
        {[
          { key: 'upcoming', label: 'Upcoming', count: meetings.filter(m => m.status === 'scheduled').length },
          { key: 'ongoing', label: 'Ongoing', count: meetings.filter(m => m.status === 'ongoing').length },
          { key: 'completed', label: 'Completed', count: meetings.filter(m => m.status === 'completed').length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{label}</span>
            <Badge variant="secondary" className="text-xs">{count}</Badge>
          </button>
        ))}
      </div>

      {/* Meeting List */}
      <div className="grid gap-4">
        {getTabMeetings(activeTab).map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{meeting.title}</h3>
                    <Badge className={`${getStatusColor(meeting.status)} border-0`}>
                      {getTypeIcon(meeting.type)}
                      <span className="ml-1 capitalize">{meeting.type}</span>
                    </Badge>
                    <Badge className={`${getLevelColor(meeting.level)} border-0`}>
                      {meeting.level}
                    </Badge>
                    <Badge variant="outline">{meeting.language}</Badge>
                    {meeting.isRecurring && (
                      <Badge variant="outline" className="text-xs">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {meeting.recurringPattern}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-3">{meeting.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(meeting.startTime)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{meeting.currentParticipants}/{meeting.maxParticipants}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{meeting.duration} min</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {meeting.status === 'scheduled' && (
                    <Button 
                      onClick={() => handleJoinMeeting(meeting)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Start Meeting
                    </Button>
                  )}
                  {meeting.status === 'ongoing' && (
                    <Button 
                      onClick={() => handleJoinMeeting(meeting)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Meeting
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteMeeting(meeting.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Meeting Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
            <DialogDescription>
              Create a new teaching session for your students.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  value={createMeetingData.title}
                  onChange={(e) => setCreateMeetingData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter meeting title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Meeting Type</Label>
                <Select value={createMeetingData.type} onValueChange={(value: any) => 
                  setCreateMeetingData(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group">Group Session</SelectItem>
                    <SelectItem value="individual">Individual Session</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={createMeetingData.language} onValueChange={(value) => 
                  setCreateMeetingData(prev => ({ ...prev, language: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Portuguese">Portuguese</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select value={createMeetingData.level} onValueChange={(value) => 
                  setCreateMeetingData(prev => ({ ...prev, level: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="All">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={createMeetingData.description}
                onChange={(e) => setCreateMeetingData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this meeting will cover"
                rows={3}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={createMeetingData.date}
                  onSelect={(date) => setCreateMeetingData(prev => ({ ...prev, date }))}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={createMeetingData.startTime}
                    onChange={(e) => setCreateMeetingData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={createMeetingData.duration}
                    onChange={(e) => setCreateMeetingData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min="15"
                    max="180"
                    step="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={createMeetingData.maxParticipants}
                    onChange={(e) => setCreateMeetingData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                    min="1"
                    max="50"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isRecurring">Recurring Meeting</Label>
                  <Switch
                    id="isRecurring"
                    checked={createMeetingData.isRecurring}
                    onCheckedChange={(checked) => 
                      setCreateMeetingData(prev => ({ ...prev, isRecurring: checked }))
                    }
                  />
                </div>
                {createMeetingData.isRecurring && (
                  <div className="space-y-2">
                    <Label htmlFor="recurringPattern">Repeat</Label>
                    <Select value={createMeetingData.recurringPattern} onValueChange={(value) => 
                      setCreateMeetingData(prev => ({ ...prev, recurringPattern: value }))
                    }>
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
                )}
                <div className="flex items-center justify-between">
                  <Label htmlFor="sendInvitations">Send Invitations</Label>
                  <Switch
                    id="sendInvitations"
                    checked={createMeetingData.sendInvitations}
                    onCheckedChange={(checked) => 
                      setCreateMeetingData(prev => ({ ...prev, sendInvitations: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="recordMeeting">Record Meeting</Label>
                  <Switch
                    id="recordMeeting"
                    checked={createMeetingData.recordMeeting}
                    onCheckedChange={(checked) => 
                      setCreateMeetingData(prev => ({ ...prev, recordMeeting: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireApproval">Require Approval</Label>
                  <Switch
                    id="requireApproval"
                    checked={createMeetingData.requireApproval}
                    onCheckedChange={(checked) => 
                      setCreateMeetingData(prev => ({ ...prev, requireApproval: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateMeeting}
                disabled={!createMeetingData.title || !createMeetingData.language || !createMeetingData.date || !createMeetingData.startTime}
              >
                <Save className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TeacherMeetings