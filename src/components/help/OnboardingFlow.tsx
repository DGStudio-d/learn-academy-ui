import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, CheckCircle, SkipForward } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useHelp } from './HelpContext';
import type { OnboardingStep } from './types';

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  steps,
  onComplete,
  onSkip
}) => {
  const { user } = useAuth();
  const {
    isHelpVisible,
    currentOnboardingStep,
    completedOnboardingSteps,
    nextOnboardingStep,
    previousOnboardingStep,
    skipOnboarding,
    completeOnboardingStep,
    hideHelp
  } = useHelp();

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Filter steps by user role
  const roleSteps = steps.filter(step => 
    !step.role || !user || step.role === user.role
  ).sort((a, b) => a.order - b.order);

  const currentStep = roleSteps[currentOnboardingStep];
  const isLastStep = currentOnboardingStep >= roleSteps.length - 1;
  const progress = ((currentOnboardingStep + 1) / roleSteps.length) * 100;

  // Update target element and position when step changes
  useEffect(() => {
    if (!currentStep || !isHelpVisible) return;

    if (currentStep.target) {
      const element = document.querySelector(currentStep.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        updatePosition(element);
        
        // Scroll element into view
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });

        // Add highlight class
        element.classList.add('onboarding-highlight');
        
        return () => {
          element.classList.remove('onboarding-highlight');
        };
      }
    } else {
      setTargetElement(null);
      // Center the card if no target
      updatePosition(null);
    }
  }, [currentStep, isHelpVisible, currentOnboardingStep]);

  const updatePosition = (element: HTMLElement | null) => {
    if (!cardRef.current) return;

    const cardRect = cardRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let top = 0;
    let left = 0;

    if (element) {
      const targetRect = element.getBoundingClientRect();
      
      switch (currentStep?.position || 'bottom') {
        case 'top':
          top = targetRect.top - cardRect.height - 20;
          left = targetRect.left + (targetRect.width - cardRect.width) / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + 20;
          left = targetRect.left + (targetRect.width - cardRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - cardRect.height) / 2;
          left = targetRect.left - cardRect.width - 20;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - cardRect.height) / 2;
          left = targetRect.right + 20;
          break;
      }
    } else {
      // Center the card
      top = (viewport.height - cardRect.height) / 2;
      left = (viewport.width - cardRect.width) / 2;
    }

    // Ensure card stays within viewport
    if (left < 20) left = 20;
    if (left + cardRect.width > viewport.width - 20) {
      left = viewport.width - cardRect.width - 20;
    }
    if (top < 20) top = 20;
    if (top + cardRect.height > viewport.height - 20) {
      top = viewport.height - cardRect.height - 20;
    }

    setPosition({ top, left });
  };

  const handleNext = () => {
    if (currentStep) {
      completeOnboardingStep(currentStep.id);
      
      if (isLastStep) {
        handleComplete();
      } else {
        nextOnboardingStep();
      }
    }
  };

  const handlePrevious = () => {
    if (currentOnboardingStep > 0) {
      previousOnboardingStep();
    }
  };

  const handleSkip = () => {
    skipOnboarding();
    if (onSkip) onSkip();
  };

  const handleComplete = () => {
    hideHelp();
    if (onComplete) onComplete();
    
    // Track completion
    window.dispatchEvent(new CustomEvent('help:onboarding_completed', {
      detail: { 
        role: user?.role, 
        stepsCompleted: completedOnboardingSteps.length,
        timestamp: new Date().toISOString()
      }
    }));
  };

  const handleTargetAction = () => {
    if (!currentStep?.action || !targetElement) return;

    switch (currentStep.action) {
      case 'click':
        targetElement.click();
        break;
      case 'focus':
        targetElement.focus();
        break;
      case 'hover':
        targetElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        break;
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (targetElement) {
        updatePosition(targetElement);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [targetElement, currentStep]);

  if (!isHelpVisible || !currentStep || roleSteps.length === 0) {
    return null;
  }

  const overlay = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
    >
      {/* Spotlight effect for target element */}
      {targetElement && (
        <div
          className="absolute border-4 border-primary rounded-lg shadow-lg pointer-events-none animate-pulse"
          style={{
            top: targetElement.getBoundingClientRect().top - 8,
            left: targetElement.getBoundingClientRect().left - 8,
            width: targetElement.getBoundingClientRect().width + 16,
            height: targetElement.getBoundingClientRect().height + 16,
          }}
        />
      )}

      {/* Onboarding card */}
      <div
        ref={cardRef}
        className="absolute animate-in fade-in-0 zoom-in-95 duration-300"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <Card className="w-96 max-w-[90vw] shadow-2xl border-2 border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-xs">
                Step {currentOnboardingStep + 1} of {roleSteps.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-6 w-6 p-0"
                aria-label="Skip onboarding"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <Progress value={progress} className="mb-3" />
            
            <CardTitle 
              id="onboarding-title"
              className="text-lg font-semibold flex items-center gap-2"
            >
              {completedOnboardingSteps.includes(currentStep.id) && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {currentStep.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p 
              id="onboarding-description"
              className="text-sm text-muted-foreground"
            >
              {currentStep.description}
            </p>

            {/* Step content */}
            <div className="text-sm">
              {currentStep.content}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentOnboardingStep === 0}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Previous
                </Button>

                {currentStep.skippable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="flex items-center gap-1"
                  >
                    <SkipForward className="h-3 w-3" />
                    Skip Tour
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {currentStep.action && targetElement && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTargetAction}
                    className="text-xs"
                  >
                    Try it
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  {isLastStep ? 'Complete' : 'Next'}
                  {!isLastStep && <ChevronRight className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Arrow pointing to target element */}
        {targetElement && (
          <div
            className={`absolute w-4 h-4 bg-background border-l border-t border-primary/20 transform rotate-45 ${
              currentStep.position === 'bottom' ? '-top-2 left-1/2 -translate-x-1/2' :
              currentStep.position === 'top' ? '-bottom-2 left-1/2 -translate-x-1/2' :
              currentStep.position === 'right' ? '-left-2 top-1/2 -translate-y-1/2' :
              '-right-2 top-1/2 -translate-y-1/2'
            }`}
          />
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};

// Predefined onboarding steps for different roles
export const getOnboardingSteps = (role: string): OnboardingStep[] => {
  const baseSteps: Record<string, OnboardingStep[]> = {
    student: [
      {
        id: 'student-welcome',
        title: 'Welcome to Learn Academy!',
        description: 'Let\'s take a quick tour to help you get started with your learning journey.',
        content: (
          <div className="space-y-2">
            <p>As a student, you can:</p>
            <ul className="list-disc list-inside text-xs space-y-1 ml-2">
              <li>Access your enrolled programs</li>
              <li>Take quizzes and track your progress</li>
              <li>Join scheduled meetings with teachers</li>
              <li>View your achievements and certificates</li>
            </ul>
          </div>
        ),
        order: 1,
        role: 'student'
      },
      {
        id: 'student-dashboard',
        title: 'Your Dashboard',
        description: 'This is your personal dashboard where you can see all your learning activities.',
        target: '[data-testid="student-dashboard"]',
        position: 'bottom',
        content: (
          <p>Your dashboard shows your enrolled programs, recent quiz attempts, upcoming meetings, and overall progress.</p>
        ),
        order: 2,
        role: 'student'
      },
      {
        id: 'student-programs',
        title: 'Your Programs',
        description: 'View and access all the programs you\'re enrolled in.',
        target: '[data-testid="enrolled-programs"]',
        position: 'right',
        content: (
          <p>Click on any program to see available quizzes, meetings, and your progress within that program.</p>
        ),
        action: 'click',
        order: 3,
        role: 'student'
      },
      {
        id: 'student-profile',
        title: 'Your Profile',
        description: 'Manage your personal information and preferences.',
        target: '[data-testid="user-profile-link"]',
        position: 'left',
        content: (
          <p>Update your profile picture, contact information, and language preferences here.</p>
        ),
        order: 4,
        role: 'student'
      }
    ],
    teacher: [
      {
        id: 'teacher-welcome',
        title: 'Welcome, Teacher!',
        description: 'Let\'s explore the tools available to help you create engaging learning experiences.',
        content: (
          <div className="space-y-2">
            <p>As a teacher, you can:</p>
            <ul className="list-disc list-inside text-xs space-y-1 ml-2">
              <li>Create and manage quizzes</li>
              <li>Schedule and conduct meetings</li>
              <li>Track student progress</li>
              <li>Manage your programs and content</li>
            </ul>
          </div>
        ),
        order: 1,
        role: 'teacher'
      },
      {
        id: 'teacher-dashboard',
        title: 'Teacher Dashboard',
        description: 'Your central hub for managing all teaching activities.',
        target: '[data-testid="teacher-dashboard"]',
        position: 'bottom',
        content: (
          <p>See your programs, student statistics, recent activities, and quick access to content creation tools.</p>
        ),
        order: 2,
        role: 'teacher'
      },
      {
        id: 'teacher-quiz-builder',
        title: 'Quiz Builder',
        description: 'Create engaging quizzes for your students.',
        target: '[data-testid="quiz-builder-link"]',
        position: 'right',
        content: (
          <p>Use our intuitive quiz builder to create multiple choice, true/false, and other question types.</p>
        ),
        action: 'click',
        order: 3,
        role: 'teacher'
      },
      {
        id: 'teacher-meetings',
        title: 'Meeting Scheduler',
        description: 'Schedule and manage virtual meetings with your students.',
        target: '[data-testid="meeting-scheduler"]',
        position: 'bottom',
        content: (
          <p>Create one-time or recurring meetings, invite students, and manage meeting resources.</p>
        ),
        order: 4,
        role: 'teacher'
      },
      {
        id: 'teacher-analytics',
        title: 'Student Analytics',
        description: 'Track your students\' progress and performance.',
        target: '[data-testid="student-analytics"]',
        position: 'left',
        content: (
          <p>View detailed analytics about quiz performance, meeting attendance, and overall student progress.</p>
        ),
        order: 5,
        role: 'teacher'
      },
      {
        id: 'teacher-content',
        title: 'Content Management',
        description: 'Organize and manage all your teaching materials.',
        target: '[data-testid="content-management"]',
        position: 'bottom',
        content: (
          <p>Upload resources, organize content by program, and share materials with your students.</p>
        ),
        order: 6,
        role: 'teacher'
      }
    ],
    admin: [
      {
        id: 'admin-welcome',
        title: 'Admin Control Center',
        description: 'Welcome to the administrative interface. Let\'s explore your management capabilities.',
        content: (
          <div className="space-y-2">
            <p>As an administrator, you can:</p>
            <ul className="list-disc list-inside text-xs space-y-1 ml-2">
              <li>Manage users and enrollments</li>
              <li>Configure system settings</li>
              <li>Monitor system health</li>
              <li>Generate reports and analytics</li>
            </ul>
          </div>
        ),
        order: 1,
        role: 'admin'
      },
      {
        id: 'admin-dashboard',
        title: 'Admin Dashboard',
        description: 'Your overview of the entire system\'s status and metrics.',
        target: '[data-testid="admin-dashboard"]',
        position: 'bottom',
        content: (
          <p>Monitor user activity, system performance, and key metrics at a glance.</p>
        ),
        order: 2,
        role: 'admin'
      },
      {
        id: 'admin-users',
        title: 'User Management',
        description: 'Manage all users in the system.',
        target: '[data-testid="user-management"]',
        position: 'right',
        content: (
          <p>Create, edit, and manage user accounts. Handle role assignments and user permissions.</p>
        ),
        action: 'click',
        order: 3,
        role: 'admin'
      },
      {
        id: 'admin-enrollments',
        title: 'Enrollment Management',
        description: 'Review and manage student enrollments.',
        target: '[data-testid="enrollment-management"]',
        position: 'bottom',
        content: (
          <p>Approve or reject enrollment requests, manage bulk enrollments, and track enrollment statistics.</p>
        ),
        order: 4,
        role: 'admin'
      },
      {
        id: 'admin-settings',
        title: 'System Settings',
        description: 'Configure global system settings and preferences.',
        target: '[data-testid="system-settings"]',
        position: 'left',
        content: (
          <p>Manage site configuration, notification settings, and system-wide preferences.</p>
        ),
        order: 5,
        role: 'admin'
      },
      {
        id: 'admin-health',
        title: 'System Health',
        description: 'Monitor system performance and health metrics.',
        target: '[data-testid="system-health"]',
        position: 'bottom',
        content: (
          <p>View server status, database performance, and system resource usage in real-time.</p>
        ),
        order: 6,
        role: 'admin'
      },
      {
        id: 'admin-reports',
        title: 'Reports & Analytics',
        description: 'Generate comprehensive reports and view system analytics.',
        target: '[data-testid="reports-analytics"]',
        position: 'top',
        content: (
          <p>Create custom reports, export data, and analyze system usage patterns.</p>
        ),
        order: 7,
        role: 'admin'
      },
      {
        id: 'admin-backup',
        title: 'Backup & Maintenance',
        description: 'Manage system backups and maintenance tasks.',
        target: '[data-testid="backup-maintenance"]',
        position: 'left',
        content: (
          <p>Schedule backups, perform maintenance tasks, and manage system updates.</p>
        ),
        order: 8,
        role: 'admin'
      }
    ]
  };

  return baseSteps[role] || [];
};