#!/usr/bin/env python3
"""
Robust Nobridge Marketplace Data Processor
==========================================
A well-architected solution for processing CSV data into marketplace listings.

Features:
- Proper separation of concerns
- Comprehensive error handling
- Data validation and cleaning
- Reliable image processing
- Clean SQL generation
"""

import logging
import sys
import time
import hashlib
import random
import subprocess
from pathlib import Path
from typing import List, Optional, Dict, Any
from decimal import Decimal

import pandas as pd
import requests
from PIL import Image

from config import *
from models import BusinessListing, DataValidator


class Logger:
    """Centralized logging configuration"""

    @staticmethod
    def setup() -> logging.Logger:
        """Setup and return configured logger"""
        logger = logging.getLogger(__name__)
        logger.setLevel(LOGGING_CONFIG['level'])

        # Clear any existing handlers
        logger.handlers.clear()

        # File handler
        file_handler = logging.FileHandler(LOGGING_CONFIG['file'])
        file_handler.setLevel(logging.INFO)

        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)

        # Formatter
        formatter = logging.Formatter(LOGGING_CONFIG['format'])
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)

        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

        return logger


class CSVProcessor:
    """Handles CSV reading and data extraction"""

    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self.validator = DataValidator()

    def read_csv(self) -> pd.DataFrame:
        """Read CSV with robust encoding detection"""
        self.logger.info(f"📋 Reading CSV file: {CSV_FILE}")

        if not CSV_FILE.exists():
            raise FileNotFoundError(f"CSV file not found: {CSV_FILE}")

        # Try different encoding/delimiter combinations
        encodings = ['utf-8', 'utf-8-sig', 'iso-8859-1', 'cp1252']
        delimiters = [',', ';', '\t']

        for encoding in encodings:
            for delimiter in delimiters:
                try:
                    df = pd.read_csv(
                        CSV_FILE,
                        encoding=encoding,
                        delimiter=delimiter,
                        quotechar='"',
                        skipinitialspace=True,
                        na_values=['', 'NULL', 'null', 'N/A', 'n/a'],
                        keep_default_na=True
                    )

                    # Validate CSV structure
                    if len(df.columns) > 10 and len(df) > 0:
                        self.logger.info(f"   ✅ Successfully read with encoding={encoding}, delimiter='{delimiter}'")
                        self.logger.info(f"   📊 Dataset: {len(df)} rows × {len(df.columns)} columns")

                        # Clean column names
                        df.columns = df.columns.str.strip()
                        df = df.dropna(how='all')  # Remove empty rows

                        return df

                except Exception:
                    continue

        raise ValueError("Could not read CSV file with any encoding/delimiter combination")

    def extract_listing_data(self, row: pd.Series, listing_id: str) -> Optional[BusinessListing]:
        """Extract and validate a business listing from CSV row"""
        try:
            # Extract core data using column mappings
            raw_data = {}
            for field, csv_col in CSV_COLUMNS.items():
                raw_data[field] = row.get(csv_col, '')

            # Clean and validate core fields
            title = self._clean_text(raw_data['title'])
            if not title:
                return None

            image_url = self._clean_text(raw_data['image_url'])
            if not image_url:
                return None

            # Extract and clean all fields
            industry = self.validator.normalize_industry(raw_data['industry'])
            business_model = self._clean_text(raw_data['business_model']) or DEFAULTS['business_model']
            description = self._clean_text(raw_data['description'])

            # Location handling
            country = self._clean_text(raw_data['location_country']) or 'United States'
            city = self._clean_text(raw_data['location_city'])
            if not city:
                city = COUNTRY_CITY_DEFAULTS.get(country, 'Major City')

            # Financial data
            asking_price = self.validator.clean_price(raw_data['asking_price'])
            annual_revenue = self.validator.clean_price(raw_data['revenue'])
            cash_flow = self.validator.clean_price(raw_data.get('cash_flow', ''))

            # Year established
            year_str = str(raw_data['year_established']).strip()
            try:
                year_established = int(year_str) if year_str and year_str != 'nan' else None
            except:
                year_established = None

            # Extract strengths and growth opportunities
            strengths, growth_ops = self.validator.parse_strengths_and_growth(raw_data)

            # Other business details
            employees = self._clean_text(raw_data['employees']) or DEFAULTS['employees']
            website = self._clean_text(raw_data.get('website', ''))
            social_media = self._clean_text(raw_data.get('social_media', ''))
            business_name = self._clean_text(raw_data.get('business_name', ''))
            reason_selling = self._clean_text(raw_data.get('reason_selling', '')) or DEFAULTS['reason_selling']

            # Create listing object
            listing = BusinessListing(
                listing_id=listing_id,
                title=title,
                industry=industry,
                location_country=country,
                location_city=city,
                description=description,
                business_model=business_model,
                year_established=year_established,
                employees=employees,
                asking_price=asking_price,
                annual_revenue=annual_revenue,
                adjusted_cash_flow=cash_flow,
                key_strengths=strengths,
                growth_opportunities=growth_ops,
                reason_for_selling=reason_selling,
                business_website=website,
                social_media_links=social_media,
                registered_business_name=business_name,
                image_url=image_url,
                created_days_ago=random.randint(1, 30)  # Random age for demo
            )

            return listing

        except Exception as e:
            self.logger.warning(f"Error extracting listing data: {e}")
            return None

    def _clean_text(self, text: Any) -> str:
        """Clean text fields"""
        if not text or str(text).lower() in ['nan', 'null', 'none', '']:
            return ""
        return str(text).strip()


