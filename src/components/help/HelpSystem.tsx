import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  X, 
  MessageCircle, 
  Book, 
  Play, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/AuthContext';
import { useHelp } from './HelpContext';
import { ContextualTooltip, useContextualTooltips } from './ContextualTooltip';
import { OnboardingFlow, getOnboardingSteps } from './OnboardingFlow';
import { FAQSection } from './FAQSection';
import { UserManual } from './UserManual';
import type { TooltipConfig } from './types';

interface HelpSystemProps {
  className?: string;
}

// Default contextual tooltips for different pages and roles
const defaultTooltips: TooltipConfig[] = [
  // Dashboard tooltips
  {
    id: 'dashboard-stats',
    target: '[data-testid="dashboard-stats"]',
    title: 'Dashboard Statistics',
    content: 'This section shows your key metrics and recent activity. Click on any stat to see more details.',
    position: 'bottom',
    role: 'student',
    page: 'dashboard',
    priority: 1
  },
  {
    id: 'quick-actions',
    target: '[data-testid="quick-actions"]',
    title: 'Quick Actions',
    content: 'Use these buttons to quickly access common tasks like taking quizzes or joining meetings.',
    position: 'left',
    role: 'student',
    page: 'dashboard',
    priority: 2
  },
  {
    id: 'teacher-content-tools',
    target: '[data-testid="content-creation-tools"]',
    title: 'Content Creation Tools',
    content: 'Create quizzes, schedule meetings, and manage your teaching materials from here.',
    position: 'bottom',
    role: 'teacher',
    page: 'dashboard',
    priority: 1
  },
  {
    id: 'admin-system-health',
    target: '[data-testid="system-health-widget"]',
    title: 'System Health Monitor',
    content: 'Keep an eye on system performance and health metrics. Click for detailed monitoring.',
    position: 'left',
    role: 'admin',
    page: 'dashboard',
    priority: 1
  },

  // Navigation tooltips
  {
    id: 'profile-menu',
    target: '[data-testid="user-profile-menu"]',
    title: 'Profile Menu',
    content: 'Access your profile settings, preferences, and account options.',
    position: 'bottom',
    trigger: 'hover',
    priority: 3
  },
  {
    id: 'notifications-bell',
    target: '[data-testid="notifications-bell"]',
    title: 'Notifications',
    content: 'View your recent notifications and system alerts.',
    position: 'bottom',
    trigger: 'hover',
    priority: 4
  },

  // Quiz tooltips
  {
    id: 'quiz-timer',
    target: '[data-testid="quiz-timer"]',
    title: 'Quiz Timer',
    content: 'Keep track of your remaining time. Your progress is automatically saved.',
    position: 'bottom',
    role: 'student',
    page: 'quiz',
    priority: 1
  },
  {
    id: 'quiz-progress',
    target: '[data-testid="quiz-progress"]',
    title: 'Progress Indicator',
    content: 'See how many questions you\'ve completed and how many remain.',
    position: 'top',
    role: 'student',
    page: 'quiz',
    priority: 2
  }
];

