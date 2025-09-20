import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Globe, 
  Target,
  Award,
  Clock,
  MessageSquare,
  Video,
  CheckCircle
} from 'lucide-react';

const stats = [
  { label: 'Students Worldwide', value: '10,000+', icon: Users },
  { label: 'Languages Offered', value: '6+', icon: Globe },
  { label: 'Expert Teachers', value: '50+', icon: Award },
  { label: 'Success Rate', value: '95%', icon: Target },
];

const features = [
  {
    icon: BookOpen,
    title: 'Interactive Curriculum',
    description: 'Comprehensive learning materials designed by language experts and educators.'
  },
  {
    icon: Video,
    title: 'Live Sessions',
    description: 'Real-time video classes with native speakers and certified instructors.'
  },
  {
    icon: MessageSquare,
    title: 'Practice Quizzes',
    description: 'Regular assessments to track your progress and reinforce learning.'
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Learn at your own pace with classes available 24/7 across all time zones.'
  },
];

const values = [
  'Excellence in language education',
  'Cultural understanding and respect',
  'Personalized learning experiences',
  'Community and collaboration',
  'Innovation in teaching methods',
  'Accessibility for all learners'
];

export function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-bg py-16 lg:py-24">
        <div className="container text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            About <span className="text-gradient">Learn Academy</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We're passionate about breaking down language barriers and connecting people across cultures. 
            Since 2020, we've been empowering students worldwide to master new languages through innovative 
            teaching methods and expert instruction.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={stat.label} className="card-brand text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-8">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary shadow-brand mb-4">
                    <stat.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="text-3xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-slate-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Our <span className="text-gradient">Mission</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                At Learn Academy, we believe that language learning is more than just grammar and vocabulary—
                it's about opening doors to new cultures, opportunities, and connections. Our mission is to 
                make quality language education accessible to everyone, regardless of their background or location.
              </p>
              <p className="text-lg text-muted-foreground">
                We combine traditional teaching methods with cutting-edge technology to create personalized 
                learning experiences that adapt to each student's unique pace and style. Our expert instructors 
                are not just language teachers—they're cultural ambassadors who help you understand the context 
                and nuances that make each language special.
              </p>
              <Button size="lg" className="btn-hero" asChild>
                <Link to="/register">Join Our Community</Link>
              </Button>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                alt="Students learning together"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              What Makes Us <span className="text-gradient">Different</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our approach to language learning combines proven pedagogical methods with innovative 
              technology to deliver exceptional results.
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

      {/* Values Section */}
      <section className="py-20 bg-slate-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop"
                alt="Diverse group of students"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Our <span className="text-gradient">Values</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                These core values guide everything we do at Learn Academy and shape the experience 
                we create for our students and teachers.
              </p>
              <div className="space-y-3">
                {values.map((value, index) => (
                  <div key={value} className="flex items-center space-x-3 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-lg">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Meet Our <span className="text-gradient">Leadership Team</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Our experienced team of educators, technologists, and language experts work together 
            to create the best possible learning experience.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Emily Chen',
                role: 'Founder & CEO',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b332c913?w=300&h=300&fit=crop&crop=face',
                bio: 'PhD in Applied Linguistics, 15+ years in language education'
              },
              {
                name: 'Miguel Santos',
                role: 'Head of Curriculum',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
                bio: 'Master\'s in Education, former university language department head'
              },
              {
                name: 'Aisha Patel',
                role: 'Director of Technology',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
                bio: 'Computer Science background, expert in educational technology'
              }
            ].map((member, index) => (
              <Card key={member.name} className="card-brand animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-8 text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-bg">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Join Our <span className="text-gradient">Community?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Become part of a global community of language learners and take the first step 
            toward mastering a new language today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-hero" asChild>
              <Link to="/register">Start Your Journey</Link>
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