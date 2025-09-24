import { apiMethods } from '@/lib/api';
import type { PaginatedResponse } from '@/types/api';
import type { MediaFile } from '@/components/ui/media-gallery';

export interface MediaFilters {
  type?: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  search?: string;
  tags?: string[];
  uploaded_by?: number;
  date_from?: string;
  date_to?: string;
  is_public?: boolean;
  page?: number;
  per_page?: number;
  sort_by?: 'name' | 'size' | 'uploaded_at' | 'type';
  sort_order?: 'asc' | 'desc';
}

export interface MediaFileUpdate {
  name?: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
}

export interface MediaStats {
  total_files: number;
  total_size: number;
  files_by_type: Record<string, number>;
  storage_used: number;
  storage_limit: number;
  recent_uploads: MediaFile[];
}

class MediaService {
  private readonly baseUrl = '/api/media';

  /**
   * Get paginated list of media files
   */
  async getFiles(filters: MediaFilters = {}): Promise<PaginatedResponse<MediaFile>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(`${key}[]`, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    return apiMethods.get<PaginatedResponse<MediaFile>>(
      `${this.baseUrl}?${params.toString()}`
    );
  }

  /**
   * Get a single media file by ID
   */
  async getFile(id: string): Promise<MediaFile> {
    return apiMethods.get<MediaFile>(`${this.baseUrl}/${id}`);
  }

  /**
   * Update media file metadata
   */
  async updateFile(id: string, updates: MediaFileUpdate): Promise<MediaFile> {
    return apiMethods.put<MediaFile>(`${this.baseUrl}/${id}`, updates);
  }

