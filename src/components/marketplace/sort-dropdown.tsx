'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useMarketplaceFilters } from '@/hooks/use-marketplace-filters';
import { apiToSortOption, sortOptionToAPI, SORT_OPTIONS } from '@/lib/marketplace-utils';

export function SortDropdown() {
  const { appliedFilters, updateDraftFilters, applyFilters, isLoading } = useMarketplaceFilters();

  // Convert current API sorting to display value - use appliedFilters, not effectiveFilters
  const currentSortOption = apiToSortOption(appliedFilters.sortBy, appliedFilters.sortOrder);

  const handleSortChange = (value: string) => {
    try {
      const { sortBy, sortOrder } = sortOptionToAPI(value);
      // Update draft filters and immediately apply for sorting (sorting is immediate action)
      updateDraftFilters({ sortBy, sortOrder });
      // Apply immediately for sorting since it's a direct action like pagination
      setTimeout(() => applyFilters(), 0);
    } catch (error) {
      console.error('Error updating sort:', error);
      // Graceful fallback - don't update if there's an error
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="sort-by" className="text-sm font-medium text-white">
        Sort by:
      </Label>
      <Select
        value={currentSortOption}
        onValueChange={handleSortChange}
        disabled={isLoading}
      >
        <SelectTrigger
          id="sort-by"
          className="w-full sm:w-[200px] bg-white/10 backdrop-blur-md border-white/20 text-white focus:ring-brand-sky-blue focus:border-brand-sky-blue hover:bg-white/20 transition-colors"
        >
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-brand-dark-blue border-white/20 text-white">
          {Object.entries(SORT_OPTIONS).map(([key, _]) => (
            <SelectItem
              key={key}
              value={key}
              className="focus:bg-white/10 focus:text-white cursor-pointer"
            >
              {getSortOptionLabel(key)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading && (
        <div className="text-xs text-brand-sky-blue animate-pulse">
          Updating...
        </div>
      )}
    </div>
  );
}

/**
 * Get human-readable label for sort options
 */
function getSortOptionLabel(option: string): string {
  const labels: Record<string, string> = {
    'price-low-high': 'Asking Price: Low to High',
    'price-high-low': 'Asking Price: High to Low',
    'revenue-low-high': 'Revenue Range: Low to High',
    'revenue-high-low': 'Revenue Range: High to Low',
  };

  return labels[option] || 'Unknown';
}
