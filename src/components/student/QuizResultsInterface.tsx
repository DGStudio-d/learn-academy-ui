import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  TrendingUp,
  Award,
  RotateCcw,
  Share2,
  Download,
  Eye,
  EyeOff,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { useQuizAttemptResults, useQuizAttemptHistory } from '../../hooks/useStudent';
import { toast } from '../ui/use-toast';

interface QuizResultsInterfaceProps {
  quizId: number;
  attemptId: number;
  onRetakeQuiz?: () => void;
  onBackToQuizzes?: () => void;
}

export const QuizResultsInterface: React.FC<QuizResultsInterfaceProps> = ({
  quizId,
  attemptId,
  onRetakeQuiz,
  onBackToQuizzes
}) => {
  const [selectedTab, setSelectedTab] = useState('results');
  const [showExplanations, setShowExplanations] = useState(false);

  const { data: resultsData, isLoading: resultsLoading } = useQuizAttemptResults(quizId, attemptId);
  const { data: historyData, isLoading: historyLoading } = useQuizAttemptHistory(quizId);

  if (resultsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!resultsData) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2">Results not found</h3>
        <p className="text-muted-foreground">Unable to load quiz results</p>
      </div>
    );
  }

  const { performance_summary, question_results } = resultsData;
  const passed = performance_summary.passed;
  const attempts = historyData?.data?.data || [];

  const handleShareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: `Quiz Results: ${resultsData.quiz?.title}`,
        text: `I scored ${resultsData.score}% on "${resultsData.quiz?.title}"!`,
        url: window.location.href,
      });
    } else {
      const shareText = `I scored ${resultsData.score}% on "${resultsData.quiz?.title}"!`;
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Success",
        description: "Results copied to clipboard",
      });
    }
  };

  const handleDownloadResults = () => {
    const resultsText = `
Quiz Results: ${resultsData.quiz?.title}
Score: ${resultsData.score}%
Correct Answers: ${resultsData.correct_answers}/${resultsData.total_questions}
Time Taken: ${Math.floor(performance_summary.total_time / 60)}m ${performance_summary.total_time % 60}s
Status: ${passed ? 'PASSED' : 'FAILED'}

Question Breakdown:
${question_results.map((q, i) => `
${i + 1}. ${q.question}
Your Answer: ${q.student_answer}
Correct Answer: ${q.correct_answer}
Result: ${q.is_correct ? 'CORRECT' : 'INCORRECT'}
${q.explanation ? `Explanation: ${q.explanation}` : ''}
`).join('\n')}
    `;

    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${resultsData.quiz?.title}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderResultsTab = () => (
    <div className="space-y-6">
      {/* Overall Results Card */}
      <Card className={`border-2 ${passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            passed ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {passed ? (
              <CheckCircle className="h-8 w-8 text-white" />
            ) : (
              <XCircle className="h-8 w-8 text-white" />
            )}
          </div>
          <CardTitle className={`text-2xl ${passed ? 'text-green-800' : 'text-red-800'}`}>
            {passed ? 'Congratulations!' : 'Keep Trying!'}
          </CardTitle>
          <CardDescription className={passed ? 'text-green-700' : 'text-red-700'}>
            {passed 
              ? 'You have successfully passed this quiz'
              : 'You can retake this quiz to improve your score'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {resultsData.score}%
              </div>
              <div className="text-sm text-muted-foreground">Final Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {resultsData.correct_answers}/{resultsData.total_questions}
              </div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {Math.floor(performance_summary.total_time / 60)}m {performance_summary.total_time % 60}s
              </div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">
                {performance_summary.passing_score}%
              </div>
              <div className="text-sm text-muted-foreground">Passing Score</div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{resultsData.score}%</span>
            </div>
            <Progress 
              value={resultsData.score} 
              className={`h-3 ${passed ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">
                {performance_summary.accuracy_percentage}%
              </div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-500">
                {Math.round(performance_summary.average_time_per_question)}s
              </div>
              <div className="text-sm text-muted-foreground">Avg Time/Question</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-500">
                {attempts.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Attempts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {onRetakeQuiz && (
          <Button onClick={onRetakeQuiz} className="flex-1 min-w-32">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
        )}
        <Button variant="outline" onClick={handleShareResults}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Results
        </Button>
        <Button variant="outline" onClick={handleDownloadResults}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        {onBackToQuizzes && (
          <Button variant="outline" onClick={onBackToQuizzes}>
            Back to Quizzes
          </Button>
        )}
      </div>
    </div>
  );

  const renderReviewTab = () => (
    <div className="space-y-6">
      {/* Review Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Question Review</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExplanations(!showExplanations)}
            >
              {showExplanations ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Explanations
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Explanations
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <div className="space-y-4">
        {question_results.map((questionResult, index) => (
          <Card key={index} className={`border-l-4 ${
            questionResult.is_correct ? 'border-l-green-500' : 'border-l-red-500'
          }`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">
                  Question {index + 1}
                </CardTitle>
                <Badge variant={questionResult.is_correct ? 'default' : 'destructive'}>
                  {questionResult.is_correct ? 'Correct' : 'Incorrect'}
                </Badge>
              </div>
              <CardDescription className="text-base font-normal">
                {questionResult.question}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Your Answer</div>
                  <div className={`p-2 rounded border ${
                    questionResult.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    {questionResult.student_answer}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Correct Answer</div>
                  <div className="p-2 rounded border bg-green-50 border-green-200">
                    {questionResult.correct_answer}
                  </div>
                </div>
              </div>
              
              {showExplanations && questionResult.explanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-blue-800 mb-1">Explanation</div>
                      <div className="text-sm text-blue-700">{questionResult.explanation}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHistoryTab = () => {
    if (historyLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Attempt History</CardTitle>
            <CardDescription>Your previous attempts on this quiz</CardDescription>
          </CardHeader>
          <CardContent>
            {attempts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No previous attempts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attempts.map((attempt, index) => (
                  <div 
                    key={attempt.id} 
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      attempt.id === attemptId ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        attempt.score >= performance_summary.passing_score 
                          ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        {attempt.score >= performance_summary.passing_score ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          Attempt #{attempts.length - index}
                          {attempt.id === attemptId && (
                            <Badge variant="outline" className="ml-2">Current</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(attempt.completed_at).toLocaleDateString()} at{' '}
                          {new Date(attempt.completed_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        attempt.score >= performance_summary.passing_score 
                          ? 'text-green-500' : 'text-red-500'
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
            )}
          </CardContent>
        </Card>

        {/* Progress Trend */}
        {attempts.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Progress Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attempts.slice().reverse().map((attempt, index) => (
                  <div key={attempt.id} className="flex items-center space-x-3">
                    <div className="w-8 text-center text-sm text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <Progress value={attempt.score} className="h-2" />
                    </div>
                    <div className="w-12 text-right text-sm font-medium">
                      {attempt.score}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{resultsData.quiz?.title}</h2>
        <p className="text-muted-foreground">Quiz Results</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Results</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Review</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {renderResultsTab()}
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          {renderReviewTab()}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {renderHistoryTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizResultsInterface;