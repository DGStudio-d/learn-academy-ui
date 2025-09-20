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
  CheckCircle
} from 'lucide-react';

const programs = [
  {
    id: 1,
    name: 'Spanish Beginner',
    language: 'Spanish',
    level: 'Beginner',
    progress: 65,
    nextQuiz: 'Basic Vocabulary',
    nextMeeting: '2024-01-15 14:00',
  },
  {
    id: 2,
    name: 'English Conversation',
    language: 'English',
    level: 'Intermediate',
    progress: 40,
    nextQuiz: 'Grammar Practice',
    nextMeeting: '2024-01-16 10:00',
  },
];

const upcomingMeetings = [
  {
    id: 1,
    title: 'Spanish Conversation Practice',
    teacher: 'Maria Rodriguez',
    datetime: '2024-01-15 14:00',
    timezone: 'EST',
    joinLink: '#',
    participants: 8,
  },
  {
    id: 2,
    title: 'English Grammar Workshop',
    teacher: 'Sarah Johnson',
    datetime: '2024-01-16 10:00',
    timezone: 'EST',
    joinLink: '#',
    participants: 12,
  },
];

const recentQuizzes = [
  {
    id: 1,
    title: 'Spanish Vocabulary Quiz',
    score: 85,
    totalQuestions: 20,
    completedAt: '2024-01-10',
    status: 'completed',
  },
  {
    id: 2,
    title: 'English Grammar Test',
    score: 92,
    totalQuestions: 15,
    completedAt: '2024-01-08',
    status: 'completed',
  },
];

export function StudentDashboard() {
  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, John!</h1>
        <p className="text-muted-foreground">Continue your language learning journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">2</div>
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
                <div className="text-2xl font-bold">3</div>
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
                <div className="text-2xl font-bold">89%</div>
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
                <div className="text-2xl font-bold">24h</div>
                <div className="text-sm text-muted-foreground">Study Time</div>
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
            {programs.map((program) => (
              <div key={program.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{program.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {program.language} • {program.level}
                    </p>
                  </div>
                  <Badge variant="outline">{program.progress}%</Badge>
                </div>
                <Progress value={program.progress} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Next: {program.nextQuiz}</span>
                  <span>{program.nextMeeting}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>Join your scheduled live sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-semibold">{meeting.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    with {meeting.teacher}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {meeting.datetime} {meeting.timezone} • {meeting.participants} participants
                  </p>
                </div>
                <Button size="sm" className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>Join</span>
                </Button>
              </div>
            ))}
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
            {recentQuizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                    <CheckCircle className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{quiz.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Completed on {quiz.completedAt}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {quiz.score}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {quiz.score * quiz.totalQuestions / 100}/{quiz.totalQuestions} correct
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}