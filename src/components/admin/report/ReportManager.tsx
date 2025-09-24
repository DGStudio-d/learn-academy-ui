import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  BarChart3, 
  Users, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Download,
  Settings,
  Clock,
  Mail
} from 'lucide-react';
import { useDataExportImport } from '@/hooks/useDataExportImport';
import { ReportRequest } from '@/services/dataExportImportService';
import { ReportHistory } from './ReportHistory';

export const ReportManager: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('user_activity');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [format, setFormat] = useState<'pdf' | 'excel' | 'html'>('pdf');
  const [showScheduling, setShowScheduling] = useState(false);
  const [schedule, setSchedule] = useState({
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    time: '09:00',
    recipients: ['']
  });

  const {
    generateReport,
    reportTypes,
    isGeneratingReport
  } = useDataExportImport();

  const reportTypeIcons = {
    user_activity: Users,
    quiz_performance: BarChart3,
    program_analytics: BookOpen,
    system_usage: TrendingUp
  };

  const handleGenerateReport = () => {
    const request: ReportRequest = {
      type: selectedType as any,
      parameters,
      format,
      ...(showScheduling && {
        schedule: {
          ...schedule,
          recipients: schedule.recipients.filter(email => email.trim() !== '')
        }
      })
    };

    generateReport(request);
  };

  const handleParameterChange = (key: string, value: any) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const addRecipient = () => {
    setSchedule(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }));
  };

  const updateRecipient = (index: number, email: string) => {
    setSchedule(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => i === index ? email : r)
    }));
  };

  const removeRecipient = (index: number) => {
    setSchedule(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const currentReportType = reportTypes?.find(type => type.type === selectedType);

  return (
    <div className="space-y-6">
      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </CardTitle>
          <CardDescription>
            Create customizable reports with various parameters and formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Select Report Type</Label>
            {reportTypes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((type) => {
                  const Icon = reportTypeIcons[type.type as keyof typeof reportTypeIcons] || FileText;
                  return (
                    <Card
                      key={type.type}
                      className={`cursor-pointer transition-colors ${
                        selectedType === type.type
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedType(type.type);
                        setParameters({});
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Loading report types...
              </div>
            )}
          </div>

          {/* Report Parameters */}
          {currentReportType && currentReportType.parameters.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Report Parameters</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentReportType.parameters.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <Label htmlFor={param.name}>
                      {param.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {param.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {param.type === 'select' && param.options ? (
                      <Select
                        value={parameters[param.name] || ''}
                        onValueChange={(value) => handleParameterChange(param.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${param.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {param.options.map((option: any) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : param.type === 'date' ? (
                      <Input
                        id={param.name}
                        type="date"
                        value={parameters[param.name] || ''}
                        onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      />
                    ) : param.type === 'number' ? (
                      <Input
                        id={param.name}
                        type="number"
                        value={parameters[param.name] || ''}
                        onChange={(e) => handleParameterChange(param.name, parseInt(e.target.value))}
                      />
                    ) : param.type === 'boolean' ? (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={param.name}
                          checked={parameters[param.name] || false}
                          onCheckedChange={(checked) => handleParameterChange(param.name, checked)}
                        />
                        <Label htmlFor={param.name}>Enable</Label>
                      </div>
                    ) : (
                      <Input
                        id={param.name}
                        value={parameters[param.name] || ''}
                        onChange={(e) => handleParameterChange(param.name, e.target.value)}
                        placeholder={`Enter ${param.name}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Format Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Output Format</Label>
            <div className="grid grid-cols-3 gap-4">
              {(['pdf', 'excel', 'html'] as const).map((formatOption) => (
                <Card
                  key={formatOption}
                  className={`cursor-pointer transition-colors ${
                    format === formatOption
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setFormat(formatOption)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="font-medium">{formatOption.toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatOption === 'pdf' && 'Portable Document'}
                      {formatOption === 'excel' && 'Spreadsheet'}
                      {formatOption === 'html' && 'Web Page'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Scheduling Options */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="scheduling"
              checked={showScheduling}
              onCheckedChange={setShowScheduling}
            />
            <Label htmlFor="scheduling" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule Report (Optional)
            </Label>
          </div>

          {showScheduling && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={schedule.frequency}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                      setSchedule(prev => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={schedule.time}
                    onChange={(e) => setSchedule(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Recipients
                </Label>
                {schedule.recipients.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                    />
                    {schedule.recipients.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRecipient(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRecipient}
                >
                  Add Recipient
                </Button>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport || !selectedType}
              className="min-w-32"
            >
              {isGeneratingReport ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  {showScheduling ? 'Schedule Report' : 'Generate Report'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report History */}
      <ReportHistory />
    </div>
  );
};