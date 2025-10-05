"""
Fetch IMERG (Integrated Multi-satellitE Retrievals for GPM) precipitation data.
High-resolution satellite rainfall measurements for the Philippines.

Output: imerg_data.csv with daily precipitation data
"""

import httpx
import pandas as pd
import asyncio
import os
from datetime import datetime, timedelta
from pathlib import Path
import json
from typing import List, Dict


# NASA Earthdata credentials
NASA_USERNAME = os.getenv('EARTHDATA_USERNAME', '')
NASA_PASSWORD = os.getenv('EARTHDATA_PASSWORD', '')

# GES DISC API endpoints
IMERG_API_BASE = "https://gpm1.gesdisc.eosdis.nasa.gov/daac-bin/access/timeseries.cgi"

# Philippines locations for data collection
LOCATIONS = [
    {"name": "Manila", "lat": 14.5995, "lon": 120.9842},
    {"name": "Cagayan", "lat": 18.2500, "lon": 121.8000},
    {"name": "Marikina", "lat": 14.6417, "lon": 121.1027},
    {"name": "Quezon City", "lat": 14.6760, "lon": 121.0437},
    {"name": "Bulacan", "lat": 14.7942, "lon": 120.8797},
]


async def fetch_imerg_for_location(
    location: Dict,
    start_date: str,
    end_date: str,
    session: httpx.AsyncClient
) -> pd.DataFrame:
    """
    Fetch IMERG precipitation data for a specific location.
    
    Args:
        location: Dict with name, lat, lon
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        session: HTTP client session
    
    Returns:
        DataFrame with date, location, lat, lon, precipitation
    """
    params = {
        'type': 'asc2',
        'variable': 'precipitationCal',
        'startDate': start_date,
        'endDate': end_date,
        'location': f"GEOM:POINT({location['lon']},{location['lat']})",
        'product': 'GPM_3IMERGDF_06',  # IMERG Final Run Daily
    }
    
    print(f"📡 Fetching IMERG data for {location['name']}...")
    print(f"   Coordinates: ({location['lat']}, {location['lon']})")
    print(f"   Date range: {start_date} to {end_date}")
    
    try:
        response = await session.get(
            IMERG_API_BASE,
            params=params,
            auth=(NASA_USERNAME, NASA_PASSWORD),
            timeout=120.0
        )
        response.raise_for_status()
        
        # Parse the response
        lines = response.text.strip().split('\n')
        data_records = []
        
        for line in lines:
            if line.startswith('#') or not line.strip():
                continue
            
            parts = line.split()
            if len(parts) >= 2:
                try:
                    date_str = parts[0]
                    precip_value = float(parts[1])
                    
                    data_records.append({
                        'date': date_str,
                        'location': location['name'],
                        'latitude': location['lat'],
                        'longitude': location['lon'],
                        'precipitation': precip_value,
                        'source': 'IMERG',
                        'product': 'GPM_3IMERGDF_06'
                    })
                except (ValueError, IndexError):
                    continue
        
        df = pd.DataFrame(data_records)
        print(f"   ✅ Retrieved {len(df)} days of IMERG data")
        
        return df
        
    except httpx.HTTPStatusError as e:
        print(f"   ❌ HTTP Error {e.response.status_code}: {e}")
        return pd.DataFrame()
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return pd.DataFrame()


async def fetch_all_imerg_data(
    start_date: str,
    end_date: str,
    locations: List[Dict] = None
) -> pd.DataFrame:
    """
    Fetch IMERG data for all locations.
    
    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        locations: List of location dicts (defaults to LOCATIONS)
    
    Returns:
        Combined DataFrame with all location data
    """
    if locations is None:
        locations = LOCATIONS
    
    print("="*70)
    print("🛰️  IMERG DATA COLLECTION")
    print("="*70)
    print(f"Date Range: {start_date} to {end_date}")
    print(f"Locations: {len(locations)}")
    print()
    
    # Check credentials
    if not NASA_USERNAME or not NASA_PASSWORD:
        print("⚠️  Warning: NASA Earthdata credentials not found!")
        print("   Set EARTHDATA_USERNAME and EARTHDATA_PASSWORD environment variables")
        print("   Or the API will return errors")
        print()
    
    all_data = []
    
    async with httpx.AsyncClient() as session:
        for location in locations:
            df = await fetch_imerg_for_location(location, start_date, end_date, session)
            if not df.empty:
                all_data.append(df)
            
            # Small delay to avoid rate limiting
            await asyncio.sleep(1.0)
    
    if not all_data:
        print("\n❌ No IMERG data collected")
        return pd.DataFrame()
    
    # Combine all location data
    combined_df = pd.concat(all_data, ignore_index=True)
    
    print("\n" + "="*70)
    print("✅ IMERG DATA COLLECTION COMPLETE")
    print("="*70)
    print(f"Total records: {len(combined_df)}")
    print(f"Date range: {combined_df['date'].min()} to {combined_df['date'].max()}")
    print(f"Locations: {combined_df['location'].nunique()}")
    print()
    
    # Statistics by location
    print("📊 Data by Location:")
    for loc_name in combined_df['location'].unique():
        loc_data = combined_df[combined_df['location'] == loc_name]
        avg_precip = loc_data['precipitation'].mean()
        max_precip = loc_data['precipitation'].max()
        print(f"   {loc_name}: {len(loc_data)} days, avg {avg_precip:.2f}mm, max {max_precip:.2f}mm")
    
    return combined_df


async def main():
    """Main function to fetch and save IMERG data."""
    
    # Configuration
    start_date = "2023-01-01"
    end_date = "2025-09-30"
    
    # Output path
    output_dir = Path(__file__).parent.parent / "ml" / "models"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "imerg_data.csv"
    
    # Fetch data
    df = await fetch_all_imerg_data(start_date, end_date)
    
    if df.empty:
        print("\n❌ Failed to fetch IMERG data")
        return
    
    # Save to CSV
    df.to_csv(output_file, index=False)
    
    print(f"\n💾 Saved IMERG data to: {output_file}")
    print(f"   File size: {output_file.stat().st_size / 1024:.2f} KB")
    print()
    
    print("📋 Next Steps:")
    print("1. Fetch POWER data: python scripts/fetch_power_data.py")
    print("2. Apply enhanced flood labeling: python enhance_flood_labels.py")
    print("3. Train model: python ml/train_model.py")
    print()
    
    print("💡 Column Information:")
    print(f"   Columns: {', '.join(df.columns)}")
    print(f"   Data types: {df.dtypes.to_dict()}")
    print()


if __name__ == "__main__":
    asyncio.run(main())
