import React, { useEffect, useRef, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from './AccessibilityProvider';

interface KeyboardNavigationProps {
  children: ReactNode;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  enableArrowNavigation?: boolean;
  enableTabNavigation?: boolean;
  className?: string;
}

export function KeyboardNavigation({
  children,
  onEscape,
  onEnter,
  onArrowKeys,
  enableArrowNavigation = false,
  enableTabNavigation = true,
  className
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { announceToScreenReader } = useAccessibility();
  const { t } = useTranslation();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
            announceToScreenReader(t('accessibility.escaped', 'Escaped from current context'));
          }
          break;

        case 'Enter':
          if (onEnter && event.target === container) {
            event.preventDefault();
            onEnter();
          }
          break;

        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          if (enableArrowNavigation && onArrowKeys) {
            event.preventDefault();
            const direction = event.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
            onArrowKeys(direction);
          }
          break;

        case 'Tab':
          if (!enableTabNavigation) {
            event.preventDefault();
          }
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter, onArrowKeys, enableArrowNavigation, enableTabNavigation, announceToScreenReader, t]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  const { announceToScreenReader } = useAccessibility();
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = [
        event.ctrlKey && 'ctrl',
        event.altKey && 'alt',
        event.shiftKey && 'shift',
        event.metaKey && 'meta',
        event.key.toLowerCase()
      ].filter(Boolean).join('+');

      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
        announceToScreenReader(
          t('accessibility.shortcut_activated', 'Keyboard shortcut activated: {{key}}', { key })
        );
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, announceToScreenReader, t]);
}

// Component for skip links
interface SkipLinkProps {
  href: string;
  children: ReactNode;
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      onClick={(e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          (target as HTMLElement).focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    >
      {children}
    </a>
  );
}

// Component for keyboard navigation hints
interface KeyboardHintsProps {
  shortcuts: Array<{
    key: string;
    description: string;
  }>;
  visible?: boolean;
}

export function KeyboardHints({ shortcuts, visible = false }: KeyboardHintsProps) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg z-50 max-w-sm"
      role="dialog"
      aria-label={t('accessibility.keyboard_shortcuts', 'Keyboard shortcuts')}
    >
      <h3 className="font-semibold mb-2 text-sm">
        {t('accessibility.keyboard_shortcuts', 'Keyboard shortcuts')}
      </h3>
      <ul className="space-y-1 text-xs">
        {shortcuts.map((shortcut, index) => (
          <li key={index} className="flex justify-between">
            <span className="text-muted-foreground">{shortcut.description}</span>
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs font-mono">
              {shortcut.key}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}