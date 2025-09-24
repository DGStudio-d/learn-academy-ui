import React, { useCallback, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, File, Image, AlertCircle, CheckCircle } from 'lucide-react';

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  showPreview?: boolean;
  allowedTypes?: string[];
}

export interface UploadedFile {
  file: File;
  preview?: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  accept = '*/*',
  multiple = false,
  maxSize = 10, // 10MB default
  maxFiles = 5,
  disabled = false,
  className,
  children,
  showPreview = true,
  allowedTypes = [],
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type if allowedTypes is specified
    if (allowedTypes.length > 0) {
      const fileType = file.type.toLowerCase();
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      const isAllowed = allowedTypes.some(type => {
        if (type.includes('/')) {
          // MIME type check
          return fileType === type || fileType.startsWith(type.replace('*', ''));
        } else {
          // Extension check
          return fileExtension === type.replace('.', '');
        }
      });

      if (!isAllowed) {
        return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
      }
    }

    return null;
  }, [maxSize, allowedTypes]);

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: File[] = [];
    const errors: string[] = [];

    // Check total file count
    if (!multiple && fileList.length > 1) {
      setError('Only one file is allowed');
      return;
    }

    if (files.length + fileList.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    Array.from(fileList).forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        newFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setError('');
    
    // Create uploaded file objects with previews
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => {
      const uploadedFile: UploadedFile = {
        file,
        status: 'pending',
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
          setFiles(prev => [...prev]);
        };
        reader.readAsDataURL(file);
      }

      return uploadedFile;
    });

    if (multiple) {
      setFiles(prev => [...prev, ...uploadedFiles]);
    } else {
      setFiles(uploadedFiles);
    }

    onFileSelect(newFiles);
  }, [files.length, maxFiles, multiple, onFileSelect, validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [disabled, processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
  }, [processFiles]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      return newFiles;
    });
    onFileRemove?.(index);
  }, [onFileRemove]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragOver && 'border-primary bg-primary/10',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />

        {children || (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm">
              <span className="font-medium">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-muted-foreground">
              {allowedTypes.length > 0 && (
                <div>Allowed: {allowedTypes.join(', ')}</div>
              )}
              <div>Max size: {maxSize}MB</div>
              {multiple && <div>Max files: {maxFiles}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File Preview */}
      {showPreview && files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files</h4>
          <div className="space-y-2">
            {files.map((uploadedFile, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 border rounded-lg bg-card"
              >
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 flex items-center justify-center bg-muted rounded">
                      {getFileIcon(uploadedFile.file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {uploadedFile.file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedFile.file.size)}
                  </div>
                  
                  {/* Progress Bar */}
                  {uploadedFile.status === 'uploading' && uploadedFile.progress !== undefined && (
                    <Progress value={uploadedFile.progress} className="mt-1 h-1" />
                  )}
                  
                  {/* Status */}
                  {uploadedFile.status === 'error' && uploadedFile.error && (
                    <div className="text-xs text-destructive mt-1">
                      {uploadedFile.error}
                    </div>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {uploadedFile.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {uploadedFile.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="flex-shrink-0 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;