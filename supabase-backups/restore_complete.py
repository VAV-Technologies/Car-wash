#!/usr/bin/env python3
"""
Complete Restore Orchestration Tool
Orchestrates full database and storage restore with proper sequencing and safety checks
"""

import os
import sys
import json
import logging
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, List
import click

# Import our restore modules
from restore_database import DatabaseRestoreTool
from restore_storage import StorageRestoreTool

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('complete_restore.log')
    ]
)
logger = logging.getLogger(__name__)

class CompleteRestoreTool:
    """Orchestrates complete backup restore"""
    
    def __init__(self, config_path: str = '.env'):
        self.config_path = config_path
        self.db_restore_tool = DatabaseRestoreTool(config_path)
        self.storage_restore_tool = StorageRestoreTool(config_path)
        
    def validate_complete_backup(self, backup_dir: Path) -> Dict:
        """Validate both database and storage backups"""
        logger.info("🔍 Validating complete backup...")
        
        validation = {
            'valid': True,
            'issues': [],
            'database_validation': None,
            'storage_validation': None,
            'manifest_data': None
        }
        
        # Check backup directory structure
        if not backup_dir.exists():
            validation['issues'].append(f"Backup directory does not exist: {backup_dir}")
            validation['valid'] = False
            return validation
        
        # Validate database backup
        db_validation = self.db_restore_tool.validate_backup(backup_dir)
        validation['database_validation'] = db_validation
        if not db_validation['valid']:
            validation['issues'].extend([f"Database: {issue}" for issue in db_validation['issues']])
            validation['valid'] = False
        
        # Validate storage backup
        storage_validation = self.storage_restore_tool.validate_storage_backup(backup_dir)
        validation['storage_validation'] = storage_validation
        if not storage_validation['valid']:
            validation['issues'].extend([f"Storage: {issue}" for issue in storage_validation['issues']])
            validation['valid'] = False
        
        # Check backup manifest
        manifest_file = backup_dir / 'backup_manifest.json'
        if manifest_file.exists():
            try:
                with open(manifest_file, 'r') as f:
                    validation['manifest_data'] = json.load(f)
            except Exception as e:
                validation['issues'].append(f"Cannot read backup manifest: {e}")
        
        if validation['valid']:
            logger.info("✅ Complete backup validation passed")
            logger.info(f"📄 Database files: {len(db_validation.get('database_files', []))}")
            logger.info(f"📦 Storage buckets: {len(storage_validation.get('buckets', []))}")
            logger.info(f"📁 Storage files: {storage_validation.get('total_files', 0)}")
        else:
            logger.error("❌ Complete backup validation failed:")
            for issue in validation['issues']:
                logger.error(f"  - {issue}")
        
        return validation
    
    def create_pre_restore_snapshot(self) -> Optional[Path]:
        """Create a complete snapshot before restore"""
        logger.info("📸 Creating pre-restore snapshot...")
        
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            snapshot_name = f"pre_restore_snapshot_{timestamp}"
            snapshot_dir = Path("snapshots") / snapshot_name
            snapshot_dir.mkdir(parents=True, exist_ok=True)
            
            # Create database snapshot
            db_snapshot = self.db_restore_tool.create_pre_restore_backup()
            if db_snapshot:
                # Move database snapshot into our snapshot directory
                db_snapshot_dest = snapshot_dir / "database_snapshot"
                db_snapshot_dest.mkdir(exist_ok=True)
                for file in db_snapshot.iterdir():
                    if file.is_file():
                        file.rename(db_snapshot_dest / file.name)
                
                # Clean up original directory
                try:
                    db_snapshot.rmdir()
                except:
                    pass  # Directory might not be empty
            
            # Create storage inventory (we won't backup storage files due to size)
            current_buckets = self.storage_restore_tool.get_current_buckets()
            storage_inventory = {
                'timestamp': datetime.now().isoformat(),
                'buckets': current_buckets,
                'note': 'Storage files not backed up due to size - this is inventory only'
            }
            
            with open(snapshot_dir / 'storage_inventory.json', 'w') as f:
                json.dump(storage_inventory, f, indent=2)
            
            logger.info(f"✅ Pre-restore snapshot created: {snapshot_dir}")
            return snapshot_dir
            
        except Exception as e:
            logger.error(f"❌ Failed to create pre-restore snapshot: {e}")
            return None
    
    def restore_database_phase(self, backup_dir: Path, skip_safety_backup: bool = False) -> bool:
        """Restore database with proper safety checks"""
        logger.info("🗄️ Starting database restore phase...")
        
        try:
            # Get current database info
            original_info = self.db_restore_tool.get_database_info()
            if not original_info.get('connection_successful'):
                logger.error("❌ Cannot connect to target database")
                return False
            
            # Create safety backup if not skipped
            safety_backup_dir = None
            if not skip_safety_backup:
                safety_backup_dir = self.db_restore_tool.create_pre_restore_backup()
                if not safety_backup_dir:
                    logger.warning("⚠️ Safety backup failed, but continuing...")
            
            # Perform database restore
            success = self.db_restore_tool.restore_database(backup_dir)
            
            if success:
                # Verify restore
                validation = self.db_restore_tool.validate_backup(backup_dir)
                if validation['manifest_data']:
                    self.db_restore_tool.verify_restore(original_info, validation['manifest_data'])
                
                logger.info("✅ Database restore phase completed")
                return True
            else:
                logger.error("❌ Database restore phase failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Database restore phase error: {e}")
            return False
    
    def restore_storage_phase(self, backup_dir: Path, buckets_to_restore: Optional[List[str]] = None) -> bool:
        """Restore storage with validation"""
        logger.info("💾 Starting storage restore phase...")
        
        try:
            # Perform storage restore
            restore_summary = self.storage_restore_tool.restore_all_storage(backup_dir, buckets_to_restore)
            
            if restore_summary.get('success'):
                # Verify restore
                self.storage_restore_tool.verify_restore(restore_summary)
                logger.info("✅ Storage restore phase completed")
                return True
            else:
                logger.error("❌ Storage restore phase failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Storage restore phase error: {e}")
            return False
    
    def perform_complete_restore(self, backup_dir: Path, options: Dict) -> Dict:
        """Perform complete restore with proper sequencing"""
        logger.info("🚀 Starting complete restore...")
        
        restore_result = {
            'success': False,
            'database_success': False,
            'storage_success': False,
            'pre_restore_snapshot': None,
            'start_time': datetime.now(),
            'errors': []
        }
        
        try:
            # Create pre-restore snapshot
            if not options.get('skip_snapshot'):
                restore_result['pre_restore_snapshot'] = self.create_pre_restore_snapshot()
            
            # Phase 1: Database Restore (must come first to establish schema)
            if not options.get('storage_only'):
                logger.info("=" * 50)
                logger.info("PHASE 1: DATABASE RESTORE")
                logger.info("=" * 50)
                
                restore_result['database_success'] = self.restore_database_phase(
                    backup_dir, 
                    options.get('skip_safety_backup', False)
                )
                
                if not restore_result['database_success']:
                    restore_result['errors'].append("Database restore failed")
                    if not options.get('continue_on_failure'):
                        return restore_result
            else:
                restore_result['database_success'] = True  # Skipped
            
            # Phase 2: Storage Restore
            if not options.get('database_only'):
                logger.info("=" * 50)
                logger.info("PHASE 2: STORAGE RESTORE")
                logger.info("=" * 50)
                
                restore_result['storage_success'] = self.restore_storage_phase(
                    backup_dir,
                    options.get('buckets_to_restore')
                )
                
                if not restore_result['storage_success']:
                    restore_result['errors'].append("Storage restore failed")
            else:
                restore_result['storage_success'] = True  # Skipped
            
            # Overall success
            restore_result['success'] = restore_result['database_success'] and restore_result['storage_success']
            restore_result['end_time'] = datetime.now()
            restore_result['duration'] = restore_result['end_time'] - restore_result['start_time']
            
            return restore_result
            
        except Exception as e:
            error_msg = f"Complete restore error: {e}"
            logger.error(f"❌ {error_msg}")
            restore_result['errors'].append(error_msg)
            restore_result['end_time'] = datetime.now()
            restore_result['duration'] = restore_result['end_time'] - restore_result['start_time']
            return restore_result
    
    def show_restore_summary(self, restore_result: Dict, backup_dir: Path):
        """Show comprehensive restore summary"""
        logger.info("=" * 60)
        logger.info("    COMPLETE RESTORE SUMMARY")
        logger.info("=" * 60)
        
        duration = restore_result.get('duration')
        if duration:
            minutes = int(duration.total_seconds() // 60)
            seconds = int(duration.total_seconds() % 60)
            logger.info(f"⏱️  Duration: {minutes}m {seconds}s")
        
        logger.info(f"📂 Backup source: {backup_dir}")
        
        if restore_result.get('pre_restore_snapshot'):
            logger.info(f"📸 Pre-restore snapshot: {restore_result['pre_restore_snapshot']}")
        
        # Database results
        if restore_result['database_success']:
            logger.info("✅ Database restore: SUCCESS")
        else:
            logger.info("❌ Database restore: FAILED")
        
        # Storage results  
        if restore_result['storage_success']:
            logger.info("✅ Storage restore: SUCCESS")
        else:
            logger.info("❌ Storage restore: FAILED")
        
        # Overall result
        if restore_result['success']:
            logger.info("🎉 OVERALL RESULT: COMPLETE RESTORE SUCCESSFUL!")
        else:
            logger.info("⚠️  OVERALL RESULT: RESTORE COMPLETED WITH ERRORS")
            if restore_result.get('errors'):
                logger.info("Errors encountered:")
                for error in restore_result['errors']:
                    logger.info(f"  - {error}")

@click.command()
@click.argument('backup_dir', type=click.Path(exists=True, path_type=Path))
@click.option('--config', '-c', default='.env', help='Path to configuration file')
@click.option('--database-only', is_flag=True, help='Restore database only')
@click.option('--storage-only', is_flag=True, help='Restore storage only')
@click.option('--buckets', '-b', help='Comma-separated list of storage buckets to restore')
@click.option('--skip-safety-backup', is_flag=True, help='Skip creating safety backup')
@click.option('--skip-snapshot', is_flag=True, help='Skip creating pre-restore snapshot')
@click.option('--continue-on-failure', is_flag=True, help='Continue storage restore even if database fails')
@click.option('--force', is_flag=True, help='Skip all confirmation prompts (DANGEROUS)')
def main(backup_dir, config, database_only, storage_only, buckets, skip_safety_backup, skip_snapshot, continue_on_failure, force):
    """Complete restore from backup directory"""
    
    try:
        restore_tool = CompleteRestoreTool(config)
        
        logger.info("=" * 60)
        logger.info("  Professional Complete Restore Tool")
        logger.info("=" * 60)
        
        # Validate complete backup
        validation = restore_tool.validate_complete_backup(backup_dir)
        if not validation['valid']:
            logger.error("❌ Backup validation failed. Cannot proceed with restore.")
            sys.exit(1)
        
        # Parse options
        options = {
            'database_only': database_only,
            'storage_only': storage_only,
            'buckets_to_restore': [b.strip() for b in buckets.split(',')] if buckets else None,
            'skip_safety_backup': skip_safety_backup,
            'skip_snapshot': skip_snapshot,
            'continue_on_failure': continue_on_failure
        }
        
        # Safety confirmation
        if not force:
            print("\n" + "🚨" * 20)
            print("CRITICAL WARNING: COMPLETE DATABASE AND STORAGE RESTORE")
            print("🚨" * 20)
            print("\nThis will:")
            if not storage_only:
                print("  ❗ COMPLETELY REPLACE your database")
                print("  ❗ ALL current data will be LOST")
            if not database_only:
                print("  ❗ Upload files to storage buckets")
                storage_buckets = len(validation['storage_validation'].get('buckets', []))
                storage_files = validation['storage_validation'].get('total_files', 0)
                print(f"  📦 {storage_buckets} buckets, {storage_files} files")
            
            print(f"\nBackup Info:")
            if validation['manifest_data']:
                print(f"  📅 Created: {validation['manifest_data'].get('backup_timestamp', 'Unknown')}")
                stats = validation['manifest_data'].get('statistics', {})
                print(f"  📁 Files: {stats.get('total_files', 'Unknown')}")
                print(f"  💾 Size: {stats.get('total_size', 'Unknown')} bytes")
            
            print(f"\nSafety Measures:")
            if not skip_snapshot:
                print("  ✅ Pre-restore snapshot will be created")
            if not skip_safety_backup and not storage_only:
                print("  ✅ Database safety backup will be created")
            
            if not click.confirm("\n🚨 Do you understand the risks and want to proceed?"):
                logger.info("Complete restore cancelled by user")
                sys.exit(0)
            
            if not click.confirm("🚨 Are you ABSOLUTELY CERTAIN? This cannot be undone easily!"):
                logger.info("Complete restore cancelled by user")
                sys.exit(0)
        
        # Perform complete restore
        restore_result = restore_tool.perform_complete_restore(backup_dir, options)
        
        # Show summary
        restore_tool.show_restore_summary(restore_result, backup_dir)
        
        if restore_result['success']:
            logger.info("🎉 Complete restore finished successfully!")
        else:
            logger.error("❌ Complete restore finished with errors")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("Complete restore cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Complete restore failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()