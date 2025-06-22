/**
 * Marketplace Utilities
 *
 * Provides robust value mapping, transformations, and validation
 * between frontend UI components and backend API parameters.
 *
 * Key principles:
 * - Graceful handling of invalid/undefined values
 * - Clear separation between display and API values
 * - Comprehensive error handling and fallbacks
 */

// Industry mappings for consistent display and API values
export const INDUSTRIES = {
  'accounting-legal': 'Accounting & Legal',
  'agriculture': 'Agriculture',
  'arts-entertainment': 'Arts & Entertainment',
  'automotive': 'Automotive (Sales & Repair)',
  'banking-finance': 'Banking & Finance',
  'construction-trades': 'Construction & Trades',
  'consulting': 'Consulting',
  'education': 'Education',
  'energy-mining': 'Energy & Mining',
  'events-recreation': 'Events & Recreation',
  'government-public-service': 'Government & Public Service',
  'health-wellness': 'Health & Wellness',
  'hospitality': 'Hospitality (Hotels & Accommodations)',
  'information-technology': 'Information Technology (IT)',
  'insurance': 'Insurance',
  'manufacturing-production': 'Manufacturing & Production',
  'marketing-advertising': 'Marketing & Advertising',
  'media-communications': 'Media & Communications',
  'personal-care-services': 'Personal Care & Services',
  'real-estate': 'Real Estate',
  'restaurants-food-service': 'Restaurants & Food Service',
  'retail-e-commerce': 'Retail & E-commerce',
  'transportation-logistics': 'Transportation & Logistics',
  'other': 'Other'
} as const;

// Country mappings for consistent display and API values
export const COUNTRIES = {
  'australia': 'Australia',
  'canada': 'Canada',
  'china': 'China',
  'france': 'France',
  'germany': 'Germany',
  'india': 'India',
  'indonesia': 'Indonesia',
  'japan': 'Japan',
  'singapore': 'Singapore',
  'south-korea': 'South Korea',
  'thailand': 'Thailand',
  'united-kingdom': 'United Kingdom',
  'united-states': 'United States',
  'vietnam': 'Vietnam',
} as const;

// Sort option mappings
export const SORT_OPTIONS = {
  'price-low-high': { sortBy: 'asking_price', sortOrder: 'asc' as const },
  'price-high-low': { sortBy: 'asking_price', sortOrder: 'desc' as const },
  'revenue-low-high': { sortBy: 'specific_annual_revenue_last_year', sortOrder: 'asc' as const },
  'revenue-high-low': { sortBy: 'specific_annual_revenue_last_year', sortOrder: 'desc' as const },
} as const;

export type SortOption = keyof typeof SORT_OPTIONS;

/**
 * Converts sort option key to API parameters
 */
export function sortOptionToAPI(sortOption: string): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  const option = SORT_OPTIONS[sortOption as SortOption];
  if (option) {
    return { sortBy: option.sortBy, sortOrder: option.sortOrder };
  }

  // Fallback to default sorting (price high to low)
  return { sortBy: 'asking_price', sortOrder: 'desc' };
}

/**
 * Converts API sort parameters back to sort option key
 */
export function apiToSortOption(sortBy: string, sortOrder: string): SortOption {
  const entries = Object.entries(SORT_OPTIONS) as [SortOption, typeof SORT_OPTIONS[SortOption]][];

  for (const [key, value] of entries) {
    if (value.sortBy === sortBy && value.sortOrder === sortOrder) {
      return key;
    }
  }

  // Fallback to price high to low
  return 'price-high-low';
}

/**
 * Normalizes industry value for API
 * - Converts display values to API format
 * - Handles "all" case by returning undefined
 * - Case-insensitive matching for better filtering
 * - Maps unknown industries to "Other"
 * - Sanitizes input
 */
export function normalizeIndustryValue(industry: string | undefined): string | undefined {
  if (!industry || industry === 'all' || industry === '') {
    return undefined;
  }

  // Normalize to lower case for comparison
  const lowerIndustry = industry.toLowerCase();

  // First, try to find exact match in INDUSTRIES values (case-insensitive)
  const industryValues = Object.values(INDUSTRIES);
  const exactMatch = industryValues.find(val => val.toLowerCase() === lowerIndustry);
  if (exactMatch) {
    return exactMatch;
  }

  // If it's kebab-case, convert back to proper format
  if (lowerIndustry.includes('-')) {
    const converted = lowerIndustry
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' & ');

    // Check if converted version matches any industry
    const convertedMatch = industryValues.find(val => val.toLowerCase() === converted.toLowerCase());
    if (convertedMatch) {
      return convertedMatch;
    }
  }

  // For unmapped industries, return "Other" to ensure they show up in filters
  console.log(`[INDUSTRY-NORMALIZATION] Unknown industry "${industry}" mapped to "Other"`);
  return 'Other';
}

/**
 * Normalizes country value for API
 * - Converts display values to API format
 * - Handles "all" case by returning undefined
 * - Case-insensitive matching for better filtering
 * - Sanitizes input
 */
