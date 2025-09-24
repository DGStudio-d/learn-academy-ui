import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  fallbackSrc?: string;
  lazy?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 75,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  onLoad,
  onError,
  className,
  fallbackSrc,
  lazy = true,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate responsive image URLs
  const generateSrcSet = useCallback((baseSrc: string) => {
    if (!width || !height) return undefined;
    
    const breakpoints = [480, 768, 1024, 1280, 1920];
    const srcSet = breakpoints
      .filter(bp => bp <= width * 2) // Only include breakpoints up to 2x the original width
      .map(bp => {
        const scaledHeight = Math.round((height * bp) / width);
        return `${baseSrc}?w=${bp}&h=${scaledHeight}&q=${quality} ${bp}w`;
      })
      .join(', ');
    
    return srcSet || undefined;
  }, [width, height, quality]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;
  const shouldShowPlaceholder = !isLoaded && placeholder === 'blur' && blurDataURL;

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        className
      )}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {shouldShowPlaceholder && (
        <img
          src={blurDataURL}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          style={{ filter: 'blur(10px)', transform: 'scale(1.1)' }}
        />
      )}

      {/* Empty placeholder */}
      {!shouldShowPlaceholder && !isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <svg
            className="w-8 h-8 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Main image */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageSrc}
          srcSet={generateSrcSet(imageSrc)}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}

// Hook for preloading images
export function useImagePreloader() {
  const preloadedImages = useRef(new Set<string>());

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.current.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        preloadedImages.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback((sources: string[]): Promise<void[]> => {
    return Promise.all(sources.map(preloadImage));
  }, [preloadImage]);

  return { preloadImage, preloadImages };
}

// Progressive image component with multiple quality levels
interface ProgressiveImageProps extends OptimizedImageProps {
  lowQualitySrc?: string;
  mediumQualitySrc?: string;
}

export function ProgressiveImage({
  src,
  lowQualitySrc,
  mediumQualitySrc,
  ...props
}: ProgressiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [loadedSources, setLoadedSources] = useState(new Set<string>());

  useEffect(() => {
    const sources = [
      lowQualitySrc,
      mediumQualitySrc,
      src
    ].filter(Boolean) as string[];

    sources.forEach((source, index) => {
      const img = new Image();
      img.onload = () => {
        setLoadedSources(prev => new Set([...prev, source]));
        
        // Update to highest quality available
        if (source === src) {
          setCurrentSrc(src);
        } else if (source === mediumQualitySrc && !loadedSources.has(src)) {
          setCurrentSrc(mediumQualitySrc);
        }
      };
      img.src = source;
    });
  }, [src, lowQualitySrc, mediumQualitySrc, loadedSources]);

  return <OptimizedImage {...props} src={currentSrc} />;
}

// Image gallery with lazy loading and virtual scrolling
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
    thumbnail?: string;
  }>;
  columns?: number;
  gap?: number;
  onImageClick?: (index: number) => void;
  className?: string;
}

export function ImageGallery({
  images,
  columns = 3,
  gap = 16,
  onImageClick,
  className
}: ImageGalleryProps) {
  return (
    <div 
      className={cn('grid gap-4', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {images.map((image, index) => (
        <div
          key={index}
          className="aspect-square cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onImageClick?.(index)}
        >
          <OptimizedImage
            src={image.thumbnail || image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="w-full h-full rounded-lg"
            placeholder="blur"
          />
        </div>
      ))}
    </div>
  );
}