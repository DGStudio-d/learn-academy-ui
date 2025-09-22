import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  Trophy,
  Target,
  Star,
  Play,
  RotateCcw
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface Quiz {
  id: number
  title: string
  language: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  questions: number
  duration: number
  attempts: number
  bestScore: number | null
  isCompleted: boolean
  difficulty: number
  topic: string
}

const mockQuizzes: Quiz[] = [
  {
    id: 1,
    title: 'Spanish Present Tense',
    language: 'Spanish',
    level: 'Beginner',
    questions: 15,
    duration: 10,
    attempts: 2,
    bestScore: 87,
    isCompleted: true,
    difficulty: 2,
    topic: 'Grammar'
  },
  {
    id: 2,
    title: 'French Vocabulary: Food',
    language: 'French',
    level: 'Intermediate',
    questions: 20,
    duration: 15,
    attempts: 1,
    bestScore: 65,
    isCompleted: true,
    difficulty: 3,
    topic: 'Vocabulary'
  },
  {
    id: 3,
    title: 'Spanish Listening Comprehension',
    language: 'Spanish',
    level: 'Intermediate',
    questions: 12,
    duration: 20,
    attempts: 0,
    bestScore: null,
    isCompleted: false,
    difficulty: 4,
    topic: 'Listening'
  },
  {
    id: 4,
    title: 'French Past Tense',
    language: 'French',
    level: 'Intermediate',
    questions: 18,
    duration: 12,
    attempts: 0,
    bestScore: null,
    isCompleted: false,
    difficulty: 3,
    topic: 'Grammar'
  }
]

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600' 
  return 'text-red-600'
}

const getScoreBadgeVariant = (score: number) => {
  if (score >= 90) return 'default'
  if (score >= 70) return 'secondary'
  return 'destructive'
}

export default function StudentQuizzes() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')

  const filteredQuizzes = selectedLanguage === 'all' 
    ? mockQuizzes 
    : mockQuizzes.filter(quiz => quiz.language === selectedLanguage)

  const completedQuizzes = filteredQuizzes.filter(q => q.isCompleted)
  const availableQuizzes = filteredQuizzes.filter(q => !q.isCompleted)

  const totalQuizzes = filteredQuizzes.length
  const completedCount = completedQuizzes.length
  const averageScore = completedQuizzes.length > 0 
    ? Math.round(completedQuizzes.reduce((sum, quiz) => sum + (quiz.bestScore || 0), 0) / completedQuizzes.length)
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Practice Quizzes</h1>
        <p className="text-muted-foreground">
          Test your knowledge and track your progress
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Quizzes
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              Available to take
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedCount / totalQuizzes) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Score
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all quizzes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Best Score
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.max(...completedQuizzes.map(q => q.bestScore || 0))}%
            </div>
            <p className="text-xs text-muted-foreground">
              Personal best
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Language Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Language</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedLanguage === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLanguage('all')}
            >
              All Languages
            </Button>
            <Button
              variant={selectedLanguage === 'Spanish' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLanguage('Spanish')}
            >
              🇪🇸 Spanish
            </Button>
            <Button
              variant={selectedLanguage === 'French' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLanguage('French')}
            >
              🇫🇷 French
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Quizzes */}
      {availableQuizzes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Available Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription>{quiz.topic}</CardDescription>
                    </div>
                    <Badge variant="outline">{quiz.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Difficulty</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < quiz.difficulty
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      {quiz.questions} questions
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {quiz.duration} min
                    </div>
                  </div>

                  <Button className="w-full" asChild>
                    <Link to={`/student/quizzes/${quiz.id}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Quiz
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Quizzes */}
      {completedQuizzes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Completed Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription>{quiz.topic}</CardDescription>
                    </div>
                    <Badge variant="outline">{quiz.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Best Score</span>
                      <Badge variant={getScoreBadgeVariant(quiz.bestScore || 0)}>
                        {quiz.bestScore}%
                      </Badge>
                    </div>
                    <Progress value={quiz.bestScore || 0} />
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <RotateCcw className="h-3 w-3" />
                      {quiz.attempts} attempts
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {quiz.duration} min
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/student/quizzes/${quiz.id}/results`}>
                        View Results
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link to={`/student/quizzes/${quiz.id}`}>
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Retake
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {filteredQuizzes.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No quizzes found</h3>
            <p className="text-muted-foreground mb-4">
              Try selecting a different language or check back later for new quizzes.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSelectedLanguage('all')}
            >
              Show All Languages
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}