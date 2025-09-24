import React from 'react';
import { 
  User, 
  BookOpen, 
  FileQuestion, 
  Video, 
  ExternalLink,
  Clock,
  Users,
  Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchHighlight, ContextualHighlight } from './SearchHighlight';
import { SearchResult } from '@/services/searchService';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  results: SearchResult[];
  totalResults: number;
  isLoading: boolean;
  query?: string;
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  totalResults,
  isLoading,
  query,
  onResultSelect,
  className
}) => {

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'program':
        return <BookOpen className="h-4 w-4" />;
      case 'quiz':
        return <FileQuestion className="h-4 w-4" />;
      case 'meeting':
        return <Video className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getResultTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'program':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'quiz':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'meeting':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatResultMetadata = (result: SearchResult) => {
    const metadata = result.metadata || {};
    const items = [];

    switch (result.type) {
      case 'user':
        if (metadata.role) {
          items.push(
            <Badge key="role" variant="outline" className="text-xs">
              {metadata.role}
            </Badge>
          );
        }
        if (metadata.language) {
          items.push(
            <span key="language" className="text-xs text-muted-foreground">
              {metadata.language}
            </span>
          );
        }
        break;
      
      case 'program':
        if (metadata.teacher_name) {
          items.push(
            <span key="teacher" className="text-xs text-muted-foreground flex items-center">
              <User className="h-3 w-3 mr-1" />
              {metadata.teacher_name}
            </span>
          );
        }
        if (metadata.students_count !== undefined) {
          items.push(
            <span key="students" className="text-xs text-muted-foreground flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {metadata.students_count} students
            </span>
          );
        }
        break;
      
      case 'quiz':
        if (metadata.program_name) {
          items.push(
            <span key="program" className="text-xs text-muted-foreground">
              {metadata.program_name}
            </span>
          );
        }
        if (metadata.questions_count !== undefined) {
          items.push(
            <span key="questions" className="text-xs text-muted-foreground">
              {metadata.questions_count} questions
            </span>
          );
        }
        if (metadata.average_score !== undefined) {
          items.push(
            <span key="score" className="text-xs text-muted-foreground flex items-center">
              <Star className="h-3 w-3 mr-1" />
              {metadata.average_score}% avg
            </span>
          );
        }
        break;
      
      case 'meeting':
        if (metadata.scheduled_at) {
          items.push(
            <span key="date" className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(metadata.scheduled_at).toLocaleDateString()}
            </span>
          );
        }
        if (metadata.program_name) {
          items.push(
            <span key="program" className="text-xs text-muted-foreground">
              {metadata.program_name}
            </span>
          );
        }
        break;
    }

    return items;
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else if (result.url) {
      window.location.href = result.url;
    }
  };

  if (isLoading) {
    return (
      <div className={cn("p-4 space-y-3", className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={cn("p-8 text-center", className)}>
        <div className="text-muted-foreground">
          {query ? (
            <>
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm mt-1">
                Try adjusting your search terms or filters
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">Start searching</p>
              <p className="text-sm mt-1">
                Enter a search term to find users, programs, quizzes, and meetings
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4", className)}>
      {/* Results Header */}
      <div className="mb-4 text-sm text-muted-foreground">
        {totalResults > 0 && (
          <p>
            Showing {results.length} of {totalResults} results
            {query && (
              <> for <span className="font-medium">"{query}"</span></>
            )}
          </p>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.map((result, index) => {
          const metadata = formatResultMetadata(result);
          
          return (
            <Card
              key={`${result.type}-${result.id}-${index}`}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => handleResultClick(result)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Result Icon */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    getResultTypeColor(result.type)
                  )}>
                    {getResultIcon(result.type)}
                  </div>

                  {/* Result Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Type */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">
                        <SearchHighlight
                          text={result.title}
                          searchTerms={query || ''}
                        />
                      </h3>
                      <Badge 
                        variant="secondary" 
                        className="text-xs capitalize shrink-0"
                      >
                        {result.type}
                      </Badge>
                    </div>

                    {/* Subtitle */}
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        <SearchHighlight
                          text={result.subtitle}
                          searchTerms={query || ''}
                        />
                      </p>
                    )}

                    {/* Description */}
                    {result.description && (
                      <div className="text-xs text-muted-foreground mb-2">
                        <ContextualHighlight
                          text={result.description}
                          searchTerms={query || ''}
                          contextLength={60}
                          maxSnippets={2}
                        />
                      </div>
                    )}

                    {/* Metadata */}
                    {metadata.length > 0 && (
                      <div className="flex items-center gap-3 flex-wrap">
                        {metadata}
                      </div>
                    )}

                    {/* Highlighted Fields */}
                    {result.highlighted_fields && Object.keys(result.highlighted_fields).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(result.highlighted_fields).map(([field, highlight]) => (
                          <div key={field} className="text-xs">
                            <span className="text-muted-foreground capitalize">
                              {field.replace('_', ' ')}:
                            </span>
                            <span className="ml-1">
                              <SearchHighlight
                                text={highlight}
                                searchTerms={query || ''}
                              />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Relevance Score (for debugging) */}
                    {process.env.NODE_ENV === 'development' && result.relevance_score && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Relevance: {result.relevance_score.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResultClick(result);
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More Indicator */}
      {results.length < totalResults && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Showing {results.length} of {totalResults} results
          </p>
        </div>
      )}
    </div>
  );
};