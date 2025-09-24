import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuizManagementSystem } from '../../components/teacher/QuizManagementSystem';
import { QuizBuilder } from '../../components/teacher/QuizBuilder';
import { QuizAnalyticsDashboard } from '../../components/teacher/QuizAnalyticsDashboard';
import { QuizAttemptInterface } from '../../components/student/QuizAttemptInterface';
import { QuizResultsInterface } from '../../components/student/QuizResultsInterface';

// Mock the hooks
vi.mock('../../hooks/useTeacher', () => ({
  useTeacherQuizzes: vi.fn(() => ({
    data: {
      data: {
        data: [
          {
            id: 1,
            title: 'Test Quiz 1',
            description: 'A test quiz',
            program_id: 1,
            language_id: 1,
            questions: [
              {
                question: 'What is 2+2?',
                type: 'multiple_choice',
                answers: ['3', '4', '5', '6'],
                correct_answer: 1,
                explanation: '2+2 equals 4',
                points: 1
              }
            ],
            time_limit: 30,
            max_attempts: 3,
            is_active: true,
            guest_can_access: false,
            created_at: '2024-01-01T00:00:00Z',
            program: { name: 'Math Program' }
          }
        ]
      }
    },
    isLoading: false,
    refetch: vi.fn()
  })),
  useTeacherPrograms: vi.fn(() => ({
    data: {
      data: {
        data: [
          { id: 1, name: 'Math Program' },
          { id: 2, name: 'Science Program' }
        ]
      }
    }
  })),
  useTeacherLanguages: vi.fn(() => ({
    data: [
      { id: 1, name: 'English', code: 'en' },
      { id: 2, name: 'Spanish', code: 'es' }
    ]
  })),
  useCreateAdvancedQuiz: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 1 }),
    isPending: false
  })),
  useDeleteQuiz: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false
  })),
  useContentAnalytics: vi.fn(() => ({
    data: {
      quiz_analytics: {
        total_quizzes: 5,
        total_attempts: 25,
        average_score: 78,
        completion_rate: 85,
        popular_quizzes: []
      }
    },
    isLoading: false
  })),
  useExportStudentProgress: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({ download_url: 'http://example.com/export.xlsx' }),
    isPending: false
  }))
}));

vi.mock('../../hooks/useStudent', () => ({
  useStudentQuiz: vi.fn(() => ({
    data: {
      id: 1,
      title: 'Test Quiz',
      description: 'A test quiz',
      questions: [
        {
          question: 'What is 2+2?',
          answers: ['3', '4', '5', '6'],
          correct_answer: 1
        }
      ],
      time_limit: 30
    },
    isLoading: false
  })),
  useQuizAttemptManager: vi.fn(() => ({
    startQuizSession: vi.fn().mockResolvedValue({ attemptId: 1, startTime: '2024-01-01T00:00:00Z' }),
    saveQuizProgress: vi.fn().mockResolvedValue({}),
    submitQuizSession: vi.fn().mockResolvedValue({ id: 1 }),
    isStarting: false,
    isSaving: false,
    isSubmitting: false,
    startError: null,
    submitError: null
  })),
  useQuizAttemptResults: vi.fn(() => ({
    data: {
      id: 1,
      score: 85,
      correct_answers: 17,
      total_questions: 20,
      quiz: { title: 'Test Quiz' },
      performance_summary: {
        total_time: 1200,
        average_time_per_question: 60,
        accuracy_percentage: 85,
        passing_score: 70,
        passed: true
      },
      question_results: [
        {
          question_id: 1,
          question: 'What is 2+2?',
          student_answer: '4',
          correct_answer: '4',
          is_correct: true,
          explanation: '2+2 equals 4'
        }
      ]
    },
    isLoading: false
  })),
  useQuizAttemptHistory: vi.fn(() => ({
    data: {
      data: {
        data: [
          {
            id: 1,
            score: 85,
            correct_answers: 17,
            total_questions: 20,
            completed_at: '2024-01-01T00:00:00Z'
          }
        ]
      }
    },
    isLoading: false
  }))
}));

