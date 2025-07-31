#!/usr/bin/env python3
"""
Professional Supabase Backup Tool - Simplified Version
Built with industry-standard practices, avoiding realtime dependencies
"""

import os
import sys
import json
import logging
import subprocess
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import click
import requests
import psycopg2
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('backup.log')
    ]
)
logger = logging.getLogger(__name__)

class SupabaseBackupTool:
    """Professional backup tool for Supabase projects using direct API calls"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config = self._load_config(config_path)
        self.backup_dir = None
        self._test_connection()
        
    def _load_config(self, config_path: Optional[str] = None) -> Dict:
        """Load configuration from file or environment"""
        config = {}
        
        # Try to load from config file first
        if config_path and Path(config_path).exists():
            with open(config_path, 'r') as f:
                for line in f:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        config[key] = value.strip('"')
        
        # Override with environment variables
        config.update({
            'SUPABASE_URL': os.getenv('SUPABASE_URL', config.get('SUPABASE_URL')),
            'SUPABASE_SERVICE_KEY': os.getenv('SUPABASE_SERVICE_KEY', config.get('SUPABASE_SERVICE_KEY')),
            'SUPABASE_PROJECT_REF': os.getenv('SUPABASE_PROJECT_REF', config.get('SUPABASE_PROJECT_REF')),
            'BACKUP_DIR': os.getenv('BACKUP_DIR', config.get('BACKUP_DIR', './backups')),
            'DB_PASSWORD': os.getenv('DB_PASSWORD', config.get('DB_PASSWORD', '')),
        })
        
        # Validate required fields
        required_fields = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SUPABASE_PROJECT_REF']
        missing_fields = [field for field in required_fields if not config.get(field)]
        
        if missing_fields:
            logger.error(f"Missing required configuration: {', '.join(missing_fields)}")
            sys.exit(1)
            
        return config
    
    def _test_connection(self) -> None:
        """Test Supabase API connection"""
        try:
            headers = {
                'Authorization': f'Bearer {self.config["SUPABASE_SERVICE_KEY"]}',
                'apikey': self.config['SUPABASE_SERVICE_KEY'],
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                f"{self.config['SUPABASE_URL']}/storage/v1/bucket",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                buckets = response.json()
                logger.info(f"Successfully connected to Supabase. Found {len(buckets)} storage buckets.")
            else:
                logger.warning(f"Supabase connection test returned status {response.status_code}")
                
        except Exception as e:
            logger.error(f"Failed to connect to Supabase: {e}")
            sys.exit(1)
    
    def create_backup_directory(self) -> Path:
        """Create timestamped backup directory"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"backup_{timestamp}"
        backup_path = Path(self.config['BACKUP_DIR']) / backup_name
        
        # Create directory structure
        backup_path.mkdir(parents=True, exist_ok=True)
        (backup_path / 'database').mkdir(exist_ok=True)
        (backup_path / 'storage').mkdir(exist_ok=True)
        (backup_path / 'metadata').mkdir(exist_ok=True)
        
        self.backup_dir = backup_path
        logger.info(f"Created backup directory: {backup_path}")
        return backup_path
    
    def backup_database(self) -> bool:
        """Backup database using multiple methods"""
        logger.info("Starting database backup...")
        
        try:
            # Method 1: Try Supabase CLI first
            if self._backup_database_cli():
                logger.info("Database backup completed via Supabase CLI")
                return True
                
            # Method 2: Fallback to direct pg_dump
            if self._backup_database_pgdump():
                logger.info("Database backup completed via pg_dump")
                return True
                
            logger.error("All database backup methods failed")
            return False
            
        except Exception as e:
            logger.error(f"Database backup failed: {e}")
            return False
    
    def _backup_database_cli(self) -> bool:
        """Backup using Supabase CLI"""
        output_file = self.backup_dir / 'database' / 'full_backup.sql'
        
        try:
            # Change to project directory
            project_dir = Path.cwd()
            os.chdir(project_dir)
            
            result = subprocess.run([
                'supabase', 'db', 'dump', 
                '--linked', 
                f'--file={output_file}'
            ], capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0 and output_file.exists():
                size = output_file.stat().st_size
                logger.info(f"CLI backup completed: {size} bytes")
                return True
            else:
                logger.warning(f"CLI backup failed: {result.stderr}")
                return False
                
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError) as e:
            logger.warning(f"CLI backup failed: {e}")
            return False
        except Exception as e:
            logger.warning(f"CLI backup error: {e}")
            return False
    
    def _backup_database_pgdump(self) -> bool:
        """Backup using direct pg_dump connection"""
        output_file = self.backup_dir / 'database' / 'pgdump_backup.sql'
        
        try:
            # Parse connection info from Supabase URL
            parsed_url = urlparse(self.config['SUPABASE_URL'])
            host = parsed_url.hostname
            
            # Construct database URL for pg_dump
            db_url = f"postgresql://postgres:{self.config.get('DB_PASSWORD', '')}@{host}:5432/postgres"
            
            result = subprocess.run([
                'pg_dump', db_url,
                '--verbose',
                '--clean',
                '--if-exists',
                '--file', str(output_file)
            ], capture_output=True, text=True, timeout=600)
            
            if result.returncode == 0 and output_file.exists():
                size = output_file.stat().st_size
                logger.info(f"pg_dump backup completed: {size} bytes")
                return True
            else:
                logger.warning(f"pg_dump failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.warning(f"pg_dump backup error: {e}")
            return False
    
    def backup_storage(self) -> Tuple[bool, Dict]:
        """Backup all storage buckets using direct API calls"""
        logger.info("Starting storage backup...")
        
        try:
            # Get all buckets
            buckets = self._list_buckets()
            logger.info(f"Found {len(buckets)} storage buckets")
            
            backup_summary = {
                'total_buckets': len(buckets),
                'successful_buckets': 0,
                'failed_buckets': 0,
                'total_files': 0,
                'total_size': 0,
                'bucket_details': []
            }
            
            for bucket in buckets:
                bucket_name = bucket['name']
                logger.info(f"Backing up bucket: {bucket_name}")
                
                bucket_result = self._backup_single_bucket(bucket_name)
                backup_summary['bucket_details'].append(bucket_result)
                
                if bucket_result['success']:
                    backup_summary['successful_buckets'] += 1
                    backup_summary['total_files'] += bucket_result['file_count']
                    backup_summary['total_size'] += bucket_result['total_size']
                else:
                    backup_summary['failed_buckets'] += 1
            
            # Save backup summary
            summary_file = self.backup_dir / 'metadata' / 'storage_summary.json'
            with open(summary_file, 'w') as f:
                json.dump(backup_summary, f, indent=2, default=str)
            
            success = backup_summary['failed_buckets'] == 0
            logger.info(f"Storage backup completed: {backup_summary['successful_buckets']}/{backup_summary['total_buckets']} buckets successful")
            
            return success, backup_summary
            
        except Exception as e:
            logger.error(f"Storage backup failed: {e}")
            return False, {}
    
    def _list_buckets(self) -> List[Dict]:
        """List all storage buckets"""
        headers = {
            'Authorization': f'Bearer {self.config["SUPABASE_SERVICE_KEY"]}',
            'apikey': self.config['SUPABASE_SERVICE_KEY'],
            'Content-Type': 'application/json'
        }
        
        response = requests.get(
            f"{self.config['SUPABASE_URL']}/storage/v1/bucket",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to list buckets: {response.status_code} - {response.text}")
            return []
    
    def _list_bucket_files(self, bucket_name: str) -> List[Dict]:
        """List all files in a bucket"""
        headers = {
            'Authorization': f'Bearer {self.config["SUPABASE_SERVICE_KEY"]}',
            'apikey': self.config['SUPABASE_SERVICE_KEY'],
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f"{self.config['SUPABASE_URL']}/storage/v1/object/list/{bucket_name}",
            headers=headers,
            json={
                "limit": 1000,
                "offset": 0,
                "prefix": ""  # Required parameter - empty string lists all files
            },
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to list files in bucket {bucket_name}: {response.status_code} - {response.text}")
            return []
    
    def _download_file(self, bucket_name: str, file_path: str) -> Optional[bytes]:
        """Download a file from storage"""
        headers = {
            'Authorization': f'Bearer {self.config["SUPABASE_SERVICE_KEY"]}',
            'apikey': self.config['SUPABASE_SERVICE_KEY']
        }
        
        response = requests.get(
            f"{self.config['SUPABASE_URL']}/storage/v1/object/{bucket_name}/{file_path}",
            headers=headers,
            timeout=60
        )
        
        if response.status_code == 200:
            return response.content
        else:
            logger.error(f"Failed to download {file_path}: {response.status_code} - {response.text}")
            return None
    
    def _backup_single_bucket(self, bucket_name: str) -> Dict:
        """Backup a single storage bucket"""
        bucket_dir = self.backup_dir / 'storage' / bucket_name
        bucket_dir.mkdir(parents=True, exist_ok=True)
        
        bucket_result = {
            'bucket_name': bucket_name,
            'success': False,
            'file_count': 0,
            'total_size': 0,
            'files': [],
            'error': None
        }
        
        try:
            # List all files in bucket
            files = self._list_bucket_files(bucket_name)
            
            if not files:
                logger.info(f"Bucket {bucket_name} is empty or access denied")
                bucket_result['success'] = True
                return bucket_result
            
            logger.info(f"Found {len(files)} files in bucket {bucket_name}")
            
            # Download each file
            for file_info in files:
                file_name = file_info['name']
                
                try:
                    # Download file
                    file_data = self._download_file(bucket_name, file_name)
                    
                    if file_data is not None:
                        # Save to local file
                        local_file_path = bucket_dir / file_name
                        local_file_path.parent.mkdir(parents=True, exist_ok=True)
                        
                        with open(local_file_path, 'wb') as f:
                            f.write(file_data)
                        
                        file_size = len(file_data)
                        bucket_result['files'].append({
                            'name': file_name,
                            'size': file_size,
                            'downloaded': True
                        })
                        
                        bucket_result['file_count'] += 1
                        bucket_result['total_size'] += file_size
                        
                        logger.debug(f"Downloaded {file_name} ({file_size} bytes)")
                    else:
                        bucket_result['files'].append({
                            'name': file_name,
                            'size': 0,
                            'downloaded': False,
                            'error': 'Download failed'
                        })
                    
                except Exception as e:
                    logger.error(f"Failed to download {file_name}: {e}")
                    bucket_result['files'].append({
                        'name': file_name,
                        'size': 0,
                        'downloaded': False,
                        'error': str(e)
                    })
            
            bucket_result['success'] = True
            logger.info(f"Bucket {bucket_name} backup completed: {bucket_result['file_count']} files, {bucket_result['total_size']} bytes")
            
        except Exception as e:
            error_msg = f"Failed to backup bucket {bucket_name}: {e}"
            logger.error(error_msg)
            bucket_result['error'] = error_msg
        
        return bucket_result
    
    def create_manifest(self) -> None:
        """Create backup manifest with metadata"""
        manifest = {
            'backup_timestamp': datetime.now().isoformat(),
            'supabase_project': self.config['SUPABASE_PROJECT_REF'],
            'backup_version': '2.0.0',
            'backup_tool': 'python-professional-simple',
            'files': {
                'database': [],
                'storage': [],
                'metadata': []
            }
        }
        
        # Scan backup directory for files
        for category in ['database', 'storage', 'metadata']:
            category_dir = self.backup_dir / category
            if category_dir.exists():
                for file_path in category_dir.rglob('*'):
                    if file_path.is_file():
                        relative_path = file_path.relative_to(self.backup_dir)
                        manifest['files'][category].append({
                            'path': str(relative_path),
                            'size': file_path.stat().st_size,
                            'modified': datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
                        })
        
        # Save manifest
        manifest_file = self.backup_dir / 'backup_manifest.json'
        with open(manifest_file, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        logger.info(f"Backup manifest created: {manifest_file}")
    
    def verify_backup(self, storage_only: bool = False, database_only: bool = False) -> bool:
        """Verify backup integrity"""
        logger.info("Verifying backup integrity...")
        
        issues = []
        
        # Check required directories
        required_dirs = ['metadata']
        if not database_only:
            required_dirs.append('storage')
        if not storage_only:
            required_dirs.append('database')
            
        for dir_name in required_dirs:
            dir_path = self.backup_dir / dir_name
            if not dir_path.exists():
                issues.append(f"Missing directory: {dir_name}")
        
        # Check database backup (only if not storage-only)
        if not storage_only:
            db_files = list((self.backup_dir / 'database').glob('*.sql'))
            if not db_files:
                issues.append("No database backup files found")
            else:
                for db_file in db_files:
                    if db_file.stat().st_size < 1000:  # Less than 1KB
                        issues.append(f"Database file {db_file.name} appears too small")
        
        # Check manifest
        manifest_file = self.backup_dir / 'backup_manifest.json'
        if not manifest_file.exists():
            issues.append("Missing backup manifest")
        
        if issues:
            logger.warning(f"Backup verification found {len(issues)} issues:")
            for issue in issues:
                logger.warning(f"  - {issue}")
            return False
        else:
            logger.info("Backup verification passed")
            return True

@click.command()
@click.option('--config', '-c', help='Path to configuration file')
@click.option('--verify', '-v', is_flag=True, help='Verify backup after creation')
@click.option('--storage-only', is_flag=True, help='Backup storage only')
@click.option('--database-only', is_flag=True, help='Backup database only')
def main(config, verify, storage_only, database_only):
    """Professional Supabase Backup Tool - Simple Version"""
    
    try:
        backup_tool = SupabaseBackupTool(config)
        backup_tool.create_backup_directory()
        
        logger.info("=" * 60)
        logger.info("  Professional Supabase Backup Tool - Simple")
        logger.info("=" * 60)
        
        success = True
        
        # Backup database
        if not storage_only:
            if not backup_tool.backup_database():
                logger.error("Database backup failed")
                success = False
        
        # Backup storage
        if not database_only:
            storage_success, storage_summary = backup_tool.backup_storage()
            if not storage_success:
                logger.warning("Storage backup had issues")
        
        # Create manifest
        backup_tool.create_manifest()
        
        # Verify if requested
        if verify:
            if not backup_tool.verify_backup(storage_only=storage_only, database_only=database_only):
                success = False
        
        if success:
            logger.info("Backup completed successfully!")
            logger.info(f"Location: {backup_tool.backup_dir}")
        else:
            logger.error("Backup completed with errors")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("Backup cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Backup failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()