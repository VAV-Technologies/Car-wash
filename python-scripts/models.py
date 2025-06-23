"""
Data models for Nobridge Marketplace listings
"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from decimal import Decimal
import re
import json
from datetime import datetime

from config import VALIDATION_RULES, DEFAULTS, COUNTRY_CITY_DEFAULTS


@dataclass
class BusinessListing:
    """
    Complete business listing data model matching the database schema
    """
    # Core identification
    listing_id: str
    title: str
    industry: str

    # Location information
    location_country: str
    location_city: str

    # Business details
    description: str
    business_model: str
    year_established: Optional[int] = None
    employees: str = field(default_factory=lambda: DEFAULTS['employees'])

    # Financial information
    asking_price: Optional[Decimal] = None
    annual_revenue: Optional[Decimal] = None
    annual_revenue_range: str = field(default_factory=lambda: DEFAULTS['annual_revenue_range'])
    net_profit_margin_range: str = field(default_factory=lambda: DEFAULTS['net_profit_margin_range'])
    adjusted_cash_flow: Optional[Decimal] = None

    # Business intelligence
    key_strengths: List[str] = field(default_factory=list)
    growth_opportunities: List[str] = field(default_factory=list)
    reason_for_selling: str = field(default_factory=lambda: DEFAULTS['reason_selling'])
    deal_structure: List[str] = field(default_factory=lambda: ["Asset Purchase"])

    # Digital presence
    business_website: Optional[str] = None
    social_media_links: Optional[str] = None
    registered_business_name: Optional[str] = None

    # Image and media
    image_url: str = ""
    image_filename: str = ""
    image_path: str = ""

    # Status and metadata
    status: str = field(default_factory=lambda: DEFAULTS['status'])
    is_seller_verified: bool = field(default_factory=lambda: DEFAULTS['is_seller_verified'])
    created_days_ago: int = 0

    def __post_init__(self):
        """Validate and clean data after initialization"""
        self.validate_and_clean()

    def validate_and_clean(self):
        """Comprehensive validation and data cleaning"""
        # Clean and validate title
        self.title = self._clean_text(self.title)
        if len(self.title) < VALIDATION_RULES['min_title_length']:
            raise ValueError(f"Title too short: {self.title}")
        if len(self.title) > VALIDATION_RULES['max_title_length']:
            self.title = self.title[:VALIDATION_RULES['max_title_length']]

        # Clean and validate description
        self.description = self._clean_text(self.description)
        if len(self.description) < VALIDATION_RULES['min_description_length']:
            # Generate description if too short
            self.description = self._generate_description()
        if len(self.description) > VALIDATION_RULES['max_description_length']:
            self.description = self.description[:VALIDATION_RULES['max_description_length']]

        # Validate and clean location
        self.location_country = self._clean_text(self.location_country)
        self.location_city = self._clean_text(self.location_city)
        if not self.location_city:
            self.location_city = COUNTRY_CITY_DEFAULTS.get(self.location_country, 'Major City')

        # Validate industry
        self.industry = self._clean_text(self.industry) or 'General Business'

        # Validate year established
        if self.year_established:
            if (self.year_established < VALIDATION_RULES['min_year_established'] or
                self.year_established > VALIDATION_RULES['max_year_established']):
                self.year_established = None

        # Validate asking price
        if self.asking_price and self.asking_price > VALIDATION_RULES['max_asking_price']:
            self.asking_price = None

        # Clean business model
        self.business_model = self._clean_text(self.business_model) or DEFAULTS['business_model']

        # Validate image URL
        if not self.image_url or not self._is_valid_url(self.image_url):
            raise ValueError(f"Invalid or missing image URL: {self.image_url}")

    def _clean_text(self, text: str) -> str:
        """Clean and normalize text fields"""
        if not text or str(text).lower() in ['nan', 'null', 'none', '']:
            return ""

        # Clean the text
        cleaned = str(text).strip()
        # Remove excessive whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned)
        # Remove common CSV artifacts
        cleaned = cleaned.replace('"', '').replace("'", "'")

        return cleaned

    def _generate_description(self) -> str:
        """Generate a description if none provided"""
        return (f"A {self.business_model.lower()} business in the {self.industry} industry "
                f"located in {self.location_city}, {self.location_country}. "
                f"Established business with strong fundamentals and growth potential.")

    def _is_valid_url(self, url: str) -> bool:
        """Validate URL format"""
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        return url_pattern.match(url) is not None

    def to_sql_values(self) -> Dict[str, Any]:
        """Convert to SQL-ready values"""
        # Prepare JSONB fields
        key_strengths_json = json.dumps(self.key_strengths[:4])  # Limit to 4 strengths
        growth_opportunities_text = '\n'.join([f"• {opp}" for opp in self.growth_opportunities[:4]])
        deal_structure_json = json.dumps(self.deal_structure)
        image_urls_json = json.dumps([self.image_path])

        return {
            'listing_title_anonymous': self.title,
            'industry': self.industry,
            'location_country': self.location_country,
            'location_city_region_general': self.location_city,
            'anonymous_business_description': self.description,
            'key_strengths_anonymous': key_strengths_json,
            'annual_revenue_range': self.annual_revenue_range,
            'net_profit_margin_range': self.net_profit_margin_range,
            'asking_price': float(self.asking_price) if self.asking_price else None,
            'deal_structure_looking_for': deal_structure_json,
            'reason_for_selling_anonymous': self.reason_for_selling,
            'business_model': self.business_model,
            'year_established': self.year_established,
            'registered_business_name': self.registered_business_name,
            'actual_company_name': self.registered_business_name,  # Same for demo
            'business_website_url': self.business_website,
            'social_media_links': self.social_media_links,
            'number_of_employees': self.employees,
            'specific_annual_revenue_last_year': float(self.annual_revenue) if self.annual_revenue else None,
            'specific_net_profit_last_year': None,  # Calculate if needed
            'adjusted_cash_flow': float(self.adjusted_cash_flow) if self.adjusted_cash_flow else None,
            'detailed_reason_for_selling': self.reason_for_selling,
            'specific_growth_opportunities': growth_opportunities_text,
            'status': self.status,
            'is_seller_verified': self.is_seller_verified,
            'image_urls': image_urls_json,
            'created_at': f"NOW() - INTERVAL '{self.created_days_ago} days'",
            'updated_at': 'NOW()'
        }


class DataValidator:
    """Data validation utilities"""

    @staticmethod
    def clean_price(price_str: str) -> Optional[Decimal]:
        """Clean and convert price strings to Decimal"""
        if not price_str or str(price_str).lower() in ['nan', 'null', 'none', '']:
            return None

        # Remove currency symbols and commas
        cleaned = re.sub(r'[^\d.]', '', str(price_str))

        try:
            return Decimal(cleaned) if cleaned else None
        except:
            return None

    @staticmethod
    def parse_strengths_and_growth(row_data: Dict[str, Any]) -> tuple[List[str], List[str]]:
        """Extract strengths and growth opportunities from CSV row"""
        strengths = []
        growth_ops = []

        # Extract strengths
        for i in range(1, 4):
            strength = row_data.get(f'strength_{i}', '')
            if strength and str(strength).lower() not in ['nan', 'null', 'none', '']:
                strengths.append(str(strength).strip())

        # Extract growth opportunities
        for i in range(1, 4):
            growth = row_data.get(f'growth_{i}', '')
            if growth and str(growth).lower() not in ['nan', 'null', 'none', '']:
                growth_ops.append(str(growth).strip())

        return strengths, growth_ops

    @staticmethod
    def normalize_industry(industry: str) -> str:
        """Normalize industry names"""
        if not industry:
            return 'General Business'

        industry_lower = industry.lower()

        # Check for key words and map to standard industries
        industry_mappings = {
            'construction': 'Construction & Trades',
            'automotive': 'Automotive (Sales & Repair)',
            'landscaping': 'Landscaping & Groundskeeping',
            'food': 'Food & Beverage',
            'restaurant': 'Food & Beverage',
            'retail': 'Retail & E-commerce',
            'ecommerce': 'Retail & E-commerce',
            'technology': 'Information Technology (IT)',
            'it': 'Information Technology (IT)',
            'software': 'Information Technology (IT)',
            'manufacturing': 'Manufacturing & Production',
            'healthcare': 'Health & Wellness',
            'medical': 'Health & Wellness',
            'finance': 'Financial Services',
            'education': 'Education & Training',
            'transportation': 'Transportation & Logistics',
            'logistics': 'Transportation & Logistics',
            'real estate': 'Real Estate',
            'consulting': 'Professional Services',
            'marketing': 'Professional Services',
            'agriculture': 'Agriculture & Farming'
        }

        for keyword, standard_industry in industry_mappings.items():
            if keyword in industry_lower:
                return standard_industry

        # If no mapping found, return cleaned original
        return industry.strip().title()
