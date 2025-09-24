import api from '../lib/api';
import type { 
  ApiResponse, 
  ApiErrorResponse,
  User,
  Quiz,
  QuizAttempt,
  Program,
  Meeting,
  Enrollment,
  ImportResult,
  BackupResult
} from '../types/api';
import { ApiErrorHandler } from '../lib/errorHandler';

// Export types
export interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  includeFields?: string[];
  excludeFields?: string[];
  filename?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface ExportFilters {
  role?: string;
  program_id?: number;
  language_id?: number;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  is_active?: boolean;
}

export interface ExportRequest {
  type: 'users' | 'quiz_results' | 'programs' | 'meetings' | 'enrollments';
  filters?: ExportFilters;
  options: ExportOptions;
}

export interface ExportJob {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_records: number;
  processed_records: number;
  download_url?: string;
  filename?: string;
  file_size?: number;
  expires_at?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

// Import types
export interface ImportOptions {
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  validateOnly?: boolean;
  batchSize?: number;
}

export interface ImportRequest {
  type: 'users' | 'programs' | 'enrollments';
  file: File;
  options?: ImportOptions;
}

export interface ImportJob {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_records: number;
  processed_records: number;
  success_count: number;
  error_count: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    data?: any;
  }>;
  warnings: Array<{
    row: number;
    message: string;
    data?: any;
  }>;
  created_at: string;
  completed_at?: string;
}

// Report types
export interface ReportRequest {
  type: 'user_activity' | 'quiz_performance' | 'program_analytics' | 'system_usage';
  parameters: Record<string, any>;
  format: 'pdf' | 'excel' | 'html';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
}

