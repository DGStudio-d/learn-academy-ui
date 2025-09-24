import { apiMethods } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
  maxRetries?: number;
  chunkSize?: number; // For large file uploads
}

export interface FileUploadResponse {
  id: string;
  name: string;
  original_name: string;
  url: string;
  thumbnail_url?: string;
  mime_type: string;
  size: number;
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  uploaded_at: string;
  uploaded_by: {
    id: number;
    name: string;
  };
  is_public: boolean;
  tags?: string[];
  description?: string;
}

export interface FileValidationRules {
  maxSize: number; // in bytes
  allowedTypes: string[]; // MIME types or extensions
  maxFiles?: number;
  minWidth?: number; // for images
  minHeight?: number; // for images
  maxWidth?: number; // for images
  maxHeight?: number; // for images
}

export interface BulkUploadResult {
  successful: FileUploadResponse[];
  failed: Array<{
    file: File;
    error: string;
  }>;
}

class FileUploadService {
  private readonly baseUrl = '/api/files';

  /**
   * Upload a single file
   */
  async uploadFile(
    file: File,
    options: UploadOptions = {}
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
        signal: options.signal,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result: ApiResponse<FileUploadResponse> = await response.json();
      return result.data!;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Upload cancelled');
      }
      throw error;
    }
  }

  /**
   * Upload multiple files with progress tracking
   */
  async uploadFiles(
    files: File[],
    options: UploadOptions = {}
  ): Promise<BulkUploadResult> {
    const successful: FileUploadResponse[] = [];
    const failed: Array<{ file: File; error: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const fileOptions: UploadOptions = {
          ...options,
          onProgress: (progress) => {
            // Calculate overall progress
            const overallProgress = {
              loaded: (i * 100) + progress.percentage,
              total: files.length * 100,
              percentage: ((i * 100) + progress.percentage) / files.length,
            };
            options.onProgress?.(overallProgress);
          },
        };

        const result = await this.uploadFile(file, fileOptions);
        successful.push(result);
      } catch (error) {
        failed.push({
          file,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Upload file with chunking for large files
   */
  async uploadLargeFile(
    file: File,
    options: UploadOptions = {}
  ): Promise<FileUploadResponse> {
    const chunkSize = options.chunkSize || 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    // Initialize upload session
    const sessionResponse = await apiMethods.post<{ upload_id: string }>('/files/upload/init', {
      filename: file.name,
      size: file.size,
      mime_type: file.type,
      total_chunks: totalChunks,
    });

    const uploadId = sessionResponse.upload_id;
    
    try {
      // Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('upload_id', uploadId);
        formData.append('chunk_index', chunkIndex.toString());
        formData.append('total_chunks', totalChunks.toString());

        await fetch(`${this.baseUrl}/upload/chunk`, {
          method: 'POST',
          body: formData,
          signal: options.signal,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        // Report progress
        const progress = {
          loaded: end,
          total: file.size,
          percentage: (end / file.size) * 100,
        };
        options.onProgress?.(progress);
      }

      // Finalize upload
      const result = await apiMethods.post<FileUploadResponse>('/files/upload/finalize', {
        upload_id: uploadId,
      });

      return result;
    } catch (error) {
      // Cleanup failed upload
      await this.cancelUpload(uploadId);
      throw error;
    }
  }

  /**
   * Cancel an ongoing upload
   */
  async cancelUpload(uploadId: string): Promise<void> {
    try {
      await apiMethods.delete(`/files/upload/${uploadId}`);
    } catch (error) {
      console.warn('Failed to cancel upload:', error);
    }
  }

  /**
   * Get file validation rules
   */
  async getValidationRules(): Promise<FileValidationRules> {
    return apiMethods.get<FileValidationRules>('/files/validation-rules');
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, rules: FileValidationRules): string | null {
    // Check file size
    if (file.size > rules.maxSize) {
      const maxSizeMB = Math.round(rules.maxSize / (1024 * 1024));
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check file type
    if (rules.allowedTypes.length > 0) {
      const fileType = file.type.toLowerCase();
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      const isAllowed = rules.allowedTypes.some(type => {
        if (type.includes('/')) {
          // MIME type check
          return fileType === type || fileType.startsWith(type.replace('*', ''));
        } else {
          // Extension check
          return fileExtension === type.replace('.', '');
        }
      });

      if (!isAllowed) {
        return `File type not allowed. Allowed types: ${rules.allowedTypes.join(', ')}`;
      }
    }

    return null;
  }

  /**
   * Get image dimensions
   */
  getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File is not an image'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validate image dimensions
   */
  async validateImageDimensions(
    file: File,
    rules: FileValidationRules
  ): Promise<string | null> {
    if (!file.type.startsWith('image/')) {
      return null; // Not an image, skip validation
    }

    try {
      const dimensions = await this.getImageDimensions(file);
      
      if (rules.minWidth && dimensions.width < rules.minWidth) {
        return `Image width must be at least ${rules.minWidth}px`;
      }
      
      if (rules.minHeight && dimensions.height < rules.minHeight) {
        return `Image height must be at least ${rules.minHeight}px`;
      }
      
      if (rules.maxWidth && dimensions.width > rules.maxWidth) {
        return `Image width must be less than ${rules.maxWidth}px`;
      }
      
      if (rules.maxHeight && dimensions.height > rules.maxHeight) {
        return `Image height must be less than ${rules.maxHeight}px`;
      }
      
      return null;
    } catch (error) {
      return 'Failed to validate image dimensions';
    }
  }

  /**
   * Resize image before upload
   */
  resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.9
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for resizing'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate thumbnail for image
   */
  generateThumbnail(
    file: File,
    size: number = 150,
    quality: number = 0.8
  ): Promise<Blob> {
    return this.resizeImage(file, size, size, quality);
  }

  /**
   * Get file type from MIME type
   */
  getFileType(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
    ];
    
    const archiveTypes = [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
    ];
    
    if (documentTypes.includes(mimeType)) return 'document';
    if (archiveTypes.includes(mimeType)) return 'archive';
    
    return 'other';
  }

  /**
   * Create file preview URL
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke file preview URL
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

export const fileUploadService = new FileUploadService();
export default fileUploadService;