class ImageProcessor:
    """Handles image downloading and processing"""

    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self.download_stats = {'downloaded': 0, 'skipped': 0, 'failed': 0}

    def generate_filename(self, image_url: str, title: str, listing_id: str) -> str:
        """Generate unique filename for image"""
        content = f"{image_url}{title}"
        hash_str = hashlib.md5(content.encode()).hexdigest()[:8]

        # Determine extension
        if '.png' in image_url.lower():
            extension = 'png'
        elif '.jpg' in image_url.lower() or '.jpeg' in image_url.lower():
            extension = 'jpg'
        else:
            extension = 'jpg'

        return f"listing-{listing_id}-{hash_str}.{extension}"

    def download_image(self, image_url: str, output_path: Path) -> bool:
        """Download and validate image with retry logic"""
        for attempt in range(DOWNLOAD_CONFIG['max_retries']):
            try:
                response = requests.get(
                    image_url,
                    headers=DOWNLOAD_CONFIG['headers'],
                    timeout=DOWNLOAD_CONFIG['timeout'],
                    stream=True
                )
                response.raise_for_status()

                # Write image
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)

                # Validate file
                if output_path.stat().st_size == 0:
                    raise ValueError("Downloaded file is empty")

                # Validate image format
                try:
                    with Image.open(output_path) as img:
                        img.verify()
                except Exception:
                    raise ValueError("Invalid image format")

                return True

            except Exception as e:
                self.logger.warning(f"Download attempt {attempt + 1} failed: {e}")
                if output_path.exists():
                    output_path.unlink()

                if attempt < DOWNLOAD_CONFIG['max_retries'] - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff

        return False

    def process_listing_image(self, listing: BusinessListing) -> bool:
        """Process image for a listing"""
        # Generate filename and paths
        filename = self.generate_filename(listing.image_url, listing.title, listing.listing_id)
        image_path = ASSETS_DIR / filename
        web_path = f"/assets/listing-assets/{filename}"

        # Update listing with image info
        listing.image_filename = filename
        listing.image_path = web_path

        # Check if image already exists
        if image_path.exists() and image_path.stat().st_size > 0:
            self.logger.info(f"♻️  Image already exists: {filename}")
            self.download_stats['skipped'] += 1
            return True

        # Download image
        if self.download_image(listing.image_url, image_path):
            size = image_path.stat().st_size
            self.logger.info(f"✅ Downloaded: {filename} ({size:,} bytes)")
            self.download_stats['downloaded'] += 1
            return True
        else:
            self.logger.error(f"❌ Failed to download: {listing.title}")
            self.download_stats['failed'] += 1
            return False