export interface ReportJob {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  filename?: string;
  file_size?: number;
  expires_at?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

// Backup types
export interface BackupOptions {
  includeFiles?: boolean;
  includeDatabase?: boolean;
  includeSettings?: boolean;
  compression?: 'none' | 'gzip' | 'zip';
}

export interface RestoreOptions {
  restoreFiles?: boolean;
  restoreDatabase?: boolean;
  restoreSettings?: boolean;
  createBackupBeforeRestore?: boolean;
}

export const dataExportImportService = {
  // ===== EXPORT FUNCTIONALITY =====
  
  // Start data export
  startExport: async (request: ExportRequest): Promise<ExportJob> => {
    try {
      const response = await api.post<ApiResponse<ExportJob>>('/admin/export/start', request);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to start export');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to start data export'
      });
      throw error;
    }
  },

  // Export users data
  exportUsers: async (filters?: ExportFilters, options?: ExportOptions): Promise<ExportJob> => {
    return dataExportImportService.startExport({
      type: 'users',
      filters,
      options: options || { format: 'csv' }
    });
  },

  // Export quiz results
  exportQuizResults: async (filters?: ExportFilters, options?: ExportOptions): Promise<ExportJob> => {
    return dataExportImportService.startExport({
      type: 'quiz_results',
      filters,
      options: options || { format: 'excel' }
    });
  },

  // Export programs data
  exportPrograms: async (filters?: ExportFilters, options?: ExportOptions): Promise<ExportJob> => {
    return dataExportImportService.startExport({
      type: 'programs',
      filters,
      options: options || { format: 'csv' }
    });
  },

  // Export meetings data
  exportMeetings: async (filters?: ExportFilters, options?: ExportOptions): Promise<ExportJob> => {
    return dataExportImportService.startExport({
      type: 'meetings',
      filters,
      options: options || { format: 'csv' }
    });
  },

  // Export enrollments data
  exportEnrollments: async (filters?: ExportFilters, options?: ExportOptions): Promise<ExportJob> => {
    return dataExportImportService.startExport({
      type: 'enrollments',
      filters,
      options: options || { format: 'excel' }
    });
  },

  // Get export job status
  getExportStatus: async (jobId: string): Promise<ExportJob> => {
    try {
      const response = await api.get<ApiResponse<ExportJob>>(`/admin/export/${jobId}/status`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get export status');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get export status'
      });
      throw error;
    }
  },

  // Download export file
  downloadExport: async (jobId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/admin/export/${jobId}/download`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to download export file'
      });
      throw error;
    }
  },

  // Get export history
  getExportHistory: async (limit = 20): Promise<ExportJob[]> => {
    try {
      const response = await api.get<ApiResponse<ExportJob[]>>(`/admin/export/history?limit=${limit}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get export history');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get export history'
      });
      throw error;
    }
  },

  // Cancel export job
  cancelExport: async (jobId: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>(`/admin/export/${jobId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to cancel export');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to cancel export'
      });
      throw error;
    }
  },

  // ===== IMPORT FUNCTIONALITY =====

  // Start data import
  startImport: async (request: ImportRequest): Promise<ImportJob> => {
    try {
      const formData = new FormData();
      formData.append('file', request.file);
      formData.append('type', request.type);
      
      if (request.options) {
        formData.append('options', JSON.stringify(request.options));
      }

      const response = await api.post<ApiResponse<ImportJob>>('/admin/import/start', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to start import');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to start data import'
      });
      throw error;
    }
  },

  // Import users from file
  importUsers: async (file: File, options?: ImportOptions): Promise<ImportJob> => {
    return dataExportImportService.startImport({
      type: 'users',
      file,
      options
    });
  },

  // Import programs from file
  importPrograms: async (file: File, options?: ImportOptions): Promise<ImportJob> => {
    return dataExportImportService.startImport({
      type: 'programs',
      file,
      options
    });
  },

  // Import enrollments from file
  importEnrollments: async (file: File, options?: ImportOptions): Promise<ImportJob> => {
    return dataExportImportService.startImport({
      type: 'enrollments',
      file,
      options
    });
  },

  // Get import job status
  getImportStatus: async (jobId: string): Promise<ImportJob> => {
    try {
      const response = await api.get<ApiResponse<ImportJob>>(`/admin/import/${jobId}/status`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get import status');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get import status'
      });
      throw error;
    }
  },

  // Get import history
  getImportHistory: async (limit = 20): Promise<ImportJob[]> => {
    try {
      const response = await api.get<ApiResponse<ImportJob[]>>(`/admin/import/history?limit=${limit}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get import history');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get import history'
      });
      throw error;
    }
  },

  // Cancel import job
  cancelImport: async (jobId: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>(`/admin/import/${jobId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to cancel import');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to cancel import'
      });
      throw error;
    }
  },

  // Validate import file
  validateImportFile: async (file: File, type: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    previewData: any[];
  }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await api.post<ApiResponse<any>>('/admin/import/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to validate import file');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to validate import file'
      });
      throw error;
    }
  },

  // Get import template
  getImportTemplate: async (type: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
    try {
      const response = await api.get(`/admin/import/template/${type}?format=${format}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get import template'
      });
      throw error;
    }
  },

  // ===== BACKUP AND RESTORE FUNCTIONALITY =====

  // Create system backup
  createBackup: async (options?: BackupOptions): Promise<BackupResult> => {
    try {
      const response = await api.post<ApiResponse<BackupResult>>('/admin/backup/create', options);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to create backup');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to create system backup'
      });
      throw error;
    }
  },

  // Get backup list
  getBackups: async (): Promise<BackupResult[]> => {
    try {
      const response = await api.get<ApiResponse<BackupResult[]>>('/admin/backup/list');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get backup list');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get backup list'
      });
      throw error;
    }
  },

  // Download backup
  downloadBackup: async (backupId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/admin/backup/${backupId}/download`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to download backup'
      });
      throw error;
    }
  },

  // Restore from backup
  restoreBackup: async (backupId: string, options?: RestoreOptions): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>(`/admin/backup/${backupId}/restore`, options);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to restore backup');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to restore from backup'
      });
      throw error;
    }
  },

  // Delete backup
  deleteBackup: async (backupId: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>(`/admin/backup/${backupId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete backup');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to delete backup'
      });
      throw error;
    }
  },

  // ===== REPORT GENERATION =====

  // Generate report
  generateReport: async (request: ReportRequest): Promise<ReportJob> => {
    try {
      const response = await api.post<ApiResponse<ReportJob>>('/admin/reports/generate', request);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to generate report');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to generate report'
      });
      throw error;
    }
  },

  // Get report status
  getReportStatus: async (jobId: string): Promise<ReportJob> => {
    try {
      const response = await api.get<ApiResponse<ReportJob>>(`/admin/reports/${jobId}/status`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get report status');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get report status'
      });
      throw error;
    }
  },

  // Download report
  downloadReport: async (jobId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/admin/reports/${jobId}/download`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to download report'
      });
      throw error;
    }
  },

  // Get report history
  getReportHistory: async (limit = 20): Promise<ReportJob[]> => {
    try {
      const response = await api.get<ApiResponse<ReportJob[]>>(`/admin/reports/history?limit=${limit}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get report history');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get report history'
      });
      throw error;
    }
  },

  // Get available report types
  getReportTypes: async (): Promise<Array<{
    type: string;
    name: string;
    description: string;
    parameters: Array<{
      name: string;
      type: string;
      required: boolean;
      options?: any[];
    }>;
  }>> => {
    try {
      const response = await api.get<ApiResponse<any>>('/admin/reports/types');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get report types');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get report types'
      });
      throw error;
    }
  }
};

