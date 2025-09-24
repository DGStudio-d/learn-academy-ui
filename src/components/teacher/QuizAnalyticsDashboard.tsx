import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  Download,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Award,
  Loader2
} from 'lucide-react';
import { useTeacherQuizzes, useTeacherQuizAttempts, useContentAnalytics } from '../../hooks/useTeacher';
import { useExportStudentProgress } from '../../hooks/useTeacher';
import { toast } from '../ui/use-toast';

interface QuizAnalyticsDashboardProps {
  quizId?: number;
  programId?: number;
}

export const QuizAnalyticsDashboard: React.FC<QuizAnalyticsDashboardProps> = ({ 
  quizId, 
  programId 
}) => {
  const [selectedQuiz, setSelectedQuiz] = useState<number | undefined>(quizId);
  const [timeRange, setTimeRange] = useState('30');
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: quizzesData, isLoading: quizzesLoading } = useTeacherQuizzes();
  const { data: attemptsData, isLoading: attemptsLoading } = useTeacherQuizAttempts(selectedQuiz);
  const { data: analyticsData, isLoading: analyticsLoading } = useContentAnalytics({
    program_id: programId,
    date_from: new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  
  const exportMutation = useExportStudentProgress();

  const handleExportData = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        program_id: programId,
        format: 'excel'
      });
      
      // Create download link
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = `quiz-analytics-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Analytics data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export analytics data",
        variant: "destructive",
      });
    }
  };

  const renderOverviewTab = () => {
    if (analyticsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    const analytics = analyticsData?.quiz_analytics;
    if (!analytics) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No analytics data available</h3>
          <p className="text-sm">Create some quizzes and get student attempts to see analytics</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{analytics.total_quizzes}</div>
              <div className="text-sm text-muted-foreground">Total Quizzes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{analytics.total_attempts}</div>
              <div className="text-sm text-muted-foreground">Total Attempts</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{analytics.average_score}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{analytics.completion_rate}%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Quizzes */}
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Quizzes</CardTitle>
            <CardDescription>Quizzes with the most student attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.popular_quizzes?.map((item, index) => (
                <div key={item.quiz.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{item.quiz.title}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{item.attempts_count} attempts</Badge>
                        <Badge variant={item.average_score >= 70 ? 'default' : 'destructive'}>
                          {item.average_score}% avg
                        </Badge>
                      </div>
                    </div>
                    <Progress value={item.average_score} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderQuizDetailsTab = () => {
    if (!selectedQuiz) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Select a quiz to view details</h3>
          <p className="text-sm">Choose a quiz from the dropdown above to see detailed analytics</p>
        </div>
      );
    }

    if (attemptsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    const attempts = attemptsData?.data?.data || [];
    const quiz = quizzesData?.data?.data?.find(q => q.id === selectedQuiz);

    if (attempts.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No attempts yet</h3>
          <p className="text-sm">Students haven't taken this quiz yet</p>
        </div>
      );
    }

    const passedAttempts = attempts.filter(a => a.score >= 70).length;
    const averageScore = Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length);
    const averageTime = Math.round(attempts.reduce((sum, a) => sum + (a.time_taken || 0), 0) / attempts.length);

    return (
      <div className="space-y-6">
        {/* Quiz Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{quiz?.title}</CardTitle>
            <CardDescription>{quiz?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{attempts.length}</div>
                <div className="text-sm text-muted-foreground">Total Attempts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{passedAttempts}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-2xl font-bold text-blue-500">{averageScore}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{Math.floor(averageTime / 60)}m</div>
                <div className="text-sm text-muted-foreground">Average Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attempts</CardTitle>
            <CardDescription>Latest student attempts on this quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attempts.slice(0, 10).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      attempt.score >= 70 ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {attempt.score >= 70 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {attempt.user?.name || attempt.guest_name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(attempt.completed_at).toLocaleDateString()} at{' '}
                        {new Date(attempt.completed_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      attempt.score >= 70 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {attempt.score}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {attempt.correct_answers}/{attempt.total_questions} correct
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    if (!selectedQuiz || attemptsLoading) {
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
          <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No performance data</h3>
          <p className="text-sm">Need student attempts to show performance analytics</p>
        </div>
      );
    }

    // Calculate performance metrics
    const scoreRanges = {
      excellent: attempts.filter(a => a.score >= 90).length,
      good: attempts.filter(a => a.score >= 70 && a.score < 90).length,
      needs_improvement: attempts.filter(a => a.score >= 50 && a.score < 70).length,
      poor: attempts.filter(a => a.score < 50).length,
    };

    const timeRanges = {
      fast: attempts.filter(a => (a.time_taken || 0) < 300).length, // < 5 min
      normal: attempts.filter(a => (a.time_taken || 0) >= 300 && (a.time_taken || 0) < 900).length, // 5-15 min
      slow: attempts.filter(a => (a.time_taken || 0) >= 900).length, // > 15 min
    };

    return (
      <div className="space-y-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>How students performed on this quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Excellent (90-100%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{scoreRanges.excellent}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(scoreRanges.excellent / attempts.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Good (70-89%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{scoreRanges.good}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(scoreRanges.good / attempts.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Needs Improvement (50-69%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{scoreRanges.needs_improvement}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(scoreRanges.needs_improvement / attempts.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Poor (&lt;50%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{scoreRanges.poor}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(scoreRanges.poor / attempts.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Time Analysis</CardTitle>
            <CardDescription>How long students took to complete the quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Fast (&lt;5 min)</span>
                </div>
                <Badge variant="outline">{timeRanges.fast} students</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Normal (5-15 min)</span>
                </div>
                <Badge variant="outline">{timeRanges.normal} students</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-red-500" />
                  <span>Slow (&gt;15 min)</span>
                </div>
                <Badge variant="outline">{timeRanges.slow} students</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Suggestions based on quiz performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scoreRanges.poor > attempts.length * 0.3 && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-800">High failure rate detected</div>
                    <div className="text-sm text-red-600">
                      Consider reviewing quiz difficulty or providing additional study materials
                    </div>
                  </div>
                </div>
              )}
              
              {timeRanges.slow > attempts.length * 0.4 && (
                <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800">Students taking too long</div>
                    <div className="text-sm text-yellow-600">
                      Consider increasing time limit or simplifying questions
                    </div>
                  </div>
                </div>
              )}
              
              {scoreRanges.excellent > attempts.length * 0.7 && (
                <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                  <Award className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">Excellent performance!</div>
                    <div className="text-sm text-green-600">
                      Students are mastering this material well
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quiz Analytics</h2>
          <p className="text-muted-foreground">Analyze quiz performance and student progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData} disabled={exportMutation.isPending}>
            <Download className="h-4 w-4 mr-2" />
            {exportMutation.isPending ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Quiz Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedQuiz?.toString()} onValueChange={(value) => setSelectedQuiz(parseInt(value))}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a quiz to analyze" />
              </SelectTrigger>
              <SelectContent>
                {quizzesData?.data?.data?.map((quiz) => (
                  <SelectItem key={quiz.id} value={quiz.id.toString()}>
                    {quiz.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Quiz Details</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {renderQuizDetailsTab()}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {renderPerformanceTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizAnalyticsDashboard;