import React from 'react';
import { cn } from '@/lib/utils';

interface SearchHighlightProps {
  text: string;
  searchTerms: string | string[];
  className?: string;
  highlightClassName?: string;
}

export const SearchHighlight: React.FC<SearchHighlightProps> = ({
  text,
  searchTerms,
  className,
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded'
}) => {
  if (!text || !searchTerms) {
    return <span className={className}>{text}</span>;
  }

  // Normalize search terms to array
  const terms = Array.isArray(searchTerms) 
    ? searchTerms.filter(term => term.trim()) 
    : [searchTerms].filter(term => term.trim());

  if (terms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Create regex pattern for all terms
  const pattern = terms
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex chars
    .join('|');
  
  const regex = new RegExp(`(${pattern})`, 'gi');
  
  // Split text by matches
  const parts = text.split(regex);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches any search term
        const isMatch = terms.some(term => 
          part.toLowerCase() === term.toLowerCase()
        );
        
        return isMatch ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

// Hook for highlighting text
export const useTextHighlight = () => {
  const highlightText = React.useCallback((
    text: string, 
    searchTerms: string | string[],
    options?: {
      highlightClassName?: string;
      caseSensitive?: boolean;
    }
  ): string => {
    if (!text || !searchTerms) return text;

    const terms = Array.isArray(searchTerms) 
      ? searchTerms.filter(term => term.trim()) 
      : [searchTerms].filter(term => term.trim());

    if (terms.length === 0) return text;

    const highlightClass = options?.highlightClassName || 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded';
    const flags = options?.caseSensitive ? 'g' : 'gi';

    let highlightedText = text;
    
    terms.forEach(term => {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedTerm})`, flags);
      highlightedText = highlightedText.replace(
        regex, 
        `<mark class="${highlightClass}">$1</mark>`
      );
    });

    return highlightedText;
  }, []);

  const highlightMultipleTerms = React.useCallback((
    text: string,
    terms: string[],
    options?: {
      highlightClassName?: string;
      caseSensitive?: boolean;
    }
  ): string => {
    return highlightText(text, terms, options);
  }, [highlightText]);

  return {
    highlightText,
    highlightMultipleTerms
  };
};

// Component for rendering highlighted HTML safely
interface HighlightedTextProps {
  html: string;
  className?: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  html,
  className
}) => {
  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Advanced highlighting with context
interface ContextualHighlightProps {
  text: string;
  searchTerms: string | string[];
  contextLength?: number;
  maxSnippets?: number;
  className?: string;
  highlightClassName?: string;
  ellipsis?: string;
}

export const ContextualHighlight: React.FC<ContextualHighlightProps> = ({
  text,
  searchTerms,
  contextLength = 50,
  maxSnippets = 3,
  className,
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded font-medium',
  ellipsis = '...'
}) => {
  if (!text || !searchTerms) {
    return <span className={className}>{text}</span>;
  }

  const terms = Array.isArray(searchTerms) 
    ? searchTerms.filter(term => term.trim()) 
    : [searchTerms].filter(term => term.trim());

  if (terms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Find all matches with their positions
  const matches: Array<{ start: number; end: number; term: string }> = [];
  
  terms.forEach(term => {
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        term: match[0]
      });
    }
  });

  if (matches.length === 0) {
    // No matches found, return truncated text
    const truncated = text.length > contextLength * 2 
      ? text.substring(0, contextLength * 2) + ellipsis
      : text;
    return <span className={className}>{truncated}</span>;
  }

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);

  // Create snippets around matches
  const snippets: Array<{ start: number; end: number; text: string }> = [];
  
  matches.slice(0, maxSnippets).forEach(match => {
    const snippetStart = Math.max(0, match.start - contextLength);
    const snippetEnd = Math.min(text.length, match.end + contextLength);
    
    // Check if this snippet overlaps with existing ones
    const overlapping = snippets.find(snippet => 
      (snippetStart >= snippet.start && snippetStart <= snippet.end) ||
      (snippetEnd >= snippet.start && snippetEnd <= snippet.end) ||
      (snippetStart <= snippet.start && snippetEnd >= snippet.end)
    );
    
    if (overlapping) {
      // Extend the existing snippet
      overlapping.start = Math.min(overlapping.start, snippetStart);
      overlapping.end = Math.max(overlapping.end, snippetEnd);
      overlapping.text = text.substring(overlapping.start, overlapping.end);
    } else {
      // Add new snippet
      snippets.push({
        start: snippetStart,
        end: snippetEnd,
        text: text.substring(snippetStart, snippetEnd)
      });
    }
  });

  // Render snippets with highlighting
  return (
    <span className={className}>
      {snippets.map((snippet, index) => (
        <span key={index}>
          {index > 0 && <span className="text-muted-foreground mx-2">{ellipsis}</span>}
          {snippet.start > 0 && <span className="text-muted-foreground">{ellipsis}</span>}
          <SearchHighlight
            text={snippet.text}
            searchTerms={terms}
            highlightClassName={highlightClassName}
          />
          {snippet.end < text.length && <span className="text-muted-foreground">{ellipsis}</span>}
        </span>
      ))}
    </span>
  );
};