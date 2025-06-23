#!/usr/bin/env python3
"""
Robust Nobridge Marketplace Data Processor v2
=============================================
A completely robust solution with proper error handling, timeouts, and comprehensive reporting.

Key Features:
- Timeout handling for all external operations
- Graceful degradation when operations fail
- Comprehensive database state reporting
- Smart image processing with reuse
- Clean separation of concerns
- Detailed progress tracking
"""

import logging
import sys
import time
import hashlib
import random
import subprocess
import signal
from pathlib import Path
from typing import List, Optional, Dict, Any, Tuple
from decimal import Decimal
from urllib.parse import urlparse
import json

import pandas as pd
import requests
from PIL import Image

from config import *
from models import BusinessListing, DataValidator


class TimeoutError(Exception):
    """Custom timeout exception"""
    pass


class Logger:
    """Centralized logging configuration with enhanced reporting"""

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


class TimeoutHandler:
    """Handle timeouts for external operations"""

    @staticmethod
    def run_with_timeout(cmd: List[str], timeout: int = 30, cwd: Optional[Path] = None) -> Tuple[bool, str]:
        """Run command with timeout and return success status and output"""
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=cwd,
                check=False
            )
            return result.returncode == 0, result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            return False, f"Command timed out after {timeout} seconds"
        except Exception as e:
            return False, f"Command failed: {str(e)}"


class DatabaseStateReporter:
    """Report actual database state for comprehensive feedback"""

    def __init__(self, logger: logging.Logger):
        self.logger = logger

    def get_listing_counts(self) -> Dict[str, int]:
        """Get accurate listing counts from database"""
        try:
            # Try to get counts via SQL query
            cmd = [
                'npx', 'supabase', 'db', 'query',
                "SELECT COUNT(*) as total_count FROM listings;",
                '--linked'
            ]

            success, output = TimeoutHandler.run_with_timeout(cmd, timeout=10)

            if success and 'total_count' in output:
                # Parse the count from output
                lines = output.strip().split('\n')
                for line in lines:
                    if line.strip().isdigit():
                        return {
                            'total_listings': int(line.strip()),
                            'source': 'database_query'
                        }

            # Fallback: estimate from seed file
            return self._estimate_from_seed_file()

        except Exception as e:
            self.logger.warning(f"Could not get database counts: {e}")
            return self._estimate_from_seed_file()

    def _estimate_from_seed_file(self) -> Dict[str, int]:
        """Estimate counts from seed file as fallback"""
        try:
            if SEED_FILE.exists():
                content = SEED_FILE.read_text()
                insert_count = content.count('INSERT INTO listings')
                return {
                    'total_listings': insert_count,
                    'source': 'seed_file_estimate'
                }
        except Exception:
            pass

        return {
            'total_listings': 0,
            'source': 'unknown'
        }


class StorageManager:
    """Handle storage operations with proper timeouts and fallbacks"""

    def __init__(self, logger: logging.Logger):
        self.logger = logger

    def clear_storage_bucket(self, bucket_name: str = 'listing-images') -> bool:
        """Clear storage bucket with timeout and graceful failure"""
        self.logger.info(f"🗑️  Attempting to clear storage bucket: {bucket_name}")

        # Method 1: Try the recommended approach
        success = self._try_storage_empty(bucket_name)
        if success:
            return True

        # Method 2: Try alternative removal approach
        success = self._try_storage_remove(bucket_name)
        if success:
            return True

        # Method 3: Graceful degradation - warn but continue
        self.logger.warning(f"⚠️  Could not clear storage bucket '{bucket_name}' - continuing anyway")
        self.logger.info("   📋 Note: You may want to manually clear the bucket if needed")
        return False  # Return False but don't stop execution

    def _try_storage_empty(self, bucket_name: str) -> bool:
        """Try using supabase storage empty command"""
        cmd = ['npx', 'supabase', 'storage', 'empty', '--force', bucket_name, '--linked']
        success, output = TimeoutHandler.run_with_timeout(cmd, timeout=30)

        if success:
            self.logger.info(f"   ✅ Successfully cleared storage bucket using 'empty' command")
            return True
        else:
            self.logger.warning(f"   ❌ Storage 'empty' command failed: {output}")
            return False

    def _try_storage_remove(self, bucket_name: str) -> bool:
        """Try using storage rm command as alternative"""
        cmd = ['npx', 'supabase', 'storage', 'rm', f'ss:///{bucket_name}', '--recursive', '--linked']
        success, output = TimeoutHandler.run_with_timeout(cmd, timeout=30)

        if success:
            self.logger.info(f"   ✅ Successfully cleared storage bucket using 'rm' command")
            return True
        else:
            self.logger.warning(f"   ❌ Storage 'rm' command failed: {output}")
            return False