export const HelpSystem: React.FC<HelpSystemProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { 
    isHelpVisible, 
    showHelp, 
    hideHelp, 
    startOnboarding, 
    isOnboardingComplete,
    resetOnboarding 
  } = useHelp();
  
  const [activeTab, setActiveTab] = useState('faq');
  const [helpSettings, setHelpSettings] = useState({
    showTooltips: true,
    autoStartOnboarding: true,
    showHelpButton: true,
    enableKeyboardShortcuts: true
  });

  // Manage contextual tooltips
  const { activeTooltips, dismissTooltip, resetTooltips } = useContextualTooltips(defaultTooltips);

  // Load help settings from localStorage
  useEffect(() => {
    if (user) {
      const storageKey = `help_settings_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setHelpSettings(JSON.parse(saved));
      }
    }
  }, [user]);

  // Save help settings to localStorage
  const saveHelpSettings = (newSettings: typeof helpSettings) => {
    setHelpSettings(newSettings);
    if (user) {
      const storageKey = `help_settings_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(newSettings));
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!helpSettings.enableKeyboardShortcuts) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // F1 or Ctrl+? to toggle help
      if (event.key === 'F1' || (event.ctrlKey && event.key === '?')) {
        event.preventDefault();
        if (isHelpVisible) {
          hideHelp();
        } else {
          showHelp();
        }
      }
      
      // Ctrl+Shift+O to start onboarding
      if (event.ctrlKey && event.shiftKey && event.key === 'O') {
        event.preventDefault();
        startOnboarding();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [helpSettings.enableKeyboardShortcuts, isHelpVisible, showHelp, hideHelp, startOnboarding]);

  const handleFAQFeedback = (faqId: string, helpful: boolean) => {
    // Track FAQ feedback
    console.log(`FAQ ${faqId} marked as ${helpful ? 'helpful' : 'not helpful'}`);
    
    // In a real implementation, this would send feedback to the server
    window.dispatchEvent(new CustomEvent('help:faq_feedback', {
      detail: { faqId, helpful, timestamp: new Date().toISOString() }
    }));
  };

  const onboardingSteps = user ? getOnboardingSteps(user.role) : [];

  return (
    <>
      {/* Floating Help Button */}
      {helpSettings.showHelpButton && (
        <Button
          onClick={showHelp}
          className={`fixed bottom-6 right-6 z-40 rounded-full h-12 w-12 shadow-lg ${className}`}
          size="sm"
          aria-label="Open help system"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      )}

      {/* Contextual Tooltips */}
      {helpSettings.showTooltips && activeTooltips.map(tooltip => (
        <ContextualTooltip
          key={tooltip.id}
          config={tooltip}
          onDismiss={dismissTooltip}
        />
      ))}

      {/* Onboarding Flow */}
      <OnboardingFlow
        steps={onboardingSteps}
        onComplete={() => {
          console.log('Onboarding completed');
        }}
        onSkip={() => {
          console.log('Onboarding skipped');
        }}
      />

      {/* Main Help Dialog */}
      <Dialog open={isHelpVisible} onOpenChange={(open) => open ? showHelp() : hideHelp()}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Help & Support
                {user && (
                  <Badge variant="outline" className="ml-2">
                    {user.role}
                  </Badge>
                )}
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={hideHelp}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="faq" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    FAQ
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    Manual
                  </TabsTrigger>
                  <TabsTrigger value="onboarding" className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Tutorial
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="faq" className="h-full m-0 p-6 overflow-auto">
                  <FAQSection onFeedback={handleFAQFeedback} />
                </TabsContent>

                <TabsContent value="manual" className="h-full m-0 overflow-hidden">
                  <UserManual />
                </TabsContent>

                <TabsContent value="onboarding" className="h-full m-0 p-6 overflow-auto">
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold">Interactive Tutorial</h3>
                      <p className="text-muted-foreground">
                        Take a guided tour of the platform features
                      </p>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Onboarding Status</span>
                          {isOnboardingComplete() ? (
                            <Badge variant="default">Completed</Badge>
                          ) : (
                            <Badge variant="secondary">In Progress</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {isOnboardingComplete() 
                            ? "You've completed the onboarding tutorial. You can restart it anytime to refresh your knowledge."
                            : "Complete the interactive tutorial to learn about all the features available to you."
                          }
                        </p>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              hideHelp();
                              startOnboarding();
                            }}
                            className="flex items-center gap-2"
                          >
                            <Play className="h-4 w-4" />
                            {isOnboardingComplete() ? 'Restart Tutorial' : 'Start Tutorial'}
                          </Button>
                          
                          {isOnboardingComplete() && (
                            <Button 
                              variant="outline"
                              onClick={() => resetOnboarding()}
                            >
                              Reset Progress
                            </Button>
                          )}
                        </div>

                        {onboardingSteps.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Tutorial Steps:</h4>
                            <div className="space-y-2">
                              {onboardingSteps.slice(0, 5).map((step, index) => (
                                <div key={step.id} className="flex items-center gap-2 text-sm">
                                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                    {index + 1}
                                  </div>
                                  <span>{step.title}</span>
                                </div>
                              ))}
                              {onboardingSteps.length > 5 && (
                                <div className="text-xs text-muted-foreground ml-8">
                                  +{onboardingSteps.length - 5} more steps
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="h-full m-0 p-6 overflow-auto">
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold">Help Settings</h3>
                      <p className="text-muted-foreground">
                        Customize your help and tutorial experience
                      </p>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Display Options</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Contextual Tooltips</Label>
                            <p className="text-xs text-muted-foreground">
                              Display helpful tooltips when hovering over interface elements
                            </p>
                          </div>
                          <Switch
                            checked={helpSettings.showTooltips}
                            onCheckedChange={(checked) => 
                              saveHelpSettings({ ...helpSettings, showTooltips: checked })
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Help Button</Label>
                            <p className="text-xs text-muted-foreground">
                              Display the floating help button in the bottom right corner
                            </p>
                          </div>
                          <Switch
                            checked={helpSettings.showHelpButton}
                            onCheckedChange={(checked) => 
                              saveHelpSettings({ ...helpSettings, showHelpButton: checked })
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Auto-start Onboarding</Label>
                            <p className="text-xs text-muted-foreground">
                              Automatically start the tutorial for new users
                            </p>
                          </div>
                          <Switch
                            checked={helpSettings.autoStartOnboarding}
                            onCheckedChange={(checked) => 
                              saveHelpSettings({ ...helpSettings, autoStartOnboarding: checked })
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Keyboard Shortcuts</Label>
                            <p className="text-xs text-muted-foreground">
                              Enable keyboard shortcuts (F1 for help, Ctrl+Shift+O for tutorial)
                            </p>
                          </div>
                          <Switch
                            checked={helpSettings.enableKeyboardShortcuts}
                            onCheckedChange={(checked) => 
                              saveHelpSettings({ ...helpSettings, enableKeyboardShortcuts: checked })
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Reset Options</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Reset Dismissed Tooltips</Label>
                            <p className="text-xs text-muted-foreground">
                              Show all contextual tooltips again
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={resetTooltips}>
                            Reset
                          </Button>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Reset Onboarding Progress</Label>
                            <p className="text-xs text-muted-foreground">
                              Clear onboarding completion status
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => resetOnboarding()}
                          >
                            Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {helpSettings.enableKeyboardShortcuts && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Keyboard Shortcuts</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Open/Close Help</span>
                              <Badge variant="outline">F1</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Start Tutorial</span>
                              <Badge variant="outline">Ctrl + Shift + O</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};