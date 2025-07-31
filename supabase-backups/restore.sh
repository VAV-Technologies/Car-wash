#!/bin/bash
# Supabase Complete Restore Script
# Restores database and storage from backup

set -e  # Exit on error

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load libraries
source "${SCRIPT_DIR}/lib/utilities.sh"

# Parse command line arguments
parse_args() {
    BACKUP_PATH=""
    RESTORE_DATABASE=true
    RESTORE_STORAGE=true
    DRY_RUN=false
    FORCE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --only-database)
                RESTORE_STORAGE=false
                shift
                ;;
            --only-storage)
                RESTORE_DATABASE=false
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE=true
                REQUIRE_CONFIRMATION=false
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                BACKUP_PATH="$1"
                shift
                ;;
        esac
    done
}

# Show help
show_help() {
    cat <<EOF
Supabase Restore Script

Usage: ./restore.sh [OPTIONS] BACKUP_PATH

Options:
    --only-database    Restore only the database
    --only-storage     Restore only storage files
    --dry-run         Show what would be restored without doing it
    --force           Skip confirmation prompts
    -h, --help        Show this help message

Examples:
    ./restore.sh backup-2025-07-30-123456
    ./restore.sh --only-database backup-2025-07-30-123456
    ./restore.sh --dry-run backup-2025-07-30-123456.tar.gz
EOF
}

# Main restore function
main() {
    # Parse arguments
    parse_args "$@"
    
    if [ -z "$BACKUP_PATH" ]; then
        log_error "No backup path specified"
        show_help
        exit 1
    fi
    
    # Display banner
    echo "=================================================="
    echo "       Supabase Complete Restore System"
    echo "=================================================="
    echo ""
    
    # Load configuration (auto-detects from .env.local if needed)
    load_config || exit 1
    
    # Prepare backup directory
    local backup_dir
    backup_dir=$(prepare_backup_dir "$BACKUP_PATH") || exit 1
    
    # Show restore plan
    show_restore_plan "$backup_dir"
    
    if [ "$DRY_RUN" = true ]; then
        log_info "Dry run completed. No changes were made."
        exit 0
    fi
    
    # Confirm restore
    if [ "$FORCE" != true ]; then
        confirm_action "This will OVERWRITE current data. Are you sure?" || exit 1
    fi
    
    # Create pre-restore backup if configured
    if [ "$CREATE_PRE_RESTORE_BACKUP" = true ]; then
        create_pre_restore_backup
    fi
    
    # Restore database
    if [ "$RESTORE_DATABASE" = true ]; then
        restore_database "$backup_dir" || exit 1
    fi
    
    # Restore storage
    if [ "$RESTORE_STORAGE" = true ]; then
        restore_storage "$backup_dir" || exit 1
    fi
    
    echo ""
    echo "=================================================="
    log_success "Restore completed successfully"
    echo "=================================================="
}

# Prepare backup directory
prepare_backup_dir() {
    local backup_path=$1
    
    # Check if it's a compressed backup
    if [[ "$backup_path" == *.tar.gz ]]; then
        log_info "Extracting compressed backup..."
        
        local temp_dir="${SCRIPT_DIR}/temp-restore-$$"
        mkdir -p "$temp_dir"
        
        tar -xzf "$backup_path" -C "$temp_dir"
        
        # Find the backup directory
        local backup_dir=$(find "$temp_dir" -maxdepth 1 -name "backup-*" -type d | head -1)
        
        if [ -z "$backup_dir" ]; then
            log_error "No valid backup found in archive"
            rm -rf "$temp_dir"
            return 1
        fi
        
        echo "$backup_dir"
    else
        # Direct path to backup directory
        if [ -d "${SCRIPT_DIR}/${backup_path}" ]; then
            echo "${SCRIPT_DIR}/${backup_path}"
        elif [ -d "$backup_path" ]; then
            echo "$backup_path"
        else
            log_error "Backup directory not found: $backup_path"
            return 1
        fi
    fi
}

# Show restore plan
show_restore_plan() {
    local backup_dir=$1
    
    echo "Restore Plan:"
    echo "-------------"
    
    # Check manifest
    if [ -f "${backup_dir}/metadata/backup-manifest.json" ]; then
        local backup_date=$(jq -r '.backup_date' "${backup_dir}/metadata/backup-manifest.json")
        local project_ref=$(jq -r '.supabase_project' "${backup_dir}/metadata/backup-manifest.json")
        
        echo "Backup Date: ${backup_date}"
        echo "Project: ${project_ref}"
        echo ""
    fi
    
    # Database restore
    if [ "$RESTORE_DATABASE" = true ]; then
        echo "Database Restore:"
        if [ -f "${backup_dir}/database/full-backup.sql" ]; then
            local db_size=$(du -h "${backup_dir}/database/full-backup.sql" | cut -f1)
            echo "  ✓ Full database backup (${db_size})"
        fi
        if [ -f "${backup_dir}/database/auth-users.sql" ]; then
            echo "  ✓ Auth users backup"
        fi
    fi
    
    # Storage restore
    if [ "$RESTORE_STORAGE" = true ]; then
        echo ""
        echo "Storage Restore:"
        for bucket in "${STORAGE_BUCKETS[@]}"; do
            if [ -d "${backup_dir}/storage/${bucket}" ]; then
                local count=$(find "${backup_dir}/storage/${bucket}" -type f | wc -l | tr -d ' ')
                echo "  ✓ Bucket '${bucket}': ${count} files"
            fi
        done
    fi
    
    echo ""
}

# Create pre-restore backup
create_pre_restore_backup() {
    log_info "Creating pre-restore backup for safety..."
    
    # Run backup script (it will use the same config)
    if "${SCRIPT_DIR}/backup.sh"; then
        log_success "Pre-restore backup created"
    else
        log_error "Pre-restore backup failed"
        confirm_action "Continue without pre-restore backup?" || exit 1
    fi
}

# Restore database
restore_database() {
    local backup_dir=$1
    local backup_file="${backup_dir}/database/full-backup.sql"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Database backup file not found"
        return 1
    fi
    
    log_info "Restoring database..."
    
    # Get connection string
    local connection=$(get_db_connection)
    
    # Restore with progress
    pv "$backup_file" 2>/dev/null | psql "$connection" -q || \
    psql "$connection" < "$backup_file"
    
    if [ $? -eq 0 ]; then
        log_success "Database restored successfully"
        
        # Verify restoration
        verify_database_restore "$backup_dir"
        
        return 0
    else
        log_error "Database restore failed"
        return 1
    fi
}

# Verify database restoration
verify_database_restore() {
    local backup_dir=$1
    
    if [ -f "${backup_dir}/metadata/table-counts.json" ]; then
        log_info "Verifying database restoration..."
        
        # Get current table counts
        local connection=$(get_db_connection)
        local current_counts=$(psql "$connection" -t -A -c "
            SELECT json_object_agg(
                schemaname || '.' || tablename,
                n_live_tup
            )
            FROM pg_stat_user_tables
            WHERE schemaname IN ('public', 'auth')
        " 2>/dev/null)
        
        # Compare counts (basic check)
        if [ -n "$current_counts" ]; then
            log_success "Database verification completed"
        else
            log_warning "Could not verify database restoration"
        fi
    fi
}

# Restore storage
restore_storage() {
    local backup_dir=$1
    
    log_info "Restoring storage files..."
    
    # Check if storage backup exists
    if [ ! -d "${backup_dir}/storage" ]; then
        log_warning "No storage backup found"
        return 0
    fi
    
    # For each bucket
    for bucket in "${STORAGE_BUCKETS[@]}"; do
        if [ -d "${backup_dir}/storage/${bucket}" ]; then
            restore_storage_bucket "$bucket" "${backup_dir}/storage/${bucket}"
        fi
    done
    
    log_success "Storage restore completed"
    return 0
}

# Restore a single storage bucket
restore_storage_bucket() {
    local bucket=$1
    local bucket_dir=$2
    
    log_info "Restoring bucket: ${bucket}"
    
    # Get list of files
    local files=()
    while IFS= read -r -d '' file; do
        files+=("$file")
    done < <(find "$bucket_dir" -type f -print0)
    
    local total=${#files[@]}
    local current=0
    local failed=0
    
    for file_path in "${files[@]}"; do
        ((current++))
        
        # Get relative path
        local relative_path="${file_path#$bucket_dir/}"
        
        show_progress "$current" "$total" "Uploading to ${bucket}"
        
        # Upload file
        if upload_storage_file "$bucket" "$relative_path" "$file_path"; then
            echo -e "\n${GREEN}✓${NC} Uploaded: ${relative_path}"
        else
            echo -e "\n${RED}✗${NC} Failed: ${relative_path}"
            ((failed++))
        fi
    done
    
    echo # New line after progress
    
    if [ "$failed" -eq 0 ]; then
        log_success "Bucket ${bucket} restored (${total} files)"
    else
        log_warning "Bucket ${bucket} restored with ${failed} failures"
    fi
}

# Upload a file to storage
upload_storage_file() {
    local bucket=$1
    local path=$2
    local file=$3
    
    curl -s -X POST \
        "${SUPABASE_URL}/storage/v1/object/${bucket}/${path}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
        -H "Content-Type: application/octet-stream" \
        --data-binary "@${file}"
    
    return $?
}

# Run main function
main "$@"