// Mock toast
vi.mock('../../components/ui/use-toast', () => ({
  toast: vi.fn()
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Quiz Management System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('QuizManagementSystem', () => {
    it('renders quiz management interface', () => {
      renderWithQueryClient(<QuizManagementSystem />);
      
      expect(screen.getByText('Quiz Management')).toBeInTheDocument();
      expect(screen.getByText('Create, manage, and analyze your quizzes')).toBeInTheDocument();
      expect(screen.getByText('Quiz Overview')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('displays quiz cards with correct information', () => {
      renderWithQueryClient(<QuizManagementSystem />);
      
      expect(screen.getByText('Test Quiz 1')).toBeInTheDocument();
      expect(screen.getByText('A test quiz')).toBeInTheDocument();
      expect(screen.getByText('1 questions')).toBeInTheDocument();
      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('Math Program')).toBeInTheDocument();
    });

    it('allows creating new quiz', async () => {
      renderWithQueryClient(<QuizManagementSystem />);
      
      const createButton = screen.getByText('Create Quiz');
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText('Quiz Builder')).toBeInTheDocument();
      });
    });

    it('allows searching quizzes', () => {
      renderWithQueryClient(<QuizManagementSystem />);
      
      const searchInput = screen.getByPlaceholderText('Search quizzes...');
      fireEvent.change(searchInput, { target: { value: 'Test Quiz 1' } });
      
      expect(screen.getByText('Test Quiz 1')).toBeInTheDocument();
    });

    it('allows filtering by program', () => {
      renderWithQueryClient(<QuizManagementSystem />);
      
      const filterSelect = screen.getByText('Filter by program');
      fireEvent.click(filterSelect);
      
      expect(screen.getByText('Math Program')).toBeInTheDocument();
      expect(screen.getByText('Science Program')).toBeInTheDocument();
    });
  });

  describe('QuizBuilder', () => {
    const mockProps = {
      onSave: vi.fn(),
      onCancel: vi.fn()
    };

    it('renders quiz builder form', () => {
      renderWithQueryClient(<QuizBuilder {...mockProps} />);
      
      expect(screen.getByText('Quiz Builder')).toBeInTheDocument();
      expect(screen.getByText('Basic Info')).toBeInTheDocument();
      expect(screen.getByText('Questions')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('allows adding questions', () => {
      renderWithQueryClient(<QuizBuilder {...mockProps} />);
      
      // Switch to questions tab
      fireEvent.click(screen.getByText('Questions'));
      
      const addQuestionButton = screen.getByText('Add Question');
      fireEvent.click(addQuestionButton);
      
      // Should have 2 questions now (1 initial + 1 added)
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });

    it('supports drag and drop for question reordering', () => {
      renderWithQueryClient(<QuizBuilder {...mockProps} />);
      
      // Switch to questions tab
      fireEvent.click(screen.getByText('Questions'));
      
      // Check for drag handle
      const dragHandle = screen.getByTitle('Drag to reorder');
      expect(dragHandle).toBeInTheDocument();
    });

    it('validates required fields before saving', async () => {
      renderWithQueryClient(<QuizBuilder {...mockProps} />);
      
      const saveButton = screen.getByText('Save Quiz');
      fireEvent.click(saveButton);
      
      // Should show validation error for missing title
      await waitFor(() => {
        expect(mockProps.onSave).not.toHaveBeenCalled();
      });
    });
  });

  describe('QuizAnalyticsDashboard', () => {
    it('renders analytics overview', () => {
      renderWithQueryClient(<QuizAnalyticsDashboard />);
      
      expect(screen.getByText('Quiz Analytics')).toBeInTheDocument();
      expect(screen.getByText('Analyze quiz performance and student progress')).toBeInTheDocument();
    });

    it('displays key metrics', () => {
      renderWithQueryClient(<QuizAnalyticsDashboard />);
      
      expect(screen.getByText('5')).toBeInTheDocument(); // Total quizzes
      expect(screen.getByText('25')).toBeInTheDocument(); // Total attempts
      expect(screen.getByText('78%')).toBeInTheDocument(); // Average score
      expect(screen.getByText('85%')).toBeInTheDocument(); // Completion rate
    });

    it('allows exporting data', () => {
      renderWithQueryClient(<QuizAnalyticsDashboard />);
      
      const exportButton = screen.getByText('Export');
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('QuizAttemptInterface', () => {
    const mockProps = {
      quizId: 1,
      onComplete: vi.fn(),
      onCancel: vi.fn()
    };

    it('renders quiz start screen', () => {
      renderWithQueryClient(<QuizAttemptInterface {...mockProps} />);
      
      expect(screen.getByText('Test Quiz')).toBeInTheDocument();
      expect(screen.getByText('Start Quiz')).toBeInTheDocument();
    });

    it('shows quiz information before starting', () => {
      renderWithQueryClient(<QuizAttemptInterface {...mockProps} />);
      
      expect(screen.getByText('Questions: 1')).toBeInTheDocument();
      expect(screen.getByText('Time Limit: 30 minutes')).toBeInTheDocument();
    });

    it('allows starting quiz', async () => {
      renderWithQueryClient(<QuizAttemptInterface {...mockProps} />);
      
      const startButton = screen.getByText('Start Quiz');
      fireEvent.click(startButton);
      
      // Should start the quiz session
      await waitFor(() => {
        expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
      });
    });
  });

  describe('QuizResultsInterface', () => {
    const mockProps = {
      quizId: 1,
      attemptId: 1,
      onRetakeQuiz: vi.fn(),
      onBackToQuizzes: vi.fn()
    };

    it('renders quiz results', () => {
      renderWithQueryClient(<QuizResultsInterface {...mockProps} />);
      
      expect(screen.getByText('Test Quiz')).toBeInTheDocument();
      expect(screen.getByText('Quiz Results')).toBeInTheDocument();
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
    });

    it('displays score and performance metrics', () => {
      renderWithQueryClient(<QuizResultsInterface {...mockProps} />);
      
      expect(screen.getByText('85%')).toBeInTheDocument(); // Score
      expect(screen.getByText('17/20')).toBeInTheDocument(); // Correct answers
      expect(screen.getByText('20m 0s')).toBeInTheDocument(); // Time taken
    });

    it('shows question review', () => {
      renderWithQueryClient(<QuizResultsInterface {...mockProps} />);
      
      // Switch to review tab
      fireEvent.click(screen.getByText('Review'));
      
      expect(screen.getByText('Question Review')).toBeInTheDocument();
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    });

    it('allows sharing results', () => {
      renderWithQueryClient(<QuizResultsInterface {...mockProps} />);
      
      const shareButton = screen.getByText('Share Results');
      expect(shareButton).toBeInTheDocument();
    });

    it('allows downloading results', () => {
      renderWithQueryClient(<QuizResultsInterface {...mockProps} />);
      
      const downloadButton = screen.getByText('Download');
      expect(downloadButton).toBeInTheDocument();
    });
  });
});

describe('Quiz Management Integration', () => {
  it('handles complete quiz creation workflow', async () => {
    const mockOnSave = vi.fn();
    renderWithQueryClient(<QuizBuilder onSave={mockOnSave} />);
    
    // Fill in basic info
    const titleInput = screen.getByLabelText(/quiz title/i);
    fireEvent.change(titleInput, { target: { value: 'New Test Quiz' } });
    
    // Add a question
    fireEvent.click(screen.getByText('Questions'));
    const questionInput = screen.getByPlaceholderText('Enter your question');
    fireEvent.change(questionInput, { target: { value: 'What is the capital of France?' } });
    
    // Add answers
    const answerInputs = screen.getAllByPlaceholderText(/Option \d/);
    fireEvent.change(answerInputs[0], { target: { value: 'London' } });
    fireEvent.change(answerInputs[1], { target: { value: 'Paris' } });
    fireEvent.change(answerInputs[2], { target: { value: 'Berlin' } });
    fireEvent.change(answerInputs[3], { target: { value: 'Madrid' } });
    
    // Set correct answer (Paris - index 1)
    const correctAnswerRadio = screen.getAllByRole('radio')[1];
    fireEvent.click(correctAnswerRadio);
    
    // Configure settings
    fireEvent.click(screen.getByText('Settings'));
    const timeLimitInput = screen.getByLabelText(/time limit/i);
    fireEvent.change(timeLimitInput, { target: { value: '45' } });
    
    // Save quiz
    const saveButton = screen.getByText('Save Quiz');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('handles quiz attempt workflow with auto-save', async () => {
    const mockOnComplete = vi.fn();
    renderWithQueryClient(<QuizAttemptInterface quizId={1} onComplete={mockOnComplete} />);
    
    // Start quiz
    const startButton = screen.getByText('Start Quiz');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    });
    
    // Answer question
    const answerOption = screen.getByLabelText('4');
    fireEvent.click(answerOption);
    
    // Submit quiz
    const submitButton = screen.getByText('Submit Quiz');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
});