import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  ChevronRight, 
  ChevronLeft,
  RotateCcw,
  Trophy,
  AlertCircle
} from 'lucide-react';
import { useGuestQuiz, useSubmitGuestQuizAttempt } from '@/hooks/useGuest';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import type { Quiz, QuizAttempt } from '@/types/api';

interface GuestQuizTakerProps {
  quizId: number;
  onComplete?: (attempt: QuizAttempt) => void;
  onCancel?: () => void;
}

interface GuestInfo {
  name: string;
  email?: string;
}

export function GuestQuizTaker({ quizId, onComplete, onCancel }: GuestQuizTakerProps) {
  const { t } = useTranslation();
  const { data: quiz, isLoading, error } = useGuestQuiz(quizId);
  const submitAttempt = useSubmitGuestQuizAttempt();

  const [step, setStep] = useState<'info' | 'quiz' | 'result'>('info');
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({ name: '', email: '' });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [result, setResult] = useState<QuizAttempt | null>(null);

  // Timer effect
  useEffect(() => {
    if (step === 'quiz' && quiz?.time_limit && timeLeft !== null) {
      if (timeLeft <= 0) {
        handleSubmit();
        return;
      }

      const timer = setInterval(() => {
        setTimeLeft(prev => prev !== null ? prev - 1 : null);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, timeLeft, quiz?.time_limit]);

  const handleStartQuiz = () => {
    if (!guestInfo.name.trim()) {
      toast({
        title: t('guest.quiz.error'),
        description: t('guest.quiz.nameRequired'),
        variant: 'destructive',
      });
      return;
    }

    setStep('quiz');
    setStartTime(new Date());
    
    if (quiz?.time_limit) {
      setTimeLeft(quiz.time_limit * 60); // Convert minutes to seconds
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    try {
      const attemptData = {
        guest_name: guestInfo.name,
        guest_email: guestInfo.email || undefined,
        answers
      };

      const attempt = await submitAttempt.mutateAsync({ quizId, attemptData });
      setResult(attempt);
      setStep('result');
      
      if (onComplete) {
        onComplete(attempt);
      }

      toast({
        title: t('guest.quiz.submitted'),
        description: t('guest.quiz.submittedDesc'),
      });
    } catch (error) {
      toast({
        title: t('guest.quiz.error'),
        description: t('guest.quiz.submitError'),
        variant: 'destructive',
      });
    }
  };

  const handleRetry = () => {
    setStep('info');
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(null);
    setStartTime(null);
    setResult(null);
    setGuestInfo({ name: '', email: '' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">{t('guest.quiz.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !quiz) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('guest.quiz.loadError')}
            </AlertDescription>
          </Alert>
          {onCancel && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={onCancel}>
                {t('common.goBack')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Guest info step
  if (step === 'info') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          {quiz.description && (
            <CardDescription className="text-base">{quiz.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">{quiz.questions.length}</div>
              <div className="text-sm text-muted-foreground">{t('guest.quiz.questions')}</div>
            </div>
            {quiz.time_limit && (
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">{quiz.time_limit}</div>
                <div className="text-sm text-muted-foreground">{t('guest.quiz.minutes')}</div>
              </div>
            )}
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">
                <CheckCircle className="h-8 w-8 mx-auto" />
              </div>
              <div className="text-sm text-muted-foreground">{t('guest.quiz.multipleChoice')}</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('guest.quiz.guestInfo')}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="guest-name">{t('guest.quiz.name')} *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="guest-name"
                  placeholder={t('guest.quiz.namePlaceholder')}
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-email">{t('guest.quiz.email')} ({t('common.optional')})</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="guest-email"
                  type="email"
                  placeholder={t('guest.quiz.emailPlaceholder')}
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                {t('common.cancel')}
              </Button>
            )}
            <Button onClick={handleStartQuiz} size="lg" className="px-8">
              {t('guest.quiz.startQuiz')}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz taking step
  if (step === 'quiz') {
    const currentQ = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
    const isLastQuestion = currentQuestion === quiz.questions.length - 1;
    const hasAnswer = answers[currentQuestion] !== undefined;

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              <CardDescription>
                {t('guest.quiz.questionOf', { 
                  current: currentQuestion + 1, 
                  total: quiz.questions.length 
                })}
              </CardDescription>
            </div>
            {timeLeft !== null && (
              <Badge variant={timeLeft < 300 ? 'destructive' : 'secondary'} className="text-lg px-3 py-1">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(timeLeft)}
              </Badge>
            )}
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-relaxed">
              {currentQ.question}
            </h3>

            <div className="grid gap-3">
              {currentQ.answers.map((answer, index) => (
                <Button
                  key={index}
                  variant={answers[currentQuestion] === index ? "default" : "outline"}
                  className="justify-start text-left p-4 h-auto transition-all"
                  onClick={() => handleAnswerSelect(currentQuestion, index)}
                >
                  <span className="mr-3 font-bold">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="flex-1">{answer}</span>
                  {answers[currentQuestion] === index && (
                    <CheckCircle className="h-5 w-5 ml-2" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t('guest.quiz.previous')}
            </Button>

            <div className="flex gap-2">
              {onCancel && (
                <Button variant="ghost" onClick={onCancel}>
                  {t('common.cancel')}
                </Button>
              )}
              
              {isLastQuestion ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={!hasAnswer || submitAttempt.isPending}
                  size="lg"
                >
                  {submitAttempt.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('guest.quiz.submitting')}
                    </>
                  ) : (
                    <>
                      {t('guest.quiz.submit')}
                      <Trophy className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  disabled={!hasAnswer}
                  size="lg"
                >
                  {t('guest.quiz.next')}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Results step
  if (step === 'result' && result) {
    const percentage = (result.correct_answers / result.total_questions) * 100;
    
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('guest.quiz.complete')}</CardTitle>
          <CardDescription>{quiz.title}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className={`text-4xl font-bold ${getScoreColor(result.correct_answers, result.total_questions)}`}>
                {result.correct_answers}/{result.total_questions}
              </div>
              <Badge 
                variant={getScoreBadgeVariant(result.correct_answers, result.total_questions)}
                className="text-lg px-4 py-1"
              >
                {percentage.toFixed(0)}%
              </Badge>
            </div>

            <div className="text-muted-foreground">
              {percentage >= 80 && t('guest.quiz.excellent')}
              {percentage >= 60 && percentage < 80 && t('guest.quiz.good')}
              {percentage < 60 && t('guest.quiz.needsPractice')}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">{result.correct_answers}</div>
              <div className="text-sm text-muted-foreground">{t('guest.quiz.correct')}</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-red-600">
                {result.total_questions - result.correct_answers}
              </div>
              <div className="text-sm text-muted-foreground">{t('guest.quiz.incorrect')}</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">{result.total_questions}</div>
              <div className="text-sm text-muted-foreground">{t('guest.quiz.total')}</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleRetry}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('guest.quiz.tryAgain')}
            </Button>
            {onCancel && (
              <Button onClick={onCancel}>
                {t('common.done')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}