# Performance Optimization Guide

## Overview
This guide outlines the performance optimizations implemented in the Learn Academy UI application.

## Code Splitting & Lazy Loading

### Implemented Features
- **Route-based code splitting**: All major routes are lazy-loaded
- **Component lazy loading**: Large components are loaded on demand
- **Vendor chunk separation**: Third-party libraries are bundled separately for better caching

### Usage
```typescript
// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'))

// Enhanced lazy loading with preloading
const LazyComponent = lazyWithPreload(() => import('./components/Heavy'))
```

## Bundle Optimization

### Vite Configuration
- **Manual chunk splitting**: Vendor libraries grouped by function
- **Asset optimization**: Small assets inlined, large assets optimized
- **Terser minification**: JavaScript optimized for production
- **CSS code splitting**: Styles loaded per route

### Bundle Analysis
```bash
npm run build:analyze  # Analyze bundle size
```

## Performance Monitoring

### Web Vitals Tracking
- **Core Web Vitals**: LCP, FID, CLS automatically tracked
- **Custom metrics**: Component render times, API response times
- **Memory monitoring**: JavaScript heap usage tracking

### Performance Monitor Component
```typescript
import { PerformanceMonitor } from './components/performance/PerformanceMonitor'

// Add to your app (development only)
<PerformanceMonitor />
```

## Optimization Hooks

### usePerformanceOptimization
```typescript
const { 
  createDebouncedFunction, 
  createThrottledFunction,
  renderCount 
} = usePerformanceOptimization()

const debouncedSearch = createDebouncedFunction(searchAPI, 300)
```

### useVirtualScrolling
```typescript
const { getVisibleItems, totalHeight } = useVirtualScrolling(
  items, 
  itemHeight, 
  containerHeight
)
```

### useLazyImage
```typescript
const imgRef = useLazyImage('/path/to/image.jpg')
return <img ref={imgRef} alt="Lazy loaded" />
```

## Memory Management

### Monitoring
- Real-time memory usage tracking
- Automatic garbage collection in development
- Cache cleanup utilities

### Best Practices
- Clear unused caches periodically
- Use React.memo for expensive components
- Implement proper cleanup in useEffect

## Network Optimization

### Data Fetching
- **React Query caching**: Smart caching with stale-while-revalidate
- **Request deduplication**: Automatic duplicate request elimination
- **Background refetching**: Keep data fresh without blocking UI

### Resource Loading
- **Preloading**: Critical resources loaded early
- **Prefetching**: Next-likely resources loaded in background
- **Image optimization**: Lazy loading with intersection observer

## Performance Scripts

```bash
# Development with performance monitoring
npm run dev

# Production build with optimizations
npm run build

# Bundle analysis
npm run build:analyze

# Performance audit (requires running server)
npm run perf:audit

# Run performance tests
npm run test
```

## Metrics & Monitoring

### Development Metrics
- Component render counts
- Memory usage alerts
- Bundle size warnings
- Network request timing

### Production Metrics
- Core Web Vitals
- User interaction timing
- Error rate tracking
- Performance regression detection

## Best Practices

### Component Optimization
1. Use React.memo for pure components
2. Implement proper dependencies in useEffect
3. Avoid inline functions in render
4. Use useMemo and useCallback appropriately

### State Management
1. Minimize state updates
2. Use local state when possible
3. Implement proper memoization
4. Avoid deep object mutations

### Asset Optimization
1. Optimize images (WebP, lazy loading)
2. Minimize CSS and JavaScript
3. Use CDN for static assets
4. Implement proper caching headers

## Troubleshooting

### Performance Issues
1. Check bundle analyzer for large dependencies
2. Monitor memory usage for leaks
3. Use React DevTools Profiler
4. Analyze network requests

### Common Problems
- **Large bundle size**: Split vendor chunks, lazy load routes
- **Memory leaks**: Cleanup subscriptions, remove event listeners
- **Slow rendering**: Use virtualization, memoization
- **Network bottlenecks**: Implement caching, reduce requests

## Tools & Resources

### Development Tools
- React DevTools Profiler
- Lighthouse for audits
- Bundle analyzer
- Performance Monitor component

### Production Monitoring
- Web Vitals library
- Custom performance tracking
- Error boundary metrics
- User interaction analytics

## Performance Goals

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1
- **Bundle size**: < 200KB (gzipped)

### Monitoring Thresholds
- Memory usage: < 50MB
- Render time: < 16ms (60fps)
- API response: < 500ms
- Network requests: < 20 per page