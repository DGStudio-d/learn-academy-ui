import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { translationService, type TranslationGroup, type LanguageConfig } from '../services/translationService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from './use-toast';

// Hook for getting dynamic translations from API
export const useApiTranslations = (locale: string) => {
  return useQuery({
    queryKey: ['translations', locale],
    queryFn: () => translationService.getTranslations(locale),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 or 500 - use local fallback instead
      if (error?.response?.status === 404 || error?.response?.status === 500) {
        return false;
      }
      return failureCount < 2;
    },
    enabled: !!locale,
  });
};

// Hook for getting available languages from API
export const useAvailableLanguages = () => {
  return useQuery({
    queryKey: ['languages', 'available'],
    queryFn: translationService.getAvailableLanguages,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error: any) => {
      // Don't retry if API is down - use default languages
      if (error?.response?.status === 404 || error?.response?.status === 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook for updating user language preference
export const useUpdateLanguagePreference = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: translationService.updateUserLanguagePreference,
    onSuccess: () => {
      // Invalidate user data to refresh the preference
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      }
    },
    onError: (error: any) => {
      // Don't show error toast if user is not authenticated
      if (error?.response?.status !== 401) {
        toast({
          title: 'Error',
          description: 'Failed to save language preference to server',
          variant: 'destructive',
        });
      }
    },
  });
};

// Admin hooks for translation management
export const useAllTranslations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin', 'translations', 'all'],
    queryFn: translationService.getAllTranslations,
    enabled: user?.role === 'admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateTranslations = () => {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();

  return useMutation({
    mutationFn: ({ locale, translations }: { locale: string; translations: TranslationGroup }) =>
      translationService.updateTranslations(locale, translations),
    onSuccess: (_, { locale }) => {
      // Invalidate translation queries
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'translations'] });
      
      // Reload current language if it was updated
      if (i18n.language === locale) {
        i18n.reloadResources(locale);
      }
      
      toast({
        title: 'Success',
        description: `Translations updated for ${locale}`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update translations',
        variant: 'destructive',
      });
    },
  });
};

export const useAddTranslationKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locale, key, value }: { locale: string; key: string; value: string }) =>
      translationService.addTranslationKey(locale, key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'translations'] });
      
      toast({
        title: 'Success',
        description: 'Translation key added successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add translation key',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteTranslationKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locale, key }: { locale: string; key: string }) =>
      translationService.deleteTranslationKey(locale, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'translations'] });
      
      toast({
        title: 'Success',
        description: 'Translation key deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete translation key',
        variant: 'destructive',
      });
    },
  });
};

export const useImportTranslations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locale, file }: { locale: string; file: File }) =>
      translationService.importTranslations(locale, file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'translations'] });
      
      toast({
        title: 'Import Complete',
        description: `Imported ${result.imported} translations. ${result.errors.length} errors.`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to import translations',
        variant: 'destructive',
      });
    },
  });
};

export const useExportTranslations = () => {
  return useMutation({
    mutationFn: ({ locale, format }: { locale: string; format: 'json' | 'csv' }) =>
      translationService.exportTranslations(locale, format),
    onSuccess: (blob, { locale, format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `translations-${locale}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: `Translations exported for ${locale}`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to export translations',
        variant: 'destructive',
      });
    },
  });
};

export const useSyncTranslations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: translationService.syncTranslations,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'translations'] });
      
      toast({
        title: 'Sync Complete',
        description: `Synced ${result.synced} translations. ${result.conflicts.length} conflicts.`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to sync translations',
        variant: 'destructive',
      });
    },
  });
};