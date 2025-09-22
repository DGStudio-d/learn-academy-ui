// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    timestamp?: string;
    request_id?: string;
    version?: string;
  };
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
  meta?: {
    pagination: {
      count: number;
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_more_pages?: boolean;
    };
    filters_applied?: Record<string, any>;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  error_code?: string;
  timestamp?: string;
  request_id?: string;
  debug_info?: {
    file?: string;
    line?: number;
    trace?: string[];
  };
}

// Enhanced error types for better error handling
export interface ApiErrorResponse extends Error {
  response?: {
    status: number;
    statusText: string;
    data: ApiError;
  };
  request?: any;
  config?: any;
  code?: string;
  isAxiosError?: boolean;
}

// Network status types
export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  phone?: string;
  preferred_language: 'ar' | 'en' | 'es';
  profile_image?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'student' | 'teacher';
  phone?: string;
  preferred_language?: 'ar' | 'en' | 'es';
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Program Types
export interface Program {
  id: number;
  name: string;
  description?: string;
  language_id: number;
  language?: Language;
  teacher_id?: number;
  teacher?: User;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Language Types
export interface Language {
  id: number;
  name: string;
  code: 'ar' | 'en' | 'es';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Quiz Types
export interface Quiz {
  id: number;
  title: string;
  description?: string;
  program_id: number;
  program?: Program;
  language_id: number;
  language?: Language;
  teacher_id: number;
  teacher?: User;
  questions: Question[];
  time_limit?: number;
  max_attempts?: number;
  is_active: boolean;
  guest_can_access: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id?: number;
  question: string;
  answers: string[];
  correct_answer: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  quiz?: Quiz;
  user_id?: number;
  user?: User;
  guest_name?: string;
  guest_email?: string;
  answers: Record<string, number>;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken?: number;
  completed_at: string;
  created_at: string;
}

// Meeting Types
export interface Meeting {
  id: number;
  title: string;
  description?: string;
  program_id: number;
  program?: Program;
  teacher_id: number;
  teacher?: User;
  meeting_url: string;
  scheduled_at: string;
  duration?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Enrollment Types
export interface Enrollment {
  id: number;
  user_id: number;
  user?: User;
  program_id: number;
  program?: Program;
  status: 'pending' | 'approved' | 'rejected';
  enrolled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentRequest {
  user_id: number;
  program_id: number;
  status?: 'pending' | 'approved' | 'rejected';
}

// Settings Types
export interface AdminSettings {
  guest_can_access_languages: boolean;
  guest_can_access_teachers: boolean;
  guest_can_access_quizzes: boolean;
  created_at: string;
  updated_at: string;
}

// Statistics Types
export interface DashboardStats {
  total_users?: number;
  total_programs?: number;
  total_quizzes?: number;
  total_meetings?: number;
  pending_enrollments?: number;
  active_students?: number;
  active_teachers?: number;
  recent_quiz_attempts?: number;
}

// Notification Types
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read_at?: string;
  created_at: string;
  updated_at: string;
}