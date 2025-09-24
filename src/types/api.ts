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
  is_active: boolean;
  last_login_at?: string;
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
  // Enhanced meeting features
  recurring_pattern?: RecurringPattern;
  attendees?: User[];
  resources?: MeetingResource[];
  recording_url?: string;
  recording_status?: 'not_started' | 'recording' | 'completed' | 'failed';
  attendance_tracking_enabled?: boolean;
  notifications_enabled?: boolean;
  reminder_settings?: ReminderSettings;
  created_at: string;
  updated_at: string;
}

// Recurring meeting pattern
export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number; // Every X days/weeks/months
  days_of_week?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
  end_date?: string;
  max_occurrences?: number;
}

// Meeting resources
export interface MeetingResource {
  id: number;
  meeting_id: number;
  name: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  is_downloadable: boolean;
  created_at: string;
}

// Meeting reminder settings
export interface ReminderSettings {
  email_reminders: boolean;
  sms_reminders?: boolean;
  reminder_times: number[]; // Minutes before meeting: [15, 60, 1440] = 15min, 1hr, 1day
  custom_message?: string;
}

// Enhanced meeting attendance
export interface MeetingAttendanceRecord {
  id: number;
  meeting_id: number;
  user_id: number;
  user?: User;
  joined_at?: string;
  left_at?: string;
  duration_minutes?: number;
  attendance_status: 'invited' | 'joined' | 'left' | 'no_show';
  created_at: string;
  updated_at: string;
}

// Meeting session data for real-time tracking
export interface MeetingSession {
  meeting_id: number;
  session_id: string;
  start_time: string;
  end_time?: string;
  participants: MeetingParticipant[];
  recording_status: 'not_started' | 'recording' | 'paused' | 'completed';
  recording_url?: string;
}

// Meeting participant data
export interface MeetingParticipant {
  user_id: number;
  user?: User;
  joined_at: string;
  left_at?: string;
  is_host: boolean;
  audio_enabled: boolean;
  video_enabled: boolean;
  screen_sharing: boolean;
  hand_raised: boolean;
}

// Meeting notification types
export interface MeetingNotification {
  id: number;
  meeting_id: number;
  user_id: number;
  type: 'reminder' | 'started' | 'ended' | 'cancelled' | 'rescheduled';
  title: string;
  message: string;
  scheduled_for?: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
}

// Enrollment Types
export interface Enrollment {
  id: number;
  user_id: number;
  user?: User;
  student?: User;
  program_id: number;
  program?: Program;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  processed_at?: string;
  processed_by?: User;
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
  // Site settings
  site_name?: string;
  site_description?: string;
  default_language?: string;
  allow_registration?: boolean;
  require_email_verification?: boolean;
  maintenance_mode?: boolean;
  
  // Guest access settings
  guest_can_access_languages?: boolean;
  guest_can_access_teachers?: boolean;
  guest_can_access_quizzes?: boolean;
  guest_can_access_programs?: boolean;
  guest_quiz_limit?: number;
  
  // Notification settings
  send_welcome_email?: boolean;
  send_enrollment_notifications?: boolean;
  send_quiz_reminders?: boolean;
  send_admin_alerts?: boolean;
  send_error_notifications?: boolean;
  send_performance_alerts?: boolean;
  
  // System settings
  auto_backup_enabled?: boolean;
  debug_mode?: boolean;
  
  created_at?: string;
  updated_at?: string;
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
  active_sessions?: number;
  daily_logins?: number;
}

// System Health Types
export interface SystemHealth {
  server_status: 'online' | 'warning' | 'offline';
  database_status: 'healthy' | 'warning' | 'error';
  api_status: 'good' | 'slow' | 'error';
  response_time: number;
  avg_response_time: number;
  db_query_time: number;
  cache_hit_rate: number;
  uptime_percentage: number;
  current_uptime: number;
  last_restart?: string;
  cpu_usage: number;
  memory_usage: number;
  memory_used: number;
  memory_total: number;
  disk_usage: number;
  disk_used: number;
  disk_total: number;
}

// Enhanced statistics types
export interface UserStatistics {
  total_users: number;
  new_users_this_month: number;
  active_users_last_30_days: number;
  users_by_role: Record<string, number>;
  users_by_language: Record<string, number>;
  registration_trend: Array<{ date: string; count: number }>;
}

