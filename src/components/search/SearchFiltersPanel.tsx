import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  X, 
  RotateCcw, 
  Calendar,
  User,
  BookOpen,
  FileQuestion,
  Video,
  Check,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { SearchFilters } from '@/services/searchService';
import { useAdmin } from '@/hooks/useAdmin';
import { useTeacher } from '@/hooks/useTeacher';
import { cn } from '@/lib/utils';

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClose: () => void;
  className?: string;
}

export const SearchFiltersPanel: React.FC<SearchFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  onClose,
  className
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  // Get data for filter options
  const { programs, teachers, languages } = useAdmin();

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle local filter changes
  const handleLocalFilterChange = (key: keyof SearchFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters: SearchFilters = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  // Clear specific filter
  const handleClearFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
  };

  // Handle content type selection
  const handleContentTypeChange = (contentType: string, checked: boolean) => {
    const currentTypes = localFilters.content_types || [];
    let newTypes: string[];
    
    if (checked) {
      newTypes = [...currentTypes, contentType];
    } else {
      newTypes = currentTypes.filter(type => type !== contentType);
    }
    
    handleLocalFilterChange('content_types', newTypes.length > 0 ? newTypes : undefined);
  };

  const contentTypes = [
    { value: 'users', label: 'Users', icon: User },
    { value: 'programs', label: 'Programs', icon: BookOpen },
    { value: 'quizzes', label: 'Quizzes', icon: FileQuestion },
    { value: 'meetings', label: 'Meetings', icon: Video },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'created_at', label: 'Date Created' },
    { value: 'updated_at', label: 'Date Modified' },
    { value: 'name', label: 'Name' },
    { value: 'title', label: 'Title' },
  ];

  const activeFiltersCount = Object.keys(localFilters).filter(
    key => localFilters[key as keyof SearchFilters] !== undefined && 
           localFilters[key as keyof SearchFilters] !== null &&
           localFilters[key as keyof SearchFilters] !== ''
  ).length;

  return (
    <div className={cn("w-full max-w-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Search Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount}
            </Badge>
          )}
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

      <div className="p-4 space-y-6">
        {/* Content Types */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Content Types</Label>
          <div className="space-y-2">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              const isChecked = localFilters.content_types?.includes(type.value as any) || false;
              
              return (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`content-type-${type.value}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => 
                      handleContentTypeChange(type.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`content-type-${type.value}`}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Icon className="h-3 w-3" />
                    {type.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* User Role Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">User Role</Label>
          <Select
            value={localFilters.role || ''}
            onValueChange={(value) => 
              handleLocalFilterChange('role', value || undefined)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language Filter */}
        {languages && languages.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Language</Label>
            <Select
              value={localFilters.language_id?.toString() || ''}
              onValueChange={(value) => 
                handleLocalFilterChange('language_id', value ? parseInt(value) : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Languages</SelectItem>
                {languages.map((language) => (
                  <SelectItem key={language.id} value={language.id.toString()}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Program Filter */}
        {programs && programs.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Program</Label>
            <Select
              value={localFilters.program_id?.toString() || ''}
              onValueChange={(value) => 
                handleLocalFilterChange('program_id', value ? parseInt(value) : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id.toString()}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Teacher Filter */}
        {teachers && teachers.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Teacher</Label>
            <Select
              value={localFilters.teacher_id?.toString() || ''}
              onValueChange={(value) => 
                handleLocalFilterChange('teacher_id', value ? parseInt(value) : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Teachers</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            {/* Date From */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.date_from && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {localFilters.date_from ? (
                      format(new Date(localFilters.date_from), "MMM dd")
                    ) : (
                      "From"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={localFilters.date_from ? new Date(localFilters.date_from) : undefined}
                    onSelect={(date) => {
                      handleLocalFilterChange('date_from', date ? format(date, 'yyyy-MM-dd') : undefined);
                      setDateFromOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.date_to && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {localFilters.date_to ? (
                      format(new Date(localFilters.date_to), "MMM dd")
                    ) : (
                      "To"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={localFilters.date_to ? new Date(localFilters.date_to) : undefined}
                    onSelect={(date) => {
                      handleLocalFilterChange('date_to', date ? format(date, 'yyyy-MM-dd') : undefined);
                      setDateToOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Status</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-active"
                checked={localFilters.is_active === true}
                onCheckedChange={(checked) => 
                  handleLocalFilterChange('is_active', checked ? true : undefined)
                }
              />
              <Label htmlFor="is-active" className="text-sm cursor-pointer">
                Active only
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="guest-access"
                checked={localFilters.guest_access === true}
                onCheckedChange={(checked) => 
                  handleLocalFilterChange('guest_access', checked ? true : undefined)
                }
              />
              <Label htmlFor="guest-access" className="text-sm cursor-pointer">
                Guest accessible
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sort Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sort By</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={localFilters.sort_by || 'relevance'}
              onValueChange={(value) => 
                handleLocalFilterChange('sort_by', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={localFilters.sort_order || 'desc'}
              onValueChange={(value) => 
                handleLocalFilterChange('sort_order', value as 'asc' | 'desc')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t bg-muted/50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetFilters}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApplyFilters}
            className="flex items-center gap-2"
          >
            <Check className="h-3 w-3" />
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
  