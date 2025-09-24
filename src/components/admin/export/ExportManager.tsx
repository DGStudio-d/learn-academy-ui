import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Users, 
  BookOpen, 
  Calendar, 
  UserCheck,
  Filter,
  Settings
} from 'lucide-react';
import { useDataExportImport } from '@/hooks/useDataExportImport';
import { exportFieldConfigs, ExportFilters, ExportOptions } from '@/services/dataExportImportService';
import { ExportHistory } from './ExportHistory';

export const ExportManager: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('users');
  const [filters, setFilters] = useState<ExportFilters>({});
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includeFields: [],
    filename: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    exportUsers,
    exportQuizResults,
    exportPrograms,
    exportMeetings,
    exportEnrollments,
    isExporting
  } = useDataExportImport();

  const exportTypes = [
    { value: 'users', label: 'Users', icon: Users, description: 'Export user accounts and profiles' },
    { value: 'quiz_results', label: 'Quiz Results', icon: FileText, description: 'Export quiz attempts and scores' },
    { value: 'programs', label: 'Programs', icon: BookOpen, description: 'Export learning programs' },
    { value: 'meetings', label: 'Meetings', icon: Calendar, description: 'Export meeting schedules' },
    { value: 'enrollments', label: 'Enrollments', icon: UserCheck, description: 'Export student enrollments' }
  ];

  const handleExport = () => {
    const exportOptions = {
      ...options,
      filename: options.filename || `${selectedType}_export_${new Date().toISOString().split('T')[0]}`
    };

    switch (selectedType) {
      case 'users':
        exportUsers(filters, exportOptions);
        break;
      case 'quiz_results':
        exportQuizResults(filters, exportOptions);
        break;
      case 'programs':
        exportPrograms(filters, exportOptions);
        break;
      case 'meetings':
        exportMeetings(filters, exportOptions);
        break;
      case 'enrollments':
        exportEnrollments(filters, exportOptions);
        break;
    }
  };

  const currentFieldConfig = exportFieldConfigs[selectedType as keyof typeof exportFieldConfigs];
  const allFields = currentFieldConfig ? [...currentFieldConfig.default, ...currentFieldConfig.optional] : [];

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Configure and export system data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Select Data Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-colors ${
                      selectedType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedType(type.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{type.label}</div>
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
          </div>

          <Separator />

          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select
                value={options.format}
                onValueChange={(value: 'csv' | 'excel' | 'json') =>
                  setOptions(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                  <SelectItem value="excel">Excel (XLSX)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filename */}
            <div className="space-y-2">
              <Label htmlFor="filename">Filename (optional)</Label>
              <Input
                id="filename"
                placeholder={`${selectedType}_export_${new Date().toISOString().split('T')[0]}`}
                value={options.filename}
                onChange={(e) => setOptions(prev => ({ ...prev, filename: e.target.value }))}
              />
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="advanced"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
            <Label htmlFor="advanced" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Advanced Options
            </Label>
          </div>

          {showAdvanced && (
            <div className="space-y-6 p-4 border rounded-lg bg-muted/50">
              {/* Field Selection */}
              {currentFieldConfig && (
                <div className="space-y-4">
                  <Label className="text-base font-medium">Select Fields to Export</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {allFields.map((field) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Checkbox
                          id={field}
                          checked={
                            options.includeFields?.length === 0 ||
                            options.includeFields?.includes(field)
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setOptions(prev => ({
                                ...prev,
                                includeFields: prev.includeFields?.length === 0
                                  ? [field]
                                  : [...(prev.includeFields || []), field]
                              }));
                            } else {
                              setOptions(prev => ({
                                ...prev,
                                includeFields: prev.includeFields?.filter(f => f !== field) || []
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={field} className="text-sm">
                          {currentFieldConfig.labels[field as keyof typeof currentFieldConfig.labels] || field}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label htmlFor="date_from">From Date</Label>
                    <Input
                      id="date_from"
                      type="date"
                      value={filters.date_from || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_to">To Date</Label>
                    <Input
                      id="date_to"
                      type="date"
                      value={filters.date_to || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                    />
                  </div>

                  {/* Type-specific filters */}
                  {selectedType === 'users' && (
                    <div className="space-y-2">
                      <Label htmlFor="role">User Role</Label>
                      <Select
                        value={filters.role || ''}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, role: value || undefined }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All roles</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(selectedType === 'programs' || selectedType === 'quiz_results' || selectedType === 'meetings') && (
                    <div className="space-y-2">
                      <Label htmlFor="program_id">Program ID</Label>
                      <Input
                        id="program_id"
                        type="number"
                        placeholder="Filter by program ID"
                        value={filters.program_id || ''}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          program_id: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                      />
                    </div>
                  )}

                  {selectedType === 'enrollments' && (
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={filters.status || ''}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value || undefined }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Search */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Search in names, emails, titles..."
                      value={filters.search || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="min-w-32"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Start Export
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <ExportHistory />
    </div>
  );
};