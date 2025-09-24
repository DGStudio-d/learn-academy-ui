import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MoreVertical, 
  Download, 
  Trash2, 
  Eye, 
  Edit, 
  Copy,
  Image as ImageIcon,
  File,
  Video,
  Music,
  FileText,
  Archive
} from 'lucide-react';

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  mimeType: string;
  size: number;
  uploadedAt: string;
  uploadedBy?: {
    id: string;
    name: string;
  };
  tags?: string[];
  description?: string;
  isPublic?: boolean;
}

export interface MediaGalleryProps {
  files: MediaFile[];
  onFileSelect?: (file: MediaFile) => void;
  onFileDelete?: (fileId: string) => void;
  onFileDownload?: (file: MediaFile) => void;
  onFileEdit?: (file: MediaFile) => void;
  onFilesSelect?: (files: MediaFile[]) => void;
  selectable?: boolean;
  multiSelect?: boolean;
  viewMode?: 'grid' | 'list';
  showUploadButton?: boolean;
  onUpload?: () => void;
  className?: string;
  emptyMessage?: string;
}

const getFileIcon = (type: MediaFile['type'], mimeType: string) => {
  switch (type) {
    case 'image':
      return <ImageIcon className="h-4 w-4" />;
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'audio':
      return <Music className="h-4 w-4" />;
    case 'document':
      return <FileText className="h-4 w-4" />;
    case 'archive':
      return <Archive className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  files,
  onFileSelect,
  onFileDelete,
  onFileDownload,
  onFileEdit,
  onFilesSelect,
  selectable = false,
  multiSelect = false,
  viewMode: initialViewMode = 'grid',
  showUploadButton = true,
  onUpload,
  className,
  emptyMessage = 'No files found',
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  // Filter files based on search and type filter
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || file.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleFileClick = useCallback((file: MediaFile) => {
    if (selectable) {
      if (multiSelect) {
        setSelectedFiles(prev => {
          const newSelected = new Set(prev);
          if (newSelected.has(file.id)) {
            newSelected.delete(file.id);
          } else {
            newSelected.add(file.id);
          }
          
          const selectedFileObjects = files.filter(f => newSelected.has(f.id));
          onFilesSelect?.(selectedFileObjects);
          
          return newSelected;
        });
      } else {
        setSelectedFiles(new Set([file.id]));
        onFileSelect?.(file);
      }
    } else {
      onFileSelect?.(file);
    }
  }, [selectable, multiSelect, files, onFileSelect, onFilesSelect]);

  const handlePreview = (file: MediaFile) => {
    setPreviewFile(file);
  };

  const handleDelete = (file: MediaFile) => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      onFileDelete?.(file.id);
      setSelectedFiles(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(file.id);
        return newSelected;
      });
    }
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
    onFilesSelect?.([]);
  };

  const selectAll = () => {
    const allIds = new Set(filteredFiles.map(f => f.id));
    setSelectedFiles(allIds);
    onFilesSelect?.(filteredFiles);
  };

  const FileCard: React.FC<{ file: MediaFile }> = ({ file }) => {
    const isSelected = selectedFiles.has(file.id);
    
    return (
      <Card 
        className={cn(
          'group cursor-pointer transition-all hover:shadow-md',
          isSelected && 'ring-2 ring-primary',
          selectable && 'hover:ring-1 hover:ring-primary/50'
        )}
        onClick={() => handleFileClick(file)}
      >
        <CardContent className="p-3">
          {viewMode === 'grid' ? (
            <div className="space-y-2">
              {/* Thumbnail/Icon */}
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {file.thumbnailUrl || file.type === 'image' ? (
                  <img
                    src={file.thumbnailUrl || file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getFileIcon(file.type, file.mimeType)}
                  </div>
                )}
                
                {/* Selection Checkbox */}
                {selectable && (
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleFileClick(file)}
                      className="bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                )}
                
                {/* Actions Menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePreview(file)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onFileDownload?.(file)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(file.url)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </DropdownMenuItem>
                      {onFileEdit && (
                        <DropdownMenuItem onClick={() => onFileEdit(file)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onFileDelete && (
                        <DropdownMenuItem 
                          onClick={() => handleDelete(file)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* File Info */}
              <div className="space-y-1">
                <div className="font-medium text-sm truncate" title={file.name}>
                  {file.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </div>
                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {file.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {file.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{file.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              {/* Selection Checkbox */}
              {selectable && (
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleFileClick(file)}
                />
              )}
              
              {/* Thumbnail/Icon */}
              <div className="flex-shrink-0">
                {file.thumbnailUrl || file.type === 'image' ? (
                  <img
                    src={file.thumbnailUrl || file.url}
                    alt={file.name}
                    className="w-10 h-10 object-cover rounded"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                    {getFileIcon(file.type, file.mimeType)}
                  </div>
                )}
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{file.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                  {file.uploadedBy && ` • ${file.uploadedBy.name}`}
                </div>
                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {file.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePreview(file)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onFileDownload?.(file)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(file.url)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </DropdownMenuItem>
                    {onFileEdit && (
                      <DropdownMenuItem onClick={() => onFileEdit(file)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onFileDelete && (
                      <DropdownMenuItem 
                        onClick={() => handleDelete(file)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Media Gallery</h3>
          {selectedFiles.size > 0 && (
            <Badge variant="secondary">
              {selectedFiles.size} selected
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showUploadButton && onUpload && (
            <Button onClick={onUpload} size="sm">
              Upload Files
            </Button>
          )}
          
          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Type Filter */}
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="archive">Archives</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Selection Actions */}
      {selectable && multiSelect && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All ({filteredFiles.length})
          </Button>
          {selectedFiles.size > 0 && (
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear Selection
            </Button>
          )}
        </div>
      )}

      {/* Files Grid/List */}
      {filteredFiles.length > 0 ? (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
            : 'space-y-2'
        )}>
          {filteredFiles.map(file => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground">{emptyMessage}</div>
          {showUploadButton && onUpload && (
            <Button onClick={onUpload} className="mt-4">
              Upload Your First File
            </Button>
          )}
        </div>
      )}

      {/* Preview Dialog */}
      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{previewFile.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Preview Content */}
              <div className="flex justify-center">
                {previewFile.type === 'image' ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-w-full max-h-96 object-contain rounded"
                  />
                ) : previewFile.type === 'video' ? (
                  <video
                    src={previewFile.url}
                    controls
                    className="max-w-full max-h-96 rounded"
                  />
                ) : previewFile.type === 'audio' ? (
                  <audio src={previewFile.url} controls className="w-full" />
                ) : (
                  <div className="flex flex-col items-center space-y-4 p-8">
                    {getFileIcon(previewFile.type, previewFile.mimeType)}
                    <div className="text-center">
                      <div className="font-medium">{previewFile.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Preview not available for this file type
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* File Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Size</div>
                  <div className="text-muted-foreground">{formatFileSize(previewFile.size)}</div>
                </div>
                <div>
                  <div className="font-medium">Type</div>
                  <div className="text-muted-foreground">{previewFile.mimeType}</div>
                </div>
                <div>
                  <div className="font-medium">Uploaded</div>
                  <div className="text-muted-foreground">{formatDate(previewFile.uploadedAt)}</div>
                </div>
                {previewFile.uploadedBy && (
                  <div>
                    <div className="font-medium">Uploaded by</div>
                    <div className="text-muted-foreground">{previewFile.uploadedBy.name}</div>
                  </div>
                )}
              </div>
              
              {previewFile.description && (
                <div>
                  <div className="font-medium text-sm">Description</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {previewFile.description}
                  </div>
                </div>
              )}
              
              {previewFile.tags && previewFile.tags.length > 0 && (
                <div>
                  <div className="font-medium text-sm">Tags</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {previewFile.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onFileDownload?.(previewFile)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => setPreviewFile(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MediaGallery;