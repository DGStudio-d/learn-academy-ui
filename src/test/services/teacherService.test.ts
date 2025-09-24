import { describe, it, expect, vi, beforeEach } from 'vitest';
import { teacherService } from '../../services/teacherService';
import api from '../../lib/api';
import type { 
  User, 
  Program, 
  Quiz, 
  Meeting, 
  StudentProgress, 
  ContentAnalytics,
  MeetingAttendance,
  AdvancedQuestion,
  QuizSettings
} from '../../types/api';

// Mock the API
vi.mock('../../lib/api');
const mockedApi = vi.mocked(api);

describe('TeacherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Student Tracking', () => {
    it('should get students list', async () => {
      const mockStudents = {
        success: true,
        data: {
          data: [
            { id: 1, name: 'Student 1', email: 'student1@test.com', role: 'student' as const },
            { id: 2, name: 'Student 2', email: 'student2@test.com', role: 'student' as const }
          ],
          current_page: 1,
          per_page: 10,
          total: 2,
          last_page: 1
        }
      };

      mockedApi.get.mockResolvedValueOnce({ data: mockStudents });

      const result = await teacherService.getStudents();

      expect(mockedApi.get).toHaveBeenCalledWith('/teacher/students?page=1');
      expect(result).toEqual(mockStudents);
    });

    it('should get students filtered by program', async () => {
      const programId = 1;
      const mockStudents = {
        success: true,
        data: {
          data: [
            { id: 1, name: 'Student 1', email: 'student1@test.com', role: 'student' as const }
          ],
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1
        }
      };

      mockedApi.get.mockResolvedValueOnce({ data: mockStudents });

      const result = await teacherService.getStudents(programId);

      expect(mockedApi.get).toHaveBeenCalledWith(`/teacher/students?program_id=${programId}&page=1`);
      expect(result).toEqual(mockStudents);
    });

    it('should get student progress', async () => {
      const studentId = 1;
      const mockProgress: StudentProgress = {
        student: { id: 1, name: 'Student 1', email: 'student1@test.com', role: 'student' as const } as User,
        quiz_attempts: [],
        meeting_attendance: [],
        overall_progress: {
          quizzes_completed: 5,
          total_quizzes: 10,
          average_score: 85,
          meetings_attended: 3,
          total_meetings: 5,
          completion_percentage: 60
        }
      };

      mockedApi.get.mockResolvedValueOnce({
        data: { success: true, data: mockProgress }
      });

      const result = await teacherService.getStudentProgress(studentId);

      expect(mockedApi.get).toHaveBeenCalledWith(`/teacher/students/${studentId}/progress`);
      expect(result).toEqual(mockProgress);
    });
  });

  describe('Content Analytics', () => {
    it('should get content analytics', async () => {
      const mockAnalytics: ContentAnalytics = {
        quiz_analytics: {
          total_quizzes: 10,
          total_attempts: 50,
          average_score: 78,
          completion_rate: 85,
          popular_quizzes: []
        },
        meeting_analytics: {
          total_meetings: 5,
          total_attendees: 25,
          average_attendance: 80,
          upcoming_meetings: []
        },
        student_analytics: {
          total_students: 20,
          active_students: 18,
          top_performers: []
        }
      };

      mockedApi.get.mockResolvedValueOnce({
        data: { success: true, data: mockAnalytics }
      });

      const result = await teacherService.getContentAnalytics();

      expect(mockedApi.get).toHaveBeenCalledWith('/teacher/analytics?');
      expect(result).toEqual(mockAnalytics);
    });

    it('should get content analytics with filters', async () => {
      const filters = {
        program_id: 1,
        language_id: 2,
        date_from: '2024-01-01',
        date_to: '2024-12-31'
      };

      const mockAnalytics: ContentAnalytics = {
        quiz_analytics: {
          total_quizzes: 5,
          total_attempts: 25,
          average_score: 82,
          completion_rate: 90,
          popular_quizzes: []
        },
        meeting_analytics: {
          total_meetings: 3,
          total_attendees: 15,
          average_attendance: 85,
          upcoming_meetings: []
        },
        student_analytics: {
          total_students: 10,
          active_students: 9,
          top_performers: []
        }
      };

      mockedApi.get.mockResolvedValueOnce({
        data: { success: true, data: mockAnalytics }
      });

      const result = await teacherService.getContentAnalytics(filters);

      expect(mockedApi.get).toHaveBeenCalledWith(
        '/teacher/analytics?program_id=1&language_id=2&date_from=2024-01-01&date_to=2024-12-31'
      );
      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('Language-specific Content', () => {
    it('should get programs by language', async () => {
      const languageId = 1;
      const mockPrograms = {
        success: true,
        data: {
          data: [
            { id: 1, name: 'Program 1', language_id: languageId }
          ],
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1
        }
      };

      mockedApi.get.mockResolvedValueOnce({ data: mockPrograms });

      const result = await teacherService.getContentByLanguage(languageId, 'programs');

      expect(mockedApi.get).toHaveBeenCalledWith(`/teacher/programs?language_id=${languageId}&page=1`);
      expect(result).toEqual(mockPrograms);
    });

    it('should get quizzes by language', async () => {
      const languageId = 2;
      const mockQuizzes = {
        success: true,
        data: {
          data: [
            { id: 1, title: 'Quiz 1', language_id: languageId }
          ],
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1
        }
      };

      mockedApi.get.mockResolvedValueOnce({ data: mockQuizzes });

      const result = await teacherService.getContentByLanguage(languageId, 'quizzes');

      expect(mockedApi.get).toHaveBeenCalledWith(`/teacher/quizzes?language_id=${languageId}&page=1`);
      expect(result).toEqual(mockQuizzes);
    });
  });

  describe('Meeting Management', () => {
    it('should assign students to meeting', async () => {
      const meetingId = 1;
      const studentIds = [1, 2, 3];

      mockedApi.post.mockResolvedValueOnce({
        data: { success: true }
      });

      await teacherService.assignStudentsToMeeting(meetingId, studentIds);

      expect(mockedApi.post).toHaveBeenCalledWith(
        `/teacher/meetings/${meetingId}/assign-students`,
        { student_ids: studentIds }
      );
    });

    it('should remove students from meeting', async () => {
      const meetingId = 1;
      const studentIds = [1, 2];

      mockedApi.post.mockResolvedValueOnce({
        data: { success: true }
      });

      await teacherService.removeStudentsFromMeeting(meetingId, studentIds);

      expect(mockedApi.post).toHaveBeenCalledWith(
        `/teacher/meetings/${meetingId}/remove-students`,
        { student_ids: studentIds }
      );
    });

    it('should get meeting attendees', async () => {
      const meetingId = 1;
      const mockAttendees: MeetingAttendance[] = [
        {
          student: { id: 1, name: 'Student 1', email: 'student1@test.com', role: 'student' as const } as User,
          attended: true,
          attended_at: '2024-01-15T10:00:00Z'
        },
        {
          student: { id: 2, name: 'Student 2', email: 'student2@test.com', role: 'student' as const } as User,
          attended: false
        }
      ];

      mockedApi.get.mockResolvedValueOnce({
        data: { success: true, data: mockAttendees }
      });

      const result = await teacherService.getMeetingAttendees(meetingId);

      expect(mockedApi.get).toHaveBeenCalledWith(`/teacher/meetings/${meetingId}/attendees`);
      expect(result).toEqual(mockAttendees);
    });
  });

  describe('Advanced Quiz Creation', () => {
    it('should create advanced quiz', async () => {
      const quizData = {
        title: 'Advanced Quiz',
        description: 'A comprehensive quiz',
        program_id: 1,
        language_id: 1,
        questions: [
          {
            type: 'multiple_choice' as const,
            question: 'What is 2+2?',
            answers: ['3', '4', '5', '6'],
            correct_answer: 1,
            explanation: 'Basic math',
            points: 10
          }
        ] as AdvancedQuestion[],
        settings: {
          time_limit: 60,
          max_attempts: 3,
          guest_can_access: false,
          show_results_immediately: true,
          allow_review: true,
          randomize_questions: false,
          randomize_answers: true,
          passing_score: 70
        } as QuizSettings
      };

      const mockQuiz = {
        id: 1,
        title: 'Advanced Quiz',
        ...quizData
      };

      mockedApi.post.mockResolvedValueOnce({
        data: { success: true, data: mockQuiz }
      });

      const result = await teacherService.createAdvancedQuiz(quizData);

      expect(mockedApi.post).toHaveBeenCalledWith('/teacher/quizzes/advanced', quizData);
      expect(result).toEqual(mockQuiz);
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk update quizzes', async () => {
      const quizIds = [1, 2, 3];
      const updates = { is_active: false };

      mockedApi.put.mockResolvedValueOnce({
        data: { success: true }
      });

      await teacherService.bulkUpdateQuizzes(quizIds, updates);

      expect(mockedApi.put).toHaveBeenCalledWith('/teacher/quizzes/bulk-update', {
        quiz_ids: quizIds,
        updates
      });
    });

    it('should bulk update meetings', async () => {
      const meetingIds = [1, 2];
      const updates = { is_active: true };

      mockedApi.put.mockResolvedValueOnce({
        data: { success: true }
      });

      await teacherService.bulkUpdateMeetings(meetingIds, updates);

      expect(mockedApi.put).toHaveBeenCalledWith('/teacher/meetings/bulk-update', {
        meeting_ids: meetingIds,
        updates
      });
    });
  });

  describe('Export Functionality', () => {
    it('should export student progress', async () => {
      const filters = {
        program_id: 1,
        student_ids: [1, 2, 3],
        format: 'csv' as const
      };

      const mockExportResult = {
        download_url: 'https://example.com/download/progress.csv'
      };

      mockedApi.post.mockResolvedValueOnce({
        data: { success: true, data: mockExportResult }
      });

      const result = await teacherService.exportStudentProgress(filters);

      expect(mockedApi.post).toHaveBeenCalledWith('/teacher/export/student-progress', filters);
      expect(result).toEqual(mockExportResult);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const error = new Error('Network error');
      mockedApi.get.mockRejectedValueOnce(error);

      await expect(teacherService.getStudents()).rejects.toThrow('Network error');
    });

    it('should handle unsuccessful API responses', async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: { success: false, message: 'Access denied' }
      });

      await expect(teacherService.getStudents()).rejects.toThrow('Failed to get students');
    });
  });
});