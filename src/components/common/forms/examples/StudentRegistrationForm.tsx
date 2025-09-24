import React from 'react';
import { MultiStepForm, FormStep } from '../MultiStepForm';
import { FormField } from '../FormField';
import {
  studentRegistrationStep1Schema,
  studentRegistrationStep2Schema,
  studentRegistrationStep3Schema,
  StudentRegistrationStep1Data,
  StudentRegistrationStep2Data,
  StudentRegistrationStep3Data,
} from '@/lib/formValidation';
import { toast } from '@/hooks/use-toast';

type StudentRegistrationData = StudentRegistrationStep1Data & 
  StudentRegistrationStep2Data & 
  StudentRegistrationStep3Data;

interface StudentRegistrationFormProps {
  onSubmit: (data: StudentRegistrationData) => Promise<void>;
  className?: string;
}

// Step 1: Basic Information
const BasicInfoStep: React.FC<any> = ({ 
  data, 
  errors, 
  setFieldValue, 
  getFieldProps 
}) => {
  return (
    <div className="space-y-4">
      <FormField
        name="name"
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        required
        {...getFieldProps('name')}
      />
      
      <FormField
        name="email"
        label="Email Address"
        type="email"
        placeholder="Enter your email address"
        required
        description="We'll use this email for your account and important notifications"
        {...getFieldProps('email')}
      />
      
      <FormField
        name="phone"
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 123-4567"
        description="Optional - for urgent communications only"
        {...getFieldProps('phone')}
      />
    </div>
  );
};

// Step 2: Account Security
const SecurityStep: React.FC<any> = ({ 
  data, 
  errors, 
  setFieldValue, 
  getFieldProps 
}) => {
  return (
    <div className="space-y-4">
      <FormField
        name="password"
        label="Password"
        type="password"
        placeholder="Create a strong password"
        required
        description="Must be at least 8 characters with uppercase, lowercase, number, and special character"
        {...getFieldProps('password')}
      />
      
      <FormField
        name="password_confirmation"
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        required
        {...getFieldProps('password_confirmation')}
      />
      
      <FormField
        name="preferred_language"
        label="Preferred Language"
        type="select"
        required
        options={[
          { value: 'en', label: 'English' },
          { value: 'ar', label: 'Arabic' },
          { value: 'es', label: 'Spanish' },
        ]}
        description="Choose your preferred language for the interface"
        {...getFieldProps('preferred_language')}
      />
    </div>
  );
};

// Step 3: Learning Preferences
const PreferencesStep: React.FC<any> = ({ 
  data, 
  errors, 
  setFieldValue, 
  getFieldProps 
}) => {
  const interestOptions = [
    { value: 'grammar', label: 'Grammar' },
    { value: 'vocabulary', label: 'Vocabulary' },
    { value: 'conversation', label: 'Conversation' },
    { value: 'writing', label: 'Writing' },
    { value: 'reading', label: 'Reading' },
    { value: 'pronunciation', label: 'Pronunciation' },
    { value: 'business', label: 'Business Language' },
    { value: 'academic', label: 'Academic Language' },
  ];

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  return (
    <div className="space-y-6">
      <FormField
        name="level"
        label="Current Level"
        type="select"
        required
        options={[
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
        ]}
        description="Select your current proficiency level"
        {...getFieldProps('level')}
      />
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Areas of Interest</label>
        <p className="text-sm text-muted-foreground">
          Select 1-5 areas you'd like to focus on (required)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {interestOptions.map(option => (
            <FormField
              key={option.value}
              name={`interests.${option.value}`}
              label={option.label}
              type="checkbox"
              value={data.interests?.includes(option.value) || false}
              onChange={(checked) => {
                const currentInterests = data.interests || [];
                if (checked) {
                  if (currentInterests.length < 5) {
                    setFieldValue('interests', [...currentInterests, option.value]);
                  }
                } else {
                  setFieldValue('interests', currentInterests.filter(i => i !== option.value));
                }
              }}
            />
          ))}
        </div>
        {errors.interests && (
          <p className="text-sm text-destructive">{errors.interests}</p>
        )}
      </div>
      
      <FormField
        name="goals"
        label="Learning Goals"
        type="textarea"
        placeholder="Tell us about your learning goals and what you hope to achieve..."
        rows={4}
        maxLength={500}
        description="Optional - help us understand your objectives"
        {...getFieldProps('goals')}
      />
      
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Availability</h4>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Days</label>
          <div className="grid grid-cols-2 gap-2">
            {dayOptions.map(option => (
              <FormField
                key={option.value}
                name={`availability.days.${option.value}`}
                label={option.label}
                type="checkbox"
                value={data.availability?.days?.includes(option.value) || false}
                onChange={(checked) => {
                  const currentDays = data.availability?.days || [];
                  const newDays = checked
                    ? [...currentDays, option.value]
                    : currentDays.filter(d => d !== option.value);
                  setFieldValue('availability', {
                    ...data.availability,
                    days: newDays,
                  });
                }}
              />
            ))}
          </div>
        </div>
        
        <FormField
          name="availability.time_preference"
          label="Time Preference"
          type="select"
          options={[
            { value: 'morning', label: 'Morning (6 AM - 12 PM)' },
            { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)' },
            { value: 'evening', label: 'Evening (6 PM - 10 PM)' },
            { value: 'flexible', label: 'Flexible' },
          ]}
          {...getFieldProps('availability.time_preference')}
        />
      </div>
    </div>
  );
};

export const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({
  onSubmit,
  className,
}) => {
  const steps: FormStep[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Let\'s start with your basic information',
      schema: studentRegistrationStep1Schema,
      component: BasicInfoStep,
    },
    {
      id: 'security',
      title: 'Account Security',
      description: 'Create a secure password and set your language preference',
      schema: studentRegistrationStep2Schema,
      component: SecurityStep,
    },
    {
      id: 'preferences',
      title: 'Learning Preferences',
      description: 'Tell us about your learning goals and availability',
      schema: studentRegistrationStep3Schema,
      component: PreferencesStep,
    },
  ];

  const handleSubmit = async (data: StudentRegistrationData) => {
    try {
      await onSubmit(data);
      toast({
        title: 'Registration Successful',
        description: 'Welcome to Learn Academy! You can now start learning.',
      });
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: 'There was an error creating your account. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleStepChange = (stepIndex: number, stepId: string) => {
    console.log(`Moved to step ${stepIndex + 1}: ${stepId}`);
  };

  const handleAutoSave = async (data: Partial<StudentRegistrationData>, stepIndex: number) => {
    // Auto-save registration progress
    console.log('Auto-saving registration progress:', { data, stepIndex });
  };

  return (
    <MultiStepForm
      steps={steps}
      onSubmit={handleSubmit}
      onStepChange={handleStepChange}
      onAutoSave={handleAutoSave}
      storageKey="student-registration"
      title="Student Registration"
      description="Join Learn Academy and start your language learning journey"
      showProgress={true}
      allowSkipOptional={true}
      validateOnStepChange={true}
      persistProgress={true}
      className={className}
    />
  );
};