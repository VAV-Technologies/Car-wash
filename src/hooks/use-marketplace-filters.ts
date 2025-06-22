'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface MarketplaceFilters {
  page: number;
  limit: number;
  industry?: string;
  country?: string;
  verificationStatus?: string;
  minPrice?: number;
  maxPrice?: number;
  keywords: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const DEFAULT_FILTERS: MarketplaceFilters = {
  page: 1,
  limit: 9,
  keywords: [],
  sortBy: 'asking_price',
  sortOrder: 'desc',
};

export function useMarketplaceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const parseFiltersFromURL = useCallback((): MarketplaceFilters => {
    return {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '9', 10),
      industry: searchParams.get('industry') || undefined,
      country: searchParams.get('country') || undefined,
      verificationStatus: searchParams.get('verificationStatus') || undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!, 10) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!, 10) : undefined,
      keywords: searchParams.get('keywords')?.split(',').filter(Boolean) || [],
      sortBy: searchParams.get('sort_by') || DEFAULT_FILTERS.sortBy,
      sortOrder: (searchParams.get('sort_order') as 'asc' | 'desc') || DEFAULT_FILTERS.sortOrder,
    };
  }, [searchParams]);

  // This state reflects the filters currently APPLIED and in the URL
  const [appliedFilters, setAppliedFilters] = useState<MarketplaceFilters>(parseFiltersFromURL);
  // This state reflects the filters being EDITED in the UI before applying
  const [draftFilters, setDraftFilters] = useState<MarketplaceFilters>(parseFiltersFromURL);

  const [isLoading, setIsLoading] = useState(false);

  // Update draftFilters when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlFilters = parseFiltersFromURL();
    setAppliedFilters(urlFilters);
    setDraftFilters(urlFilters);
  }, [searchParams, parseFiltersFromURL]);

  const filtersToURLParams = useCallback((filterValues: MarketplaceFilters): URLSearchParams => {
    const params = new URLSearchParams();
    if (filterValues.page !== DEFAULT_FILTERS.page) params.set('page', filterValues.page.toString());
    if (filterValues.limit !== DEFAULT_FILTERS.limit) params.set('limit', filterValues.limit.toString());
    if (filterValues.industry && filterValues.industry !== 'all') params.set('industry', filterValues.industry);
    if (filterValues.country && filterValues.country !== 'all') params.set('country', filterValues.country);
    if (filterValues.verificationStatus) params.set('verificationStatus', filterValues.verificationStatus);
    if (filterValues.minPrice !== undefined) params.set('minPrice', filterValues.minPrice.toString());
    if (filterValues.maxPrice !== undefined) params.set('maxPrice', filterValues.maxPrice.toString());
    if (filterValues.keywords.length > 0) params.set('keywords', filterValues.keywords.join(','));
    if (filterValues.sortBy !== DEFAULT_FILTERS.sortBy) params.set('sort_by', filterValues.sortBy);
    if (filterValues.sortOrder !== DEFAULT_FILTERS.sortOrder) params.set('sort_order', filterValues.sortOrder);
    return params;
  }, []);

  // Function to apply draft filters and update URL
  const applyFilters = useCallback(() => {
    setAppliedFilters(prev => ({ ...prev, ...draftFilters, page: 1 })); // Reset to page 1 on new filter application
    const urlParams = filtersToURLParams({ ...draftFilters, page: 1 });
    router.push(`${pathname}?${urlParams.toString()}`, { scroll: false });
  }, [draftFilters, router, pathname, filtersToURLParams]);

  // Update individual draft filter values
  const updateDraftFilter = useCallback(<K extends keyof MarketplaceFilters>(
    key: K,
    value: MarketplaceFilters[K]
  ) => {
    setDraftFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple draft filters at once
  const updateDraftFilters = useCallback((updates: Partial<MarketplaceFilters>) => {
    setDraftFilters(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset all draft filters to defaults and apply
  const resetAndApplyFilters = useCallback(() => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    const urlParams = filtersToURLParams(DEFAULT_FILTERS);
    router.push(`${pathname}?${urlParams.toString()}`, { scroll: false });
  }, [router, pathname, filtersToURLParams]);

  // Page navigation (updates applied filters directly as pagination is an immediate action)
  const setPage = useCallback((page: number) => {
    const newFilters = { ...appliedFilters, page };
    setAppliedFilters(newFilters);
    setDraftFilters(newFilters); // Keep draft in sync with applied for pagination
    const urlParams = filtersToURLParams(newFilters);
    router.push(`${pathname}?${urlParams.toString()}`, { scroll: false });
  }, [appliedFilters, router, pathname, filtersToURLParams]);

  // Generate API parameters from APPLIED filters
  const getAPIParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {
      page: appliedFilters.page.toString(),
      limit: appliedFilters.limit.toString(),
      sort_by: appliedFilters.sortBy,
      sort_order: appliedFilters.sortOrder,
    };
    if (appliedFilters.industry && appliedFilters.industry !== 'all') params.industry = appliedFilters.industry;
    if (appliedFilters.country && appliedFilters.country !== 'all') params.country = appliedFilters.country;
    if (appliedFilters.verificationStatus) params.verificationStatus = appliedFilters.verificationStatus;
    if (appliedFilters.minPrice !== undefined) params.min_price = appliedFilters.minPrice.toString();
    if (appliedFilters.maxPrice !== undefined) params.max_price = appliedFilters.maxPrice.toString();
    if (appliedFilters.keywords.length > 0) params.keywords = appliedFilters.keywords.join(',');
    return params;
  }, [appliedFilters]);

  return {
    draftFilters,     // Filters being edited in the UI
    appliedFilters,   // Filters currently active and in URL
    updateDraftFilter,
    updateDraftFilters,
    applyFilters,
    resetAndApplyFilters,
    setPage,
    getAPIParams,
    isLoading,
    setIsLoading,
    hasActiveFilters: useMemo(() => {
      return (
        !!appliedFilters.industry ||
        !!appliedFilters.country ||
        !!appliedFilters.verificationStatus ||
        appliedFilters.minPrice !== undefined ||
        appliedFilters.maxPrice !== undefined ||
        appliedFilters.keywords.length > 0 ||
        appliedFilters.sortBy !== DEFAULT_FILTERS.sortBy ||
        appliedFilters.sortOrder !== DEFAULT_FILTERS.sortOrder
      );
    }, [appliedFilters]),
  };
}
