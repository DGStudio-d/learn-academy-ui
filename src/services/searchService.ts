import api from '../lib/api';
import type { 
  ApiResponse, 
  PaginatedResponse,
  User,
  Program,
  Quiz,
  Meeting,
  ApiErrorResponse
} from '../types/api';
import { ApiErrorHandler } from '../lib/errorHandler';

// Search types
export interface SearchFilters {
  query?: string;
  content_types?: ('users' | 'programs' | 'quizzes' | 'meetings')[];
  role?: 'admin' | 'teacher' | 'student';
  language_id?: number;
  program_id?: number;
  teacher_id?: number;
  date_from?: string;
  date_to?: string;
  is_active?: boolean;
  guest_access?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SearchResult {
  type: 'user' | 'program' | 'quiz' | 'meeting';
  id: number;
  title: string;
  description?: string;
  subtitle?: string;
  metadata?: Record<string, any>;
  highlighted_fields?: Record<string, string>;
  relevance_score?: number;
  url?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total_results: number;
  search_time: number;
  suggestions?: string[];
  filters_applied: SearchFilters;
  facets?: {
    content_types: Array<{ type: string; count: number }>;
    languages: Array<{ id: number; name: string; count: number }>;
    programs: Array<{ id: number; name: string; count: number }>;
    teachers: Array<{ id: number; name: string; count: number }>;
  };
}

export interface SavedSearch {
  id: number;
  name: string;
  filters: SearchFilters;
  created_at: string;
  updated_at: string;
}

export interface RecentSearch {
  id: number;
  query: string;
  filters: SearchFilters;
  results_count: number;
  searched_at: string;
}

export interface SearchPreferences {
  default_content_types: ('users' | 'programs' | 'quizzes' | 'meetings')[];
  default_sort_by: string;
  default_sort_order: 'asc' | 'desc';
  results_per_page: number;
  enable_auto_complete: boolean;
  enable_search_history: boolean;
  max_recent_searches: number;
}

export const searchService = {
  // Global search across all content types
  globalSearch: async (
    filters: SearchFilters,
    page = 1,
    per_page = 20
  ): Promise<PaginatedResponse<SearchResult>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString()
      });

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await api.get<PaginatedResponse<SearchResult>>(`/search/global?${params}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to perform global search');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to perform global search'
      });
      throw error;
    }
  },

  // Search users with advanced filters
  searchUsers: async (
    filters: {
      query?: string;
      role?: 'admin' | 'teacher' | 'student';
      language_id?: number;
      is_active?: boolean;
      date_from?: string;
      date_to?: string;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    },
    page = 1,
    per_page = 20
  ): Promise<PaginatedResponse<User>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString()
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<PaginatedResponse<User>>(`/search/users?${params}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to search users');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to search users'
      });
      throw error;
    }
  },

  // Search programs with advanced filters
  searchPrograms: async (
    filters: {
      query?: string;
      language_id?: number;
      teacher_id?: number;
      is_active?: boolean;
      date_from?: string;
      date_to?: string;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    },
    page = 1,
    per_page = 20
  ): Promise<PaginatedResponse<Program>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString()
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<PaginatedResponse<Program>>(`/search/programs?${params}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to search programs');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to search programs'
      });
      throw error;
    }
  },

  // Search quizzes with advanced filters
  searchQuizzes: async (
    filters: {
      query?: string;
      program_id?: number;
      language_id?: number;
      teacher_id?: number;
      is_active?: boolean;
      guest_access?: boolean;
      date_from?: string;
      date_to?: string;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    },
    page = 1,
    per_page = 20
  ): Promise<PaginatedResponse<Quiz>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString()
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<PaginatedResponse<Quiz>>(`/search/quizzes?${params}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to search quizzes');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to search quizzes'
      });
      throw error;
    }
  },

  // Search meetings with advanced filters
  searchMeetings: async (
    filters: {
      query?: string;
      program_id?: number;
      teacher_id?: number;
      is_active?: boolean;
      date_from?: string;
      date_to?: string;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    },
    page = 1,
    per_page = 20
  ): Promise<PaginatedResponse<Meeting>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString()
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<PaginatedResponse<Meeting>>(`/search/meetings?${params}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to search meetings');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to search meetings'
      });
      throw error;
    }
  },

  // Get search suggestions/autocomplete
  getSearchSuggestions: async (
    query: string,
    content_types?: ('users' | 'programs' | 'quizzes' | 'meetings')[]
  ): Promise<string[]> => {
    try {
      const params = new URLSearchParams({ query });
      
      if (content_types && content_types.length > 0) {
        content_types.forEach(type => params.append('content_types[]', type));
      }

      const response = await api.get<ApiResponse<string[]>>(`/search/suggestions?${params}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      // Don't throw error for suggestions, just return empty array
      console.warn('Failed to get search suggestions:', error);
      return [];
    }
  },

  // Get search facets for filtering
  getSearchFacets: async (
    query?: string,
    content_types?: ('users' | 'programs' | 'quizzes' | 'meetings')[]
  ): Promise<{
    content_types: Array<{ type: string; count: number }>;
    languages: Array<{ id: number; name: string; count: number }>;
    programs: Array<{ id: number; name: string; count: number }>;
    teachers: Array<{ id: number; name: string; count: number }>;
  }> => {
    try {
      const params = new URLSearchParams();
      
      if (query) params.append('query', query);
      if (content_types && content_types.length > 0) {
        content_types.forEach(type => params.append('content_types[]', type));
      }

      const response = await api.get<ApiResponse<{
        content_types: Array<{ type: string; count: number }>;
        languages: Array<{ id: number; name: string; count: number }>;
        programs: Array<{ id: number; name: string; count: number }>;
        teachers: Array<{ id: number; name: string; count: number }>;
      }>>(`/search/facets?${params}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to get search facets');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get search facets'
      });
      throw error;
    }
  },

  // Saved searches management
  getSavedSearches: async (): Promise<SavedSearch[]> => {
    try {
      const response = await api.get<ApiResponse<SavedSearch[]>>('/search/saved');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to get saved searches');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get saved searches'
      });
      throw error;
    }
  },

  saveSearch: async (name: string, filters: SearchFilters): Promise<SavedSearch> => {
    try {
      const response = await api.post<ApiResponse<SavedSearch>>('/search/saved', {
        name,
        filters
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to save search');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to save search'
      });
      throw error;
    }
  },

  updateSavedSearch: async (searchId: number, name: string, filters: SearchFilters): Promise<SavedSearch> => {
    try {
      const response = await api.put<ApiResponse<SavedSearch>>(`/search/saved/${searchId}`, {
        name,
        filters
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to update saved search');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to update saved search'
      });
      throw error;
    }
  },

  deleteSavedSearch: async (searchId: number): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>(`/search/saved/${searchId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete saved search');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to delete saved search'
      });
      throw error;
    }
  },

  // Recent searches management
  getRecentSearches: async (limit = 10): Promise<RecentSearch[]> => {
    try {
      const response = await api.get<ApiResponse<RecentSearch[]>>(`/search/recent?limit=${limit}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to get recent searches');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get recent searches'
      });
      throw error;
    }
  },

  addRecentSearch: async (query: string, filters: SearchFilters, resultsCount: number): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>('/search/recent', {
        query,
        filters,
        results_count: resultsCount
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to add recent search');
      }
    } catch (error) {
      // Don't throw error for recent searches, just log
      console.warn('Failed to add recent search:', error);
    }
  },

  clearRecentSearches: async (): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>('/search/recent');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to clear recent searches');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to clear recent searches'
      });
      throw error;
    }
  },

  // Search preferences management
  getSearchPreferences: async (): Promise<SearchPreferences> => {
    try {
      const response = await api.get<ApiResponse<SearchPreferences>>('/search/preferences');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      // Return default preferences if none exist
      return {
        default_content_types: ['users', 'programs', 'quizzes', 'meetings'],
        default_sort_by: 'relevance',
        default_sort_order: 'desc',
        results_per_page: 20,
        enable_auto_complete: true,
        enable_search_history: true,
        max_recent_searches: 10
      };
    } catch (error) {
      // Return default preferences on error
      return {
        default_content_types: ['users', 'programs', 'quizzes', 'meetings'],
        default_sort_by: 'relevance',
        default_sort_order: 'desc',
        results_per_page: 20,
        enable_auto_complete: true,
        enable_search_history: true,
        max_recent_searches: 10
      };
    }
  },

  updateSearchPreferences: async (preferences: Partial<SearchPreferences>): Promise<SearchPreferences> => {
    try {
      const response = await api.put<ApiResponse<SearchPreferences>>('/search/preferences', preferences);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to update search preferences');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to update search preferences'
      });
      throw error;
    }
  },
};