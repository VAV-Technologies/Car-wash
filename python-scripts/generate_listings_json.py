#!/usr/bin/env python3
"""
Comprehensive Data Processor for Node.js Integration
===================================================
Uses the existing robust models and validation to generate comprehensive listing data
for consumption by the Node.js script.
"""

import json
import pandas as pd
import re
from decimal import Decimal
import random
import logging
import sys
from pathlib import Path
from typing import Optional

# Import from existing robust modules
from models import BusinessListing, DataValidator
from config import DEFAULTS, VALIDATION_RULES, COUNTRY_CITY_DEFAULTS

# --- Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', stream=sys.stdout)

def clean_text(text) -> str:
    """Clean and normalize text fields"""
    if not text or pd.isna(text) or str(text).lower() in ['nan', 'null', 'none', '']:
        return ""

    # Clean the text
    cleaned = str(text).strip()
    # Remove excessive whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned)
    # Remove common CSV artifacts
    cleaned = cleaned.replace('"', '').replace("'", "'")

    return cleaned

def extract_comprehensive_listing_data(row: pd.Series, listing_id: str) -> Optional[BusinessListing]:
    """
    Extract comprehensive business listing data using the robust models and validation
    """
    try:
        # Basic validation
        title = clean_text(row.get('Listing Title (Anonymous)', ''))
        image_url = clean_text(row.get('Image Link', ''))

        if not title or not image_url or not image_url.startswith('http'):
            return None

        # Financial data with proper validation
        asking_price = DataValidator.clean_price(row.get('Asking Price'))
        annual_revenue = DataValidator.clean_price(row.get('Halved Revenue'))

        # Calculate comprehensive financial metrics
        adjusted_cash_flow = None
        specific_net_profit = None
        if annual_revenue:
            # Use industry-appropriate margins for realistic calculations
            profit_margin = random.uniform(0.15, 0.35)  # 15-35% profit margin
            cash_flow_margin = random.uniform(0.12, 0.28)  # 12-28% cash flow margin

            specific_net_profit = annual_revenue * Decimal(str(profit_margin))
            adjusted_cash_flow = annual_revenue * Decimal(str(cash_flow_margin))

        # Extract business intelligence data
        strengths, growth_opportunities = DataValidator.parse_strengths_and_growth({
            'strength_1': row.get('Key Strength 1', ''),
            'strength_2': row.get('Key Strength 2', ''),
            'strength_3': row.get('Key Strength 3', ''),
            'growth_1': row.get('Growth Opportunity 1', ''),
            'growth_2': row.get('Growth Opportunity 2', ''),
            'growth_3': row.get('Growth Opportunity 3', ''),
        })

        # Generate realistic annual revenue range based on actual revenue
        revenue_range = DEFAULTS['annual_revenue_range']
        if annual_revenue:
            if annual_revenue < 500000:
                revenue_range = '$100K - $500K USD'
            elif annual_revenue < 1000000:
                revenue_range = '$500K - $1M USD'
            elif annual_revenue < 5000000:
                revenue_range = '$1M - $5M USD'
            elif annual_revenue < 10000000:
                revenue_range = '$5M - $10M USD'
            else:
                revenue_range = '$10M+ USD'

                # Generate realistic business details
        industry = DataValidator.normalize_industry(row.get('Industry', ''))
        location_country = clean_text(row.get('Location (Country)', 'United States'))
        location_city = clean_text(row.get('Location (City)', ''))

        if not location_city:
            location_city = COUNTRY_CITY_DEFAULTS.get(location_country, 'Major City')

        # Generate realistic company names and websites
        business_name = f"{clean_text(row.get('Business Name', ''))} Ltd." if row.get('Business Name') else None
        website = f"https://www.{title.lower().replace(' ', '').replace('&', 'and')[:15]}.com" if random.random() > 0.3 else None
        social_media = f"LinkedIn: @{title.replace(' ', '')[:15]}" if random.random() > 0.5 else None

        # Create comprehensive listing using the robust BusinessListing model
        listing = BusinessListing(
            listing_id=listing_id,
            title=title,
            industry=industry,
            location_country=location_country,
            location_city=location_city,
            description=clean_text(row.get('Business Description (2)', '')) or
                       f"A {DEFAULTS['business_model'].lower()} business in the {industry} industry located in {location_city}, {location_country}. Established business with strong fundamentals and growth potential.",
            business_model=clean_text(row.get('Business Model', '')) or DEFAULTS['business_model'],
            year_established=pd.to_numeric(row.get('Year Business Established'), errors='coerce'),
            employees=clean_text(row.get('Employees', '')) or DEFAULTS['employees'],
            asking_price=asking_price,
            annual_revenue=annual_revenue,
            annual_revenue_range=revenue_range,
            net_profit_margin_range=DEFAULTS['net_profit_margin_range'],
            adjusted_cash_flow=adjusted_cash_flow,
            key_strengths=strengths or ["Strong market position", "Experienced team", "Proven business model"],
            growth_opportunities=growth_opportunities or ["Market expansion", "Digital transformation", "Product diversification"],
            reason_for_selling=clean_text(row.get('Reason for Selling', '')) or DEFAULTS['reason_selling'],
            deal_structure=["Asset Purchase", "Share Purchase"] if asking_price and asking_price > 1000000 else ["Asset Purchase"],
            business_website=website,
            social_media_links=social_media,
            registered_business_name=business_name,
            image_url=image_url,
            status=DEFAULTS['status'],
            is_seller_verified=DEFAULTS['is_seller_verified'],
            created_days_ago=random.randint(1, 90)
        )

        return listing

    except Exception as e:
        logging.warning(f"Error processing listing {listing_id}: {e}")
        return None

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super().default(obj)

