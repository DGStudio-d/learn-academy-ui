import React, { useEffect, useRef, useCallback } from 'react';
import { z } from 'zod';
import { useForm } from '@/hooks/useForm';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface AutoSaveFormProps<T extends Record<string, any>> {
  schema: z.ZodSchema<T>;
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  onAutoSave?: (data: Partial<T>) => Promise<void>;
  autoSaveInterval?: number; // in milliseconds
  autoSaveDelay?: number; // debounce delay in milliseconds
  storageKey?: string; // for localStorage persistence
  className?: string;
  title?: string;
  description?: string;
  children: (formProps: {
    data: Partial<T>;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isValid: boolean;
    isSubmitting: boolean;
    isDirty: boolean;
    setFieldValue: (name: keyof T, value: any) => void;
    setFieldError: (name: keyof T, error: string | null) => void;
    setFieldTouched: (name: keyof T, touched?: boolean) => void;
    getFieldProps: (name: keyof T) => any;
    handleSubmit: (event?: React.FormEvent) => Promise<void>;
    reset: (newData?: Partial<T>) => void;
    autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
    lastSaved?: Date;
  }) => React.ReactNode;
}

export function AutoSaveForm<T extends Record<string, any>>({
  schema,
  initialData = {},
  onSubmit,
  onAutoSave,
  autoSaveInterval = 30000, // 30 seconds
  autoSaveDelay = 2000, // 2 seconds debounce
  storageKey,
  className,
  title,
  description,
  children,
}: AutoSaveFormProps<T>) {
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = React.useState<Date>();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');

  // Load initial data from localStorage if available
  const getInitialData = useCallback(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedData = JSON.parse(saved);
          return { ...initialData, ...parsedData };
        }
      } catch (error) {
        console.warn('Failed to load auto-saved data:', error);
      }
    }
    return initialData;
  }, [initialData, storageKey]);

  const form = useForm({
    schema,
    initialData: getInitialData(),
    onSubmit: async (data) => {
      await onSubmit(data);
      // Clear auto-saved data after successful submission
      if (storageKey && typeof window !== 'undefined') {
        localStorage.removeItem(storageKey);
      }
      setAutoSaveStatus('idle');
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  // Auto-save function
  const performAutoSave = useCallback(async (data: Partial<T>) => {
    if (!onAutoSave && !storageKey) return;

    const dataString = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (dataString === lastDataRef.current) return;
    
    lastDataRef.current = dataString;
    setAutoSaveStatus('saving');

    try {
      // Save to localStorage if key provided
      if (storageKey && typeof window !== 'undefined') {
        localStorage.setItem(storageKey, dataString);
      }

      // Call custom auto-save function if provided
      if (onAutoSave) {
        await onAutoSave(data);
      }

      setAutoSaveStatus('saved');
      setLastSaved(new Date());
      
      // Reset status after a delay
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
      
      toast({
        title: 'Auto-save Failed',
        description: 'Your changes could not be automatically saved. Please save manually.',
        variant: 'destructive',
      });
      
      // Reset error status after a delay
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 5000);
    }
  }, [onAutoSave, storageKey]);

  // Debounced auto-save on data change
  useEffect(() => {
    if (!form.isDirty) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave(form.data);
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [form.data, form.isDirty, performAutoSave, autoSaveDelay]);

  // Periodic auto-save
  useEffect(() => {
    if (!form.isDirty || !onAutoSave) return;

    intervalRef.current = setInterval(() => {
      performAutoSave(form.data);
    }, autoSaveInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [form.isDirty, performAutoSave, autoSaveInterval, onAutoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Manual save function
  const handleManualSave = useCallback(async () => {
    if (!form.isDirty) return;
    await performAutoSave(form.data);
  }, [form.isDirty, form.data, performAutoSave]);

  const renderAutoSaveStatus = () => {
    const statusConfig = {
      idle: { icon: null, text: '', variant: 'secondary' as const },
      saving: { icon: Clock, text: 'Saving...', variant: 'secondary' as const },
      saved: { icon: CheckCircle, text: 'Saved', variant: 'default' as const },
      error: { icon: AlertCircle, text: 'Save failed', variant: 'destructive' as const },
    };

    const config = statusConfig[autoSaveStatus];
    if (!config.icon) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    return lastSaved.toLocaleTimeString();
  };

  return (
    <Card className={cn('w-full', className)}>
      {(title || description) && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            <div className="flex items-center gap-2">
              {renderAutoSaveStatus()}
              {onAutoSave && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleManualSave}
                  disabled={!form.isDirty || autoSaveStatus === 'saving'}
                  className="flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  Save
                </Button>
              )}
            </div>
          </div>
          {lastSaved && (
            <p className="text-xs text-muted-foreground">
              Last saved: {formatLastSaved()}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent>
        <form onSubmit={form.handleSubmit} className="space-y-4">
          {children({
            ...form,
            autoSaveStatus,
            lastSaved,
          })}
        </form>
      </CardContent>
    </Card>
  );
}

// Hook for using auto-save functionality without the Card wrapper
export function useAutoSave<T extends Record<string, any>>(
  options: Omit<AutoSaveFormProps<T>, 'children' | 'className' | 'title' | 'description'>
) {
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = React.useState<Date>();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');

  const {
    schema,
    initialData = {},
    onSubmit,
    onAutoSave,
    autoSaveInterval = 30000,
    autoSaveDelay = 2000,
    storageKey,
  } = options;

  // Load initial data from localStorage if available
  const getInitialData = useCallback(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedData = JSON.parse(saved);
          return { ...initialData, ...parsedData };
        }
      } catch (error) {
        console.warn('Failed to load auto-saved data:', error);
      }
    }
    return initialData;
  }, [initialData, storageKey]);

  const form = useForm({
    schema,
    initialData: getInitialData(),
    onSubmit: async (data) => {
      await onSubmit(data);
      if (storageKey && typeof window !== 'undefined') {
        localStorage.removeItem(storageKey);
      }
      setAutoSaveStatus('idle');
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  // Auto-save function
  const performAutoSave = useCallback(async (data: Partial<T>) => {
    if (!onAutoSave && !storageKey) return;

    const dataString = JSON.stringify(data);
    if (dataString === lastDataRef.current) return;
    
    lastDataRef.current = dataString;
    setAutoSaveStatus('saving');

    try {
      if (storageKey && typeof window !== 'undefined') {
        localStorage.setItem(storageKey, dataString);
      }

      if (onAutoSave) {
        await onAutoSave(data);
      }

      setAutoSaveStatus('saved');
      setLastSaved(new Date());
      
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
      
      toast({
        title: 'Auto-save Failed',
        description: 'Your changes could not be automatically saved. Please save manually.',
        variant: 'destructive',
      });
      
      setTimeout(() => setAutoSaveStatus('idle'), 5000);
    }
  }, [onAutoSave, storageKey]);

  // Debounced auto-save on data change
  useEffect(() => {
    if (!form.isDirty) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave(form.data);
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [form.data, form.isDirty, performAutoSave, autoSaveDelay]);

  // Periodic auto-save
  useEffect(() => {
    if (!form.isDirty || !onAutoSave) return;

    intervalRef.current = setInterval(() => {
      performAutoSave(form.data);
    }, autoSaveInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [form.isDirty, performAutoSave, autoSaveInterval, onAutoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...form,
    autoSaveStatus,
    lastSaved,
    performAutoSave: () => performAutoSave(form.data),
  };
}