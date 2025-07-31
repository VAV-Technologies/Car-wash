#!/usr/bin/env python3
"""
Professional Storage Restore Tool
Safely restores storage files from backup with bucket recreation and validation
"""

import os
import sys
import json
import logging
import mimetypes
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, List, Tuple
import click
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('restore.log')
    ]
)
logger = logging.getLogger(__name__)

class StorageRestoreTool:
    """Professional storage restore with bucket management"""
    
    def __init__(self, config_path: str = '.env'):
        self.config = self._load_config(config_path)
        
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from file or environment"""
        config = {}
        
        if Path(config_path).exists():
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
        })
        
        required_fields = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SUPABASE_PROJECT_REF']
        missing_fields = [field for field in required_fields if not config.get(field)]
        
        if missing_fields:
            logger.error(f"Missing required configuration: {', '.join(missing_fields)}")
            sys.exit(1)
            
        return config
    
    def validate_storage_backup(self, backup_dir: Path) -> Dict:
        """Validate storage backup before restore"""
        logger.info("Validating storage backup...")
        
        validation = {
            'valid': True,
            'issues': [],
            'buckets': [],
            'total_files': 0,
            'total_size': 0,
            'storage_summary': None
        }
        
        # Check storage directory
        storage_dir = backup_dir / 'storage'
        if not storage_dir.exists():
            validation['issues'].append("No storage directory found")
            validation['valid'] = False
            return validation
        
        # Check storage summary
        summary_file = backup_dir / 'metadata' / 'storage_summary.json'
        if summary_file.exists():
            try:
                with open(summary_file, 'r') as f:
                    validation['storage_summary'] = json.load(f)
            except Exception as e:
                validation['issues'].append(f"Cannot read storage summary: {e}")
        
        # Scan storage directories
        for bucket_dir in storage_dir.iterdir():
            if bucket_dir.is_dir():
                bucket_info = {
                    'name': bucket_dir.name,
                    'files': [],
                    'directory_path': bucket_dir
                }
                
                # Count files in bucket
                files = list(bucket_dir.rglob('*'))
                file_count = len([f for f in files if f.is_file()])
                total_size = sum(f.stat().st_size for f in files if f.is_file())
                
                bucket_info['file_count'] = file_count
                bucket_info['total_size'] = total_size
                
                # Sample some files for validation
                sample_files = [f for f in files if f.is_file()][:5]
                for sample_file in sample_files:
                    bucket_info['files'].append({
                        'name': str(sample_file.relative_to(bucket_dir)),
                        'size': sample_file.stat().st_size
                    })
                
                validation['buckets'].append(bucket_info)
                validation['total_files'] += file_count
                validation['total_size'] += total_size
        
        if validation['total_files'] == 0:
            validation['issues'].append("No storage files found")
            validation['valid'] = False
        
        if validation['valid']:
            logger.info(f"✅ Storage backup validation passed")
            logger.info(f"📦 Found {len(validation['buckets'])} buckets with {validation['total_files']} files")
            logger.info(f"💾 Total size: {validation['total_size']} bytes")
        else:
            logger.error("❌ Storage backup validation failed:")
            for issue in validation['issues']:
                logger.error(f"  - {issue}")
        
        return validation
    
    def get_current_buckets(self) -> List[Dict]:
        """Get current storage buckets"""
        headers = {
            'Authorization': f'Bearer {self.config["SUPABASE_SERVICE_KEY"]}',
            'apikey': self.config['SUPABASE_SERVICE_KEY'],
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.get(
                f"{self.config['SUPABASE_URL']}/storage/v1/bucket",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                buckets = response.json()
                logger.info(f"📦 Found {len(buckets)} existing storage buckets")
                return buckets
            else:
                logger.error(f"Failed to list buckets: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting current buckets: {e}")
            return []
    
    def create_bucket(self, bucket_name: str, public: bool = False) -> bool:
        """Create a storage bucket"""
        headers = {
            'Authorization': f'Bearer {self.config["SUPABASE_SERVICE_KEY"]}',
            'apikey': self.config['SUPABASE_SERVICE_KEY'],
            'Content-Type': 'application/json'
        }
        
        payload = {
            'name': bucket_name,
            'public': public
        }
        
        try:
            response = requests.post(
                f"{self.config['SUPABASE_URL']}/storage/v1/bucket",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"✅ Created bucket: {bucket_name}")
                return True
            elif response.status_code == 409:
                logger.info(f"📦 Bucket already exists: {bucket_name}")
                return True
            else:
                logger.error(f"Failed to create bucket {bucket_name}: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error creating bucket {bucket_name}: {e}")
            return False
    
    def upload_file(self, bucket_name: str, file_path: Path, storage_path: str) -> bool:
        """Upload a file to storage bucket"""
        headers = {
            'Authorization': f'Bearer {self.config["SUPABASE_SERVICE_KEY"]}',
            'apikey': self.config['SUPABASE_SERVICE_KEY']
        }
        
        # Determine MIME type
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = 'application/octet-stream'
        
        try:
            with open(file_path, 'rb') as f:
                files = {
                    'file': (storage_path, f, mime_type)
                }
                
                response = requests.post(
                    f"{self.config['SUPABASE_URL']}/storage/v1/object/{bucket_name}/{storage_path}",
                    headers=headers,
                    files=files,
                    timeout=120
                )
            
            if response.status_code in [200, 201]:
                return True
            else:
                logger.error(f"Upload failed for {storage_path}: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error uploading {storage_path}: {e}")
            return False
    
    def restore_bucket(self, bucket_info: Dict, force_recreate: bool = False) -> Tuple[bool, Dict]:
        """Restore a single bucket"""
        bucket_name = bucket_info['name']
        bucket_dir = bucket_info['directory_path']
        
        logger.info(f"🚀 Restoring bucket: {bucket_name}")
        
        restore_result = {
            'bucket_name': bucket_name,
            'success': False,
            'files_uploaded': 0,
            'files_failed': 0,
            'total_files': bucket_info['file_count'],
            'errors': []
        }
        
        try:
            # Create bucket if it doesn't exist
            if not self.create_bucket(bucket_name):
                restore_result['errors'].append("Failed to create bucket")
                return False, restore_result
            
            # Get all files in bucket directory
            all_files = list(bucket_dir.rglob('*'))
            files_to_upload = [f for f in all_files if f.is_file()]
            
            logger.info(f"📁 Uploading {len(files_to_upload)} files to {bucket_name}")
            
            for file_path in files_to_upload:
                # Calculate storage path (relative to bucket directory)
                storage_path = str(file_path.relative_to(bucket_dir))
                
                logger.debug(f"Uploading: {storage_path}")
                
                if self.upload_file(bucket_name, file_path, storage_path):
                    restore_result['files_uploaded'] += 1
                    if restore_result['files_uploaded'] % 10 == 0:
                        logger.info(f"   Uploaded {restore_result['files_uploaded']}/{len(files_to_upload)} files...")
                else:
                    restore_result['files_failed'] += 1
                    restore_result['errors'].append(f"Failed to upload: {storage_path}")
            
            restore_result['success'] = restore_result['files_failed'] == 0
            
            if restore_result['success']:
                logger.info(f"✅ Bucket {bucket_name} restored successfully: {restore_result['files_uploaded']} files")
            else:
                logger.warning(f"⚠️ Bucket {bucket_name} restored with {restore_result['files_failed']} failures")
            
            return restore_result['success'], restore_result
            
        except Exception as e:
            error_msg = f"Error restoring bucket {bucket_name}: {e}"
            logger.error(error_msg)
            restore_result['errors'].append(error_msg)
            return False, restore_result
    
    def restore_all_storage(self, backup_dir: Path, buckets_to_restore: Optional[List[str]] = None) -> Dict:
        """Restore all storage buckets from backup"""
        logger.info("🚀 Starting storage restore...")
        
        # Validate backup
        validation = self.validate_storage_backup(backup_dir)
        if not validation['valid']:
            logger.error("❌ Storage backup validation failed")
            return {'success': False, 'validation': validation}
        
        restore_summary = {
            'success': True,
            'total_buckets': 0,
            'successful_buckets': 0,
            'failed_buckets': 0,
            'total_files': 0,
            'successful_files': 0,
            'failed_files': 0,
            'bucket_results': []
        }
        
        # Filter buckets if specified
        buckets_to_process = validation['buckets']
        if buckets_to_restore:
            buckets_to_process = [b for b in validation['buckets'] if b['name'] in buckets_to_restore]
            logger.info(f"Restoring only specified buckets: {buckets_to_restore}")
        
        restore_summary['total_buckets'] = len(buckets_to_process)
        
        # Restore each bucket
        for bucket_info in buckets_to_process:
            bucket_success, bucket_result = self.restore_bucket(bucket_info)
            
            restore_summary['bucket_results'].append(bucket_result)
            restore_summary['total_files'] += bucket_result['total_files']
            restore_summary['successful_files'] += bucket_result['files_uploaded']
            restore_summary['failed_files'] += bucket_result['files_failed']
            
            if bucket_success:
                restore_summary['successful_buckets'] += 1
            else:
                restore_summary['failed_buckets'] += 1
                restore_summary['success'] = False
        
        # Log summary
        logger.info("📊 Storage Restore Summary:")
        logger.info(f"   Buckets: {restore_summary['successful_buckets']}/{restore_summary['total_buckets']} successful")
        logger.info(f"   Files: {restore_summary['successful_files']}/{restore_summary['total_files']} successful")
        
        if restore_summary['success']:
            logger.info("🎉 Storage restore completed successfully!")
        else:
            logger.warning("⚠️ Storage restore completed with some failures")
        
        return restore_summary
    
    def verify_restore(self, restore_summary: Dict) -> bool:
        """Verify storage restore was successful"""
        logger.info("🔍 Verifying storage restore...")
        
        try:
            # Get current buckets
            current_buckets = self.get_current_buckets()
            current_bucket_names = {b['name'] for b in current_buckets}
            
            # Check if restored buckets exist
            restored_bucket_names = {r['bucket_name'] for r in restore_summary['bucket_results']}
            missing_buckets = restored_bucket_names - current_bucket_names
            
            if missing_buckets:
                logger.error(f"❌ Missing buckets after restore: {missing_buckets}")
                return False
            
            # Basic file count verification would require additional API calls
            # For now, we'll rely on the upload success counts
            
            success_rate = restore_summary['successful_files'] / restore_summary['total_files'] if restore_summary['total_files'] > 0 else 0
            
            logger.info(f"📈 File success rate: {success_rate:.1%}")
            
            if success_rate >= 0.95:  # 95% success rate threshold
                logger.info("✅ Storage restore verification passed")
                return True
            else:
                logger.warning("⚠️ Storage restore verification: low success rate")
                return False
                
        except Exception as e:
            logger.error(f"❌ Storage restore verification failed: {e}")
            return False

@click.command()
@click.argument('backup_dir', type=click.Path(exists=True, path_type=Path))
@click.option('--config', '-c', default='.env', help='Path to configuration file')
@click.option('--buckets', '-b', help='Comma-separated list of buckets to restore (default: all)')
@click.option('--force', is_flag=True, help='Skip confirmation prompts')
def main(backup_dir, config, buckets, force):
    """Restore storage from backup directory"""
    
    try:
        restore_tool = StorageRestoreTool(config)
        
        logger.info("=" * 60)
        logger.info("    Professional Storage Restore Tool")
        logger.info("=" * 60)
        
        # Parse bucket list
        buckets_to_restore = None
        if buckets:
            buckets_to_restore = [b.strip() for b in buckets.split(',')]
            logger.info(f"Restoring specific buckets: {buckets_to_restore}")
        
        # Validate backup
        validation = restore_tool.validate_storage_backup(backup_dir)
        if not validation['valid']:
            logger.error("❌ Storage backup validation failed. Cannot proceed.")
            sys.exit(1)
        
        # Get current storage info
        current_buckets = restore_tool.get_current_buckets()
        
        # Safety confirmation
        if not force:
            print("\n" + "⚠️ " * 20)
            print("WARNING: This will upload files to your storage buckets!")
            print("⚠️ " * 20)
            print(f"\nCurrent Storage:")
            print(f"  - Existing buckets: {len(current_buckets)}")
            for bucket in current_buckets[:5]:  # Show first 5
                print(f"    - {bucket['name']}")
            
            print(f"\nBackup Storage:")
            print(f"  - Buckets to restore: {len(validation['buckets'])}")
            print(f"  - Total files: {validation['total_files']}")
            print(f"  - Total size: {validation['total_size']} bytes")
            
            if not click.confirm("\n🚨 Are you sure you want to proceed with storage restore?"):
                logger.info("Storage restore cancelled by user")
                sys.exit(0)
        
        # Perform restore
        restore_summary = restore_tool.restore_all_storage(backup_dir, buckets_to_restore)
        
        if restore_summary.get('success'):
            # Verify restore
            restore_tool.verify_restore(restore_summary)
            logger.info("🎉 Storage restore completed successfully!")
        else:
            logger.error("❌ Storage restore completed with errors")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("Storage restore cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Storage restore failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()