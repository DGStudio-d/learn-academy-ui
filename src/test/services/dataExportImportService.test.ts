import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataExportImportService } from '../../services/dataExportImportService';
import api from '../../lib/api';

// Mock the API
vi.mock('../../lib/api');
const mockedApi = vi.mocked(api);

describe('dataExportImportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Export functionality', () => {
    it('should start export successfully', async () => {
      const mockExportJob = {
        id: 'export-123',
        type: 'users',
        status: 'pending' as const,
        progress: 0,
        total_records: 0,
        processed_records: 0,
        created_at: '2024-01-01T00:00:00Z'
      };

      mockedApi.post.mockResolvedValue({
        data: {
          success: true,
          data: mockExportJob
        }
      });

      const result = await dataExportImportService.startExport({
        type: 'users',
        options: { format: 'csv' }
      });

      expect(result).toEqual(mockExportJob);
      expect(mockedApi.post).toHaveBeenCalledWith('/admin/export/start', {
        type: 'users',
        options: { format: 'csv' }
      });
    });

    it('should export users with filters', async () => {
      const mockExportJob = {
        id: 'export-456',
        type: 'users',
        status: 'pending' as const,
        progress: 0,
        total_records: 0,
        processed_records: 0,
        created_at: '2024-01-01T00:00:00Z'
      };

      mockedApi.post.mockResolvedValue({
        data: {
          success: true,
          data: mockExportJob
        }
      });

      const filters = { role: 'student', date_from: '2024-01-01' };
      const options = { format: 'excel' as const };

      const result = await dataExportImportService.exportUsers(filters, options);

      expect(result).toEqual(mockExportJob);
      expect(mockedApi.post).toHaveBeenCalledWith('/admin/export/start', {
        type: 'users',
        filters,
        options
      });
    });

    it('should get export status', async () => {
      const mockStatus = {
        id: 'export-123',
        type: 'users',
        status: 'completed' as const,
        progress: 100,
        total_records: 150,
        processed_records: 150,
        download_url: 'https://example.com/download',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockedApi.get.mockResolvedValue({
        data: {
          success: true,
          data: mockStatus
        }
      });

      const result = await dataExportImportService.getExportStatus('export-123');

      expect(result).toEqual(mockStatus);
      expect(mockedApi.get).toHaveBeenCalledWith('/admin/export/export-123/status');
    });

    it('should download export file', async () => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' });

      mockedApi.get.mockResolvedValue({
        data: mockBlob
      });

      const result = await dataExportImportService.downloadExport('export-123');

      expect(result).toEqual(mockBlob);
      expect(mockedApi.get).toHaveBeenCalledWith('/admin/export/export-123/download', {
        responseType: 'blob'
      });
    });
  });

  describe('Import functionality', () => {
    it('should start import successfully', async () => {
      const mockImportJob = {
        id: 'import-123',
        type: 'users',
        status: 'pending' as const,
        progress: 0,
        total_records: 0,
        processed_records: 0,
        success_count: 0,
        error_count: 0,
        errors: [],
        warnings: [],
        created_at: '2024-01-01T00:00:00Z'
      };

      mockedApi.post.mockResolvedValue({
        data: {
          success: true,
          data: mockImportJob
        }
      });

      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      const result = await dataExportImportService.startImport({
        type: 'users',
        file: mockFile
      });

      expect(result).toEqual(mockImportJob);
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/admin/import/start',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
    });

    it('should validate import file', async () => {
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: [],
        previewData: [
          { name: 'John Doe', email: 'john@example.com', role: 'student' }
        ]
      };

      mockedApi.post.mockResolvedValue({
        data: {
          success: true,
          data: mockValidation
        }
      });

      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      const result = await dataExportImportService.validateImportFile(mockFile, 'users');

      expect(result).toEqual(mockValidation);
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/admin/import/validate',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
    });

    it('should get import template', async () => {
      const mockBlob = new Blob(['name,email,role'], { type: 'text/csv' });

      mockedApi.get.mockResolvedValue({
        data: mockBlob
      });

      const result = await dataExportImportService.getImportTemplate('users', 'csv');

      expect(result).toEqual(mockBlob);
      expect(mockedApi.get).toHaveBeenCalledWith('/admin/import/template/users?format=csv', {
        responseType: 'blob'
      });
    });
  });

  describe('Backup functionality', () => {
    it('should create backup successfully', async () => {
      const mockBackup = {
        backup_id: 'backup-123',
        download_url: 'https://example.com/backup'
      };

      mockedApi.post.mockResolvedValue({
        data: {
          success: true,
          data: mockBackup
        }
      });

      const options = {
        includeFiles: true,
        includeDatabase: true,
        includeSettings: true,
        compression: 'gzip' as const
      };

      const result = await dataExportImportService.createBackup(options);

      expect(result).toEqual(mockBackup);
      expect(mockedApi.post).toHaveBeenCalledWith('/admin/backup/create', options);
    });

    it('should get backups list', async () => {
      const mockBackups = [
        {
          backup_id: 'backup-123',
          download_url: 'https://example.com/backup1'
        },
        {
          backup_id: 'backup-456',
          download_url: 'https://example.com/backup2'
        }
      ];

      mockedApi.get.mockResolvedValue({
        data: {
          success: true,
          data: mockBackups
        }
      });

      const result = await dataExportImportService.getBackups();

      expect(result).toEqual(mockBackups);
      expect(mockedApi.get).toHaveBeenCalledWith('/admin/backup/list');
    });

    it('should restore backup', async () => {
      mockedApi.post.mockResolvedValue({
        data: {
          success: true
        }
      });

      const options = {
        restoreFiles: true,
        restoreDatabase: true,
        restoreSettings: false,
        createBackupBeforeRestore: true
      };

      await dataExportImportService.restoreBackup('backup-123', options);

      expect(mockedApi.post).toHaveBeenCalledWith('/admin/backup/backup-123/restore', options);
    });
  });

  describe('Report functionality', () => {
    it('should generate report successfully', async () => {
      const mockReportJob = {
        id: 'report-123',
        type: 'user_activity',
        status: 'pending' as const,
        created_at: '2024-01-01T00:00:00Z'
      };

      mockedApi.post.mockResolvedValue({
        data: {
          success: true,
          data: mockReportJob
        }
      });

      const request = {
        type: 'user_activity' as const,
        parameters: { date_from: '2024-01-01', date_to: '2024-01-31' },
        format: 'pdf' as const
      };

      const result = await dataExportImportService.generateReport(request);

      expect(result).toEqual(mockReportJob);
      expect(mockedApi.post).toHaveBeenCalledWith('/admin/reports/generate', request);
    });

    it('should get report types', async () => {
      const mockReportTypes = [
        {
          type: 'user_activity',
          name: 'User Activity Report',
          description: 'Track user login and activity patterns',
          parameters: [
            { name: 'date_from', type: 'date', required: true },
            { name: 'date_to', type: 'date', required: true }
          ]
        }
      ];

      mockedApi.get.mockResolvedValue({
        data: {
          success: true,
          data: mockReportTypes
        }
      });

      const result = await dataExportImportService.getReportTypes();

      expect(result).toEqual(mockReportTypes);
      expect(mockedApi.get).toHaveBeenCalledWith('/admin/reports/types');
    });
  });

  describe('Error handling', () => {
    it('should handle API errors properly', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {
            success: false,
            message: 'Internal server error'
          }
        }
      };

      mockedApi.post.mockRejectedValue(mockError);

      await expect(
        dataExportImportService.startExport({
          type: 'users',
          options: { format: 'csv' }
        })
      ).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      const mockError = new Error('Network error');
      mockedApi.get.mockRejectedValue(mockError);

      await expect(
        dataExportImportService.getExportHistory()
      ).rejects.toThrow();
    });
  });
});