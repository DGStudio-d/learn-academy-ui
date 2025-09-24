import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  dataExportImportService,
  ExportRequest,
  ExportJob,
  ImportRequest,
  ImportJob,
  ReportRequest,
  ReportJob,
  BackupOptions,
  RestoreOptions,
  ExportFilters,
  ExportOptions,
  ImportOptions
} from '../services/dataExportImportService';
import { useNotificationService } from './useNotificationService';

export const useDataExportImport = () => {
  const [activeJobs, setActiveJobs] = useState<Map<string, any>>(new Map());
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationService();

  // ===== EXPORT HOOKS =====

  // Start export mutation
  const startExportMutation = useMutation({
    mutationFn: (request: ExportRequest) => dataExportImportService.startExport(request),
    onSuccess: (job: ExportJob) => {
      setActiveJobs(prev => new Map(prev.set(job.id, job)));
      showNotification({
        type: 'success',
        title: 'Export Started',
        message: `Export job ${job.id} has been started successfully.`
      });
      
      // Start polling for job status
      pollJobStatus(job.id, 'export');
    },
    onError: (error: any) => {
      showNotification({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to start export job.'
      });
    }
  });

  // Export users
  const exportUsers = useCallback((filters?: ExportFilters, options?: ExportOptions) => {
    return startExportMutation.mutate({
      type: 'users',
      filters,
      options: options || { format: 'csv' }
    });
  }, [startExportMutation]);

  // Export quiz results
  const exportQuizResults = useCallback((filters?: ExportFilters, options?: ExportOptions) => {
    return startExportMutation.mutate({
      type: 'quiz_results',
      filters,
      options: options || { format: 'excel' }
    });
  }, [startExportMutation]);

  // Export programs
  const exportPrograms = useCallback((filters?: ExportFilters, options?: ExportOptions) => {
    return startExportMutation.mutate({
      type: 'programs',
      filters,
      options: options || { format: 'csv' }
    });
  }, [startExportMutation]);

  // Export meetings
  const exportMeetings = useCallback((filters?: ExportFilters, options?: ExportOptions) => {
    return startExportMutation.mutate({
      type: 'meetings',
      filters,
      options: options || { format: 'csv' }
    });
  }, [startExportMutation]);

  // Export enrollments
  const exportEnrollments = useCallback((filters?: ExportFilters, options?: ExportOptions) => {
    return startExportMutation.mutate({
      type: 'enrollments',
      filters,
      options: options || { format: 'excel' }
    });
  }, [startExportMutation]);

  // Get export history
  const { data: exportHistory, isLoading: isLoadingExportHistory } = useQuery({
    queryKey: ['export-history'],
    queryFn: () => dataExportImportService.getExportHistory(),
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Download export
  const downloadExportMutation = useMutation({
    mutationFn: (jobId: string) => dataExportImportService.downloadExport(jobId),
    onSuccess: (blob: Blob, jobId: string) => {
      // Get job details to determine filename
      const job = activeJobs.get(jobId) || exportHistory?.find(j => j.id === jobId);
      const filename = job?.filename || `export-${jobId}.csv`;
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Download Complete',
        message: `Export file ${filename} has been downloaded successfully.`
      });
    },
    onError: (error: any) => {
      showNotification({
        type: 'error',
        title: 'Download Failed',
        message: error.message || 'Failed to download export file.'
      });
    }
  });

  // Cancel export
  const cancelExportMutation = useMutation({
    mutationFn: (jobId: string) => dataExportImportService.cancelExport(jobId),
    onSuccess: (_, jobId: string) => {
      setActiveJobs(prev => {
        const newMap = new Map(prev);
        newMap.delete(jobId);
        return newMap;
      });
      queryClient.invalidateQueries({ queryKey: ['export-history'] });
      
      showNotification({
        type: 'info',
        title: 'Export Cancelled',
        message: `Export job ${jobId} has been cancelled.`
      });
    }
  });

  // ===== IMPORT HOOKS =====

  // Start import mutation
  const startImportMutation = useMutation({
    mutationFn: (request: ImportRequest) => dataExportImportService.startImport(request),
    onSuccess: (job: ImportJob) => {
      setActiveJobs(prev => new Map(prev.set(job.id, job)));
      showNotification({
        type: 'success',
        title: 'Import Started',
        message: `Import job ${job.id} has been started successfully.`
      });
      
      // Start polling for job status
      pollJobStatus(job.id, 'import');
    },
    onError: (error: any) => {
      showNotification({
        type: 'error',
        title: 'Import Failed',
        message: error.message || 'Failed to start import job.'
      });
    }
  });

  // Import users
  const importUsers = useCallback((file: File, options?: ImportOptions) => {
    return startImportMutation.mutate({
      type: 'users',
      file,
      options
    });
  }, [startImportMutation]);

  // Import programs
  const importPrograms = useCallback((file: File, options?: ImportOptions) => {
    return startImportMutation.mutate({
      type: 'programs',
      file,
      options
    });
  }, [startImportMutation]);

  // Import enrollments
  const importEnrollments = useCallback((file: File, options?: ImportOptions) => {
    return startImportMutation.mutate({
      type: 'enrollments',
      file,
      options
    });
  }, [startImportMutation]);

  // Validate import file
  const validateImportFileMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) => 
      dataExportImportService.validateImportFile(file, type),
    onError: (error: any) => {
      showNotification({
        type: 'error',
        title: 'Validation Failed',
        message: error.message || 'Failed to validate import file.'
      });
    }
  });

  // Get import template
  const downloadImportTemplateMutation = useMutation({
    mutationFn: ({ type, format }: { type: string; format: 'csv' | 'excel' }) => 
      dataExportImportService.getImportTemplate(type, format),
    onSuccess: (blob: Blob, { type, format }) => {
      const filename = `${type}_import_template.${format === 'excel' ? 'xlsx' : 'csv'}`;
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Template Downloaded',
        message: `Import template for ${type} has been downloaded.`
      });
    }
  });

  // Get import history
  const { data: importHistory, isLoading: isLoadingImportHistory } = useQuery({
    queryKey: ['import-history'],
    queryFn: () => dataExportImportService.getImportHistory(),
    refetchInterval: 30000
  });

  // Cancel import
  const cancelImportMutation = useMutation({
    mutationFn: (jobId: string) => dataExportImportService.cancelImport(jobId),
    onSuccess: (_, jobId: string) => {
      setActiveJobs(prev => {
        const newMap = new Map(prev);
        newMap.delete(jobId);
        return newMap;
      });
      queryClient.invalidateQueries({ queryKey: ['import-history'] });
      
      showNotification({
        type: 'info',
        title: 'Import Cancelled',
        message: `Import job ${jobId} has been cancelled.`
      });
    }
  });

  // ===== BACKUP HOOKS =====

  // Create backup
  const createBackupMutation = useMutation({
    mutationFn: (options?: BackupOptions) => dataExportImportService.createBackup(options),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      showNotification({
        type: 'success',
        title: 'Backup Created',
        message: `System backup ${result.backup_id} has been created successfully.`
      });
    },
    onError: (error: any) => {
      showNotification({
        type: 'error',
        title: 'Backup Failed',
        message: error.message || 'Failed to create system backup.'
      });
    }
  });

  // Get backups list
  const { data: backups, isLoading: isLoadingBackups } = useQuery({
    queryKey: ['backups'],
    queryFn: () => dataExportImportService.getBackups()
  });

  // Download backup
  const downloadBackupMutation = useMutation({
    mutationFn: (backupId: string) => dataExportImportService.downloadBackup(backupId),
    onSuccess: (blob: Blob, backupId: string) => {
      const filename = `backup-${backupId}.zip`;
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Backup Downloaded',
        message: `Backup file has been downloaded successfully.`
      });
    }
  });

  // Restore backup
  const restoreBackupMutation = useMutation({
    mutationFn: ({ backupId, options }: { backupId: string; options?: RestoreOptions }) => 
      dataExportImportService.restoreBackup(backupId, options),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Restore Complete',
        message: 'System has been restored from backup successfully.'
      });
    },
    onError: (error: any) => {
      showNotification({
        type: 'error',
        title: 'Restore Failed',
        message: error.message || 'Failed to restore from backup.'
      });
    }
  });

  // Delete backup
  const deleteBackupMutation = useMutation({
    mutationFn: (backupId: string) => dataExportImportService.deleteBackup(backupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      showNotification({
        type: 'success',
        title: 'Backup Deleted',
        message: 'Backup has been deleted successfully.'
      });
    }
  });

  // ===== REPORT HOOKS =====

  // Generate report
  const generateReportMutation = useMutation({
    mutationFn: (request: ReportRequest) => dataExportImportService.generateReport(request),
    onSuccess: (job: ReportJob) => {
      setActiveJobs(prev => new Map(prev.set(job.id, job)));
      showNotification({
        type: 'success',
        title: 'Report Generation Started',
        message: `Report job ${job.id} has been started successfully.`
      });
      
      // Start polling for job status
      pollJobStatus(job.id, 'report');
    }
  });

  // Get report types
  const { data: reportTypes } = useQuery({
    queryKey: ['report-types'],
    queryFn: () => dataExportImportService.getReportTypes()
  });

  // Get report history
  const { data: reportHistory, isLoading: isLoadingReportHistory } = useQuery({
    queryKey: ['report-history'],
    queryFn: () => dataExportImportService.getReportHistory(),
    refetchInterval: 30000
  });

  // Download report
  const downloadReportMutation = useMutation({
    mutationFn: (jobId: string) => dataExportImportService.downloadReport(jobId),
    onSuccess: (blob: Blob, jobId: string) => {
      const job = activeJobs.get(jobId) || reportHistory?.find(j => j.id === jobId);
      const filename = job?.filename || `report-${jobId}.pdf`;
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Report Downloaded',
        message: `Report ${filename} has been downloaded successfully.`
      });
    }
  });

  // ===== UTILITY FUNCTIONS =====

  // Poll job status
  const pollJobStatus = useCallback((jobId: string, type: 'export' | 'import' | 'report') => {
    const pollInterval = setInterval(async () => {
      try {
        let job;
        switch (type) {
          case 'export':
            job = await dataExportImportService.getExportStatus(jobId);
            break;
          case 'import':
            job = await dataExportImportService.getImportStatus(jobId);
            break;
          case 'report':
            job = await dataExportImportService.getReportStatus(jobId);
            break;
        }

        setActiveJobs(prev => new Map(prev.set(jobId, job)));

        if (job.status === 'completed') {
          clearInterval(pollInterval);
          setActiveJobs(prev => {
            const newMap = new Map(prev);
            newMap.delete(jobId);
            return newMap;
          });
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: [`${type}-history`] });
          
          showNotification({
            type: 'success',
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Complete`,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} job ${jobId} has completed successfully.`
          });
        } else if (job.status === 'failed') {
          clearInterval(pollInterval);
          setActiveJobs(prev => {
            const newMap = new Map(prev);
            newMap.delete(jobId);
            return newMap;
          });
          
          showNotification({
            type: 'error',
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Failed`,
            message: job.error_message || `${type.charAt(0).toUpperCase() + type.slice(1)} job ${jobId} has failed.`
          });
        }
      } catch (error) {
        console.error(`Failed to poll ${type} job status:`, error);
        clearInterval(pollInterval);
      }
    }, 2000); // Poll every 2 seconds

    // Clean up after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  }, [queryClient, showNotification]);

  return {
    // Export functions
    exportUsers,
    exportQuizResults,
    exportPrograms,
    exportMeetings,
    exportEnrollments,
    downloadExport: downloadExportMutation.mutate,
    cancelExport: cancelExportMutation.mutate,
    exportHistory,
    isLoadingExportHistory,
    
    // Import functions
    importUsers,
    importPrograms,
    importEnrollments,
    validateImportFile: validateImportFileMutation.mutate,
    downloadImportTemplate: downloadImportTemplateMutation.mutate,
    cancelImport: cancelImportMutation.mutate,
    importHistory,
    isLoadingImportHistory,
    
    // Backup functions
    createBackup: createBackupMutation.mutate,
    downloadBackup: downloadBackupMutation.mutate,
    restoreBackup: restoreBackupMutation.mutate,
    deleteBackup: deleteBackupMutation.mutate,
    backups,
    isLoadingBackups,
    
    // Report functions
    generateReport: generateReportMutation.mutate,
    downloadReport: downloadReportMutation.mutate,
    reportTypes,
    reportHistory,
    isLoadingReportHistory,
    
    // State
    activeJobs: Array.from(activeJobs.values()),
    
    // Loading states
    isExporting: startExportMutation.isPending,
    isImporting: startImportMutation.isPending,
    isCreatingBackup: createBackupMutation.isPending,
    isGeneratingReport: generateReportMutation.isPending,
    isValidatingFile: validateImportFileMutation.isPending,
    
    // Validation results
    validationResult: validateImportFileMutation.data
  };
};