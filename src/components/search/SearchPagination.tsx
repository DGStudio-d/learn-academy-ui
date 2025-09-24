import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
  onResultsPerPageChange: (perPage: number) => void;
  className?: string;
  showResultsPerPage?: boolean;
  showResultsInfo?: boolean;
  maxVisiblePages?: number;
}

export const SearchPagination: React.FC<SearchPaginationProps> = ({
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  onPageChange,
  onResultsPerPageChange,
  className,
  showResultsPerPage = true,
  showResultsInfo = true,
  maxVisiblePages = 7
}) => {
  // Calculate visible page range
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    
    // Add first page if not in range
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('ellipsis-start');
      }
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add last page if not in range
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-center justify-between gap-4 py-4",
      className
    )}>
      {/* Results Info */}
      {showResultsInfo && (
        <div className="text-sm text-muted-foreground">
          Showing {startResult.toLocaleString()} to {endResult.toLocaleString()} of{' '}
          {totalResults.toLocaleString()} results
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Results Per Page */}
        {showResultsPerPage && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select
              value={resultsPerPage.toString()}
              onValueChange={(value) => onResultsPerPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (typeof page === 'string') {
              return (
                <Button
                  key={page}
                  variant="ghost"
                  size="sm"
                  disabled
                  className="w-10 h-10 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              );
            }

            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="w-10 h-10 p-0"
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Page Info */}
      <div className="sm:hidden text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

// Compact pagination for smaller spaces
interface CompactPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const CompactPagination: React.FC<CompactPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className
}) => {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-sm text-muted-foreground px-2">
        {currentPage} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Infinite scroll pagination indicator
interface InfiniteScrollPaginationProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
}

export const InfiniteScrollPagination: React.FC<InfiniteScrollPaginationProps> = ({
  hasMore,
  isLoading,
  onLoadMore,
  className
}) => {
  if (!hasMore && !isLoading) {
    return null;
  }

  return (
    <div className={cn("flex justify-center py-4", className)}>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          Loading more results...
        </div>
      ) : hasMore ? (
        <Button
          variant="outline"
          onClick={onLoadMore}
          className="flex items-center gap-2"
        >
          Load More Results
        </Button>
      ) : (
        <div className="text-sm text-muted-foreground">
          No more results to load
        </div>
      )}
    </div>
  );
};