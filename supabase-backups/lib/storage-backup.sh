#!/bin/bash
# Storage backup functions for Supabase

# List all files in a bucket
list_bucket_files() {
    local bucket=$1
    local limit=1000
    local offset=0
    local all_files=()
    
    while true; do
        local response=$(curl -s -X GET \
            "${SUPABASE_URL}/storage/v1/object/list/${bucket}" \
            -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
            -H "apikey: ${SUPABASE_SERVICE_KEY}" \
            -H "Content-Type: application/json" \
            -G \
            --data-urlencode "limit=${limit}" \
            --data-urlencode "offset=${offset}")
        
        # Check if response is valid JSON
        if ! echo "$response" | jq empty 2>/dev/null; then
            log_error "Failed to list files in bucket: ${bucket}"
            log_error "Response: $response"
            return 1
        fi
        
        # Check for error in response
        if echo "$response" | jq -e '.error' >/dev/null 2>&1; then
            local error_msg=$(echo "$response" | jq -r '.error // "Unknown error"')
            log_error "Storage API error for bucket ${bucket}: $error_msg"
            return 1
        fi
        
        # Extract file names (handle both array and object responses)
        local files=""
        if echo "$response" | jq -e 'type == "array"' >/dev/null 2>&1; then
            files=$(echo "$response" | jq -r '.[] | .name // empty')
        else
            log_warning "Unexpected response format for bucket ${bucket}"
            break
        fi
        local count=$(echo "$files" | grep -c .)
        
        if [ "$count" -eq 0 ]; then
            break
        fi
        
        # Add files to array
        while IFS= read -r file; do
            all_files+=("$file")
        done <<< "$files"
        
        if [ "$count" -lt "$limit" ]; then
            break
        fi
        
        offset=$((offset + limit))
    done
    
    printf '%s\n' "${all_files[@]}"
}

# Download a single file from storage
download_storage_file() {
    local bucket=$1
    local file_path=$2
    local output_dir=$3
    
    local output_file="${output_dir}/${file_path}"
    local output_dir_path=$(dirname "$output_file")
    
    # Create directory if needed
    mkdir -p "$output_dir_path"
    
    # Download file
    curl -s -X GET \
        "${SUPABASE_URL}/storage/v1/object/${bucket}/${file_path}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
        -H "apikey: ${SUPABASE_SERVICE_KEY}" \
        -o "$output_file"
    
    if [ $? -eq 0 ] && [ -f "$output_file" ]; then
        return 0
    else
        return 1
    fi
}

