import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';

// Mock data for demo
const mockQuiz = {
  id: 1,
  title: "English Grammar Basics",
  description: "Test your understanding of basic English grammar concepts",
  timeLimit: 30, // minutes
  totalQuestions: 10,
  questions: [
    {
      id: 1,
      question: "Which sentence is grammatically correct?",
      options: [
        "She don't like coffee",
        "She doesn't like coffee", 
        "She not like coffee",
        "She no like coffee"
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "Choose the correct past tense of 'go':",
      options: [
        "goed",
        "wented", 
        "went",
        "gone"
      ],
      correctAnswer: 2
    },
    // Add more questions as needed
  ]
};

export function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

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

  const handleSubmit = () => {
    // Calculate score
    let correctAnswers = 0;
    mockQuiz.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / mockQuiz.questions.length) * 100);
    setScore(finalScore);
    setIsSubmitted(true);
  };

  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / mockQuiz.questions.length) * 100;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {score >= 70 ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500" />
                )}
              </div>
              <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
              <CardDescription>
                You scored {score}% on {mockQuiz.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{score}%</div>
                <div className="text-muted-foreground">
                  {Object.values(answers).filter((answer, index) => 
                    answer === mockQuiz.questions[index]?.correctAnswer
                  ).length} out of {mockQuiz.questions.length} correct
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    );
  }

  const currentQ = mockQuiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Quiz Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{mockQuiz.title}</h1>
              <p className="text-muted-foreground">{mockQuiz.description}</p>
            </div>
            <div className="flex items-center space-x-2 text-primary">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {mockQuiz.questions.length}</span>
              <span>{answeredQuestions} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">Question {currentQuestion + 1}</Badge>
              <span className="text-sm text-muted-foreground">
                {answers[currentQ.id] !== undefined ? 'Answered' : 'Not answered'}
              </span>
            </div>
            <CardTitle className="text-xl">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={answers[currentQ.id]?.toString() || ""}
              onValueChange={(value) => handleAnswerSelect(currentQ.id, parseInt(value))}
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentQuestion === mockQuiz.questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={answeredQuestions < mockQuiz.questions.length}
                  className="btn-hero"
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={answers[currentQ.id] === undefined}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}