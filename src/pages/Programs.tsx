import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  CheckCircle,
  Calendar,
  Award,
  Globe
} from 'lucide-react';
import { useGuestPrograms } from '@/hooks/useGuest';
import { GuestProgramAccess } from '@/components/guest/GuestAccessControl';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';



const levels = [
  { name: 'Beginner', description: 'Perfect for complete beginners', color: 'bg-green-100 text-green-800' },
  { name: 'Intermediate', description: 'For those with basic knowledge', color: 'bg-blue-100 text-blue-800' },
  { name: 'Advanced', description: 'For experienced learners', color: 'bg-purple-100 text-purple-800' },
];

export function Programs() {
  const { t } = useTranslation();
  const { data: programs, isLoading: programsLoading, error: programsError } = useGuestPrograms();

  // Generate program data based on API data
  const getProgramData = (program: any) => {
    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    const durations = ['6 weeks', '8 weeks', '10 weeks', '12 weeks', '14 weeks'];
    const prices = ['$249', '$299', '$329', '$349', '$399', '$429'];
    
    const features = [
      ['Basic vocabulary and phrases', 'Grammar fundamentals', 'Pronunciation practice', 'Cultural insights'],
      ['Conversation practice', 'Advanced grammar', 'Writing skills', 'Business communication'],
      ['Literature analysis', 'Advanced writing', 'Professional communication', 'Cultural studies'],
      ['Technical vocabulary', 'Industry-specific terms', 'Professional documentation', 'Specialized communication']
    ];

    return {
      level: levels[Math.floor(Math.random() * levels.length)],
      duration: durations[Math.floor(Math.random() * durations.length)],
      students: Math.floor(Math.random() * 100) + 30,
      rating: (4.5 + Math.random() * 0.4).toFixed(1),
      teacher: program.teacher?.name || 'Expert Instructor',
      features: features[Math.floor(Math.random() * features.length)],
      progress: 0,
      enrolled: false,
      price: prices[Math.floor(Math.random() * prices.length)]
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-bg py-16 lg:py-24">
        <div className="container text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Language <span className="text-gradient">Programs</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Structured learning paths designed by experts to take you from beginner to fluent. 
            Choose from our comprehensive programs tailored to different goals and skill levels.
          </p>
          <Button size="lg" className="btn-hero" asChild>
            <Link to="/register">Start Your Program</Link>
          </Button>
        </div>
      </section>

      {/* Level Guide */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Level</h2>
            <p className="text-lg text-muted-foreground">
              Not sure which level is right for you? Here's a quick guide to help you decide.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {levels.map((level, index) => (
              <Card key={level.name} className="card-brand text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-8">
                  <Badge className={level.color + ' mb-4'}>{level.name}</Badge>
                  <h3 className="text-xl font-semibold mb-2">{level.name}</h3>
                  <p className="text-muted-foreground">{level.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20">
        <div className="container">
          <GuestProgramAccess>
            <div className="grid lg:grid-cols-2 gap-8">
              {programsLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="card-brand overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                          </div>
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-32" />
                        <div className="grid grid-cols-1 gap-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                      <Skeleton className="h-16 w-full" />
                      <div className="flex space-x-3">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 flex-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : programs && programs.length > 0 ? (
                programs.map((program, index) => {
                  const programData = getProgramData(program);
                  return (
                    <Card key={program.id} className="card-brand overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                {program.language?.name || 'Language'}
                              </Badge>
                              <Badge className={
                                programData.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                                programData.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }>
                                {programData.level}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl">{program.name}</CardTitle>
                            <CardDescription>{program.description}</CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{programData.price}</div>
                            <div className="text-sm text-muted-foreground">{programData.duration}</div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        {/* Progress for enrolled programs */}
                        {programData.enrolled && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Your Progress</span>
                              <span>{programData.progress}%</span>
                            </div>
                            <Progress value={programData.progress} className="h-2" />
                          </div>
                        )}
                        
                        {/* Program Features */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">What you'll learn:</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {programData.features.map((feature) => (
                              <div key={feature} className="flex items-center space-x-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Program Stats */}
                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                          <div>
                            <div className="flex items-center justify-center space-x-1">
                              <Users className="h-4 w-4 text-primary" />
                              <span className="font-semibold">{programData.students}</span>
                            </div>
                            <div className="text-muted-foreground">Students</div>
                          </div>
                          <div>
                            <div className="flex items-center justify-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{programData.rating}</span>
                            </div>
                            <div className="text-muted-foreground">Rating</div>
                          </div>
                          <div>
                            <div className="flex items-center justify-center space-x-1">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-semibold">{programData.duration}</span>
                            </div>
                            <div className="text-muted-foreground">Duration</div>
                          </div>
                        </div>
                        
                        {/* Teacher Info */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Award className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-medium text-sm">Instructor</div>
                              <div className="text-sm text-muted-foreground">{programData.teacher}</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                          {programData.enrolled ? (
                            <>
                              <Button className="flex-1 btn-hero" asChild>
                                <Link to="/dashboard">Continue Learning</Link>
                              </Button>
                              <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4 mr-1" />
                                Schedule
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button className="flex-1 btn-hero" asChild>
                                <Link to="/register">Enroll Now</Link>
                              </Button>
                              <Button variant="outline" className="flex-1" asChild>
                                <Link to={`/programs/${program.id}`}>Learn More</Link>
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                // Empty state when no programs
                <div className="col-span-full text-center py-12">
                  <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                  <h3 className="text-xl font-semibold mb-4">No Programs Available</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Our language programs are being prepared. Please check back soon or contact us for more information.
                  </p>
                  <Button asChild>
                    <Link to="/register">Get Notified When Available</Link>
                  </Button>
                </div>
              )}
            </div>
          </GuestProgramAccess>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Your Program?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of students who have already achieved their language learning goals. 
            Choose your program and start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-hero" asChild>
              <Link to="/register">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Need Help Choosing?</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Programs;