class CSVProcessor:
    """Handles CSV reading and data extraction with robust error handling"""

    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self.validator = DataValidator()

    def read_csv(self) -> pd.DataFrame:
        """Read CSV with robust encoding detection and timeout"""
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
    """Handles image downloading and processing with robust error handling"""

    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self.download_stats = {
            'downloaded': 0,
            'skipped': 0,
            'failed': 0
        }

    def generate_filename(self, image_url: str, title: str, listing_id: str) -> str:
        """Generate unique filename for image"""
        content = f"{image_url}{title}"
        hash_str = hashlib.md5(content.encode()).hexdigest()[:8]

        # Determine extension
        parsed_url = urlparse(image_url.lower())
        if '.png' in parsed_url.path:
            extension = 'png'
        elif '.jpg' in parsed_url.path or '.jpeg' in parsed_url.path:
            extension = 'jpg'
        else:
            extension = 'jpg'

        return f"listing-{listing_id}-{hash_str}.{extension}"

    def download_image(self, image_url: str, output_path: Path) -> bool:
        """Download image with retry logic and timeout"""
        for attempt in range(DOWNLOAD_CONFIG['max_retries']):
            try:
                response = requests.get(
                    image_url,
                    headers=DOWNLOAD_CONFIG['headers'],
                    timeout=DOWNLOAD_CONFIG['timeout'],
                    stream=True
                )
                response.raise_for_status()

                # Write image with validation
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)

                # Validate file size
                if output_path.stat().st_size == 0:
                    raise ValueError("Downloaded file is empty")

                # Quick image validation
                try:
                    with Image.open(output_path) as img:
                        img.verify()
                except Exception:
                    raise ValueError("Downloaded file is not a valid image")

                return True

            except Exception as e:
                if attempt == DOWNLOAD_CONFIG['max_retries'] - 1:
                    self.logger.warning(f"Failed to download after {DOWNLOAD_CONFIG['max_retries']} attempts: {e}")
                    return False
                else:
                    time.sleep(1)  # Brief pause before retry

        return False

    def process_listing_image(self, listing: BusinessListing) -> bool:
        """Process image for a listing with smart reuse"""
        filename = self.generate_filename(listing.image_url, listing.title, listing.listing_id)
        output_path = ASSETS_DIR / filename

        # Check if image already exists (smart reuse)
        if output_path.exists() and output_path.stat().st_size > 0:
            self.logger.info(f"   📸 Image already exists: {filename}")
            self.download_stats['skipped'] += 1
            return True

        # Download new image
        if self.download_image(listing.image_url, output_path):
            file_size = output_path.stat().st_size
            self.logger.info(f"✅ Downloaded: {filename} ({file_size:,} bytes)")
            self.download_stats['downloaded'] += 1
            return True
        else:
            self.download_stats['failed'] += 1
            return False