class SQLGenerator:
    """Generates clean SQL from business listings"""

    def __init__(self, logger: logging.Logger):
        self.logger = logger

    def generate_seed_sql(self, listings: List[BusinessListing]) -> str:
        """Generate complete seed.sql file"""
        self.logger.info("📄 Generating seed.sql...")

        # Start with original clean seed template
        if ORIGINAL_SEED_FILE.exists():
            with open(ORIGINAL_SEED_FILE, 'r', encoding='utf-8') as f:
                sql_content = f.read()
            self.logger.info("   ✅ Using original clean seed template")
        else:
            sql_content = self._get_minimal_seed_template()
            self.logger.info("   ⚠️  Using minimal seed template")

        # Add CSV data section
        sql_content += f"\n\n-- ===================================================================\n"
        sql_content += f"-- CSV BUSINESS LISTINGS\n"
        sql_content += f"-- ===================================================================\n"
        sql_content += f"-- Generated: {pd.Timestamp.now().isoformat()}\n"
        sql_content += f"-- Successfully processed {len(listings)} listings\n\n"

        for listing in listings:
            sql_content += self._generate_listing_sql(listing)

        return sql_content

    def _generate_listing_sql(self, listing: BusinessListing) -> str:
        """Generate SQL for a single listing"""
        values = listing.to_sql_values()

        sql = f"-- Listing {listing.listing_id}: {listing.title}\n"
        sql += f"WITH seller_info AS (\n"
        sql += f"    SELECT id as seller_id FROM user_profiles WHERE email = '{DEMO_SELLER['email']}'\n"
        sql += f")\n"
        sql += f"INSERT INTO listings (\n"
        sql += f"    id,\n"
        sql += f"    seller_id,\n"

        # Add all the column names
        for column_name in values.keys():
            if column_name not in ['created_at', 'updated_at']:
                sql += f"    {column_name},\n"

        sql += f"    created_at,\n"
        sql += f"    updated_at\n"
        sql += f")\n"
        sql += f"SELECT\n"
        sql += f"    gen_random_uuid(),\n"
        sql += f"    seller_id,\n"

        # Add all the values
        for column_name, value in values.items():
            if column_name not in ['created_at', 'updated_at']:
                sql += f"    {self._format_sql_value(value)},\n"

        sql += f"    {values['created_at']},\n"
        sql += f"    {values['updated_at']}\n"
        sql += f"FROM seller_info;\n\n"

        return sql

    def _format_sql_value(self, value: Any) -> str:
        """Format a value for SQL"""
        if value is None:
            return 'NULL'
        elif isinstance(value, str):
            if value.startswith('NOW()'):
                return value  # SQL function
            else:
                # Escape single quotes
                escaped = value.replace("'", "''").replace("\\", "\\\\")
                return f"'{escaped}'"
        elif isinstance(value, (int, float)):
            return str(value)
        elif isinstance(value, bool):
            return str(value).lower()
        else:
            return f"'{str(value)}'"

    def _get_minimal_seed_template(self) -> str:
        """Minimal seed template if original not found"""
        return """-- Clean seed.sql - Demo data for Nobridge
DELETE FROM listings;
DELETE FROM user_profiles WHERE email = 'seller@nobridge.co';

-- Create demo seller
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'seller@nobridge.co', crypt('100%Seller', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Demo Seller"}', false, 'authenticated');

UPDATE user_profiles SET full_name = 'Demo Seller', role = 'seller', is_email_verified = true, verification_status = 'verified' WHERE email = 'seller@nobridge.co';
"""


