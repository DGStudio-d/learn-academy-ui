export interface HelpItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  role?: 'admin' | 'teacher' | 'student' | 'guest';
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'focus' | 'none';
  content: React.ReactNode;
  skippable?: boolean;
  required?: boolean;
  role?: 'admin' | 'teacher' | 'student';
  order: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  role?: 'admin' | 'teacher' | 'student' | 'guest';
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserManualSection {
  id: string;
  title: string;
  content: string;
  subsections?: UserManualSection[];
  role?: 'admin' | 'teacher' | 'student' | 'guest';
  order: number;
}

export interface HelpContextType {
  isHelpVisible: boolean;
  currentOnboardingStep: number;
  completedOnboardingSteps: string[];
  showHelp: () => void;
  hideHelp: () => void;
  toggleHelp: () => void;
  startOnboarding: (role?: string) => void;
  nextOnboardingStep: () => void;
  previousOnboardingStep: () => void;
  skipOnboarding: () => void;
  completeOnboardingStep: (stepId: string) => void;
  isOnboardingComplete: (role?: string) => boolean;
  resetOnboarding: (role?: string) => void;
}

export interface TooltipConfig {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  role?: 'admin' | 'teacher' | 'student' | 'guest';
  page?: string; // Page where tooltip should appear
  priority?: number;
  dismissible?: boolean;
}