import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import FileUpload from '@/components/ui/file-upload';
import ImageCropper from '@/components/ui/image-cropper';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Camera, Upload, User, X, CheckCircle, AlertCircle } from 'lucide-react';

export interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  userName?: string;
  onImageUpdate: (imageUrl: string, file?: File) => void;
  maxSize?: number; // in MB
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  showRemoveButton?: boolean;
  onRemove?: () => void;
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
  xl: 'h-40 w-40',
};

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  userName = 'User',
  onImageUpdate,
  maxSize = 5, // 5MB default
  className,
  size = 'lg',
  disabled = false,
  showRemoveButton = true,
  onRemove,
}) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('');

  // File upload hook
  const {
    uploadState,
    isUploading,
    uploadFiles,
    resetUpload,
  } = useFileUpload({
    maxFiles: 1,
    maxSize,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    onSuccess: (uploadedFiles) => {
      if (uploadedFiles.length > 0) {
        const uploadedFile = uploadedFiles[0];
        onImageUpdate(uploadedFile.url);
        handleCloseDialog();
      }
    },
  });

  // Handle file selection
  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsCropperOpen(true);
    }
  }, []);

  // Handle image cropping
  const handleImageCrop = useCallback((croppedBlob: Blob) => {
    // Create preview URL for cropped image
    const croppedUrl = URL.createObjectURL(croppedBlob);
    setCroppedImageUrl(croppedUrl);
    setIsCropperOpen(false);

    // Convert blob to file for upload
    const croppedFile = new File([croppedBlob], selectedFile?.name || 'profile.jpg', {
      type: 'image/jpeg',
    });

    // Upload the cropped image
    uploadFiles([croppedFile]);
  }, [selectedFile, uploadFiles]);

  // Handle dialog close
  const handleCloseDialog = useCallback(() => {
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setIsCropperOpen(false);
    resetUpload();
    
    // Clean up URLs
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl);
      setCroppedImageUrl('');
    }
  }, [previewUrl, croppedImageUrl, resetUpload]);

  // Handle remove image
  const handleRemoveImage = useCallback(() => {
    if (onRemove) {
      onRemove();
    }
  }, [onRemove]);

  // Get user initials for fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayImageUrl = croppedImageUrl || currentImageUrl;

  return (
    <>
      <div className={cn('relative group', className)}>
        {/* Avatar */}
        <Avatar className={cn(sizeClasses[size], 'cursor-pointer transition-all group-hover:opacity-80')}>
          <AvatarImage src={displayImageUrl} alt={userName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getUserInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* Upload Overlay */}
        {!disabled && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Camera className="h-6 w-6 text-white" />
          </div>
        )}

        {/* Remove Button */}
        {showRemoveButton && currentImageUrl && !disabled && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {/* Upload Button (when no image) */}
        {!currentImageUrl && !disabled && (
          <Button
            variant="outline"
            size="sm"
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Image Preview */}
            {displayImageUrl && (
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={displayImageUrl} alt={userName} />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            {/* File Upload */}
            {!isUploading && !uploadState.uploadedFiles.length && (
              <FileUpload
                onFileSelect={handleFileSelect}
                accept="image/*"
                multiple={false}
                maxSize={maxSize}
                allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
                showPreview={false}
              >
                <div className="flex flex-col items-center justify-center space-y-2 text-center py-8">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </div>
                  <div className="text-xs text-muted-foreground">
                    JPG, PNG or WebP (max {maxSize}MB)
                  </div>
                </div>
              </FileUpload>
            )}

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
              </div>
            )}

            {/* Upload Success */}
            {uploadState.uploadedFiles.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Profile picture updated successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Error */}
            {uploadState.failedFiles.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to upload image. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {uploadState.uploadedFiles.length > 0 ? 'Done' : 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Cropper */}
      <ImageCropper
        src={previewUrl}
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        onCrop={handleImageCrop}
        aspectRatio={1} // Square crop for profile pictures
        minWidth={150}
        minHeight={150}
        maxWidth={500}
        maxHeight={500}
      />
    </>
  );
};

export default ProfilePictureUpload;