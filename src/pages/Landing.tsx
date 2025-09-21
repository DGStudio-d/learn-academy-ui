import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Globe, 
  Star,
  CheckCircle,
  Play,
  Calendar,
  MessageSquare,
  Loader2
} from 'lucide-react';
import heroImage from '@/assets/hero-learning.jpg';
import { useGuestLanguages, useGuestTeachers, useGuestSettings } from '@/hooks/useGuest';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

const features = [
  {
    icon: BookOpen,
    title: 'Interactive Lessons',
    description: 'Engaging content adapted to your learning style and pace'
  },
  {
    icon: Users,
    title: 'Expert Teachers',
    description: 'Learn from native speakers and certified language instructors'
  },
  {
    icon: Calendar,
    title: 'Live Sessions',
    description: 'Practice speaking with real-time video meetings and group sessions'
  },
  {
    icon: MessageSquare,
    title: 'Practice Quizzes',
    description: 'Test your progress with interactive quizzes and instant feedback'
  },
];

export function Landing() {
  const { data: languages, isLoading: languagesLoading, error: languagesError } = useGuestLanguages();
  const { data: teachers, isLoading: teachersLoading, error: teachersError } = useGuestTeachers();
  const { data: settings } = useGuestSettings();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  // Show loading skeleton for main sections
  const showLanguages = !languagesLoading && languages && languages.length > 0;
  const showTeachers = !teachersLoading && teachers && teachers.length > 0;

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      
      {/* Hero Section */}
      <section className="hero-bg py-20 lg:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {t('landing.hero.title')}
              </h1>
              <p className="text-xl text-muted-foreground max-w-md">
                {t('landing.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="btn-hero" asChild>
                  <Link to="/register">{t('landing.hero.cta')}</Link>
                </Button>
                <Button size="lg" variant="outline" className="flex items-center space-x-2">
                  <Play className="h-4 w-4" />
                  <span>{t('landing.hero.demo')}</span>
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Free trial</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <img
                src={heroImage}
                alt="Students learning languages"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {showTeachers ? (
                      teachers.slice(0, 3).map((teacher, i) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-white">
                          <AvatarImage src={teacher.profile_image} alt={teacher.name} />
                          <AvatarFallback>{teacher.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                      ))
                    ) : (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-8 rounded-full border-2 border-white" />
                      ))
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">
                      {showLanguages ? 
                        `${languages.length * 500}+ Students` : 
                        '2,500+ Students'
                      }
                    </div>
                    <div className="text-muted-foreground">Active learners</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {t('languages.title')} <span className="text-gradient">{t('nav.languages')}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('languages.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {languagesLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="card-brand">
                  <CardContent className="p-6 text-center">
                    <Skeleton className="h-16 w-16 rounded-full mx-auto mb-3" />
                    <Skeleton className="h-6 w-20 mx-auto mb-2" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16 mx-auto" />
                      <Skeleton className="h-4 w-14 mx-auto" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : showLanguages ? (
              languages.slice(0, 5).map((language, index) => {
                // Map language codes to flags
                const flagMap: Record<string, string> = {
                  'en': '🇺🇸',
                  'es': '🇪🇸', 
                  'ar': '🇸🇦',
                  'fr': '🇫🇷',
                  'de': '🇩🇪',
                  'zh': '🇨🇳'
                };
                
                return (
                  <Card key={language.id} className="card-brand hover:scale-105 transition-transform cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{flagMap[language.code] || '🌍'}</div>
                      <h3 className="font-semibold text-lg mb-2">{language.name}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>{Math.floor(Math.random() * 1000) + 100} students</div>
                        <div>{Math.floor(Math.random() * 3) + 2} levels</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              // Empty state when no languages
              <div className="col-span-full text-center py-8">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isRTL ? 'اللغات متاحة قريباً!' : 'Languages will be available soon!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform combines traditional teaching methods 
              with modern technology for effective language learning.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary shadow-brand mb-4">
                  <feature.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {t('landing.teachers.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn from certified instructors and native speakers 
              who are passionate about helping you succeed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teachersLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="card-brand">
                  <CardContent className="p-6 text-center">
                    <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-32 mx-auto mb-2" />
                    <div className="flex justify-center space-x-1 mb-3">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : showTeachers ? (
              teachers.slice(0, 3).map((teacher, index) => (
                <Card key={teacher.id} className="card-brand animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6 text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarImage src={teacher.profile_image} alt={teacher.name} />
                      <AvatarFallback className="text-xl">
                        {teacher.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg mb-2">{teacher.name}</h3>
                    <div className="flex justify-center space-x-1 mb-3">
                      <Badge variant="secondary">{teacher.role === 'teacher' ? 'Teacher' : 'Instructor'}</Badge>
                      <Badge variant="secondary">{teacher.preferred_language.toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{(4.5 + Math.random() * 0.4).toFixed(1)}</span>
                      </div>
                      <div>{Math.floor(Math.random() * 100) + 50} students</div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Empty state when no teachers
              <div className="col-span-full text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isRTL ? 'معلمونا الخبراء سيكونون متاحين قريباً!' : 'Our expert teachers will be available soon!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-bg">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Start Your <span className="text-gradient">Language Journey?</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of students who have already transformed their communication skills 
              with Learn Academy. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-hero" asChild>
                <Link to="/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/languages">Browse Languages</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}