// Export field configurations for different data types
export const exportFieldConfigs = {
  users: {
    default: ['id', 'name', 'email', 'role', 'preferred_language', 'is_active', 'created_at'],
    optional: ['phone', 'last_login_at', 'email_verified_at', 'updated_at'],
    labels: {
      id: 'User ID',
      name: 'Full Name',
      email: 'Email Address',
      role: 'User Role',
      preferred_language: 'Preferred Language',
      is_active: 'Active Status',
      phone: 'Phone Number',
      last_login_at: 'Last Login',
      email_verified_at: 'Email Verified',
      created_at: 'Registration Date',
      updated_at: 'Last Updated'
    }
  },
  quiz_results: {
    default: ['id', 'quiz_title', 'student_name', 'student_email', 'score', 'total_questions', 'correct_answers', 'completed_at'],
    optional: ['time_taken', 'attempt_number', 'program_name', 'teacher_name', 'created_at'],
    labels: {
      id: 'Attempt ID',
      quiz_title: 'Quiz Title',
      student_name: 'Student Name',
      student_email: 'Student Email',
      score: 'Score (%)',
      total_questions: 'Total Questions',
      correct_answers: 'Correct Answers',
      time_taken: 'Time Taken (minutes)',
      attempt_number: 'Attempt Number',
      program_name: 'Program',
      teacher_name: 'Teacher',
      completed_at: 'Completed Date',
      created_at: 'Started Date'
    }
  },
  programs: {
    default: ['id', 'name', 'description', 'language_name', 'teacher_name', 'is_active', 'created_at'],
    optional: ['students_count', 'quizzes_count', 'meetings_count', 'updated_at'],
    labels: {
      id: 'Program ID',
      name: 'Program Name',
      description: 'Description',
      language_name: 'Language',
      teacher_name: 'Teacher',
      is_active: 'Active Status',
      students_count: 'Number of Students',
      quizzes_count: 'Number of Quizzes',
      meetings_count: 'Number of Meetings',
      created_at: 'Created Date',
      updated_at: 'Last Updated'
    }
  },
  meetings: {
    default: ['id', 'title', 'description', 'program_name', 'teacher_name', 'scheduled_at', 'duration'],
    optional: ['meeting_url', 'is_active', 'attendees_count', 'recording_url', 'created_at'],
    labels: {
      id: 'Meeting ID',
      title: 'Meeting Title',
      description: 'Description',
      program_name: 'Program',
      teacher_name: 'Teacher',
      scheduled_at: 'Scheduled Date/Time',
      duration: 'Duration (minutes)',
      meeting_url: 'Meeting URL',
      is_active: 'Active Status',
      attendees_count: 'Number of Attendees',
      recording_url: 'Recording URL',
      created_at: 'Created Date'
    }
  },
  enrollments: {
    default: ['id', 'student_name', 'student_email', 'program_name', 'status', 'enrolled_at'],
    optional: ['notes', 'processed_by', 'processed_at', 'created_at'],
    labels: {
      id: 'Enrollment ID',
      student_name: 'Student Name',
      student_email: 'Student Email',
      program_name: 'Program Name',
      status: 'Status',
      enrolled_at: 'Enrollment Date',
      notes: 'Notes',
      processed_by: 'Processed By',
      processed_at: 'Processed Date',
      created_at: 'Request Date'
    }
  }
};

// Import field mappings for different data types
export const importFieldMappings = {
  users: {
    required: ['name', 'email', 'role'],
    optional: ['password', 'phone', 'preferred_language'],
    defaults: {
      role: 'student',
      preferred_language: 'en',
      is_active: true
    },
    validations: {
      email: 'email',
      role: ['admin', 'teacher', 'student'],
      preferred_language: ['ar', 'en', 'es']
    }
  },
  programs: {
    required: ['name', 'language_id'],
    optional: ['description', 'teacher_id'],
    defaults: {
      is_active: true
    },
    validations: {
      language_id: 'number',
      teacher_id: 'number'
    }
  },
  enrollments: {
    required: ['student_email', 'program_name'],
    optional: ['status', 'notes'],
    defaults: {
      status: 'pending'
    },
    validations: {
      student_email: 'email',
      status: ['pending', 'approved', 'rejected']
    }
  }
};