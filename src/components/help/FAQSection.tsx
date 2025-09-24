import React, { useState, useMemo } from 'react';
import { Search, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Filter, Tag } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/AuthContext';
import type { FAQItem } from './types';

interface FAQSectionProps {
  faqs?: FAQItem[];
  onFeedback?: (faqId: string, helpful: boolean) => void;
  className?: string;
}

// Default FAQ data
const defaultFAQs: FAQItem[] = [
  // General FAQs
  {
    id: 'general-1',
    question: 'How do I reset my password?',
    answer: 'To reset your password, click on the "Forgot Password" link on the login page. Enter your email address and follow the instructions sent to your email.',
    category: 'Account',
    tags: ['password', 'login', 'account'],
    helpful_count: 45,
    not_helpful_count: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'general-2',
    question: 'How do I change my language preference?',
    answer: 'You can change your language preference in your profile settings. Go to Profile > Settings > Language and select your preferred language from the dropdown.',
    category: 'Settings',
    tags: ['language', 'settings', 'profile'],
    helpful_count: 32,
    not_helpful_count: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'general-3',
    question: 'Is my data secure?',
    answer: 'Yes, we take data security seriously. All data is encrypted in transit and at rest. We follow industry best practices for data protection and comply with relevant privacy regulations.',
    category: 'Security',
    tags: ['security', 'privacy', 'data'],
    helpful_count: 28,
    not_helpful_count: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // Student FAQs
  {
    id: 'student-1',
    question: 'How do I enroll in a program?',
    answer: 'To enroll in a program, browse the available programs on the Programs page, select the one you\'re interested in, and click "Enroll". Your enrollment will be reviewed by an administrator.',
    category: 'Enrollment',
    tags: ['enrollment', 'programs', 'registration'],
    role: 'student',
    helpful_count: 67,
    not_helpful_count: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-2',
    question: 'How do I take a quiz?',
    answer: 'Once enrolled in a program, you can access quizzes from your dashboard or the program page. Click on a quiz to start it. Make sure you have a stable internet connection as your progress is saved automatically.',
    category: 'Quizzes',
    tags: ['quiz', 'assessment', 'learning'],
    role: 'student',
    helpful_count: 89,
    not_helpful_count: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-3',
    question: 'Can I retake a quiz?',
    answer: 'Quiz retake policies depend on the specific quiz settings set by your teacher. Some quizzes allow multiple attempts while others may be limited. Check the quiz description for details.',
    category: 'Quizzes',
    tags: ['quiz', 'retake', 'attempts'],
    role: 'student',
    helpful_count: 54,
    not_helpful_count: 8,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-4',
    question: 'How do I join a meeting?',
    answer: 'You can join meetings from your dashboard or the meetings section. Click the "Join Meeting" button when the meeting is active. Make sure your browser allows camera and microphone access.',
    category: 'Meetings',
    tags: ['meetings', 'video', 'attendance'],
    role: 'student',
    helpful_count: 76,
    not_helpful_count: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // Teacher FAQs
  {
    id: 'teacher-1',
    question: 'How do I create a quiz?',
    answer: 'Go to your teacher dashboard and click "Create Quiz". Use the quiz builder to add questions, set time limits, and configure other settings. You can preview the quiz before publishing it.',
    category: 'Content Creation',
    tags: ['quiz', 'creation', 'teaching'],
    role: 'teacher',
    helpful_count: 43,
    not_helpful_count: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'teacher-2',
    question: 'How do I schedule a meeting?',
    answer: 'Use the meeting scheduler in your dashboard. Set the date, time, duration, and invite students. You can create recurring meetings and add resources for students to access.',
    category: 'Meetings',
    tags: ['meetings', 'scheduling', 'calendar'],
    role: 'teacher',
    helpful_count: 38,
    not_helpful_count: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'teacher-3',
    question: 'How can I track student progress?',
    answer: 'The student analytics section provides detailed insights into student performance, including quiz scores, meeting attendance, and overall progress. You can export this data for further analysis.',
    category: 'Analytics',
    tags: ['analytics', 'progress', 'tracking'],
    role: 'teacher',
    helpful_count: 52,
    not_helpful_count: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'teacher-4',
    question: 'Can I share resources with students?',
    answer: 'Yes, you can upload and share resources through the content management section. Files can be attached to meetings or made available in program materials.',
    category: 'Content Management',
    tags: ['resources', 'files', 'sharing'],
    role: 'teacher',
    helpful_count: 29,
    not_helpful_count: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // Admin FAQs
  {
    id: 'admin-1',
    question: 'How do I manage user accounts?',
    answer: 'Use the User Management section to create, edit, and delete user accounts. You can also manage roles, permissions, and bulk operations like importing users from CSV files.',
    category: 'User Management',
    tags: ['users', 'accounts', 'management'],
    role: 'admin',
    helpful_count: 25,
    not_helpful_count: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'admin-2',
    question: 'How do I configure system settings?',
    answer: 'Access system settings from the admin dashboard. You can configure site-wide settings, notification preferences, guest access permissions, and other system parameters.',
    category: 'System Configuration',
    tags: ['settings', 'configuration', 'system'],
    role: 'admin',
    helpful_count: 18,
    not_helpful_count: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'admin-3',
    question: 'How do I monitor system health?',
    answer: 'The System Health dashboard provides real-time monitoring of server status, database performance, and resource usage. Set up alerts for critical issues.',
    category: 'System Monitoring',
    tags: ['monitoring', 'health', 'performance'],
    role: 'admin',
    helpful_count: 22,
    not_helpful_count: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'admin-4',
    question: 'How do I backup system data?',
    answer: 'Use the backup management tools to schedule automatic backups or create manual backups. You can download backup files and configure retention policies.',
    category: 'Data Management',
    tags: ['backup', 'data', 'recovery'],
    role: 'admin',
    helpful_count: 31,
    not_helpful_count: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const FAQSection: React.FC<FAQSectionProps> = ({
  faqs = defaultFAQs,
  onFeedback,
  className = ''
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [userFeedback, setUserFeedback] = useState<Record<string, boolean>>({});

  // Filter FAQs based on user role, search, category, and tags
  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      // Role filter
      if (faq.role && user && faq.role !== user.role) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesQuestion = faq.question.toLowerCase().includes(query);
        const matchesAnswer = faq.answer.toLowerCase().includes(query);
        const matchesTags = faq.tags.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesQuestion && !matchesAnswer && !matchesTags) return false;
      }
      
      // Category filter
      if (selectedCategory !== 'all' && faq.category !== selectedCategory) return false;
      
      // Tag filter
      if (selectedTag !== 'all' && !faq.tags.includes(selectedTag)) return false;
      
      return true;
    });
  }, [faqs, user, searchQuery, selectedCategory, selectedTag]);

  // Get unique categories and tags for filters
  const categories = useMemo(() => {
    const roleFilteredFAQs = faqs.filter(faq => !faq.role || !user || faq.role === user.role);
    return Array.from(new Set(roleFilteredFAQs.map(faq => faq.category))).sort();
  }, [faqs, user]);

  const tags = useMemo(() => {
    const roleFilteredFAQs = faqs.filter(faq => !faq.role || !user || faq.role === user.role);
    return Array.from(new Set(roleFilteredFAQs.flatMap(faq => faq.tags))).sort();
  }, [faqs, user]);

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const handleFeedback = (faqId: string, helpful: boolean) => {
    setUserFeedback(prev => ({ ...prev, [faqId]: helpful }));
    if (onFeedback) {
      onFeedback(faqId, helpful);
    }
    
    // Track feedback
    window.dispatchEvent(new CustomEvent('help:faq_feedback', {
      detail: { faqId, helpful, timestamp: new Date().toISOString() }
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag('all');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <p className="text-muted-foreground">
          Find answers to common questions about using Learn Academy
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {tags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || selectedCategory !== 'all' || selectedTag !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredFAQs.length} of {faqs.filter(faq => !faq.role || !user || faq.role === user.role).length} FAQs
          </div>
        </CardContent>
      </Card>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No FAQs found matching your search criteria.
              </p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq) => (
            <Card key={faq.id} className="overflow-hidden">
              <Collapsible
                open={openItems.has(faq.id)}
                onOpenChange={() => toggleItem(faq.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-left">
                        <CardTitle className="text-base font-medium">
                          {faq.question}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {faq.category}
                          </Badge>
                          {faq.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {faq.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{faq.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          {faq.helpful_count} helpful
                        </div>
                        {openItems.has(faq.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    
                    <div className="space-y-4">
                      <p className="text-sm leading-relaxed">{faq.answer}</p>
                      
                      {/* Feedback */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-xs text-muted-foreground">
                          Was this helpful?
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={userFeedback[faq.id] === true ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFeedback(faq.id, true)}
                            className="flex items-center gap-1"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            Yes ({faq.helpful_count})
                          </Button>
                          <Button
                            variant={userFeedback[faq.id] === false ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFeedback(faq.id, false)}
                            className="flex items-center gap-1"
                          >
                            <ThumbsDown className="h-3 w-3" />
                            No ({faq.not_helpful_count})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};