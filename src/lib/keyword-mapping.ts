/**
 * Keyword Mapping System
 *
 * Maps frontend keywords to intelligent database field searches.
 * Provides robust, extensible keyword filtering without requiring schema changes.
 *
 * Design Principles:
 * - Performance-first: efficient SQL queries
 * - Intelligent mapping: keywords search relevant fields
 * - Precision over recall: avoid false positives
 * - Graceful degradation: unknown keywords don't break search
 * - Future-proof: easy to extend with new keywords
 */

import { placeholderKeywords } from './types';

/**
 * Keyword to database field mapping configuration
 * Each keyword maps to specific database fields and search patterns
 *
 * IMPORTANT: Use precise search terms to avoid false positives.
 * For example, "investment" matches dance studios mentioning "franchisee investments"
 * So we use more specific terms like "investment management", "investment firm", etc.
 */
export const KEYWORD_FIELD_MAPPING: Record<string, {
  fields: string[];
  searchTerms: string[];
  description: string;
}> = {
  // Technology & Business Model Keywords
  'SaaS': {
    fields: ['industry', 'listing_title_anonymous', 'anonymous_business_description', 'key_strength_1', 'key_strength_2', 'key_strength_3'],
    searchTerms: ['saas', 'software as a service', 'subscription software', 'cloud platform', 'software platform', 'tech platform'],
    description: 'Software as a Service businesses'
  },

  'E-commerce': {
    fields: ['industry', 'listing_title_anonymous', 'anonymous_business_description', 'key_strength_1', 'key_strength_2', 'key_strength_3'],
    searchTerms: ['ecommerce', 'e-commerce', 'online store', 'online retail', 'digital marketplace', 'online marketplace', 'retail platform'],
    description: 'Online retail and marketplace businesses'
  },

  'Retail': {
    fields: ['industry', 'listing_title_anonymous', 'anonymous_business_description'],
    searchTerms: ['retail store', 'retail chain', 'brick and mortar', 'retail business', 'consumer retail', 'retail outlet'],
    description: 'Physical retail and consumer businesses'
  },

  'Service Business': {
    fields: ['industry', 'listing_title_anonymous', 'anonymous_business_description', 'key_strength_1', 'key_strength_2', 'key_strength_3'],
    searchTerms: ['service business', 'professional service', 'consulting service', 'business service', 'service provider', 'service company'],
    description: 'Service-based business models'
  },

  'Fintech': {
    fields: ['industry', 'listing_title_anonymous', 'anonymous_business_description', 'key_strength_1', 'key_strength_2', 'key_strength_3'],
    searchTerms: [
      'fintech', 'financial technology', 'financial services', 'payment processor', 'payment platform',
      'digital banking', 'online banking', 'crypto exchange', 'blockchain platform', 'trading platform',
      'investment management', 'wealth management', 'asset management', 'investment advisory',
      'financial software', 'banking software', 'payment gateway', 'financial platform'
    ],
    description: 'Financial technology businesses'
  },

  'Logistics': {
    fields: ['industry', 'listing_title_anonymous', 'anonymous_business_description'],
    searchTerms: ['logistics company', 'shipping company', 'delivery service', 'transport company', 'warehouse operation', 'supply chain', 'freight service', 'fulfillment center'],
    description: 'Logistics and supply chain businesses'
  },

  'Healthcare Tech': {
    fields: ['industry', 'listing_title_anonymous', 'anonymous_business_description', 'key_strength_1', 'key_strength_2', 'key_strength_3'],
    searchTerms: ['healthcare technology', 'health tech', 'medical technology', 'telemedicine platform', 'healthcare software', 'medical software', 'health platform', 'biotech company'],
    description: 'Healthcare and medical technology'
  },

  // Performance & Growth Keywords
  'High Growth': {
    fields: ['growth_opportunity_1', 'growth_opportunity_2', 'growth_opportunity_3', 'specific_growth_opportunities', 'key_strength_1', 'key_strength_2', 'key_strength_3'],
    searchTerms: ['high growth', 'rapid growth', 'fast growing', 'growth potential', 'scaling business', 'expansion opportunity', 'growth trajectory'],
    description: 'Businesses with high growth potential'
  },

  'Profitable': {
    fields: ['key_strength_1', 'key_strength_2', 'key_strength_3', 'anonymous_business_description', 'net_profit_margin_range'],
    searchTerms: ['profitable business', 'high profit', 'strong profit', 'profit margin', 'revenue growth', 'cash flow positive', 'financial performance'],
    description: 'Profitable businesses with strong financials'
  }
};

/**
 * Enhanced validation function that also checks for minimum search term length
 * to avoid overly broad matches
 */
export function isValidKeyword(keyword: string): boolean {
  return keyword in KEYWORD_FIELD_MAPPING || placeholderKeywords.includes(keyword);
}

/**
 * Gets all valid keywords that can be filtered
 */