export interface EnrollmentStatistics {
  total_enrollments: number;
  pending_enrollments: number;
  approved_enrollments: number;
  rejected_enrollments: number;
  enrollments_by_program: Array<{ program_name: string; count: number }>;
  enrollment_trend: Array<{ date: string; count: number }>;
}

export interface SystemStatistics {
  system_health: 'healthy' | 'warning' | 'critical';
  database_status: 'connected' | 'disconnected';
  cache_status: 'active' | 'inactive';
  storage_usage: {
    used: number;
    total: number;
    percentage: number;
  };
  api_performance: {
    average_response_time: number;
    requests_per_minute: number;
    error_rate: number;
  };
}

// Enhanced program type with details
export interface ProgramDetails extends Program {
  enrollments_count: number;
  quizzes_count: number;
  meetings_count: number;
  students: User[];
}

// Enhanced enrollment type with details
export interface EnrollmentDetails extends Enrollment {
  user_details: User;
  program_details: Program;
  enrollment_history: Array<{
    status: string;
    changed_at: string;
    changed_by: User;
    notes?: string;
  }>;
}

// Settings category type
export interface SettingsCategory {
  category: string;
  settings: Array<{
    key: string;
    value: any;
    type: 'boolean' | 'string' | 'number' | 'array';
    description: string;
    options?: any[];
  }>;
}

// System log type
export interface SystemLog {
  id: string;
  level: string;
  message: string;
  context: any;
  timestamp: string;
}

// Bulk operation types
export interface BulkUserOperation {
  user_ids: number[];
  updates?: Partial<User>;
}

export interface BulkProgramOperation {
  program_ids: number[];
  updates?: Partial<Program>;
}

export interface BulkEnrollmentOperation {
  enrollment_ids: number[];
  action: 'approve' | 'reject';
  notes?: string;
}

// Import/Export types
export interface ImportResult {
  success: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    data?: any;
  }>;
  warnings?: Array<{
    row: number;
    message: string;
    data?: any;
  }>;
}

export interface ExportFilters {
  role?: string;
  search?: string;
  format?: 'csv' | 'excel';
}

