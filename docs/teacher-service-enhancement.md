# Teacher Service Enhancement Documentation

## Overview

This document describes the enhanced teacher service functionality implemented to support comprehensive content management, student tracking, and analytics for teachers in the Learn Academy system.

## New Features

### 1. Student Tracking and Progress Monitoring

#### `getStudents(programId?, page)`
- Fetches students assigned to the teacher
- Optional filtering by program
- Supports pagination
- Returns paginated list of students

#### `getStudentProgress(studentId, programId?)`
- Retrieves comprehensive progress data for a specific student
- Includes quiz attempts, meeting attendance, and overall progress metrics
- Optional filtering by program
- Returns detailed progress analytics

**Example Usage:**
```typescript
import { useTeacherStudents, useStudentProgress } from '../hooks/useTeacher';

const TeacherComponent = () => {
  const { data: students } = useTeacherStudents(programId);
  const { data: progress } = useStudentProgress(studentId);
  
  return (
    <div>
      {students?.data.data.map(student => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
};
```

### 2. Content Analytics

#### `getContentAnalytics(filters?)`
- Provides comprehensive analytics for teacher's content
- Supports filtering by program, language, and date range
- Returns quiz analytics, meeting analytics, and student analytics
- Includes performance metrics and trends

**Analytics Data Structure:**
```typescript
interface ContentAnalytics {
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
```

### 3. Language-Specific Content Filtering

#### `getContentByLanguage(languageId, contentType, page)`
- Filters content (programs, quizzes, meetings) by language
- Supports all content types: 'programs', 'quizzes', 'meetings'
- Enables language-specific content management
- Maintains pagination support

**Example Usage:**
```typescript
import { useContentByLanguage } from '../hooks/useTeacher';

const LanguageFilteredContent = ({ languageId }) => {
  const { data: programs } = useContentByLanguage(languageId, 'programs');
  const { data: quizzes } = useContentByLanguage(languageId, 'quizzes');
  const { data: meetings } = useContentByLanguage(languageId, 'meetings');
  
  // Render filtered content
};
```

### 4. Enhanced Meeting Management

#### `assignStudentsToMeeting(meetingId, studentIds)`
- Assigns multiple students to a meeting
- Supports bulk assignment operations
- Provides proper error handling

#### `removeStudentsFromMeeting(meetingId, studentIds)`
- Removes students from a meeting
- Supports bulk removal operations
- Maintains data consistency

#### `getMeetingAttendees(meetingId)`
- Retrieves attendance information for a meeting
- Shows which students attended and when
- Provides attendance analytics

### 5. Advanced Quiz Creation

#### `createAdvancedQuiz(quizData)`
- Enhanced quiz creation with advanced settings
- Supports multiple question types: multiple_choice, true_false, short_answer, essay
- Configurable quiz settings: time limits, attempts, access controls
- Advanced scheduling and availability options

**Advanced Quiz Data Structure:**
```typescript
interface AdvancedQuizData {
  title: string;
  description?: string;
  program_id: number;
  language_id: number;
  questions: AdvancedQuestion[];
  settings: QuizSettings;
}

interface AdvancedQuestion {
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  question: string;
  answers?: string[];
  correct_answer?: number | string;
  explanation?: string;
  points?: number;
}

interface QuizSettings {
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
```

### 6. Bulk Operations

#### `bulkUpdateQuizzes(quizIds, updates)`
- Updates multiple quizzes simultaneously
- Supports partial updates
- Improves efficiency for mass operations

#### `bulkUpdateMeetings(meetingIds, updates)`
- Updates multiple meetings simultaneously
- Supports partial updates
- Enables efficient meeting management

### 7. Data Export

#### `exportStudentProgress(filters?)`
- Exports student progress data
- Supports CSV and Excel formats
- Configurable filtering options
- Returns download URL for generated file

## React Query Hooks

### Enhanced Hooks

All new functionality is wrapped in React Query hooks for optimal caching and state management:

- `useTeacherStudents(programId?, page)` - Student list with optional filtering
- `useStudentProgress(studentId, programId?)` - Individual student progress
- `useContentAnalytics(filters?)` - Content analytics with filtering
- `useContentByLanguage(languageId, contentType, page)` - Language-filtered content
- `useAssignStudentsToMeeting()` - Meeting student assignment mutation
- `useRemoveStudentsFromMeeting()` - Meeting student removal mutation
- `useMeetingAttendees(meetingId)` - Meeting attendance data
- `useCreateAdvancedQuiz()` - Advanced quiz creation mutation
- `useBulkUpdateQuizzes()` - Bulk quiz update mutation
- `useBulkUpdateMeetings()` - Bulk meeting update mutation
- `useExportStudentProgress()` - Progress export mutation

