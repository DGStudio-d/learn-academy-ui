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
  MessageSquare
} from 'lucide-react';
import heroImage from '@/assets/hero-learning.jpg';

const languages = [
  { name: 'English', flag: '🇺🇸', students: 1250, levels: 4 },
  { name: 'Spanish', flag: '🇪🇸', students: 890, levels: 4 },
  { name: 'Arabic', flag: '🇸🇦', students: 650, levels: 3 },
  { name: 'French', flag: '🇫🇷', students: 420, levels: 3 },
  { name: 'German', flag: '🇩🇪', students: 380, levels: 3 },
];

const teachers = [
  {
    name: 'Sarah Johnson',
    languages: ['English', 'Spanish'],
    image: 'https://images.unsplash.com/photo-1494790108755-2616b332c913?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    students: 120
  },
  {
    name: 'Ahmed Al-Rashid',
    languages: ['Arabic', 'English'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    students: 95
  },
  {
    name: 'Maria Rodriguez',
    languages: ['Spanish', 'French'],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    students: 108
  },
];

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
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-bg py-20 lg:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Master New 
                <span className="text-gradient"> Languages</span>
                <br />
                with Expert Teachers
              </h1>
              <p className="text-xl text-muted-foreground max-w-md">
                Join thousands of students learning languages through interactive lessons, 
                live sessions, and personalized guidance from native speakers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="btn-hero" asChild>
                  <Link to="/register">Start Learning Free</Link>
                </Button>
                <Button size="lg" variant="outline" className="flex items-center space-x-2">
                  <Play className="h-4 w-4" />
                  <span>Watch Demo</span>
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
                    {teachers.slice(0, 3).map((teacher, i) => (
                      <Avatar key={i} className="h-8 w-8 border-2 border-white">
                        <AvatarImage src={teacher.image} alt={teacher.name} />
                        <AvatarFallback>{teacher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">2,500+ Students</div>
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
              Choose Your <span className="text-gradient">Language</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start your journey with any of our supported languages, 
              taught by native speakers and expert instructors.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {languages.map((language, index) => (
              <Card key={language.name} className="card-brand hover:scale-105 transition-transform cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{language.flag}</div>
                  <h3 className="font-semibold text-lg mb-2">{language.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>{language.students} students</div>
                    <div>{language.levels} levels</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose <span className="text-gradient">Learn Academy</span>
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
              Meet Our <span className="text-gradient">Expert Teachers</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn from certified instructors and native speakers 
              who are passionate about helping you succeed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teachers.map((teacher, index) => (
              <Card key={teacher.name} className="card-brand animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={teacher.image} alt={teacher.name} />
                    <AvatarFallback className="text-xl">
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg mb-2">{teacher.name}</h3>
                  <div className="flex justify-center space-x-1 mb-3">
                    {teacher.languages.map((lang) => (
                      <Badge key={lang} variant="secondary">{lang}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{teacher.rating}</span>
                    </div>
                    <div>{teacher.students} students</div>
                  </div>
                </CardContent>
              </Card>
            ))}
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