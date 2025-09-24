import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';

interface UseAccessibilityFeaturesOptions {
  announcePageChanges?: boolean;
  manageFocus?: boolean;
  enableKeyboardShortcuts?: boolean;
  trackUserInteraction?: boolean;
}

export function useAccessibilityFeatures(options: UseAccessibilityFeaturesOptions = {}) {
  const {
    announcePageChanges = true,
    manageFocus = true,
    enableKeyboardShortcuts = true,
    trackUserInteraction = true,
  } = options;

  const { announceToScreenReader, settings } = useAccessibility();
  const { t } = useTranslation();
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);
  const pageAnnouncedRef = useRef(false);

  // Track keyboard vs mouse usage
  useEffect(() => {
    if (!trackUserInteraction) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
        document.body.classList.add('keyboard-navigation-active');
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      document.body.classList.remove('keyboard-navigation-active');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [trackUserInteraction]);

  // Announce page changes to screen readers
  useEffect(() => {
    if (!announcePageChanges || pageAnnouncedRef.current) return;

    const pageTitle = document.title;
    const mainHeading = document.querySelector('h1')?.textContent;
    
    if (pageTitle || mainHeading) {
      const announcement = mainHeading || pageTitle;
      announceToScreenReader(
        t('accessibility.page_loaded', 'Page loaded: {{title}}', { title: announcement }),
        'polite'
      );
      pageAnnouncedRef.current = true;
    }
  }, [announcePageChanges, announceToScreenReader, t]);

  // Focus management utilities
  const focusManagement = {
    // Store current focus for later restoration
    storeFocus: () => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement !== document.body) {
        setLastFocusedElement(activeElement);
      }
    },

    // Restore previously stored focus
    restoreFocus: () => {
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
        setLastFocusedElement(null);
      }
    },

    // Focus first focusable element in container
    focusFirst: (container?: HTMLElement) => {
      const target = container || document.body;
      const focusable = target.querySelector(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (focusable) {
        focusable.focus();
        return true;
      }
      return false;
    },

    // Focus element by selector or element reference
    focusElement: (target: string | HTMLElement) => {
      const element = typeof target === 'string' 
        ? document.querySelector(target) as HTMLElement
        : target;
      
      if (element && typeof element.focus === 'function') {
        element.focus();
        return true;
      }
      return false;
    },
  };

  // Keyboard shortcut management
  const keyboardShortcuts = {
    // Register a keyboard shortcut
    register: (key: string, callback: () => void, description?: string) => {
      if (!enableKeyboardShortcuts) return () => {};

      const handleKeyDown = (e: KeyboardEvent) => {
        const shortcut = [
          e.ctrlKey && 'ctrl',
          e.altKey && 'alt',
          e.shiftKey && 'shift',
          e.metaKey && 'meta',
          e.key.toLowerCase()
        ].filter(Boolean).join('+');

        if (shortcut === key) {
          e.preventDefault();
          callback();
          
          if (description) {
            announceToScreenReader(
              t('accessibility.shortcut_activated', 'Keyboard shortcut activated: {{description}}', { description })
            );
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    },

    // Common shortcuts
    registerEscape: (callback: () => void) => {
      return keyboardShortcuts.register('escape', callback, t('accessibility.escape', 'Escape'));
    },

    registerEnter: (callback: () => void) => {
      return keyboardShortcuts.register('enter', callback, t('accessibility.activate', 'Activate'));
    },
  };

  // Screen reader utilities
  const screenReader = {
    // Announce a message
    announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      announceToScreenReader(message, priority);
    },

    // Announce form validation errors
    announceFormErrors: (errors: Record<string, string>) => {
      const errorCount = Object.keys(errors).length;
      if (errorCount > 0) {
        const message = t('accessibility.form_errors', 
          'Form has {{count}} error(s). Please review and correct.', 
          { count: errorCount }
        );
        announceToScreenReader(message, 'assertive');
      }
    },

    // Announce loading states
    announceLoading: (isLoading: boolean, message?: string) => {
      if (isLoading) {
        announceToScreenReader(
          message || t('accessibility.loading', 'Loading content, please wait'),
          'polite'
        );
      } else {
        announceToScreenReader(
          t('accessibility.loaded', 'Content loaded'),
          'polite'
        );
      }
    },

    // Announce navigation changes
    announceNavigation: (destination: string) => {
      announceToScreenReader(
        t('accessibility.navigating', 'Navigating to {{destination}}', { destination }),
        'polite'
      );
    },
  };

  // ARIA utilities
  const aria = {
    // Generate unique IDs for ARIA relationships
    generateId: (prefix: string = 'aria') => {
      return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Create ARIA describedby relationship
    createDescribedBy: (elementId: string, descriptionId: string) => {
      const element = document.getElementById(elementId);
      if (element) {
        const existingDescribedBy = element.getAttribute('aria-describedby');
        const newDescribedBy = existingDescribedBy 
          ? `${existingDescribedBy} ${descriptionId}`
          : descriptionId;
        element.setAttribute('aria-describedby', newDescribedBy);
      }
    },

    // Remove ARIA describedby relationship
    removeDescribedBy: (elementId: string, descriptionId: string) => {
      const element = document.getElementById(elementId);
      if (element) {
        const describedBy = element.getAttribute('aria-describedby');
        if (describedBy) {
          const newDescribedBy = describedBy
            .split(' ')
            .filter(id => id !== descriptionId)
            .join(' ');
          
          if (newDescribedBy) {
            element.setAttribute('aria-describedby', newDescribedBy);
          } else {
            element.removeAttribute('aria-describedby');
          }
        }
      }
    },
  };

  // Color contrast utilities
  const colorContrast = {
    // Check if high contrast mode is enabled
    isHighContrast: () => settings.highContrast,

    // Apply high contrast styles to element
    applyHighContrast: (element: HTMLElement) => {
      if (settings.highContrast) {
        element.classList.add('high-contrast-element');
      }
    },
  };

  // Motion utilities
  const motion = {
    // Check if reduced motion is preferred
    isReducedMotion: () => settings.reducedMotion,

    // Apply reduced motion styles
    applyReducedMotion: (element: HTMLElement) => {
      if (settings.reducedMotion) {
        element.classList.add('reduced-motion-element');
      }
    },
  };

  return {
    isKeyboardUser,
    settings,
    focusManagement,
    keyboardShortcuts,
    screenReader,
    aria,
    colorContrast,
    motion,
  };
}

// Hook for form accessibility
export function useFormAccessibility() {
  const { screenReader, aria } = useAccessibilityFeatures();
  const { t } = useTranslation();

  const validateAndAnnounce = (errors: Record<string, string>) => {
    screenReader.announceFormErrors(errors);
    
    // Focus first error field
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const field = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      if (field) {
        field.focus();
      }
    }
  };

  const announceFieldError = (fieldName: string, error: string) => {
    screenReader.announce(
      t('accessibility.field_error', 'Error in {{field}}: {{error}}', { 
        field: fieldName, 
        error 
      }),
      'assertive'
    );
  };

  const announceFormSuccess = (message?: string) => {
    screenReader.announce(
      message || t('accessibility.form_success', 'Form submitted successfully'),
      'polite'
    );
  };

  return {
    validateAndAnnounce,
    announceFieldError,
    announceFormSuccess,
    generateFieldId: aria.generateId,
  };
}

// Hook for table accessibility
export function useTableAccessibility() {
  const { aria } = useAccessibilityFeatures();
  const { t } = useTranslation();

  const enhanceTable = (tableElement: HTMLTableElement) => {
    // Add table caption if missing
    if (!tableElement.caption) {
      const caption = document.createElement('caption');
      caption.textContent = t('accessibility.data_table', 'Data table');
      caption.className = 'sr-only';
      tableElement.insertBefore(caption, tableElement.firstChild);
    }

    // Add scope attributes to headers
    const headers = tableElement.querySelectorAll('th');
    headers.forEach((header, index) => {
      if (!header.hasAttribute('scope')) {
        // Determine if it's a column or row header based on position
        const isRowHeader = header.parentElement?.children[0] === header;
        header.setAttribute('scope', isRowHeader ? 'row' : 'col');
      }
    });

    // Add ARIA labels for sortable columns
    const sortableHeaders = tableElement.querySelectorAll('th[data-sortable="true"]');
    sortableHeaders.forEach(header => {
      if (!header.hasAttribute('aria-label')) {
        const columnName = header.textContent?.trim() || '';
        header.setAttribute('aria-label', 
          t('accessibility.sortable_column', 'Sort by {{column}}', { column: columnName })
        );
      }
    });
  };

  return {
    enhanceTable,
  };
}