import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService, type MediaFilters } from '@/services/mediaService';
import type { MediaFile } from '@/components/ui/media-gallery';
import { useToast } from '@/hooks/use-toast';

export interface UseMediaGalleryOptions {
  initialFilters?: MediaFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useMediaGallery = (options: UseMediaGalleryOptions = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<MediaFilters>(options.initialFilters || {});
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Fetch media files
  const {
    data: mediaResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['media', 'files', filters],
    queryFn: () => mediaService.getFiles(filters),
    refetchInterval: options.autoRefresh ? (options.refreshInterval || 30000) : false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch media stats
  const { data: stats } = useQuery({
    queryKey: ['media', 'stats'],
    queryFn: mediaService.getStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch available tags
  const { data: availableTags } = useQuery({
    queryKey: ['media', 'tags'],
    queryFn: mediaService.getTags,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: mediaService.deleteFile,
    onSuccess: (_, fileId) => {
      toast({
        title: 'File Deleted',
        description: 'File has been successfully deleted',
      });
      
      // Remove from selected files
      setSelectedFiles(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(fileId);
        return newSelected;
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: mediaService.deleteFiles,
    onSuccess: (result) => {
      const { deleted, failed } = result;
      
      if (deleted.length > 0) {
        toast({
          title: 'Files Deleted',
          description: `${deleted.length} file(s) deleted successfully`,
        });
      }
      
      if (failed.length > 0) {
        toast({
          title: 'Some Deletions Failed',
          description: `${failed.length} file(s) could not be deleted`,
          variant: 'destructive',
        });
      }
      
      // Clear selection
      setSelectedFiles(new Set());
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Bulk Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update file mutation
  const updateFileMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      mediaService.updateFile(id, updates),
    onSuccess: () => {
      toast({
        title: 'File Updated',
        description: 'File has been successfully updated',
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<MediaFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(options.initialFilters || {});
  }, [options.initialFilters]);

  // Search files
  const searchFiles = useCallback((query: string) => {
    updateFilters({ search: query, page: 1 });
  }, [updateFilters]);

  // Filter by type
  const filterByType = useCallback((type: MediaFilters['type']) => {
    updateFilters({ type, page: 1 });
  }, [updateFilters]);

  // Select/deselect files
  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(fileId)) {
        newSelected.delete(fileId);
      } else {
        newSelected.add(fileId);
      }
      return newSelected;
    });
  }, []);

  const selectAllFiles = useCallback(() => {
    if (mediaResponse?.data.data) {
      const allIds = mediaResponse.data.data.map(file => file.id);
      setSelectedFiles(new Set(allIds));
    }
  }, [mediaResponse]);

  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  // File operations
  const deleteFile = useCallback((fileId: string) => {
    deleteFileMutation.mutate(fileId);
  }, [deleteFileMutation]);

  const deleteSelectedFiles = useCallback(() => {
    if (selectedFiles.size > 0) {
      bulkDeleteMutation.mutate(Array.from(selectedFiles));
    }
  }, [selectedFiles, bulkDeleteMutation]);

  const updateFile = useCallback((fileId: string, updates: any) => {
    updateFileMutation.mutate({ id: fileId, updates });
  }, [updateFileMutation]);

  const downloadFile = useCallback(async (file: MediaFile) => {
    try {
      await mediaService.downloadFile(file);
      toast({
        title: 'Download Started',
        description: `Downloading ${file.name}`,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const copyFileUrl = useCallback(async (file: MediaFile) => {
    try {
      await mediaService.copyFileUrl(file);
      toast({
        title: 'URL Copied',
        description: 'File URL has been copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy URL to clipboard',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Pagination
  const goToPage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const changePageSize = useCallback((perPage: number) => {
    updateFilters({ per_page: perPage, page: 1 });
  }, [updateFilters]);

  // Sorting
  const sortBy = useCallback((sortBy: MediaFilters['sort_by'], sortOrder: MediaFilters['sort_order'] = 'desc') => {
    updateFilters({ sort_by: sortBy, sort_order: sortOrder });
  }, [updateFilters]);

  // Get files array
  const files = mediaResponse?.data.data || [];
  const pagination = mediaResponse?.data;
  const selectedFilesArray = files.filter(file => selectedFiles.has(file.id));

  return {
    // Data
    files,
    pagination,
    stats,
    availableTags,
    filters,
    
    // Selection
    selectedFiles: selectedFilesArray,
    selectedFileIds: selectedFiles,
    hasSelection: selectedFiles.size > 0,
    
    // Loading states
    isLoading,
    isError,
    error,
    isDeleting: deleteFileMutation.isPending || bulkDeleteMutation.isPending,
    isUpdating: updateFileMutation.isPending,
    
    // Actions
    refetch,
    updateFilters,
    resetFilters,
    searchFiles,
    filterByType,
    
    // Selection actions
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    
    // File operations
    deleteFile,
    deleteSelectedFiles,
    updateFile,
    downloadFile,
    copyFileUrl,
    
    // Pagination
    goToPage,
    changePageSize,
    
    // Sorting
    sortBy,
  };
};

export default useMediaGallery;