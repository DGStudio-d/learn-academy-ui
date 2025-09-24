import api from '../lib/api';
import type { ApiResponse, ApiErrorResponse } from '../types/api';
import { SearchFilters, SearchResult } from './searchService';
import { ApiErrorHandler } from '../lib/errorHandler';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  includeFields?: string[];
  excludeFields?: string[];
  filename?: string;
}

export interface ExportRequest {
  filters: SearchFilters;
  options: ExportOptions;
  maxResults?: number;
}

export interface ExportResponse {
  download_url: string;
  filename: string;
  file_size: number;
  expires_at: string;
  export_id: string;
}

export interface ExportStatus {
  export_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_records: number;
  processed_records: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  download_url?: string;
  filename?: string;
  file_size?: number;
  expires_at?: string;
}

export const searchExportService = {
  // Start export process
  startExport: async (request: ExportRequest): Promise<ExportStatus> => {
    try {
      const response = await api.post<ApiResponse<ExportStatus>>('/search/export', request);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to start export');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to start search export'
      });
      throw error;
    }
  },

  // Get export status
  getExportStatus: async (exportId: string): Promise<ExportStatus> => {
    try {
      const response = await api.get<ApiResponse<ExportStatus>>(`/search/export/${exportId}/status`);
      
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
  downloadExport: async (exportId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/search/export/${exportId}/download`, {
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

  // Get user's export history
  getExportHistory: async (limit = 10): Promise<ExportStatus[]> => {
    try {
      const response = await api.get<ApiResponse<ExportStatus[]>>(`/search/exports?limit=${limit}`);
      
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

  // Cancel export
  cancelExport: async (exportId: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>(`/search/export/${exportId}`);
      
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

  // Quick export (for small result sets)
  quickExport: async (
    results: SearchResult[],
    format: 'csv' | 'json' = 'csv',
    filename?: string
  ): Promise<void> => {
    try {
      let content: string;
      let mimeType: string;
      let fileExtension: string;

      if (format === 'csv') {
        content = convertToCSV(results);
        mimeType = 'text/csv';
        fileExtension = 'csv';
      } else {
        content = JSON.stringify(results, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = filename || `search-results-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('Failed to export search results');
    }
  },

  // Export search results as formatted report
  exportReport: async (
    results: SearchResult[],
    filters: SearchFilters,
    options: {
      includeMetadata?: boolean;
      includeFilters?: boolean;
      format?: 'html' | 'pdf';
    } = {}
  ): Promise<void> => {
    try {
      const reportData = {
        results,
        filters: options.includeFilters ? filters : undefined,
        metadata: options.includeMetadata ? {
          exportedAt: new Date().toISOString(),
          totalResults: results.length,
          exportedBy: 'Current User' // This would come from auth context
        } : undefined,
        format: options.format || 'html'
      };

      const response = await api.post('/search/export/report', reportData, {
        responseType: 'blob'
      });

      // Download the generated report
      const blob = new Blob([response.data], { 
        type: options.format === 'pdf' ? 'application/pdf' : 'text/html' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `search-report-${new Date().toISOString().split('T')[0]}.${options.format || 'html'}`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to export search report'
      });
      throw error;
    }
  }
};

// Helper function to convert search results to CSV
function convertToCSV(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No results to export';
  }

  // Define CSV headers
  const headers = [
    'Type',
    'ID',
    'Title',
    'Description',
    'Subtitle',
    'Relevance Score',
    'URL'
  ];

  // Add metadata headers dynamically
  const metadataKeys = new Set<string>();
  results.forEach(result => {
    if (result.metadata) {
      Object.keys(result.metadata).forEach(key => metadataKeys.add(key));
    }
  });

  const allHeaders = [...headers, ...Array.from(metadataKeys).map(key => `Metadata: ${key}`)];

  // Create CSV content
  const csvRows = [
    allHeaders.join(','), // Header row
    ...results.map(result => {
      const row = [
        escapeCSVField(result.type),
        escapeCSVField(result.id.toString()),
        escapeCSVField(result.title),
        escapeCSVField(result.description || ''),
        escapeCSVField(result.subtitle || ''),
        escapeCSVField(result.relevance_score?.toString() || ''),
        escapeCSVField(result.url || '')
      ];

      // Add metadata values
      metadataKeys.forEach(key => {
        const value = result.metadata?.[key];
        row.push(escapeCSVField(value ? String(value) : ''));
      });

      return row.join(',');
    })
  ];

  return csvRows.join('\n');
}

// Helper function to escape CSV fields
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// Export field configurations for different content types
export const exportFieldConfigs = {
  users: {
    default: ['id', 'name', 'email', 'role', 'preferred_language', 'is_active'],
    optional: ['phone', 'last_login_at', 'created_at', 'updated_at'],
    labels: {
      id: 'User ID',
      name: 'Full Name',
      email: 'Email Address',
      role: 'User Role',
      preferred_language: 'Language',
      is_active: 'Active Status',
      phone: 'Phone Number',
      last_login_at: 'Last Login',
      created_at: 'Registration Date',
      updated_at: 'Last Updated'
    }
  },
  programs: {
    default: ['id', 'name', 'description', 'language', 'teacher', 'is_active'],
    optional: ['created_at', 'updated_at', 'students_count', 'quizzes_count'],
    labels: {
      id: 'Program ID',
      name: 'Program Name',
      description: 'Description',
      language: 'Language',
      teacher: 'Teacher',
      is_active: 'Active Status',
      created_at: 'Created Date',
      updated_at: 'Last Updated',
      students_count: 'Number of Students',
      quizzes_count: 'Number of Quizzes'
    }
  },
  quizzes: {
    default: ['id', 'title', 'description', 'program', 'teacher', 'questions_count'],
    optional: ['time_limit', 'max_attempts', 'guest_can_access', 'created_at', 'average_score'],
    labels: {
      id: 'Quiz ID',
      title: 'Quiz Title',
      description: 'Description',
      program: 'Program',
      teacher: 'Teacher',
      questions_count: 'Number of Questions',
      time_limit: 'Time Limit (minutes)',
      max_attempts: 'Max Attempts',
      guest_can_access: 'Guest Access',
      created_at: 'Created Date',
      average_score: 'Average Score'
    }
  },
  meetings: {
    default: ['id', 'title', 'description', 'program', 'teacher', 'scheduled_at'],
    optional: ['duration', 'meeting_url', 'is_active', 'created_at', 'attendees_count'],
    labels: {
      id: 'Meeting ID',
      title: 'Meeting Title',
      description: 'Description',
      program: 'Program',
      teacher: 'Teacher',
      scheduled_at: 'Scheduled Date/Time',
      duration: 'Duration (minutes)',
      meeting_url: 'Meeting URL',
      is_active: 'Active Status',
      created_at: 'Created Date',
      attendees_count: 'Number of Attendees'
    }
  }
};