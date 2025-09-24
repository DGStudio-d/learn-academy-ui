import React from 'react';
import { FormBuilder, FormFieldConfig, FormSection } from '../FormBuilder';
import { AutoSaveForm } from '../AutoSaveForm';
import { FormField } from '../FormField';
import { Button } from '@/components/ui/button';
import { userProfileSchema, UserProfileFormData } from '@/lib/formValidation';
import { toast } from '@/hooks/use-toast';

interface UserProfileFormProps {
  initialData?: Partial<UserProfileFormData>;
  onSubmit: (data: UserProfileFormData) => Promise<void>;
  onAutoSave?: (data: Partial<UserProfileFormData>) => Promise<void>;
  className?: string;
  autoSave?: boolean;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  initialData,
  onSubmit,
  onAutoSave,
  className,
  autoSave = false,
}) => {
  const sections: FormSection[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic information about yourself',
    },
    {
      id: 'contact',
      title: 'Contact Details',
      description: 'How we can reach you',
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Your language and other preferences',
      collapsible: true,
      defaultExpanded: false,
    },
  ];

  const fields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your full name',
      required: true,
      section: 'personal',
      autoComplete: 'name',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email address',
      required: true,
      section: 'contact',
      autoComplete: 'email',
      description: 'We will use this email for important notifications',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+1 (555) 123-4567',
      section: 'contact',
      autoComplete: 'tel',
      description: 'Optional - for urgent communications only',
    },
    {
      name: 'preferred_language',
      label: 'Preferred Language',
      type: 'select',
      section: 'preferences',
      options: [
        { value: 'en', label: 'English' },
        { value: 'ar', label: 'Arabic' },
        { value: 'es', label: 'Spanish' },
      ],
      description: 'Choose your preferred language for the interface',
    },
    {
      name: 'bio',
      label: 'Bio',
      type: 'textarea',
      placeholder: 'Tell us a bit about yourself...',
      section: 'personal',
      maxLength: 500,
      rows: 4,
      description: 'Optional - share something about your background or interests',
    },
    {
      name: 'profile_image',
      label: 'Profile Picture',
      type: 'file',
      accept: 'image/jpeg,image/png,image/webp',
      section: 'personal',
      description: 'Upload a profile picture (max 5MB, JPEG/PNG/WebP)',
    },
  ];

  const handleSubmit = async (data: UserProfileFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your profile. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleAutoSave = async (data: Partial<UserProfileFormData>) => {
    if (onAutoSave) {
      await onAutoSave(data);
    }
  };

  if (autoSave && onAutoSave) {
    return (
      <AutoSaveForm
        schema={userProfileSchema}
        initialData={initialData}
        onSubmit={handleSubmit}
        onAutoSave={handleAutoSave}
        storageKey="user-profile-form"
        title="Edit Profile"
        description="Update your personal information and preferences"
        className={className}
      >
        {(formProps) => (
          <div className="space-y-6">
            {sections.map(section => {
              const sectionFields = fields.filter(field => field.section === section.id);
              
              return (
                <div key={section.id} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{section.title}</h3>
                    {section.description && (
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {sectionFields.map(field => {
                      const fieldProps = formProps.getFieldProps(field.name);
                      return (
                        <FormField
                          key={field.name}
                          {...field}
                          {...fieldProps}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                onClick={formProps.handleSubmit}
                disabled={formProps.isSubmitting || !formProps.isValid}
                className="flex items-center gap-2"
              >
                {formProps.isSubmitting ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </div>
        )}
      </AutoSaveForm>
    );
  }

  return (
    <FormBuilder
      schema={userProfileSchema}
      fields={fields}
      sections={sections}
      initialData={initialData}
      onSubmit={handleSubmit}
      title="Edit Profile"
      description="Update your personal information and preferences"
      submitText="Update Profile"
      showReset={true}
      showValidationSummary={true}
      className={className}
    />
  );
};