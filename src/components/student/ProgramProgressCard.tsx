import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Calendar, 
  Clock,
  Users,
  TrendingUp,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProgramProgressCardProps {
  enrollments: any;
}

export function ProgramProgressCard({ enrollments }: ProgramProgressCardProps) {
  const navigate = useNavigate();

  if (!enrollments?.data?.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Programs</CardTitle>
          <CardDescription>Track your progress in enrolled programs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const programs = enrollments.data.data;

  if (programs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Programs</CardTitle>
          <CardDescription>Track your progress in enrolled programs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No enrolled programs yet</h3>
            <p className="text-sm mb-4">Browse available programs to get started with your learning journey</p>
            <Button onClick={() => navigate('/programs')}>
              Browse Programs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Programs</h2>
          <p className="text-muted-foreground">Track your progress in enrolled programs</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/programs')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Browse More
        </Button>
      </div>

      <div className="grid gap-6">
        {programs.map((enrollment: any) => {
          const program = enrollment.program;
          // Calculate progress based on completed activities (mock calculation)
          const completedQuizzes = Math.floor(Math.random() * 10);
          const totalQuizzes = 10;
          const completedMeetings = Math.floor(Math.random() * 5);
          const totalMeetings = 8;
          const overallProgress = Math.round(((completedQuizzes + completedMeetings) / (totalQuizzes + totalMeetings)) * 100);

          return (
            <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{program?.name || 'Program'}</CardTitle>
                        <CardDescription>
                          {program?.language?.name || 'Language'} • Level: {program?.level || 'Beginner'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <Badge variant={enrollment.status === 'approved' ? 'default' : 'secondary'}>
                    {enrollment.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Teacher Info */}
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={program?.teacher?.profile_image} />
                    <AvatarFallback>
                      {program?.teacher?.name?.split(' ').map((n: string) => n[0]).join('') || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{program?.teacher?.name || 'Teacher'}</p>
                    <p className="text-xs text-muted-foreground">Instructor</p>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-lg font-bold">{completedQuizzes}/{totalQuizzes}</div>
                    <div className="text-xs text-muted-foreground">Quizzes</div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-lg font-bold">{completedMeetings}/{totalMeetings}</div>
                    <div className="text-xs text-muted-foreground">Meetings</div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-lg font-bold">{Math.floor(Math.random() * 100)}%</div>
                    <div className="text-xs text-muted-foreground">Avg Score</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button className="flex-1" size="sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>

                {/* Enrollment Details */}
                <div className="pt-4 border-t text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Enrolled: {new Date(enrollment.created_at).toLocaleDateString()}</span>
                    <span>Status: {enrollment.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}