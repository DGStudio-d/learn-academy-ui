// Accessibility Components and Utilities
export { AccessibilityProvider, useAccessibility } from './AccessibilityProvider';
export { FocusManager, useFocusManagement } from './FocusManager';
export { 
  KeyboardNavigation, 
  useKeyboardShortcuts, 
  SkipLink, 
  KeyboardHints 
} from './KeyboardNavigation';
export { 
  ScreenReaderOnly, 
  VisualOnly, 
  LiveRegion, 
  StatusMessage, 
  AccessibleProgress, 
  AccessibleLoading, 
  AccessibleBreadcrumb 
} from './ScreenReaderContent';
export { AccessibilitySettings } from './AccessibilitySettings';
export { AccessibilityToolbar } from './AccessibilityToolbar';

// Accessibility Hooks
export { 
  useAccessibilityFeatures, 
  useFormAccessibility, 
  useTableAccessibility 
} from '../../hooks/useAccessibilityFeatures';

// Types
export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusVisible: boolean;
  screenReaderAnnouncements: boolean;
}

export interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  isReducedMotion: boolean;
  isHighContrast: boolean;
}