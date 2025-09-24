import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { HelpContextType } from './types';

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

interface HelpProviderProps {
  children: React.ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);
  const [completedOnboardingSteps, setCompletedOnboardingSteps] = useState<string[]>([]);

  // Load completed onboarding steps from localStorage
  useEffect(() => {
    if (user) {
      const storageKey = `onboarding_completed_${user.role}_${user.id}`;
      const completed = localStorage.getItem(storageKey);
      if (completed) {
        setCompletedOnboardingSteps(JSON.parse(completed));
      }
    }
  }, [user]);

  // Save completed onboarding steps to localStorage
  const saveCompletedSteps = useCallback((steps: string[]) => {
    if (user) {
      const storageKey = `onboarding_completed_${user.role}_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(steps));
      setCompletedOnboardingSteps(steps);
    }
  }, [user]);

  const showHelp = useCallback(() => {
    setIsHelpVisible(true);
  }, []);

  const hideHelp = useCallback(() => {
    setIsHelpVisible(false);
  }, []);

  const toggleHelp = useCallback(() => {
    setIsHelpVisible(prev => !prev);
  }, []);

  const startOnboarding = useCallback((role?: string) => {
    const targetRole = role || user?.role;
    if (targetRole) {
      setCurrentOnboardingStep(0);
      setIsHelpVisible(true);
      
      // Track onboarding start
      window.dispatchEvent(new CustomEvent('help:onboarding_started', {
        detail: { role: targetRole, timestamp: new Date().toISOString() }
      }));
    }
  }, [user]);

  const nextOnboardingStep = useCallback(() => {
    setCurrentOnboardingStep(prev => prev + 1);
  }, []);

  const previousOnboardingStep = useCallback(() => {
    setCurrentOnboardingStep(prev => Math.max(0, prev - 1));
  }, []);

  const skipOnboarding = useCallback(() => {
    if (user) {
      const storageKey = `onboarding_skipped_${user.role}_${user.id}`;
      localStorage.setItem(storageKey, 'true');
      setIsHelpVisible(false);
      setCurrentOnboardingStep(0);
      
      // Track onboarding skip
      window.dispatchEvent(new CustomEvent('help:onboarding_skipped', {
        detail: { role: user.role, timestamp: new Date().toISOString() }
      }));
    }
  }, [user]);

  const completeOnboardingStep = useCallback((stepId: string) => {
    const newCompleted = [...completedOnboardingSteps, stepId];
    saveCompletedSteps(newCompleted);
    
    // Track step completion
    window.dispatchEvent(new CustomEvent('help:onboarding_step_completed', {
      detail: { stepId, role: user?.role, timestamp: new Date().toISOString() }
    }));
  }, [completedOnboardingSteps, saveCompletedSteps, user]);

  const isOnboardingComplete = useCallback((role?: string) => {
    const targetRole = role || user?.role;
    if (!targetRole || !user) return false;
    
    // Check if user has skipped onboarding
    const storageKey = `onboarding_skipped_${targetRole}_${user.id}`;
    const hasSkipped = localStorage.getItem(storageKey) === 'true';
    
    if (hasSkipped) return true;
    
    // Check if all required steps are completed
    // This would be determined by the onboarding configuration for each role
    const requiredStepsCount = getRequiredStepsCount(targetRole);
    return completedOnboardingSteps.length >= requiredStepsCount;
  }, [user, completedOnboardingSteps]);

  const resetOnboarding = useCallback((role?: string) => {
    const targetRole = role || user?.role;
    if (targetRole && user) {
      const completedKey = `onboarding_completed_${targetRole}_${user.id}`;
      const skippedKey = `onboarding_skipped_${targetRole}_${user.id}`;
      
      localStorage.removeItem(completedKey);
      localStorage.removeItem(skippedKey);
      setCompletedOnboardingSteps([]);
      setCurrentOnboardingStep(0);
      
      // Track onboarding reset
      window.dispatchEvent(new CustomEvent('help:onboarding_reset', {
        detail: { role: targetRole, timestamp: new Date().toISOString() }
      }));
    }
  }, [user]);

  // Helper function to get required steps count for a role
  const getRequiredStepsCount = (role: string): number => {
    switch (role) {
      case 'admin':
        return 8; // Admin has 8 required onboarding steps
      case 'teacher':
        return 6; // Teacher has 6 required onboarding steps
      case 'student':
        return 4; // Student has 4 required onboarding steps
      default:
        return 0;
    }
  };

  // Auto-start onboarding for new users
  useEffect(() => {
    if (user && !isOnboardingComplete()) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding_seen_${user.role}_${user.id}`);
      if (!hasSeenOnboarding) {
        // Delay to allow page to load
        const timer = setTimeout(() => {
          startOnboarding();
          localStorage.setItem(`onboarding_seen_${user.role}_${user.id}`, 'true');
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user, isOnboardingComplete, startOnboarding]);

  const value: HelpContextType = {
    isHelpVisible,
    currentOnboardingStep,
    completedOnboardingSteps,
    showHelp,
    hideHelp,
    toggleHelp,
    startOnboarding,
    nextOnboardingStep,
    previousOnboardingStep,
    skipOnboarding,
    completeOnboardingStep,
    isOnboardingComplete,
    resetOnboarding,
  };

  return (
    <HelpContext.Provider value={value}>
      {children}
    </HelpContext.Provider>
  );
};