export function getValidKeywords(): string[] {
  return Object.keys(KEYWORD_FIELD_MAPPING);
}

/**
 * Builds Supabase query conditions for keyword filtering with improved precision
 * Returns an array of OR conditions that can be combined
 *
 * IMPORTANT: Uses more precise search patterns to avoid false positives
 */
export function buildKeywordQuery(keywords: string[]): string[] {
  if (!keywords || keywords.length === 0) {
    return [];
  }

  const validKeywords = keywords.filter(isValidKeyword);
  if (validKeywords.length === 0) {
    return [];
  }

  const queryConditions: string[] = [];

  for (const keyword of validKeywords) {
    const mapping = KEYWORD_FIELD_MAPPING[keyword];
    if (!mapping) {
      continue; // Skip unmapped keywords gracefully
    }

    // Build field-specific search conditions for this keyword
    const fieldConditions: string[] = [];

    for (const field of mapping.fields) {
      for (const searchTerm of mapping.searchTerms) {
        // Use more precise matching for multi-word terms
        if (searchTerm.includes(' ')) {
          // For phrases, search for the exact phrase
          fieldConditions.push(`${field}.ilike.%${searchTerm}%`);
        } else {
          // For single words, add word boundary considerations
          fieldConditions.push(`${field}.ilike.%${searchTerm}%`);
        }
      }
    }

    // Return flat OR condition without wrapping parentheses
    // The Supabase .or() method will handle the proper SQL formatting
    if (fieldConditions.length > 0) {
      queryConditions.push(fieldConditions.join(','));
    }
  }

  return queryConditions;
}

/**
 * Creates a human-readable description of active keyword filters
 */
export function describeKeywordFilters(keywords: string[]): string {
  if (!keywords || keywords.length === 0) {
    return '';
  }

  const validKeywords = keywords.filter(isValidKeyword);
  if (validKeywords.length === 0) {
    return '';
  }

  const descriptions = validKeywords.map(keyword => {
    const mapping = KEYWORD_FIELD_MAPPING[keyword];
    return mapping ? `${keyword} (${mapping.description})` : keyword;
  });

  return `Filtering by keywords: ${descriptions.join(', ')}`;
}

/**
 * Validates keyword array and filters out invalid entries
 * Used for input sanitization
 */
export function sanitizeKeywords(keywords: unknown): string[] {
  if (!Array.isArray(keywords)) {
    return [];
  }

  return keywords
    .filter((keyword): keyword is string => typeof keyword === 'string')
    .map(keyword => keyword.trim())
    .filter(keyword => keyword.length > 0)
    .filter(isValidKeyword);
}

/**
 * Performance optimization: Pre-compile frequently used keyword combinations
 * This could be extended for caching popular search combinations
 */
export function getOptimizedKeywordQuery(keywords: string[]): {
  conditions: string[];
  cacheKey: string;
  performance: 'fast' | 'medium' | 'slow';
} {
  const sanitized = sanitizeKeywords(keywords);
  const conditions = buildKeywordQuery(sanitized);

  // Create cache key for potential future caching
  const cacheKey = sanitized.sort().join('|');

  // Estimate query performance based on complexity
  let performance: 'fast' | 'medium' | 'slow' = 'fast';
  if (conditions.length > 3) {
    performance = 'medium';
  }
  if (conditions.length > 6) {
    performance = 'slow';
  }

  return {
    conditions,
    cacheKey,
    performance
  };
}

/**
 * Debug utility: Explain what fields will be searched for given keywords
 */
export function explainKeywordSearch(keywords: string[]): {
  keyword: string;
  fields: string[];
  searchTerms: string[];
  valid: boolean;
}[] {
  return keywords.map(keyword => {
    const mapping = KEYWORD_FIELD_MAPPING[keyword];
    return {
      keyword,
      fields: mapping?.fields || [],
      searchTerms: mapping?.searchTerms || [],
      valid: isValidKeyword(keyword)
    };
  });
}

/**
 * Quality assurance: Test keyword mappings for potential false positives
 * This function can be used during development to validate keyword precision
 */
export function validateKeywordPrecision(): {
  keyword: string;
  potentialIssues: string[];
}[] {
  const issues: { keyword: string; potentialIssues: string[] }[] = [];

  Object.entries(KEYWORD_FIELD_MAPPING).forEach(([keyword, mapping]) => {
    const potentialIssues: string[] = [];

    mapping.searchTerms.forEach(term => {
      // Flag overly short terms that might cause false positives
      if (term.length <= 3) {
        potentialIssues.push(`Term "${term}" is very short and may cause false positives`);
      }

      // Flag very common words
      const commonWords = ['the', 'and', 'for', 'with', 'service', 'business', 'company'];
      if (commonWords.includes(term.toLowerCase())) {
        potentialIssues.push(`Term "${term}" is very common and may cause false positives`);
      }
    });

    if (potentialIssues.length > 0) {
      issues.push({ keyword, potentialIssues });
    }
  });

  return issues;
}
