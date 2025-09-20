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
  Award
} from 'lucide-react';

const programs = [
  {
    id: 1,
    name: 'English for Business',
    language: 'English',
    level: 'Intermediate',
    duration: '8 weeks',
    students: 124,
    rating: 4.9,
    teacher: 'Sarah Johnson',
    description: 'Master professional English communication skills for the modern workplace',
    features: [
      'Business vocabulary and phrases',
      'Email and presentation skills',
      'Meeting and negotiation practice',
      'Industry-specific terminology'
    ],
    progress: 0,
    enrolled: false,
    price: '$299'
  },
  {
    id: 2,
    name: 'Spanish Conversation Intensive',
    language: 'Spanish',
    level: 'Beginner',
    duration: '6 weeks',
    students: 89,
    rating: 4.8,
    teacher: 'Maria Rodriguez',
    description: 'Build confidence in speaking Spanish through interactive conversation practice',
    features: [
      'Daily conversation topics',
      'Pronunciation training',
      'Cultural context lessons',
      'Small group discussions'
    ],
    progress: 45,
    enrolled: true,
    price: '$249'
  },
  {
    id: 3,
    name: 'Arabic for Beginners',
    language: 'Arabic',
    level: 'Beginner',
    duration: '12 weeks',
    students: 67,
    rating: 4.7,
    teacher: 'Ahmed Al-Rashid',
    description: 'Learn Modern Standard Arabic from alphabet to basic conversations',
    features: [
      'Arabic alphabet and writing',
      'Basic grammar structures',
      'Common phrases and greetings',
      'Cultural insights'
    ],
    progress: 0,
    enrolled: false,
    price: '$399'
  },
  {
    id: 4,
    name: 'French Literature & Culture',
    language: 'French',
    level: 'Advanced',
    duration: '10 weeks',
    students: 45,
    rating: 4.9,
    teacher: 'Claire Dubois',
    description: 'Explore French literature while perfecting advanced language skills',
    features: [
      'Classic and modern literature',
      'Literary analysis techniques',
      'Advanced grammar and style',
      'Cultural and historical context'
    ],
    progress: 0,
    enrolled: false,
    price: '$349'
  },
  {
    id: 5,
    name: 'German for Engineers',
    language: 'German',
    level: 'Intermediate',
    duration: '8 weeks',
    students: 38,
    rating: 4.6,
    teacher: 'Hans Mueller',
    description: 'Technical German language skills for engineering professionals',
    features: [
      'Technical vocabulary',
      'Engineering documentation',
      'Professional communication',
      'Industry standards and practices'
    ],
    progress: 0,
    enrolled: false,
    price: '$329'
  },
  {
    id: 6,
    name: 'Mandarin Essentials',
    language: 'Mandarin',
    level: 'Beginner',
    duration: '14 weeks',
    students: 56,
    rating: 4.5,
    teacher: 'Li Wei',
    description: 'Master the fundamentals of Mandarin Chinese language and culture',
    features: [
      'Pinyin and tones',
      'Essential characters',
      'Daily conversations',
      'Chinese culture and customs'
    ],
    progress: 0,
    enrolled: false,
    price: '$429'
  }
];

const levels = [
  { name: 'Beginner', description: 'Perfect for complete beginners', color: 'bg-green-100 text-green-800' },
  { name: 'Intermediate', description: 'For those with basic knowledge', color: 'bg-blue-100 text-blue-800' },
  { name: 'Advanced', description: 'For experienced learners', color: 'bg-purple-100 text-purple-800' },
];

export function Programs() {
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
          <div className="grid lg:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <Card key={program.id} className="card-brand overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{program.language}</Badge>
                        <Badge className={
                          program.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                          program.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }>
                          {program.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{program.name}</CardTitle>
                      <CardDescription>{program.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{program.price}</div>
                      <div className="text-sm text-muted-foreground">{program.duration}</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Progress for enrolled programs */}
                  {program.enrolled && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Your Progress</span>
                        <span>{program.progress}%</span>
                      </div>
                      <Progress value={program.progress} className="h-2" />
                    </div>
                  )}
                  
                  {/* Program Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">What you'll learn:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {program.features.map((feature) => (
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
                        <span className="font-semibold">{program.students}</span>
                      </div>
                      <div className="text-muted-foreground">Students</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{program.rating}</span>
                      </div>
                      <div className="text-muted-foreground">Rating</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center space-x-1">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{program.duration}</span>
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
                        <div className="text-sm text-muted-foreground">{program.teacher}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    {program.enrolled ? (
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
            ))}
          </div>
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