import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Star,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Video,
  FileText,
  BarChart3,
  Plus,
  ChevronRight,
  Eye,
  Edit
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface DashboardStats {
  totalStudents: number
  activeClasses: number
  upcomingMeetings: number
  completedQuizzes: number
  averageClassProgress: number
  studentSatisfaction: number
}

interface UpcomingMeeting {
  id: string
  title: string
  time: string
  students: number
  duration: string
  type: 'group' | 'individual'
}

interface RecentActivity {
  id: string
  type: 'quiz_submitted' | 'meeting_completed' | 'student_enrolled' | 'assignment_graded'
  title: string
  description: string
  time: string
  student?: string
}

interface ClassProgress {
  id: string
  name: string
  language: string
  students: number
  progress: number
  nextMeeting: string
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  
  // Mock data
  const [stats] = useState<DashboardStats>({
    totalStudents: 45,
    activeClasses: 6,
    upcomingMeetings: 3,
    completedQuizzes: 28,
    averageClassProgress: 78,
    studentSatisfaction: 4.7
  })

  const [upcomingMeetings] = useState<UpcomingMeeting[]>([
    {
      id: '1',
      title: 'Spanish Conversation - Advanced',
      time: '2024-03-20T10:00:00',
      students: 8,
      duration: '60 min',
      type: 'group'
    },
    {
      id: '2',
      title: 'French Grammar Review',
      time: '2024-03-20T14:30:00',
      students: 1,
      duration: '45 min',
      type: 'individual'
    },
    {
      id: '3',
      title: 'German Pronunciation Class',
      time: '2024-03-21T09:00:00',
      students: 12,
      duration: '90 min',
      type: 'group'
    }
  ])

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'quiz_submitted',
      title: 'Spanish Grammar Quiz',
      description: 'Maria completed with 92% score',
      time: '2 hours ago',
      student: 'Maria Rodriguez'
    },
    {
      id: '2',
      type: 'meeting_completed',
      title: 'French Conversation Session',
      description: 'Session completed with 6 students',
      time: '4 hours ago'
    },
    {
      id: '3',
      type: 'student_enrolled',
      title: 'New Student Enrollment',
      description: 'John Smith enrolled in German Basics',
      time: '1 day ago',
      student: 'John Smith'
    },
    {
      id: '4',
      type: 'assignment_graded',
      title: 'Essay Assignment Graded',
      description: 'Graded 8 submissions for Advanced Spanish',
      time: '2 days ago'
    }
  ])

  const [classProgress] = useState<ClassProgress[]>([
    {
      id: '1',
      name: 'Spanish Advanced Conversation',
      language: 'Spanish',
      students: 8,
      progress: 85,
      nextMeeting: '2024-03-20T10:00:00'
    },
    {
      id: '2',
      name: 'French Intermediate Grammar',
      language: 'French',
      students: 12,
      progress: 72,
      nextMeeting: '2024-03-21T14:00:00'
    },
    {
      id: '3',
      name: 'German Basics',
      language: 'German',
      students: 15,
      progress: 45,
      nextMeeting: '2024-03-22T11:00:00'
    },
    {
      id: '4',
      name: 'Spanish Business Communication',
      language: 'Spanish',
      students: 6,
      progress: 90,
      nextMeeting: '2024-03-23T15:30:00'
    }
  ])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_submitted':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'meeting_completed':
        return <Video className="h-4 w-4 text-green-500" />
      case 'student_enrolled':
        return <Users className="h-4 w-4 text-purple-500" />
      case 'assignment_graded':
        return <CheckCircle className="h-4 w-4 text-orange-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, trend }: {
    icon: any
    title: string
    value: string | number
    subtitle?: string
    trend?: 'up' | 'down' | 'neutral'
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <span className={`text-xs ${
                  trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Teacher'}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your classes today</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link to="/teacher/meetings">
              <Video className="h-4 w-4 mr-2" />
              Start Meeting
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/teacher/quizzes">
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Students"
          value={stats.totalStudents}
          trend="up"
        />
        <StatCard
          icon={BookOpen}
          title="Active Classes"
          value={stats.activeClasses}
          trend="neutral"
        />
        <StatCard
          icon={CalendarIcon}
          title="Upcoming Meetings"
          value={stats.upcomingMeetings}
          trend="up"
        />
        <StatCard
          icon={Star}
          title="Satisfaction Rate"
          value={`${stats.studentSatisfaction}/5`}
          trend="up"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Meetings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Meetings</CardTitle>
                <CardDescription>Your scheduled sessions for today</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/teacher/meetings">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      meeting.type === 'group' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {meeting.type === 'group' ? <Users className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{meeting.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatTime(meeting.time)}</span>
                        <span>{meeting.students} students</span>
                        <span>{meeting.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm">
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Class Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Class Progress</CardTitle>
                <CardDescription>Track your students' learning progress</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/teacher/results">
                  View Details
                  <BarChart3 className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classProgress.map((classItem) => (
                  <div key={classItem.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{classItem.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {classItem.language}
                          </Badge>
                          <span>{classItem.students} students</span>
                          <span>Next: {formatDate(classItem.nextMeeting)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{classItem.progress}%</div>
                        <div className="text-xs text-muted-foreground">progress</div>
                      </div>
                    </div>
                    <Progress value={classItem.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-medium">{activity.title}</h4>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/teacher/quizzes">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Quiz
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/teacher/meetings">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/teacher/results">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Results
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/teacher/profile">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard