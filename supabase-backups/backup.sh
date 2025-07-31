#!/bin/bash
# Supabase Complete Backup Script
# Creates comprehensive backups of database, auth users, and storage files

set -e  # Exit on error

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load libraries
source "${SCRIPT_DIR}/lib/utilities.sh"
source "${SCRIPT_DIR}/lib/database-backup.sh"
source "${SCRIPT_DIR}/lib/storage-backup.sh"

# Main backup function
main() {
    local start_time=$(date +%s)
    
    # Display banner
    echo "=================================================="
    echo "       Supabase Complete Backup System"
    echo "=================================================="
    echo ""
    
    # Check dependencies
    check_dependencies || exit 1
    
    # Load configuration (auto-detects from .env.local if needed)
    load_config || exit 1
    
    log_info "Starting backup process..."
    log_info "Project: ${SUPABASE_PROJECT_REF}"
    
    # Create backup directory
    local backup_dir=$(create_backup_dir)
    log_info "Backup directory: ${backup_dir}"
    
    # Create restore scripts
    create_restore_scripts "$backup_dir"
    
    # Backup database
    if backup_database "$backup_dir"; then
        log_success "Database backup completed"
    else
        log_error "Database backup failed"
        exit 1
    fi
    
    # Backup storage
    if backup_storage "$backup_dir"; then
        log_success "Storage backup completed"
    else
        log_warning "Storage backup had issues (check logs)"
    fi
    
    # Create manifest
    create_manifest "$backup_dir"
    
    # Verify backup
    if [ "$VERIFY_AFTER_BACKUP" = "true" ]; then
        verify_backup "$backup_dir"
    fi
    
    # Compress if requested
    if [ "$COMPRESS_BACKUPS" = "true" ]; then
        compress_backup "$backup_dir"
    fi
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    
    echo ""
    echo "=================================================="
    log_success "Backup completed in ${minutes}m ${seconds}s"
    log_info "Location: ${backup_dir}"
    echo "=================================================="
    
    # Show summary
    show_backup_summary "$backup_dir"
}

# Create restore scripts
create_restore_scripts() {
    local backup_dir=$1
    
    # Create database restore script
    cat > "${backup_dir}/restore-scripts/restore-database.sh" <<'EOF'
#!/bin/bash
# Restore database from backup

BACKUP_DIR="$(dirname "$(dirname "${BASH_SOURCE[0]}")")"
source "$(dirname "$BACKUP_DIR")/lib/utilities.sh"

log_warning "This will restore the database from backup"
confirm_action "This will OVERWRITE the current database. Are you sure?" || exit 1

# Load config
load_config "$(dirname "$BACKUP_DIR")/config.env" || exit 1

# Restore database
log_info "Restoring database..."
psql "$(get_db_connection)" < "${BACKUP_DIR}/database/full-backup.sql"

if [ $? -eq 0 ]; then
    log_success "Database restored successfully"
else
    log_error "Database restore failed"
    exit 1
fi
EOF
    
    chmod +x "${backup_dir}/restore-scripts/restore-database.sh"
    
    # Create storage restore script
    cat > "${backup_dir}/restore-scripts/restore-storage.sh" <<'EOF'
#!/bin/bash
# Restore storage files from backup

echo "Storage restore functionality coming soon..."
echo "For now, manually upload files from the storage/ directory"
EOF
    
    chmod +x "${backup_dir}/restore-scripts/restore-storage.sh"
}

# Compress backup
compress_backup() {
    local backup_dir=$1
    local backup_name=$(basename "$backup_dir")
    
    log_info "Compressing backup..."
    
    cd "$(dirname "$backup_dir")"
    tar -czf "${backup_name}.tar.gz" "$backup_name"
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "${backup_name}.tar.gz" | cut -f1)
        log_success "Backup compressed (${size})"
        
        # Optionally remove uncompressed backup
        # rm -rf "$backup_dir"
    else
        log_error "Compression failed"
    fi
}

# Show backup summary
show_backup_summary() {
    local backup_dir=$1
    
    echo ""
    echo "Backup Summary:"
    echo "---------------"
    
    # Database files
    if [ -f "${backup_dir}/database/full-backup.sql" ]; then
        local db_size=$(du -h "${backup_dir}/database/full-backup.sql" | cut -f1)
        echo "✓ Database backup: ${db_size}"
    fi
    
    # Storage files
    local storage_count=0
    for bucket in "${STORAGE_BUCKETS[@]}"; do
        if [ -d "${backup_dir}/storage/${bucket}" ]; then
            local count=$(find "${backup_dir}/storage/${bucket}" -type f | wc -l | tr -d ' ')
            storage_count=$((storage_count + count))
            echo "✓ Storage bucket '${bucket}': ${count} files"
        fi
    done
    
    # Total size
    local total_size=$(du -sh "$backup_dir" | cut -f1)
    echo ""
    echo "Total backup size: ${total_size}"
    
    # Compressed size
    if [ -f "${backup_dir}.tar.gz" ]; then
        local compressed_size=$(du -h "${backup_dir}.tar.gz" | cut -f1)
        echo "Compressed size: ${compressed_size}"
    fi
}

# Run main function
main "$@"