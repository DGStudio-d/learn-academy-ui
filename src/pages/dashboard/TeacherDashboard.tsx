import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  Plus,
  FileText,
  Video,
  BarChart3,
  Clock,
  CheckCircle,
  Settings,
  TrendingUp,
  Award,
  Activity,
  Edit,
  Eye
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { QuizBuilder } from '../../components/teacher/QuizBuilder';
import { MeetingScheduler } from '../../components/teacher/MeetingScheduler';
import { StudentProgressAnalytics } from '../../components/teacher/StudentProgressAnalytics';
import { 
  useTeacherDashboardStats, 
  useTeacherQuizzes, 
  useTeacherMeetings,
  useTeacherPrograms,
  useContentAnalytics
} from '../../hooks/useTeacher';

export function TeacherDashboard() {
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<number | undefined>();
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | undefined>();

  // Fetch dashboard data
  const { data: dashboardStats, isLoading: statsLoading } = useTeacherDashboardStats();
  const { data: quizzesData, isLoading: quizzesLoading } = useTeacherQuizzes();
  const { data: meetingsData, isLoading: meetingsLoading } = useTeacherMeetings();
  const { data: programsData } = useTeacherPrograms();
  const { data: analytics } = useContentAnalytics();

  const recentQuizzes = quizzesData?.data.data || [];
  const upcomingMeetings = meetingsData?.data.data || [];
  const programs = programsData?.data.data || [];

  const teacherStats = [
    { 
      label: 'Total Students', 
      value: dashboardStats?.active_students?.toString() || '0', 
      icon: Users,
      change: '+12%',
      changeType: 'positive' as const
    },
    { 
      label: 'Active Quizzes', 
      value: dashboardStats?.total_quizzes?.toString() || '0', 
      icon: BookOpen,
      change: '+3',
      changeType: 'positive' as const
    },
    { 
      label: 'Upcoming Meetings', 
      value: dashboardStats?.total_meetings?.toString() || '0', 
      icon: Calendar,
      change: '2 today',
      changeType: 'neutral' as const
    },
    { 
      label: 'Avg. Score', 
      value: analytics?.quiz_analytics.average_score ? `${Math.round(analytics.quiz_analytics.average_score)}%` : '0%', 
      icon: BarChart3,
      change: '+5%',
      changeType: 'positive' as const
    },
  ];

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' ? 'bg-green-100 text-green-700' :
                    stat.changeType === 'negative' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Quizzes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Quizzes
                    <Dialog open={showQuizBuilder} onOpenChange={setShowQuizBuilder}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="btn-hero">
                          <Plus className="h-4 w-4 mr-1" />
                          New Quiz
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create New Quiz</DialogTitle>
                        </DialogHeader>
                        <QuizBuilder
                          onSave={() => setShowQuizBuilder(false)}
                          onCancel={() => setShowQuizBuilder(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <CardDescription>Track your recent quiz performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quizzesLoading ? (
                    <div className="text-center py-4">Loading quizzes...</div>
                  ) : recentQuizzes.length > 0 ? (
                    recentQuizzes.slice(0, 3).map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{quiz.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {quiz.program?.name} • Created {new Date(quiz.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={quiz.is_active ? 'default' : 'secondary'}>
                            {quiz.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No quizzes created yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Upcoming Meetings
                    <Dialog open={showMeetingScheduler} onOpenChange={setShowMeetingScheduler}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="btn-hero">
                          <Plus className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Schedule New Meeting</DialogTitle>
                        </DialogHeader>
                        <MeetingScheduler
                          onSave={() => setShowMeetingScheduler(false)}
                          onCancel={() => setShowMeetingScheduler(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <CardDescription>Your scheduled live sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {meetingsLoading ? (
                    <div className="text-center py-4">Loading meetings...</div>
                  ) : upcomingMeetings.length > 0 ? (
                    upcomingMeetings.slice(0, 3).map((meeting) => (
                      <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{meeting.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(meeting.scheduled_at).toLocaleString()} • {meeting.duration} min
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={meeting.is_active ? 'default' : 'secondary'}>
                            {meeting.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Video className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No meetings scheduled</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Programs Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Programs Overview
                </CardTitle>
                <CardDescription>Your assigned programs and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {programs.length > 0 ? (
                    programs.map((program) => (
                      <div key={program.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{program.name}</h3>
                          <Badge variant={program.is_active ? 'default' : 'secondary'}>
                            {program.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {program.description || 'No description available'}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Language:</span>
                          <span className="font-medium">{program.language?.name}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No programs assigned</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quiz Management</h3>
              <Dialog open={showQuizBuilder} onOpenChange={setShowQuizBuilder}>
                <DialogTrigger asChild>
                  <Button className="btn-hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Quiz Builder</DialogTitle>
                  </DialogHeader>
                  <QuizBuilder
                    onSave={() => setShowQuizBuilder(false)}
                    onCancel={() => setShowQuizBuilder(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quiz Library</CardTitle>
                <CardDescription>Manage your existing quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                {quizzesLoading ? (
                  <div className="text-center py-8">Loading quizzes...</div>
                ) : recentQuizzes.length > 0 ? (
                  <div className="space-y-4">
                    {recentQuizzes.map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{quiz.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {quiz.program?.name} • Created {new Date(quiz.created_at).toLocaleDateString()}
                            </p>
                            {quiz.description && (
                              <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={quiz.is_active ? 'default' : 'secondary'}>
                            {quiz.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {quiz.questions?.length || 0} questions
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View Results
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Quizzes Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first quiz to start engaging with students
                    </p>
                    <Button onClick={() => setShowQuizBuilder(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Quiz
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Meeting Management</h3>
              <Dialog open={showMeetingScheduler} onOpenChange={setShowMeetingScheduler}>
                <DialogTrigger asChild>
                  <Button className="btn-hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Meeting Scheduler</DialogTitle>
                  </DialogHeader>
                  <MeetingScheduler
                    onSave={() => setShowMeetingScheduler(false)}
                    onCancel={() => setShowMeetingScheduler(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Meetings</CardTitle>
                <CardDescription>Your upcoming and past meetings</CardDescription>
              </CardHeader>
              <CardContent>
                {meetingsLoading ? (
                  <div className="text-center py-8">Loading meetings...</div>
                ) : upcomingMeetings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingMeetings.map((meeting) => (
                      <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-blue-600">
                            <Video className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{meeting.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(meeting.scheduled_at).toLocaleString()} • {meeting.duration} min
                            </p>
                            {meeting.description && (
                              <p className="text-sm text-muted-foreground mt-1">{meeting.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={meeting.is_active ? 'default' : 'secondary'}>
                            {meeting.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(meeting.scheduled_at) > new Date() ? 'Upcoming' : 'Past'}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            className="btn-hero"
                            onClick={() => window.open(meeting.meeting_url, '_blank')}
                          >
                            <Video className="h-3 w-3 mr-1" />
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Meetings Scheduled</h3>
                    <p className="text-muted-foreground mb-4">
                      Schedule your first meeting to connect with students
                    </p>
                    <Button onClick={() => setShowMeetingScheduler(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Your First Meeting
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <StudentProgressAnalytics />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Content Analytics</h3>
              
              {analytics ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quiz Analytics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Quiz Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {analytics.quiz_analytics.total_quizzes}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Quizzes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {analytics.quiz_analytics.total_attempts}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Attempts</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(analytics.quiz_analytics.average_score)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Average Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {Math.round(analytics.quiz_analytics.completion_rate)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Completion Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Meeting Analytics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Meeting Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {analytics.meeting_analytics.total_meetings}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Meetings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {analytics.meeting_analytics.total_attendees}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Attendees</div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(analytics.meeting_analytics.average_attendance)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Average Attendance</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Student Analytics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Student Engagement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {analytics.student_analytics.total_students}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {analytics.student_analytics.active_students}
                          </div>
                          <div className="text-sm text-muted-foreground">Active Students</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Performers */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2 text-yellow-500" />
                        Top Performers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.student_analytics.top_performers.slice(0, 5).map((performer, index) => (
                          <div key={performer.student.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline">#{index + 1}</Badge>
                              <span className="font-medium">{performer.student.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">{performer.average_score}%</div>
                              <div className="text-xs text-muted-foreground">
                                {performer.quizzes_completed} quizzes
                              </div>
                            </div>
                          </div>
                        ))}
                        {analytics.student_analytics.top_performers.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">
                            No performance data available yet
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
                    <p className="text-muted-foreground">
                      Create quizzes and schedule meetings to see analytics data
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
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

export default TeacherDashboard;
