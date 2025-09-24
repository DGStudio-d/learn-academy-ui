import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from './AccessibilityProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Eye, Volume2, Keyboard, Palette, Type } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScreenReaderOnly } from './ScreenReaderContent';

export function AccessibilitySettings() {
  const { t } = useTranslation();
  const { settings, updateSetting, announceToScreenReader } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const handleSettingChange = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K],
    announcement?: string
  ) => {
    updateSetting(key, value);
    if (announcement) {
      announceToScreenReader(announcement);
    }
  };

  const fontSizeOptions = [
    { value: 'small', label: t('accessibility.font_size.small', 'Small') },
    { value: 'medium', label: t('accessibility.font_size.medium', 'Medium') },
    { value: 'large', label: t('accessibility.font_size.large', 'Large') },
    { value: 'extra-large', label: t('accessibility.font_size.extra_large', 'Extra Large') },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          aria-label={t('accessibility.settings.open', 'Open accessibility settings')}
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">
            {t('accessibility.settings.title', 'Accessibility')}
          </span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('accessibility.settings.title', 'Accessibility Settings')}
          </DialogTitle>
          <DialogDescription>
            {t('accessibility.settings.description', 'Customize your accessibility preferences to improve your experience.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visual Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5" />
                {t('accessibility.visual.title', 'Visual Settings')}
              </CardTitle>
              <CardDescription>
                {t('accessibility.visual.description', 'Adjust visual appearance and contrast')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast" className="text-base">
                    {t('accessibility.high_contrast.title', 'High Contrast')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('accessibility.high_contrast.description', 'Increase contrast for better visibility')}
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) =>
                    handleSettingChange(
                      'highContrast',
                      checked,
                      checked 
                        ? t('accessibility.high_contrast.enabled', 'High contrast enabled')
                        : t('accessibility.high_contrast.disabled', 'High contrast disabled')
                    )
                  }
                />
              </div>

              <Separator />

              {/* Font Size */}
              <div className="space-y-2">
                <Label htmlFor="font-size" className="text-base">
                  {t('accessibility.font_size.title', 'Font Size')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.font_size.description', 'Adjust text size for better readability')}
                </p>
                <Select
                  value={settings.fontSize}
                  onValueChange={(value: typeof settings.fontSize) =>
                    handleSettingChange(
                      'fontSize',
                      value,
                      t('accessibility.font_size.changed', 'Font size changed to {{size}}', { 
                        size: fontSizeOptions.find(opt => opt.value === value)?.label 
                      })
                    )
                  }
                >
                  <SelectTrigger id="font-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Motion Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5" />
                {t('accessibility.motion.title', 'Motion Settings')}
              </CardTitle>
              <CardDescription>
                {t('accessibility.motion.description', 'Control animations and transitions')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduced-motion" className="text-base">
                    {t('accessibility.reduced_motion.title', 'Reduced Motion')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('accessibility.reduced_motion.description', 'Minimize animations and transitions')}
                  </p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) =>
                    handleSettingChange(
                      'reducedMotion',
                      checked,
                      checked 
                        ? t('accessibility.reduced_motion.enabled', 'Reduced motion enabled')
                        : t('accessibility.reduced_motion.disabled', 'Reduced motion disabled')
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Keyboard & Focus Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Keyboard className="h-5 w-5" />
                {t('accessibility.keyboard.title', 'Keyboard & Focus')}
              </CardTitle>
              <CardDescription>
                {t('accessibility.keyboard.description', 'Keyboard navigation and focus indicators')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="focus-visible" className="text-base">
                    {t('accessibility.focus_visible.title', 'Focus Indicators')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('accessibility.focus_visible.description', 'Show visible focus indicators for keyboard navigation')}
                  </p>
                </div>
                <Switch
                  id="focus-visible"
                  checked={settings.focusVisible}
                  onCheckedChange={(checked) =>
                    handleSettingChange(
                      'focusVisible',
                      checked,
                      checked 
                        ? t('accessibility.focus_visible.enabled', 'Focus indicators enabled')
                        : t('accessibility.focus_visible.disabled', 'Focus indicators disabled')
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Screen Reader Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Volume2 className="h-5 w-5" />
                {t('accessibility.screen_reader.title', 'Screen Reader')}
              </CardTitle>
              <CardDescription>
                {t('accessibility.screen_reader.description', 'Settings for screen reader users')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="screen-reader-announcements" className="text-base">
                    {t('accessibility.announcements.title', 'Live Announcements')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('accessibility.announcements.description', 'Enable automatic announcements for screen readers')}
                  </p>
                </div>
                <Switch
                  id="screen-reader-announcements"
                  checked={settings.screenReaderAnnouncements}
                  onCheckedChange={(checked) =>
                    handleSettingChange(
                      'screenReaderAnnouncements',
                      checked,
                      checked 
                        ? t('accessibility.announcements.enabled', 'Screen reader announcements enabled')
                        : t('accessibility.announcements.disabled', 'Screen reader announcements disabled')
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Settings Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('accessibility.summary.title', 'Current Settings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {settings.highContrast && (
                  <Badge variant="secondary">
                    {t('accessibility.high_contrast.title', 'High Contrast')}
                  </Badge>
                )}
                {settings.reducedMotion && (
                  <Badge variant="secondary">
                    {t('accessibility.reduced_motion.title', 'Reduced Motion')}
                  </Badge>
                )}
                {settings.focusVisible && (
                  <Badge variant="secondary">
                    {t('accessibility.focus_visible.title', 'Focus Indicators')}
                  </Badge>
                )}
                {settings.screenReaderAnnouncements && (
                  <Badge variant="secondary">
                    {t('accessibility.announcements.title', 'Live Announcements')}
                  </Badge>
                )}
                <Badge variant="outline">
                  {t('accessibility.font_size.title', 'Font Size')}: {' '}
                  {fontSizeOptions.find(opt => opt.value === settings.fontSize)?.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <ScreenReaderOnly>
          {t('accessibility.settings.instructions', 'Use Tab to navigate between settings. Press Space or Enter to toggle switches.')}
        </ScreenReaderOnly>
      </DialogContent>
    </Dialog>
  );
}