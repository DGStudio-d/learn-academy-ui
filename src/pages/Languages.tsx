import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { Users, Clock, BookOpen, Star, Loader2, Globe } from 'lucide-react';
import { useGuestLanguages, useGuestSettings } from '@/hooks/useGuest';
import { GuestLanguageAccess } from '@/components/guest/GuestAccessControl';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

export function Languages() {
  const { data: languages, isLoading: languagesLoading, error: languagesError } = useGuestLanguages();
  const { data: settings } = useGuestSettings();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  // Map language codes to display data
  const getLanguageData = (language: any) => {
    const flagMap: Record<string, string> = {
      'en': '🇺🇸',
      'es': '🇪🇸', 
      'ar': '🇸🇦',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'zh': '🇨🇳'
    };

    const descriptionMap: Record<string, string> = {
      'en': 'Master the global language of business and communication',
      'es': 'Learn the second most spoken language worldwide',
      'ar': 'Explore the rich language of the Middle East and North Africa',
      'fr': 'Discover the language of love, art, and cuisine',
      'de': 'Learn the language of innovation and engineering',
      'zh': 'Master the most spoken language in the world'
    };

    const imageMap: Record<string, string> = {
      'en': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
      'es': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=300&fit=crop',
      'ar': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      'fr': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
      'de': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop',
      'zh': 'https://images.unsplash.com/photo-1508640807370-da1b6cb65795?w=400&h=300&fit=crop'
    };

    return {
      flag: flagMap[language.code] || '🌍',
      description: descriptionMap[language.code] || `Learn ${language.name} with expert instructors`,
      image: imageMap[language.code] || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
      students: Math.floor(Math.random() * 1000) + 100,
      teachers: Math.floor(Math.random() * 8) + 2,
      levels: Math.floor(Math.random() * 3) + 2,
      duration: `${Math.floor(Math.random() * 8) + 6}-${Math.floor(Math.random() * 6) + 10} months`,
      rating: (4.5 + Math.random() * 0.4).toFixed(1)
    };
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      
      {/* Hero Section */}
      <section className="hero-bg py-16 lg:py-24">
        <div className="container text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            {t('languages.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('languages.subtitle')}
          </p>
          <Button size="lg" className="btn-hero" asChild>
            <Link to="/register">{t('languages.cta')}</Link>
          </Button>
        </div>
      </section>

      {/* Languages Grid */}
      <section className="py-20">
        <div className="container">
          <GuestLanguageAccess>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {languagesLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="card-brand overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 flex-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : languages && languages.length > 0 ? (
                languages.map((language, index) => {
                  const langData = getLanguageData(language);
                  return (
                    <Card key={language.id} className="card-brand hover:scale-105 transition-all duration-300 overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={langData.image}
                          alt={`${language.name} language course`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/90 text-primary font-semibold">
                            <span className="mr-2">{langData.flag}</span>
                            {language.name}
                          </Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-primary text-primary-foreground">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {langData.rating}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{language.name}</span>
                        </CardTitle>
                        <CardDescription>{langData.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span>{langData.students} students</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span>{langData.levels} levels</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>{langData.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span>{langData.teachers} teachers</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button className="flex-1 btn-hero" asChild>
                            <Link to={`/languages/${language.id}`}>View Details</Link>
                          </Button>
                          <Button variant="outline" className="flex-1" asChild>
                            <Link to="/register">Enroll Now</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                // Empty state when no languages
                <div className="col-span-full text-center py-12">
                  <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                  <h3 className="text-xl font-semibold mb-4">No Languages Available</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Our language courses are being prepared. Please check back soon or contact us for more information.
                  </p>
                  <Button asChild>
                    <Link to="/register">Get Notified When Available</Link>
                  </Button>
                </div>
              )}
            </div>
          </GuestLanguageAccess>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of students who have already transformed their communication skills. 
            Choose your language and begin your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-hero" asChild>
              <Link to="/register">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/teachers">Meet Our Teachers</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Languages;
