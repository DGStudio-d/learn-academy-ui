import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Users, 
  Play, 
  BookOpen, 
  AlertCircle,
  Trophy,
  Star
} from 'lucide-react';
import { useGuestQuizzes } from '@/hooks/useGuest';
import { GuestQuizTaker } from './GuestQuizTaker';
import { GuestQuizAccess } from './GuestAccessControl';
import { useTranslation } from 'react-i18next';
import type { Quiz, QuizAttempt } from '@/types/api';

interface GuestQuizListProps {
  programId?: number;
  languageId?: number;
  limit?: number;
  showHeader?: boolean;
}

export function GuestQuizList({ 
  programId, 
  languageId, 
  limit,
  showHeader = true 
}: GuestQuizListProps) {
  const { t } = useTranslation();
  const { data: quizzes, isLoading, error } = useGuestQuizzes();
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
  const [completedAttempts, setCompletedAttempts] = useState<Record<number, QuizAttempt>>({});

  // Filter quizzes based on props
  const filteredQuizzes = quizzes?.filter(quiz => {
    if (programId && quiz.program_id !== programId) return false;
    if (languageId && quiz.language_id !== languageId) return false;
    return true;
  }).slice(0, limit) || [];

  const handleQuizComplete = (attempt: QuizAttempt) => {
    if (selectedQuiz) {
      setCompletedAttempts(prev => ({
        ...prev,
        [selectedQuiz]: attempt
      }));
    }
    setSelectedQuiz(null);
  };

  const handleQuizCancel = () => {
    setSelectedQuiz(null);
  };

  const getQuizDifficulty = (quiz: Quiz) => {
    const questionCount = quiz.questions?.length || 0;
    if (questionCount <= 5) return { label: 'Easy', variant: 'secondary' as const };
    if (questionCount <= 10) return { label: 'Medium', variant: 'default' as const };
    return { label: 'Hard', variant: 'destructive' as const };
  };

  const getAttemptBadge = (attempt: QuizAttempt) => {
    const percentage = (attempt.correct_answers / attempt.total_questions) * 100;
    if (percentage >= 80) return { label: 'Excellent', variant: 'default' as const };
    if (percentage >= 60) return { label: 'Good', variant: 'secondary' as const };
    return { label: 'Try Again', variant: 'destructive' as const };
  };

  if (selectedQuiz) {
    return (
      <div className="space-y-6">
        <GuestQuizTaker
          quizId={selectedQuiz}
          onComplete={handleQuizComplete}
          onCancel={handleQuizCancel}
        />
      </div>
    );
  }

  return (
    <GuestQuizAccess>
      <div className="space-y-6">
        {showHeader && (
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">{t('guest.quizzes.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('guest.quizzes.subtitle')}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('guest.quizzes.loadError')}
            </AlertDescription>
          </Alert>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-4">{t('guest.quizzes.noQuizzes')}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t('guest.quizzes.noQuizzesDesc')}
              </p>
              <Button variant="outline">
                {t('guest.quizzes.checkBack')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => {
              const difficulty = getQuizDifficulty(quiz);
              const attempt = completedAttempts[quiz.id];
              const attemptBadge = attempt ? getAttemptBadge(attempt) : null;

              return (
                <Card 
                  key={quiz.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-lg leading-tight">{quiz.title}</CardTitle>
                        {quiz.description && (
                          <CardDescription className="text-sm">
                            {quiz.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={difficulty.variant} className="text-xs">
                        {difficulty.label}
                      </Badge>
                      {quiz.language && (
                        <Badge variant="outline" className="text-xs">
                          {quiz.language.name}
                        </Badge>
                      )}
                      {attemptBadge && (
                        <Badge variant={attemptBadge.variant} className="text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          {attemptBadge.label}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span>{quiz.questions?.length || 0} {t('guest.quiz.questions')}</span>
                      </div>
                      {quiz.time_limit && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{quiz.time_limit} {t('guest.quiz.minutes')}</span>
                        </div>
                      )}
                    </div>

                    {attempt && (
                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{t('guest.quiz.lastAttempt')}</span>
                          <Badge variant="outline">
                            {attempt.correct_answers}/{attempt.total_questions}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(attempt.completed_at).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedQuiz(quiz.id)}
                      variant={attempt ? "outline" : "default"}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {attempt ? t('guest.quiz.retake') : t('guest.quiz.start')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </GuestQuizAccess>
  );
}