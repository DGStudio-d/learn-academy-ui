import React, { useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FocusManagerProps {
  children: ReactNode;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
  className?: string;
}

export function FocusManager({ 
  children, 
  autoFocus = false, 
  restoreFocus = false,
  trapFocus = false,
  className 
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement;
    }

    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        (firstFocusable as HTMLElement).focus();
      }
    }

    return () => {
      if (restoreFocus && previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus?.();
      }
    };
  }, [autoFocus, restoreFocus]);

  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(containerRef.current!);
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [trapFocus]);

  return (
    <div ref={containerRef} className={cn(className)}>
      {children}
    </div>
  );
}

function getFocusableElements(container: HTMLElement): Element[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)).filter(
    (element) => {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }
  );
}

// Hook for managing focus programmatically
export function useFocusManagement() {
  const focusElement = (selector: string | HTMLElement) => {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  };

  const focusFirstElement = (container?: HTMLElement) => {
    const target = container || document.body;
    const focusableElements = getFocusableElements(target);
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  };

  const focusLastElement = (container?: HTMLElement) => {
    const target = container || document.body;
    const focusableElements = getFocusableElements(target);
    if (focusableElements.length > 0) {
      (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
    }
  };

  return {
    focusElement,
    focusFirstElement,
    focusLastElement,
  };
}