# --- Main Execution ---
def main():
    """Reads CSV, processes data, and writes to a JSON file."""
    logging.info("🚀 Starting Python data processor...")

    csv_file = '../more_data.csv'
    output_file = 'listings.json'

    if not pd.io.common.file_exists(csv_file):
        logging.error(f"❌ CSV file not found: {csv_file}")
        sys.exit(1)

    logging.info(f"📋 Reading data from {csv_file}...")
    df = pd.read_csv(csv_file)

    logging.info(f"⚙️  Processing {len(df)} rows...")
    all_listings = []
    for index, row in df.iterrows():
        listing_id = str(index + 1).zfill(3)  # Zero-pad for consistency
        listing_data = extract_comprehensive_listing_data(row, listing_id)
        if listing_data:
            # Use the robust to_sql_values() method to get comprehensive data
            sql_values = listing_data.to_sql_values()

            # Convert to the format expected by Node.js script
            node_listing = {
                'listing_id': listing_id,
                'title': sql_values['listing_title_anonymous'],
                'industry': sql_values['industry'],
                'business_model': sql_values['business_model'],
                'location_country': sql_values['location_country'],
                'location_city': sql_values['location_city_region_general'],
                'description': sql_values['anonymous_business_description'],
                'asking_price': sql_values['asking_price'],
                'annual_revenue_range': sql_values['annual_revenue_range'],
                'net_profit_margin_range': sql_values['net_profit_margin_range'],
                'adjusted_cash_flow': sql_values['adjusted_cash_flow'],
                'key_strengths': json.loads(sql_values['key_strengths_anonymous']) if sql_values['key_strengths_anonymous'] else [],
                'growth_opportunities': sql_values['specific_growth_opportunities'].split('\\n') if sql_values['specific_growth_opportunities'] else [],
                'deal_structure': json.loads(sql_values['deal_structure_looking_for']) if sql_values['deal_structure_looking_for'] else [],
                'reason_for_selling': sql_values['reason_for_selling_anonymous'],
                'employees': sql_values['number_of_employees'],
                'year_established': sql_values['year_established'],
                'business_website': sql_values['business_website_url'],
                'social_media_links': sql_values['social_media_links'],
                'registered_business_name': sql_values['registered_business_name'],
                'image_url': listing_data.image_url,
                'status': sql_values['status'],
                'is_seller_verified': sql_values['is_seller_verified'],
                'created_days_ago': listing_data.created_days_ago,

                # Additional fields for completeness
                'specific_annual_revenue_last_year': sql_values['specific_annual_revenue_last_year'],
                'specific_net_profit_last_year': sql_values['specific_net_profit_last_year'],
                'detailed_reason_for_selling': sql_values['detailed_reason_for_selling'],
                'actual_company_name': sql_values['actual_company_name']
            }

            all_listings.append(node_listing)

    logging.info(f"✅ Processed {len(all_listings)} valid listings.")

    logging.info(f"💾 Writing comprehensive data to {output_file}...")
    with open(output_file, 'w') as f:
        json.dump(all_listings, f, indent=2, cls=CustomJSONEncoder)

    logging.info("🎉 Python script finished successfully!")

if __name__ == "__main__":
    main()
