import React, { useState } from 'react';
import { 
  Bookmark, 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Clock,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSavedSearches, useRecentSearches } from '@/hooks/useSearch';
import { SearchFilters } from '@/services/searchService';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SavedSearchesPanelProps {
  currentFilters: SearchFilters;
  onSearchSelect: (search: any) => void;
  onClose: () => void;
  className?: string;
}

export const SavedSearchesPanel: React.FC<SavedSearchesPanelProps> = ({
  currentFilters,
  onSearchSelect,
  onClose,
  className
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [editingSearch, setEditingSearch] = useState<any>(null);
  
  const { toast } = useToast();
  const { 
    savedSearches, 
    saveSearch, 
    updateSearch, 
    deleteSearch,
    isSaving,
    isUpdating,
    isDeleting
  } = useSavedSearches();
  
  const { recentSearches, clearRecent, isClearing } = useRecentSearches();

  // Handle save current search
  const handleSaveCurrentSearch = () => {
    if (!searchName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the search",
        variant: "destructive",
      });
      return;
    }

    saveSearch(
      { name: searchName.trim(), filters: currentFilters },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Search saved successfully",
          });
          setSearchName('');
          setSaveDialogOpen(false);
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to save search",
            variant: "destructive",
          });
        }
      }
    );
  };

  // Handle edit search
  const handleEditSearch = (search: any) => {
    setEditingSearch(search);
    setSearchName(search.name);
    setEditDialogOpen(true);
  };

  // Handle update search
  const handleUpdateSearch = () => {
    if (!searchName.trim() || !editingSearch) {
      toast({
        title: "Error",
        description: "Please enter a name for the search",
        variant: "destructive",
      });
      return;
    }

    updateSearch(
      { 
        searchId: editingSearch.id, 
        name: searchName.trim(), 
        filters: editingSearch.filters 
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Search updated successfully",
          });
          setSearchName('');
          setEditingSearch(null);
          setEditDialogOpen(false);
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update search",
            variant: "destructive",
          });
        }
      }
    );
  };

  // Handle delete search
  const handleDeleteSearch = (searchId: number) => {
    deleteSearch(searchId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Search deleted successfully",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to delete search",
          variant: "destructive",
        });
      }
    });
  };

  // Handle clear recent searches
  const handleClearRecent = () => {
    clearRecent(undefined, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Recent searches cleared",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to clear recent searches",
          variant: "destructive",
        });
      }
    });
  };

  // Format filter summary
  const formatFilterSummary = (filters: SearchFilters): string => {
    const parts = [];
    
    if (filters.query) {
      parts.push(`"${filters.query}"`);
    }
    
    if (filters.content_types && filters.content_types.length > 0) {
      parts.push(`in ${filters.content_types.join(', ')}`);
    }
    
    if (filters.role) {
      parts.push(`role: ${filters.role}`);
    }
    
    if (filters.language_id) {
      parts.push(`language: ${filters.language_id}`);
    }
    
    if (filters.program_id) {
      parts.push(`program: ${filters.program_id}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'All content';
  };

  const hasCurrentFilters = Object.keys(currentFilters).some(
    key => currentFilters[key as keyof SearchFilters] !== undefined &&
           currentFilters[key as keyof SearchFilters] !== null &&
           currentFilters[key as keyof SearchFilters] !== ''
  );

  return (
    <div className={cn("w-full max-w-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4" />
          <h3 className="font-medium">Saved Searches</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <ScrollArea className="max-h-96">
        <div className="p-4 space-y-4">
          {/* Save Current Search */}
          {hasCurrentFilters && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Current Search</Label>
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Plus className="h-3 w-3" />
                      Save
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Save Search</DialogTitle>
                      <DialogDescription>
                        Give your search a name to save it for later use.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="search-name">Search Name</Label>
                        <Input
                          id="search-name"
                          placeholder="Enter search name..."
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveCurrentSearch();
                            }
                          }}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Filters:</strong> {formatFilterSummary(currentFilters)}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setSaveDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveCurrentSearch}
                        disabled={isSaving || !searchName.trim()}
                      >
                        {isSaving ? 'Saving...' : 'Save Search'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  {formatFilterSummary(currentFilters)}
                </div>
              </div>
            </div>
          )}

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Saved Searches</Label>
              <div className="space-y-2">
                {savedSearches.map((search) => (
                  <div
                    key={search.id}
                    className="group p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      onSearchSelect(search);
                      onClose();
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <h4 className="font-medium text-sm truncate">
                            {search.name}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {formatFilterSummary(search.filters)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Saved {new Date(search.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSearch(search);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Saved Search</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{search.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSearch(search.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <>
              {savedSearches.length > 0 && <Separator />}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Recent Searches</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearRecent}
                    disabled={isClearing}
                    className="text-xs"
                  >
                    {isClearing ? 'Clearing...' : 'Clear All'}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {recentSearches.slice(0, 5).map((recent) => (
                    <div
                      key={recent.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        onSearchSelect(recent);
                        onClose();
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <Clock className="h-3 w-3 mt-0.5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {recent.query || 'Advanced search'}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {formatFilterSummary(recent.filters)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {recent.results_count} results
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(recent.searched_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {savedSearches.length === 0 && recentSearches.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No saved or recent searches
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Perform a search and save it for quick access later
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Edit Search Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Search</DialogTitle>
            <DialogDescription>
              Update the name of your saved search.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-search-name">Search Name</Label>
              <Input
                id="edit-search-name"
                placeholder="Enter search name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateSearch();
                  }
                }}
              />
            </div>
            {editingSearch && (
              <div className="text-sm text-muted-foreground">
                <strong>Filters:</strong> {formatFilterSummary(editingSearch.filters)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingSearch(null);
                setSearchName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSearch}
              disabled={isUpdating || !searchName.trim()}
            >
              {isUpdating ? 'Updating...' : 'Update Search'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};