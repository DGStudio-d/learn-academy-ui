import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import { 
  searchService, 
  SearchFilters, 
  SearchResult, 
  SavedSearch, 
  RecentSearch, 
  SearchPreferences 
} from '../services/searchService';
import type { User, Program, Quiz, Meeting, PaginatedResponse } from '../types/api';

// Custom hook for debounced values
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Main search hook
export const useSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  
  const debouncedQuery = useDebounce(filters.query || '', 300);
  const queryClient = useQueryClient();

  // Global search query
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch
  } = useQuery({
    queryKey: ['search', 'global', { ...filters, query: debouncedQuery }, currentPage, resultsPerPage],
    queryFn: () => searchService.globalSearch(
      { ...filters, query: debouncedQuery },
      currentPage,
      resultsPerPage
    ),
    enabled: Boolean(debouncedQuery || Object.keys(filters).some(key => key !== 'query' && filters[key as keyof SearchFilters])),
    staleTime: 30000, // 30 seconds
  });

  // Search suggestions query
  const {
    data: suggestions,
    isLoading: isLoadingSuggestions
  } = useQuery({
    queryKey: ['search', 'suggestions', debouncedQuery, filters.content_types],
    queryFn: () => searchService.getSearchSuggestions(debouncedQuery, filters.content_types),
    enabled: Boolean(debouncedQuery && debouncedQuery.length >= 2),
    staleTime: 60000, // 1 minute
  });

  // Search facets query
  const {
    data: facets,
    isLoading: isLoadingFacets
  } = useQuery({
    queryKey: ['search', 'facets', debouncedQuery, filters.content_types],
    queryFn: () => searchService.getSearchFacets(debouncedQuery, filters.content_types),
    enabled: Boolean(debouncedQuery),
    staleTime: 300000, // 5 minutes
  });

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  // Update page
  const updatePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Perform search with current filters
  const performSearch = useCallback(() => {
    refetchSearch();
    
    // Add to recent searches if query exists
    if (debouncedQuery && searchResults?.data?.length) {
      searchService.addRecentSearch(
        debouncedQuery,
        filters,
        searchResults.data.length
      ).catch(console.warn);
    }
  }, [debouncedQuery, filters, searchResults, refetchSearch]);

  return {
    // State
    filters,
    currentPage,
    resultsPerPage,
    
    // Data
    searchResults: searchResults?.data || [],
    totalResults: searchResults?.total || 0,
    suggestions: suggestions || [],
    facets,
    
    // Loading states
    isSearching,
    isLoadingSuggestions,
    isLoadingFacets,
    
    // Error
    searchError,
    
    // Actions
    updateFilters,
    clearFilters,
    updatePage,
    setResultsPerPage,
    performSearch,
    
    // Pagination info
    hasNextPage: searchResults ? currentPage < searchResults.last_page : false,
    hasPreviousPage: currentPage > 1,
    totalPages: searchResults?.last_page || 0,
  };
};

// Hook for searching specific content types
export const useContentSearch = <T extends User | Program | Quiz | Meeting>(
  contentType: 'users' | 'programs' | 'quizzes' | 'meetings'
) => {
  const [filters, setFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  
  const debouncedQuery = useDebounce(filters.query || '', 300);

  const searchFunction = {
    users: searchService.searchUsers,
    programs: searchService.searchPrograms,
    quizzes: searchService.searchQuizzes,
    meetings: searchService.searchMeetings,
  }[contentType];

  const {
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['search', contentType, { ...filters, query: debouncedQuery }, currentPage, resultsPerPage],
    queryFn: () => searchFunction(
      { ...filters, query: debouncedQuery },
      currentPage,
      resultsPerPage
    ) as Promise<PaginatedResponse<T>>,
    enabled: Boolean(debouncedQuery || Object.keys(filters).some(key => key !== 'query' && filters[key])),
    staleTime: 30000,
  });

  const updateFilters = useCallback((newFilters: any) => {
    setFilters((prev: any) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  return {
    filters,
    currentPage,
    resultsPerPage,
    searchResults: searchResults?.data || [],
    totalResults: searchResults?.total || 0,
    isLoading,
    error,
    updateFilters,
    clearFilters,
    updatePage: setCurrentPage,
    setResultsPerPage,
    refetch,
    hasNextPage: searchResults ? currentPage < searchResults.last_page : false,
    hasPreviousPage: currentPage > 1,
    totalPages: searchResults?.last_page || 0,
  };
};

// Hook for saved searches
export const useSavedSearches = () => {
  const queryClient = useQueryClient();

  const {
    data: savedSearches,
    isLoading,
    error
  } = useQuery({
    queryKey: ['search', 'saved'],
    queryFn: searchService.getSavedSearches,
    staleTime: 300000, // 5 minutes
  });

  const saveSearchMutation = useMutation({
    mutationFn: ({ name, filters }: { name: string; filters: SearchFilters }) =>
      searchService.saveSearch(name, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'saved'] });
    },
  });

  const updateSearchMutation = useMutation({
    mutationFn: ({ searchId, name, filters }: { searchId: number; name: string; filters: SearchFilters }) =>
      searchService.updateSavedSearch(searchId, name, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'saved'] });
    },
  });

  const deleteSearchMutation = useMutation({
    mutationFn: (searchId: number) => searchService.deleteSavedSearch(searchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'saved'] });
    },
  });

  return {
    savedSearches: savedSearches || [],
    isLoading,
    error,
    saveSearch: saveSearchMutation.mutate,
    updateSearch: updateSearchMutation.mutate,
    deleteSearch: deleteSearchMutation.mutate,
    isSaving: saveSearchMutation.isPending,
    isUpdating: updateSearchMutation.isPending,
    isDeleting: deleteSearchMutation.isPending,
  };
};

// Hook for recent searches
export const useRecentSearches = () => {
  const queryClient = useQueryClient();

  const {
    data: recentSearches,
    isLoading,
    error
  } = useQuery({
    queryKey: ['search', 'recent'],
    queryFn: () => searchService.getRecentSearches(10),
    staleTime: 60000, // 1 minute
  });

  const clearRecentMutation = useMutation({
    mutationFn: searchService.clearRecentSearches,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'recent'] });
    },
  });

  return {
    recentSearches: recentSearches || [],
    isLoading,
    error,
    clearRecent: clearRecentMutation.mutate,
    isClearing: clearRecentMutation.isPending,
  };
};

// Hook for search preferences
export const useSearchPreferences = () => {
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading,
    error
  } = useQuery({
    queryKey: ['search', 'preferences'],
    queryFn: searchService.getSearchPreferences,
    staleTime: 600000, // 10 minutes
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (newPreferences: Partial<SearchPreferences>) =>
      searchService.updateSearchPreferences(newPreferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'preferences'] });
    },
  });

  return {
    preferences,
    isLoading,
    error,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
  };
};

// Hook for search highlighting
export const useSearchHighlight = () => {
  const highlightText = useCallback((text: string, query: string): string => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  }, []);

  const highlightMultipleTerms = useCallback((text: string, terms: string[]): string => {
    if (!terms.length || !text) return text;
    
    let highlightedText = text;
    terms.forEach(term => {
      if (term.trim()) {
        const regex = new RegExp(`(${term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
      }
    });
    
    return highlightedText;
  }, []);

  return {
    highlightText,
    highlightMultipleTerms,
  };
};