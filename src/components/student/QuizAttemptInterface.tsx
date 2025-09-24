import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { useQuizAttemptManager, useStudentQuiz } from '../../hooks/useStudent';
import { Clock, Save, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Quiz, QuizAttemptSession } from '../../types/api';
import { toast } from '../ui/use-toast';

interface QuizAttemptInterfaceProps {
  quizId: number;
  onComplete?: (attemptId: number) => void;
  onCancel?: () => void;
}

export const QuizAttemptInterface: React.FC<QuizAttemptInterfaceProps> = ({
  quizId,
  onComplete,
  onCancel,
}) => {
  const { data: quiz, isLoading: isLoadingQuiz } = useStudentQuiz(quizId);
  const {
    startQuizSession,
    saveQuizProgress,
    submitQuizSession,
    isStarting,
    isSaving,
    isSubmitting,
    startError,
    submitError,
  } = useQuizAttemptManager(quizId);

  const [attemptSession, setAttemptSession] = useState<QuizAttemptSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (!isQuizStarted || !attemptSession) return;

    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isQuizStarted, attemptSession]);

  // Auto-save effect with more frequent saves
  useEffect(() => {
    if (!attemptSession || !isQuizStarted) return;

    const interval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        saveQuizProgress(attemptSession.attemptId, answers, timeSpent);
      }
    }, 15000); // Auto-save every 15 seconds

    setAutoSaveInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [attemptSession, answers, timeSpent, isQuizStarted, saveQuizProgress]);

  // Auto-save on answer change with debounce
  useEffect(() => {
    if (!attemptSession || !isQuizStarted || Object.keys(answers).length === 0) return;

    const debounceTimer = setTimeout(() => {
      saveQuizProgress(attemptSession.attemptId, answers, timeSpent);
    }, 2000); // Save 2 seconds after last answer change

    return () => clearTimeout(debounceTimer);
  }, [answers, attemptSession, timeSpent, isQuizStarted, saveQuizProgress]);

  const handleStartQuiz = async () => {
    try {
      const session = await startQuizSession();
      
      // Check if there's existing progress to resume
      const existingProgress = localStorage.getItem(`quiz-progress-${quizId}`);
      let resumedAnswers = {};
      let resumedTime = 0;
      
      if (existingProgress) {
        try {
          const parsed = JSON.parse(existingProgress);
          if (parsed.attemptId === session.attemptId) {
            resumedAnswers = parsed.answers || {};
            resumedTime = parsed.timeSpent || 0;
            
            toast({
              title: "Progress Restored",
              description: "Your previous progress has been restored",
            });
          }
        } catch (e) {
          console.warn('Failed to parse existing progress:', e);
        }
      }
      
      setAttemptSession({
        attemptId: session.attemptId,
        startTime: session.startTime,
        quizId,
        currentAnswers: resumedAnswers,
        timeSpent: resumedTime,
      });
      
      setAnswers(resumedAnswers);
      setTimeSpent(resumedTime);
      setIsQuizStarted(true);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = {
      ...answers,
      [questionIndex]: answerIndex,
    };
    
    setAnswers(newAnswers);
    
    // Save to local storage immediately for backup
    if (attemptSession) {
      const progressData = {
        attemptId: attemptSession.attemptId,
        answers: newAnswers,
        timeSpent,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(`quiz-progress-${quizId}`, JSON.stringify(progressData));
    }
  };

  const handleManualSave = useCallback(async () => {
    if (attemptSession) {
      await saveQuizProgress(attemptSession.attemptId, answers, timeSpent);
    }
  }, [attemptSession, answers, timeSpent, saveQuizProgress]);

  const handleSubmitQuiz = async () => {
    try {
      const result = await submitQuizSession(answers);
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
      
      // Clean up local storage
      localStorage.removeItem(`quiz-progress-${quizId}`);
      
      setIsQuizStarted(false);
      onComplete?.(result.id);
      
      toast({
        title: "Quiz Submitted",
        description: "Your quiz has been submitted successfully",
      });
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = () => {
    if (!quiz?.time_limit || !attemptSession) return null;
    const elapsed = timeSpent;
    const remaining = quiz.time_limit * 60 - elapsed; // time_limit is in minutes
    return Math.max(0, remaining);
  };

  const isTimeUp = () => {
    const remaining = getTimeRemaining();
    return remaining !== null && remaining <= 0;
  };

  const getProgress = () => {
    if (!quiz?.questions) return 0;
    return (Object.keys(answers).length / quiz.questions.length) * 100;
  };

  if (isLoadingQuiz) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading quiz...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center text-red-800">
              Quiz not found or you don't have access to it.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isQuizStarted) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>{quiz.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Quiz Information</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Questions: {quiz.questions?.length || 0}</li>
                  {quiz.time_limit && (
                    <li>Time Limit: {quiz.time_limit} minutes</li>
                  )}
                  {quiz.max_attempts && (
                    <li>Max Attempts: {quiz.max_attempts}</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Instructions</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Read each question carefully</li>
                  <li>• Select the best answer for each question</li>
                  <li>• Your progress is automatically saved</li>
                  <li>• You can review your answers before submitting</li>
                </ul>
              </div>
            </div>

            {startError && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Failed to start quiz. Please try again.</span>
              </div>
            )}

            <div className="flex space-x-3">
              <Button 
                onClick={handleStartQuiz} 
                disabled={isStarting}
                className="flex-1"
              >
                {isStarting ? 'Starting...' : 'Start Quiz'}
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isTimeUp()) {
    // Auto-submit when time is up
    handleSubmitQuiz();
  }

  const currentQuestion = quiz.questions?.[currentQuestionIndex];
  const timeRemaining = getTimeRemaining();

  return (
    <div className="p-6 space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{quiz.title}</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {quiz.questions?.length || 0}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              {timeRemaining !== null && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className={`font-mono ${timeRemaining < 300 ? 'text-red-600' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              <Badge variant="secondary">
                {formatTime(timeSpent)} elapsed
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(getProgress())}% complete</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestionIndex]?.toString() || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestionIndex, parseInt(value))}
            >
              {currentQuestion.answers.map((answer, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                  <Label htmlFor={`answer-${index}`} className="flex-1 cursor-pointer">
                    {answer}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Navigation and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => 
                  Math.min((quiz.questions?.length || 1) - 1, prev + 1)
                )}
                disabled={currentQuestionIndex === (quiz.questions?.length || 1) - 1}
              >
                Next
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSave}
                disabled={isSaving}
                className="flex items-center space-x-1"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </Button>

              <Button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting || Object.keys(answers).length === 0}
                className="flex items-center space-x-1"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Quiz'}</span>
              </Button>
            </div>
          </div>

          {submitError && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg mt-4">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Failed to submit quiz. Please try again.</span>
            </div>
          )}

          {isSaving && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg mt-4">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Progress saved automatically</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Question Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {quiz.questions?.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestionIndex === index ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                className={`relative ${
                  answers[index] !== undefined ? 'bg-green-100 border-green-300' : ''
                }`}
              >
                {index + 1}
                {answers[index] !== undefined && (
                  <CheckCircle className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};