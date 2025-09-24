import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Settings,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { SearchFiltersPanel } from '@/components/search/SearchFiltersPanel';
import { SearchResults } from '@/components/search/SearchResults';
import { SavedSearchesPanel } from '@/components/search/SavedSearchesPanel';
import { SearchPagination } from '@/components/search/SearchPagination';
import { SearchExportDialog } from '@/components/search/SearchExportDialog';
import { 
  useSearch, 
  useContentSearch, 
  useSearchPreferences 
} from '@/hooks/useSearch';
import { useAuth } from '@/hooks/useAuth';
import { SearchFilters, SearchResult } from '@/services/searchService';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const AdvancedSearch: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    filters,
    searchResults,
    totalResults,
    suggestions,
    facets,
    isSearching,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    updateFilters,
    clearFilters,
    updatePage,
    resultsPerPage,
    setResultsPerPage
  } = useSearch();

  const { preferences, updatePreferences, isUpdating } = useSearchPreferences();

  // Content-specific searches
  const usersSearch = useContentSearch('users');
  const programsSearch = useContentSearch('programs');
  const quizzesSearch = useContentSearch('quizzes');
  const meetingsSearch = useContentSearch('meetings');

  // Apply user preferences on load
  useEffect(() => {
    if (preferences) {
      updateFilters({
        content_types: preferences.default_content_types,
        sort_by: preferences.default_sort_by,
        sort_order: preferences.default_sort_order
      });
      setResultsPerPage(preferences.results_per_page);
    }
  }, [preferences, updateFilters, setResultsPerPage]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'all') {
      // Use global search
      updateFilters({ content_types: undefined });
    } else {
      // Filter by specific content type
      updateFilters({ content_types: [tab as any] });
    }
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    if (result.url) {
      window.location.href = result.url;
    } else {
      // Generate URL based on result type and ID
      const baseUrls = {
        user: '/admin/users',
        program: '/programs',
        quiz: '/quizzes',
        meeting: '/meetings'
      };
      
      const baseUrl = baseUrls[result.type];
      if (baseUrl) {
        window.location.href = `${baseUrl}/${result.id}`;
      }
    }
  };

  // Handle export results
  const handleExportResults = () => {
    setShowExportDialog(true);
  };

  // Handle preferences update
  const handlePreferencesUpdate = (newPreferences: any) => {
    updatePreferences(newPreferences, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Search preferences updated successfully",
        });
        setShowPreferences(false);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update preferences",
          variant: "destructive",
        });
      }
    });
  };

  const getCurrentResults = () => {
    switch (activeTab) {
      case 'users':
        return {
          results: usersSearch.searchResults.map(user => ({
            type: 'user' as const,
            id: user.id,
            title: user.name,
            subtitle: user.email,
            description: `${user.role} • ${user.preferred_language}`,
            metadata: {
              role: user.role,
              language: user.preferred_language,
              active: user.is_active
            }
          })),
          total: usersSearch.totalResults,
          isLoading: usersSearch.isLoading
        };
      case 'programs':
        return {
          results: programsSearch.searchResults.map(program => ({
            type: 'program' as const,
            id: program.id,
            title: program.name,
            description: program.description,
            metadata: {
              teacher_name: program.teacher?.name,
              language: program.language?.name,
              active: program.is_active
            }
          })),
          total: programsSearch.totalResults,
          isLoading: programsSearch.isLoading
        };
      case 'quizzes':
        return {
          results: quizzesSearch.searchResults.map(quiz => ({
            type: 'quiz' as const,
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            metadata: {
              program_name: quiz.program?.name,
              teacher_name: quiz.teacher?.name,
              questions_count: quiz.questions?.length || 0,
              guest_access: quiz.guest_can_access
            }
          })),
          total: quizzesSearch.totalResults,
          isLoading: quizzesSearch.isLoading
        };
      case 'meetings':
        return {
          results: meetingsSearch.searchResults.map(meeting => ({
            type: 'meeting' as const,
            id: meeting.id,
            title: meeting.title,
            description: meeting.description,
            metadata: {
              program_name: meeting.program?.name,
              teacher_name: meeting.teacher?.name,
              scheduled_at: meeting.scheduled_at,
              duration: meeting.duration
            }
          })),
          total: meetingsSearch.totalResults,
          isLoading: meetingsSearch.isLoading
        };
      default:
        return {
          results: searchResults,
          total: totalResults,
          isLoading: isSearching
        };
    }
  };

  const currentResults = getCurrentResults();
  const hasQuery = Boolean(filters.query);
  const hasFilters = Object.keys(filters).some(
    key => key !== 'query' && filters[key as keyof SearchFilters]
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Advanced Search</h1>
            <p className="text-muted-foreground">
              Search across users, programs, quizzes, and meetings
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Export Results */}
            {currentResults.results.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportResults}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
            
            {/* Search Preferences */}
            <Sheet open={showPreferences} onOpenChange={setShowPreferences}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Preferences
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Search Preferences</SheetTitle>
                  <SheetDescription>
                    Customize your default search settings
                  </SheetDescription>
                </SheetHeader>
                
                {preferences && (
                  <div className="mt-6 space-y-6">
                    {/* Default Content Types */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Default Content Types</label>
                      <div className="space-y-2">
                        {['users', 'programs', 'quizzes', 'meetings'].map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`pref-${type}`}
                              checked={preferences.default_content_types.includes(type as any)}
                              onChange={(e) => {
                                const newTypes = e.target.checked
                                  ? [...preferences.default_content_types, type]
                                  : preferences.default_content_types.filter(t => t !== type);
                                handlePreferencesUpdate({
                                  ...preferences,
                                  default_content_types: newTypes
                                });
                              }}
                              className="rounded"
                            />
                            <label htmlFor={`pref-${type}`} className="text-sm capitalize">
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Results Per Page */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Results Per Page</label>
                      <Select
                        value={preferences.results_per_page.toString()}
                        onValueChange={(value) => 
                          handlePreferencesUpdate({
                            ...preferences,
                            results_per_page: parseInt(value)
                          })
                        }
                      >
                        <SelectTrigger>
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
                    
                    {/* Auto-complete */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto-complete"
                        checked={preferences.enable_auto_complete}
                        onChange={(e) => 
                          handlePreferencesUpdate({
                            ...preferences,
                            enable_auto_complete: e.target.checked
                          })
                        }
                        className="rounded"
                      />
                      <label htmlFor="auto-complete" className="text-sm">
                        Enable auto-complete suggestions
                      </label>
                    </div>
                    
                    {/* Search History */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="search-history"
                        checked={preferences.enable_search_history}
                        onChange={(e) => 
                          handlePreferencesUpdate({
                            ...preferences,
                            enable_search_history: e.target.checked
                          })
                        }
                        className="rounded"
                      />
                      <label htmlFor="search-history" className="text-sm">
                        Save search history
                      </label>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="flex-1">
            <GlobalSearch
              placeholder="Search users, programs, quizzes, meetings..."
              showFilters={false}
              onResultSelect={handleResultSelect}
            />
          </div>
          
          {/* Filters Toggle */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex items-center gap-2",
                  hasFilters && "border-primary text-primary"
                )}
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasFilters && (
                  <Badge variant="secondary" className="ml-1">
                    {Object.keys(filters).filter(
                      key => filters[key as keyof SearchFilters]
                    ).length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
                <SheetDescription>
                  Refine your search with advanced filters
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <SearchFiltersPanel
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Results</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-7 w-7 p-0"
              >
                <List className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-7 w-7 p-0"
              >
                <Grid className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Results Per Page */}
            <Select
              value={resultsPerPage.toString()}
              onValueChange={(value) => setResultsPerPage(parseInt(value))}
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
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          {/* Results Summary */}
          {(hasQuery || hasFilters) && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {currentResults.total > 0 ? (
                  <>
                    Showing {((currentPage - 1) * resultsPerPage) + 1} to{' '}
                    {Math.min(currentPage * resultsPerPage, currentResults.total)} of{' '}
                    {currentResults.total} results
                    {hasQuery && (
                      <> for <span className="font-medium">"{filters.query}"</span></>
                    )}
                  </>
                ) : (
                  'No results found'
                )}
              </div>
              
              {hasFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Results Content */}
          <TabsContent value={activeTab} className="mt-0">
            {viewMode === 'list' ? (
              <SearchResults
                results={currentResults.results}
                totalResults={currentResults.total}
                isLoading={currentResults.isLoading}
                query={filters.query}
                onResultSelect={handleResultSelect}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentResults.results.map((result, index) => (
                  <Card
                    key={`${result.type}-${result.id}-${index}`}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleResultSelect(result)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {result.type}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm line-clamp-2">
                        {result.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {result.description && (
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                          {result.description}
                        </p>
                      )}
                      {result.subtitle && (
                        <p className="text-xs text-muted-foreground">
                          {result.subtitle}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pagination */}
          {totalPages > 1 && (
            <SearchPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={currentResults.total}
              resultsPerPage={resultsPerPage}
              onPageChange={updatePage}
              onResultsPerPageChange={setResultsPerPage}
              showResultsPerPage={true}
              showResultsInfo={false} // Already shown above
            />
          )}
        </div>
      </Tabs>

      {/* Search Facets */}
      {facets && (hasQuery || hasFilters) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Refine Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Content Types Facet */}
            {facets.content_types && facets.content_types.length > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-2">Content Types</h4>
                <div className="flex flex-wrap gap-1">
                  {facets.content_types.map((facet) => (
                    <Badge
                      key={facet.type}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-muted"
                      onClick={() => updateFilters({ content_types: [facet.type as any] })}
                    >
                      {facet.type} ({facet.count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Languages Facet */}
            {facets.languages && facets.languages.length > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-2">Languages</h4>
                <div className="flex flex-wrap gap-1">
                  {facets.languages.map((facet) => (
                    <Badge
                      key={facet.id}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-muted"
                      onClick={() => updateFilters({ language_id: facet.id })}
                    >
                      {facet.name} ({facet.count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Export Dialog */}
      <SearchExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        searchResults={currentResults.results}
        searchFilters={filters}
        totalResults={currentResults.total}
      />
    </div>
  );
};