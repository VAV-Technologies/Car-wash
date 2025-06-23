# Nobridge Marketplace Data Processor (Python)

A robust Python-based solution for processing CSV data, downloading images, and populating the Nobridge marketplace database. This replaces the unreliable JavaScript CSV processing with pandas-powered data handling.

## 🔧 Setup

### 1. Install Python Dependencies

```bash
cd python-scripts
pip install -r requirements.txt
```

### 2. Verify CSV File Location

Make sure `more_data.csv` is in the project root (same level as `package.json`).

## 🚀 Usage

### Quick Run
```bash
cd python-scripts
python run_processor.py
```

### Advanced Usage
```bash
cd python-scripts
python marketplace_data_processor.py
```

## ✨ What This Solves

### 🐛 **Problems with JavaScript Version:**
- ❌ Unreliable CSV parsing (missing cities, corrupted data)
- ❌ Poor error handling for malformed CSV
- ❌ Encoding issues
- ❌ Complex data validation logic

### ✅ **Python Version Benefits:**
- ✅ **Robust CSV parsing** with pandas
- ✅ **Smart city name handling** - fills missing cities with country defaults
- ✅ **Better data validation** - proper type checking and cleaning
- ✅ **Comprehensive logging** - detailed progress and error reporting
- ✅ **Retry logic** for image downloads
- ✅ **Image validation** - ensures downloaded files are valid images
- ✅ **Clean SQL generation** - proper escaping and data handling

## 📊 Features

### Data Processing
- **Pandas CSV Reading**: Handles various encodings and delimiters automatically
- **Smart Location Handling**: Fills missing cities based on country defaults
- **Data Validation**: Ensures all required fields are present and valid
- **Type Conversion**: Proper handling of numbers, dates, and text

### Image Handling
- **Smart Downloads**: Skips existing images, validates file integrity
- **Retry Logic**: Exponential backoff for failed downloads
- **Image Validation**: Uses PIL to verify downloaded images
- **Unique Naming**: Hash-based filenames prevent conflicts

### Database Operations
- **Clean SQL Generation**: Proper escaping and formatting
- **Remote Database Reset**: Automated Supabase database refresh
- **Storage Upload**: Automatic image upload to Supabase storage

## 📋 Output

The script will:
1. 🧹 Clean existing data
2. 📋 Parse CSV with pandas
3. 📥 Download/validate images
4. 📄 Generate clean seed.sql
5. 🔄 Reset remote database
6. 📸 Upload images to storage

## 🎯 Expected Results

- **Correct city names** for all listings
- **Complete data fields** (no missing details)
- **Perfect image mapping** (1:1 listing to image)
- **Clean database** (no duplicate/corrupted entries)
- **Reliable processing** (handles edge cases gracefully)

## 🔍 Logging

All operations are logged to:
- **Console output** (real-time progress)
- **marketplace_processor.log** (detailed file log)

## ⚡ Performance

- **Faster processing** than JavaScript version
- **Memory efficient** with pandas DataFrames
- **Parallel operations** where possible
- **Smart caching** (reuses existing images)

## 🛠 Troubleshooting

### CSV Issues
- Script tries multiple encodings automatically
- Handles various delimiter formats
- Provides detailed column information

### Image Download Issues
- Automatic retry with exponential backoff
- Comprehensive error logging
- Validation of downloaded files

### Database Issues
- Clear error messages
- Automatic rollback on failures
- Detailed SQL generation logs
