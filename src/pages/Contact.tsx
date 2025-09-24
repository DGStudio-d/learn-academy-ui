import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Send us an email and we\'ll respond within 24 hours',
    contact: 'hello@learnacademy.com',
    action: 'mailto:hello@learnacademy.com'
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Speak with our support team directly',
    contact: '+1 (555) 123-4567',
    action: 'tel:+15551234567'
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with us in real-time during business hours',
    contact: 'Available 9AM-6PM EST',
    action: '#'
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    description: 'Come see us at our main office',
    contact: '123 Learning St, Education City',
    action: '#'
  }
];

const officeHours = [
  { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM EST' },
  { day: 'Saturday', hours: '10:00 AM - 4:00 PM EST' },
  { day: 'Sunday', hours: 'Closed' },
];

export function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-bg py-16 lg:py-24">
        <div className="container text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Have questions about our programs? Need help getting started? 
            Our friendly team is here to help you on your language learning journey.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <Card key={method.title} className="card-brand text-center hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary shadow-brand mb-4">
                    <method.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={method.action}>{method.contact}</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="card-brand">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help you?" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your question or how we can assist you..."
                    rows={6}
                  />
                </div>
                
                <Button className="w-full btn-hero">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Office Hours & Info */}
            <div className="space-y-6">
              <Card className="card-brand">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Office Hours</span>
                  </CardTitle>
                  <CardDescription>When you can reach us directly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {officeHours.map((schedule) => (
                    <div key={schedule.day} className="flex justify-between items-center">
                      <span className="font-medium">{schedule.day}</span>
                      <span className="text-muted-foreground">{schedule.hours}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="card-brand">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Quick answers to common questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">How do I get started?</h4>
                    <p className="text-sm text-muted-foreground">
                      Simply create a free account, choose your language and level, 
                      and you'll be automatically enrolled in the appropriate program.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Can I try before I buy?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes! We offer a free trial that includes access to sample lessons 
                      and practice quizzes.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">What if I need to change my schedule?</h4>
                    <p className="text-sm text-muted-foreground">
                      Our classes are flexible. You can reschedule meetings and 
                      access recorded sessions anytime.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Contact;