class RobustMarketplaceProcessor:
    """Main processor orchestrating all components"""

    def __init__(self):
        self.logger = Logger.setup()
        self.csv_processor = CSVProcessor(self.logger)
        self.image_processor = ImageProcessor(self.logger)
        self.sql_generator = SQLGenerator(self.logger)
        self.successful_listings: List[BusinessListing] = []

    def run(self) -> bool:
        """Run the complete processing pipeline"""
        self.logger.info("🚀 ROBUST MARKETPLACE PROCESSOR - Starting...")
        self.logger.info("=" * 60)
        start_time = time.time()

        try:
            # Step 1: Prepare environment
            self._prepare_environment()

            # Step 2: Read and process CSV
            df = self.csv_processor.read_csv()

            # Step 3: Process each listing
            self._process_listings(df)

            # Step 4: Generate SQL
            if not self.successful_listings:
                raise Exception("No listings were successfully processed")

            sql_content = self.sql_generator.generate_seed_sql(self.successful_listings)

            # Step 5: Write seed.sql
            with open(SEED_FILE, 'w', encoding='utf-8') as f:
                f.write(sql_content)

            # Final summary
            elapsed = time.time() - start_time
            self._print_summary(elapsed)

            return True

        except Exception as e:
            self.logger.error(f"❌ Processing failed: {e}")
            return False

    def _prepare_environment(self):
        """Prepare directories and environment with graceful storage handling"""
        self.logger.info("🔧 Preparing environment...")

        # Create assets directory
        ASSETS_DIR.mkdir(parents=True, exist_ok=True)
        self.logger.info(f"   ✅ Assets directory ready: {ASSETS_DIR}")

        # Try to clear storage bucket with timeout (graceful failure)
        self._clear_storage_bucket_with_timeout()

    def _clear_storage_bucket_with_timeout(self):
        """Clear storage bucket with timeout and graceful failure"""
        self.logger.info("🗑️  Attempting to clear storage bucket...")

        try:
            # Try storage empty with timeout
            result = subprocess.run([
                'npx', 'supabase', 'storage', 'empty', '--force', 'listing-images', '--linked'
            ], capture_output=True, text=True, timeout=30, check=False)

            if result.returncode == 0:
                self.logger.info("   ✅ Successfully cleared storage bucket")
                return True
            else:
                self.logger.warning(f"   ⚠️  Storage empty failed: {result.stderr}")

        except subprocess.TimeoutExpired:
            self.logger.warning("   ⚠️  Storage clear timed out after 30 seconds - continuing anyway")
        except Exception as e:
            self.logger.warning(f"   ⚠️  Storage clear failed: {e} - continuing anyway")

        # If we get here, storage clear failed but we continue
        self.logger.info("   📋 Continuing without storage cleanup - images will be reused if they exist")
        return False

    def _process_listings(self, df: pd.DataFrame):
        """Process all listings from the dataframe"""
        self.logger.info(f"📥 Processing {len(df)} listings...")

        processed_count = 0

        for index, row in df.iterrows():
            listing_id = f"{processed_count + 1:03d}"

            # Extract listing data
            listing = self.csv_processor.extract_listing_data(row, listing_id)
            if not listing:
                self.logger.info(f"⚠️  Row {index + 1}: Skipping - missing required data")
                continue

            self.logger.info(f"📋 [{index + 1}/{len(df)}] Processing: {listing.title}")
            self.logger.info(f"    🌍 Location: {listing.location_city}, {listing.location_country}")

            # Process image
            if self.image_processor.process_listing_image(listing):
                self.successful_listings.append(listing)
                processed_count += 1
                self.logger.info(f"    ✅ Success! Total processed: {processed_count}")
            else:
                self.logger.warning(f"    ❌ Failed - skipping listing")

    def _print_summary(self, elapsed_time: float):
        """Print comprehensive processing summary with database state prediction"""
        stats = self.image_processor.download_stats

        # Get predicted database state
        predicted_total = self._estimate_total_database_listings()

        self.logger.info("\n🎉 PROCESSING COMPLETED SUCCESSFULLY!")
        self.logger.info("=" * 60)

        # Processing Statistics
        self.logger.info(f"📊 PROCESSING STATISTICS:")
        self.logger.info(f"   ✅ CSV listings processed: {len(self.successful_listings)}")
        self.logger.info(f"   📥 Images downloaded: {stats['downloaded']}")
        self.logger.info(f"♻️  Images skipped (existing): {stats['skipped']}")
        self.logger.info(f"❌ Images failed: {stats['failed']}")
        self.logger.info(f"   ⏱️  Processing time: {elapsed_time:.1f} seconds")

        # Database State Prediction
        self.logger.info(f"\n📋 EXPECTED DATABASE STATE AFTER IMPORT:")
        self.logger.info(f"   🎯 Estimated total listings: {predicted_total}")
        self.logger.info(f"   📄 Source: {self._count_seed_demo_listings()} demo + {len(self.successful_listings)} CSV")

        # Files Generated
        self.logger.info(f"\n📄 FILES GENERATED:")
        self.logger.info(f"   📄 Generated seed.sql: {SEED_FILE}")
        self.logger.info(f"   📸 Images directory: {ASSETS_DIR}")

        self.logger.info("=" * 60)
        self.logger.info("🌐 Ready for database import!")

        # Show sample of processed listings
        self.logger.info(f"\n📋 Sample processed listings:")
        for i, listing in enumerate(self.successful_listings[:3]):
            self.logger.info(f"   {i+1}. {listing.title} ({listing.location_city}, {listing.location_country})")

        # Next steps
        self.logger.info(f"\n🚀 NEXT STEPS:")
        self.logger.info(f"   1. Run: npx supabase db reset --linked")
        self.logger.info(f"   2. Verify total listings count: {predicted_total}")
        self.logger.info(f"   3. Run image upload script for production deployment")

    def _estimate_total_database_listings(self) -> int:
        """Estimate total listings that will be in database after import"""
        demo_count = self._count_seed_demo_listings()
        csv_count = len(self.successful_listings)
        return demo_count + csv_count

    def _count_seed_demo_listings(self) -> int:
        """Count demo listings in the original seed file"""
        try:
            if ORIGINAL_SEED_FILE.exists():
                content = ORIGINAL_SEED_FILE.read_text()
                # Count INSERT INTO listings statements in demo section
                demo_inserts = content.count('INSERT INTO listings')
                return demo_inserts
        except Exception:
            pass
        return 5  # Default estimate for demo listings


def main():
    """Main entry point"""
    processor = RobustMarketplaceProcessor()
    success = processor.run()

    if success:
        print("\n✅ Processing completed! Check the logs for details.")
        print("📋 Next steps:")
        print("   1. Review the generated seed.sql file")
        print("   2. Run: npx supabase db reset --linked")
        print("   3. Run: npm run migrate-images")
    else:
        print("\n❌ Processing failed. Check the logs for details.")
        sys.exit(1)


if __name__ == "__main__":
    main()
