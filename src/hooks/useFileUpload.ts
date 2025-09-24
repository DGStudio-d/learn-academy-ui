import React, { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fileUploadService, type UploadOptions, type FileUploadResponse, type FileValidationRules } from '@/services/fileUploadService';
import { useToast } from '@/hooks/use-toast';

export interface UseFileUploadOptions {
  onSuccess?: (files: FileUploadResponse[]) => void;
  onError?: (error: Error) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  autoUpload?: boolean;
  validateBeforeUpload?: boolean;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  uploadedFiles: FileUploadResponse[];
  failedFiles: Array<{ file: File; error: string }>;
  totalFiles: number;
  completedFiles: number;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    uploadedFiles: [],
    failedFiles: [],
    totalFiles: 0,
    completedFiles: 0,
  });

  const [validationRules, setValidationRules] = useState<FileValidationRules | null>(null);

  // Fetch validation rules
  const { mutate: fetchValidationRules } = useMutation({
    mutationFn: fileUploadService.getValidationRules,
    onSuccess: (rules) => {
      setValidationRules(rules);
    },
    onError: (error) => {
      console.warn('Failed to fetch validation rules:', error);
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      // Create abort controller for this upload session
      abortControllerRef.current = new AbortController();
      
      const uploadOptions: UploadOptions = {
        signal: abortControllerRef.current.signal,
        onProgress: (progress) => {
          setUploadState(prev => ({
            ...prev,
            progress: progress.percentage,
          }));
        },
      };

      // Upload files
      if (files.length === 1) {
        const result = await fileUploadService.uploadFile(files[0], uploadOptions);
        return { successful: [result], failed: [] };
      } else {
        return await fileUploadService.uploadFiles(files, uploadOptions);
      }
    },
    onMutate: (files) => {
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        totalFiles: files.length,
        completedFiles: 0,
        uploadedFiles: [],
        failedFiles: [],
      }));
    },
    onSuccess: (result) => {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadedFiles: result.successful,
        failedFiles: result.failed,
        completedFiles: result.successful.length + result.failed.length,
      }));

      // Show success message
      if (result.successful.length > 0) {
        toast({
          title: 'Upload Successful',
          description: `${result.successful.length} file(s) uploaded successfully`,
        });
      }

      // Show error message for failed uploads
      if (result.failed.length > 0) {
        toast({
          title: 'Upload Errors',
          description: `${result.failed.length} file(s) failed to upload`,
          variant: 'destructive',
        });
      }

      // Invalidate media queries to refresh the gallery
      queryClient.invalidateQueries({ queryKey: ['media'] });
      
      options.onSuccess?.(result.successful);
    },
    onError: (error: Error) => {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
      }));

      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });

      options.onError?.(error);
    },
  });

  // Validate files before upload
  const validateFiles = useCallback((files: File[]): { valid: File[]; invalid: Array<{ file: File; error: string }> } => {
    const valid: File[] = [];
    const invalid: Array<{ file: File; error: string }> = [];

    // Check file count
    if (options.maxFiles && files.length > options.maxFiles) {
      files.forEach(file => {
        invalid.push({ file, error: `Maximum ${options.maxFiles} files allowed` });
      });
      return { valid, invalid };
    }

    files.forEach(file => {
      // Basic validation
      let error: string | null = null;

      // Check file size
      if (options.maxSize && file.size > options.maxSize * 1024 * 1024) {
        error = `File size must be less than ${options.maxSize}MB`;
      }

      // Check file type
      if (options.allowedTypes && options.allowedTypes.length > 0) {
        const fileType = file.type.toLowerCase();
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        const isAllowed = options.allowedTypes.some(type => {
          if (type.includes('/')) {
            return fileType === type || fileType.startsWith(type.replace('*', ''));
          } else {
            return fileExtension === type.replace('.', '');
          }
        });

        if (!isAllowed) {
          error = `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`;
        }
      }

      // Use server validation rules if available
      if (validationRules) {
        const serverError = fileUploadService.validateFile(file, validationRules);
        if (serverError) {
          error = serverError;
        }
      }

      if (error) {
        invalid.push({ file, error });
      } else {
        valid.push(file);
      }
    });

    return { valid, invalid };
  }, [options.maxFiles, options.maxSize, options.allowedTypes, validationRules]);

  // Upload files
  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Validate files if enabled
    if (options.validateBeforeUpload !== false) {
      const { valid, invalid } = validateFiles(files);
      
      if (invalid.length > 0) {
        setUploadState(prev => ({
          ...prev,
          failedFiles: invalid,
        }));
        
        toast({
          title: 'Validation Errors',
          description: `${invalid.length} file(s) failed validation`,
          variant: 'destructive',
        });
      }

      if (valid.length === 0) return;
      
      uploadMutation.mutate(valid);
    } else {
      uploadMutation.mutate(files);
    }
  }, [options.validateBeforeUpload, validateFiles, uploadMutation, toast]);

  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      progress: 0,
    }));

    toast({
      title: 'Upload Cancelled',
      description: 'File upload has been cancelled',
    });
  }, [toast]);

  // Reset upload state
  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      uploadedFiles: [],
      failedFiles: [],
      totalFiles: 0,
      completedFiles: 0,
    });
  }, []);

  // Retry failed uploads
  const retryFailedUploads = useCallback(() => {
    const failedFiles = uploadState.failedFiles.map(f => f.file);
    if (failedFiles.length > 0) {
      uploadFiles(failedFiles);
    }
  }, [uploadState.failedFiles, uploadFiles]);

  // Initialize validation rules on mount
  React.useEffect(() => {
    if (!validationRules) {
      fetchValidationRules();
    }
  }, [validationRules, fetchValidationRules]);

  return {
    // State
    uploadState,
    isUploading: uploadState.isUploading,
    progress: uploadState.progress,
    uploadedFiles: uploadState.uploadedFiles,
    failedFiles: uploadState.failedFiles,
    
    // Actions
    uploadFiles,
    cancelUpload,
    resetUpload,
    retryFailedUploads,
    validateFiles,
    
    // Utils
    validationRules,
  };
};

export default useFileUpload;