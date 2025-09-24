import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Clock, 
  Play,
  CheckCircle,
  XCircle,
  Timer,
  Target,
  TrendingUp,
  Award,
  Loader2,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentQuizzes, useAllQuizAttempts } from '../../hooks/useStudent';

export function QuizTakingInterface() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('available');
  
  const { data: quizzesData, isLoading: quizzesLoading } = useStudentQuizzes();
  const { data: attemptsData, isLoading: attemptsLoading } = useAllQuizAttempts();

  const handleStartQuiz = (quizId: number) => {
    navigate(`/quiz/${quizId}`);
  };

  const renderAvailableQuizzes = () => {
    if (quizzesLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    const quizzes = quizzesData?.data?.data || [];

    if (quizzes.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No quizzes available</h3>
          <p className="text-sm">Check back later for new quizzes from your teachers</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {quizzes.map((quiz: any) => (
          <Card key={quiz.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription>{quiz.description}</CardDescription>
                    </div>
                  </div>
                </div>
                <Badge variant="outline">
                  {quiz.questions?.length || 0} Questions
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Quiz Details */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{quiz.time_limit || 30} min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{quiz.passing_score || 70}% to pass</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>{quiz.max_attempts || 'Unlimited'} attempts</span>
                </div>
              </div>

              {/* Program and Teacher Info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{quiz.program?.name || 'Program'}</span>
                <span>by {quiz.teacher?.name || 'Teacher'}</span>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full" 
                onClick={() => handleStartQuiz(quiz.id)}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderQuizHistory = () => {
    if (attemptsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    const attempts = attemptsData?.data?.data || [];

    if (attempts.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No quiz attempts yet</h3>
          <p className="text-sm">Take your first quiz to see your results here</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {attempts.map((attempt: any) => (
          <Card key={attempt.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    attempt.score >= 70 ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {attempt.score >= 70 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{attempt.quiz?.title || 'Quiz'}</h3>
                    <p className="text-sm text-muted-foreground">
                      Completed on {new Date(attempt.completed_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <span>{attempt.correct_answers}/{attempt.total_questions} correct</span>
                      <span>Time: {Math.floor((attempt.time_spent || 0) / 60)}m {(attempt.time_spent || 0) % 60}s</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    attempt.score >= 70 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {attempt.score}%
                  </div>
                  <Badge variant={attempt.score >= 70 ? 'default' : 'destructive'}>
                    {attempt.score >= 70 ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <Progress 
                  value={attempt.score} 
                  className={`h-2 ${
                    attempt.score >= 70 ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'
                  }`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderQuizAnalytics = () => {
    const attempts = attemptsData?.data?.data || [];
    
    if (attempts.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No analytics available</h3>
          <p className="text-sm">Complete some quizzes to see your performance analytics</p>
        </div>
      );
    }

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a: any) => a.score >= 70).length;
    const averageScore = Math.round(attempts.reduce((sum: number, a: any) => sum + a.score, 0) / totalAttempts);
    const bestScore = Math.max(...attempts.map((a: any) => a.score));
    const recentTrend = attempts.slice(-5);

    return (
      <div className="space-y-6">
        {/* Performance Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalAttempts}</div>
              <div className="text-sm text-muted-foreground">Total Attempts</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{passedAttempts}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{averageScore}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{bestScore}%</div>
              <div className="text-sm text-muted-foreground">Best Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Performance Trend</CardTitle>
            <CardDescription>Your last 5 quiz attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrend.map((attempt: any, index: number) => (
                <div key={attempt.id} className="flex items-center space-x-4">
                  <div className="w-8 text-center text-sm text-muted-foreground">
                    #{recentTrend.length - index}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{attempt.quiz?.title}</span>
                      <span className="text-sm font-bold">{attempt.score}%</span>
                    </div>
                    <Progress value={attempt.score} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Quiz Center</h2>
        <p className="text-muted-foreground">Take quizzes and track your progress</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available" className="flex items-center space-x-2">
            <Play className="h-4 w-4" />
            <span>Available</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {renderAvailableQuizzes()}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {renderQuizHistory()}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {renderQuizAnalytics()}
        </TabsContent>
      </Tabs>
    </div>
  );
}