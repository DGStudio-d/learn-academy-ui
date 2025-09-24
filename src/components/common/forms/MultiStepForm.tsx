import React, { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface FormStep<T = any> {
  id: string;
  title: string;
  description?: string;
  schema: z.ZodSchema<T>;
  component: React.ComponentType<{
    data: Partial<T>;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    setFieldValue: (name: keyof T, value: any) => void;
    setFieldError: (name: keyof T, error: string | null) => void;
    setFieldTouched: (name: keyof T, touched?: boolean) => void;
    getFieldProps: (name: keyof T) => any;
    isValid: boolean;
    isDirty: boolean;
  }>;
  optional?: boolean;
  condition?: (data: any) => boolean; // Conditional step visibility
}

export interface MultiStepFormProps<T extends Record<string, any>> {
  steps: FormStep<any>[];
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  onStepChange?: (stepIndex: number, stepId: string) => void;
  onAutoSave?: (data: Partial<T>, stepIndex: number) => Promise<void>;
  autoSaveInterval?: number;
  storageKey?: string;
  className?: string;
  title?: string;
  description?: string;
  showProgress?: boolean;
  allowSkipOptional?: boolean;
  validateOnStepChange?: boolean;
  persistProgress?: boolean;
}

interface StepValidation {
  isValid: boolean;
  errors: Record<string, string>;
  data: any;
}

export function MultiStepForm<T extends Record<string, any>>({
  steps,
  initialData = {},
  onSubmit,
  onStepChange,
  onAutoSave,
  autoSaveInterval = 30000,
  storageKey,
  className,
  title,
  description,
  showProgress = true,
  allowSkipOptional = true,
  validateOnStepChange = true,
  persistProgress = true,
}: MultiStepFormProps<T>) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<T>>(initialData);
  const [stepValidations, setStepValidations] = useState<Record<string, StepValidation>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Filter steps based on conditions
  const visibleSteps = steps.filter(step => 
    !step.condition || step.condition(formData)
  );

  const currentStep = visibleSteps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === visibleSteps.length - 1;

  // Load saved progress
  useEffect(() => {
    if (persistProgress && storageKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`${storageKey}-progress`);
        if (saved) {
          const { data, stepIndex, completed } = JSON.parse(saved);
          setFormData({ ...initialData, ...data });
          setCurrentStepIndex(Math.min(stepIndex, visibleSteps.length - 1));
          setCompletedSteps(new Set(completed));
        }
      } catch (error) {
        console.warn('Failed to load saved progress:', error);
      }
    }
  }, [persistProgress, storageKey, initialData, visibleSteps.length]);

  // Save progress
  const saveProgress = useCallback(() => {
    if (persistProgress && storageKey && typeof window !== 'undefined') {
      try {
        const progressData = {
          data: formData,
          stepIndex: currentStepIndex,
          completed: Array.from(completedSteps),
        };
        localStorage.setItem(`${storageKey}-progress`, JSON.stringify(progressData));
      } catch (error) {
        console.warn('Failed to save progress:', error);
      }
    }
  }, [persistProgress, storageKey, formData, currentStepIndex, completedSteps]);

  // Auto-save functionality
  useEffect(() => {
    if (!onAutoSave) return;

    const interval = setInterval(async () => {
      if (Object.keys(formData).length > 0) {
        setAutoSaveStatus('saving');
        try {
          await onAutoSave(formData, currentStepIndex);
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 3000);
        } catch (error) {
          setAutoSaveStatus('error');
          setTimeout(() => setAutoSaveStatus('idle'), 5000);
        }
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [onAutoSave, formData, currentStepIndex, autoSaveInterval]);

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    if (!currentStep) return { isValid: false, errors: {}, data: {} };

    try {
      const stepData = currentStep.schema.parse(formData);
      const validation = { isValid: true, errors: {}, data: stepData };
      setStepValidations(prev => ({ ...prev, [currentStep.id]: validation }));
      return validation;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        const validation = { isValid: false, errors, data: {} };
        setStepValidations(prev => ({ ...prev, [currentStep.id]: validation }));
        return validation;
      }
      return { isValid: false, errors: { general: 'Validation failed' }, data: {} };
    }
  }, [currentStep, formData]);

  // Update field value
  const setFieldValue = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Set field error (for custom validation)
  const setFieldError = useCallback((name: string, error: string | null) => {
    setStepValidations(prev => ({
      ...prev,
      [currentStep?.id || '']: {
        ...prev[currentStep?.id || ''],
        errors: error 
          ? { ...prev[currentStep?.id || '']?.errors, [name]: error }
          : { ...prev[currentStep?.id || '']?.errors, [name]: undefined }
      }
    }));
  }, [currentStep?.id]);

  // Set field touched
  const setFieldTouched = useCallback((name: string, touched = true) => {
    // Implementation can be added if needed for touched state tracking
  }, []);

  // Get field props
  const getFieldProps = useCallback((name: string) => {
    const validation = stepValidations[currentStep?.id || ''];
    return {
      name,
      value: formData[name] || '',
      onChange: (value: any) => setFieldValue(name, value),
      error: validation?.errors?.[name],
    };
  }, [formData, stepValidations, currentStep?.id, setFieldValue]);

  // Navigate to step
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= visibleSteps.length) return;

    // Validate current step if moving forward
    if (stepIndex > currentStepIndex && validateOnStepChange) {
      const validation = validateCurrentStep();
      if (!validation.isValid && !currentStep?.optional) {
        toast({
          title: 'Validation Error',
          description: 'Please fix the errors in the current step before proceeding.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Mark current step as completed if valid
    if (stepIndex > currentStepIndex) {
      const validation = validateCurrentStep();
      if (validation.isValid || currentStep?.optional) {
        setCompletedSteps(prev => new Set([...prev, currentStep?.id || '']));
      }
    }

    setCurrentStepIndex(stepIndex);
    saveProgress();
    onStepChange?.(stepIndex, visibleSteps[stepIndex]?.id);
  }, [currentStepIndex, validateOnStepChange, validateCurrentStep, currentStep, visibleSteps, saveProgress, onStepChange]);

  // Next step
  const nextStep = useCallback(() => {
    goToStep(currentStepIndex + 1);
  }, [currentStepIndex, goToStep]);

  // Previous step
  const previousStep = useCallback(() => {
    goToStep(currentStepIndex - 1);
  }, [currentStepIndex, goToStep]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    // Validate all steps
    const allValidations: Record<string, StepValidation> = {};
    let hasErrors = false;

    for (const step of visibleSteps) {
      try {
        const stepData = step.schema.parse(formData);
        allValidations[step.id] = { isValid: true, errors: {}, data: stepData };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, string> = {};
          error.errors.forEach((err) => {
            const path = err.path.join('.');
            errors[path] = err.message;
          });
          allValidations[step.id] = { isValid: false, errors, data: {} };
          if (!step.optional) {
            hasErrors = true;
          }
        }
      }
    }

    setStepValidations(allValidations);

    if (hasErrors) {
      // Find first step with errors
      const firstErrorStepIndex = visibleSteps.findIndex(
        step => !allValidations[step.id]?.isValid && !step.optional
      );
      if (firstErrorStepIndex !== -1) {
        setCurrentStepIndex(firstErrorStepIndex);
        toast({
          title: 'Validation Error',
          description: 'Please fix the errors in the form before submitting.',
          variant: 'destructive',
        });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData as T);
      
      // Clear saved progress on successful submission
      if (persistProgress && storageKey && typeof window !== 'undefined') {
        localStorage.removeItem(`${storageKey}-progress`);
      }
      
      toast({
        title: 'Success',
        description: 'Form submitted successfully!',
      });
    } catch (error) {
      console.error('Form submission failed:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting the form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [visibleSteps, formData, onSubmit, persistProgress, storageKey]);

  // Calculate progress
  const progress = ((currentStepIndex + 1) / visibleSteps.length) * 100;
  const completedCount = completedSteps.size;

  const currentValidation = stepValidations[currentStep?.id || ''] || { isValid: false, errors: {}, data: {} };

  if (!currentStep) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No steps available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            {title && <CardTitle className="text-xl font-semibold">{title}</CardTitle>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {autoSaveStatus === 'saving' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Save className="h-3 w-3 animate-spin" />
                Saving...
              </Badge>
            )}
            {autoSaveStatus === 'saved' && (
              <Badge variant="default" className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                Saved
              </Badge>
            )}
            {autoSaveStatus === 'error' && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Save failed
              </Badge>
            )}
          </div>
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Step {currentStepIndex + 1} of {visibleSteps.length}</span>
              <span>{completedCount} completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {visibleSteps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = index === currentStepIndex;
            const hasErrors = !stepValidations[step.id]?.isValid && stepValidations[step.id]?.errors;
            
            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring',
                    isCurrent && 'bg-primary text-primary-foreground',
                    isCompleted && !isCurrent && 'bg-muted text-muted-foreground',
                    hasErrors && !isCurrent && 'bg-destructive/10 text-destructive'
                  )}
                  disabled={index > currentStepIndex && validateOnStepChange}
                >
                  <div className={cn(
                    'flex items-center justify-center w-5 h-5 rounded-full text-xs',
                    isCurrent && 'bg-primary-foreground text-primary',
                    isCompleted && !isCurrent && 'bg-primary text-primary-foreground',
                    hasErrors && !isCurrent && 'bg-destructive text-destructive-foreground'
                  )}>
                    {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                  </div>
                  <span className="whitespace-nowrap">{step.title}</span>
                  {step.optional && (
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  )}
                </button>
                {index < visibleSteps.length - 1 && (
                  <Separator orientation="vertical" className="h-6" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current step content */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium">{currentStep.title}</h3>
            {currentStep.description && (
              <p className="text-sm text-muted-foreground">{currentStep.description}</p>
            )}
          </div>

          <currentStep.component
            data={formData}
            errors={currentValidation.errors}
            touched={{}} // Can be implemented if needed
            setFieldValue={setFieldValue}
            setFieldError={setFieldError}
            setFieldTouched={setFieldTouched}
            getFieldProps={getFieldProps}
            isValid={currentValidation.isValid}
            isDirty={Object.keys(formData).length > 0}
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={previousStep}
            disabled={isFirstStep}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {allowSkipOptional && currentStep.optional && !isLastStep && (
              <Button
                type="button"
                variant="ghost"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Skip
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            
            {isLastStep ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
                <Check className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}