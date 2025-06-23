#!/usr/bin/env python3
"""
Test CSV Parser - Debug CSV reading
"""

import pandas as pd
import sys
from pathlib import Path

def test_csv_reading():
    csv_file = '../more_data.csv'

    if not Path(csv_file).exists():
        print(f"❌ CSV file not found: {csv_file}")
        return

    print("🔍 Testing CSV reading...")

    # Try different encodings and delimiters
    encodings = ['utf-8', 'utf-8-sig', 'iso-8859-1', 'cp1252']
    delimiters = [',', ';', '\t']

    for encoding in encodings:
        for delimiter in delimiters:
            try:
                df = pd.read_csv(
                    csv_file,
                    encoding=encoding,
                    delimiter=delimiter,
                    quotechar='"',
                    skipinitialspace=True,
                    na_values=['', 'NULL', 'null', 'N/A', 'n/a'],
                    keep_default_na=True
                )

                # Check if we have reasonable columns
                if len(df.columns) > 5 and len(df) > 0:
                    print(f"\n✅ SUCCESS with encoding={encoding}, delimiter='{delimiter}'")
                    print(f"📊 Found {len(df)} rows and {len(df.columns)} columns")
                    print(f"\n📋 All Columns:")
                    for i, col in enumerate(df.columns):
                        print(f"  {i+1:2d}. {col}")

                    print(f"\n🔍 First few rows of key columns:")
                    key_columns = ['Listing Title (Anonymous)', 'Industry', 'Location (Country)', 'Business Description (2)', 'Image Link']
                    for col in key_columns:
                        if col in df.columns:
                            print(f"\n{col}:")
                            print(df[col].head(3).to_string())

                    # Check for location-related columns
                    print(f"\n🌍 Location-related columns:")
                    location_cols = [col for col in df.columns if any(word in col.lower() for word in ['location', 'city', 'country', 'region', 'state'])]
                    for col in location_cols:
                        print(f"  - {col}")
                        print(f"    Sample values: {df[col].dropna().head(3).tolist()}")

                    return df

            except Exception as e:
                continue

    print("❌ Could not read CSV with any encoding/delimiter combination")
    return None

if __name__ == "__main__":
    df = test_csv_reading()
    if df is not None:
        print(f"\n✅ CSV reading successful!")
        print(f"📈 Shape: {df.shape}")
    else:
        print(f"\n❌ CSV reading failed!")
