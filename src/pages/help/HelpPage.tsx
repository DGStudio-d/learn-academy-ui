import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { HelpSystem } from '../../components/help/HelpSystem';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  HelpCircle, 
  MessageCircle, 
  Book, 
  Play, 
  Mail, 
  Phone,
  ExternalLink,
  Clock,
  Users
} from 'lucide-react';

export function HelpPage() {
  const { user } = useAuth();

  const contactInfo = {
    email: 'support@learnacademy.com',
    phone: '+1 (555) 123-4567',
    hours: 'Monday - Friday, 9:00 AM - 6:00 PM EST',
    responseTime: 'Usually within 24 hours'
  };

  const quickLinks = {
    student: [
      { title: 'How to Enroll in Programs', href: '#enrollment' },
      { title: 'Taking Your First Quiz', href: '#quiz-guide' },
      { title: 'Joining Virtual Meetings', href: '#meetings' },
      { title: 'Tracking Your Progress', href: '#progress' }
    ],
    teacher: [
      { title: 'Creating Engaging Quizzes', href: '#quiz-creation' },
      { title: 'Scheduling Meetings', href: '#meeting-scheduler' },
      { title: 'Managing Student Progress', href: '#student-analytics' },
      { title: 'Content Management Tips', href: '#content-management' }
    ],
    admin: [
      { title: 'User Management Guide', href: '#user-management' },
      { title: 'System Configuration', href: '#system-config' },
      { title: 'Monitoring System Health', href: '#system-health' },
      { title: 'Backup and Recovery', href: '#backup-recovery' }
    ]
  };

  const currentQuickLinks = user ? quickLinks[user.role as keyof typeof quickLinks] || [] : [];

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Help & Support</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get the help you need to make the most of Learn Academy. Find answers, 
          learn new features, and get support when you need it.
        </p>
        {user && (
          <Badge variant="outline" className="text-sm">
            Viewing help for: {user.role}
          </Badge>
        )}
      </div>

      {/* Quick Access Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Find quick answers to common questions about using the platform.
            </p>
            <Button className="w-full">
              Browse FAQ
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Book className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>User Manual</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Comprehensive documentation covering all features and functionality.
            </p>
            <Button className="w-full">
              Read Manual
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Play className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>Interactive Tutorial</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Take a guided tour to learn about features step by step.
            </p>
            <Button className="w-full">
              Start Tutorial
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links for Current Role */}
      {currentQuickLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Quick Links for {user?.role}s
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {currentQuickLinks.map((link, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto p-4"
                  asChild
                >
                  <a href={link.href} className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>{link.title}</span>
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">{contactInfo.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">{contactInfo.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Support Hours</p>
                  <p className="text-sm text-muted-foreground">{contactInfo.hours}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Response Time</p>
                  <p className="text-sm text-muted-foreground">{contactInfo.responseTime}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button asChild>
              <a href={`mailto:${contactInfo.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`tel:${contactInfo.phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>All systems operational</span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/status" target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Status Page
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Embedded Help System */}
      <HelpSystem />
    </div>
  );
};

export default HelpPage;