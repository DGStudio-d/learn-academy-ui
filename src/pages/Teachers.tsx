import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { Star, Users, Calendar, MessageSquare, Globe } from 'lucide-react';

const teachers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Senior English Instructor',
    languages: ['English', 'Spanish'],
    image: 'https://images.unsplash.com/photo-1494790108755-2616b332c913?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    students: 120,
    experience: '8 years',
    bio: 'Native English speaker with TESOL certification. Specializes in business English and conversation practice.',
    credentials: ['TESOL Certified', 'Cambridge CELTA', 'Business English Specialist'],
    availability: 'Mon-Fri, 9AM-6PM EST'
  },
  {
    id: 2,
    name: 'Ahmed Al-Rashid',
    title: 'Arabic Language Expert',
    languages: ['Arabic', 'English'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    students: 95,
    experience: '10 years',
    bio: 'Native Arabic speaker from Cairo. Expert in Modern Standard Arabic and Egyptian dialect.',
    credentials: ['PhD in Arabic Literature', 'Arabic Teaching Certificate', 'Cultural Studies Expert'],
    availability: 'Sun-Thu, 10AM-7PM GMT+2'
  },
  {
    id: 3,
    name: 'Maria Rodriguez',
    title: 'Spanish & French Teacher',
    languages: ['Spanish', 'French'],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    students: 108,
    experience: '6 years',
    bio: 'Bilingual educator from Barcelona. Passionate about Latin American culture and literature.',
    credentials: ['Spanish Teaching Degree', 'DELE Examiner', 'French DALF C2'],
    availability: 'Mon-Fri, 2PM-10PM CET'
  },
  {
    id: 4,
    name: 'Hans Mueller',
    title: 'German Language Specialist',
    languages: ['German', 'English'],
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 4.7,
    students: 85,
    experience: '12 years',
    bio: 'Native German speaker from Munich. Specializes in technical German and business communication.',
    credentials: ['German Linguistics Degree', 'Goethe Institute Certified', 'Business German Expert'],
    availability: 'Tue-Sat, 8AM-5PM CET'
  },
  {
    id: 5,
    name: 'Claire Dubois',
    title: 'French Literature Professor',
    languages: ['French', 'English'],
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    students: 92,
    experience: '9 years',
    bio: 'Sorbonne graduate with expertise in French literature and culture. Makes learning French engaging and fun.',
    credentials: ['Master in French Literature', 'FLE Certification', 'Cultural Studies PhD'],
    availability: 'Mon-Fri, 1PM-9PM CET'
  },
  {
    id: 6,
    name: 'Li Wei',
    title: 'Mandarin Native Speaker',
    languages: ['Mandarin', 'English'],
    image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    rating: 4.6,
    students: 78,
    experience: '7 years',
    bio: 'Beijing native with extensive experience teaching Mandarin to international students.',
    credentials: ['Mandarin Teaching Certificate', 'HSK Examiner', 'Chinese Culture Expert'],
    availability: 'Mon-Sat, 7AM-3PM GMT+8'
  }
];

export function Teachers() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-bg py-16 lg:py-24">
        <div className="container text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Meet Our Expert <span className="text-gradient">Teachers</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Learn from certified instructors and native speakers who are passionate about helping you succeed. 
            Our teachers bring years of experience and cultural insights to every lesson.
          </p>
          <Button size="lg" className="btn-hero" asChild>
            <Link to="/register">Start Learning with Our Teachers</Link>
          </Button>
        </div>
      </section>

      {/* Teachers Grid */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.map((teacher, index) => (
              <Card key={teacher.id} className="card-brand hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={teacher.image} alt={teacher.name} />
                    <AvatarFallback className="text-xl">
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{teacher.name}</CardTitle>
                  <CardDescription className="text-sm font-medium text-primary">
                    {teacher.title}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Languages */}
                  <div className="flex flex-wrap justify-center gap-1">
                    {teacher.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        {lang}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{teacher.rating}</span>
                      </div>
                      <div className="text-muted-foreground">Rating</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{teacher.students}</span>
                      </div>
                      <div className="text-muted-foreground">Students</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center space-x-1">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{teacher.experience}</span>
                      </div>
                      <div className="text-muted-foreground">Experience</div>
                    </div>
                  </div>
                  
                  {/* Bio */}
                  <p className="text-sm text-muted-foreground text-center">
                    {teacher.bio}
                  </p>
                  
                  {/* Credentials */}
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Credentials:</div>
                    <div className="flex flex-wrap gap-1">
                      {teacher.credentials.map((credential) => (
                        <Badge key={credential} variant="outline" className="text-xs">
                          {credential}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Availability */}
                  <div className="text-sm">
                    <span className="font-medium text-primary">Available: </span>
                    <span className="text-muted-foreground">{teacher.availability}</span>
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