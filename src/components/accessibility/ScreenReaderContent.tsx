import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ScreenReaderContentProps {
  children: ReactNode;
  className?: string;
}

// Content that's only visible to screen readers
export function ScreenReaderOnly({ children, className }: ScreenReaderContentProps) {
  return (
    <span className={cn('sr-only', className)}>
      {children}
    </span>
  );
}

// Content that's hidden from screen readers but visible to sighted users
export function VisualOnly({ children, className }: ScreenReaderContentProps) {
  return (
    <span className={cn(className)} aria-hidden="true">
      {children}
    </span>
  );
}

// Live region for dynamic content announcements
interface LiveRegionProps {
  children: ReactNode;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
  className?: string;
}

export function LiveRegion({ 
  children, 
  priority = 'polite', 
  atomic = true,
  className 
}: LiveRegionProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  );
}

// Status message component
interface StatusMessageProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  visible?: boolean;
}

export function StatusMessage({ message, type = 'info', visible = true }: StatusMessageProps) {
  const { t } = useTranslation();
  
  const getAriaLabel = () => {
    switch (type) {
      case 'success':
        return t('accessibility.success_message', 'Success message');
      case 'error':
        return t('accessibility.error_message', 'Error message');
      case 'warning':
        return t('accessibility.warning_message', 'Warning message');
      default:
        return t('accessibility.info_message', 'Information message');
    }
  };

  return (
    <div
      role="status"
      aria-label={getAriaLabel()}
      className={cn(
        'px-4 py-2 rounded-md text-sm',
        {
          'bg-green-50 text-green-800 border border-green-200': type === 'success',
          'bg-red-50 text-red-800 border border-red-200': type === 'error',
          'bg-yellow-50 text-yellow-800 border border-yellow-200': type === 'warning',
          'bg-blue-50 text-blue-800 border border-blue-200': type === 'info',
          'sr-only': !visible,
        }
      )}
    >
      {message}
    </div>
  );
}

// Progress indicator with screen reader support
interface AccessibleProgressProps {
  value: number;
  max?: number;
  label?: string;
  description?: string;
  showPercentage?: boolean;
}

export function AccessibleProgress({ 
  value, 
  max = 100, 
  label, 
  description,
  showPercentage = true 
}: AccessibleProgressProps) {
  const { t } = useTranslation();
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">{label}</label>
          {showPercentage && (
            <span className="text-sm text-muted-foreground">{percentage}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || t('accessibility.progress', 'Progress')}
        aria-describedby={description ? 'progress-description' : undefined}
        className="w-full bg-secondary rounded-full h-2"
      >
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {description && (
        <p id="progress-description" className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      )}
      <ScreenReaderOnly>
        {t('accessibility.progress_value', '{{percentage}} percent complete', { percentage })}
      </ScreenReaderOnly>
    </div>
  );
}

// Loading indicator with screen reader support
interface AccessibleLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AccessibleLoading({ 
  message = 'Loading...', 
  size = 'md' 
}: AccessibleLoadingProps) {
  const { t } = useTranslation();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div 
      role="status" 
      aria-label={t('accessibility.loading', 'Loading')}
      className="flex items-center gap-2"
    >
      <div 
        className={cn(
          'animate-spin rounded-full border-2 border-primary border-t-transparent',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{message}</span>
      {message && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
}

// Breadcrumb navigation with proper ARIA
interface AccessibleBreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
}

export function AccessibleBreadcrumb({ items }: AccessibleBreadcrumbProps) {
  const { t } = useTranslation();

  return (
    <nav aria-label={t('accessibility.breadcrumb', 'Breadcrumb navigation')}>
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-muted-foreground" aria-hidden="true">
                /
              </span>
            )}
            {item.href && !item.current ? (
              <a 
                href={item.href}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span 
                className={cn(
                  item.current && 'text-foreground font-medium',
                  !item.current && 'text-muted-foreground'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}