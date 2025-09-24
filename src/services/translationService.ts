import api from '../lib/api';
import type { ApiResponse } from '../types/api';
import { ApiErrorHandler } from '../lib/errorHandler';

export interface Translation {
  id: number;
  locale: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface TranslationGroup {
  [key: string]: string | TranslationGroup;
}

export interface LanguageConfig {
  code: string;
  name: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  is_active: boolean;
}

export const translationService = {
  // Get all translations for a specific locale
  getTranslations: async (locale: string): Promise<TranslationGroup> => {
    try {
      const response = await api.get<ApiResponse<TranslationGroup>>(`/translations/${locale}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get translations');
    } catch (error: any) {
      // If API fails, return empty object to allow fallback to local translations
      if (error?.response?.status === 404 || error?.response?.status === 500) {
        console.warn(`API translations not available for ${locale}, using local fallback`);
        return {};
      }
      
      ApiErrorHandler.handleError(error, {
        customMessage: `Failed to get translations for ${locale}`
      });
      throw error;
    }
  },

  // Get available languages from API
  getAvailableLanguages: async (): Promise<LanguageConfig[]> => {
    try {
      const response = await api.get<ApiResponse<LanguageConfig[]>>('/languages/available');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get available languages');
    } catch (error: any) {
      // If API fails, return default languages
      if (error?.response?.status === 404 || error?.response?.status === 500) {
        console.warn('API languages not available, using default configuration');
        return [
          { code: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr', is_active: true },
          { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl', is_active: true },
          { code: 'es', name: 'Español', flag: '🇪🇸', direction: 'ltr', is_active: true },
        ];
      }
      
      ApiErrorHandler.handleError(error, {
        customMessage: 'Failed to get available languages'
      });
      throw error;
    }
  },

  // Update user language preference
  updateUserLanguagePreference: async (language: string): Promise<void> => {
    try {
      const response = await api.put<ApiResponse>('/user/language-preference', {
        preferred_language: language
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update language preference');
      }
    } catch (error: any) {
      // If user is not authenticated or API fails, just log the error
      if (error?.response?.status === 401 || error?.response?.status === 500) {
        console.warn('Could not save language preference to server, using local storage only');
        return;
      }
      
      ApiErrorHandler.handleError(error, {
        customMessage: 'Failed to update language preference'
      });
      throw error;
    }
  },

  // Admin: Get all translations for management
  getAllTranslations: async (): Promise<Record<string, TranslationGroup>> => {
    try {
      const response = await api.get<ApiResponse<Record<string, TranslationGroup>>>('/admin/translations');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get all translations');
    } catch (error: any) {
      ApiErrorHandler.handleError(error, {
        customMessage: 'Failed to get all translations'
      });
      throw error;
    }
  },

  // Admin: Update translations for a specific locale
  updateTranslations: async (locale: string, translations: TranslationGroup): Promise<void> => {
    try {
      const response = await api.put<ApiResponse>(`/admin/translations/${locale}`, {
        translations
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update translations');
      }
    } catch (error: any) {
      ApiErrorHandler.handleError(error, {
        customMessage: `Failed to update translations for ${locale}`
      });
      throw error;
    }
  },

  // Admin: Add new translation key
  addTranslationKey: async (locale: string, key: string, value: string): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>('/admin/translations/add-key', {
        locale,
        key,
        value
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to add translation key');
      }
    } catch (error: any) {
      ApiErrorHandler.handleError(error, {
        customMessage: 'Failed to add translation key'
      });
      throw error;
    }
  },

  // Admin: Delete translation key
  deleteTranslationKey: async (locale: string, key: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>(`/admin/translations/${locale}/${encodeURIComponent(key)}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete translation key');
      }
    } catch (error: any) {
      ApiErrorHandler.handleError(error, {
        customMessage: 'Failed to delete translation key'
      });
      throw error;
    }
  },

  // Admin: Import translations from file
  importTranslations: async (locale: string, file: File): Promise<{ imported: number; errors: string[] }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('locale', locale);
      
      const response = await api.post<ApiResponse<{ imported: number; errors: string[] }>>(
        '/admin/translations/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to import translations');
    } catch (error: any) {
      ApiErrorHandler.handleError(error, {
        customMessage: 'Failed to import translations'
      });
      throw error;
    }
  },

  // Admin: Export translations to file
  exportTranslations: async (locale: string, format: 'json' | 'csv' = 'json'): Promise<Blob> => {
    try {
      const response = await api.get(`/admin/translations/${locale}/export`, {
        params: { format },
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error: any) {
      ApiErrorHandler.handleError(error, {
        customMessage: `Failed to export translations for ${locale}`
      });
      throw error;
    }
  },

  // Admin: Sync translations with local files
  syncTranslations: async (): Promise<{ synced: number; conflicts: string[] }> => {
    try {
      const response = await api.post<ApiResponse<{ synced: number; conflicts: string[] }>>(
        '/admin/translations/sync'
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to sync translations');
    } catch (error: any) {
      ApiErrorHandler.handleError(error, {
        customMessage: 'Failed to sync translations'
      });
      throw error;
    }
  }
};