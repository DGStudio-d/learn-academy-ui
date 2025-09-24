import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  NotificationFilter, 
  NotificationType, 
  NotificationCategory, 
  NotificationPriority 
} from '@/types/notifications';
import { X } from 'lucide-react';

interface NotificationFiltersProps {
  onFilterChange: (filter: NotificationFilter) => void;
  currentFilter?: NotificationFilter;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  onFilterChange,
  currentFilter = {},
}) => {
  const [localFilter, setLocalFilter] = React.useState<NotificationFilter>(currentFilter);

  const handleFilterChange = (key: keyof NotificationFilter, value: any) => {
    const newFilter = { ...localFilter, [key]: value };
    setLocalFilter(newFilter);
    onFilterChange(newFilter);
  };

  const clearFilter = (key: keyof NotificationFilter) => {
    const newFilter = { ...localFilter };
    delete newFilter[key];
    setLocalFilter(newFilter);
    onFilterChange(newFilter);
  };

  const clearAllFilters = () => {
    setLocalFilter({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(localFilter).length > 0;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="type-filter" className="text-xs">Type</Label>
            <div className="flex items-center gap-2">
              <Select
                value={localFilter.type || ''}
                onValueChange={(value) => 
                  handleFilterChange('type', value || undefined)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {Object.values(NotificationType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {localFilter.type && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => clearFilter('type')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category-filter" className="text-xs">Category</Label>
            <div className="flex items-center gap-2">
              <Select
                value={localFilter.category || ''}
                onValueChange={(value) => 
                  handleFilterChange('category', value || undefined)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {Object.values(NotificationCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {localFilter.category && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => clearFilter('category')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label htmlFor="priority-filter" className="text-xs">Priority</Label>
            <div className="flex items-center gap-2">
              <Select
                value={localFilter.priority || ''}
                onValueChange={(value) => 
                  handleFilterChange('priority', value || undefined)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All priorities</SelectItem>
                  {Object.values(NotificationPriority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {localFilter.priority && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => clearFilter('priority')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Read Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="read-filter" className="text-xs">Status</Label>
            <div className="flex items-center gap-2">
              <Select
                value={localFilter.read !== undefined ? localFilter.read.toString() : ''}
                onValueChange={(value) => 
                  handleFilterChange('read', value === '' ? undefined : value === 'true')
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All status</SelectItem>
                  <SelectItem value="false">Unread</SelectItem>
                  <SelectItem value="true">Read</SelectItem>
                </SelectContent>
              </Select>
              {localFilter.read !== undefined && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => clearFilter('read')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date-from" className="text-xs">From Date</Label>
            <div className="flex items-center gap-2">
              <Input
                id="date-from"
                type="date"
                value={localFilter.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                className="h-8 text-xs"
              />
              {localFilter.dateFrom && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => clearFilter('dateFrom')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-to" className="text-xs">To Date</Label>
            <div className="flex items-center gap-2">
              <Input
                id="date-to"
                type="date"
                value={localFilter.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                className="h-8 text-xs"
              />
              {localFilter.dateTo && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => clearFilter('dateTo')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label className="text-xs">Active Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {localFilter.type && (
                <Badge variant="secondary" className="text-xs">
                  Type: {localFilter.type}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => clearFilter('type')}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              
              {localFilter.category && (
                <Badge variant="secondary" className="text-xs">
                  Category: {localFilter.category}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => clearFilter('category')}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              
              {localFilter.priority && (
                <Badge variant="secondary" className="text-xs">
                  Priority: {localFilter.priority}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => clearFilter('priority')}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              
              {localFilter.read !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  Status: {localFilter.read ? 'Read' : 'Unread'}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => clearFilter('read')}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};