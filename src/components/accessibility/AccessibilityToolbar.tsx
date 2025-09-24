import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from './AccessibilityProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Type, 
  Palette, 
  Volume2, 
  VolumeX,
  Keyboard,
  MousePointer,
  Zap,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccessibilitySettings } from './AccessibilitySettings';

interface AccessibilityToolbarProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function AccessibilityToolbar({ 
  position = 'bottom', 
  className 
}: AccessibilityToolbarProps) {
  const { t } = useTranslation();
  const { settings, updateSetting, announceToScreenReader } = useAccessibility();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const toggleHighContrast = () => {
    const newValue = !settings.highContrast;
    updateSetting('highContrast', newValue);
    announceToScreenReader(
      newValue 
        ? t('accessibility.high_contrast.enabled', 'High contrast enabled')
        : t('accessibility.high_contrast.disabled', 'High contrast disabled')
    );
  };

  const toggleReducedMotion = () => {
    const newValue = !settings.reducedMotion;
    updateSetting('reducedMotion', newValue);
    announceToScreenReader(
      newValue 
        ? t('accessibility.reduced_motion.enabled', 'Reduced motion enabled')
        : t('accessibility.reduced_motion.disabled', 'Reduced motion disabled')
    );
  };

  const toggleAnnouncements = () => {
    const newValue = !settings.screenReaderAnnouncements;
    updateSetting('screenReaderAnnouncements', newValue);
    announceToScreenReader(
      newValue 
        ? t('accessibility.announcements.enabled', 'Screen reader announcements enabled')
        : t('accessibility.announcements.disabled', 'Screen reader announcements disabled')
    );
  };

  const increaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'extra-large'] as const;
    const currentIndex = sizes.indexOf(settings.fontSize);
    const nextIndex = Math.min(currentIndex + 1, sizes.length - 1);
    const newSize = sizes[nextIndex];
    
    updateSetting('fontSize', newSize);
    announceToScreenReader(
      t('accessibility.font_size.increased', 'Font size increased to {{size}}', { 
        size: t(`accessibility.font_size.${newSize}`) 
      })
    );
  };

  const decreaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'extra-large'] as const;
    const currentIndex = sizes.indexOf(settings.fontSize);
    const nextIndex = Math.max(currentIndex - 1, 0);
    const newSize = sizes[nextIndex];
    
    updateSetting('fontSize', newSize);
    announceToScreenReader(
      t('accessibility.font_size.decreased', 'Font size decreased to {{size}}', { 
        size: t(`accessibility.font_size.${newSize}`) 
      })
    );
  };

  const resetSettings = () => {
    updateSetting('highContrast', false);
    updateSetting('reducedMotion', false);
    updateSetting('fontSize', 'medium');
    updateSetting('screenReaderAnnouncements', true);
    announceToScreenReader(
      t('accessibility.settings.reset', 'Accessibility settings reset to defaults')
    );
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'fixed z-50 shadow-lg',
          position === 'bottom' && 'bottom-4 right-4',
          position === 'top' && 'top-4 right-4',
          position === 'left' && 'left-4 top-1/2 -translate-y-1/2',
          position === 'right' && 'right-4 top-1/2 -translate-y-1/2',
          className
        )}
        onClick={() => setIsVisible(true)}
        aria-label={t('accessibility.toolbar.show', 'Show accessibility toolbar')}
      >
        <Settings className="h-4 w-4" />
        <span className="sr-only">
          {t('accessibility.toolbar.show', 'Show accessibility toolbar')}
        </span>
      </Button>
    );
  }

  const positionClasses = {
    bottom: 'bottom-4 right-4 flex-col',
    top: 'top-4 right-4 flex-col',
    left: 'left-4 top-1/2 -translate-y-1/2 flex-col',
    right: 'right-4 top-1/2 -translate-y-1/2 flex-col',
  };

  return (
    <Card 
      className={cn(
        'fixed z-50 p-2 shadow-lg bg-background/95 backdrop-blur border',
        positionClasses[position],
        isExpanded ? 'w-80' : 'w-auto',
        className
      )}
      role="toolbar"
      aria-label={t('accessibility.toolbar.title', 'Accessibility toolbar')}
    >
      {/* Toolbar Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          {isExpanded && (
            <span className="text-sm font-medium">
              {t('accessibility.toolbar.title', 'Accessibility')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={
              isExpanded 
                ? t('accessibility.toolbar.collapse', 'Collapse toolbar')
                : t('accessibility.toolbar.expand', 'Expand toolbar')
            }
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            aria-label={t('accessibility.toolbar.hide', 'Hide toolbar')}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <>
          <Separator className="mb-3" />
          
          {/* Quick Actions */}
          <div className="space-y-3">
            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.highContrast ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {t('accessibility.high_contrast.title', 'High Contrast')}
                </span>
              </div>
              <Button
                variant={settings.highContrast ? "default" : "outline"}
                size="sm"
                onClick={toggleHighContrast}
                aria-pressed={settings.highContrast}
              >
                {settings.highContrast ? t('common.on', 'On') : t('common.off', 'Off')}
              </Button>
            </div>

            {/* Font Size Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <span className="text-sm">
                  {t('accessibility.font_size.title', 'Font Size')}
                </span>
                <Badge variant="outline" className="text-xs">
                  {t(`accessibility.font_size.${settings.fontSize}`)}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decreaseFontSize}
                  disabled={settings.fontSize === 'small'}
                  aria-label={t('accessibility.font_size.decrease', 'Decrease font size')}
                >
                  <Type className="h-3 w-3" />
                  <span className="text-xs">-</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={increaseFontSize}
                  disabled={settings.fontSize === 'extra-large'}
                  aria-label={t('accessibility.font_size.increase', 'Increase font size')}
                >
                  <Type className="h-3 w-3" />
                  <span className="text-xs">+</span>
                </Button>
              </div>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm">
                  {t('accessibility.reduced_motion.title', 'Reduced Motion')}
                </span>
              </div>
              <Button
                variant={settings.reducedMotion ? "default" : "outline"}
                size="sm"
                onClick={toggleReducedMotion}
                aria-pressed={settings.reducedMotion}
              >
                {settings.reducedMotion ? t('common.on', 'On') : t('common.off', 'Off')}
              </Button>
            </div>

            {/* Screen Reader Announcements Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.screenReaderAnnouncements ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {t('accessibility.announcements.title', 'Announcements')}
                </span>
              </div>
              <Button
                variant={settings.screenReaderAnnouncements ? "default" : "outline"}
                size="sm"
                onClick={toggleAnnouncements}
                aria-pressed={settings.screenReaderAnnouncements}
              >
                {settings.screenReaderAnnouncements ? t('common.on', 'On') : t('common.off', 'Off')}
              </Button>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <AccessibilitySettings />
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetSettings}
                className="w-full"
              >
                {t('accessibility.settings.reset', 'Reset Settings')}
              </Button>
            </div>

            {/* Current Status */}
            <div className="text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-1">
                {settings.highContrast && (
                  <Badge variant="secondary" className="text-xs">
                    {t('accessibility.high_contrast.short', 'High Contrast')}
                  </Badge>
                )}
                {settings.reducedMotion && (
                  <Badge variant="secondary" className="text-xs">
                    {t('accessibility.reduced_motion.short', 'Reduced Motion')}
                  </Badge>
                )}
                {!settings.screenReaderAnnouncements && (
                  <Badge variant="outline" className="text-xs">
                    {t('accessibility.announcements.off', 'Announcements Off')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}