import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Calendar, 
  Trophy, 
  Clock,
  ExternalLink,
  Play,
  CheckCircle,
  Loader2,
  Award,
  Target,
  TrendingUp,
  Star,
  Users,
  Video,
  FileText,
  BarChart3
} from 'lucide-react';
import { 
  useStudentLearningDashboard,
  useStudentProgressSummary,
  useUpcomingMeetings,
  useAllQuizAttempts
} from '../../hooks/useStudent';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ProgramProgressCard } from '../../components/student/ProgramProgressCard';
import { QuizTakingInterface } from '../../components/student/QuizTakingInterface';
import { MeetingAccessInterface } from '../../components/student/MeetingAccessInterface';
import { AchievementSystem } from '../../components/student/AchievementSystem';
import { ProgressVisualization } from '../../components/student/ProgressVisualization';

export function StudentDashboard() {
  const { user } = useAuth();
  const {
    stats,
    progress,
    enrollments,
    upcomingMeetings,
    recentAttempts,
    isLoading,
    isLoadingMeetings,
    isLoadingAttempts,
    error,
    refetchAll
  } = useStudentLearningDashboard();
  
  const { data: progressSummary } = useStudentProgressSummary();
  
  if (isLoading) {
    return (
      <DashboardLayout userRole="student">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="student">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="text-red-500">Failed to load dashboard data</div>
            <Button onClick={refetchAll}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout userRole="student">
      <div className="space-y-8" data-testid="student-dashboard">
        {/* Welcome Section with Progress Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Student'}!</h1>
              <p className="text-muted-foreground">Continue your language learning journey</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {progressSummary?.overall_progress?.completion_percentage || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
          </div>
          
          {/* Progress Visualization */}
          <ProgressVisualization progressData={progressSummary} />
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6" data-testid="dashboard-stats">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {enrollments?.data?.data?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Programs</div>
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {upcomingMeetings?.data?.data?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">This Week</div>
                  </div>
                </div>
                <Video className="h-4 w-4 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {progressSummary?.overall_progress?.average_quiz_score || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg. Score</div>
                  </div>
                </div>
                <Target className="h-4 w-4 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Award className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {progressSummary?.achievements?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Achievements</div>
                  </div>
                </div>
                <Star className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Programs</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Quizzes</span>
            </TabsTrigger>
            <TabsTrigger value="meetings" className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Meetings</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Achievements</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest learning activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {progressSummary?.recent_activity && progressSummary.recent_activity.length > 0 ? (
                    progressSummary.recent_activity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {activity.type === 'quiz_attempt' ? (
                            <FileText className="h-4 w-4 text-primary" />
                          ) : (
                            <Video className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                            {activity.score && ` • Score: ${activity.score}%`}
                          </p>
                        </div>
                        <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                          {activity.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Jump into your learning activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Take Available Quiz
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Programs
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Trophy className="h-4 w-4 mr-2" />
                    View Achievements
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <ProgramProgressCard enrollments={enrollments} />
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <QuizTakingInterface />
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <MeetingAccessInterface meetings={upcomingMeetings} isLoading={isLoadingMeetings} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <AchievementSystem achievements={progressSummary?.achievements} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default StudentDashboard;
