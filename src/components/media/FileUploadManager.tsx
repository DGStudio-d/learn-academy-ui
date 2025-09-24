import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/ui/file-upload';
import ImageCropper from '@/components/ui/image-cropper';
import MediaGallery from '@/components/ui/media-gallery';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useMediaGallery } from '@/hooks/useMediaGallery';
import { 
  Upload, 
  Image as ImageIcon, 
  Crop, 
  CheckCircle, 
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react';

export interface FileUploadManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect?: (files: any[]) => void;
  mode?: 'upload' | 'select' | 'both';
  allowMultiple?: boolean;
  allowedTypes?: string[];
  maxSize?: number; // in MB
  maxFiles?: number;
  showCropper?: boolean;
  cropAspectRatio?: number;
  className?: string;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  isOpen,
  onClose,
  onFileSelect,
  mode = 'both',
  allowMultiple = true,
  allowedTypes = [],
  maxSize = 10,
  maxFiles = 10,
  showCropper = false,
  cropAspectRatio = 1,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>(
    mode === 'select' ? 'gallery' : 'upload'
  );
  const [cropperFile, setCropperFile] = useState<{ file: File; src: string } | null>(null);
  const [croppedFiles, setCroppedFiles] = useState<File[]>([]);

  // File upload hook
  const {
    uploadState,
    isUploading,
    uploadFiles,
    cancelUpload,
    resetUpload,
    retryFailedUploads,
  } = useFileUpload({
    maxFiles,
    maxSize,
    allowedTypes,
    onSuccess: (uploadedFiles) => {
      if (mode === 'upload') {
        onFileSelect?.(uploadedFiles);
        onClose();
      } else {
        // Switch to gallery tab to show uploaded files
        setActiveTab('gallery');
      }
    },
  });

  // Media gallery hook
  const {
    files,
    pagination,
    isLoading: isLoadingGallery,
    selectedFiles,
    toggleFileSelection,
    clearSelection,
  } = useMediaGallery({
    initialFilters: {
      per_page: 20,
      sort_by: 'uploaded_at',
      sort_order: 'desc',
    },
  });

  // Handle file selection from upload component
  const handleFileSelect = useCallback((selectedFiles: File[]) => {
    if (showCropper && selectedFiles.length > 0) {
      // Check if any files are images that need cropping
      const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length > 0) {
        // Show cropper for first image
        const firstImage = imageFiles[0];
        const src = URL.createObjectURL(firstImage);
        setCropperFile({ file: firstImage, src });
        return;
      }
    }

    // Upload files directly
    uploadFiles(selectedFiles);
  }, [showCropper, uploadFiles]);

  // Handle image cropping
  const handleImageCrop = useCallback((croppedBlob: Blob, cropArea: any) => {
    if (!cropperFile) return;

    // Convert blob to file
    const croppedFile = new File([croppedBlob], cropperFile.file.name, {
      type: cropperFile.file.type,
    });

    setCroppedFiles(prev => [...prev, croppedFile]);
    
    // Clean up
    URL.revokeObjectURL(cropperFile.src);
    setCropperFile(null);

    // Upload the cropped file
    uploadFiles([croppedFile]);
  }, [cropperFile, uploadFiles]);

  // Handle gallery file selection
  const handleGallerySelect = useCallback(() => {
    if (selectedFiles.length > 0) {
      onFileSelect?.(selectedFiles);
      onClose();
    }
  }, [selectedFiles, onFileSelect, onClose]);

  // Handle dialog close
  const handleClose = useCallback(() => {
    resetUpload();
    clearSelection();
    setCropperFile(null);
    setCroppedFiles([]);
    onClose();
  }, [resetUpload, clearSelection, onClose]);

  const canShowUpload = mode === 'upload' || mode === 'both';
  const canShowGallery = mode === 'select' || mode === 'both';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={cn('max-w-6xl max-h-[90vh] overflow-hidden', className)}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'upload' ? 'Upload Files' : 
               mode === 'select' ? 'Select Files' : 
               'File Manager'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {canShowUpload && canShowGallery ? (
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Gallery
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4 space-y-4">
                  <UploadTab
                    onFileSelect={handleFileSelect}
                    uploadState={uploadState}
                    isUploading={isUploading}
                    allowedTypes={allowedTypes}
                    maxSize={maxSize}
                    maxFiles={maxFiles}
                    allowMultiple={allowMultiple}
                    onCancel={cancelUpload}
                    onRetry={retryFailedUploads}
                    onReset={resetUpload}
                  />
                </TabsContent>

                <TabsContent value="gallery" className="mt-4">
                  <GalleryTab
                    files={files}
                    pagination={pagination}
                    isLoading={isLoadingGallery}
                    selectedFiles={selectedFiles}
                    allowMultiple={allowMultiple}
                    onFileSelect={toggleFileSelection}
                  />
                </TabsContent>
              </Tabs>
            ) : canShowUpload ? (
              <UploadTab
                onFileSelect={handleFileSelect}
                uploadState={uploadState}
                isUploading={isUploading}
                allowedTypes={allowedTypes}
                maxSize={maxSize}
                maxFiles={maxFiles}
                allowMultiple={allowMultiple}
                onCancel={cancelUpload}
                onRetry={retryFailedUploads}
                onReset={resetUpload}
              />
            ) : (
              <GalleryTab
                files={files}
                pagination={pagination}
                isLoading={isLoadingGallery}
                selectedFiles={selectedFiles}
                allowMultiple={allowMultiple}
                onFileSelect={toggleFileSelection}
              />
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {selectedFiles.length > 0 && (
                  <Badge variant="secondary">
                    {selectedFiles.length} selected
                  </Badge>
                )}
                {uploadState.uploadedFiles.length > 0 && (
                  <Badge variant="default">
                    {uploadState.uploadedFiles.length} uploaded
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                
                {activeTab === 'gallery' && selectedFiles.length > 0 && (
                  <Button onClick={handleGallerySelect}>
                    Select {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
                  </Button>
                )}
                
                {activeTab === 'upload' && uploadState.uploadedFiles.length > 0 && mode !== 'select' && (
                  <Button onClick={() => {
                    onFileSelect?.(uploadState.uploadedFiles);
                    handleClose();
                  }}>
                    Use Uploaded Files
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Cropper */}
      {cropperFile && (
        <ImageCropper
          src={cropperFile.src}
          isOpen={!!cropperFile}
          onClose={() => {
            URL.revokeObjectURL(cropperFile.src);
            setCropperFile(null);
          }}
          onCrop={handleImageCrop}
          aspectRatio={cropAspectRatio}
        />
      )}
    </>
  );
};

// Upload Tab Component
interface UploadTabProps {
  onFileSelect: (files: File[]) => void;
  uploadState: any;
  isUploading: boolean;
  allowedTypes: string[];
  maxSize: number;
  maxFiles: number;
  allowMultiple: boolean;
  onCancel: () => void;
  onRetry: () => void;
  onReset: () => void;
}

const UploadTab: React.FC<UploadTabProps> = ({
  onFileSelect,
  uploadState,
  isUploading,
  allowedTypes,
  maxSize,
  maxFiles,
  allowMultiple,
  onCancel,
  onRetry,
  onReset,
}) => {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <FileUpload
        onFileSelect={onFileSelect}
        accept={allowedTypes.join(',')}
        multiple={allowMultiple}
        maxSize={maxSize}
        maxFiles={maxFiles}
        allowedTypes={allowedTypes}
        disabled={isUploading}
        showPreview={true}
      />

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Uploading...</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(uploadState.progress)}%
            </span>
          </div>
          <Progress value={uploadState.progress} className="w-full" />
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel Upload
          </Button>
        </div>
      )}

      {/* Upload Results */}
      {uploadState.uploadedFiles.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Successfully uploaded {uploadState.uploadedFiles.length} file(s)
          </AlertDescription>
        </Alert>
      )}

      {uploadState.failedFiles.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {uploadState.failedFiles.length} file(s) failed to upload
            <Button variant="outline" size="sm" onClick={onRetry} className="ml-2">
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {(uploadState.uploadedFiles.length > 0 || uploadState.failedFiles.length > 0) && (
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  );
};

// Gallery Tab Component
interface GalleryTabProps {
  files: any[];
  pagination: any;
  isLoading: boolean;
  selectedFiles: any[];
  allowMultiple: boolean;
  onFileSelect: (file: any) => void;
}

const GalleryTab: React.FC<GalleryTabProps> = ({
  files,
  pagination,
  isLoading,
  selectedFiles,
  allowMultiple,
  onFileSelect,
}) => {
  return (
    <div className="max-h-96 overflow-y-auto">
      <MediaGallery
        files={files}
        onFileSelect={onFileSelect}
        selectable={true}
        multiSelect={allowMultiple}
        showUploadButton={false}
        emptyMessage={isLoading ? 'Loading files...' : 'No files found'}
      />
    </div>
  );
};

export default FileUploadManager;