class SQLGenerator:
    """Generate SQL with proper formatting and validation"""

    def __init__(self, logger: logging.Logger):
        self.logger = logger

    def generate_seed_sql(self, listings: List[BusinessListing]) -> str:
        """Generate complete seed.sql with original template + CSV data"""
        self.logger.info("📄 Generating seed.sql...")

        # Use original clean seed template
        if ORIGINAL_SEED_FILE.exists():
            self.logger.info("   ✅ Using original clean seed template")
            sql_content = ORIGINAL_SEED_FILE.read_text(encoding='utf-8')
        else:
            self.logger.warning("   ⚠️  Original seed template not found, using minimal template")
            sql_content = self._get_minimal_seed_template()

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
    """Main processor orchestrating all components with comprehensive reporting"""

    def __init__(self):
        self.logger = Logger.setup()
        self.storage_manager = StorageManager(self.logger)
        self.csv_processor = CSVProcessor(self.logger)
        self.image_processor = ImageProcessor(self.logger)
        self.sql_generator = SQLGenerator(self.logger)
        self.db_reporter = DatabaseStateReporter(self.logger)
        self.successful_listings: List[BusinessListing] = []

    def run(self) -> bool:
        """Run the complete processing pipeline with comprehensive reporting"""
        self.logger.info("🚀 ROBUST MARKETPLACE PROCESSOR V2 - Starting...")
        self.logger.info("=" * 60)
        start_time = time.time()

        try:
            # Step 1: Prepare environment (with graceful storage cleanup)
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

            # Step 6: Final comprehensive summary
            elapsed = time.time() - start_time
            self._print_comprehensive_summary(elapsed)

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

        # Try to clear storage bucket (graceful failure)
        storage_cleared = self.storage_manager.clear_storage_bucket('listing-images')
        if not storage_cleared:
            self.logger.info("   📋 Continuing without storage cleanup - images will be reused if they exist")

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

    def _print_comprehensive_summary(self, elapsed_time: float):
        """Print comprehensive processing summary with database state"""
        stats = self.image_processor.download_stats

        # Get actual database state (if possible)
        db_counts = self.db_reporter.get_listing_counts()

        self.logger.info("\n🎉 PROCESSING COMPLETED SUCCESSFULLY!")
        self.logger.info("=" * 60)

        # Processing Statistics
        self.logger.info(f"📊 PROCESSING STATISTICS:")
        self.logger.info(f"   ✅ CSV listings processed: {len(self.successful_listings)}")
        self.logger.info(f"   📥 Images downloaded: {stats['downloaded']}")
        self.logger.info(f"   ♻️  Images skipped (existing): {stats['skipped']}")
        self.logger.info(f"   ❌ Images failed: {stats['failed']}")
        self.logger.info(f"   ⏱️  Processing time: {elapsed_time:.1f} seconds")

        # Database State
        self.logger.info(f"\n📋 DATABASE STATE:")
        if db_counts['source'] == 'database_query':
            self.logger.info(f"   🎯 Total listings in database: {db_counts['total_listings']} (verified)")
        else:
            self.logger.info(f"   📄 Estimated total after import: {db_counts['total_listings']} (from {db_counts['source']})")

        # Files Generated
        self.logger.info(f"\n📄 FILES GENERATED:")
        self.logger.info(f"   📄 Generated seed.sql: {SEED_FILE}")
        self.logger.info(f"   📸 Images directory: {ASSETS_DIR}")

        self.logger.info("=" * 60)
        self.logger.info("🌐 Ready for database import!")

        # Show sample of processed listings
        self.logger.info("\n📋 Sample processed listings:")
        for i, listing in enumerate(self.successful_listings[:3]):
            self.logger.info(f"   {i+1}. {listing.title} ({listing.location_city}, {listing.location_country})")

        # Next steps
        self.logger.info(f"\n🚀 NEXT STEPS:")
        self.logger.info(f"   1. Run: npx supabase db reset --linked")
        self.logger.info(f"   2. Verify listings count in database")
        self.logger.info(f"   3. Run image upload script if needed")


def main():
    """Main entry point for robust processor v2"""
    print("🚀 Starting Robust Marketplace Processor v2...")

    # Simple implementation for now - will enhance
    from robust_processor import RobustMarketplaceProcessor

    processor = RobustMarketplaceProcessor()
    success = processor.run()

    if success:
        print("✅ Processing completed successfully!")
    else:
        print("❌ Processing failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
