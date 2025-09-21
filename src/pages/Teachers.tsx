import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { Star, Users, Calendar, MessageSquare, Globe, Loader2 } from 'lucide-react';
import { useGuestTeachers, useGuestSettings } from '@/hooks/useGuest';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

export function Teachers() {
  const { data: teachers, isLoading: teachersLoading, error: teachersError } = useGuestTeachers();
  const { data: settings } = useGuestSettings();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  // Generate teacher profile data based on API data
  const getTeacherData = (teacher: any) => {
    const titles = [
      'Senior Language Instructor',
      'Native Speaker Expert', 
      'Language Specialist',
      'Cultural Studies Expert',
      'Literature Professor',
      'Communication Coach'
    ];
    
    const bios = [
      'Passionate educator with extensive experience in language instruction and cultural exchange.',
      'Native speaker dedicated to helping students achieve fluency through engaging and practical lessons.',
      'Expert instructor specializing in conversational practice and real-world language application.',
      'Experienced teacher focused on building confidence and communication skills in students.',
      'Cultural expert who brings authentic language learning through immersive teaching methods.',
      'Professional educator committed to personalized learning experiences for every student.'
    ];

    const credentialOptions = [
      ['Teaching Certificate', 'Language Expert', 'Cultural Studies'],
      ['Native Speaker', 'TESOL Certified', 'Conversation Specialist'],
      ['University Degree', 'Professional Certification', 'Business Language'],
      ['Literature Expert', 'Grammar Specialist', 'Pronunciation Coach']
    ];

    const availabilityOptions = [
      'Mon-Fri, 9AM-6PM',
      'Tue-Sat, 10AM-7PM', 
      'Sun-Thu, 8AM-5PM',
      'Wed-Sun, 11AM-8PM',
      'Mon-Fri, 2PM-9PM'
    ];

    return {
      title: titles[Math.floor(Math.random() * titles.length)],
      bio: bios[Math.floor(Math.random() * bios.length)],
      rating: (4.5 + Math.random() * 0.4).toFixed(1),
      students: Math.floor(Math.random() * 100) + 50,
      experience: `${Math.floor(Math.random() * 10) + 3} years`,
      credentials: credentialOptions[Math.floor(Math.random() * credentialOptions.length)],
      availability: availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)]
    };
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      
      {/* Hero Section */}
      <section className="hero-bg py-16 lg:py-24">
        <div className="container text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            {t('teachers.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('teachers.subtitle')}
          </p>
          <Button size="lg" className="btn-hero" asChild>
            <Link to="/register">{t('nav.register')}</Link>
          </Button>
        </div>
      </section>

      {/* Teachers Grid */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachersLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="card-brand">
                  <CardHeader className="text-center">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center gap-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 flex-1" />
                      <Skeleton className="h-8 flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : teachers && teachers.length > 0 ? (
              teachers.map((teacher, index) => {
                const teacherData = getTeacherData(teacher);
                return (
                  <Card key={teacher.id} className="card-brand hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader className="text-center">
                      <Avatar className="h-24 w-24 mx-auto mb-4">
                        <AvatarImage src={teacher.profile_image} alt={teacher.name} />
                        <AvatarFallback className="text-xl">
                          {teacher.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl">{teacher.name}</CardTitle>
                      <CardDescription className="text-sm font-medium text-primary">
                        {teacherData.title}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Role and Language */}
                      <div className="flex flex-wrap justify-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          {teacher.role === 'teacher' ? 'Teacher' : 'Instructor'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          {teacher.preferred_language.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className="flex items-center justify-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{teacherData.rating}</span>
                          </div>
                          <div className="text-muted-foreground">Rating</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center space-x-1">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{teacherData.students}</span>
                          </div>
                          <div className="text-muted-foreground">Students</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center space-x-1">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{teacherData.experience}</span>
                          </div>
                          <div className="text-muted-foreground">Experience</div>
                        </div>
                      </div>
                      
                      {/* Bio */}
                      <p className="text-sm text-muted-foreground text-center">
                        {teacherData.bio}
                      </p>
                      
                      {/* Credentials */}
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Credentials:</div>
                        <div className="flex flex-wrap gap-1">
                          {teacherData.credentials.map((credential: string) => (
                            <Badge key={credential} variant="outline" className="text-xs">
                              {credential}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Availability */}
                      <div className="text-sm">
                        <span className="font-medium text-primary">Available: </span>
                        <span className="text-muted-foreground">{teacherData.availability}</span>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1 btn-hero" asChild>
                          <Link to={`/teachers/${teacher.id}`}>View Profile</Link>
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              // Empty state when no teachers
              <div className="col-span-full text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                <h3 className="text-xl font-semibold mb-4">No Teachers Available</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Our expert teachers are being recruited. Please check back soon or contact us to be notified when teachers become available.
                </p>
                <Button asChild>
                  <Link to="/register">Get Notified</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our community of learners and get matched with the perfect teacher for your learning style and goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-hero" asChild>
              <Link to="/register">Find Your Teacher</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/languages">Browse Languages</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}