import React, { useState, useMemo } from 'react';
import { 
  Book, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Download, 
  BookOpen,
  User,
  GraduationCap,
  Shield,
  Home
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useAuth } from '../../contexts/AuthContext';
import type { UserManualSection } from './types';

interface UserManualProps {
  sections?: UserManualSection[];
  className?: string;
}

// Default manual sections
const defaultSections: UserManualSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `
      <h3>Welcome to Learn Academy</h3>
      <p>Learn Academy is a comprehensive learning management system designed to facilitate online education. This manual will guide you through all the features and functionality available to you.</p>
      
      <h4>System Requirements</h4>
      <ul>
        <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
        <li>Stable internet connection</li>
        <li>JavaScript enabled</li>
        <li>Cookies enabled for authentication</li>
      </ul>
      
      <h4>Account Setup</h4>
      <p>To get started, you'll need to create an account or log in with existing credentials. Your account type determines what features you have access to.</p>
    `,
    order: 1,
    subsections: [
      {
        id: 'registration',
        title: 'Account Registration',
        content: `
          <h4>Creating Your Account</h4>
          <ol>
            <li>Click the "Register" button on the login page</li>
            <li>Fill in your personal information</li>
            <li>Select your role (Student or Teacher)</li>
            <li>Choose your preferred language</li>
            <li>Verify your email address</li>
          </ol>
          
          <p><strong>Note:</strong> Admin accounts are created by existing administrators.</p>
        `,
        order: 1
      },
      {
        id: 'first-login',
        title: 'First Login',
        content: `
          <h4>Logging In</h4>
          <p>After registration, use your email and password to log in. You'll be guided through an onboarding process to familiarize yourself with the interface.</p>
          
          <h4>Password Security</h4>
          <ul>
            <li>Use a strong, unique password</li>
            <li>Enable two-factor authentication if available</li>
            <li>Never share your login credentials</li>
          </ul>
        `,
        order: 2
      }
    ]
  },
  {
    id: 'student-guide',
    title: 'Student Guide',
    role: 'student',
    content: `
      <h3>Student Features Overview</h3>
      <p>As a student, you have access to learning materials, quizzes, meetings, and progress tracking tools.</p>
    `,
    order: 2,
    subsections: [
      {
        id: 'student-dashboard',
        title: 'Student Dashboard',
        content: `
          <h4>Dashboard Overview</h4>
          <p>Your dashboard is your central hub for all learning activities. Here you can:</p>
          <ul>
            <li>View enrolled programs</li>
            <li>Access available quizzes</li>
            <li>See upcoming meetings</li>
            <li>Track your progress</li>
            <li>View achievements and certificates</li>
          </ul>
          
          <h4>Navigation</h4>
          <p>Use the sidebar navigation to access different sections of the platform. The main content area shows your current activity and quick access buttons.</p>
        `,
        order: 1
      },
      {
        id: 'enrollments',
        title: 'Program Enrollment',
        content: `
          <h4>Finding Programs</h4>
          <p>Browse available programs on the Programs page. You can filter by language, level, and teacher.</p>
          
          <h4>Enrollment Process</h4>
          <ol>
            <li>Select a program you're interested in</li>
            <li>Review the program details and requirements</li>
            <li>Click "Enroll" to submit your request</li>
            <li>Wait for administrator approval</li>
            <li>Receive notification when approved</li>
          </ol>
          
          <p><strong>Note:</strong> Some programs may have prerequisites or require approval from the teacher.</p>
        `,
        order: 2
      },
      {
        id: 'taking-quizzes',
        title: 'Taking Quizzes',
        content: `
          <h4>Accessing Quizzes</h4>
          <p>Quizzes are available through your enrolled programs. Click on a quiz to view details and start taking it.</p>
          
          <h4>Quiz Interface</h4>
          <ul>
            <li>Questions are displayed one at a time or all together</li>
            <li>Your progress is automatically saved</li>
            <li>Timer shows remaining time (if applicable)</li>
            <li>Review your answers before submitting</li>
          </ul>
          
          <h4>Quiz Results</h4>
          <p>After completing a quiz, you'll see your score and detailed feedback. Some quizzes allow multiple attempts.</p>
        `,
        order: 3
      },
      {
        id: 'meetings',
        title: 'Attending Meetings',
        content: `
          <h4>Meeting Access</h4>
          <p>Scheduled meetings appear in your dashboard and meetings section. Join meetings by clicking the "Join Meeting" button when they're active.</p>
          
          <h4>Meeting Preparation</h4>
          <ul>
            <li>Test your camera and microphone beforehand</li>
            <li>Ensure stable internet connection</li>
            <li>Review any pre-meeting materials</li>
            <li>Join a few minutes early</li>
          </ul>
          
          <h4>During Meetings</h4>
          <p>Participate actively, use chat features, and follow meeting etiquette guidelines provided by your teacher.</p>
        `,
        order: 4
      }
    ]
  },
  {
    id: 'teacher-guide',
    title: 'Teacher Guide',
    role: 'teacher',
    content: `
      <h3>Teacher Features Overview</h3>
      <p>As a teacher, you can create content, manage students, and track progress across your programs.</p>
    `,
    order: 3,
    subsections: [
      {
        id: 'teacher-dashboard',
        title: 'Teacher Dashboard',
        content: `
          <h4>Dashboard Features</h4>
          <p>Your teacher dashboard provides:</p>
          <ul>
            <li>Overview of your programs and students</li>
            <li>Quick access to content creation tools</li>
            <li>Recent student activity</li>
            <li>Performance analytics</li>
            <li>Upcoming meetings and deadlines</li>
          </ul>
        `,
        order: 1
      },
      {
        id: 'creating-quizzes',
        title: 'Creating Quizzes',
        content: `
          <h4>Quiz Builder</h4>
          <p>Use the quiz builder to create engaging assessments:</p>
          <ol>
            <li>Click "Create Quiz" from your dashboard</li>
            <li>Enter quiz title and description</li>
            <li>Add questions using the question editor</li>
            <li>Configure quiz settings (time limit, attempts, etc.)</li>
            <li>Preview and publish your quiz</li>
          </ol>
          
          <h4>Question Types</h4>
          <ul>
            <li>Multiple Choice</li>
            <li>True/False</li>
            <li>Short Answer</li>
            <li>Essay Questions</li>
          </ul>
          
          <h4>Quiz Settings</h4>
          <p>Configure time limits, attempt limits, randomization, and feedback options to suit your teaching goals.</p>
        `,
        order: 2
      },
      {
        id: 'scheduling-meetings',
        title: 'Scheduling Meetings',
        content: `
          <h4>Meeting Scheduler</h4>
          <p>Create and manage virtual meetings with your students:</p>
          <ol>
            <li>Access the meeting scheduler</li>
            <li>Set date, time, and duration</li>
            <li>Add meeting description and agenda</li>
            <li>Invite students from your programs</li>
            <li>Add resources and materials</li>
            <li>Save and send invitations</li>
          </ol>
          
          <h4>Recurring Meetings</h4>
          <p>Set up recurring meetings for regular classes. Configure frequency, end date, and exceptions as needed.</p>
          
          <h4>Meeting Management</h4>
          <p>Track attendance, manage recordings, and follow up with students who missed sessions.</p>
        `,
        order: 3
      },
      {
        id: 'student-analytics',
        title: 'Student Analytics',
        content: `
          <h4>Progress Tracking</h4>
          <p>Monitor student performance through detailed analytics:</p>
          <ul>
            <li>Quiz scores and completion rates</li>
            <li>Meeting attendance</li>
            <li>Time spent on activities</li>
            <li>Progress through program materials</li>
          </ul>
          
          <h4>Reports</h4>
          <p>Generate reports for individual students or entire classes. Export data for external analysis or record keeping.</p>
          
          <h4>Intervention Strategies</h4>
          <p>Use analytics to identify students who may need additional support and reach out proactively.</p>
        `,
        order: 4
      }
    ]
  },
  {
    id: 'admin-guide',
    title: 'Administrator Guide',
    role: 'admin',
    content: `
      <h3>Administrative Functions</h3>
      <p>As an administrator, you have full control over the system, users, and settings.</p>
    `,
    order: 4,
    subsections: [
      {
        id: 'user-management',
        title: 'User Management',
        content: `
          <h4>Managing Users</h4>
          <p>Create, edit, and manage all user accounts in the system:</p>
          <ul>
            <li>Add new users individually or in bulk</li>
            <li>Assign and modify user roles</li>
            <li>Reset passwords and manage account status</li>
            <li>View user activity and login history</li>
          </ul>
          
          <h4>Bulk Operations</h4>
          <p>Import users from CSV files, perform bulk updates, and manage large numbers of accounts efficiently.</p>
        `,
        order: 1
      },
      {
        id: 'system-settings',
        title: 'System Configuration',
        content: `
          <h4>Global Settings</h4>
          <p>Configure system-wide settings:</p>
          <ul>
            <li>Site name and branding</li>
            <li>Default language and localization</li>
            <li>Registration and enrollment policies</li>
            <li>Notification settings</li>
            <li>Security and privacy options</li>
          </ul>
          
          <h4>Feature Toggles</h4>
          <p>Enable or disable features like guest access, self-registration, and various system components.</p>
        `,
        order: 2
      },
      {
        id: 'system-monitoring',
        title: 'System Monitoring',
        content: `
          <h4>Health Dashboard</h4>
          <p>Monitor system performance and health:</p>
          <ul>
            <li>Server status and uptime</li>
            <li>Database performance</li>
            <li>Resource usage (CPU, memory, disk)</li>
            <li>Error rates and response times</li>
          </ul>
          
          <h4>Alerts and Notifications</h4>
          <p>Set up alerts for critical issues and receive notifications when intervention is needed.</p>
        `,
        order: 3
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    content: `
      <h3>Common Issues and Solutions</h3>
      <p>This section covers common problems and their solutions.</p>
    `,
    order: 5,
    subsections: [
      {
        id: 'login-issues',
        title: 'Login Problems',
        content: `
          <h4>Can't Log In</h4>
          <ul>
            <li>Check your email and password are correct</li>
            <li>Ensure Caps Lock is off</li>
            <li>Clear browser cache and cookies</li>
            <li>Try a different browser</li>
            <li>Use password reset if needed</li>
          </ul>
          
          <h4>Account Locked</h4>
          <p>If your account is locked due to multiple failed login attempts, wait 15 minutes or contact an administrator.</p>
        `,
        order: 1
      },
      {
        id: 'technical-issues',
        title: 'Technical Problems',
        content: `
          <h4>Page Not Loading</h4>
          <ul>
            <li>Check your internet connection</li>
            <li>Refresh the page (Ctrl+F5 or Cmd+Shift+R)</li>
            <li>Clear browser cache</li>
            <li>Disable browser extensions temporarily</li>
            <li>Try incognito/private browsing mode</li>
          </ul>
          
          <h4>Video/Audio Issues</h4>
          <ul>
            <li>Check camera and microphone permissions</li>
            <li>Test with other applications</li>
            <li>Update browser to latest version</li>
            <li>Check firewall and antivirus settings</li>
          </ul>
        `,
        order: 2
      }
    ]
  }
];

export const UserManual: React.FC<UserManualProps> = ({
  sections = defaultSections,
  className = ''
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['getting-started']));
  const [selectedSection, setSelectedSection] = useState<string>('getting-started');

  // Filter sections by user role
  const filteredSections = useMemo(() => {
    return sections
      .filter(section => !section.role || !user || section.role === user.role)
      .sort((a, b) => a.order - b.order);
  }, [sections, user]);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    
    const query = searchQuery.toLowerCase();
    const results: Array<{ section: UserManualSection; subsection?: UserManualSection; match: string }> = [];
    
    filteredSections.forEach(section => {
      // Search in section title and content
      if (section.title.toLowerCase().includes(query) || 
          section.content.toLowerCase().includes(query)) {
        results.push({ section, match: 'section' });
      }
      
      // Search in subsections
      section.subsections?.forEach(subsection => {
        if (subsection.title.toLowerCase().includes(query) || 
            subsection.content.toLowerCase().includes(query)) {
          results.push({ section, subsection, match: 'subsection' });
        }
      });
    });
    
    return results;
  }, [filteredSections, searchQuery]);

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const selectSection = (sectionId: string, subsectionId?: string) => {
    setSelectedSection(subsectionId || sectionId);
    if (!openSections.has(sectionId)) {
      toggleSection(sectionId);
    }
  };

  const getCurrentContent = () => {
    for (const section of filteredSections) {
      if (section.id === selectedSection) {
        return section.content;
      }
      if (section.subsections) {
        for (const subsection of section.subsections) {
          if (subsection.id === selectedSection) {
            return subsection.content;
          }
        }
      }
    }
    return filteredSections[0]?.content || '';
  };

  const getCurrentTitle = () => {
    for (const section of filteredSections) {
      if (section.id === selectedSection) {
        return section.title;
      }
      if (section.subsections) {
        for (const subsection of section.subsections) {
          if (subsection.id === selectedSection) {
            return `${section.title} > ${subsection.title}`;
          }
        }
      }
    }
    return filteredSections[0]?.title || 'User Manual';
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="h-4 w-4" />;
      case 'teacher':
        return <User className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a downloadable version of the manual
    const content = filteredSections.map(section => {
      let text = `# ${section.title}\n\n${section.content}\n\n`;
      if (section.subsections) {
        section.subsections.forEach(subsection => {
          text += `## ${subsection.title}\n\n${subsection.content}\n\n`;
        });
      }
      return text;
    }).join('\n---\n\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learn-academy-user-manual.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Sidebar Navigation */}
      <div className="w-80 border-r bg-muted/30">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <Book className="h-5 w-5" />
            <h2 className="font-semibold">User Manual</h2>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search manual..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {searchQuery ? (
            /* Search Results */
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Search Results ({searchResults.length})
              </h3>
              {searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No results found.</p>
              ) : (
                searchResults.map((result, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => selectSection(result.section.id, result.subsection?.id)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(result.section.role)}
                        <span className="text-sm font-medium">
                          {result.subsection ? result.subsection.title : result.section.title}
                        </span>
                      </div>
                      {result.subsection && (
                        <div className="text-xs text-muted-foreground">
                          in {result.section.title}
                        </div>
                      )}
                    </div>
                  </Button>
                ))
              )}
            </div>
          ) : (
            /* Table of Contents */
            <div className="p-4 space-y-2">
              {filteredSections.map((section) => (
                <div key={section.id}>
                  <Collapsible
                    open={openSections.has(section.id)}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant={selectedSection === section.id ? "secondary" : "ghost"}
                        className="w-full justify-between text-left"
                        onClick={() => selectSection(section.id)}
                      >
                        <div className="flex items-center gap-2">
                          {getRoleIcon(section.role)}
                          <span className="font-medium">{section.title}</span>
                          {section.role && (
                            <Badge variant="outline" className="text-xs">
                              {section.role}
                            </Badge>
                          )}
                        </div>
                        {section.subsections && section.subsections.length > 0 && (
                          openSections.has(section.id) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>

                    {section.subsections && (
                      <CollapsibleContent className="ml-4 mt-1 space-y-1">
                        {section.subsections
                          .sort((a, b) => a.order - b.order)
                          .map((subsection) => (
                            <Button
                              key={subsection.id}
                              variant={selectedSection === subsection.id ? "secondary" : "ghost"}
                              className="w-full justify-start text-left text-sm"
                              onClick={() => selectSection(section.id, subsection.id)}
                            >
                              <BookOpen className="h-3 w-3 mr-2" />
                              {subsection.title}
                            </Button>
                          ))}
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{getCurrentTitle()}</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                {/* <Print className="h-4 w-4 mr-2" /> */}
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-4xl">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: getCurrentContent() }}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};