import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus, 
  Trash2, 
  Save, 
  Settings, 
  Clock, 
  Users, 
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Copy,
  GripVertical,
  Share2,
  Link,
  Mail
} from 'lucide-react';
import { useTeacherPrograms, useTeacherLanguages, useCreateAdvancedQuiz } from '../../hooks/useTeacher';
import { toast } from '../ui/use-toast';
import type { AdvancedQuestion, QuizSettings } from '../../types/api';

// Drag and Drop functionality
interface DragItem {
  index: number;
  type: string;
}

const useDragAndDrop = (items: any[], setItems: (items: any[]) => void) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedItem({ index, type: 'question' });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const dragIndex = draggedItem.index;
    if (dragIndex === dropIndex) return;

    const newItems = [...items];
    const draggedElement = newItems[dragIndex];
    
    // Remove dragged item
    newItems.splice(dragIndex, 1);
    
    // Insert at new position
    const insertIndex = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newItems.splice(insertIndex, 0, draggedElement);
    
    setItems(newItems);
    setDraggedItem(null);
  }, [draggedItem, items, setItems]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  return {
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  };
};

interface QuizBuilderProps {
  onSave?: (quiz: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({ onSave, onCancel, initialData }) => {
  const [quizData, setQuizData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    program_id: initialData?.program_id || '',
    language_id: initialData?.language_id || '',
  });

  const [questions, setQuestions] = useState<AdvancedQuestion[]>(
    initialData?.questions || [
      {
        question: '',
        type: 'multiple_choice' as const,
        answers: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
        points: 1,
      }
    ]
  );

  const [settings, setSettings] = useState<QuizSettings>(
    initialData?.settings || {
      time_limit: 30,
      max_attempts: 3,
      guest_can_access: false,
      show_results_immediately: true,
      allow_review: true,
      randomize_questions: false,
      randomize_answers: false,
      passing_score: 70,
    }
  );

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const { data: programs } = useTeacherPrograms();
  const { data: languages } = useTeacherLanguages();
  const createQuizMutation = useCreateAdvancedQuiz();

  // Drag and drop functionality
  const {
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  } = useDragAndDrop(questions, setQuestions);

  const addQuestion = () => {
    const newQuestion: AdvancedQuestion = {
      question: '',
      type: 'multiple_choice',
      answers: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof AdvancedQuestion, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateAnswer = (questionIndex: number, answerIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const answers = [...updatedQuestions[questionIndex].answers];
    answers[answerIndex] = value;
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], answers };
    setQuestions(updatedQuestions);
  };

  const addAnswer = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers.push('');
    setQuestions(updatedQuestions);
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].answers.length > 2) {
      updatedQuestions[questionIndex].answers.splice(answerIndex, 1);
      // Adjust correct answer if needed
      if (updatedQuestions[questionIndex].correct_answer >= answerIndex) {
        updatedQuestions[questionIndex].correct_answer = Math.max(0, updatedQuestions[questionIndex].correct_answer - 1);
      }
      setQuestions(updatedQuestions);
    }
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < questions.length) {
      const updatedQuestions = [...questions];
      [updatedQuestions[index], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[index]];
      setQuestions(updatedQuestions);
    }
  };

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = { ...questions[index] };
    questionToDuplicate.question = `${questionToDuplicate.question} (Copy)`;
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index + 1, 0, questionToDuplicate);
    setQuestions(updatedQuestions);
  };

  const handleSave = async () => {
    if (!quizData.title.trim()) {
      toast({
        title: "Error",
        description: "Quiz title is required",
        variant: "destructive",
      });
      return;
    }

    if (!quizData.program_id || !quizData.language_id) {
      toast({
        title: "Error",
        description: "Please select a program and language",
        variant: "destructive",
      });
      return;
    }

    const validQuestions = questions.filter(q => q.question.trim() && q.answers.some(a => a.trim()));
    if (validQuestions.length === 0) {
      toast({
        title: "Error",
        description: "At least one complete question is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const quizPayload = {
        ...quizData,
        program_id: parseInt(quizData.program_id),
        language_id: parseInt(quizData.language_id),
        questions: validQuestions,
        settings,
      };

      const result = await createQuizMutation.mutateAsync(quizPayload);
      
      // Generate share URL
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/quiz/${result.id}/share`);
      
      toast({
        title: "Success",
        description: "Quiz created successfully",
      });

      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quiz",
        variant: "destructive",
      });
    }
  };

  const handleShareQuiz = () => {
    setShowShareDialog(true);
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Success",
      description: "Share URL copied to clipboard",
    });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Quiz: ${quizData.title}`);
    const body = encodeURIComponent(`I'd like to share this quiz with you: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quiz Builder</h2>
        <div className="flex space-x-2">
          {shareUrl && (
            <Button variant="outline" onClick={handleShareQuiz}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={createQuizMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {createQuizMutation.isPending ? 'Saving...' : 'Save Quiz'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          {shareUrl && <TabsTrigger value="share">Share & Collaborate</TabsTrigger>}
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Information</CardTitle>
              <CardDescription>Basic details about your quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Quiz Title *</Label>
                  <Input
                    id="title"
                    value={quizData.title}
                    onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                    placeholder="Enter quiz title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program">Program *</Label>
                  <Select
                    value={quizData.program_id}
                    onValueChange={(value) => setQuizData({ ...quizData, program_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs?.data.data.map((program) => (
                        <SelectItem key={program.id} value={program.id.toString()}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language *</Label>
                  <Select
                    value={quizData.language_id}
                    onValueChange={(value) => setQuizData({ ...quizData, language_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages?.map((language) => (
                        <SelectItem key={language.id} value={language.id.toString()}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={quizData.description}
                  onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                  placeholder="Describe what this quiz covers"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
            <Button onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {questions.map((question, questionIndex) => (
            <Card 
              key={questionIndex}
              className={`transition-all duration-200 ${
                draggedItem?.index === questionIndex ? 'opacity-50 scale-95' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, questionIndex)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, questionIndex)}
              onDragEnd={handleDragEnd}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">Question {questionIndex + 1}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveQuestion(questionIndex, 'up')}
                      disabled={questionIndex === 0}
                      title="Move up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveQuestion(questionIndex, 'down')}
                      disabled={questionIndex === questions.length - 1}
                      title="Move down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateQuestion(questionIndex)}
                      title="Duplicate question"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeQuestion(questionIndex)}
                      disabled={questions.length === 1}
                      title="Delete question"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Question Text *</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                      placeholder="Enter your question"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => updateQuestion(questionIndex, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="true_false">True/False</SelectItem>
                          <SelectItem value="short_answer">Short Answer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min="1"
                        value={question.points}
                        onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </div>

                {question.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Answer Options</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addAnswer(questionIndex)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Option
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {question.answers.map((answer, answerIndex) => (
                        <div key={answerIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correct-${questionIndex}`}
                            checked={question.correct_answer === answerIndex}
                            onChange={() => updateQuestion(questionIndex, 'correct_answer', answerIndex)}
                            className="mt-1"
                          />
                          <Input
                            value={answer}
                            onChange={(e) => updateAnswer(questionIndex, answerIndex, e.target.value)}
                            placeholder={`Option ${answerIndex + 1}`}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeAnswer(questionIndex, answerIndex)}
                            disabled={question.answers.length <= 2}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {question.type === 'true_false' && (
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Select
                      value={question.correct_answer.toString()}
                      onValueChange={(value) => updateQuestion(questionIndex, 'correct_answer', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">True</SelectItem>
                        <SelectItem value="1">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Explanation (Optional)</Label>
                  <Textarea
                    value={question.explanation}
                    onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                    placeholder="Explain the correct answer"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Quiz Settings
              </CardTitle>
              <CardDescription>Configure how your quiz behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                    <Input
                      id="time-limit"
                      type="number"
                      min="1"
                      value={settings.time_limit}
                      onChange={(e) => setSettings({ ...settings, time_limit: parseInt(e.target.value) || undefined })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-attempts">Maximum Attempts</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      min="1"
                      value={settings.max_attempts}
                      onChange={(e) => setSettings({ ...settings, max_attempts: parseInt(e.target.value) || undefined })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passing-score">Passing Score (%)</Label>
                    <Input
                      id="passing-score"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.passing_score}
                      onChange={(e) => setSettings({ ...settings, passing_score: parseInt(e.target.value) || undefined })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="guest-access">Allow Guest Access</Label>
                    <Switch
                      id="guest-access"
                      checked={settings.guest_can_access}
                      onCheckedChange={(checked) => setSettings({ ...settings, guest_can_access: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-results">Show Results Immediately</Label>
                    <Switch
                      id="show-results"
                      checked={settings.show_results_immediately}
                      onCheckedChange={(checked) => setSettings({ ...settings, show_results_immediately: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-review">Allow Review</Label>
                    <Switch
                      id="allow-review"
                      checked={settings.allow_review}
                      onCheckedChange={(checked) => setSettings({ ...settings, allow_review: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="randomize-questions">Randomize Questions</Label>
                    <Switch
                      id="randomize-questions"
                      checked={settings.randomize_questions}
                      onCheckedChange={(checked) => setSettings({ ...settings, randomize_questions: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="randomize-answers">Randomize Answers</Label>
                    <Switch
                      id="randomize-answers"
                      checked={settings.randomize_answers}
                      onCheckedChange={(checked) => setSettings({ ...settings, randomize_answers: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Preview</CardTitle>
              <CardDescription>Preview how your quiz will appear to students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-xl font-bold">{quizData.title || 'Untitled Quiz'}</h3>
                  {quizData.description && (
                    <p className="text-muted-foreground mt-2">{quizData.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {settings.time_limit && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {settings.time_limit} min
                      </Badge>
                    )}
                    {settings.max_attempts && (
                      <Badge variant="outline">
                        {settings.max_attempts} attempts
                      </Badge>
                    )}
                    {settings.passing_score && (
                      <Badge variant="outline">
                        {settings.passing_score}% to pass
                      </Badge>
                    )}
                    {settings.guest_can_access && (
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        Guest access
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium">
                          {index + 1}. {question.question || 'Question text not set'}
                        </h4>
                        <Badge variant="secondary">{question.points} pt{question.points !== 1 ? 's' : ''}</Badge>
                      </div>
                      
                      {question.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {question.answers.map((answer, answerIndex) => (
                            <div key={answerIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`preview-${index}`}
                                disabled
                                className="text-primary"
                              />
                              <span className={answer.trim() ? '' : 'text-muted-foreground italic'}>
                                {answer.trim() || `Option ${answerIndex + 1} not set`}
                              </span>
                              {question.correct_answer === answerIndex && (
                                <Badge variant="default" className="text-xs">Correct</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === 'true_false' && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="radio" name={`preview-${index}`} disabled />
                            <span>True</span>
                            {question.correct_answer === 0 && (
                              <Badge variant="default" className="text-xs">Correct</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="radio" name={`preview-${index}`} disabled />
                            <span>False</span>
                            {question.correct_answer === 1 && (
                              <Badge variant="default" className="text-xs">Correct</Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {question.type === 'short_answer' && (
                        <Input placeholder="Student will type their answer here" disabled />
                      )}

                      {question.explanation && (
                        <div className="mt-3 p-2 bg-muted rounded text-sm">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {shareUrl && (
          <TabsContent value="share" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Quiz
                </CardTitle>
                <CardDescription>Share this quiz with students or other teachers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Quiz Share URL</Label>
                  <div className="flex space-x-2">
                    <Input value={shareUrl} readOnly className="flex-1" />
                    <Button variant="outline" onClick={copyShareUrl}>
                      <Link className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={shareViaEmail} className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Share via Email
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: quizData.title,
                          text: `Check out this quiz: ${quizData.title}`,
                          url: shareUrl,
                        });
                      } else {
                        copyShareUrl();
                      }
                    }}
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Collaboration Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow-guest-access">Allow Guest Access</Label>
                      <Switch
                        id="allow-guest-access"
                        checked={settings.guest_can_access}
                        onCheckedChange={(checked) => setSettings({ ...settings, guest_can_access: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="public-results">Show Results Publicly</Label>
                      <Switch
                        id="public-results"
                        checked={settings.show_results_immediately}
                        onCheckedChange={(checked) => setSettings({ ...settings, show_results_immediately: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Sharing Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Students can access this quiz directly via the share URL</li>
                    <li>• Guest access allows anonymous quiz taking</li>
                    <li>• You can track all attempts in the analytics dashboard</li>
                    <li>• Share URL remains active as long as the quiz is published</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default QuizBuilder;