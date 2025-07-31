#!/bin/bash
# Database backup functions for Supabase

# Backup full database using Supabase CLI (preferred method)
backup_database_full_cli() {
    local backup_dir=$1
    local output_file="${backup_dir}/database/full-backup.sql"
    local project_dir="../"
    
    log_info "Starting full database backup (CLI method)..."
    
    # Change to project directory for CLI commands
    cd "$project_dir" || return 1
    
    # Use supabase db dump with absolute path
    if supabase db dump --linked --file="$output_file" 2>/dev/null; then
        cd - >/dev/null
        
        if [ -f "$output_file" ]; then
            local size=$(du -h "$output_file" | cut -f1)
            log_success "Full database backup completed (${size}) [CLI]"
            return 0
        fi
    fi
    
    cd - >/dev/null
    log_warning "CLI backup method failed, trying alternative..."
    return 1
}

# Backup full database using pg_dump (fallback method)
backup_database_full_pgdump() {
    local backup_dir=$1
    local output_file="${backup_dir}/database/full-backup.sql"
    local connection=$(get_direct_db_connection)
    
    if [ -z "$connection" ]; then
        log_error "No database connection available"
        return 1
    fi
    
    log_info "Starting full database backup (pg_dump method)..."
    
    # Use pg_dump with comprehensive options
    pg_dump "$connection" \
        --verbose \
        --no-owner \
        --no-privileges \
        --no-tablespaces \
        --quote-all-identifiers \
        --exclude-schema='information_schema' \
        --exclude-schema='pg_*' \
        --file="$output_file" 2>&1 | while read -r line; do
            echo -en "\r${BLUE}[PROGRESS]${NC} $line"
        done
    
    echo # New line after progress
    
    if [ ${PIPESTATUS[0]} -eq 0 ] && [ -f "$output_file" ]; then
        local size=$(du -h "$output_file" | cut -f1)
        log_success "Full database backup completed (${size}) [pg_dump]"
        return 0
    else
        log_error "Full database backup failed"
        return 1
    fi
}

# Main full backup function with CLI preference
backup_database_full() {
    local backup_dir=$1
    
    # Try CLI method first if enabled
    if [ "$USE_CLI_METHODS" = "true" ]; then
        if backup_database_full_cli "$backup_dir"; then
            return 0
        fi
    fi
    
    # Fallback to pg_dump method
    backup_database_full_pgdump "$backup_dir"
}

# Backup schema only using CLI (preferred method)
backup_database_schema_cli() {
    local backup_dir=$1
    local output_file="${backup_dir}/database/schema-only.sql"
    local project_dir="../"
    
    log_info "Backing up database schema (CLI method)..."
    
    cd "$project_dir" || return 1
    
    # Use supabase db dump for schema only
    if supabase db dump --linked --file="$(basename "$backup_dir")/database/schema-only.sql" &>/dev/null; then
        if [ -f "$(basename "$backup_dir")/database/schema-only.sql" ]; then
            mv "$(basename "$backup_dir")/database/schema-only.sql" "$output_file"
        fi
        
        cd - >/dev/null
        
        if [ -f "$output_file" ]; then
            log_success "Schema backup completed [CLI]"
            return 0
        fi
    fi
    
    cd - >/dev/null
    return 1
}

# Backup schema only using pg_dump (fallback method)
backup_database_schema_pgdump() {
    local backup_dir=$1
    local output_file="${backup_dir}/database/schema-only.sql"
    local connection=$(get_direct_db_connection)
    
    if [ -z "$connection" ]; then
        return 1
    fi
    
    log_info "Backing up database schema (pg_dump method)..."
    
    pg_dump "$connection" \
        --schema-only \
        --no-owner \
        --no-privileges \
        --no-tablespaces \
        --quote-all-identifiers \
        --exclude-schema='information_schema' \
        --exclude-schema='pg_*' \
        --file="$output_file" 2>/dev/null
    
    if [ $? -eq 0 ] && [ -f "$output_file" ]; then
        log_success "Schema backup completed [pg_dump]"
        return 0
    else
        log_error "Schema backup failed"
        return 1
    fi
}

# Main schema backup function
backup_database_schema() {
    local backup_dir=$1
    
    # Try CLI method first if enabled
    if [ "$USE_CLI_METHODS" = "true" ]; then
        if backup_database_schema_cli "$backup_dir"; then
            return 0
        fi
    fi
    
    # Fallback to pg_dump method
    backup_database_schema_pgdump "$backup_dir"
}

# Backup data only using CLI (preferred method)
backup_database_data_cli() {
    local backup_dir=$1
    local output_file="${backup_dir}/database/data-only.sql"
    local project_dir="../"
    
    log_info "Backing up database data (CLI method)..."
    
    cd "$project_dir" || return 1
    
    # Use supabase db dump for data only
    if supabase db dump --linked --data-only --file="$(basename "$backup_dir")/database/data-only.sql" &>/dev/null; then
        if [ -f "$(basename "$backup_dir")/database/data-only.sql" ]; then
            mv "$(basename "$backup_dir")/database/data-only.sql" "$output_file"
        fi
        
        cd - >/dev/null
        
        if [ -f "$output_file" ]; then
            log_success "Data backup completed [CLI]"
            return 0
        fi
    fi
    
    cd - >/dev/null
    return 1
}

# Backup data only using pg_dump (fallback method)
backup_database_data_pgdump() {
    local backup_dir=$1
    local output_file="${backup_dir}/database/data-only.sql"
    local connection=$(get_direct_db_connection)
    
    if [ -z "$connection" ]; then
        return 1
    fi
    
    log_info "Backing up database data (pg_dump method)..."
    
    pg_dump "$connection" \
        --data-only \
        --no-owner \
        --no-privileges \
        --disable-triggers \
        --quote-all-identifiers \
        --exclude-schema='information_schema' \
        --exclude-schema='pg_*' \
        --file="$output_file" 2>/dev/null
    
    if [ $? -eq 0 ] && [ -f "$output_file" ]; then
        log_success "Data backup completed [pg_dump]"
        return 0
    else
        log_error "Data backup failed"
        return 1
    fi
}

# Main data backup function
backup_database_data() {
    local backup_dir=$1
    
    # Try CLI method first if enabled
    if [ "$USE_CLI_METHODS" = "true" ]; then
        if backup_database_data_cli "$backup_dir"; then
            return 0
        fi
    fi
    
    # Fallback to pg_dump method
    backup_database_data_pgdump "$backup_dir"
}

# Backup auth users separately with improved error handling
backup_auth_users() {
    local backup_dir=$1
    local output_file="${backup_dir}/database/auth-users.sql"
    local connection=$(get_db_connection)
    
    log_info "Backing up auth users..."
    
    if [ -z "$connection" ]; then
        log_warning "No database connection for auth backup"
        return 1
    fi
    
    # Create auth backup with better error handling
    cat > "$output_file" <<EOF
-- Supabase Auth Users Backup
-- Generated on: $(date)
-- Connection: $(echo "$connection" | sed 's/:[^@]*@/:***@/')

-- Auth Users Table Structure and Data
EOF
    
    # Try to backup auth.users table
    if timeout 60 psql "$connection" -c "
        \copy (
            SELECT 
                id,
                aud,
                role,
                email,
                email_confirmed_at,
                invited_at,
                last_sign_in_at,
                raw_app_meta_data,
                raw_user_meta_data,
                is_super_admin,
                created_at,
                updated_at,
                phone,
                phone_confirmed_at,
                is_sso_user,
                deleted_at
            FROM auth.users
            ORDER BY created_at
        ) TO STDOUT WITH (FORMAT CSV, HEADER TRUE, QUOTE '"', ESCAPE '"')
    " >> "$output_file" 2>/dev/null; then
        
        # Also try to backup user profiles if they exist
        echo "" >> "$output_file"
        echo "-- User Profiles (if exists)" >> "$output_file"
        
        timeout 30 psql "$connection" -c "
            \copy (
                SELECT 
                    up.*,
                    au.email as auth_email,
                    au.email_confirmed_at as auth_email_confirmed
                FROM public.user_profiles up
                LEFT JOIN auth.users au ON au.id = up.id
                ORDER BY up.created_at
            ) TO STDOUT WITH (FORMAT CSV, HEADER TRUE, QUOTE '"', ESCAPE '"')
        " >> "$output_file" 2>/dev/null
        
        log_success "Auth users backup completed"
        return 0
    else
        log_error "Auth users backup failed"
        echo "-- Backup failed at: $(date)" >> "$output_file"
        return 1
    fi
}

# Get table counts for verification (improved version)
backup_table_counts() {
    local backup_dir=$1
    local output_file="${backup_dir}/metadata/table-counts.json"
    
    log_info "Getting table counts..."
    
    # Try with API first if available
    if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_KEY" ]; then
        # Use Supabase REST API to get table information
        local response=$(curl -s -X GET \
            "${SUPABASE_URL}/rest/v1/" \
            -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
            -H "Content-Type: application/json" 2>/dev/null)
        
        if echo "$response" | jq empty 2>/dev/null; then
            echo "$response" | jq '.definitions | keys' > "$output_file" 2>/dev/null
            if [ $? -eq 0 ]; then
                log_success "Table information saved via API"
                return 0
            fi
        fi
    fi
    
    # Fallback to direct database query
    local connection=$(get_db_connection)
    if [ -n "$connection" ]; then
        timeout 30 psql "$connection" -t -A -c "
            SELECT json_object_agg(
                schemaname || '.' || tablename,
                COALESCE(n_live_tup, 0)
            )
            FROM pg_stat_user_tables
            WHERE schemaname IN ('public', 'auth', 'storage')
                AND schemaname NOT LIKE 'pg_%'
                AND schemaname != 'information_schema'
        " > "$output_file" 2>/dev/null
        
        if [ $? -eq 0 ] && [ -s "$output_file" ]; then
            log_success "Table counts saved"
            return 0
        fi
    fi
    
    log_warning "Could not get table counts"
    echo '{}' > "$output_file"
    return 1
}

