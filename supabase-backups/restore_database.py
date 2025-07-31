#!/usr/bin/env python3
"""
Professional Database Restore Tool
Safely restores database from backup with comprehensive safety checks
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
import psycopg2
from urllib.parse import urlparse

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

class DatabaseRestoreTool:
    """Professional database restore with safety checks"""
    
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
            'DB_PASSWORD': os.getenv('DB_PASSWORD', config.get('DB_PASSWORD', '')),
        })
        
        required_fields = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SUPABASE_PROJECT_REF']
        missing_fields = [field for field in required_fields if not config.get(field)]
        
        if missing_fields:
            logger.error(f"Missing required configuration: {', '.join(missing_fields)}")
            sys.exit(1)
            
        return config
    
    def validate_backup(self, backup_dir: Path) -> Dict:
        """Validate backup before attempting restore"""
        logger.info("Validating backup integrity...")
        
        validation = {
            'valid': True,
            'issues': [],
            'database_files': [],
            'manifest_data': None
        }
        
        # Check backup directory structure
        required_dirs = ['database', 'metadata']
        for dir_name in required_dirs:
            dir_path = backup_dir / dir_name
            if not dir_path.exists():
                validation['issues'].append(f"Missing directory: {dir_name}")
                validation['valid'] = False
        
        # Check for database backup files
        db_dir = backup_dir / 'database'
        if db_dir.exists():
            sql_files = list(db_dir.glob('*.sql'))
            if not sql_files:
                validation['issues'].append("No database backup files found")
                validation['valid'] = False
            else:
                for sql_file in sql_files:
                    if sql_file.stat().st_size < 1000:  # Less than 1KB
                        validation['issues'].append(f"Database file {sql_file.name} appears too small")
                        validation['valid'] = False
                    else:
                        validation['database_files'].append(sql_file)
        
        # Check backup manifest
        manifest_file = backup_dir / 'backup_manifest.json'
        if manifest_file.exists():
            try:
                with open(manifest_file, 'r') as f:
                    validation['manifest_data'] = json.load(f)
                    logger.info(f"Backup created: {validation['manifest_data'].get('backup_timestamp', 'Unknown')}")
            except Exception as e:
                validation['issues'].append(f"Cannot read backup manifest: {e}")
        else:
            validation['issues'].append("Missing backup manifest")
        
        if validation['valid']:
            logger.info("✅ Backup validation passed")
        else:
            logger.error("❌ Backup validation failed:")
            for issue in validation['issues']:
                logger.error(f"  - {issue}")
        
        return validation
    
    def create_pre_restore_backup(self) -> Optional[Path]:
        """Create a safety backup before restore"""
        logger.info("Creating pre-restore safety backup...")
        
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safety_backup_name = f"pre_restore_backup_{timestamp}"
            safety_backup_dir = Path("safety_backups") / safety_backup_name
            safety_backup_dir.mkdir(parents=True, exist_ok=True)
            
            # Use Supabase CLI to create safety backup
            safety_file = safety_backup_dir / "safety_backup.sql"
            
            result = subprocess.run([
                'supabase', 'db', 'dump', 
                '--linked', 
                f'--file={safety_file}'
            ], capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0 and safety_file.exists():
                size = safety_file.stat().st_size
                logger.info(f"✅ Pre-restore safety backup created: {size} bytes")
                logger.info(f"📁 Safety backup location: {safety_backup_dir}")
                return safety_backup_dir
            else:
                logger.error(f"❌ Safety backup failed: {result.stderr}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Safety backup error: {e}")
            return None
    
    def get_database_info(self) -> Dict:
        """Get current database information"""
        logger.info("Gathering current database information...")
        
        try:
            # Get database connection string
            parsed_url = urlparse(self.config['SUPABASE_URL'])
            host = parsed_url.hostname
            db_url = f"postgresql://postgres:{self.config.get('DB_PASSWORD', '')}@{host}:5432/postgres"
            
            # Connect and get basic info
            conn = psycopg2.connect(db_url)
            cursor = conn.cursor()
            
            # Get table count
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            table_count = cursor.fetchone()[0]
            
            # Get approximate row counts for major tables
            cursor.execute("""
                SELECT schemaname, tablename, n_tup_ins - n_tup_del as row_count
                FROM pg_stat_user_tables 
                WHERE schemaname = 'public'
                ORDER BY row_count DESC
                LIMIT 10
            """)
            top_tables = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            info = {
                'table_count': table_count,
                'top_tables': [{'schema': row[0], 'table': row[1], 'rows': row[2]} for row in top_tables],
                'connection_successful': True
            }
            
            logger.info(f"📊 Current database: {table_count} tables")
            for table_info in info['top_tables'][:3]:
                logger.info(f"   - {table_info['table']}: ~{table_info['rows']} rows")
            
            return info
            
        except Exception as e:
            logger.error(f"❌ Failed to get database info: {e}")
            return {'connection_successful': False, 'error': str(e)}
    
    def restore_database(self, backup_dir: Path, backup_file: Optional[str] = None) -> bool:
        """Restore database from backup file"""
        logger.info("Starting database restore...")
        
        # Find backup file
        if backup_file:
            sql_file = backup_dir / 'database' / backup_file
        else:
            sql_files = list((backup_dir / 'database').glob('*.sql'))
            if not sql_files:
                logger.error("No database backup files found")
                return False
            
            # Prefer full_backup.sql, otherwise use the first one
            sql_file = None
            for f in sql_files:
                if 'full_backup' in f.name or 'full-backup' in f.name:
                    sql_file = f
                    break
            
            if not sql_file:
                sql_file = sql_files[0]
        
        if not sql_file.exists():
            logger.error(f"Backup file not found: {sql_file}")
            return False
        
        logger.info(f"📄 Using backup file: {sql_file.name} ({sql_file.stat().st_size} bytes)")
        
        try:
            # Method 1: Try Supabase CLI reset + restore
            logger.info("Attempting restore via Supabase CLI...")
            
            # Reset the database (this will prompt for confirmation)
            result = subprocess.run([
                'supabase', 'db', 'reset'
            ], capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                logger.info("✅ Database reset successful")
                
                # Apply the backup
                with open(sql_file, 'r') as f:
                    restore_result = subprocess.run([
                        'supabase', 'db', 'diff', '--file', str(sql_file)
                    ], capture_output=True, text=True, timeout=600)
                
                if restore_result.returncode == 0:
                    logger.info("✅ Database restore completed via CLI")
                    return True
                else:
                    logger.warning(f"CLI restore had issues: {restore_result.stderr}")
            
            # Method 2: Fallback to direct psql
            logger.info("Attempting restore via direct psql...")
            
            parsed_url = urlparse(self.config['SUPABASE_URL'])
            host = parsed_url.hostname
            db_url = f"postgresql://postgres:{self.config.get('DB_PASSWORD', '')}@{host}:5432/postgres"
            
            result = subprocess.run([
                'psql', db_url,
                '--file', str(sql_file),
                '--quiet'
            ], capture_output=True, text=True, timeout=600)
            
            if result.returncode == 0:
                logger.info("✅ Database restore completed via psql")
                return True
            else:
                logger.error(f"❌ Database restore failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("❌ Database restore timed out")
            return False
        except Exception as e:
            logger.error(f"❌ Database restore error: {e}")
            return False
    
    def verify_restore(self, original_info: Dict, backup_manifest: Dict) -> bool:
        """Verify the restore was successful"""
        logger.info("Verifying database restore...")
        
        try:
            # Get post-restore database info
            current_info = self.get_database_info()
            
            if not current_info.get('connection_successful'):
                logger.error("❌ Cannot connect to database after restore")
                return False
            
            # Compare table counts
            original_tables = original_info.get('table_count', 0)
            current_tables = current_info.get('table_count', 0)
            
            logger.info(f"📊 Table count: {original_tables} → {current_tables}")
            
            # Check if restore looks reasonable
            backup_timestamp = backup_manifest.get('backup_timestamp', 'Unknown')
            backup_stats = backup_manifest.get('statistics', {})
            
            logger.info(f"📅 Backup from: {backup_timestamp}")
            logger.info(f"📁 Backup files: {backup_stats.get('total_files', 'Unknown')}")
            logger.info(f"💾 Backup size: {backup_stats.get('total_size', 'Unknown')} bytes")
            
            # Basic sanity checks
            if current_tables == 0:
                logger.error("❌ No tables found after restore - restore may have failed")
                return False
            
            if current_tables < original_tables * 0.8:  # Allow for some variation
                logger.warning(f"⚠️ Table count significantly different: {original_tables} → {current_tables}")
            
            logger.info("✅ Database restore verification completed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Restore verification failed: {e}")
            return False

@click.command()
@click.argument('backup_dir', type=click.Path(exists=True, path_type=Path))
@click.option('--config', '-c', default='.env', help='Path to configuration file')
@click.option('--backup-file', '-f', help='Specific backup file to restore')
@click.option('--skip-safety-backup', is_flag=True, help='Skip creating pre-restore safety backup')
@click.option('--force', is_flag=True, help='Skip confirmation prompts (DANGEROUS)')
def main(backup_dir, config, backup_file, skip_safety_backup, force):
    """Restore database from backup directory"""
    
    try:
        restore_tool = DatabaseRestoreTool(config)
        
        logger.info("=" * 60)
        logger.info("    Professional Database Restore Tool")
        logger.info("=" * 60)
        
        # Validate backup
        validation = restore_tool.validate_backup(backup_dir)
        if not validation['valid']:
            logger.error("❌ Backup validation failed. Cannot proceed with restore.")
            sys.exit(1)
        
        # Get current database info
        original_info = restore_tool.get_database_info()
        if not original_info.get('connection_successful'):
            logger.error("❌ Cannot connect to target database")
            sys.exit(1)
        
        # Safety confirmation
        if not force:
            print("\n" + "⚠️ " * 20)
            print("WARNING: This will COMPLETELY REPLACE your current database!")
            print("⚠️ " * 20)
            print(f"\nTarget Database Info:")
            print(f"  - Tables: {original_info.get('table_count', 'Unknown')}")
            print(f"  - Project: {restore_tool.config['SUPABASE_PROJECT_REF']}")
            print(f"\nBackup Info:")
            if validation['manifest_data']:
                print(f"  - Created: {validation['manifest_data'].get('backup_timestamp', 'Unknown')}")
                stats = validation['manifest_data'].get('statistics', {})
                print(f"  - Files: {stats.get('total_files', 'Unknown')}")
                print(f"  - Size: {stats.get('total_size', 'Unknown')} bytes")
            
            if not click.confirm("\n🚨 Are you absolutely sure you want to proceed?"):
                logger.info("Restore cancelled by user")
                sys.exit(0)
        
        # Create safety backup
        safety_backup_dir = None
        if not skip_safety_backup:
            safety_backup_dir = restore_tool.create_pre_restore_backup()
            if not safety_backup_dir:
                if not force:
                    if not click.confirm("⚠️ Safety backup failed. Continue anyway?"):
                        logger.error("Restore cancelled due to safety backup failure")
                        sys.exit(1)
        
        # Perform restore
        logger.info("🚀 Starting database restore...")
        success = restore_tool.restore_database(backup_dir, backup_file)
        
        if success:
            # Verify restore
            if validation['manifest_data']:
                restore_tool.verify_restore(original_info, validation['manifest_data'])
            
            logger.info("🎉 Database restore completed successfully!")
            if safety_backup_dir:
                logger.info(f"💾 Safety backup available at: {safety_backup_dir}")
        else:
            logger.error("❌ Database restore failed")
            if safety_backup_dir:
                logger.info(f"💾 You can restore from safety backup at: {safety_backup_dir}")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("Restore cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Restore failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()