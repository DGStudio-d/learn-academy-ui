import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Clock, Bookmark, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useSearch, useRecentSearches, useSavedSearches } from '@/hooks/useSearch';
import { SearchFilters } from '@/services/searchService';
import { SearchResults } from './SearchResults';
import { SearchFiltersPanel } from './SearchFiltersPanel';
import { SavedSearchesPanel } from './SavedSearchesPanel';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  showFilters?: boolean;
  showSavedSearches?: boolean;
  onResultSelect?: (result: any) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className,
  placeholder = "Search users, programs, quizzes, meetings...",
  showFilters = true,
  showSavedSearches = true,
  onResultSelect
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    filters,
    searchResults,
    totalResults,
    suggestions,
    isSearching,
    isLoadingSuggestions,
    updateFilters,
    clearFilters,
    performSearch
  } = useSearch();

  const { recentSearches } = useRecentSearches();
  const { savedSearches } = useSavedSearches();

  // Handle input focus
  const handleInputFocus = () => {
    setIsExpanded(true);
    setShowSuggestions(true);
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't close if clicking within the search container
    if (searchRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    
    setTimeout(() => {
      setShowSuggestions(false);
      if (!filters.query && searchResults.length === 0) {
        setIsExpanded(false);
      }
    }, 150);
  };

  // Handle query change
  const handleQueryChange = (query: string) => {
    updateFilters({ query });
    setShowSuggestions(query.length >= 2);
  };

  // Handle suggestion select
  const handleSuggestionSelect = (suggestion: string) => {
    updateFilters({ query: suggestion });
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle recent search select
  const handleRecentSearchSelect = (recentSearch: any) => {
    updateFilters(recentSearch.filters);
    setShowSuggestions(false);
  };

  // Handle saved search select
  const handleSavedSearchSelect = (savedSearch: any) => {
    updateFilters(savedSearch.filters);
    setShowSuggestions(false);
  };

  // Clear search
  const handleClearSearch = () => {
    clearFilters();
    setIsExpanded(false);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        if (!filters.query && searchResults.length === 0) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filters.query, searchResults.length]);

  const hasActiveFilters = Object.keys(filters).some(
    key => key !== 'query' && filters[key as keyof SearchFilters]
  );

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'query' && value !== undefined && value !== null && value !== ''
  ).length;

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-2xl", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={filters.query || ''}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "pl-10 pr-20",
            isExpanded && "rounded-b-none border-b-0"
          )}
        />
        
        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {filters.query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          {showFilters && (
            <Popover open={showFiltersPanel} onOpenChange={setShowFiltersPanel}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 p-0",
                    hasActiveFilters && "text-primary"
                  )}
                >
                  <Filter className="h-3 w-3" />
                  {activeFiltersCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <SearchFiltersPanel
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onClose={() => setShowFiltersPanel(false)}
                />
              </PopoverContent>
            </Popover>
          )}
          
          {showSavedSearches && (
            <Popover open={showSavedPanel} onOpenChange={setShowSavedPanel}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <Bookmark className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <SavedSearchesPanel
                  currentFilters={filters}
                  onSearchSelect={handleSavedSearchSelect}
                  onClose={() => setShowSavedPanel(false)}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && isExpanded && (
        <Card className="absolute top-full left-0 right-0 z-50 rounded-t-none border-t-0">
          <CardContent className="p-0">
            <Command>
              <CommandList>
                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                  <CommandGroup heading="Suggestions">
                    {suggestions.map((suggestion, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleSuggestionSelect(suggestion)}
                        className="cursor-pointer"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        {suggestion}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <>
                    {suggestions.length > 0 && <Separator />}
                    <CommandGroup heading="Recent Searches">
                      {recentSearches.slice(0, 5).map((recent) => (
                        <CommandItem
                          key={recent.id}
                          onSelect={() => handleRecentSearchSelect(recent)}
                          className="cursor-pointer"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          <div className="flex-1">
                            <div className="font-medium">{recent.query}</div>
                            <div className="text-xs text-muted-foreground">
                              {recent.results_count} results
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}

                {/* Saved Searches */}
                {savedSearches.length > 0 && (
                  <>
                    {(suggestions.length > 0 || recentSearches.length > 0) && <Separator />}
                    <CommandGroup heading="Saved Searches">
                      {savedSearches.slice(0, 3).map((saved) => (
                        <CommandItem
                          key={saved.id}
                          onSelect={() => handleSavedSearchSelect(saved)}
                          className="cursor-pointer"
                        >
                          <Bookmark className="mr-2 h-4 w-4" />
                          {saved.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}

                {/* Empty State */}
                {suggestions.length === 0 && recentSearches.length === 0 && savedSearches.length === 0 && (
                  <CommandEmpty>
                    {isLoadingSuggestions ? "Loading suggestions..." : "No suggestions found"}
                  </CommandEmpty>
                )}
              </CommandList>
            </Command>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {isExpanded && (filters.query || hasActiveFilters) && !showSuggestions && (
        <Card className="absolute top-full left-0 right-0 z-40 rounded-t-none border-t-0 max-h-96">
          <CardContent className="p-0">
            <ScrollArea className="h-full">
              <SearchResults
                results={searchResults}
                totalResults={totalResults}
                isLoading={isSearching}
                query={filters.query}
                onResultSelect={onResultSelect}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(filters).map(([key, value]) => {
            if (key === 'query' || !value) return null;
            
            return (
              <Badge
                key={key}
                variant="secondary"
                className="text-xs"
              >
                {key.replace('_', ' ')}: {Array.isArray(value) ? value.join(', ') : String(value)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilters({ [key]: undefined })}
                  className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};