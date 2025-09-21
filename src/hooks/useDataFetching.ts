import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { useAppState } from '../contexts/AppStateContext';

// Pagination hook with search and filters
export function usePaginatedData<T>({
  queryKey,
  queryFn,
  pageSize = 10,
  searchQuery = '',
  filters = {},
  enabled = true,
}: {
  queryKey: string[];
  queryFn: (params: { page: number; pageSize: number; search: string; filters: Record<string, any> }) => Promise<any>;
  pageSize?: number;
  searchQuery?: string;
  filters?: Record<string, any>;
  enabled?: boolean;
}) {
  const [page, setPage] = useState(1);
  const { setCache } = useAppState();

  const query = useQuery({
    queryKey: [...queryKey, page, pageSize, searchQuery, filters],
    queryFn: () => queryFn({ page, pageSize, search: searchQuery, filters }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (prev) => prev, // React Query v5 replacement for keepPreviousData
  });

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    const currentPage = (query.data as any)?.data?.current_page;
    const lastPage = (query.data as any)?.data?.last_page;
    if (currentPage < lastPage) {
      setPage(prev => prev + 1);
    }
  }, [query.data]);

  const previousPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const refetch = useCallback(() => {
    return query.refetch();
  }, [query]);

  return {
    ...query,
    page,
    pageSize,
    totalPages: (query.data as any)?.data?.last_page || 0,
    totalItems: (query.data as any)?.data?.total || 0,
    hasNextPage: (query.data as any)?.data?.current_page < (query.data as any)?.data?.last_page,
    hasPreviousPage: page > 1,
    goToPage,
    nextPage,
    previousPage,
    refetch,
  };
}

// Infinite scroll hook
export function useInfiniteData<T>({
  queryKey,
  queryFn,
  pageSize = 10,
  enabled = true,
}: {
  queryKey: string[];
  queryFn: (params: { pageParam: number; pageSize: number }) => Promise<any>;
  pageSize?: number;
  enabled?: boolean;
}) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }: { pageParam: number }) => queryFn({ pageParam, pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      const currentPage = lastPage.data?.current_page || 1;
      const lastPageNum = lastPage.data?.last_page || 1;
      return currentPage < lastPageNum ? currentPage + 1 : undefined;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const allData = useMemo(() => {
    return query.data?.pages.flatMap(page => page.data?.data || []) || [];
  }, [query.data]);

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  return {
    ...query,
    data: allData,
    loadMore,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
}

// Search hook with debouncing
export function useSearch<T>({
  queryKey,
  queryFn,
  debounceMs = 300,
  minSearchLength = 2,
}: {
  queryKey: string[];
  queryFn: (searchQuery: string) => Promise<T[]>;
  debounceMs?: number;
  minSearchLength?: number;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  const debounceTimeout = useMemo(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);
    return timeout;
  }, [searchQuery, debounceMs]);

  // Clear timeout on cleanup
  useMemo(() => {
    return () => clearTimeout(debounceTimeout);
  }, [debounceTimeout]);

  const query = useQuery({
    queryKey: [...queryKey, debouncedQuery],
    queryFn: () => queryFn(debouncedQuery),
    enabled: debouncedQuery.length >= minSearchLength,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    ...query,
    searchQuery,
    setSearchQuery,
    clearSearch,
    isSearching: searchQuery !== debouncedQuery,
  };
}

// Optimistic updates hook
export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  optimisticUpdate,
  onSuccess,
  onError,
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: string[];
  optimisticUpdate?: (oldData: any, variables: TVariables) => any;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: any, variables: TVariables, context: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      if (optimisticUpdate) {
        queryClient.setQueryData(queryKey, (old: any) => 
          optimisticUpdate(old, variables)
        );
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      onError?.(error, variables, context);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey });
      onSuccess?.(data, variables);
    },
  });
}

// Cache management hook
export function useCacheManager() {
  const queryClient = useQueryClient();
  const { clearCache } = useAppState();

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries();
    clearCache();
  }, [queryClient, clearCache]);

  const invalidateByPattern = useCallback((pattern: string[]) => {
    queryClient.invalidateQueries({ queryKey: pattern });
  }, [queryClient]);

  const prefetchData = useCallback((queryKey: string[], queryFn: () => Promise<any>) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  const getCachedData = useCallback((queryKey: string[]) => {
    return queryClient.getQueryData(queryKey);
  }, [queryClient]);

  const setCachedData = useCallback((queryKey: string[], data: any) => {
    queryClient.setQueryData(queryKey, data);
  }, [queryClient]);

  const removeFromCache = useCallback((queryKey: string[]) => {
    queryClient.removeQueries({ queryKey });
  }, [queryClient]);

  return {
    invalidateAll,
    invalidateByPattern,
    prefetchData,
    getCachedData,
    setCachedData,
    removeFromCache,
  };
}

// Background sync hook for offline support
export function useBackgroundSync() {
  const queryClient = useQueryClient();
  const { state } = useAppState();

  const syncWhenOnline = useCallback(() => {
    if (state.network.isOnline) {
      // Refetch all queries when coming back online
      queryClient.refetchQueries({
        type: 'active',
        stale: true,
      });
    }
  }, [queryClient, state.network.isOnline]);

  // Auto-sync when network status changes
  useMemo(() => {
    if (state.network.isOnline) {
      syncWhenOnline();
    }
  }, [state.network.isOnline, syncWhenOnline]);

  return {
    syncWhenOnline,
    isOnline: state.network.isOnline,
    isSlowConnection: state.network.isSlowConnection,
  };
}

// Prefetch hook for performance
export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchOnHover = useCallback((queryKey: string[], queryFn: () => Promise<any>) => {
    return () => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000,
      });
    };
  }, [queryClient]);

  const prefetchOnFocus = useCallback((queryKey: string[], queryFn: () => Promise<any>) => {
    return () => {
      if (document.hasFocus()) {
        queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: 5 * 60 * 1000,
        });
      }
    };
  }, [queryClient]);

  return {
    prefetchOnHover,
    prefetchOnFocus,
  };
}