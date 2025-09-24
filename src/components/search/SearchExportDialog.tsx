import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson,
  Settings,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { searchExportService, ExportOptions, exportFieldConfigs } from '@/services/searchExportService';
import { SearchFilters, SearchResult } from '@/services/searchService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SearchExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchResults: SearchResult[];
  searchFilters: SearchFilters;
  totalResults: number;
  className?: string;
}

export const SearchExportDialog: React.FC<SearchExportDialogProps> = ({
  open,
  onOpenChange,
  searchResults,
  searchFilters,
  totalResults,
  className
}) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [filename, setFilename] = useState('');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeFilters, setIncludeFilters] = useState(true);
  const [maxResults, setMaxResults] = useState(1000);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'quick' | 'full'>('quick');

  const { toast } = useToast();

  // Get content type from search results
  const getContentTypes = () => {
    const types = new Set(searchResults.map(result => result.type));
    return Array.from(types);
  };

  const contentTypes = getContentTypes();
  const primaryContentType = contentTypes[0] || 'users';

  // Initialize selected fields based on content type
  React.useEffect(() => {
    if (contentTypes.length === 1) {
      const config = exportFieldConfigs[primaryContentType as keyof typeof exportFieldConfigs];
      if (config) {
        setSelectedFields(config.default);
      }
    }
  }, [contentTypes, primaryContentType]);

  // Handle field selection
  const handleFieldToggle = (field: string, checked: boolean) => {
    if (checked) {
      setSelectedFields(prev => [...prev, field]);
    } else {
      setSelectedFields(prev => prev.filter(f => f !== field));
    }
  };

  // Handle quick export
  const handleQuickExport = async () => {
    if (searchResults.length === 0) {
      toast({
        title: "No Results",
        description: "There are no search results to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const exportFilename = filename || `search-results-${new Date().toISOString().split('T')[0]}`;
      
      await searchExportService.quickExport(
        searchResults,
        exportFormat === 'excel' ? 'csv' : exportFormat, // Excel not supported in quick export
        exportFilename
      );

      toast({
        title: "Export Successful",
        description: `Search results exported as ${exportFormat.toUpperCase()}`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export search results",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle full export
  const handleFullExport = async () => {
    setIsExporting(true);
    try {
      const exportOptions: ExportOptions = {
        format: exportFormat,
        includeFields: selectedFields.length > 0 ? selectedFields : undefined,
        filename: filename || undefined
      };

      const exportStatus = await searchExportService.startExport({
        filters: searchFilters,
        options: exportOptions,
        maxResults
      });

      toast({
        title: "Export Started",
        description: `Export process started. You'll be notified when it's ready for download.`,
      });

      // Poll for export completion (in a real app, you might use WebSockets)
      pollExportStatus(exportStatus.export_id);

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to start export process",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Poll export status
  const pollExportStatus = async (exportId: string) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const status = await searchExportService.getExportStatus(exportId);
        
        if (status.status === 'completed' && status.download_url) {
          toast({
            title: "Export Ready",
            description: "Your export is ready for download.",
            action: (
              <Button
                size="sm"
                onClick={() => window.open(status.download_url, '_blank')}
              >
                Download
              </Button>
            ),
          });
          return;
        }
        
        if (status.status === 'failed') {
          toast({
            title: "Export Failed",
            description: status.error_message || "Export process failed",
            variant: "destructive",
          });
          return;
        }

        // Continue polling if still processing
        if (status.status === 'processing' && attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 10000); // Poll every 10 seconds
        }
      } catch (error) {
        console.error('Failed to poll export status:', error);
      }
    };

    poll();
  };

  const formatIcons = {
    csv: FileSpreadsheet,
    excel: FileSpreadsheet,
    json: FileJson
  };

  const FormatIcon = formatIcons[exportFormat];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-2xl", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Search Results
          </DialogTitle>
          <DialogDescription>
            Export your search results in various formats for further analysis.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={exportType} onValueChange={(value) => setExportType(value as 'quick' | 'full')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">Quick Export</TabsTrigger>
            <TabsTrigger value="full">Full Export</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Export the current search results ({searchResults.length} items) immediately.
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV (Comma Separated Values)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      JSON (JavaScript Object Notation)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filename */}
            <div className="space-y-2">
              <Label>Filename (optional)</Label>
              <Input
                placeholder="search-results"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="full" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Export all matching results ({totalResults.toLocaleString()} items) with advanced options.
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV (Comma Separated Values)
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (XLSX)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      JSON (JavaScript Object Notation)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Results */}
            <div className="space-y-2">
              <Label>Maximum Results</Label>
              <Select value={maxResults.toString()} onValueChange={(value) => setMaxResults(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 results</SelectItem>
                  <SelectItem value="500">500 results</SelectItem>
                  <SelectItem value="1000">1,000 results</SelectItem>
                  <SelectItem value="5000">5,000 results</SelectItem>
                  <SelectItem value="10000">10,000 results</SelectItem>
                  <SelectItem value="-1">All results</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Field Selection */}
            {contentTypes.length === 1 && (
              <div className="space-y-3">
                <Label>Fields to Include</Label>
                <ScrollArea className="h-32 border rounded-md p-3">
                  {(() => {
                    const config = exportFieldConfigs[primaryContentType as keyof typeof exportFieldConfigs];
                    if (!config) return null;

                    const allFields = [...config.default, ...config.optional];
                    
                    return (
                      <div className="space-y-2">
                        {allFields.map((field) => (
                          <div key={field} className="flex items-center space-x-2">
                            <Checkbox
                              id={`field-${field}`}
                              checked={selectedFields.includes(field)}
                              onCheckedChange={(checked) => handleFieldToggle(field, checked as boolean)}
                            />
                            <Label htmlFor={`field-${field}`} className="text-sm">
                              {config.labels[field as keyof typeof config.labels] || field}
                            </Label>
                            {config.default.includes(field) && (
                              <Badge variant="outline" className="text-xs">Default</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </ScrollArea>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              <Label>Export Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-metadata"
                    checked={includeMetadata}
                    onCheckedChange={setIncludeMetadata}
                  />
                  <Label htmlFor="include-metadata" className="text-sm">
                    Include metadata and additional information
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-filters"
                    checked={includeFilters}
                    onCheckedChange={setIncludeFilters}
                  />
                  <Label htmlFor="include-filters" className="text-sm">
                    Include applied search filters in export
                  </Label>
                </div>
              </div>
            </div>

            {/* Filename */}
            <div className="space-y-2">
              <Label>Filename (optional)</Label>
              <Input
                placeholder="search-results"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Summary */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FormatIcon className="h-4 w-4" />
            Export Summary
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Format: {exportFormat.toUpperCase()}</div>
            <div>
              Results: {exportType === 'quick' 
                ? `${searchResults.length} items (current page)` 
                : `Up to ${maxResults === -1 ? totalResults.toLocaleString() : maxResults.toLocaleString()} items`
              }
            </div>
            {contentTypes.length > 0 && (
              <div>Content Types: {contentTypes.join(', ')}</div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={exportType === 'quick' ? handleQuickExport : handleFullExport}
            disabled={isExporting || searchResults.length === 0}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? 'Exporting...' : 'Export Results'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};