# Download all files from a bucket with progress
backup_storage_bucket() {
    local bucket=$1
    local backup_dir=$2
    local bucket_dir="${backup_dir}/storage/${bucket}"
    
    log_info "Backing up storage bucket: ${bucket}"
    
    # Create bucket directory
    mkdir -p "$bucket_dir"
    
    # Get list of files
    log_info "Listing files in ${bucket}..."
    local files_array=()
    while IFS= read -r file; do
        [ -n "$file" ] && files_array+=("$file")
    done < <(list_bucket_files "$bucket")
    
    local total_files=${#files_array[@]}
    
    if [ "$total_files" -eq 0 ]; then
        log_warning "No files found in bucket: ${bucket}"
        return 0
    fi
    
    log_info "Found ${total_files} files to backup"
    
    # Download files with parallel processing
    local current=0
    local failed=0
    
    # Create a function for parallel downloads
    export -f download_storage_file
    export SUPABASE_URL SUPABASE_SERVICE_KEY
    
    # Process files in batches
    for file in "${files_array[@]}"; do
        ((current++))
        show_progress "$current" "$total_files" "Downloading"
        
        if download_storage_file "$bucket" "$file" "$bucket_dir"; then
            echo -e "\n${GREEN}✓${NC} Downloaded: ${file}"
        else
            echo -e "\n${RED}✗${NC} Failed: ${file}"
            ((failed++))
        fi
    done
    
    echo # New line after progress
    
    if [ "$failed" -eq 0 ]; then
        log_success "Bucket ${bucket} backup completed (${total_files} files)"
    else
        log_warning "Bucket ${bucket} backup completed with ${failed} failures"
    fi
    
    # Save inventory
    save_bucket_inventory "$bucket" "$bucket_dir" "${files_array[@]}"
    
    return 0
}

# Save inventory of backed up files with enhanced metadata
save_bucket_inventory() {
    local bucket=$1
    local bucket_dir=$2
    shift 2
    local files=("$@")
    
    local inventory_file="${bucket_dir}/../inventory-${bucket}.json"
    
    # Count actually backed up files
    local backed_up_files=()
    local total_size=0
    
    if [ ${#files[@]} -gt 0 ]; then
        for file in "${files[@]}"; do
            local file_path="${bucket_dir}/${file}"
            if [ -f "$file_path" ] && [ -s "$file_path" ]; then
                backed_up_files+=("$file")
                local size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "0")
                total_size=$((total_size + size))
            fi
        done
    fi
    
    # Create comprehensive inventory with metadata
    {
        echo "{"
        echo "  \"bucket\": \"${bucket}\","
        echo "  \"backup_date\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\","
        echo "  \"total_files_listed\": ${#files[@]},"
        echo "  \"files_backed_up\": ${#backed_up_files[@]},"
        echo "  \"total_size_bytes\": ${total_size},"
        echo "  \"backup_success_rate\": $([ ${#files[@]} -gt 0 ] && echo "scale=2; ${#backed_up_files[@]} * 100 / ${#files[@]}" | bc -l 2>/dev/null || echo "0"),"
        echo "  \"files\": ["
        
        local first=true
        for file in "${backed_up_files[@]}"; do
            local file_path="${bucket_dir}/${file}"
            if [ -f "$file_path" ]; then
                local size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "0")
                local mtime=$(stat -f%m "$file_path" 2>/dev/null || stat -c%Y "$file_path" 2>/dev/null || echo "0")
                local backup_time=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
                
                if [ "$first" = true ]; then
                    first=false
                else
                    echo ","
                fi
                
                # Escape special characters in filename for JSON
                local escaped_file=$(printf '%s' "$file" | sed 's/\\/\\\\/g; s/"/\\"/g')
                
                printf '    {\n'
                printf '      "name": "%s",\n' "$escaped_file"
                printf '      "size": %s,\n' "$size"
                printf '      "backed_up": true,\n'
                printf '      "backup_time": "%s"\n' "$backup_time"
                printf '    }'
            fi
        done
        
        echo ""
        echo "  ]"
        echo "}"
    } > "$inventory_file"
    
    if [ -f "$inventory_file" ]; then
        log_success "Inventory saved for bucket '$bucket': ${#backed_up_files[@]} files ($(du -h "$inventory_file" | cut -f1))"
    else
        log_warning "Failed to create inventory for bucket '$bucket'"
    fi
}

# Backup all configured storage buckets with intelligent bucket detection
backup_storage() {
    local backup_dir=$1
    local failed_buckets=()
    local successful_buckets=()
    local skipped_buckets=()
    
    if [ -z "$backup_dir" ]; then
        log_error "Backup directory not specified"
        return 1
    fi
    
    log_info "Starting storage backup process..."
    
    # Check if we have valid storage credentials
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
        log_error "Storage backup requires SUPABASE_URL and SUPABASE_SERVICE_KEY"
        return 1
    fi
    
    # Auto-detect available buckets if none configured
    if [ ${#STORAGE_BUCKETS[@]} -eq 0 ]; then
        log_info "No buckets configured, attempting to auto-detect..."
        local detected_buckets=()
        while IFS= read -r bucket; do
            [ -n "$bucket" ] && detected_buckets+=("$bucket")
        done < <(get_available_buckets 2>/dev/null)
        
        if [ ${#detected_buckets[@]} -gt 0 ]; then
            STORAGE_BUCKETS=("${detected_buckets[@]}")
            log_success "Auto-detected ${#detected_buckets[@]} buckets: ${detected_buckets[*]}"
        else
            log_info "No storage buckets found in project"
            echo '{}' > "${backup_dir}/metadata/storage-inventory.json"
            return 0
        fi
    fi
    
    log_info "Backing up ${#STORAGE_BUCKETS[@]} storage buckets..."
    
    # Create storage backup directory
    mkdir -p "${backup_dir}/storage"
    
    # Backup each bucket with error tracking
    for bucket in "${STORAGE_BUCKETS[@]}"; do
        if [ -z "$bucket" ]; then
            continue
        fi
        
        log_info "Processing bucket: $bucket"
        
        if backup_storage_bucket "$bucket" "$backup_dir"; then
            successful_buckets+=("$bucket")
            log_success "✓ Bucket '$bucket' backup completed"
        else
            failed_buckets+=("$bucket")
            log_error "✗ Bucket '$bucket' backup failed"
        fi
        
        echo # Add spacing between buckets
    done
    
    # Create combined inventory
    create_storage_inventory "$backup_dir"
    
    # Report final results
    local total_buckets=${#STORAGE_BUCKETS[@]}
    local successful_count=${#successful_buckets[@]}
    local failed_count=${#failed_buckets[@]}
    
    echo "Storage Backup Summary:"
    echo "----------------------"
    echo "Total buckets: $total_buckets"
    echo "Successful: $successful_count"
    echo "Failed: $failed_count"
    
    if [ ${#successful_buckets[@]} -gt 0 ]; then
        echo "Successful buckets: ${successful_buckets[*]}"
    fi
    
    if [ ${#failed_buckets[@]} -gt 0 ]; then
        echo "Failed buckets: ${failed_buckets[*]}"
        log_warning "Some storage buckets failed to backup"
    fi
    
    if [ $successful_count -gt 0 ]; then
        log_success "Storage backup process completed ($successful_count/$total_buckets buckets successful)"
        return 0
    else
        log_error "Storage backup process failed (no buckets backed up successfully)"
        return 1
    fi
}

# Create combined storage inventory with comprehensive metadata
create_storage_inventory() {
    local backup_dir=$1
    local inventory_file="${backup_dir}/metadata/storage-inventory.json"
    
    log_info "Creating combined storage inventory..."
    
    # Ensure metadata directory exists
    mkdir -p "${backup_dir}/metadata"
    
    # Calculate totals
    local total_buckets=0
    local total_files=0
    local total_size=0
    local successful_buckets=0
    
    {
        echo "{"
        echo "  \"backup_date\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\","
        echo "  \"backup_tool\": \"Enhanced Supabase Backup Script\","
        echo "  \"supabase_project\": \"${SUPABASE_PROJECT_REF:-unknown}\","
        echo "  \"buckets\": {"
        
        local first=true
        for bucket in "${STORAGE_BUCKETS[@]}"; do
            local bucket_inventory="${backup_dir}/storage/inventory-${bucket}.json"
            
            if [ -f "$bucket_inventory" ]; then
                if [ "$first" = true ]; then
                    first=false
                else
                    echo ","
                fi
                
                # Extract metadata from bucket inventory
                local bucket_files=$(jq -r '.files_backed_up // 0' "$bucket_inventory" 2>/dev/null || echo "0")
                local bucket_size=$(jq -r '.total_size_bytes // 0' "$bucket_inventory" 2>/dev/null || echo "0")
                
                total_files=$((total_files + bucket_files))
                total_size=$((total_size + bucket_size))
                ((successful_buckets++))
                
                echo "    \"${bucket}\": $(cat "$bucket_inventory")"
            fi
            ((total_buckets++))
        done
        
        echo "  },"
        echo "  \"summary\": {"
        echo "    \"total_buckets_configured\": ${total_buckets},"
        echo "    \"successful_buckets\": ${successful_buckets},"
        echo "    \"total_files_backed_up\": ${total_files},"
        echo "    \"total_size_bytes\": ${total_size},"
        echo "    \"total_size_human\": \"$([ $total_size -gt 0 ] && numfmt --to=iec-i --suffix=B $total_size 2>/dev/null || echo \"0B\")\","
        echo "    \"backup_success_rate\": $([ $total_buckets -gt 0 ] && echo "scale=2; $successful_buckets * 100 / $total_buckets" | bc -l 2>/dev/null || echo "0")"
        echo "  }"
        echo "}"
    } > "$inventory_file"
    
    if [ -f "$inventory_file" ]; then
        log_success "Combined storage inventory created: $successful_buckets/$total_buckets buckets, $total_files files"
        
        # Pretty print summary
        if command -v jq &> /dev/null && [ $total_files -gt 0 ]; then
            echo ""
            echo "Storage Backup Summary:"
            jq -r '.summary | "Buckets: \(.successful_buckets)/\(.total_buckets_configured) successful\nFiles: \(.total_files_backed_up) backed up\nTotal size: \(.total_size_human)\nSuccess rate: \(.backup_success_rate)%"' "$inventory_file" 2>/dev/null
        fi
    else
        log_error "Failed to create combined storage inventory"
    fi
}