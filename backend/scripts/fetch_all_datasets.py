"""
Master script to fetch IMERG and POWER datasets
Runs each fetcher in sequence and provides summary statistics.
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import the individual fetchers
from scripts.fetch_imerg_data import fetch_all_imerg_data
from scripts.fetch_power_data import fetch_all_power_data
import pandas as pd


async def fetch_all_datasets():
    """Fetch IMERG and POWER datasets and save them separately."""
    
    print("="*80)
    print("🌍 MASTER DATA COLLECTION SCRIPT")
    print("="*80)
    print("This script will fetch two NASA datasets:")
    print("  1. IMERG  - Satellite precipitation data")
    print("  2. POWER  - Ground-based climate data")
    print("="*80)
    print()
    
    # Configuration
    start_date = "2023-01-01"
    end_date = "2025-09-30"
    
    # Output directory
    output_dir = Path(__file__).parent.parent / "ml" / "models"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    results = {}
    start_time = datetime.now()
    
    # 1. Fetch IMERG data
    print("\n" + "="*80)
    print("STEP 1/2: FETCHING IMERG DATA")
    print("="*80)
    try:
        imerg_df = await fetch_all_imerg_data(start_date, end_date)
        if not imerg_df.empty:
            imerg_file = output_dir / "imerg_data.csv"
            imerg_df.to_csv(imerg_file, index=False)
            results['imerg'] = {
                'success': True,
                'records': len(imerg_df),
                'file': str(imerg_file),
                'size_kb': imerg_file.stat().st_size / 1024
            }
            print(f"✅ IMERG data saved: {len(imerg_df)} records")
        else:
            results['imerg'] = {'success': False, 'error': 'No data collected'}
            print("❌ IMERG data collection failed")
    except Exception as e:
        results['imerg'] = {'success': False, 'error': str(e)}
        print(f"❌ IMERG error: {e}")
    
    await asyncio.sleep(2)  # Pause between datasets
    
    # 2. Fetch POWER data
    print("\n" + "="*80)
    print("STEP 2/2: FETCHING POWER DATA")
    print("="*80)
    try:
        power_df = await fetch_all_power_data(start_date, end_date)
        if not power_df.empty:
            power_file = output_dir / "power_data.csv"
            power_df.to_csv(power_file, index=False)
            results['power'] = {
                'success': True,
                'records': len(power_df),
                'file': str(power_file),
                'size_kb': power_file.stat().st_size / 1024
            }
            print(f"✅ POWER data saved: {len(power_df)} records")
        else:
            results['power'] = {'success': False, 'error': 'No data collected'}
            print("❌ POWER data collection failed")
    except Exception as e:
        results['power'] = {'success': False, 'error': str(e)}
        print(f"❌ POWER error: {e}")
    
    # Final summary
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    print("\n\n" + "="*80)
    print("📊 FINAL SUMMARY")
    print("="*80)
    print(f"Total time: {duration:.1f} seconds ({duration/60:.1f} minutes)")
    print()
    
    success_count = sum(1 for r in results.values() if r.get('success'))
    print(f"Successful datasets: {success_count}/2")
    print()
    
    for dataset, result in results.items():
        print(f"\n{dataset.upper()}:")
        if result.get('success'):
            if 'records' in result:
                print(f"   ✅ Success - {result['records']} records")
                if 'file' in result:
                    print(f"   📁 File: {Path(result['file']).name}")
                    print(f"   💾 Size: {result['size_kb']:.2f} KB")
                if 'note' in result:
                    print(f"   ℹ️  {result['note']}")
        else:
            print(f"   ❌ Failed: {result.get('error', 'Unknown error')}")
    
    print("\n" + "="*80)
    print("📋 NEXT STEPS")
    print("="*80)
    
    if success_count >= 2:
        print("✅ Both datasets collected successfully!")
        print()
        print("You can now:")
        print("  1. Apply enhanced flood labeling:")
        print("     python enhance_flood_labels.py")
        print()
        print("  2. Train the flood prediction model:")
        print("     python ml/train_model.py")
    else:
        print("⚠️  Not enough data collected. Please check errors above.")
        print()
        print("Common issues:")
        print("  - IMERG requires NASA Earthdata credentials")
        print("    Set EARTHDATA_USERNAME and EARTHDATA_PASSWORD environment variables")
        print("  - POWER should work without credentials")
    
    print("\n" + "="*80)
    print("📁 OUTPUT FILES")
    print("="*80)
    print(f"All files saved to: {output_dir}")
    for file in ['imerg_data.csv', 'power_data.csv']:
        file_path = output_dir / file
        if file_path.exists():
            print(f"  ✅ {file} ({file_path.stat().st_size / 1024:.1f} KB)")
        else:
            print(f"  ❌ {file} (not created)")
    print()


if __name__ == "__main__":
    asyncio.run(fetch_all_datasets())
