# Supabase Complete Backup System

A comprehensive backup and restore solution for Supabase projects that handles:
- ✅ Complete database backups (schema + data)
- ✅ Auth users and profiles
- ✅ Storage bucket files (images, documents)
- ✅ Migration states
- ✅ Easy restoration with safety checks

## Quick Start

### 1. Create a Backup (One Command!)

```bash
# Just run it - it auto-configures everything
./backup.sh

# First time: Will prompt for database password
# Future runs: Uses saved config

# Output:
# ✓ Database backup: 45MB
# ✓ Storage bucket 'listing-images': 234 files
# ✓ Storage bucket 'listing-documents': 89 files
# Total backup size: 156MB
```

**That's it!** The script automatically:
- Detects your Supabase credentials from .env.local
- Prompts for database password (one time only)
- Saves config for future use
- Creates complete backup

### 2. Restore from Backup

```bash
# Restore everything
./restore.sh backup-2025-07-30-123456

# Restore only database
./restore.sh --only-database backup-2025-07-30-123456

# Dry run (preview what would be restored)
./restore.sh --dry-run backup-2025-07-30-123456
```

## Features

### 🛡️ Safety Features
- **Pre-restore backups**: Automatically creates a backup before restoring
- **Confirmation prompts**: Prevents accidental data loss
- **Dry-run mode**: Preview changes before applying
- **Verification**: Checks backup integrity after creation

### 📦 What Gets Backed Up
- **Database**: Complete PostgreSQL dump with all tables
- **Auth Users**: Separate backup of auth.users table
- **Storage Files**: All files from configured buckets
- **Metadata**: Migration status, table counts, file inventories

### 🔄 Restore Options
- **Full Restore**: Database + Storage
- **Selective Restore**: Choose database or storage only
- **Point-in-time**: Restore from any previous backup

## Backup Structure

```
backup-2025-07-30-123456/
├── database/
│   ├── full-backup.sql      # Complete database dump
│   ├── schema-only.sql      # Schema without data
│   ├── data-only.sql        # Data without schema
│   └── auth-users.sql       # Auth users backup
├── storage/
│   ├── listing-images/      # Bucket contents
│   ├── listing-documents/
│   └── onboarding-documents/
├── metadata/
│   ├── backup-manifest.json # Backup metadata
│   ├── migration-status.txt # Supabase migrations
│   ├── table-counts.json    # Row counts for verification
│   └── storage-inventory.json
└── restore-scripts/
    ├── restore-database.sh
    └── restore-storage.sh
```

## Configuration Options

### Essential Settings
```bash
# Database connection
DB_CONNECTION_STRING="postgres://..."

# Supabase credentials
SUPABASE_URL="https://[PROJECT].supabase.co"
SUPABASE_SERVICE_KEY="your-service-key"

# Storage buckets to backup
STORAGE_BUCKETS=(
    "listing-images"
    "listing-documents"
)
```

### Optional Settings
```bash
# Backup behavior
BACKUP_RETENTION_DAYS=30    # Auto-cleanup old backups
COMPRESS_BACKUPS=true       # Create .tar.gz archives
VERIFY_AFTER_BACKUP=true    # Verify backup integrity

# Safety
REQUIRE_CONFIRMATION=true   # Prompt before destructive actions
CREATE_PRE_RESTORE_BACKUP=true  # Backup before restore
```

## Command Reference

### Backup Commands
```bash
# Standard backup
./backup.sh

# Skip confirmation prompts
REQUIRE_CONFIRMATION=false ./backup.sh

# Custom config file
./backup.sh -c production.env
```

### Restore Commands
```bash
# Full restore with confirmations
./restore.sh backup-2025-07-30-123456

# Force restore (skip confirmations)
./restore.sh --force backup-2025-07-30-123456

# Restore from compressed backup
./restore.sh backup-2025-07-30-123456.tar.gz
```

## Troubleshooting

### Missing Dependencies
```bash
# Install required tools (macOS)
brew install postgresql curl jq

# Install required tools (Ubuntu/Debian)
apt-get install postgresql-client curl jq
```

### Connection Issues
- Verify database connection string in config.env
- Check if IP is whitelisted in Supabase dashboard
- Ensure service role key has sufficient permissions

### Large Storage Buckets
- Adjust `PARALLEL_DOWNLOADS` for faster downloads
- Consider backing up buckets separately if very large
- Use compression to save disk space

## Best Practices

1. **Regular Backups**: Schedule daily backups with cron
   ```bash
   0 2 * * * /path/to/backup.sh >> /var/log/supabase-backup.log 2>&1
   ```

2. **Off-site Storage**: Copy backups to S3/Google Cloud
   ```bash
   aws s3 sync ~/supabase-backups s3://my-backup-bucket/
   ```

3. **Test Restores**: Regularly test restore process on staging

4. **Monitor Backup Size**: Set up alerts for backup failures or size anomalies

## Security Notes

- Keep `config.env` secure and never commit to git
- Use read-only database users when possible
- Encrypt backups before uploading to cloud storage
- Rotate service keys regularly

## Support

For issues or questions:
1. Check the logs in backup directory
2. Verify configuration in config.env
3. Run with `bash -x backup.sh` for debug output