import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import FileUpload from '@/components/ui/file-upload';
import ImageCropper from '@/components/ui/image-cropper';
import MediaGallery from '@/components/ui/media-gallery';
import FileUploadManager from '@/components/media/FileUploadManager';
import ProfilePictureUpload from '@/components/user/ProfilePictureUpload';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useMediaGallery } from '@/hooks/useMediaGallery';
import { Upload, Image as ImageIcon, Gallery, User, Settings } from 'lucide-react';

// Mock data for demo
const mockMediaFiles = [
  {
    id: '1',
    name: 'profile-picture.jpg',
    url: '/api/placeholder/300/300',
    thumbnailUrl: '/api/placeholder/150/150',
    type: 'image' as const,
    mimeType: 'image/jpeg',
    size: 1024 * 500, // 500KB
    uploadedAt: '2024-01-15T10:30:00Z',
    uploadedBy: { id: '1', name: 'John Doe' },
    tags: ['profile', 'avatar'],
    description: 'User profile picture',
    isPublic: false,
  },
  {
    id: '2',
    name: 'presentation.pdf',
    url: '/api/files/presentation.pdf',
    type: 'document' as const,
    mimeType: 'application/pdf',
    size: 1024 * 1024 * 2, // 2MB
    uploadedAt: '2024-01-14T15:45:00Z',
    uploadedBy: { id: '2', name: 'Jane Smith' },
    tags: ['presentation', 'work'],
    description: 'Project presentation slides',
    isPublic: true,
  },
  {
    id: '3',
    name: 'demo-video.mp4',
    url: '/api/files/demo-video.mp4',
    thumbnailUrl: '/api/placeholder/300/200',
    type: 'video' as const,
    mimeType: 'video/mp4',
    size: 1024 * 1024 * 15, // 15MB
    uploadedAt: '2024-01-13T09:20:00Z',
    uploadedBy: { id: '1', name: 'John Doe' },
    tags: ['demo', 'tutorial'],
    description: 'Product demonstration video',
    isPublic: true,
  },
];

