#!/usr/bin/env python3
"""
Simple runner for the Marketplace Data Processor
"""

import sys
import os
from pathlib import Path

# Add the parent directory to the Python path so we can import from the main project
sys.path.append(str(Path(__file__).parent.parent))

from marketplace_data_processor import MarketplaceDataProcessor

def main():
    print("🚀 Starting Nobridge Marketplace Data Processor...")
    print("=" * 60)

    # Change to the parent directory (project root)
    os.chdir(Path(__file__).parent.parent)

    processor = MarketplaceDataProcessor()
    success = processor.run_complete_process()

    if success:
        print("\n✅ Processing completed successfully!")
        print("🌐 Check your live marketplace to see the results!")
    else:
        print("\n❌ Processing failed. Check the logs for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()
