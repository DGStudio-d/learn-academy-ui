import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Share2,
  BarChart3,
  Users,
  Clock,
  Target,
  Calendar,
  Loader2,
  FileText
} from 'lucide-react';
import { useTeacherQuizzes, useDeleteQuiz, useTeacherPrograms } from '../../hooks/useTeacher';
import { QuizBuilder } from './QuizBuilder';
import { QuizAnalyticsDashboard } from './QuizAnalyticsDashboard';
import { toast } from '../ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

export const QuizManagementSystem: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [selectedQuizForAnalytics, setSelectedQuizForAnalytics] = useState<number | undefined>();
  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);

  const { data: quizzesData, isLoading: quizzesLoading, refetch: refetchQuizzes } = useTeacherQuizzes();
  const { data: programsData } = useTeacherPrograms();
  const deleteQuizMutation = useDeleteQuiz();

  const quizzes = quizzesData?.data?.data || [];
  const programs = programsData?.data?.data || [];

  // Filter quizzes based on search and program
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = !selectedProgram || selectedProgram === 'all' || quiz.program_id.toString() === selectedProgram;
    return matchesSearch && matchesProgram;
  });

  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setShowCreateQuiz(true);
  };

  const handleEditQuiz = (quiz: any) => {
    setEditingQuiz(quiz);
    setShowCreateQuiz(true);
  };

  const handleDeleteQuiz = async (quizId: number) => {
    try {
      await deleteQuizMutation.mutateAsync(quizId);
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      refetchQuizzes();
      setQuizToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      });
    }
  };

  const handleViewAnalytics = (quizId: number) => {
    setSelectedQuizForAnalytics(quizId);
    setSelectedTab('analytics');
  };

  const handleShareQuiz = (quiz: any) => {
    const shareUrl = `${window.location.origin}/quiz/${quiz.id}/share`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Success",
      description: "Quiz share URL copied to clipboard",
    });
  };

  const renderOverviewTab = () => {
    if (showCreateQuiz) {
      return (
        <QuizBuilder
          initialData={editingQuiz}
          onSave={() => {
            setShowCreateQuiz(false);
            setEditingQuiz(null);
            refetchQuizzes();
          }}
          onCancel={() => {
            setShowCreateQuiz(false);
            setEditingQuiz(null);
          }}
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Header with Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedProgram} onValueChange={setSelectedProgram}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id.toString()}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreateQuiz}>
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
        </div>

        {/* Quiz Grid */}
        {quizzesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || selectedProgram ? 'No quizzes found' : 'No quizzes created yet'}
            </h3>
            <p className="text-sm mb-4">
              {searchTerm || selectedProgram 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first quiz to get started'
              }
            </p>
            {!searchTerm && !selectedProgram && (
              <Button onClick={handleCreateQuiz}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Quiz
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {quiz.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditQuiz(quiz)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewAnalytics(quiz.id)}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShareQuiz(quiz)}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setQuizToDelete(quiz.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Quiz Stats */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span>{quiz.questions?.length || 0} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{quiz.time_limit || 30} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span>{quiz.max_attempts || '∞'} attempts</span>
                    </div>
                  </div>

                  {/* Program and Status */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {quiz.program?.name || 'No Program'}
                    </Badge>
                    <Badge variant={quiz.is_active ? 'default' : 'secondary'}>
                      {quiz.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Guest Access */}
                  {quiz.guest_can_access && (
                    <Badge variant="outline" className="w-fit">
                      <Users className="h-3 w-3 mr-1" />
                      Guest Access
                    </Badge>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    Created {new Date(quiz.created_at).toLocaleDateString()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEditQuiz(quiz)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleViewAnalytics(quiz.id)}
                      className="flex-1"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quiz Management</h1>
        <p className="text-muted-foreground">Create, manage, and analyze your quizzes</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Quiz Overview</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <QuizAnalyticsDashboard quizId={selectedQuizForAnalytics} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!quizToDelete} onOpenChange={() => setQuizToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quiz? This action cannot be undone.
              All quiz attempts and analytics data will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => quizToDelete && handleDeleteQuiz(quizToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizManagementSystem;