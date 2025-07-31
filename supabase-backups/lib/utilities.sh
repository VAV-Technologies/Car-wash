#!/bin/bash
# Utility functions for Supabase backup system

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Progress indicator
show_progress() {
    local current=$1
    local total=$2
    local prefix=$3
    local percent=$((current * 100 / total))
    local filled=$((percent / 2))
    
    printf "\r${prefix} ["
    printf "%${filled}s" | tr ' ' '='
    printf "%$((50 - filled))s" | tr ' ' '-'
    printf "] ${percent}%% (${current}/${total})"
}

# Check Supabase CLI version and suggest updates
check_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI is not installed"
        log_info "Install with: brew install supabase/tap/supabase"
        log_info "Or visit: https://supabase.com/docs/guides/cli/getting-started"
        return 1
    fi
    
    local current_version=$(supabase --version 2>/dev/null | head -1)
    log_info "Supabase CLI: $current_version"
    
    # Check if there's a newer version available (basic check)
    local version_check=$(supabase --version 2>&1 | grep -i "new version" || true)
    if [ -n "$version_check" ]; then
        log_warning "A newer version of Supabase CLI is available"
        log_info "Update with: brew upgrade supabase/tap/supabase"
        echo
    fi
    
    return 0
}

# Check if required tools are installed
check_dependencies() {
    local deps=("curl" "jq" "tar")
    local optional_deps=("pg_dump" "psql")
    local missing=()
    local missing_optional=()
    
    # Check required dependencies
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
    
    # Check optional dependencies (for fallback methods)
    for dep in "${optional_deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_optional+=("$dep")
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing[*]}"
        log_info "Install with: brew install curl jq"
        return 1
    fi
    
    if [ ${#missing_optional[@]} -ne 0 ]; then
        log_warning "Missing optional tools: ${missing_optional[*]}"
        log_info "Install with: brew install postgresql"
        log_info "These are needed for fallback database backup methods"
    fi
    
    # Check Supabase CLI
    check_supabase_cli || return 1
    
    return 0
}

# Create backup directory with timestamp
create_backup_dir() {
    local timestamp=$(date +"%Y-%m-%d-%H%M%S")
    local backup_dir="${BACKUP_DIR}/backup-${timestamp}"
    
    mkdir -p "${backup_dir}"/{database,storage,metadata,restore-scripts}
    echo "$backup_dir"
}

# Load configuration with auto-detection
load_config() {
    local config_file="${1:-config.env}"
    
    # Try to load existing config
    if [ -f "$config_file" ]; then
        source "$config_file"
    else
        log_info "No config.env found. Auto-configuring from .env.local..."
        auto_configure_from_env || return 1
    fi
    
    # Validate and prompt for missing values
    validate_and_fix_config || return 1
    
    return 0
}

# Check if project is linked to Supabase
check_project_link() {
    local project_dir="../"
    
    if [ -f "${project_dir}/.linked" ]; then
        local linked_project=$(cat "${project_dir}/.linked" 2>/dev/null)
        if [ -n "$linked_project" ]; then
            log_info "Project linked to: $linked_project"
            SUPABASE_PROJECT_REF="$linked_project"
            return 0
        fi
    fi
    
    return 1
}

# Auto-configure from various sources
auto_configure_from_env() {
    local env_file="../.env.local"
    local project_dir="../"
    
    # First, try to use linked project
    if check_project_link; then
        log_info "Using linked Supabase project"
        # Still need to get credentials from env file
    fi
    
    if [ ! -f "$env_file" ]; then
        log_error "No config.env found and no .env.local in parent directory"
        log_info "Please create config.env with your Supabase credentials"
        log_info "Or run 'supabase link' in your project directory"
        return 1
    fi
    
    # Extract values from .env.local
    REMOTE_SUPABASE_URL=$(grep "^REMOTE_SUPABASE_URL=" "$env_file" | cut -d'=' -f2- | tr -d '"\047')
    REMOTE_SUPABASE_SERVICE_KEY=$(grep "^REMOTE_SUPABASE_SERVICE_KEY=" "$env_file" | cut -d'=' -f2- | tr -d '"\047')
    
    # Also try alternative naming patterns
    if [ -z "$REMOTE_SUPABASE_URL" ]; then
        REMOTE_SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$env_file" | cut -d'=' -f2- | tr -d '"\047')
    fi
    
    if [ -z "$REMOTE_SUPABASE_SERVICE_KEY" ]; then
        REMOTE_SUPABASE_SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" "$env_file" | cut -d'=' -f2- | tr -d '"\047')
    fi
    
    if [ -z "$REMOTE_SUPABASE_URL" ] || [ -z "$REMOTE_SUPABASE_SERVICE_KEY" ]; then
        log_error "Could not extract Supabase credentials from .env.local"
        log_info "Expected variables: REMOTE_SUPABASE_URL and REMOTE_SUPABASE_SERVICE_KEY"
        log_info "Or: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
        return 1
    fi
    
    # Set global variables
    SUPABASE_URL="$REMOTE_SUPABASE_URL"
    SUPABASE_SERVICE_KEY="$REMOTE_SUPABASE_SERVICE_KEY"
    
    # Extract project ref if not already set
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        SUPABASE_PROJECT_REF=$(echo "$REMOTE_SUPABASE_URL" | sed -n 's|https://\([^.]*\)\.supabase\.co.*|\1|p')
    fi
    
    # Auto-detect storage buckets from project if possible
    detect_storage_buckets
    
    # Set default backup settings
    BACKUP_DIR="${BACKUP_DIR:-$HOME/supabase-backups}"
    BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
    COMPRESS_BACKUPS="${COMPRESS_BACKUPS:-true}"
    VERIFY_AFTER_BACKUP="${VERIFY_AFTER_BACKUP:-true}"
    REQUIRE_CONFIRMATION="${REQUIRE_CONFIRMATION:-true}"
    CREATE_PRE_RESTORE_BACKUP="${CREATE_PRE_RESTORE_BACKUP:-true}"
    USE_CLI_METHODS="${USE_CLI_METHODS:-true}"
    
    log_info "Backup method preference: $([ "$USE_CLI_METHODS" = "true" ] && echo "CLI + Fallback" || echo "Direct Connection Only")"
    
    log_success "Auto-configured from .env.local (Project: $SUPABASE_PROJECT_REF)"
    return 0
}

# Auto-detect storage buckets from Supabase project
detect_storage_buckets() {
    log_info "Auto-detecting storage buckets..."
    
    local response=$(curl -s -X GET \
        "${SUPABASE_URL}/storage/v1/bucket" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
        -H "apikey: ${SUPABASE_SERVICE_KEY}" \
        -H "Content-Type: application/json" \
        --max-time 30 2>/dev/null)
    
    if echo "$response" | jq empty 2>/dev/null; then
        # Check for error response
        if echo "$response" | jq -e '.error' >/dev/null 2>&1; then
            local error_msg=$(echo "$response" | jq -r '.error // "Unknown error"')
            log_warning "Storage API error: $error_msg"
        else
            local buckets=()
            while IFS= read -r bucket; do
                [ -n "$bucket" ] && buckets+=("$bucket")
            done < <(echo "$response" | jq -r '.[] | .name' 2>/dev/null)
            
            if [ ${#buckets[@]} -gt 0 ]; then
                STORAGE_BUCKETS=("${buckets[@]}")
                log_success "Detected ${#buckets[@]} storage buckets: ${buckets[*]}"
            else
                log_info "No storage buckets found in project"
                STORAGE_BUCKETS=()
            fi
            return 0
        fi
    else
        log_warning "Invalid response from storage API"
    fi
    
    # Fallback to empty buckets array if detection fails
    log_info "Using empty bucket list (can be configured manually)"
    STORAGE_BUCKETS=()
}

# Validate configuration and fix missing values
validate_and_fix_config() {
    # Check Supabase credentials
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
        log_error "Supabase credentials not configured"
        return 1
    fi
    
    # Test Supabase API connection
    if ! test_supabase_connection; then
        log_error "Cannot connect to Supabase API"
        return 1
    fi
    
    # Check if we should use CLI methods
    if [ "$USE_CLI_METHODS" = "true" ]; then
        if ! setup_cli_backup; then
            log_warning "CLI backup setup failed, will use fallback methods"
            USE_CLI_METHODS="false"
        fi
    fi
    
    # Set up database connection for fallback methods
    if [ "$USE_CLI_METHODS" != "true" ]; then
        if [ -z "$DB_CONNECTION_STRING" ] && [ -z "$DB_HOST" ]; then
            prompt_for_database_password || return 1
        fi
    fi
    
    # Save config for future use
    save_config_file
    
    return 0
}

# URL encode password
url_encode_password() {
    local password="$1"
    # Basic URL encoding for common special characters
    password="${password//@/%40}"    # @ -> %40
    password="${password//&/%26}"    # & -> %26
    password="${password//#/%23}"    # # -> %23
    password="${password//?/%3F}"    # ? -> %3F
    password="${password// /%20}"    # space -> %20
    password="${password//+/%2B}"    # + -> %2B
    password="${password//=/%3D}"    # = -> %3D
    echo "$password"
}

# Prompt for database password
prompt_for_database_password() {
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        log_error "Project reference not found"
        return 1
    fi
    
    echo ""
    log_info "Database password required for fallback backup methods"
    echo "Get it from: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/settings/database"
    echo ""
    
    read -sp "Enter database password: " db_password
    echo ""
    
    if [ -z "$db_password" ]; then
        log_error "Database password cannot be empty"
        return 1
    fi
    
    # Store password for connection string generation
    DB_PASSWORD="$db_password"
    
    # URL encode the password
    local encoded_password=$(url_encode_password "$db_password")
    
    # Try multiple connection string formats with SSL
    local connection_strings=(
        "postgres://postgres:${encoded_password}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres?sslmode=require"
        "postgres://postgres.${SUPABASE_PROJECT_REF}:${encoded_password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
        "postgres://postgres.${SUPABASE_PROJECT_REF}:${encoded_password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
    )
    
    log_info "Testing database connection..."
    
    for i in "${!connection_strings[@]}"; do
        local conn_str="${connection_strings[$i]}"
        local masked_conn=$(echo "$conn_str" | sed 's/:'"$encoded_password"'@/:***@/')
        
        log_info "Trying connection format $((i+1)): $masked_conn"
        
        # Test connection with timeout and proper error handling
        local error_output=$(timeout 30 psql "$conn_str" -c "SELECT 1;" 2>&1)
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            log_success "Database connection successful with format $((i+1))"
            DB_CONNECTION_STRING="$conn_str"
            return 0
        else
            # Categorize common errors
            if echo "$error_output" | grep -q "password authentication failed"; then
                log_warning "Connection format $((i+1)) failed: Invalid password"
            elif echo "$error_output" | grep -q "could not connect\|Connection refused"; then
                log_warning "Connection format $((i+1)) failed: Connection refused"
            elif echo "$error_output" | grep -q "Tenant or user not found"; then
                log_warning "Connection format $((i+1)) failed: Tenant/user not found (pooler issue)"
            else
                log_warning "Connection format $((i+1)) failed: $error_output"
            fi
        fi
    done
    
    # If all formats failed, show detailed help
    echo ""
    log_error "All connection formats failed. Troubleshooting steps:"
    echo "1. Verify password: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/settings/database"
    echo "2. Check IP restrictions: Supabase Dashboard > Settings > Database > Network restrictions"
    echo "3. Try using Session mode connection string from the dashboard"
    echo "4. Ensure your project is not paused or suspended"
    echo ""
    
    read -p "Would you like to enter a custom connection string instead? (y/n): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Enter the full connection string from your Supabase dashboard:"
        read -r custom_conn_string
        
        if [ -n "$custom_conn_string" ]; then
            # Ensure SSL mode in custom connection string
            if [[ "$custom_conn_string" != *"sslmode="* ]]; then
                if [[ "$custom_conn_string" == *"?"* ]]; then
                    custom_conn_string="${custom_conn_string}&sslmode=require"
                else
                    custom_conn_string="${custom_conn_string}?sslmode=require"
                fi
            fi
            
            log_info "Testing custom connection string..."
            local custom_error=$(timeout 30 psql "$custom_conn_string" -c "SELECT 1;" 2>&1)
            
            if [ $? -eq 0 ]; then
                log_success "Custom connection string works!"
                DB_CONNECTION_STRING="$custom_conn_string"
                return 0
            else
                log_error "Custom connection string failed: $custom_error"
            fi
        fi
    fi
    
    return 1
}

# Test Supabase API connection
test_supabase_connection() {
    log_info "Testing Supabase API connection..."
    
    local response=$(curl -s -X GET \
        "${SUPABASE_URL}/rest/v1/" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
        -H "apikey: ${SUPABASE_SERVICE_KEY}" \
        -H "Content-Type: application/json" \
        --max-time 10 2>/dev/null)
    
    local curl_exit_code=$?
    
    if [ $curl_exit_code -ne 0 ]; then
        log_error "Network error connecting to Supabase API (curl exit code: $curl_exit_code)"
        log_info "Please check your internet connection and SUPABASE_URL"
        return 1
    fi
    
    # Check for successful API response (should contain swagger/openapi info)
    if echo "$response" | grep -q "swagger\|openapi\|paths\|definitions" 2>/dev/null; then
        log_success "Supabase API connection successful"
        return 0
    else
        # Check for common error patterns
        if echo "$response" | grep -q "No API key found" 2>/dev/null; then
            log_error "API key error - service key may be invalid"
        elif echo "$response" | grep -q "Invalid API key" 2>/dev/null; then
            log_error "Invalid service key - please check SUPABASE_SERVICE_KEY"
        elif echo "$response" | grep -q "Project not found\|404" 2>/dev/null; then
            log_error "Project not found - please check SUPABASE_URL"
        else
            log_error "Supabase API connection failed"
            log_info "Response: ${response:0:200}$([ ${#response} -gt 200 ] && echo '...')"
        fi
        
        log_info "Please verify your SUPABASE_URL and SUPABASE_SERVICE_KEY"
        return 1
    fi
}

# Setup CLI-based backup methods
setup_cli_backup() {
    local project_dir="../"
    
    # Check if we're in a Supabase project directory
    if [ ! -f "${project_dir}/supabase/config.toml" ]; then
        log_warning "Not in a Supabase project directory"
        return 1
    fi
    
    # Check if project is linked
    cd "$project_dir" || return 1
    
    # Check if the project is already linked
    if ls .linked &>/dev/null 2>&1; then
        local linked_project=$(cat .linked 2>/dev/null || echo "")
        if [ "$linked_project" = "$SUPABASE_PROJECT_REF" ]; then
            cd - >/dev/null
            log_success "CLI backup methods ready (already linked)"
            return 0
        fi
    fi
    
    # Try to check if we can use supabase commands with the linked project
    if supabase db dump --help &>/dev/null; then
        cd - >/dev/null
        log_success "CLI backup methods ready"
        return 0
    else
        log_warning "Supabase CLI not working properly"
        cd - >/dev/null
        return 1
    fi
}

# Save configuration to file
save_config_file() {
    local config_file="config.env"
    
    cat > "$config_file" <<EOF
# Supabase Backup System Configuration
# Auto-generated on: $(date)

# Backup Method Selection
USE_CLI_METHODS=${USE_CLI_METHODS}

# Database Connection (for fallback methods)
DB_CONNECTION_STRING="${DB_CONNECTION_STRING}"

# Supabase Project Details
SUPABASE_PROJECT_REF="${SUPABASE_PROJECT_REF}"
SUPABASE_URL="${SUPABASE_URL}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY}"

# Storage Buckets to Backup (auto-detected)
STORAGE_BUCKETS=($(printf '"%s" ' "${STORAGE_BUCKETS[@]}"))

# Backup Settings
BACKUP_DIR="${BACKUP_DIR}"
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS}
COMPRESS_BACKUPS=${COMPRESS_BACKUPS}
VERIFY_AFTER_BACKUP=${VERIFY_AFTER_BACKUP}

# Safety Settings
REQUIRE_CONFIRMATION=${REQUIRE_CONFIRMATION}
CREATE_PRE_RESTORE_BACKUP=${CREATE_PRE_RESTORE_BACKUP}
EOF
    
    log_success "Configuration saved to $config_file"
}

# Get database connection string with SSL
get_db_connection() {
    local connection_string
    
    if [ -n "$DB_CONNECTION_STRING" ]; then
        connection_string="$DB_CONNECTION_STRING"
    else
        connection_string="postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    fi
    
    # Ensure SSL mode is specified
    if [[ "$connection_string" != *"sslmode="* ]]; then
        if [[ "$connection_string" == *"?"* ]]; then
            connection_string="${connection_string}&sslmode=require"
        else
            connection_string="${connection_string}?sslmode=require"
        fi
    fi
    
    echo "$connection_string"
}

# Get direct database connection (not pooler) for dumps
get_direct_db_connection() {
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        log_error "Project reference not available"
        return 1
    fi
    
    local encoded_password=$(url_encode_password "$DB_PASSWORD")
    
    # Use direct database connection for dumps
    echo "postgres://postgres:${encoded_password}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres?sslmode=require"
}

# Comprehensive backup integrity verification
verify_backup() {
    local backup_dir=$1
    local errors=0
    local warnings=0
    
    if [ ! -d "$backup_dir" ]; then
        log_error "Backup directory does not exist: $backup_dir"
        return 1
    fi
    
    log_info "Verifying backup integrity..."
    echo "Backup Verification Report"
    echo "=========================="
    
    # Check directory structure
    local required_dirs=("database" "storage" "metadata" "restore-scripts")
    for dir in "${required_dirs[@]}"; do
        if [ -d "${backup_dir}/${dir}" ]; then
            log_success "✓ Directory structure: ${dir}/"
        else
            log_warning "⚠ Missing directory: ${dir}/"
            ((warnings++))
        fi
    done
    
    echo ""
    echo "Database Backup Verification:"
    echo "-----------------------------"
    
    # Check database backup files
    local db_files=("full-backup.sql" "schema-only.sql" "data-only.sql" "auth-users.sql")
    local critical_db_files=("full-backup.sql")
    
    for file in "${db_files[@]}"; do
        local file_path="${backup_dir}/database/${file}"
        if [ -f "$file_path" ]; then
            local lines=$(wc -l < "$file_path" 2>/dev/null || echo "0")
            local size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "0")
            local size_human=$(du -h "$file_path" | cut -f1)
            
            # Check for critical issues
            if [ "$size" -lt 1000 ]; then
                if [[ " ${critical_db_files[@]} " =~ " ${file} " ]]; then
                    log_error "✗ ${file}: Too small (${size} bytes) - CRITICAL"
                    ((errors++))
                else
                    log_warning "⚠ ${file}: Very small (${size} bytes)"
                    ((warnings++))
                fi
            elif [ "$lines" -lt 10 ]; then
                log_warning "⚠ ${file}: Few lines (${lines})"
                ((warnings++))
            else
                # Check for SQL errors in the file
                local error_count=$(grep -c "ERROR:\|FATAL:\|could not" "$file_path" 2>/dev/null || echo "0")
                if [ "$error_count" -gt 0 ]; then
                    log_warning "⚠ ${file}: Contains ${error_count} error messages"
                    ((warnings++))
                else
                    log_success "✓ ${file}: Valid (${lines} lines, ${size_human})"
                fi
            fi
        else
            if [[ " ${critical_db_files[@]} " =~ " ${file} " ]]; then
                log_error "✗ Missing critical file: ${file}"
                ((errors++))
            else
                log_warning "⚠ Missing optional file: ${file}"
                ((warnings++))
            fi
        fi
    done
    
    echo ""
    echo "Storage Backup Verification:"
    echo "---------------------------"
    
    # Check storage backups
    local storage_inventory="${backup_dir}/metadata/storage-inventory.json"
    if [ -f "$storage_inventory" ]; then
        if command -v jq &> /dev/null; then
            local total_buckets=$(jq -r '.summary.total_buckets_configured // 0' "$storage_inventory" 2>/dev/null || echo "0")
            local successful_buckets=$(jq -r '.summary.successful_buckets // 0' "$storage_inventory" 2>/dev/null || echo "0")
            local total_files=$(jq -r '.summary.total_files_backed_up // 0' "$storage_inventory" 2>/dev/null || echo "0")
            local total_size=$(jq -r '.summary.total_size_human // "0B"' "$storage_inventory" 2>/dev/null || echo "0B")
            
            if [ "$successful_buckets" -eq "$total_buckets" ] && [ "$total_buckets" -gt 0 ]; then
                log_success "✓ Storage: ${successful_buckets}/${total_buckets} buckets, ${total_files} files (${total_size})"
            elif [ "$successful_buckets" -gt 0 ]; then
                log_warning "⚠ Storage: ${successful_buckets}/${total_buckets} buckets successful, ${total_files} files (${total_size})"
                ((warnings++))
            elif [ "$total_buckets" -eq 0 ]; then
                log_info "ℹ Storage: No buckets configured"
            else
                log_error "✗ Storage: No buckets backed up successfully"
                ((errors++))
            fi
        else
            log_success "✓ Storage inventory found (jq not available for detailed analysis)"
        fi
    else
        log_warning "⚠ Storage inventory missing"
        ((warnings++))
    fi
    
    echo ""
    echo "Metadata Verification:"
    echo "---------------------"
    
    # Check metadata files
    local metadata_files=("backup-manifest.json" "migration-status.txt" "table-counts.json")
    for file in "${metadata_files[@]}"; do
        local file_path="${backup_dir}/metadata/${file}"
        if [ -f "$file_path" ]; then
            local size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "0")
            if [ "$size" -gt 10 ]; then
                log_success "✓ ${file}: Present ($(du -h "$file_path" | cut -f1))"
            else
                log_warning "⚠ ${file}: Very small (${size} bytes)"
                ((warnings++))
            fi
        else
            log_warning "⚠ Missing metadata: ${file}"
            ((warnings++))
        fi
    done
    
    # Check restore scripts
    local restore_scripts=("restore-database.sh" "restore-storage.sh")
    for script in "${restore_scripts[@]}"; do
        local script_path="${backup_dir}/restore-scripts/${script}"
        if [ -f "$script_path" ] && [ -x "$script_path" ]; then
            log_success "✓ Restore script: ${script}"
        else
            log_warning "⚠ Missing or non-executable restore script: ${script}"
            ((warnings++))
        fi
    done
    
    echo ""
    echo "Backup Integrity Summary:"
    echo "========================"
    
    local total_size=$(du -sh "$backup_dir" 2>/dev/null | cut -f1 || echo "unknown")
    echo "Backup location: $backup_dir"
    echo "Total backup size: $total_size"
    echo "Errors: $errors"
    echo "Warnings: $warnings"
    
    if [ $errors -eq 0 ]; then
        if [ $warnings -eq 0 ]; then
            log_success "✓ Backup verification completed successfully - no issues found"
        else
            log_warning "⚠ Backup verification completed with $warnings warnings"
        fi
        return 0
    else
        log_error "✗ Backup verification failed with $errors critical errors and $warnings warnings"
        return $errors
    fi
}

# Create backup manifest
create_manifest() {
    local backup_dir=$1
    local manifest_file="${backup_dir}/metadata/backup-manifest.json"
    
    cat > "$manifest_file" <<EOF
{
    "backup_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "backup_version": "1.0",
    "supabase_project": "${SUPABASE_PROJECT_REF}",
    "components": {
        "database": {
            "full_backup": "database/full-backup.sql",
            "schema_only": "database/schema-only.sql",
            "data_only": "database/data-only.sql",
            "auth_users": "database/auth-users.sql"
        },
        "storage": {
            "buckets": $(printf '%s\n' "${STORAGE_BUCKETS[@]}" | jq -R . | jq -s .)
        }
    },
    "metadata": {
        "migration_status": "metadata/migration-status.txt",
        "table_counts": "metadata/table-counts.json",
        "storage_inventory": "metadata/storage-inventory.json"
    }
}
EOF
}

# Cleanup old backups
cleanup_old_backups() {
    if [ -z "$BACKUP_RETENTION_DAYS" ] || [ "$BACKUP_RETENTION_DAYS" -eq 0 ]; then
        return
    fi
    
    log_info "Cleaning up backups older than ${BACKUP_RETENTION_DAYS} days..."
    
    find "$BACKUP_DIR" -maxdepth 1 -name "backup-*" -type d -mtime +${BACKUP_RETENTION_DAYS} | while read -r old_backup; do
        log_warning "Removing old backup: $(basename "$old_backup")"
        rm -rf "$old_backup"
    done
}

# Confirmation prompt
confirm_action() {
    local message=$1
    
    if [ "$REQUIRE_CONFIRMATION" != "true" ]; then
        return 0
    fi
    
    echo -e "${YELLOW}${message}${NC}"
    read -p "Continue? (yes/no): " -r response
    
    case "$response" in
        yes|YES|y|Y) return 0 ;;
        *) return 1 ;;
    esac
}