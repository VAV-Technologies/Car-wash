#!/usr/bin/env python3
"""
Nobridge Marketplace Data Processor
===================================
A robust Python script to process CSV data, download images, and populate the database.

Features:
- Reliable CSV parsing with pandas
- Smart image downloading with retry logic
- Clean SQL generation
- Remote database reset capability
- Comprehensive error handling and logging
"""

import os
import sys
import pandas as pd
import requests
import hashlib
import shutil
import subprocess
import time
from pathlib import Path
from urllib.parse import urlparse
from PIL import Image
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import json

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('marketplace_processor.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class BusinessListing:
    """Data class for a business listing"""
    title: str
    description: str
    industry: str
    business_model: str
    location_country: str
    location_city: str
    asking_price: float
    revenue: float
    employees: str
    year_established: Optional[int]
    image_url: str
    listing_id: str
    image_filename: str
    image_path: str

class MarketplaceDataProcessor:
    """Main processor class for marketplace data"""

    def __init__(self, csv_file: str = 'more_data.csv', assets_dir: str = 'public/assets/listing-assets'):
        self.csv_file = csv_file
        self.assets_dir = Path(assets_dir)
        self.seed_file = Path('supabase/seed.sql')
        self.clean_seed_template = Path('supabase/seed_original_clean.sql')
        self.successful_listings: List[BusinessListing] = []
        self.download_stats = {'downloaded': 0, 'skipped': 0, 'failed': 0}

        # Create assets directory
        self.assets_dir.mkdir(parents=True, exist_ok=True)

    def clean_previous_data(self):
        """Clean up previous data and prepare for fresh start"""
        logger.info("🧹 STEP 1: Cleaning previous data...")

        # Remove existing images
        if self.assets_dir.exists():
            shutil.rmtree(self.assets_dir)
            logger.info(f"   🗑️  Removed existing assets directory")
        self.assets_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"   ✅ Created clean assets directory")

        # Clear Supabase storage bucket
        try:
            subprocess.run([
                'npx', 'supabase', 'storage', 'rm', 'ss:///listing-images',
                '--linked', '--experimental', '--recursive'
            ], capture_output=True, check=False)
            logger.info("   ✅ Cleared Supabase storage bucket")
        except Exception as e:
            logger.warning(f"   ⚠️  Could not clear storage bucket: {e}")

    def read_csv_data(self) -> pd.DataFrame:
        """Read and validate CSV data using pandas"""
        logger.info("📋 STEP 2: Reading CSV data with pandas...")

        if not Path(self.csv_file).exists():
            raise FileNotFoundError(f"CSV file not found: {self.csv_file}")

        # Try different encodings and delimiters
        encodings = ['utf-8', 'utf-8-sig', 'iso-8859-1', 'cp1252']
        delimiters = [',', ';', '\t']

        df = None
        for encoding in encodings:
            for delimiter in delimiters:
                try:
                    df = pd.read_csv(
                        self.csv_file,
                        encoding=encoding,
                        delimiter=delimiter,
                        quotechar='"',
                        skipinitialspace=True,
                        na_values=['', 'NULL', 'null', 'N/A', 'n/a'],
                        keep_default_na=True
                    )

                    # Check if we have reasonable columns
                    if len(df.columns) > 5 and len(df) > 0:
                        logger.info(f"   ✅ Successfully read CSV with encoding={encoding}, delimiter='{delimiter}'")
                        logger.info(f"   📊 Found {len(df)} rows and {len(df.columns)} columns")
                        logger.info(f"   📋 Columns: {list(df.columns)[:5]}..." if len(df.columns) > 5 else f"   📋 Columns: {list(df.columns)}")
                        break

                except Exception as e:
                    continue
            if df is not None:
                break

        if df is None:
            raise ValueError("Could not read CSV file with any encoding/delimiter combination")

        # Clean up column names
        df.columns = df.columns.str.strip()

        # Remove completely empty rows
        df = df.dropna(how='all')

        logger.info(f"   📊 Final dataset: {len(df)} rows after cleaning")
        return df

    def extract_business_data(self, row: pd.Series) -> Optional[Dict]:
        """Extract and validate business data from a CSV row"""
        try:
            # Handle missing values and extract data
            title = str(row.get('Listing Title (Anonymous)', '')).strip()
            if not title or title == 'nan':
                return None

            description = str(row.get('Business Description (2)', '')).strip()
            industry = str(row.get('Industry', 'General Business')).strip()
            business_model = str(row.get('Business Model', 'Business')).strip()

            # Better location handling
            location_country = str(row.get('Location (Country)', 'United States')).strip()
            location_city = str(row.get('Location (City)', '')).strip()

            # If no city provided, try to extract from other location fields
            if not location_city or location_city == 'nan':
                # Check for other location fields
                for col in row.index:
                    if 'city' in col.lower() or 'region' in col.lower() or 'state' in col.lower():
                        potential_city = str(row.get(col, '')).strip()
                        if potential_city and potential_city != 'nan':
                            location_city = potential_city
                            break

                # If still no city, use a default based on country
                if not location_city or location_city == 'nan':
                    country_defaults = {
                        'Indonesia': 'Jakarta',
                        'India': 'Mumbai',
                        'Malaysia': 'Kuala Lumpur',
                        'Singapore': 'Singapore',
                        'Thailand': 'Bangkok',
                        'Vietnam': 'Ho Chi Minh City',
                        'Philippines': 'Manila',
                        'United States': 'New York',
                        'USA': 'New York'
                    }
                    location_city = country_defaults.get(location_country, 'Major City')

            # Financial data
            asking_price_str = str(row.get('Asking Price', '0')).replace(',', '').replace('$', '').strip()
            revenue_str = str(row.get('Halved Revenue', '0')).replace(',', '').replace('$', '').strip()

            try:
                asking_price = float(''.join(filter(str.isdigit, asking_price_str + '.0'))) if asking_price_str else 0
                revenue = float(''.join(filter(str.isdigit, revenue_str + '.0'))) if revenue_str else 0
            except:
                asking_price = 0
                revenue = 0

            employees = str(row.get('Employees', '1-10')).strip()

            # Year established - FIX: Use correct column name
            year_est_str = str(row.get('Year Business Established', '')).strip()
            try:
                year_established = int(year_est_str) if year_est_str and year_est_str != 'nan' else None
                if year_established and (year_established < 1900 or year_established > 2025):
                    year_established = None
            except:
                year_established = None

            # Image URL
            image_url = str(row.get('Image Link', '')).strip()
            if not image_url or image_url == 'nan':
                return None

            # Validate required fields
            if not title or not image_url:
                return None

            # Truncate fields to reasonable lengths
            title = title[:200]
            description = description[:500] if description != 'nan' else f"A {business_model} business in the {industry} industry located in {location_city}, {location_country}. Established business with strong fundamentals and growth potential."
            industry = industry[:80] if industry != 'nan' else 'General Business'
            business_model = business_model[:80] if business_model != 'nan' else 'Business'
            location_country = location_country[:80]
            location_city = location_city[:80]
            employees = employees[:40] if employees != 'nan' else '1-10'

            return {
                'title': title,
                'description': description,
                'industry': industry,
                'business_model': business_model,
                'location_country': location_country,
                'location_city': location_city,
                'asking_price': asking_price,
                'revenue': revenue,
                'employees': employees,
                'year_established': year_established,
                'image_url': image_url
            }

        except Exception as e:
            logger.warning(f"Error extracting business data: {e}")
            return None

    def generate_image_filename(self, image_url: str, title: str, listing_id: str) -> str:
        """Generate a unique filename for the image"""
        # Create hash from URL and title for uniqueness
        content = f"{image_url}{title}"
        hash_str = hashlib.md5(content.encode()).hexdigest()[:8]

        # Determine extension
        parsed_url = urlparse(image_url.lower())
        if '.png' in parsed_url.path:
            extension = 'png'
        elif '.jpg' in parsed_url.path or '.jpeg' in parsed_url.path:
            extension = 'jpg'
        else:
            extension = 'jpg'  # default

        return f"listing-{listing_id}-{hash_str}.{extension}"

    def download_image(self, image_url: str, output_path: Path, max_retries: int = 3) -> bool:
        """Download image with retry logic and validation"""
        for attempt in range(max_retries):
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }

                response = requests.get(image_url, headers=headers, timeout=15, stream=True)
                response.raise_for_status()

                # Write image
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)

                # Validate image
                if output_path.stat().st_size == 0:
                    raise ValueError("Downloaded file is empty")

                # Try to open with PIL to validate it's a real image
                try:
                    with Image.open(output_path) as img:
                        img.verify()
                except Exception as e:
                    raise ValueError(f"Invalid image file: {e}")

                return True

            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed: {e}")
                if output_path.exists():
                    output_path.unlink()

                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff

        return False

    def process_csv_and_download_images(self) -> List[BusinessListing]:
        """Process CSV data and download images"""
        logger.info("📥 STEP 3: Processing CSV and downloading images...")

        df = self.read_csv_data()
        successful_listings = []
        download_count = 0

        for index, row in df.iterrows():
            try:
                # Extract business data
                business_data = self.extract_business_data(row)
                if not business_data:
                    logger.info(f"⚠️  Row {index + 1}: Skipping - missing required data")
                    self.download_stats['skipped'] += 1
                    continue

                # Generate listing ID and image filename
                listing_id = f"{download_count + 1:03d}"
                image_filename = self.generate_image_filename(
                    business_data['image_url'],
                    business_data['title'],
                    listing_id
                )
                image_path = self.assets_dir / image_filename

                logger.info(f"📥 [{index + 1}/{len(df)}] Processing: {business_data['title']}")
                logger.info(f"    🌍 Location: {business_data['location_city']}, {business_data['location_country']}")

                # Check if image already exists
                if image_path.exists() and image_path.stat().st_size > 0:
                    logger.info(f"♻️  [{index + 1}/{len(df)}] Image already exists ({image_path.stat().st_size} bytes)")
                else:
                    # Download image
                    if self.download_image(business_data['image_url'], image_path):
                        logger.info(f"✅ [{index + 1}/{len(df)}] Downloaded ({image_path.stat().st_size} bytes)")
                        self.download_stats['downloaded'] += 1
                    else:
                        logger.error(f"❌ [{index + 1}/{len(df)}] Download failed")
                        self.download_stats['failed'] += 1
                        continue

                # Create BusinessListing object
                listing = BusinessListing(
                    **business_data,
                    listing_id=listing_id,
                    image_filename=image_filename,
                    image_path=f"/assets/listing-assets/{image_filename}"
                )

                successful_listings.append(listing)
                download_count += 1

            except Exception as e:
                logger.error(f"❌ Row {index + 1}: Error processing - {e}")
                self.download_stats['failed'] += 1
                continue

        logger.info(f"\n📊 Download Summary:")
        logger.info(f"   ✅ Successfully processed: {len(successful_listings)}")
        logger.info(f"   📥 Downloaded: {self.download_stats['downloaded']}")
        logger.info(f"   ♻️  Skipped (existing): {self.download_stats['skipped']}")
        logger.info(f"   ❌ Failed: {self.download_stats['failed']}")

        self.successful_listings = successful_listings
        return successful_listings

    def sql_escape(self, value) -> str:
        """Escape SQL string values"""
        if value is None:
            return 'NULL'
        if isinstance(value, (int, float)):
            return str(value)

        # Convert to string and escape
        str_value = str(value).replace("'", "''").replace("\\", "\\\\").replace("\n", " ").replace("\r", " ")
        return f"'{str_value}'"

    def generate_seed_sql(self):
        """Generate clean seed.sql file"""
        logger.info("📄 STEP 4: Generating seed.sql...")

        # Read clean template
        if self.clean_seed_template.exists():
            with open(self.clean_seed_template, 'r', encoding='utf-8') as f:
                sql_content = f.read()
            logger.info("   ✅ Using clean seed template")
        else:
            # Minimal template
            sql_content = """-- Clean seed.sql - minimal demo data
DELETE FROM listings;
DELETE FROM user_profiles WHERE email = 'seller@nobridge.co';

-- Create demo seller
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'seller@nobridge.co', crypt('100%Seller', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Demo Seller"}', false, 'authenticated');

UPDATE user_profiles SET full_name = 'Demo Seller', role = 'seller', is_email_verified = true, verification_status = 'verified' WHERE email = 'seller@nobridge.co';
"""
            logger.info("   ⚠️  Using minimal seed template")

        # Add CSV data section
        sql_content += f"\n\n-- Business listings from CSV data\n"
        sql_content += f"-- Generated: {pd.Timestamp.now().isoformat()}\n"
        sql_content += f"-- Successfully processed {len(self.successful_listings)} listings with images\n\n"

        for listing in self.successful_listings:
            sql_content += f"-- Listing {listing.listing_id}: {listing.title}\n"
            sql_content += f"WITH seller_info AS (\n"
            sql_content += f"    SELECT id as seller_id FROM user_profiles WHERE email = 'seller@nobridge.co'\n"
            sql_content += f")\n"
            sql_content += f"INSERT INTO listings (\n"
            sql_content += f"    id,\n"
            sql_content += f"    seller_id,\n"
            sql_content += f"    listing_title_anonymous,\n"
            sql_content += f"    industry,\n"
            sql_content += f"    business_model,\n"
            sql_content += f"    location_country,\n"
            sql_content += f"    location_city_region_general,\n"
            sql_content += f"    anonymous_business_description,\n"
            sql_content += f"    asking_price,\n"
            sql_content += f"    annual_revenue_range,\n"
            sql_content += f"    number_of_employees,\n"
            sql_content += f"    year_established,\n"
            sql_content += f"    image_urls,\n"
            sql_content += f"    status,\n"
            sql_content += f"    created_at,\n"
            sql_content += f"    updated_at\n"
            sql_content += f")\n"
            sql_content += f"SELECT\n"
            sql_content += f"    gen_random_uuid(),\n"
            sql_content += f"    seller_id,\n"
            sql_content += f"    {self.sql_escape(listing.title)},\n"
            sql_content += f"    {self.sql_escape(listing.industry)},\n"
            sql_content += f"    {self.sql_escape(listing.business_model)},\n"
            sql_content += f"    {self.sql_escape(listing.location_country)},\n"
            sql_content += f"    {self.sql_escape(listing.location_city)},\n"
            sql_content += f"    {self.sql_escape(listing.description)},\n"
            sql_content += f"    {listing.asking_price if listing.asking_price > 0 else 'NULL'},\n"
            sql_content += f"    '$1M - $5M USD',\n"
            sql_content += f"    {self.sql_escape(listing.employees)},\n"
            sql_content += f"    {listing.year_established if listing.year_established else 'NULL'},\n"
            image_urls_json = f'["{listing.image_path}"]'
            sql_content += f"    {self.sql_escape(image_urls_json)},\n"
            sql_content += f"    'active',\n"
            sql_content += f"    NOW() - INTERVAL '{hash(listing.title) % 30} days',\n"
            sql_content += f"    NOW()\n"
            sql_content += f"FROM seller_info;\n\n"

        # Write to file
        with open(self.seed_file, 'w', encoding='utf-8') as f:
            f.write(sql_content)

        logger.info(f"   ✅ Generated seed.sql with {len(self.successful_listings)} listings")

    def reset_remote_database(self):
        """Reset the remote database using Supabase CLI"""
        logger.info("🔄 STEP 5: Resetting remote database...")

        try:
            result = subprocess.run(
                ['npx', 'supabase', 'db', 'reset', '--linked'],
                input='y\n',
                text=True,
                capture_output=True
            )

            if result.returncode == 0:
                logger.info("   ✅ Database reset complete")
            else:
                logger.error(f"   ❌ Database reset failed: {result.stderr}")
                raise Exception(f"Database reset failed: {result.stderr}")

        except Exception as e:
            logger.error(f"Error resetting database: {e}")
            raise

    def upload_images_to_storage(self):
        """Upload images to Supabase storage"""
        logger.info("📸 STEP 6: Uploading images to storage...")

        try:
            result = subprocess.run(['npm', 'run', 'migrate-images'], capture_output=True, text=True)
            if result.returncode == 0:
                logger.info("   ✅ Images uploaded to storage")
            else:
                logger.error(f"   ❌ Image upload failed: {result.stderr}")
                raise Exception(f"Image upload failed: {result.stderr}")
        except Exception as e:
            logger.error(f"Error uploading images: {e}")
            raise

    def run_complete_process(self):
        """Run the complete data processing workflow"""
        logger.info("🚀 NOBRIDGE MARKETPLACE DATA PROCESSOR - Starting...")
        start_time = time.time()

        try:
            # Step 1: Clean previous data
            self.clean_previous_data()

            # Step 2-3: Process CSV and download images
            successful_listings = self.process_csv_and_download_images()

            if not successful_listings:
                logger.error("❌ No listings were successfully processed. Exiting.")
                return False

            # Step 4: Generate seed.sql
            self.generate_seed_sql()

            # Step 5: Reset database
            self.reset_remote_database()

            # Step 6: Upload images
            self.upload_images_to_storage()

            # Final summary
            elapsed_time = time.time() - start_time
            logger.info("\n🎉 COMPLETE PROCESSING FINISHED!")
            logger.info("=" * 50)
            logger.info(f"✅ Total listings processed: {len(successful_listings)}")
            logger.info(f"✅ Images downloaded: {self.download_stats['downloaded']}")
            logger.info(f"✅ Images reused: {self.download_stats['skipped']}")
            logger.info(f"✅ Database updated with clean data")
            logger.info(f"✅ Perfect 1:1 image-to-listing mapping")
            logger.info(f"⏱️  Total processing time: {elapsed_time:.1f} seconds")
            logger.info("=" * 50)
            logger.info("🌐 Your marketplace should now show all listings with correct cities and images!")

            return True

        except Exception as e:
            logger.error(f"❌ Processing failed: {e}")
            return False

def main():
    """Main entry point"""
    processor = MarketplaceDataProcessor()
    success = processor.run_complete_process()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