const FileUploadDemo: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [cropperImage, setCropperImage] = useState<string>('');
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('/api/placeholder/150/150');

  // File upload hook demo
  const {
    uploadState,
    isUploading,
    uploadFiles,
    resetUpload,
  } = useFileUpload({
    maxFiles: 5,
    maxSize: 10, // 10MB
    allowedTypes: ['image/*', 'application/pdf', 'video/*'],
    onSuccess: (files) => {
      console.log('Upload successful:', files);
    },
  });

  // Media gallery hook demo
  const {
    files: galleryFiles,
    selectedFiles: selectedGalleryFiles,
    toggleFileSelection,
    clearSelection,
  } = useMediaGallery({
    initialFilters: { per_page: 10 },
  });

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    
    // If it's an image, show cropper demo
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setCropperImage(url);
      setIsCropperOpen(true);
    }
  };

  const handleCrop = (croppedBlob: Blob) => {
    console.log('Image cropped:', croppedBlob);
    setIsCropperOpen(false);
    URL.revokeObjectURL(cropperImage);
    setCropperImage('');
  };

  const handleProfileImageUpdate = (imageUrl: string) => {
    setProfileImage(imageUrl);
    console.log('Profile image updated:', imageUrl);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">File Upload & Media Management Demo</h1>
        <p className="text-muted-foreground">
          Comprehensive file upload system with drag-and-drop, image cropping, and media gallery
        </p>
      </div>

      <Tabs defaultValue="basic-upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic-upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Basic Upload
          </TabsTrigger>
          <TabsTrigger value="image-cropper" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Image Cropper
          </TabsTrigger>
          <TabsTrigger value="media-gallery" className="flex items-center gap-2">
            <Gallery className="h-4 w-4" />
            Media Gallery
          </TabsTrigger>
          <TabsTrigger value="profile-upload" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile Upload
          </TabsTrigger>
          <TabsTrigger value="file-manager" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            File Manager
          </TabsTrigger>
        </TabsList>

        {/* Basic File Upload */}
        <TabsContent value="basic-upload">
          <Card>
            <CardHeader>
              <CardTitle>Basic File Upload</CardTitle>
              <CardDescription>
                Drag and drop files or click to browse. Supports multiple files with validation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                onFileSelect={handleFileSelect}
                multiple={true}
                maxSize={10}
                maxFiles={5}
                allowedTypes={['image/*', 'application/pdf', 'video/*']}
                showPreview={true}
              />

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Files:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <Badge key={index} variant="secondary">
                        {file.name} ({Math.round(file.size / 1024)}KB)
                      </Badge>
                    ))}
                  </div>
                  <Button onClick={() => uploadFiles(selectedFiles)} disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload Files'}
                  </Button>
                </div>
              )}

              {uploadState.uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">Uploaded Successfully:</h4>
                  <div className="flex flex-wrap gap-2">
                    {uploadState.uploadedFiles.map((file, index) => (
                      <Badge key={index} variant="default">
                        {file.name}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" onClick={resetUpload}>
                    Reset
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image Cropper */}
        <TabsContent value="image-cropper">
          <Card>
            <CardHeader>
              <CardTitle>Image Cropper</CardTitle>
              <CardDescription>
                Upload an image to see the cropping functionality in action.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={(files) => {
                  const imageFile = files.find(file => file.type.startsWith('image/'));
                  if (imageFile) {
                    const url = URL.createObjectURL(imageFile);
                    setCropperImage(url);
                    setIsCropperOpen(true);
                  }
                }}
                accept="image/*"
                multiple={false}
                maxSize={5}
                allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
                showPreview={false}
              >
                <div className="flex flex-col items-center justify-center space-y-2 text-center py-8">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">Click to upload an image</span> for cropping
                  </div>
                  <div className="text-xs text-muted-foreground">
                    JPG, PNG or WebP (max 5MB)
                  </div>
                </div>
              </FileUpload>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Gallery */}
        <TabsContent value="media-gallery">
          <Card>
            <CardHeader>
              <CardTitle>Media Gallery</CardTitle>
              <CardDescription>
                Browse, search, and manage uploaded files with preview and actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaGallery
                files={mockMediaFiles}
                onFileSelect={(file) => console.log('Selected file:', file)}
                onFileDelete={(fileId) => console.log('Delete file:', fileId)}
                onFileDownload={(file) => console.log('Download file:', file)}
                selectable={true}
                multiSelect={true}
                showUploadButton={true}
                onUpload={() => console.log('Upload new files')}
              />
              
              {selectedGalleryFiles.length > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge>{selectedGalleryFiles.length} selected</Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedGalleryFiles.map(f => f.name).join(', ')}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Clear Selection
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Picture Upload */}
        <TabsContent value="profile-upload">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture Upload</CardTitle>
              <CardDescription>
                Specialized component for profile pictures with automatic cropping.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <ProfilePictureUpload
                  currentImageUrl={profileImage}
                  userName="John Doe"
                  onImageUpdate={handleProfileImageUpdate}
                  maxSize={5}
                  size="xl"
                  showRemoveButton={true}
                  onRemove={() => setProfileImage('')}
                />
                <div className="space-y-2">
                  <h4 className="font-medium">Profile Picture</h4>
                  <p className="text-sm text-muted-foreground">
                    Click on the avatar to upload a new profile picture.
                    Images will be automatically cropped to a square format.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <ProfilePictureUpload
                    currentImageUrl={profileImage}
                    userName="Small"
                    onImageUpdate={handleProfileImageUpdate}
                    size="sm"
                  />
                  <p className="text-xs text-muted-foreground">Small (64px)</p>
                </div>
                <div className="text-center space-y-2">
                  <ProfilePictureUpload
                    currentImageUrl={profileImage}
                    userName="Medium"
                    onImageUpdate={handleProfileImageUpdate}
                    size="md"
                  />
                  <p className="text-xs text-muted-foreground">Medium (96px)</p>
                </div>
                <div className="text-center space-y-2">
                  <ProfilePictureUpload
                    currentImageUrl={profileImage}
                    userName="Large"
                    onImageUpdate={handleProfileImageUpdate}
                    size="lg"
                  />
                  <p className="text-xs text-muted-foreground">Large (128px)</p>
                </div>
                <div className="text-center space-y-2">
                  <ProfilePictureUpload
                    currentImageUrl={profileImage}
                    userName="Extra Large"
                    onImageUpdate={handleProfileImageUpdate}
                    size="xl"
                  />
                  <p className="text-xs text-muted-foreground">XL (160px)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Manager */}
        <TabsContent value="file-manager">
          <Card>
            <CardHeader>
              <CardTitle>File Manager</CardTitle>
              <CardDescription>
                Complete file management solution combining upload and gallery functionality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={() => setIsManagerOpen(true)}>
                  Open File Manager
                </Button>
                <Button variant="outline" onClick={() => setIsManagerOpen(true)}>
                  Select Files
                </Button>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Upload new files with drag-and-drop support</p>
                <p>• Browse existing files in gallery view</p>
                <p>• Automatic image cropping for profile pictures</p>
                <p>• File type validation and size restrictions</p>
                <p>• Bulk operations and file management</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Image Cropper Dialog */}
      <ImageCropper
        src={cropperImage}
        isOpen={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          URL.revokeObjectURL(cropperImage);
          setCropperImage('');
        }}
        onCrop={handleCrop}
        aspectRatio={1}
        minWidth={150}
        minHeight={150}
      />

      {/* File Manager Dialog */}
      <FileUploadManager
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        onFileSelect={(files) => {
          console.log('Selected files from manager:', files);
          setIsManagerOpen(false);
        }}
        mode="both"
        allowMultiple={true}
        allowedTypes={['image/*', 'application/pdf', 'video/*']}
        maxSize={10}
        maxFiles={10}
        showCropper={true}
      />
    </div>
  );
};

export default FileUploadDemo;