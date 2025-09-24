import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Users, 
  BookOpen, 
  UserCheck,
  Download,
  AlertCircle,
  CheckCircle,
  Info,
  Settings
} from 'lucide-react';
import { useDataExportImport } from '@/hooks/useDataExportImport';
import { ImportOptions, importFieldMappings } from '@/services/dataExportImportService';
import { ImportHistory } from './ImportHistory';
import { FileUpload } from '@/components/common/FileUpload';

export const ImportManager: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('users');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [options, setOptions] = useState<ImportOptions>({
    skipDuplicates: true,
    updateExisting: false,
    validateOnly: false,
    batchSize: 100
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    importUsers,
    importPrograms,
    importEnrollments,
    validateImportFile,
    downloadImportTemplate,
    isImporting,
    isValidatingFile,
    validationResult
  } = useDataExportImport();

  const importTypes = [
    { 
      value: 'users', 
      label: 'Users', 
      icon: Users, 
      description: 'Import user accounts in bulk',
      acceptedFormats: '.csv,.xlsx'
    },
    { 
      value: 'programs', 
      label: 'Programs', 
      icon: BookOpen, 
      description: 'Import learning programs',
      acceptedFormats: '.csv,.xlsx'
    },
    { 
      value: 'enrollments', 
      label: 'Enrollments', 
      icon: UserCheck, 
      description: 'Import student enrollments',
      acceptedFormats: '.csv,.xlsx'
    }
  ];

  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      // Auto-validate file when selected
      validateImportFile({ file: files[0], type: selectedType });
    }
  }, [selectedType, validateImportFile]);

  const handleImport = () => {
    if (!selectedFile) return;

    switch (selectedType) {
      case 'users':
        importUsers(selectedFile, options);
        break;
      case 'programs':
        importPrograms(selectedFile, options);
        break;
      case 'enrollments':
        importEnrollments(selectedFile, options);
        break;
    }

    // Reset form after import
    setSelectedFile(null);
  };

  const handleDownloadTemplate = (format: 'csv' | 'excel') => {
    downloadImportTemplate({ type: selectedType, format });
  };

  const currentFieldMapping = importFieldMappings[selectedType as keyof typeof importFieldMappings];

  return (
    <div className="space-y-6">
      {/* Import Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Upload and import data from CSV or Excel files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Select Import Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {importTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-colors ${
                      selectedType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedType(type.value);
                      setSelectedFile(null);
                    }}
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

          {/* Template Download */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Download Template</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => handleDownloadTemplate('csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV Template
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownloadTemplate('excel')}
              >
                <Download className="h-4 w-4 mr-2" />
                Excel Template
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Download a template file with the correct format and required fields for {selectedType} import.
            </p>
          </div>

          <Separator />

          {/* File Upload */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Upload File</Label>
            <FileUpload
              onFilesSelected={handleFileSelect}
              acceptedTypes={importTypes.find(t => t.value === selectedType)?.acceptedFormats}
              maxFiles={1}
              maxSize={10 * 1024 * 1024} // 10MB
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </div>
            )}
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="space-y-4">
              <Label className="text-base font-medium">File Validation</Label>
              {validationResult.isValid ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    File validation passed! Found {validationResult.previewData?.length || 0} records ready for import.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    File validation failed. Please fix the following errors:
                    <ul className="list-disc list-inside mt-2">
                      {validationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.warnings.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Warnings:
                    <ul className="list-disc list-inside mt-2">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview Data */}
              {validationResult.previewData && validationResult.previewData.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Preview (First 5 records)</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            {Object.keys(validationResult.previewData[0]).map((key) => (
                              <th key={key} className="px-3 py-2 text-left font-medium">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {validationResult.previewData.slice(0, 5).map((row, index) => (
                            <tr key={index} className="border-t">
                              {Object.values(row).map((value, cellIndex) => (
                                <td key={cellIndex} className="px-3 py-2">
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Field Requirements */}
          {currentFieldMapping && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Field Requirements</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-red-600">Required Fields</Label>
                  <ul className="text-sm text-muted-foreground mt-1">
                    {currentFieldMapping.required.map((field) => (
                      <li key={field} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-600">Optional Fields</Label>
                  <ul className="text-sm text-muted-foreground mt-1">
                    {currentFieldMapping.optional.map((field) => (
                      <li key={field} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Options */}
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
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skipDuplicates"
                    checked={options.skipDuplicates}
                    onCheckedChange={(checked) =>
                      setOptions(prev => ({ ...prev, skipDuplicates: !!checked }))
                    }
                  />
                  <Label htmlFor="skipDuplicates" className="text-sm">
                    Skip duplicate records
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="updateExisting"
                    checked={options.updateExisting}
                    onCheckedChange={(checked) =>
                      setOptions(prev => ({ ...prev, updateExisting: !!checked }))
                    }
                  />
                  <Label htmlFor="updateExisting" className="text-sm">
                    Update existing records
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="validateOnly"
                    checked={options.validateOnly}
                    onCheckedChange={(checked) =>
                      setOptions(prev => ({ ...prev, validateOnly: !!checked }))
                    }
                  />
                  <Label htmlFor="validateOnly" className="text-sm">
                    Validate only (don't import)
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Import Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleImport}
              disabled={!selectedFile || !validationResult?.isValid || isImporting}
              className="min-w-32"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {options.validateOnly ? 'Validate' : 'Start Import'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import History */}
      <ImportHistory />
    </div>
  );
};