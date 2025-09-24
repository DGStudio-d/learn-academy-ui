import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  File, 
  X, 
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  acceptedTypes = '.csv,.xlsx,.xls',
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = ''
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setErrors([]);
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors: string[] = [];
      rejectedFiles.forEach((rejection) => {
        rejection.errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            newErrors.push(`File "${rejection.file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}.`);
          } else if (error.code === 'file-invalid-type') {
            newErrors.push(`File "${rejection.file.name}" has an invalid type. Accepted types: ${acceptedTypes}.`);
          } else if (error.code === 'too-many-files') {
            newErrors.push(`Too many files. Maximum allowed: ${maxFiles}.`);
          } else {
            newErrors.push(`Error with file "${rejection.file.name}": ${error.message}`);
          }
        });
      });
      setErrors(newErrors);
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      setSelectedFiles(acceptedFiles);
      onFilesSelected(acceptedFiles);
      
      // Simulate upload progress (in real implementation, this would be actual upload progress)
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  }, [onFilesSelected, acceptedTypes, maxFiles, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.split(',').reduce((acc, type) => {
      acc[type.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    maxSize
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={`cursor-pointer transition-colors border-2 border-dashed ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <CardContent className="p-8 text-center">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <Upload className={`h-12 w-12 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <div>
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Accepted formats: {acceptedTypes}</p>
              <p>Maximum file size: {formatFileSize(maxSize)}</p>
              {maxFiles > 1 && <p>Maximum files: {maxFiles}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files:</h4>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-24">
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                {uploadProgress === 100 && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};