import React from 'react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { useForm } from '@/hooks/useForm';
import { FormField, FormFieldProps } from './FormField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export interface FormFieldConfig extends Omit<FormFieldProps, 'value' | 'onChange' | 'onBlur' | 'error'> {
  name: string;
  section?: string;
  dependencies?: string[]; // Fields this field depends on
  condition?: (data: any) => boolean; // Show field conditionally
  validation?: {
    required?: boolean;
    custom?: (value: any, formData: any) => string | null;
  };
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface FormBuilderProps<T extends Record<string, any>> {
  schema: z.ZodSchema<T>;
  fields: FormFieldConfig[];
  sections?: FormSection[];
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  className?: string;
  title?: string;
  description?: string;
  submitText?: string;
  resetText?: string;
  showReset?: boolean;
  showValidationSummary?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export function FormBuilder<T extends Record<string, any>>({
  schema,
  fields,
  sections = [],
  initialData = {},
  onSubmit,
  className,
  title,
  description,
  submitText = 'Submit',
  resetText = 'Reset',
  showReset = false,
  showValidationSummary = true,
  validateOnChange = true,
  validateOnBlur = true,
  disabled = false,
  loading = false,
}: FormBuilderProps<T>) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(sections.filter(s => s.defaultExpanded !== false).map(s => s.id))
  );

  const form = useForm({
    schema,
    initialData,
    onSubmit,
    validateOnChange,
    validateOnBlur,
  });

  // Group fields by section
  const fieldsBySection = React.useMemo(() => {
    const grouped: Record<string, FormFieldConfig[]> = { '': [] };
    
    // Initialize sections
    sections.forEach(section => {
      grouped[section.id] = [];
    });

    // Group fields
    fields.forEach(field => {
      const sectionId = field.section || '';
      if (!grouped[sectionId]) {
        grouped[sectionId] = [];
      }
      grouped[sectionId].push(field);
    });

    return grouped;
  }, [fields, sections]);

  // Filter visible fields based on conditions and dependencies
  const getVisibleFields = (sectionFields: FormFieldConfig[]) => {
    return sectionFields.filter(field => {
      // Check condition
      if (field.condition && !field.condition(form.data)) {
        return false;
      }

      // Check dependencies
      if (field.dependencies) {
        return field.dependencies.every(dep => {
          const value = form.data[dep];
          return value !== undefined && value !== null && value !== '';
        });
      }

      return true;
    });
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Validation summary
  const validationSummary = React.useMemo(() => {
    const errors = Object.entries(form.errors);
    const touchedErrors = errors.filter(([field]) => form.touched[field]);
    
    return {
      totalErrors: errors.length,
      touchedErrors: touchedErrors.length,
      untouchedErrors: errors.length - touchedErrors.length,
      errorFields: errors.map(([field, error]) => ({ field, error })),
    };
  }, [form.errors, form.touched]);

  // Render field with enhanced props
  const renderField = (fieldConfig: FormFieldConfig) => {
    const fieldProps = form.getFieldProps(fieldConfig.name);
    
    // Custom validation
    let customError = null;
    if (fieldConfig.validation?.custom) {
      customError = fieldConfig.validation.custom(fieldProps.value, form.data);
    }

    return (
      <FormField
        key={fieldConfig.name}
        {...fieldConfig}
        {...fieldProps}
        error={customError || fieldProps.error}
        disabled={disabled || loading || fieldConfig.disabled}
        required={fieldConfig.validation?.required || fieldConfig.required}
      />
    );
  };

  // Render section
  const renderSection = (section: FormSection, sectionFields: FormFieldConfig[]) => {
    const visibleFields = getVisibleFields(sectionFields);
    if (visibleFields.length === 0) return null;

    const isExpanded = expandedSections.has(section.id);
    const sectionErrors = visibleFields.filter(field => 
      form.errors[field.name] && form.touched[field.name]
    ).length;

    return (
      <Card key={section.id} className="border-l-4 border-l-primary/20">
        <CardHeader 
          className={cn(
            'pb-3',
            section.collapsible && 'cursor-pointer hover:bg-muted/50'
          )}
          onClick={section.collapsible ? () => toggleSection(section.id) : undefined}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                {section.title}
                {sectionErrors > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {sectionErrors} error{sectionErrors !== 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
              {section.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {section.description}
                </p>
              )}
            </div>
            {section.collapsible && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {isExpanded ? '−' : '+'}
              </Button>
            )}
          </div>
        </CardHeader>
        
        {(!section.collapsible || isExpanded) && (
          <CardContent className="space-y-4">
            {visibleFields.map(renderField)}
          </CardContent>
        )}
      </Card>
    );
  };

  // Render fields without sections
  const renderUnsectionedFields = () => {
    const unsectionedFields = fieldsBySection[''] || [];
    const visibleFields = getVisibleFields(unsectionedFields);
    
    if (visibleFields.length === 0) return null;

    return (
      <div className="space-y-4">
        {visibleFields.map(renderField)}
      </div>
    );
  };

  return (
    <Card className={cn('w-full', className)}>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              {title && <CardTitle className="text-xl font-semibold">{title}</CardTitle>}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            
            {showValidationSummary && validationSummary.totalErrors > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <Badge variant="destructive">
                  {validationSummary.touchedErrors} of {validationSummary.totalErrors} errors
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit} className="space-y-6">
          {/* Validation Summary */}
          {showValidationSummary && validationSummary.touchedErrors > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">
                      Please fix the following errors:
                    </p>
                    <ul className="text-sm text-destructive space-y-1">
                      {validationSummary.errorFields
                        .filter(({ field }) => form.touched[field])
                        .map(({ field, error }) => (
                          <li key={field} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-destructive rounded-full" />
                            <span className="font-medium">{field}:</span>
                            <span>{error}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unsectioned fields */}
          {renderUnsectionedFields()}

          {/* Sectioned fields */}
          {sections.map(section => 
            renderSection(section, fieldsBySection[section.id] || [])
          )}

          {sections.length > 0 && fieldsBySection['']?.length > 0 && (
            <Separator className="my-6" />
          )}

          {/* Form actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              {form.isValid && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Form is valid
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {showReset && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={disabled || loading || !form.isDirty}
                >
                  {resetText}
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={disabled || loading || !form.isValid || form.isSubmitting}
                className="flex items-center gap-2"
              >
                {(loading || form.isSubmitting) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {submitText}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}