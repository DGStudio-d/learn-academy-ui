import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Eye, EyeOff, MessageCircle } from 'lucide-react';

const languages = [
  { value: 'english', label: 'English', flag: '🇺🇸' },
  { value: 'spanish', label: 'Spanish', flag: '🇪🇸' },
  { value: 'arabic', label: 'Arabic', flag: '🇸🇦' },
  { value: 'french', label: 'French', flag: '🇫🇷' },
  { value: 'german', label: 'German', flag: '🇩🇪' },
];

const levels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement registration logic
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Learn Academy and start your language journey"
    >
      <Tabs defaultValue="register" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="payment">Bank Transfer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="register">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language to Learn</Label>
              <Select>
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

            <div className="space-y-2">
              <Label htmlFor="level">Your Level</Label>
              <Select>
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

            <Button
              type="submit"
              className="w-full btn-hero"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="payment">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">You can pay in advance</h3>
              <p className="text-muted-foreground text-sm">
                Via transfer to one of the banks below
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-lg">Via BARID BANK</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">RIB: </span>
                    <span className="text-muted-foreground">350810000000007352205 97</span>
                  </div>
                  <div>
                    <span className="font-medium">IBAN: </span>
                    <span className="text-muted-foreground">MA64 350 810 </span>
                    <span className="text-primary font-medium">000000007352205</span>
                    <span className="text-muted-foreground"> 597</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-lg">Via CIH BANK</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">Account Holder: </span>
                    <span className="text-muted-foreground">ZAKARIA AFIF</span>
                  </div>
                  <div>
                    <span className="font-medium">RIB: </span>
                    <span className="text-muted-foreground">230 610 </span>
                    <span className="text-primary font-medium">367844521100160</span>
                    <span className="text-muted-foreground"> 013</span>
                  </div>
                  <div>
                    <span className="font-medium">IBAN: </span>
                    <span className="text-muted-foreground">MA64 </span>
                    <span className="text-primary font-medium">2306 1036 7844 5211 0016 0013</span>
                  </div>
                  <div>
                    <span className="font-medium">Code SWIFT: </span>
                    <span className="text-muted-foreground">CIHMAMX</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center text-sm text-muted-foreground mb-4">
              After completing the transfer, please contact us via WhatsApp to confirm your registration
            </div>

            <Button 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={() => window.open('https://wa.me/1234567890', '_blank')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact us via WhatsApp
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
}