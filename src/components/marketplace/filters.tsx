'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Search, RotateCcw, Filter, Plus, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useMarketplaceFilters } from '@/hooks/use-marketplace-filters';
import {
  INDUSTRIES,
  COUNTRIES,
  validatePriceRange,
  formatPrice,
  parsePriceInput
} from '@/lib/marketplace-utils';
import { placeholderKeywords } from '@/lib/types';

// Verification status options for filtering
const VERIFICATION_STATUS_OPTIONS = {
  'all': 'All Listings',
  'verified': 'Verified Only',
  'unverified': 'Unverified Only'
} as const;

export function Filters() {
  const {
    draftFilters,
    appliedFilters,
    updateDraftFilter,
    updateDraftFilters,
    applyFilters,
    resetAndApplyFilters,
    isLoading,
    hasActiveFilters,
  } = useMarketplaceFilters();

  // Local state for custom keyword input
  const [customKeywordInput, setCustomKeywordInput] = useState('');
  const [priceErrors, setPriceErrors] = useState<{ min?: string; max?: string }>({});

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);
  }, [draftFilters, appliedFilters]);

  // Handle revenue input with validation
  const handleRevenueChange = useCallback((type: 'min' | 'max', value: string) => {
    const numericValue = parsePriceInput(value);

    if (type === 'min') {
      updateDraftFilter('minRevenue', numericValue);
    } else {
      updateDraftFilter('maxRevenue', numericValue);
    }

    // Validate revenue range
    const minRevenue = type === 'min' ? numericValue : draftFilters.minRevenue;
    const maxRevenue = type === 'max' ? numericValue : draftFilters.maxRevenue;

    const validation = validatePriceRange(minRevenue, maxRevenue);
    setPriceErrors(validation.errors);
  }, [draftFilters.minRevenue, draftFilters.maxRevenue, updateDraftFilter]);

  // Handle predefined keyword toggle
  const handlePredefinedKeywordToggle = useCallback((keyword: string) => {
    const currentKeywords = draftFilters.keywords || [];
    const isSelected = currentKeywords.includes(keyword);

    const newKeywords = isSelected
      ? currentKeywords.filter(k => k !== keyword)
      : [...currentKeywords, keyword];

    updateDraftFilter('keywords', newKeywords);
  }, [draftFilters.keywords, updateDraftFilter]);

  // Handle custom keyword addition
  const handleAddCustomKeyword = useCallback(() => {
    const trimmedKeyword = customKeywordInput.trim();
    if (!trimmedKeyword) return;

    const currentKeywords = draftFilters.keywords || [];

    // Avoid duplicates (case-insensitive)
    const keywordExists = currentKeywords.some(
      k => k.toLowerCase() === trimmedKeyword.toLowerCase()
    );

    if (!keywordExists) {
      updateDraftFilter('keywords', [...currentKeywords, trimmedKeyword]);
    }

    setCustomKeywordInput('');
  }, [customKeywordInput, draftFilters.keywords, updateDraftFilter]);

  // Handle keyword removal
  const handleRemoveKeyword = useCallback((keywordToRemove: string) => {
    const currentKeywords = draftFilters.keywords || [];
    const newKeywords = currentKeywords.filter(k => k !== keywordToRemove);
    updateDraftFilter('keywords', newKeywords);
  }, [draftFilters.keywords, updateDraftFilter]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Don't submit if there are price validation errors
    if (priceErrors.min || priceErrors.max) {
      return;
    }

    applyFilters();
  }, [applyFilters, priceErrors]);

  // Handle reset
  const handleReset = useCallback(() => {
    resetAndApplyFilters();
    setCustomKeywordInput('');
    setPriceErrors({});
  }, [resetAndApplyFilters]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-none border border-white/20 p-6 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-brand-sky-blue" />
          <h3 className="text-lg font-normal text-white">Fil<span style={{ fontSize: '1.06em' }}>t</span>er Lis<span style={{ fontSize: '1.06em' }}>t</span>ings</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-gray-300 hover:text-white hover:bg-white/10 rounded-none"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">


        {/* Verification Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="verificationStatus" className="text-sm font-medium text-gray-200">
            Verification Status
          </Label>
          <Select
            value={draftFilters.verificationStatus || 'all'}
            onValueChange={(value) => updateDraftFilter('verificationStatus', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="verificationStatus" className="w-full bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Select verification status" />
            </SelectTrigger>
            <SelectContent className="bg-brand-dark-blue border-white/20 text-white">
              {Object.entries(VERIFICATION_STATUS_OPTIONS).map(([key, label]) => (
                <SelectItem key={key} value={key} className="focus:bg-white/10 focus:text-white">
                  <div className="flex items-center space-x-2">
                    {key === 'verified' && <ShieldCheck className="h-4 w-4 text-green-400" />}
                    {key === 'unverified' && <EyeOff className="h-4 w-4 text-gray-400" />}
                    {key === 'all' && <Eye className="h-4 w-4 text-blue-400" />}
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400">
            Filter by admin verification status. Verified listings have undergone additional review.
          </p>
        </div>

        {/* Industry Filter */}
        <div className="space-y-2">
          <Label htmlFor="industry" className="text-sm font-medium text-gray-200">
            Industry
          </Label>
          <Select
            value={draftFilters.industry || 'all'}
            onValueChange={(value) => updateDraftFilter('industry', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="industry" className="w-full bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent className="bg-brand-dark-blue border-white/20 text-white max-h-[300px]">
              <SelectItem value="all" className="focus:bg-white/10 focus:text-white">All Industries</SelectItem>
              {Object.entries(INDUSTRIES).map(([key, label]) => (
                <SelectItem key={key} value={key} className="focus:bg-white/10 focus:text-white">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country Filter */}
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium text-gray-200">
            Country
          </Label>
          <Select
            value={draftFilters.country || 'all'}
            onValueChange={(value) => updateDraftFilter('country', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="country" className="w-full bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="bg-brand-dark-blue border-white/20 text-white max-h-[300px]">
              <SelectItem value="all" className="focus:bg-white/10 focus:text-white">All Countries</SelectItem>
              {Object.entries(COUNTRIES).map(([key, label]) => (
                <SelectItem key={key} value={key} className="focus:bg-white/10 focus:text-white">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Revenue Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-200">
            Revenue Range (USD)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Input
                type="text"
                placeholder="Min revenue"
                value={draftFilters.minRevenue ? formatPrice(draftFilters.minRevenue) : ''}
                onChange={(e) => handleRevenueChange('min', e.target.value)}
                className={`bg-white/5 border-white/20 text-white placeholder:text-gray-500 ${priceErrors.min ? 'border-red-500' : ''}`}
              />
              {priceErrors.min && (
                <p className="text-xs text-red-400">{priceErrors.min}</p>
              )}
            </div>
            <div className="space-y-1">
              <Input
                type="text"
                placeholder="Max revenue"
                value={draftFilters.maxRevenue ? formatPrice(draftFilters.maxRevenue) : ''}
                onChange={(e) => handleRevenueChange('max', e.target.value)}
                className={`bg-white/5 border-white/20 text-white placeholder:text-gray-500 ${priceErrors.max ? 'border-red-500' : ''}`}
              />
              {priceErrors.max && (
                <p className="text-xs text-red-400">{priceErrors.max}</p>
              )}
            </div>
          </div>
        </div>

        {/* Keywords Section - Main Search Functionality */}
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-gray-200">
              Search by Keywords
            </Label>
            <p className="text-xs text-gray-400 mt-1">
              Add keywords to search across listings titles, descriptions, and business details
            </p>
          </div>

          {/* Custom Keyword Input */}
          <div className="flex gap-3 items-stretch">
            <Input
              type="text"
              placeholder="Add keywords to search for..."
              value={customKeywordInput}
              onChange={(e) => setCustomKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomKeyword();
                }
              }}
              className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-gray-500 h-auto"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomKeyword}
              disabled={!customKeywordInput.trim()}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-none h-auto"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Predefined Keywords */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-300">
              Popular Keywords
            </Label>
            <div className="flex flex-wrap gap-2">
              {placeholderKeywords.map((keyword) => {
                const isSelected = draftFilters.keywords?.includes(keyword) || false;
                return (
                  <Button
                    key={keyword}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePredefinedKeywordToggle(keyword)}
                    className={`text-xs rounded-none ${isSelected ? 'bg-brand-sky-blue text-white hover:bg-brand-sky-blue/90' : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white'}`}
                  >
                    {keyword}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Selected Keywords Display */}
          {draftFilters.keywords && draftFilters.keywords.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-300">
                Selected Keywords ({draftFilters.keywords.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {draftFilters.keywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="flex items-center space-x-1 bg-brand-sky-blue/20 text-brand-sky-blue border border-brand-sky-blue/30"
                  >
                    <span>{keyword}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1 hover:bg-brand-sky-blue/30 rounded-none p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border border-white/15 p-2 space-y-2">
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || (priceErrors.min || priceErrors.max) ? true : false}
            className="w-full bg-brand-sky-blue text-white hover:bg-brand-sky-blue/90 rounded-none"
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Searching...' : 'Apply Filters'}
          </Button>

          {hasUnsavedChanges && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset draft to applied (discard changes)
                updateDraftFilters(appliedFilters);
                setCustomKeywordInput('');
                setPriceErrors({});
              }}
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 rounded-none"
              size="sm"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && (
          <div className="text-xs text-amber-300 bg-amber-900/30 p-2 rounded-none border border-amber-500/50">
            You have unsaved filter changes. Click "Apply Filters" to search with these settings.
          </div>
        )}
      </form>
    </div>
  );
}
