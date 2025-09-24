import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Timer,
  Save,
  AlertTriangle,
  Target,
  Loader2
} from 'lucide-react';
import { 
  useStudentQuiz, 
  useQuizAttemptManager,
  useQuizAttemptResults 
} from '../hooks/useStudent';

export function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // API hooks
  const { data: quiz, isLoading: quizLoading, error: quizError } = useStudentQuiz(Number(quizId));
  const { 
    startQuizSession, 
    saveQuizProgress, 
    submitQuizSession,
    isStarting,
    isSaving,
    isSubmitting,
    startError,
    submitError
  } = useQuizAttemptManager(Number(quizId));
  
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Initialize quiz attempt
  useEffect(() => {
    if (quiz && !attemptId && !isSubmitted) {
      initializeQuizAttempt();
    }
  }, [quiz]);

  const initializeQuizAttempt = async () => {
    try {
      const result = await startQuizSession();
      setAttemptId(result.attemptId);
      setStartTime(new Date(result.startTime));
      
      // Set timer based on quiz time limit
      const timeLimitMinutes = quiz?.time_limit || 30;
      setTimeLeft(timeLimitMinutes * 60);
      
      toast({
        title: "Quiz Started",
        description: `You have ${timeLimitMinutes} minutes to complete this quiz.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start quiz. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Timer effect with enhanced functionality
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && attemptId) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          
          // Auto-submit when time runs out
          if (newTime <= 0) {
            handleSubmit();
            return 0;
          }
          
          // Warning notifications
          if (newTime === 300) { // 5 minutes left
            toast({
              title: "Time Warning",
              description: "5 minutes remaining!",
              variant: "destructive"
            });
          } else if (newTime === 60) { // 1 minute left
            toast({
              title: "Final Warning",
              description: "1 minute remaining!",
              variant: "destructive"
            });
          }
          
          return newTime;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isSubmitted, attemptId]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && attemptId && Object.keys(answers).length > 0 && !isSubmitted) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds
      
      return () => clearTimeout(autoSaveTimer);
    }
  }, [answers, autoSaveEnabled, attemptId, isSubmitted]);

  const handleAutoSave = useCallback(async () => {
    if (!attemptId || !startTime) return;
    
    try {
      const timeSpent = Math.floor((Date.now() - startTime.getTime()) / 1000);
      await saveQuizProgress(attemptId, answers, timeSpent);
      setLastSaved(new Date());
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  }, [attemptId, startTime, answers, saveQuizProgress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < mockQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    
    try {
      const result = await submitQuizSession(answers);
      setSubmissionResult(result);
      setIsSubmitted(true);
      
      toast({
        title: "Quiz Submitted",
        description: "Your answers have been submitted successfully!"
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleManualSave = async () => {
    await handleAutoSave();
    toast({
      title: "Progress Saved",
      description: "Your answers have been saved."
    });
  };

  // Loading states
  if (quizLoading || isStarting) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading quiz...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error states
  if (quizError || startError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle>Quiz Unavailable</CardTitle>
              <CardDescription>
                {quizError?.message || startError?.message || 'Unable to load quiz'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!quiz) return null;

  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = quiz.questions?.length || 0;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Results screen
  if (isSubmitted && submissionResult) {
    const score = submissionResult.score || 0;
    const passed = score >= (quiz.passing_score || 70);
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container py-12">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {passed ? (
                  <CheckCircle className="h-20 w-20 text-green-500" />
                ) : (
                  <XCircle className="h-20 w-20 text-red-500" />
                )}
              </div>
              <CardTitle className="text-3xl">
                {passed ? 'Congratulations!' : 'Quiz Completed'}
              </CardTitle>
              <CardDescription className="text-lg">
                You scored {score}% on {quiz.title}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Score Display */}
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-primary mb-2">{score}%</div>
                <div className="text-muted-foreground text-lg">
                  {submissionResult.correct_answers || 0} out of {submissionResult.total_questions || totalQuestions} correct
                </div>
                <Badge variant={passed ? "default" : "destructive"} className="text-lg px-4 py-2">
                  {passed ? 'Passed' : 'Failed'}
                </Badge>
              </div>

              {/* Performance Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{score}%</div>
                    <div className="text-sm text-muted-foreground">Your Score</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Timer className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">
                      {Math.floor((submissionResult.time_spent || 0) / 60)}m
                    </div>
                    <div className="text-sm text-muted-foreground">Time Taken</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">{quiz?.passing_score || 70}%</div>
                    <div className="text-sm text-muted-foreground">Passing Score</div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Performance</span>
                  <span>{score}%</span>
                </div>
                <Progress 
                  value={score} 
                  className={`h-4 ${passed ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'}`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Button onClick={() => navigate('/dashboard')} size="lg">
                  Back to Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate(`/quiz/${quizId}/results/${submissionResult.id}`)} size="lg">
                  View Detailed Results
                </Button>
                {quiz.max_attempts === null || (submissionResult.attempt_number || 1) < quiz.max_attempts ? (
                  <Button variant="outline" onClick={() => window.location.reload()} size="lg">
                    Retake Quiz
                  </Button>
                ) : null}
              </div>

              {/* Encouragement Message */}
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                {passed ? (
                  <p className="text-green-600 font-medium">
                    Excellent work! You've successfully passed this quiz. Keep up the great learning!
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Don't worry! Learning is a journey. Review the material and try again when you're ready.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    );
  }

  const currentQ = quiz.questions?.[currentQuestion];
  const isTimeRunningOut = timeLeft <= 300; // 5 minutes or less

  if (!currentQ) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Questions Available</h2>
              <p className="text-muted-foreground mb-4">This quiz doesn't have any questions yet.</p>
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Enhanced Quiz Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{quiz.title}</h1>
              <p className="text-muted-foreground">{quiz.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Auto-save indicator */}
              {lastSaved && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Save className="h-3 w-3" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
              
              {/* Timer */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isTimeRunningOut ? 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400' : 'bg-primary/10 text-primary'
              }`}>
                <Timer className={`h-4 w-4 ${isTimeRunningOut ? 'animate-pulse' : ''}`} />
                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
          
          {/* Time warning alert */}
          {isTimeRunningOut && (
            <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-400">
                {timeLeft <= 60 ? 'Less than 1 minute remaining!' : `${Math.floor(timeLeft / 60)} minutes remaining!`}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Enhanced Progress Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Question {currentQuestion + 1} of {totalQuestions}</span>
                <Badge variant="outline">{answeredQuestions} answered</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSave}
                  disabled={isSaving || Object.keys(answers).length === 0}
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Save className="h-3 w-3 mr-1" />
                  )}
                  Save Progress
                </Button>
              </div>
            </div>
            
            <Progress value={progress} className="h-3" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}% complete</span>
              <span>{totalQuestions - answeredQuestions} remaining</span>
            </div>
          </div>
        </div>

        {/* Enhanced Question Card */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-base px-3 py-1">
                  Question {currentQuestion + 1}
                </Badge>
                <Badge variant={answers[currentQ.id] !== undefined ? "default" : "secondary"}>
                  {answers[currentQ.id] !== undefined ? 'Answered' : 'Not answered'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {currentQ.points || 1} point{(currentQ.points || 1) !== 1 ? 's' : ''}
              </div>
            </div>
            <CardTitle className="text-xl leading-relaxed">{currentQ.question}</CardTitle>
            {currentQ.description && (
              <CardDescription className="text-base">{currentQ.description}</CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            <RadioGroup
              value={answers[currentQ.id]?.toString() || ""}
              onValueChange={(value) => handleAnswerSelect(currentQ.id, parseInt(value))}
              className="space-y-3"
            >
              {currentQ.options?.map((option, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`option-${index}`} 
                    className="mt-1"
                  />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer text-base leading-relaxed"
                  >
                    {option}
                  </Label>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No options available for this question</p>
                </div>
              )}
            </RadioGroup>
            
            {/* Navigation and Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                size="lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-2">
                {/* Question navigation dots */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(totalQuestions, 10) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestion(i)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        i === currentQuestion 
                          ? 'bg-primary' 
                          : answers[quiz.questions?.[i]?.id] !== undefined
                          ? 'bg-green-500'
                          : 'bg-muted-foreground/30'
                      }`}
                      title={`Question ${i + 1}${answers[quiz.questions?.[i]?.id] !== undefined ? ' (Answered)' : ''}`}
                    />
                  ))}
                  {totalQuestions > 10 && (
                    <span className="text-xs text-muted-foreground ml-2">
                      +{totalQuestions - 10} more
                    </span>
                  )}
                </div>
              </div>
              
              {currentQuestion === totalQuestions - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Quiz
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  size="lg"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quiz Summary Card */}
        <Card className="max-w-4xl mx-auto mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span>Progress: {answeredQuestions}/{totalQuestions} questions</span>
                <span>Time remaining: {formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center space-x-2">
                {autoSaveEnabled && (
                  <Badge variant="outline" className="text-xs">
                    Auto-save enabled
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  Passing score: {quiz?.passing_score || 70}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}

export default QuizAttempt;
