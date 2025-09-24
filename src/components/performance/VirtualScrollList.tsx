import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  getItemKey = (_, index) => index,
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length - 1, visibleEnd + overscan);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    onScroll?.(scrollTop);
  }, [onScroll]);

  const offsetY = visibleRange.start * itemHeight;

  return (
    <div className={`relative ${className}`} style={{ height: containerHeight }}>
      <ScrollArea 
        className="h-full w-full"
        ref={scrollElementRef}
        onScrollCapture={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {visibleItems.map((item, index) => {
              const actualIndex = visibleRange.start + index;
              return (
                <div
                  key={getItemKey(item, actualIndex)}
                  style={{ height: itemHeight }}
                  className="w-full"
                >
                  {renderItem(item, actualIndex)}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// Hook for managing virtual scroll state
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length - 1, visibleEnd + overscan);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    visibleRange,
    totalHeight,
    offsetY,
    scrollTop,
    setScrollTop,
  };
}

// Grid virtual scrolling for card layouts
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  gap = 16,
  renderItem,
  getItemKey = (_, index) => index,
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const totalRows = Math.ceil(items.length / columnsPerRow);
  const rowHeight = itemHeight + gap;

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / rowHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / rowHeight),
      totalRows - 1
    );

    return { start: visibleStart, end: visibleEnd };
  }, [scrollTop, rowHeight, containerHeight, totalRows]);

  const visibleItems = useMemo(() => {
    const startIndex = visibleRange.start * columnsPerRow;
    const endIndex = Math.min((visibleRange.end + 1) * columnsPerRow, items.length);
    return items.slice(startIndex, endIndex);
  }, [items, visibleRange, columnsPerRow]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const totalHeight = totalRows * rowHeight;
  const offsetY = visibleRange.start * rowHeight;

  return (
    <div className="relative" style={{ height: containerHeight }}>
      <ScrollArea className="h-full w-full" onScrollCapture={handleScroll}>
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              display: 'grid',
              gridTemplateColumns: `repeat(${columnsPerRow}, ${itemWidth}px)`,
              gap: `${gap}px`,
              justifyContent: 'start',
            }}
          >
            {visibleItems.map((item, index) => {
              const actualIndex = visibleRange.start * columnsPerRow + index;
              return (
                <div key={getItemKey(item, actualIndex)}>
                  {renderItem(item, actualIndex)}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// Infinite scroll component
interface InfiniteScrollProps<T> {
  items: T[];
  hasNextPage: boolean;
  isLoading: boolean;
  loadMore: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  threshold?: number;
  className?: string;
}

export function InfiniteScroll<T>({
  items,
  hasNextPage,
  isLoading,
  loadMore,
  renderItem,
  loadingComponent,
  threshold = 200,
  className = '',
}: InfiniteScrollProps<T>) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: `${threshold}px` }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isLoading, loadMore, threshold]);

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {hasNextPage && (
        <div ref={loadMoreRef} className="py-4">
          {isLoading && (loadingComponent || <div>Loading more...</div>)}
        </div>
      )}
    </div>
  );
}