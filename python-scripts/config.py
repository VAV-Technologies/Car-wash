"""
Configuration file for Nobridge Marketplace Data Processor
"""

import os
from pathlib import Path
from typing import Dict, List

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
CSV_FILE = PROJECT_ROOT / 'more_data.csv'
ASSETS_DIR = PROJECT_ROOT / 'public' / 'assets' / 'listing-assets'
SEED_FILE = PROJECT_ROOT / 'supabase' / 'seed.sql'
ORIGINAL_SEED_FILE = Path(__file__).parent / 'original_clean_seed.sql'

# CSV column mappings - exact names from CSV
CSV_COLUMNS = {
    'title': 'Listing Title (Anonymous)',
    'description': 'Business Description (2)',
    'industry': 'Industry',
    'business_model': 'Business Model',
    'location_country': 'Location (Country)',
    'location_city': 'Location (City)',
    'asking_price': 'Asking Price',
    'revenue': 'Halved Revenue',
    'employees': 'Employees',
    'year_established': 'Year Business Established',
    'image_url': 'Image Link',
    'net_profit': 'Net Profit Margin (%)',
    'business_name': 'Official Registered Business Name',
    'website': 'Business Website URL',
    'social_media': 'Social Media Links',
    'reason_selling': 'Reson For Selling',  # Note: typo in CSV
    'deal_structure': 'Deal Structure',
    'cash_flow': 'Adjusted Cash Flow Estimate',
    'growth_1': 'Room_For_Growth_1',
    'growth_2': 'Room_For_Growth_2',
    'growth_3': 'Room_For_Growth_3',
    'strength_1': 'Strengths_1',
    'strength_2': 'Strengths_2',
    'strength_3': 'Strengths_3'
}

# Default values for missing data
DEFAULTS = {
    'business_model': 'Business',
    'employees': '1-10',
    'annual_revenue_range': '$1M - $5M USD',
    'net_profit_margin_range': '15% - 25%',
    'deal_structure': '["Asset Purchase"]',
    'reason_selling': 'Strategic business transition',
    'status': 'active',
    'is_seller_verified': True
}

# Country-to-city mappings for missing cities
COUNTRY_CITY_DEFAULTS: Dict[str, str] = {
    'Indonesia': 'Jakarta',
    'India': 'Mumbai',
    'Malaysia': 'Kuala Lumpur',
    'Singapore': 'Singapore',
    'Thailand': 'Bangkok',
    'Vietnam': 'Ho Chi Minh City',
    'Philippines': 'Manila',
    'United States': 'New York',
    'USA': 'New York',
    'Australia': 'Sydney',
    'Japan': 'Tokyo',
    'South Korea': 'Seoul',
    'China': 'Shanghai',
    'Taiwan': 'Taipei',
    'Hong Kong': 'Hong Kong'
}

# Industry mappings for normalization
INDUSTRY_MAPPINGS: Dict[str, str] = {
    'construction': 'Construction & Trades',
    'automotive': 'Automotive (Sales & Repair)',
    'landscaping': 'Landscaping & Groundskeeping',
    'food': 'Food & Beverage',
    'retail': 'Retail & E-commerce',
    'technology': 'Information Technology (IT)',
    'manufacturing': 'Manufacturing & Production',
    'healthcare': 'Health & Wellness',
    'finance': 'Financial Services',
    'education': 'Education & Training',
    'transportation': 'Transportation & Logistics',
    'real estate': 'Real Estate'
}

# Download settings
DOWNLOAD_CONFIG = {
    'max_retries': 3,
    'timeout': 15,
    'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
}

# Logging configuration
LOGGING_CONFIG = {
    'level': 'INFO',
    'format': '%(asctime)s - %(levelname)s - %(message)s',
    'file': Path(__file__).parent / 'marketplace_processor.log'
}

# Database seller info
DEMO_SELLER = {
    'email': 'seller@nobridge.co',
    'password': '100%Seller',
    'full_name': 'Demo Seller',
    'company': 'Demo Business Holdings'
}

# Validation rules
VALIDATION_RULES = {
    'min_title_length': 5,
    'max_title_length': 200,
    'min_description_length': 20,
    'max_description_length': 1000,
    'min_year_established': 1900,
    'max_year_established': 2025,
    'max_asking_price': 1000000000,  # 1 billion
    'required_fields': ['title', 'image_url', 'industry', 'location_country']
}
