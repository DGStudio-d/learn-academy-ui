import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { Users, Clock, BookOpen, Star } from 'lucide-react';

const languages = [
  {
    id: 1,
    name: 'English',
    flag: '🇺🇸',
    description: 'Master the global language of business and communication',
    students: 1250,
    teachers: 8,
    levels: 4,
    duration: '6-12 months',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'Spanish',
    flag: '🇪🇸',
    description: 'Learn the second most spoken language worldwide',
    students: 890,
    teachers: 6,
    levels: 4,
    duration: '6-10 months',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'Arabic',
    flag: '🇸🇦',
    description: 'Explore the rich language of the Middle East and North Africa',
    students: 650,
    teachers: 5,
    levels: 3,
    duration: '8-14 months',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    name: 'French',
    flag: '🇫🇷',
    description: 'Discover the language of love, art, and cuisine',
    students: 420,
    teachers: 4,
    levels: 3,
    duration: '6-12 months',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    name: 'German',
    flag: '🇩🇪',
    description: 'Learn the language of innovation and engineering',
    students: 380,
    teachers: 3,
    levels: 3,
    duration: '7-13 months',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop'
  },
  {
    id: 6,
    name: 'Mandarin',
    flag: '🇨🇳',
    description: 'Master the most spoken language in the world',
    students: 320,
    teachers: 4,
    levels: 4,
    duration: '12-18 months',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1508640807370-da1b6cb65795?w=400&h=300&fit=crop'
  }
];

export function Languages() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-bg py-16 lg:py-24">
        <div className="container text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Choose Your <span className="text-gradient">Language</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Explore our comprehensive language programs taught by native speakers and expert instructors. 
            From beginner to advanced levels, we have the perfect course for your learning journey.
          </p>
          <Button size="lg" className="btn-hero" asChild>
            <Link to="/register">Start Learning Today</Link>
          </Button>
        </div>
      </section>

      {/* Languages Grid */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {languages.map((language, index) => (
              <Card key={language.id} className="card-brand hover:scale-105 transition-all duration-300 overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={language.image}
                    alt={`${language.name} language course`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-primary font-semibold">
                      <span className="mr-2">{language.flag}</span>
                      {language.name}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {language.rating}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{language.name}</span>
                  </CardTitle>
                  <CardDescription>{language.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{language.students} students</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>{language.levels} levels</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{language.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{language.teachers} teachers</span>
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
            ))}
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