// Backup type
export interface BackupResult {
  backup_id: string;
  download_url: string;
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
// A
dditional system statistics
export interface SystemStatisticsExtended extends SystemStatistics {
  daily_requests?: number;
  daily_logins?: number;
  daily_quiz_attempts?: number;
  daily_errors?: number;
  active_users?: number;
  online_users?: number;
  peak_concurrent?: number;
  avg_session_time?: number;
  total_queries?: number;
  slow_queries?: number;
  database_size?: number;
  db_connections?: number;
}

// Enhanced Question type for advanced quiz creation
export interface AdvancedQuestion extends Question {
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  points?: number;
}

// Quiz settings interface
export interface QuizSettings {
  time_limit?: number;
  max_attempts?: number;
  guest_can_access?: boolean;
  show_results_immediately?: boolean;
  allow_review?: boolean;
  randomize_questions?: boolean;
  randomize_answers?: boolean;
  passing_score?: number;
  available_from?: string;
  available_until?: string;
}

// Enhanced Quiz interface with settings
export interface EnhancedQuiz extends Quiz {
  settings?: QuizSettings;
  questions: AdvancedQuestion[];
}

// Student progress tracking types
export interface StudentProgress {
  student: User;
  program?: Program;
  quiz_attempts: QuizAttempt[];
  meeting_attendance: Array<{
    meeting: Meeting;
    attended: boolean;
    attended_at?: string;
  }>;
  overall_progress: {
    quizzes_completed: number;
    total_quizzes: number;
    average_score: number;
    meetings_attended: number;
    total_meetings: number;
    completion_percentage: number;
  };
}

// Enhanced quiz attempt types for real-time progress tracking
export interface QuizAttemptSession {
  attemptId: number;
  startTime: string;
  quizId: number;
  timeLimit?: number;
  currentAnswers: Record<string, number>;
  timeSpent: number;
  lastSaved?: string;
}

export interface QuizAttemptResults extends QuizAttempt {
  question_results: Array<{
    question_id: number;
    question: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation?: string;
  }>;
  performance_summary: {
    total_time: number;
    average_time_per_question: number;
    accuracy_percentage: number;
    passing_score: number;
    passed: boolean;
  };
}

// Student progress summary types
export interface StudentProgressSummary {
  overall_progress: {
    total_quizzes_available: number;
    quizzes_completed: number;
    total_meetings_available: number;
    meetings_attended: number;
    average_quiz_score: number;
    completion_percentage: number;
  };
  recent_activity: Array<{
    type: 'quiz_attempt' | 'meeting_attendance';
    title: string;
    date: string;
    score?: number;
    status: string;
  }>;
  achievements: Array<{
    id: number;
    title: string;
    description: string;
    earned_at: string;
    badge_icon?: string;
  }>;
}

// Student profile update types
export interface StudentProfileUpdate {
  name?: string;
  phone?: string;
  preferred_language?: 'ar' | 'en' | 'es';
  profile_image?: File;
}

// Content analytics types
export interface ContentAnalytics {
  quiz_analytics: {
    total_quizzes: number;
    total_attempts: number;
    average_score: number;
    completion_rate: number;
    popular_quizzes: Array<{
      quiz: Quiz;
      attempts_count: number;
      average_score: number;
    }>;
  };
  meeting_analytics: {
    total_meetings: number;
    total_attendees: number;
    average_attendance: number;
    upcoming_meetings: Meeting[];
  };
  student_analytics: {
    total_students: number;
    active_students: number;
    top_performers: Array<{
      student: User;
      average_score: number;
      quizzes_completed: number;
    }>;
  };
}

// Legacy meeting attendance type (for backward compatibility)
export interface MeetingAttendance {
  student: User;
  attended: boolean;
  attended_at?: string;
}

// Content filters for language-specific access
export interface ContentFilters {
  language_id?: number;
  program_id?: number;
  date_from?: string;
  date_to?: string;
  is_active?: boolean;
}

// Bulk operation types for teacher content management
export interface BulkQuizOperation {
  quiz_ids: number[];
  updates: Partial<Quiz>;
}

export interface BulkMeetingOperation {
  meeting_ids: number[];
  updates: Partial<Meeting>;
}

// Export filters for student progress
export interface StudentProgressExportFilters {
  program_id?: number;
  student_ids?: number[];
  format?: 'csv' | 'excel';
}//
 Analytics and System Health Types
export interface SystemHealth {
  server_status: 'healthy' | 'warning' | 'critical' | 'offline';
  database_status: 'healthy' | 'warning' | 'critical' | 'offline';
  api_status: 'healthy' | 'warning' | 'critical' | 'offline';
  response_time: number;
  avg_response_time: number;
  db_query_time: number;
  cache_hit_rate: number;
  uptime_percentage: number;
  current_uptime: number;
  last_restart: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  memory_used: number;
  memory_total: number;
  disk_used: number;
  disk_total: number;
}

export interface SystemMetrics {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: number;
  active_users: number;
  response_time: number;
  error_rate: number;
}

export interface SystemLog {
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

export interface DashboardStats {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_admins: number;
  total_programs: number;
  total_quizzes: number;
  total_quiz_attempts: number;
  average_quiz_score: number;
  total_meetings: number;
  active_enrollments: number;
}

// Quiz Analytics Types
export interface QuizAnalytics {
  quiz_id: number;
  total_attempts: number;
  unique_students: number;
  average_score: number;
  completion_rate: number;
  average_time: number;
  difficulty_rating: number;
  score_distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  question_analysis: Array<{
    question_id: number;
    question_text: string;
    correct_rate: number;
    avg_time: number;
    difficulty: 'easy' | 'medium' | 'hard';
    common_mistakes: string[];
  }>;
}

// Progress Tracking Types
export interface ProgressData {
  overall_progress: {
    completion_percentage: number;
    average_score: number;
    quizzes_completed: number;
    total_quizzes: number;
    meetings_attended: number;
    total_meetings: number;
    time_spent: number;
    streak_days: number;
    level: number;
    experience_points: number;
  };
  quiz_attempts: Array<{
    id: number;
    quiz?: { title: string };
    score: number;
    completed_at: string;
    correct_answers: number;
    total_questions: number;
  }>;
}