# Save migration status (improved with better error handling)
backup_migration_status() {
    local backup_dir=$1
    local output_file="${backup_dir}/metadata/migration-status.txt"
    local project_dir="../"
    
    log_info "Saving migration status..."
    
    # Try Supabase CLI first
    if command -v supabase &> /dev/null; then
        cd "$project_dir" || return 1
        
        # Get migration list with better error handling
        local migration_output=$(supabase migration list 2>&1)
        local exit_code=$?
        
        cd - >/dev/null
        
        if [ $exit_code -eq 0 ]; then
            echo "$migration_output" > "$output_file"
            log_success "Migration status saved via CLI"
            return 0
        else
            log_warning "CLI migration list failed: $migration_output"
        fi
    fi
    
    # Fallback: query migration table directly
    local connection=$(get_db_connection)
    if [ -n "$connection" ]; then
        timeout 30 psql "$connection" -c "
            SELECT 'Migration Status from Database:' as info;
            SELECT version, name, statements 
            FROM supabase_migrations.schema_migrations 
            ORDER BY version;
        " > "$output_file" 2>&1
        
        if [ $? -eq 0 ]; then
            log_success "Migration status saved from database"
            return 0
        fi
    fi
    
    # If all fails, create a basic status file
    log_warning "Could not get migration status"
    cat > "$output_file" <<EOF
Migration Status: Unable to retrieve
Timestamp: $(date)
Reason: CLI unavailable and database query failed
EOF
    return 1
}

# Enhanced database backup verification
verify_database_backup() {
    local backup_dir=$1
    local errors=0
    
    log_info "Verifying database backup..."
    
    # Check full backup
    if [ -f "${backup_dir}/database/full-backup.sql" ]; then
        local lines=$(wc -l < "${backup_dir}/database/full-backup.sql" 2>/dev/null || echo "0")
        local size=$(stat -f%z "${backup_dir}/database/full-backup.sql" 2>/dev/null || stat -c%s "${backup_dir}/database/full-backup.sql" 2>/dev/null || echo "0")
        
        if [ "$lines" -lt 50 ] || [ "$size" -lt 1000 ]; then
            log_error "Full backup seems too small (${lines} lines, ${size} bytes)"
            ((errors++))
        else
            # Check for SQL syntax errors
            if grep -q "ERROR:\|FATAL:" "${backup_dir}/database/full-backup.sql" 2>/dev/null; then
                log_warning "Backup contains error messages - please review"
            else
                log_success "Full backup verified (${lines} lines, $(du -h "${backup_dir}/database/full-backup.sql" | cut -f1))"
            fi
        fi
    else
        log_error "Full backup file not found"
        ((errors++))
    fi
    
    # Check other backup files
    local backup_files=("schema-only.sql" "data-only.sql" "auth-users.sql")
    for file in "${backup_files[@]}"; do
        if [ -f "${backup_dir}/database/${file}" ]; then
            log_success "Found ${file}"
        else
            log_warning "Missing ${file} (non-critical)"
        fi
    done
    
    return $errors
}

# Main database backup function with improved error handling
backup_database() {
    local backup_dir=$1
    local critical_failures=0
    
    log_info "Starting database backup process..."
    
    # Full backup (most important) - this must succeed
    if ! backup_database_full "$backup_dir"; then
        log_error "Critical: Full database backup failed"
        return 1
    fi
    
    # Additional backups (nice to have) - failures are non-critical
    if ! backup_database_schema "$backup_dir"; then
        log_warning "Schema-only backup failed (non-critical)"
    fi
    
    if ! backup_database_data "$backup_dir"; then
        log_warning "Data-only backup failed (non-critical)"
    fi
    
    if ! backup_auth_users "$backup_dir"; then
        log_warning "Auth users backup failed (non-critical)"
    fi
    
    # Metadata collection
    backup_table_counts "$backup_dir"
    backup_migration_status "$backup_dir"
    
    # Verify the backup
    if ! verify_database_backup "$backup_dir"; then
        log_warning "Backup verification found issues (but backup may still be usable)"
    fi
    
    log_success "Database backup process completed"
    return 0
}