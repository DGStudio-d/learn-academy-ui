import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BookOpen, Users, Award, Globe, Star, Clock, ChevronRight, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Language {
  id: number
  name: string
  flag: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  lessons: number
  students: number
  rating: number
}

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correct: number
}

const featuredLanguages: Language[] = [
  {
    id: 1,
    name: 'Spanish',
    flag: '🇪🇸',
    difficulty: 'Beginner',
    lessons: 120,
    students: 1250,
    rating: 4.8
  },
  {
    id: 2,
    name: 'French',
    flag: '🇫🇷', 
    difficulty: 'Intermediate',
    lessons: 95,
    students: 890,
    rating: 4.7
  },
  {
    id: 3,
    name: 'Arabic',
    flag: '🇸🇦',
    difficulty: 'Beginner',
    lessons: 85,
    students: 650,
    rating: 4.9
  }
]

const sampleQuiz: QuizQuestion[] = [
  {
    id: 1,
    question: 'What does "Hola" mean in English?',
    options: ['Goodbye', 'Hello', 'Thank you', 'Please'],
    correct: 1
  },
  {
    id: 2,
    question: 'How do you say "Thank you" in Spanish?',
    options: ['De nada', 'Por favor', 'Gracias', 'Adiós'],
    correct: 2
  },
  {
    id: 3,
    question: 'What is the Spanish word for "water"?',
    options: ['Fuego', 'Agua', 'Tierra', 'Aire'],
    correct: 1
  }
]

export default function GuestLanding() {
  const { t } = useTranslation()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNext = () => {
    if (selectedAnswer === sampleQuiz[currentQuestion].correct) {
      setScore(score + 1)
    }

    if (currentQuestion + 1 < sampleQuiz.length) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      setShowResult(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setQuizStarted(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('guest.hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('guest.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="px-8 py-3 text-lg" asChild>
                <Link to="/register">{t('guest.hero.startLearning')}</Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                <Play className="h-5 w-5 mr-2" />
                {t('guest.hero.watchDemo')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Languages */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold">{t('guest.popularLanguages')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('guest.popularLanguagesDesc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {featuredLanguages.map((language) => (
              <Card key={language.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{language.flag}</span>
                      <div>
                        <CardTitle className="text-lg">{language.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {t(`guest.difficulty.${language.difficulty.toLowerCase()}`)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{language.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{language.lessons} {t('guest.lessons')}</span>
                      <span>{language.students} {t('guest.students')}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {t('guest.startCourse')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Quiz Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 space-y-4">
              <h2 className="text-3xl font-bold">{t('guest.tryQuiz')}</h2>
              <p className="text-muted-foreground">
                {t('guest.tryQuizDesc')}
              </p>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span>{t('guest.quiz.spanishBasics')}</span>
                  {quizStarted && !showResult && (
                    <Badge variant="outline">
                      {t('guest.quiz.questionOf', { current: currentQuestion + 1, total: sampleQuiz.length })}
                    </Badge>
                  )}
                </CardTitle>
                {quizStarted && !showResult && (
                  <Progress 
                    value={((currentQuestion) / sampleQuiz.length) * 100} 
                    className="w-full"
                  />
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {!quizStarted ? (
                  <div className="text-center space-y-6 py-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {t('guest.quiz.ready')}
                    </p>
                    <Button onClick={() => setQuizStarted(true)} size="lg" className="px-8">
                      {t('guest.quiz.start')}
                    </Button>
                  </div>
                ) : showResult ? (
                  <div className="text-center space-y-6 py-6">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold">{t('guest.quiz.complete')}</h3>
                      <p className="text-lg">
                        {t('guest.quiz.scored', { score, total: sampleQuiz.length })}
                      </p>
                      <div className="text-muted-foreground">
                        {score === sampleQuiz.length && t('guest.quiz.perfect')}
                        {score >= sampleQuiz.length * 0.7 && score < sampleQuiz.length && t('guest.quiz.good')}
                        {score < sampleQuiz.length * 0.7 && t('guest.quiz.practice')}
                      </div>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={resetQuiz} variant="outline">
                        {t('guest.quiz.tryAgain')}
                      </Button>
                      <Button asChild size="lg">
                        <Link to="/register">{t('guest.quiz.startLearning')}</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-6">
                        {sampleQuiz[currentQuestion].question}
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {sampleQuiz[currentQuestion].options.map((option, index) => (
                          <Button
                            key={index}
                            variant={selectedAnswer === index ? "default" : "outline"}
                            className="justify-start text-left p-4 h-auto transition-all"
                            onClick={() => handleAnswerSelect(index)}
                          >
                            <span className="mr-3 font-bold">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button 
                        variant="ghost" 
                        onClick={resetQuiz}
                      >
                        {t('guest.quiz.exit')}
                      </Button>
                      <Button 
                        onClick={handleNext}
                        disabled={selectedAnswer === null}
                        size="lg"
                      >
                        {currentQuestion + 1 === sampleQuiz.length ? t('guest.quiz.finish') : t('guest.quiz.next')}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold">{t('guest.whyChoose')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('guest.expertTeachers')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('guest.expertTeachersDesc')}
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('guest.interactiveLessons')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('guest.interactiveLessonsDesc')}
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('guest.certifiedProgress')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('guest.certifiedProgressDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">{t('guest.readyToStart')}</h2>
            <p className="text-primary-foreground/90 leading-relaxed">
              {t('guest.readyToStartDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" className="px-8 py-3" asChild>
                <Link to="/register">{t('guest.createFreeAccount')}</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-primary border-primary-foreground/20 hover:bg-primary-foreground/10 px-8 py-3" asChild>
                <Link to="/login">{t('guest.signIn')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}