export function normalizeCountryValue(country: string | undefined): string | undefined {
  if (!country || country === 'all' || country === '') {
    return undefined;
  }

  // Normalize to lower case for comparison
  const lowerCountry = country.toLowerCase();

  // Convert kebab-case back to proper format if needed
  if (lowerCountry.includes('-')) {
    return lowerCountry
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // For direct matches, preserve the original casing from database
  return country;
}

/**
 * Validates and normalizes price input
 * - Ensures positive numbers only
 * - Handles string/number conversion
 * - Returns undefined for invalid inputs
 */
export function normalizePriceValue(price: string | number | undefined): number | undefined {
  if (price === undefined || price === null || price === '') {
    return undefined;
  }

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numericPrice) || numericPrice < 0) {
    return undefined;
  }

  return Math.floor(numericPrice); // Remove decimal places for pricing
}

/**
 * Validates and normalizes keyword array
 * - Filters out empty/invalid keywords
 * - Deduplicates keywords
 * - Trims whitespace
 */
export function normalizeKeywords(keywords: string[]): string[] {
  if (!Array.isArray(keywords)) {
    return [];
  }

  return [...new Set(
    keywords
      .filter(keyword => typeof keyword === 'string' && keyword.trim().length > 0)
      .map(keyword => keyword.trim())
  )];
}

/**
 * Converts display industry to select value format
 * Used for populating form dropdowns
 */
export function industryToSelectValue(industry: string): string {
  return industry.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Converts display country to select value format
 * Used for populating form dropdowns
 */
export function countryToSelectValue(country: string): string {
  return country.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Formats price for display in UI
 * - Adds proper formatting and currency
 * - Handles undefined/null values
 */
export function formatPriceForDisplay(price: number | undefined): string {
  if (price === undefined || price === null) {
    return '';
  }

  return price.toLocaleString();
}

/**
 * Enhanced price formatting for input fields
 * - Formats numbers with commas for readability
 * - Handles undefined/null values gracefully
 */
export function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null) {
    return '';
  }
  return price.toLocaleString('en-US');
}

/**
 * Parses price input from user
 * - Removes commas and formatting
 * - Converts to number or undefined
 * - Handles invalid inputs gracefully
 */
export function parsePriceInput(input: string): number | undefined {
  if (!input || input.trim() === '') {
    return undefined;
  }

  // Remove commas, dollar signs, and other formatting
  const cleanInput = input.replace(/[$,\s]/g, '');
  const numericValue = parseFloat(cleanInput);

  if (isNaN(numericValue) || numericValue < 0) {
    return undefined;
  }

  return Math.floor(numericValue);
}

/**
 * Validates price range and provides specific error messages
 * - Checks for logical price range
 * - Provides user-friendly error messages
 */
export function validatePriceRange(
  minPrice: number | undefined,
  maxPrice: number | undefined
): { isValid: boolean; errors: { min?: string; max?: string } } {
  const errors: { min?: string; max?: string } = {};

  // Validate individual prices
  if (minPrice !== undefined && minPrice < 0) {
    errors.min = 'Minimum price must be positive';
  }

  if (maxPrice !== undefined && maxPrice < 0) {
    errors.max = 'Maximum price must be positive';
  }

  // Validate price range logic
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    errors.min = 'Minimum price cannot exceed maximum price';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates all filter values and provides error messages
 * Used for form validation and user feedback
 */
export function validateFilters(filters: {
  industry?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  keywords?: string[];
  search?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate price range
  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    if (filters.minPrice > filters.maxPrice) {
      errors.push('Minimum price cannot be greater than maximum price');
    }
  }

  // Validate price values
  if (filters.minPrice !== undefined && filters.minPrice < 0) {
    errors.push('Minimum price must be a positive number');
  }

  if (filters.maxPrice !== undefined && filters.maxPrice < 0) {
    errors.push('Maximum price must be a positive number');
  }

  // Validate search length
  if (filters.search && filters.search.length > 100) {
    errors.push('Search query is too long (maximum 100 characters)');
  }

  // Validate keywords
  if (filters.keywords && filters.keywords.length > 10) {
    errors.push('Too many keywords selected (maximum 10)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Creates a human-readable summary of active filters
 * Used for UI feedback and accessibility
 */
export function createFilterSummary(filters: {
  industry?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  keywords?: string[];
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): string {
  const parts: string[] = [];

  if (filters.search) {
    parts.push(`search: "${filters.search}"`);
  }

  if (filters.industry) {
    parts.push(`industry: ${filters.industry}`);
  }

  if (filters.country) {
    parts.push(`country: ${filters.country}`);
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice ? `$${filters.minPrice.toLocaleString()}` : '';
    const max = filters.maxPrice ? `$${filters.maxPrice.toLocaleString()}` : '';

    if (min && max) {
      parts.push(`price: ${min} - ${max}`);
    } else if (min) {
      parts.push(`price: ${min}+`);
    } else if (max) {
      parts.push(`price: up to ${max}`);
    }
  }

  if (filters.keywords && filters.keywords.length > 0) {
    parts.push(`keywords: ${filters.keywords.join(', ')}`);
  }

  if (filters.sortBy && filters.sortOrder) {
    const sortOption = apiToSortOption(filters.sortBy, filters.sortOrder);
    const sortLabels: Record<SortOption, string> = {
      'price-low-high': 'price: low to high',
      'price-high-low': 'price: high to low',
      'revenue-low-high': 'revenue: low to high',
      'revenue-high-low': 'revenue: high to low',
    };
    parts.push(`sorted by: ${sortLabels[sortOption]}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'no filters active';
}
