import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  Plus,
  FileText,
  Video,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

const teacherStats = [
  { label: 'Total Students', value: '124', icon: Users },
  { label: 'Active Quizzes', value: '12', icon: BookOpen },
  { label: 'Upcoming Meetings', value: '5', icon: Calendar },
  { label: 'Avg. Rating', value: '4.9', icon: BarChart3 },
];

const recentQuizzes = [
  {
    id: 1,
    title: 'Spanish Vocabulary - Week 3',
    students: 28,
    avgScore: 87,
    created: '2024-01-10',
    attempts: 156
  },
  {
    id: 2,
    title: 'Grammar Practice - Subjunctive',
    students: 22,
    avgScore: 92,
    created: '2024-01-08',
    attempts: 89
  },
];

const upcomingMeetings = [
  {
    id: 1,
    title: 'Spanish Conversation Practice',
    datetime: '2024-01-15 14:00',
    students: 8,
    duration: '60 min',
    link: 'https://meet.learnacademy.com/room/spanish-conv-1'
  },
  {
    id: 2,
    title: 'Advanced Grammar Workshop',
    datetime: '2024-01-16 10:00',
    students: 12,
    duration: '90 min',
    link: 'https://meet.learnacademy.com/room/grammar-adv-1'
  },
];

export function TeacherDashboard() {
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newMeetingTitle, setNewMeetingTitle] = useState('');

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, Maria!</h1>
          <p className="text-muted-foreground">Manage your classes, quizzes, and student progress</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {teacherStats.map((stat, index) => (
            <Card key={stat.label} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Quizzes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Quizzes
                    <Button size="sm" className="btn-hero">
                      <Plus className="h-4 w-4 mr-1" />
                      New Quiz
                    </Button>
                  </CardTitle>
                  <CardDescription>Track your recent quiz performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {quiz.students} students • {quiz.attempts} attempts
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{quiz.avgScore}%</div>
                        <div className="text-sm text-muted-foreground">Avg. Score</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Upcoming Meetings
                    <Button size="sm" className="btn-hero">
                      <Plus className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                  </CardTitle>
                  <CardDescription>Your scheduled live sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{meeting.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {meeting.datetime} • {meeting.students} students • {meeting.duration}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Quiz</CardTitle>
                <CardDescription>Add a new quiz for your students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiz-title">Quiz Title</Label>
                    <Input
                      id="quiz-title"
                      placeholder="Enter quiz title"
                      value={newQuizTitle}
                      onChange={(e) => setNewQuizTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiz-program">Program</Label>
                    <Input id="quiz-program" placeholder="Select program" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-description">Description</Label>
                  <Textarea
                    id="quiz-description"
                    placeholder="Describe what this quiz covers"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="btn-hero">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Quiz
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-1" />
                    Upload File
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiz Library</CardTitle>
                <CardDescription>Manage your existing quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                          <BookOpen className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{quiz.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created {quiz.created} • {quiz.students} students enrolled
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{quiz.avgScore}% avg</Badge>
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm">View Results</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Meeting</CardTitle>
                <CardDescription>Create a live session for your students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-title">Meeting Title</Label>
                    <Input
                      id="meeting-title"
                      placeholder="Enter meeting title"
                      value={newMeetingTitle}
                      onChange={(e) => setNewMeetingTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meeting-date">Date & Time</Label>
                    <Input id="meeting-date" type="datetime-local" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-duration">Duration (minutes)</Label>
                    <Input id="meeting-duration" type="number" placeholder="60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meeting-program">Program</Label>
                    <Input id="meeting-program" placeholder="Select program" />
                  </div>
                </div>
                <Button className="btn-hero">
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Meetings</CardTitle>
                <CardDescription>Your upcoming and past meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                          <Video className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{meeting.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {meeting.datetime} • {meeting.students} registered • {meeting.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Upcoming
                        </Badge>
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" className="btn-hero">Start Meeting</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>View and manage your students' progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Student Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">Track individual student progress, quiz scores, and engagement metrics.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Profile</CardTitle>
                <CardDescription>Manage your profile and teaching preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Profile Management Coming Soon</h3>
                  <p className="text-muted-foreground">Update your profile image, bio, languages, and availability.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}