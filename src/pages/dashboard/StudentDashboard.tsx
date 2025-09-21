import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calendar, 
  Trophy, 
  Clock,
  ExternalLink,
  Play,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { 
  useStudentDashboardStats,
  useEnrolledPrograms,
  useStudentMeetings,
  useStudentQuizAttempts
} from '../../hooks/useStudent';
import { useAuth } from '../../contexts/AuthContext';

export function StudentDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useStudentDashboardStats();
  const { data: programsData, isLoading: programsLoading } = useEnrolledPrograms();
  const { data: meetingsData, isLoading: meetingsLoading } = useStudentMeetings();
  const { data: attemptsData, isLoading: attemptsLoading } = useStudentQuizAttempts();
  
  if (statsLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Student'}!</h1>
        <p className="text-muted-foreground">Continue your language learning journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {programsData?.data?.data?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Programs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {meetingsData?.data?.data?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {stats?.recent_quiz_attempts ? `${Math.round((stats.recent_quiz_attempts / 10) * 100)}%` : '0%'}
                </div>
                <div className="text-sm text-muted-foreground">Avg. Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {attemptsData?.data?.data?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Quiz Attempts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* My Programs */}
        <Card>
          <CardHeader>
            <CardTitle>My Programs</CardTitle>
            <CardDescription>Track your progress in enrolled programs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {programsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : programsData?.data?.data && programsData.data.data.length > 0 ? (
              programsData.data.data.map((program) => (
                <div key={program.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{program.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {program.language?.name || 'Language'} • {program.teacher?.name || 'Teacher'}
                      </p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Enrolled: {new Date(program.created_at).toLocaleDateString()}</span>
                    <span>Status: Active</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No enrolled programs yet</p>
                <p className="text-sm">Browse available programs to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>Join your scheduled live sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {meetingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : meetingsData?.data?.data && meetingsData.data.data.length > 0 ? (
              meetingsData.data.data.slice(0, 3).map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{meeting.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      with {meeting.teacher?.name || 'Teacher'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(meeting.scheduled_at).toLocaleString()} • {meeting.duration || 60} min
                    </p>
                  </div>
                  <Button size="sm" className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>Join</span>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming meetings</p>
                <p className="text-sm">Check back later for scheduled sessions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Quizzes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Quiz Results</CardTitle>
          <CardDescription>Review your latest quiz performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attemptsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : attemptsData?.data?.data && attemptsData.data.data.length > 0 ? (
              attemptsData.data.data.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{attempt.quiz?.title || 'Quiz'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Completed on {new Date(attempt.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {attempt.score}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {attempt.correct_answers}/{attempt.total_questions} correct
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No quiz attempts yet</p>
                <p className="text-sm">Take your first quiz to see results here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}