### Combined Hooks

For better developer experience, combined hooks are provided:

#### `useTeacherContentManagement(languageId?)`
- Combines programs, quizzes, and meetings queries
- Provides unified loading and error states
- Simplifies language-filtered content management

#### `useTeacherDashboardData()`
- Combines stats, languages, programs, and analytics
- Provides comprehensive dashboard data
- Optimizes multiple query management

## Error Handling

All new functions include comprehensive error handling:

- Network error detection and retry logic
- API response validation
- User-friendly error messages
- Proper error logging and debugging information
- Graceful fallback behavior

## Type Safety

Enhanced type definitions ensure type safety:

- `StudentProgress` - Complete student progress structure
- `ContentAnalytics` - Analytics data structure
- `MeetingAttendance` - Meeting attendance information
- `AdvancedQuestion` - Enhanced question types
- `QuizSettings` - Quiz configuration options
- `ContentFilters` - Filtering options
- `BulkOperation` interfaces - Bulk operation parameters

## Performance Optimizations

- Intelligent caching with React Query
- Optimistic updates for mutations
- Proper cache invalidation strategies
- Efficient pagination handling
- Background refetching for real-time data

## Testing

Comprehensive test coverage includes:

- Unit tests for all service functions
- Hook testing with React Testing Library
- Error scenario testing
- Mock API response handling
- Integration test examples

## Usage Examples

### Complete Teacher Dashboard

```typescript
import React from 'react';
import { useTeacherDashboardData } from '../hooks/useTeacher';

const TeacherDashboard = () => {
  const { stats, languages, programs, analytics, isLoading, error } = useTeacherDashboardData();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <DashboardStats stats={stats.data} />
      <LanguageSelector languages={languages.data} />
      <ProgramsList programs={programs.data} />
      <AnalyticsCharts analytics={analytics.data} />
    </div>
  );
};
```

### Student Progress Tracking

```typescript
import React from 'react';
import { useTeacherStudents, useStudentProgress } from '../hooks/useTeacher';

const StudentProgressTracker = () => {
  const [selectedStudent, setSelectedStudent] = useState<number>();
  const { data: students } = useTeacherStudents();
  const { data: progress } = useStudentProgress(selectedStudent || 0);
  
  return (
    <div>
      <StudentList 
        students={students?.data.data} 
        onSelect={setSelectedStudent} 
      />
      {progress && (
        <ProgressDetails progress={progress} />
      )}
    </div>
  );
};
```

### Language-Filtered Content Management

```typescript
import React from 'react';
import { useTeacherContentManagement } from '../hooks/useTeacher';

const ContentManager = ({ languageId }: { languageId: number }) => {
  const { programs, quizzes, meetings, isLoading } = useTeacherContentManagement(languageId);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      <ContentSection title="Programs" data={programs.data} />
      <ContentSection title="Quizzes" data={quizzes.data} />
      <ContentSection title="Meetings" data={meetings.data} />
    </div>
  );
};
```

## API Endpoints

The enhanced teacher service expects the following API endpoints:

- `GET /teacher/students` - Student list with optional filtering
- `GET /teacher/students/{id}/progress` - Student progress details
- `GET /teacher/analytics` - Content analytics with filtering
- `GET /teacher/{content-type}?language_id={id}` - Language-filtered content
- `POST /teacher/meetings/{id}/assign-students` - Assign students to meeting
- `POST /teacher/meetings/{id}/remove-students` - Remove students from meeting
- `GET /teacher/meetings/{id}/attendees` - Meeting attendance data
- `POST /teacher/quizzes/advanced` - Advanced quiz creation
- `PUT /teacher/quizzes/bulk-update` - Bulk quiz updates
- `PUT /teacher/meetings/bulk-update` - Bulk meeting updates
- `POST /teacher/export/student-progress` - Export student progress

## Migration Guide

To upgrade from the basic teacher service:

1. Update imports to include new hooks
2. Replace basic content queries with language-filtered versions
3. Implement student progress tracking components
4. Add analytics dashboards using new analytics hooks
5. Update quiz creation to use advanced quiz builder
6. Implement bulk operations for efficiency

## Best Practices

1. **Caching Strategy**: Use appropriate stale times for different data types
2. **Error Handling**: Implement proper error boundaries and user feedback
3. **Performance**: Use pagination and virtual scrolling for large datasets
4. **User Experience**: Provide loading states and optimistic updates
5. **Type Safety**: Leverage TypeScript types for better development experience
6. **Testing**: Write comprehensive tests for all new functionality

## Conclusion

The enhanced teacher service provides a comprehensive solution for teacher content management, student tracking, and analytics. It maintains backward compatibility while adding powerful new features that improve the teaching experience and provide valuable insights into student performance and content effectiveness.