  /**
   * Delete a media file
   */
  async deleteFile(id: string): Promise<void> {
    return apiMethods.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Delete multiple media files
   */
  async deleteFiles(ids: string[]): Promise<{ deleted: string[]; failed: string[] }> {
    return apiMethods.post<{ deleted: string[]; failed: string[] }>(
      `${this.baseUrl}/bulk-delete`,
      { ids }
    );
  }

  /**
   * Get media statistics
   */
  async getStats(): Promise<MediaStats> {
    return apiMethods.get<MediaStats>(`${this.baseUrl}/stats`);
  }

  /**
   * Search media files
   */
  async searchFiles(query: string, filters: Omit<MediaFilters, 'search'> = {}): Promise<MediaFile[]> {
    const searchFilters: MediaFilters = { ...filters, search: query };
    const response = await this.getFiles(searchFilters);
    return response.data.data;
  }

  /**
   * Get files by tag
   */
  async getFilesByTag(tag: string): Promise<MediaFile[]> {
    return apiMethods.get<MediaFile[]>(`${this.baseUrl}/tags/${encodeURIComponent(tag)}`);
  }

  /**
   * Get all available tags
   */
  async getTags(): Promise<string[]> {
    return apiMethods.get<string[]>(`${this.baseUrl}/tags`);
  }

  /**
   * Add tags to a file
   */
  async addTags(id: string, tags: string[]): Promise<MediaFile> {
    return apiMethods.post<MediaFile>(`${this.baseUrl}/${id}/tags`, { tags });
  }

  /**
   * Remove tags from a file
   */
  async removeTags(id: string, tags: string[]): Promise<MediaFile> {
    return apiMethods.delete<MediaFile>(`${this.baseUrl}/${id}/tags`, { tags });
  }

  /**
   * Generate download URL for a file
   */
  async getDownloadUrl(id: string): Promise<{ url: string; expires_at: string }> {
    return apiMethods.get<{ url: string; expires_at: string }>(
      `${this.baseUrl}/${id}/download-url`
    );
  }

  /**
   * Download a file
   */
  async downloadFile(file: MediaFile): Promise<void> {
    try {
      // Get secure download URL
      const { url } = await this.getDownloadUrl(file.id);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.target = '_blank';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // Fallback to direct URL if secure download fails
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Copy file URL to clipboard
   */
  async copyFileUrl(file: MediaFile): Promise<void> {
    try {
      await navigator.clipboard.writeText(file.url);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = file.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  /**
   * Get file usage information
   */
  async getFileUsage(id: string): Promise<{
    used_in: Array<{
      type: 'profile' | 'quiz' | 'meeting' | 'program';
      id: number;
      title: string;
      url?: string;
    }>;
    can_delete: boolean;
  }> {
    return apiMethods.get(`${this.baseUrl}/${id}/usage`);
  }

  /**
   * Duplicate a file
   */
  async duplicateFile(id: string, name?: string): Promise<MediaFile> {
    return apiMethods.post<MediaFile>(`${this.baseUrl}/${id}/duplicate`, {
      name: name || undefined,
    });
  }

  /**
   * Move files to folder (if folder system is implemented)
   */
  async moveFiles(fileIds: string[], folderId?: string): Promise<void> {
    return apiMethods.post<void>(`${this.baseUrl}/move`, {
      file_ids: fileIds,
      folder_id: folderId,
    });
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(id: string): Promise<{
    exif?: Record<string, any>;
    dimensions?: { width: number; height: number };
    duration?: number; // for video/audio files
    bitrate?: number;
    codec?: string;
  }> {
    return apiMethods.get(`${this.baseUrl}/${id}/metadata`);
  }

  /**
   * Generate thumbnail for video file
   */
  async generateVideoThumbnail(id: string, timestamp?: number): Promise<{ thumbnail_url: string }> {
    return apiMethods.post<{ thumbnail_url: string }>(`${this.baseUrl}/${id}/thumbnail`, {
      timestamp: timestamp || 0,
    });
  }

  /**
   * Optimize image file
   */
  async optimizeImage(
    id: string,
    options: {
      quality?: number;
      max_width?: number;
      max_height?: number;
      format?: 'jpeg' | 'png' | 'webp';
    }
  ): Promise<MediaFile> {
    return apiMethods.post<MediaFile>(`${this.baseUrl}/${id}/optimize`, options);
  }

  /**
   * Get storage quota information
   */
  async getStorageQuota(): Promise<{
    used: number;
    total: number;
    percentage: number;
    files_count: number;
    files_limit?: number;
  }> {
    return apiMethods.get(`${this.baseUrl}/quota`);
  }

  /**
   * Clean up unused files
   */
  async cleanupUnusedFiles(): Promise<{
    deleted_count: number;
    freed_space: number;
    deleted_files: string[];
  }> {
    return apiMethods.post(`${this.baseUrl}/cleanup`);
  }

  /**
   * Export media files list
   */
  async exportFilesList(
    filters: MediaFilters = {},
    format: 'csv' | 'json' = 'csv'
  ): Promise<{ download_url: string }> {
    return apiMethods.post(`${this.baseUrl}/export`, {
      filters,
      format,
    });
  }

  /**
   * Get file sharing settings
   */
  async getSharingSettings(id: string): Promise<{
    is_public: boolean;
    public_url?: string;
    expires_at?: string;
    password_protected: boolean;
    download_count: number;
    max_downloads?: number;
  }> {
    return apiMethods.get(`${this.baseUrl}/${id}/sharing`);
  }

  /**
   * Update file sharing settings
   */
  async updateSharingSettings(
    id: string,
    settings: {
      is_public?: boolean;
      expires_at?: string;
      password?: string;
      max_downloads?: number;
    }
  ): Promise<{
    is_public: boolean;
    public_url?: string;
    expires_at?: string;
    password_protected: boolean;
  }> {
    return apiMethods.put(`${this.baseUrl}/${id}/sharing`, settings);
  }

  /**
   * Get file access logs
   */
  async getAccessLogs(
    id: string,
    page: number = 1,
    per_page: number = 20
  ): Promise<PaginatedResponse<{
    id: number;
    action: 'view' | 'download' | 'share';
    user_id?: number;
    user?: { id: number; name: string };
    ip_address: string;
    user_agent: string;
    created_at: string;
  }>> {
    return apiMethods.get(`${this.baseUrl}/${id}/access-logs?page=${page}&per_page=${per_page}`);
  }

  /**
   * Validate file before operations
   */
  validateFileOperation(file: MediaFile, operation: 'delete' | 'move' | 'share'): {
    allowed: boolean;
    reason?: string;
  } {
    // Check if user owns the file or has permission
    // This would typically check against user permissions
    
    switch (operation) {
      case 'delete':
        // Check if file is in use
        return { allowed: true };
      
      case 'move':
        return { allowed: true };
      
      case 'share':
        return { allowed: true };
      
      default:
        return { allowed: false, reason: 'Unknown operation' };
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type icon
   */
  getFileTypeIcon(type: MediaFile['type']): string {
    const icons = {
      image: '🖼️',
      video: '🎥',
      audio: '🎵',
      document: '📄',
      archive: '📦',
      other: '📎',
    };
    return icons[type] || icons.other;
  }

  /**
   * Check if file type supports preview
   */
  supportsPreview(file: MediaFile): boolean {
    const previewableTypes = ['image', 'video', 'audio'];
    const previewableMimeTypes = [
      'application/pdf',
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
    ];
    
    return previewableTypes.includes(file.type) || 
           previewableMimeTypes.includes(file.mimeType);
  }
}

export const mediaService = new MediaService();
export default mediaService;