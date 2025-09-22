import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Eye, EyeOff, MessageCircle } from 'lucide-react';
import { useRegister } from '../../hooks/useAuth';
import { useRegisterForm } from '../../hooks/useForm';
import type { RegisterRequest } from '../../types/api';

const languages = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸' },
  { value: 'ar', label: 'Arabic', flag: '🇸🇦' },
];

const levels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const form = useRegisterForm(async (data) => {
    try {
      // Set default role to student
      const registrationData = { ...data, role: 'student' as const };
      const result = await registerMutation.mutateAsync(registrationData);

      // Redirect based on user role
      const roleRedirects = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/dashboard',
      };

      const redirectPath =
        roleRedirects[result.user.role as keyof typeof roleRedirects] ||
        '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      throw error;
    }
  });

  const handleSelectChange = (name: string, value: string) => {
    form.setFieldValue(name as keyof RegisterRequest, value);
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Learn Academy and start your language journey"
    >
      <form onSubmit={form.handleSubmit} className="space-y-4">
        {/* Name + Phone */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.getFieldProps('name')}
              placeholder="John Doe"
              required
            />
            {form.getFieldProps('name').error && (
              <p className="text-sm text-destructive">
                {form.getFieldProps('name').error}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              {...form.getFieldProps('phone')}
              placeholder="+1-234-567-8900"
            />
            {form.getFieldProps('phone').error && (
              <p className="text-sm text-destructive">
                {form.getFieldProps('phone').error}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            {...form.getFieldProps('email')}
            type="email"
            placeholder="john@example.com"
            required
          />
          {form.getFieldProps('email').error && (
            <p className="text-sm text-destructive">
              {form.getFieldProps('email').error}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              {...form.getFieldProps('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {form.getFieldProps('password').error && (
            <p className="text-sm text-destructive">
              {form.getFieldProps('password').error}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirm Password</Label>
          <Input
            id="password_confirmation"
            {...form.getFieldProps('password_confirmation')}
            type="password"
            placeholder="Confirm your password"
            required
          />
          {form.getFieldProps('password_confirmation').error && (
            <p className="text-sm text-destructive">
              {form.getFieldProps('password_confirmation').error}
            </p>
          )}
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="preferred_language">Preferred Language</Label>
          <Select
            value={form.data.preferred_language || 'en'}
            onValueChange={(value) =>
              handleSelectChange('preferred_language', value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center space-x-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Level */}
        <div className="space-y-2">
          <Label htmlFor="level">Your Level</Label>
          <Select
            value={form.data.level || ''}
            onValueChange={(value) => handleSelectChange('level', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full btn-hero"
          disabled={form.isSubmitting || !form.isValid}
        >
          {form.isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </form>

      {/* Payment Information Section */}
      <div className="mt-8 space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Fill out the form above to register for one of our language courses. Our team will contact you as
            soon as possible to confirm registration and arrange lesson times.
          </p>
        </div>

        <Tabs defaultValue="register" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="payment">Bank Transfer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="register" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Complete</CardTitle>
                <CardDescription>
                  Your registration form has been submitted successfully.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>You can pay in advance</CardTitle>
                <CardDescription>
                  Via transfer to one of the banks below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* BARID BANK */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Via BARID BANK</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">RIB:</span> 350810000000007352205 97
                    </div>
                    <div>
                      <span className="font-medium">IBAN:</span> MA64 350 810{' '}
                      <span className="text-green-600 font-medium">000000007352205</span> 597
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">Via CIH BANK</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Account Holder:</span> ZAKARIA AFIF
                    </div>
                    <div>
                      <span className="font-medium">RIB:</span> 230 610{' '}
                      <span className="text-green-600 font-medium">36784452110016</span> 013
                    </div>
                    <div>
                      <span className="font-medium">IBAN:</span> MA64{' '}
                      <span className="text-green-600 font-medium">2306 1036 7844 5211 0016 0013</span>
                    </div>
                    <div>
                      <span className="font-medium">Code SWIFT:</span> CIHMMAMX
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    After completing the transfer, please contact us via WhatsApp to confirm your registration
                  </p>
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact us via WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthLayout>
  );
}

export default Register;
