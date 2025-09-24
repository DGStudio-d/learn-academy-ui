import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calendar, 
  Trophy,
  TrendingUp,
  Target,
  Clock,
  Award,
  BarChart3
} from 'lucide-react';

interface ProgressData {
  overall_progress?: {
    total_quizzes_available: number;
    quizzes_completed: number;
    total_meetings_available: number;
    meetings_attended: number;
    average_quiz_score: number;
    completion_percentage: number;
  };
  recent_activity?: Array<{
    type: 'quiz_attempt' | 'meeting_attendance';
    title: string;
    date: string;
    score?: number;
    status: string;
  }>;
  achievements?: Array<{
    id: number;
    title: string;
    description: string;
    earned_at: string;
    badge_icon?: string;
  }>;
}

interface ProgressVisualizationProps {
  progressData?: ProgressData;
}

export function ProgressVisualization({ progressData }: ProgressVisualizationProps) {
  const progress = progressData?.overall_progress;
  
  if (!progress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Learning Progress</span>
          </CardTitle>
          <CardDescription>Track your overall learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No progress data available yet</p>
            <p className="text-sm">Start taking quizzes and attending meetings to see your progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const quizProgress = progress.total_quizzes_available > 0 
    ? (progress.quizzes_completed / progress.total_quizzes_available) * 100 
    : 0;
    
  const meetingProgress = progress.total_meetings_available > 0 
    ? (progress.meetings_attended / progress.total_meetings_available) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span>Learning Progress Overview</span>
        </CardTitle>
        <CardDescription>Your comprehensive learning journey at a glance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress Circle */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted-foreground/20"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress.completion_percentage / 100)}`}
                className="text-primary transition-all duration-500 ease-in-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(progress.completion_percentage)}%
                </div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold">Overall Progress</h3>
          <p className="text-sm text-muted-foreground">Keep up the great work!</p>
        </div>

        {/* Detailed Progress Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quiz Progress */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BookOpen className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium">Quiz Completion</h4>
                <p className="text-sm text-muted-foreground">
                  {progress.quizzes_completed} of {progress.total_quizzes_available} completed
                </p>
              </div>
            </div>
            <Progress value={quizProgress} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{Math.round(quizProgress)}% complete</span>
              <span className="font-medium text-blue-600">
                Avg: {progress.average_quiz_score}%
              </span>
            </div>
          </div>

          {/* Meeting Attendance */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <h4 className="font-medium">Meeting Attendance</h4>
                <p className="text-sm text-muted-foreground">
                  {progress.meetings_attended} of {progress.total_meetings_available} attended
                </p>
              </div>
            </div>
            <Progress value={meetingProgress} className="h-3 [&>div]:bg-green-500" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{Math.round(meetingProgress)}% attendance</span>
              <span className="font-medium text-green-600">
                {progress.meetings_attended} sessions
              </span>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-600">
              {progress.average_quiz_score}%
            </div>
            <div className="text-xs text-muted-foreground">Average Score</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-lg font-bold text-green-600">
              {progress.quizzes_completed}
            </div>
            <div className="text-xs text-muted-foreground">Quizzes Done</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-purple-600">
              {progressData?.achievements?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Achievements</div>
          </div>
        </div>

        {/* Progress Insights */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Progress Insights</span>
          </h4>
          <div className="space-y-2 text-sm">
            {progress.completion_percentage >= 80 && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Excellent progress! You're almost there!</span>
              </div>
            )}
            {progress.completion_percentage >= 50 && progress.completion_percentage < 80 && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Great momentum! Keep up the consistent learning.</span>
              </div>
            )}
            {progress.completion_percentage < 50 && (
              <div className="flex items-center space-x-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>You're just getting started! Every step counts.</span>
              </div>
            )}
            
            {progress.average_quiz_score >= 90 && (
              <div className="flex items-center space-x-2 text-yellow-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Outstanding quiz performance! You're mastering the material.</span>
              </div>
            )}
            
            {meetingProgress >= 80 && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Excellent attendance! Active participation pays off.</span>
              </div>
            )}
            
            {progress.quizzes_completed === 0 && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Ready to take your first quiz? Start your learning journey!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}