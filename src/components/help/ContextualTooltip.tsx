import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import type { TooltipConfig } from './types';

interface ContextualTooltipProps {
  config: TooltipConfig;
  onDismiss?: (tooltipId: string) => void;
}

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  config,
  onDismiss
}) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Check if tooltip should be shown for current user role
  const shouldShow = !config.role || !user || config.role === user.role;

  useEffect(() => {
    if (!shouldShow) return;

    const element = document.querySelector(config.target) as HTMLElement;
    if (element) {
      setTargetElement(element);
    }
  }, [config.target, shouldShow]);

  useEffect(() => {
    if (!targetElement || !shouldShow) return;

    const showTooltip = (event: Event) => {
      if (config.trigger === 'hover' || config.trigger === 'focus') {
        clearTimeout(timeoutRef.current);
        updatePosition();
        setIsVisible(true);
      }
    };

    const hideTooltip = () => {
      if (config.trigger === 'hover' || config.trigger === 'focus') {
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 300);
      }
    };

    const clickHandler = (event: Event) => {
      if (config.trigger === 'click') {
        event.preventDefault();
        updatePosition();
        setIsVisible(prev => !prev);
      }
    };

    const updatePosition = () => {
      if (!targetElement || !tooltipRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let top = 0;
      let left = 0;

      switch (config.position || 'top') {
        case 'top':
          top = targetRect.top - tooltipRect.height - 10;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + 10;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - 10;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + 10;
          break;
      }

      // Ensure tooltip stays within viewport
      if (left < 10) left = 10;
      if (left + tooltipRect.width > viewport.width - 10) {
        left = viewport.width - tooltipRect.width - 10;
      }
      if (top < 10) top = 10;
      if (top + tooltipRect.height > viewport.height - 10) {
        top = viewport.height - tooltipRect.height - 10;
      }

      setPosition({ top, left });
    };

    // Add event listeners based on trigger type
    switch (config.trigger || 'hover') {
      case 'hover':
        targetElement.addEventListener('mouseenter', showTooltip);
        targetElement.addEventListener('mouseleave', hideTooltip);
        break;
      case 'focus':
        targetElement.addEventListener('focus', showTooltip);
        targetElement.addEventListener('blur', hideTooltip);
        break;
      case 'click':
        targetElement.addEventListener('click', clickHandler);
        break;
    }

    // Update position on scroll/resize
    const handleResize = () => {
      if (isVisible) updatePosition();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      clearTimeout(timeoutRef.current);
      
      switch (config.trigger || 'hover') {
        case 'hover':
          targetElement.removeEventListener('mouseenter', showTooltip);
          targetElement.removeEventListener('mouseleave', hideTooltip);
          break;
        case 'focus':
          targetElement.removeEventListener('focus', showTooltip);
          targetElement.removeEventListener('blur', hideTooltip);
          break;
        case 'click':
          targetElement.removeEventListener('click', clickHandler);
          break;
      }

      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [targetElement, config, isVisible, shouldShow]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss(config.id);
    }
  };

  // Handle click outside to close
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        targetElement &&
        !targetElement.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, targetElement]);

  if (!shouldShow || !isVisible || !targetElement) {
    return null;
  }

  const tooltip = (
    <div
      ref={tooltipRef}
      className="fixed z-50 animate-in fade-in-0 zoom-in-95"
      style={{
        top: position.top,
        left: position.left,
      }}
      role="tooltip"
      aria-labelledby={`tooltip-title-${config.id}`}
      aria-describedby={`tooltip-content-${config.id}`}
    >
      <Card className="max-w-sm shadow-lg border-2 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              <CardTitle 
                id={`tooltip-title-${config.id}`}
                className="text-sm font-medium"
              >
                {config.title}
              </CardTitle>
            </div>
            {config.dismissible !== false && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0"
                aria-label="Close tooltip"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p 
            id={`tooltip-content-${config.id}`}
            className="text-sm text-muted-foreground"
          >
            {config.content}
          </p>
        </CardContent>
      </Card>
      
      {/* Arrow pointing to target element */}
      <div
        className={`absolute w-3 h-3 bg-background border-l border-t border-primary/20 transform rotate-45 ${
          config.position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2' :
          config.position === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2' :
          config.position === 'right' ? '-left-1.5 top-1/2 -translate-y-1/2' :
          '-right-1.5 top-1/2 -translate-y-1/2'
        }`}
      />
    </div>
  );

  return createPortal(tooltip, document.body);
};

// Hook for managing multiple contextual tooltips
export const useContextualTooltips = (tooltips: TooltipConfig[]) => {
  const [dismissedTooltips, setDismissedTooltips] = useState<string[]>([]);
  const { user } = useAuth();

  // Load dismissed tooltips from localStorage
  useEffect(() => {
    if (user) {
      const storageKey = `dismissed_tooltips_${user.id}`;
      const dismissed = localStorage.getItem(storageKey);
      if (dismissed) {
        setDismissedTooltips(JSON.parse(dismissed));
      }
    }
  }, [user]);

  const dismissTooltip = (tooltipId: string) => {
    const newDismissed = [...dismissedTooltips, tooltipId];
    setDismissedTooltips(newDismissed);
    
    if (user) {
      const storageKey = `dismissed_tooltips_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(newDismissed));
    }
  };

  const resetTooltips = () => {
    setDismissedTooltips([]);
    if (user) {
      const storageKey = `dismissed_tooltips_${user.id}`;
      localStorage.removeItem(storageKey);
    }
  };

  const activeTooltips = tooltips.filter(tooltip => 
    !dismissedTooltips.includes(tooltip.id) &&
    (!tooltip.role || !user || tooltip.role === user.role)
  );

  return {
    activeTooltips,
    dismissTooltip,
    resetTooltips,
    dismissedCount: dismissedTooltips.length
  };
};