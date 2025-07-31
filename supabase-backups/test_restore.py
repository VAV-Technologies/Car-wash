#!/usr/bin/env python3
"""
Test Environment Restore Validation
Safely test restore procedures without affecting production
"""

import os
import sys
import json
import logging
import tempfile
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, List
import click

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('test_restore.log')
    ]
)
logger = logging.getLogger(__name__)

class RestoreTestSuite:
    """Test suite for validating restore procedures"""
    
    def __init__(self, backup_dir: Path):
        self.backup_dir = backup_dir
        self.test_results = {
            'backup_validation': {},
            'file_integrity': {},
            'restore_simulation': {},
            'overall_score': 0.0
        }
    
    def test_backup_structure(self) -> Dict:
        """Test backup directory structure and files"""
        logger.info("🧪 Testing backup structure...")
        
        test_result = {
            'passed': True,
            'score': 0.0,
            'checks': [],
            'issues': []
        }
        
        checks = [
            ('backup_directory_exists', lambda: self.backup_dir.exists()),
            ('database_directory_exists', lambda: (self.backup_dir / 'database').exists()),
            ('storage_directory_exists', lambda: (self.backup_dir / 'storage').exists()),
            ('metadata_directory_exists', lambda: (self.backup_dir / 'metadata').exists()),
            ('manifest_file_exists', lambda: (self.backup_dir / 'backup_manifest.json').exists()),
            ('database_files_exist', lambda: len(list((self.backup_dir / 'database').glob('*.sql'))) > 0),
            ('storage_has_content', lambda: len(list((self.backup_dir / 'storage').rglob('*'))) > 0)
        ]
        
        passed_checks = 0
        for check_name, check_func in checks:
            try:
                result = check_func()
                test_result['checks'].append({
                    'name': check_name,
                    'passed': result,
                    'description': check_name.replace('_', ' ').title()
                })
                if result:
                    passed_checks += 1
                else:
                    test_result['issues'].append(f"Failed: {check_name}")
            except Exception as e:
                test_result['checks'].append({
                    'name': check_name,
                    'passed': False,
                    'error': str(e)
                })
                test_result['issues'].append(f"Error in {check_name}: {e}")
        
        test_result['score'] = passed_checks / len(checks)
        test_result['passed'] = test_result['score'] >= 0.8  # 80% pass rate
        
        if test_result['passed']:
            logger.info(f"✅ Backup structure test passed ({test_result['score']:.1%})")
        else:
            logger.warning(f"⚠️ Backup structure test issues ({test_result['score']:.1%})")
        
        return test_result
    
    def test_file_integrity(self) -> Dict:
        """Test file integrity and checksums"""
        logger.info("🧪 Testing file integrity...")
        
        test_result = {
            'passed': True,
            'score': 0.0,
            'database_files': [],
            'storage_files_sample': [],
            'issues': []
        }
        
        # Test database files
        db_dir = self.backup_dir / 'database'
        if db_dir.exists():
            for sql_file in db_dir.glob('*.sql'):
                file_info = {
                    'name': sql_file.name,
                    'size': sql_file.stat().st_size,
                    'readable': True,
                    'has_content': False,
                    'line_count': 0
                }
                
                try:
                    with open(sql_file, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = f.readlines()
                        file_info['line_count'] = len(lines)
                        file_info['has_content'] = len(lines) > 100  # Reasonable threshold
                        
                        # Check for SQL structure
                        content = ''.join(lines[:50])  # First 50 lines
                        file_info['has_sql_structure'] = any(keyword in content.upper() for keyword in 
                                                          ['CREATE TABLE', 'INSERT INTO', 'CREATE FUNCTION'])
                        
                except Exception as e:
                    file_info['readable'] = False
                    file_info['error'] = str(e)
                    test_result['issues'].append(f"Cannot read {sql_file.name}: {e}")
                
                test_result['database_files'].append(file_info)
        
        # Test sample storage files
        storage_dir = self.backup_dir / 'storage'
        if storage_dir.exists():
            storage_files = list(storage_dir.rglob('*'))
            file_sample = [f for f in storage_files if f.is_file()][:10]  # Sample 10 files
            
            for storage_file in file_sample:
                file_info = {
                    'name': str(storage_file.relative_to(storage_dir)),
                    'size': storage_file.stat().st_size,
                    'readable': True,
                    'has_content': storage_file.stat().st_size > 0
                }
                
                try:
                    # Just test readability
                    with open(storage_file, 'rb') as f:
                        f.read(1024)  # Read first 1KB
                except Exception as e:
                    file_info['readable'] = False
                    file_info['error'] = str(e)
                    test_result['issues'].append(f"Cannot read storage file {file_info['name']}: {e}")
                
                test_result['storage_files_sample'].append(file_info)
        
        # Calculate score
        total_checks = 0
        passed_checks = 0
        
        for db_file in test_result['database_files']:
            total_checks += 3  # readable, has_content, has_sql_structure
            if db_file.get('readable'): passed_checks += 1
            if db_file.get('has_content'): passed_checks += 1
            if db_file.get('has_sql_structure'): passed_checks += 1
        
        for storage_file in test_result['storage_files_sample']:
            total_checks += 2  # readable, has_content
            if storage_file.get('readable'): passed_checks += 1
            if storage_file.get('has_content'): passed_checks += 1
        
        if total_checks > 0:
            test_result['score'] = passed_checks / total_checks
            test_result['passed'] = test_result['score'] >= 0.9  # 90% pass rate for integrity
        
        if test_result['passed']:
            logger.info(f"✅ File integrity test passed ({test_result['score']:.1%})")
        else:
            logger.warning(f"⚠️ File integrity test issues ({test_result['score']:.1%})")
        
        return test_result
    
    def test_manifest_validation(self) -> Dict:
        """Test backup manifest validation"""
        logger.info("🧪 Testing manifest validation...")
        
        test_result = {
            'passed': True,
            'score': 0.0,
            'manifest_data': None,
            'checks': [],
            'issues': []
        }
        
        manifest_file = self.backup_dir / 'backup_manifest.json'
        
        if not manifest_file.exists():
            test_result['passed'] = False
            test_result['issues'].append("Backup manifest file missing")
            return test_result
        
        try:
            with open(manifest_file, 'r') as f:
                test_result['manifest_data'] = json.load(f)
            
            manifest = test_result['manifest_data']
            
            # Required fields check
            required_fields = ['backup_timestamp', 'supabase_project', 'backup_version', 'files']
            field_checks = []
            
            for field in required_fields:
                present = field in manifest
                field_checks.append({
                    'field': field,
                    'present': present,
                    'value': manifest.get(field, 'MISSING')
                })
                if not present:
                    test_result['issues'].append(f"Missing required field: {field}")
            
            test_result['checks'] = field_checks
            
            # File counts validation
            if 'files' in manifest:
                db_files = manifest['files'].get('database', [])
                storage_files = manifest['files'].get('storage', [])
                
                test_result['manifest_file_counts'] = {
                    'database_files': len(db_files),
                    'storage_files': len(storage_files),
                    'total_files': len(db_files) + len(storage_files)
                }
            
            # Calculate score
            passed_fields = sum(1 for check in field_checks if check['present'])
            test_result['score'] = passed_fields / len(required_fields)
            test_result['passed'] = test_result['score'] >= 0.8
            
        except Exception as e:
            test_result['passed'] = False
            test_result['issues'].append(f"Cannot parse manifest: {e}")
        
        if test_result['passed']:
            logger.info(f"✅ Manifest validation passed ({test_result['score']:.1%})")
        else:
            logger.warning(f"⚠️ Manifest validation issues ({test_result['score']:.1%})")
        
        return test_result
    
    def test_restore_readiness(self) -> Dict:
        """Test if backup is ready for restore"""
        logger.info("🧪 Testing restore readiness...")
        
        test_result = {
            'passed': True,
            'score': 0.0,
            'readiness_checks': [],
            'recommendations': [],
            'issues': []
        }
        
        checks = [
            ('database_backup_size_adequate', self._check_db_size_adequate),
            ('storage_files_present', self._check_storage_files_present),
            ('no_empty_directories', self._check_no_empty_directories),
            ('file_permissions_correct', self._check_file_permissions),
            ('backup_age_reasonable', self._check_backup_age_reasonable)
        ]
        
        passed_checks = 0
        for check_name, check_func in checks:
            try:
                result, details = check_func()
                test_result['readiness_checks'].append({
                    'name': check_name,
                    'passed': result,
                    'details': details,
                    'description': check_name.replace('_', ' ').title()
                })
                
                if result:
                    passed_checks += 1
                else:
                    test_result['issues'].append(f"Readiness issue: {check_name} - {details}")
                    
            except Exception as e:
                test_result['readiness_checks'].append({
                    'name': check_name,
                    'passed': False,
                    'error': str(e)
                })
                test_result['issues'].append(f"Check error {check_name}: {e}")
        
        test_result['score'] = passed_checks / len(checks)
        test_result['passed'] = test_result['score'] >= 0.8
        
        # Add recommendations
        if test_result['score'] < 1.0:
            test_result['recommendations'].append("Review failed readiness checks before attempting restore")
        if test_result['score'] < 0.6:
            test_result['recommendations'].append("Consider creating a new backup - this one may be incomplete")
        
        if test_result['passed']:
            logger.info(f"✅ Restore readiness test passed ({test_result['score']:.1%})")
        else:
            logger.warning(f"⚠️ Restore readiness issues ({test_result['score']:.1%})")
        
        return test_result
    
    def _check_db_size_adequate(self) -> tuple:
        """Check if database backup size is adequate"""
        db_dir = self.backup_dir / 'database'
        if not db_dir.exists():
            return False, "Database directory missing"
        
        sql_files = list(db_dir.glob('*.sql'))
        if not sql_files:
            return False, "No SQL files found"
        
        total_size = sum(f.stat().st_size for f in sql_files)
        if total_size < 10000:  # Less than 10KB seems too small
            return False, f"Database backup seems too small: {total_size} bytes"
        
        return True, f"Database backup size adequate: {total_size} bytes"
    
    def _check_storage_files_present(self) -> tuple:
        """Check if storage files are present"""
        storage_dir = self.backup_dir / 'storage'
        if not storage_dir.exists():
            return False, "Storage directory missing"
        
        storage_files = list(storage_dir.rglob('*'))
        file_count = len([f for f in storage_files if f.is_file()])
        
        if file_count == 0:
            return False, "No storage files found"
        
        return True, f"Found {file_count} storage files"
    
    def _check_no_empty_directories(self) -> tuple:
        """Check for empty directories that might indicate incomplete backup"""
        empty_dirs = []
        
        for dir_path in self.backup_dir.rglob('*'):
            if dir_path.is_dir():
                try:
                    if not any(dir_path.iterdir()):
                        empty_dirs.append(str(dir_path.relative_to(self.backup_dir)))
                except PermissionError:
                    pass
        
        if empty_dirs:
            return False, f"Found {len(empty_dirs)} empty directories: {empty_dirs[:3]}"
        
        return True, "No empty directories found"
    
    def _check_file_permissions(self) -> tuple:
        """Check file permissions"""
        try:
            # Test reading a few files
            db_dir = self.backup_dir / 'database'
            if db_dir.exists():
                sql_files = list(db_dir.glob('*.sql'))[:1]
                for sql_file in sql_files:
                    with open(sql_file, 'r') as f:
                        f.read(100)  # Read first 100 chars
            
            return True, "File permissions appear correct"
            
        except PermissionError as e:
            return False, f"Permission error: {e}"
        except Exception as e:
            return False, f"File access error: {e}"
    
    def _check_backup_age_reasonable(self) -> tuple:
        """Check if backup age is reasonable"""
        manifest_file = self.backup_dir / 'backup_manifest.json'
        
        if not manifest_file.exists():
            return False, "Cannot determine backup age - no manifest"
        
        try:
            with open(manifest_file, 'r') as f:
                manifest = json.load(f)
            
            backup_timestamp = manifest.get('backup_timestamp')
            if not backup_timestamp:
                return False, "No backup timestamp in manifest"
            
            # Parse timestamp
            backup_time = datetime.fromisoformat(backup_timestamp.replace('Z', '+00:00'))
            age = datetime.now() - backup_time.replace(tzinfo=None)
            
            days_old = age.days
            
            if days_old > 30:
                return False, f"Backup is {days_old} days old - may be stale"
            elif days_old > 7:
                return True, f"Backup is {days_old} days old - consider freshness"
            else:
                return True, f"Backup is {days_old} days old - fresh"
                
        except Exception as e:
            return False, f"Cannot parse backup timestamp: {e}"
    
    def run_complete_test_suite(self) -> Dict:
        """Run complete test suite"""
        logger.info("🧪 Running complete restore test suite...")
        logger.info(f"📂 Testing backup: {self.backup_dir}")
        
        # Run all tests
        structure_test = self.test_backup_structure()
        integrity_test = self.test_file_integrity()
        manifest_test = self.test_manifest_validation()
        readiness_test = self.test_restore_readiness()
        
        # Compile results
        self.test_results = {
            'backup_structure': structure_test,
            'file_integrity': integrity_test,
            'manifest_validation': manifest_test,
            'restore_readiness': readiness_test,
            'overall_score': 0.0,
            'overall_passed': False,
            'summary': {}
        }
        
        # Calculate overall score
        scores = [
            structure_test['score'],
            integrity_test['score'],
            manifest_test['score'],
            readiness_test['score']
        ]
        
        self.test_results['overall_score'] = sum(scores) / len(scores)
        self.test_results['overall_passed'] = self.test_results['overall_score'] >= 0.8
        
        # Create summary
        self.test_results['summary'] = {
            'total_tests': 4,
            'passed_tests': sum(1 for test in [structure_test, integrity_test, manifest_test, readiness_test] if test['passed']),
            'overall_score': self.test_results['overall_score'],
            'recommendation': self._get_recommendation()
        }
        
        return self.test_results
    
    def _get_recommendation(self) -> str:
        """Get recommendation based on test results"""
        score = self.test_results['overall_score']
        
        if score >= 0.95:
            return "EXCELLENT: Backup is ready for restore with high confidence"
        elif score >= 0.85:
            return "GOOD: Backup appears ready for restore with minor concerns"
        elif score >= 0.7:
            return "FAIR: Backup may be usable but review issues carefully"
        elif score >= 0.5:
            return "POOR: Backup has significant issues - restore at your own risk"
        else:
            return "CRITICAL: Backup appears severely compromised - do not attempt restore"
    
    def save_test_report(self, output_file: Optional[Path] = None) -> Path:
        """Save detailed test report"""
        if not output_file:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = Path(f"restore_test_report_{timestamp}.json")
        
        report = {
            'test_timestamp': datetime.now().isoformat(),
            'backup_directory': str(self.backup_dir),
            'test_results': self.test_results
        }
        
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        logger.info(f"📄 Test report saved: {output_file}")
        return output_file

@click.command()
@click.argument('backup_dir', type=click.Path(exists=True, path_type=Path))
@click.option('--output', '-o', help='Output file for detailed report')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def main(backup_dir, output, verbose):
    """Test restore readiness of backup directory"""
    
    try:
        logger.info("=" * 60)
        logger.info("    Restore Test Suite")
        logger.info("=" * 60)
        
        test_suite = RestoreTestSuite(backup_dir)
        results = test_suite.run_complete_test_suite()
        
        # Show summary
        logger.info("=" * 60)
        logger.info("    TEST RESULTS SUMMARY")
        logger.info("=" * 60)
        
        summary = results['summary']
        logger.info(f"📊 Overall Score: {results['overall_score']:.1%}")
        logger.info(f"✅ Passed Tests: {summary['passed_tests']}/{summary['total_tests']}")
        logger.info(f"💡 Recommendation: {summary['recommendation']}")
        
        # Show detailed results if verbose
        if verbose:
            logger.info("\n" + "=" * 40)
            logger.info("DETAILED TEST RESULTS")
            logger.info("=" * 40)
            
            for test_name, test_result in results.items():
                if test_name in ['overall_score', 'overall_passed', 'summary']:
                    continue
                    
                status = "✅ PASS" if test_result['passed'] else "❌ FAIL"
                logger.info(f"\n{test_name.replace('_', ' ').title()}: {status} ({test_result['score']:.1%})")
                
                if test_result.get('issues'):
                    for issue in test_result['issues'][:3]:  # Show first 3 issues
                        logger.info(f"  ⚠️ {issue}")
        
        # Save detailed report
        output_path = Path(output) if output else None
        report_file = test_suite.save_test_report(output_path)
        
        # Exit with appropriate code
        if results['overall_passed']:
            logger.info("🎉 Backup passed restore readiness tests!")
            sys.exit(0)
        else:
            logger.warning("⚠️ Backup failed some restore readiness tests")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Test suite failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()