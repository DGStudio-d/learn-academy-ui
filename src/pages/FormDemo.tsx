import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FormField, 
  FormBuilder, 
  AutoSaveForm, 
  MultiStepForm,
  UserProfileForm,
  StudentRegistrationForm,
  FormFieldConfig,
  FormSection,
  FormStep,
  userProfileSchema,
  contactFormSchema,
  UserProfileFormData,
  ContactFormData
} from '@/components/common/forms';
import { toast } from '@/hooks/use-toast';

const FormDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic');

  // Basic FormField Demo
  const BasicFormFieldDemo = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      message: '',
      level: '',
      notifications: false,
      avatar: null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleFieldChange = (name: string, value: any) => {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    };

    const validateField = (name: string, value: any) => {
      const newErrors = { ...errors };
      
      switch (name) {
        case 'name':
          if (!value || value.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
          } else {
            delete newErrors.name;
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!value) {
            newErrors.email = 'Email is required';
          } else if (!emailRegex.test(value)) {
            newErrors.email = 'Please enter a valid email';
          } else {
            delete newErrors.email;
          }
          break;
      }
      
      setErrors(newErrors);
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            name="name"
            label="Full Name"
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(value) => handleFieldChange('name', value)}
            onBlur={() => validateField('name', formData.name)}
            error={errors.name}
            required
            description="Your full legal name"
          />
          
          <FormField
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(value) => handleFieldChange('email', value)}
            onBlur={() => validateField('email', formData.email)}
            error={errors.email}
            required
          />
        </div>

        <FormField
          name="message"
          label="Message"
          type="textarea"
          placeholder="Enter your message"
          value={formData.message}
          onChange={(value) => handleFieldChange('message', value)}
          rows={4}
          maxLength={500}
          description="Tell us what you think (max 500 characters)"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            name="level"
            label="Experience Level"
            type="select"
            placeholder="Select your level"
            value={formData.level}
            onChange={(value) => handleFieldChange('level', value)}
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
          />

          <FormField
            name="avatar"
            label="Profile Picture"
            type="file"
            accept="image/*"
            onChange={(value) => handleFieldChange('avatar', value)}
            description="Upload a profile picture"
          />
        </div>

        <FormField
          name="notifications"
          label="Enable email notifications"
          type="checkbox"
          value={formData.notifications}
          onChange={(value) => handleFieldChange('notifications', value)}
          description="Receive updates about new features and courses"
        />

        <div className="flex justify-end">
          <Button onClick={() => toast({ title: 'Form Data', description: JSON.stringify(formData, null, 2) })}>
            Show Form Data
          </Button>
        </div>
      </div>
    );
  };

  // FormBuilder Demo
  const FormBuilderDemo = () => {
    const sections: FormSection[] = [
      {
        id: 'personal',
        title: 'Personal Information',
        description: 'Basic details about yourself',
      },
      {
        id: 'preferences',
        title: 'Preferences',
        description: 'Your learning preferences',
        collapsible: true,
      },
    ];

    const fields: FormFieldConfig[] = [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        section: 'personal',
        placeholder: 'Enter your full name',
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        section: 'personal',
        placeholder: 'Enter your email',
      },
      {
        name: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        section: 'personal',
        placeholder: 'What is this about?',
      },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: true,
        section: 'personal',
        placeholder: 'Your message...',
        rows: 4,
      },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        section: 'preferences',
        options: [
          { value: 'general', label: 'General Inquiry' },
          { value: 'technical', label: 'Technical Support' },
          { value: 'billing', label: 'Billing Question' },
          { value: 'feedback', label: 'Feedback' },
        ],
      },
    ];

    const handleSubmit = async (data: ContactFormData) => {
      console.log('Form submitted:', data);
      toast({
        title: 'Form Submitted',
        description: 'Your message has been sent successfully!',
      });
    };

    return (
      <FormBuilder
        schema={contactFormSchema}
        fields={fields}
        sections={sections}
        onSubmit={handleSubmit}
        title="Contact Form"
        description="Get in touch with us"
        submitText="Send Message"
        showReset={true}
        showValidationSummary={true}
      />
    );
  };

  // AutoSave Demo
  const AutoSaveDemo = () => {
    const handleSubmit = async (data: UserProfileFormData) => {
      console.log('Profile submitted:', data);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully!',
      });
    };

    const handleAutoSave = async (data: Partial<UserProfileFormData>) => {
      console.log('Auto-saving:', data);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    };

    return (
      <UserProfileForm
        onSubmit={handleSubmit}
        onAutoSave={handleAutoSave}
        autoSave={true}
        initialData={{
          name: 'John Doe',
          email: 'john@example.com',
        }}
      />
    );
  };

  // Multi-Step Demo
  const MultiStepDemo = () => {
    const handleSubmit = async (data: any) => {
      console.log('Registration submitted:', data);
      toast({
        title: 'Registration Complete',
        description: 'Welcome to Learn Academy!',
      });
    };

    return (
      <StudentRegistrationForm
        onSubmit={handleSubmit}
      />
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Form Components Demo</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive form components with validation, auto-save, and multi-step functionality
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">Real-time Validation</Badge>
          <Badge variant="secondary">Auto-save</Badge>
          <Badge variant="secondary">Multi-step</Badge>
          <Badge variant="secondary">Accessibility</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Fields</TabsTrigger>
          <TabsTrigger value="builder">Form Builder</TabsTrigger>
          <TabsTrigger value="autosave">Auto-save</TabsTrigger>
          <TabsTrigger value="multistep">Multi-step</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Form Fields</CardTitle>
              <p className="text-sm text-muted-foreground">
                Individual form field components with various input types and validation
              </p>
            </CardHeader>
            <CardContent>
              <BasicFormFieldDemo />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Builder</CardTitle>
              <p className="text-sm text-muted-foreground">
                Declarative form building with sections, validation, and error handling
              </p>
            </CardHeader>
            <CardContent>
              <FormBuilderDemo />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="autosave" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto-save Form</CardTitle>
              <p className="text-sm text-muted-foreground">
                Forms with automatic saving, progress persistence, and recovery
              </p>
            </CardHeader>
            <CardContent>
              <AutoSaveDemo />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multistep" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-step Form</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complex workflows broken into manageable steps with progress tracking
              </p>
            </CardHeader>
            <CardContent>
              <MultiStepDemo />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Real-time Validation</h4>
              <p className="text-sm text-muted-foreground">
                Instant feedback with debounced validation and user-friendly error messages
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Auto-save</h4>
              <p className="text-sm text-muted-foreground">
                Automatic form saving with localStorage backup and recovery
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Multi-step Workflows</h4>
              <p className="text-sm text-muted-foreground">
                Complex forms broken into steps with progress tracking and navigation
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Accessibility</h4>
              <p className="text-sm text-muted-foreground">
                WCAG compliant with proper ARIA labels and keyboard navigation
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Type Safety</h4>
              <p className="text-sm text-muted-foreground">
                Full TypeScript support with Zod schema validation
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Customizable</h4>
              <p className="text-sm text-muted-foreground">
                Flexible styling and behavior with comprehensive configuration options
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormDemo;