#!/usr/bin/env python3
"""
Standalone backup validation script
"""

import os
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from backup_tool_enhanced import SupabaseBackupToolEnhanced

def main():
    if len(sys.argv) != 2:
        print("Usage: python validate_backup.py <backup_directory>")
        sys.exit(1)
    
    backup_dir = Path(sys.argv[1])
    if not backup_dir.exists():
        print(f"Backup directory {backup_dir} does not exist")
        sys.exit(1)
    
    # Create a backup tool instance just for validation
    tool = SupabaseBackupToolEnhanced('.env')
    tool.backup_dir = backup_dir
    
    print(f"🔍 Validating backup: {backup_dir}")
    print("=" * 60)
    
    # Run mathematical validation
    validation_result = tool.validate_backup_mathematically()
    
    # Print results
    print("\n📊 VALIDATION RESULTS:")
    print("=" * 60)
    
    # Database validation
    db_val = validation_result.get('database_validation', {})
    print(f"📄 Database Integrity Score: {db_val.get('integrity_score', 0):.2f}")
    print(f"   - Total size: {db_val.get('total_size', 0)} bytes")
    print(f"   - Line count: {sum(db_val.get('line_counts', {}).values())}")
    print(f"   - Table count: {sum(db_val.get('table_counts', {}).values())}")
    
    # Storage validation  
    storage_val = validation_result.get('storage_validation', {})
    print(f"💾 Storage Integrity Score: {storage_val.get('integrity_score', 0):.2f}")
    print(f"   - Files processed: {storage_val.get('verification_rate', 'N/A')}")
    print(f"   - Total size: {storage_val.get('total_size', 0)} bytes")
    
    # Cross validation
    cross_val = validation_result.get('cross_validation', {})
    print(f"🔗 Cross-validation Score: {cross_val.get('consistency_score', 0):.2f}")
    
    # Overall result
    overall = validation_result.get('overall_integrity', False)
    if overall:
        print(f"\n✅ OVERALL RESULT: BACKUP INTEGRITY VERIFIED")
        print("   All validation checks passed!")
    else:
        print(f"\n⚠️  OVERALL RESULT: INTEGRITY ISSUES DETECTED")
        print("   Review the validation report for details")
    
    print(f"\n📋 Detailed report saved to: {backup_dir}/metadata/validation_report.json")

if __name__ == '__main__':
    main()