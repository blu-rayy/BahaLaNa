"""
Fetch NASA POWER (Prediction Of Worldwide Energy Resources) climate data.
Ground-based measurements of temperature, humidity, wind speed, and precipitation.

Output: power_data.csv with daily climate measurements
"""

import httpx
import pandas as pd
import asyncio
from datetime import datetime, timedelta
from pathlib import Path
import json
from typing import List, Dict


# NASA POWER API endpoint
POWER_API_BASE = "https://power.larc.nasa.gov/api/temporal/daily/point"

# Climate parameters to fetch
POWER_PARAMETERS = [
    'T2M',          # Temperature at 2 Meters (°C)
    'PRECTOTCORR',  # Precipitation Corrected (mm/day)
    'RH2M',         # Relative Humidity at 2 Meters (%)
    'WS2M',         # Wind Speed at 2 Meters (m/s)
]

# Philippines locations
LOCATIONS = [
    {"name": "Manila", "lat": 14.5995, "lon": 120.9842},
    {"name": "Cagayan", "lat": 18.2500, "lon": 121.8000},
    {"name": "Marikina", "lat": 14.6417, "lon": 121.1027},
    {"name": "Quezon City", "lat": 14.6760, "lon": 121.0437},
    {"name": "Bulacan", "lat": 14.7942, "lon": 120.8797},
]


async def fetch_power_for_location(
    location: Dict,
    start_date: str,
    end_date: str,
    session: httpx.AsyncClient
) -> pd.DataFrame:
    """
    Fetch NASA POWER climate data for a specific location.
    
    Args:
        location: Dict with name, lat, lon
        start_date: Start date (YYYYMMDD)
        end_date: End date (YYYYMMDD)
        session: HTTP client session
    
    Returns:
        DataFrame with date, location, lat, lon, and climate parameters
    """
    params = {
        'parameters': ','.join(POWER_PARAMETERS),
        'community': 'AG',  # Agroclimatology
        'longitude': location['lon'],
        'latitude': location['lat'],
        'start': start_date,
        'end': end_date,
        'format': 'JSON'
    }
    
    print(f"🌍 Fetching POWER data for {location['name']}...")
    print(f"   Coordinates: ({location['lat']}, {location['lon']})")
    print(f"   Date range: {start_date} to {end_date}")
    
    try:
        response = await session.get(
            POWER_API_BASE,
            params=params,
            timeout=120.0
        )
        response.raise_for_status()
        data = response.json()
        
        # Extract parameters
        parameters = data.get('properties', {}).get('parameter', {})
        
        if not parameters:
            print(f"   ⚠️  No data in response")
            return pd.DataFrame()
        
        # Convert to DataFrame
        records = []
        dates = list(parameters.get('T2M', {}).keys())
        
        for date_str in dates:
            try:
                # Convert YYYYMMDD to YYYY-MM-DD
                date_obj = datetime.strptime(date_str, '%Y%m%d')
                formatted_date = date_obj.strftime('%Y-%m-%d')
                
                record = {
                    'date': formatted_date,
                    'location': location['name'],
                    'latitude': location['lat'],
                    'longitude': location['lon'],
                    'temperature': parameters.get('T2M', {}).get(date_str),
                    'precipitation': parameters.get('PRECTOTCORR', {}).get(date_str),
                    'humidity': parameters.get('RH2M', {}).get(date_str),
                    'wind_speed': parameters.get('WS2M', {}).get(date_str),
                    'source': 'POWER',
                }
                
                # Skip if any value is missing or -999 (POWER's missing value indicator)
                if all(v is not None and v != -999 for k, v in record.items() if k not in ['date', 'location', 'latitude', 'longitude', 'source']):
                    records.append(record)
            except (ValueError, KeyError):
                continue
        
        df = pd.DataFrame(records)
        print(f"   ✅ Retrieved {len(df)} days of POWER data")
        
        return df
        
    except httpx.HTTPStatusError as e:
        print(f"   ❌ HTTP Error {e.response.status_code}: {e}")
        return pd.DataFrame()
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return pd.DataFrame()


async def fetch_all_power_data(
    start_date: str,
    end_date: str,
    locations: List[Dict] = None
) -> pd.DataFrame:
    """
    Fetch NASA POWER data for all locations.
    
    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        locations: List of location dicts (defaults to LOCATIONS)
    
    Returns:
        Combined DataFrame with all location data
    """
    if locations is None:
        locations = LOCATIONS
    
    # Convert dates to YYYYMMDD format for POWER API
    start_power = start_date.replace('-', '')
    end_power = end_date.replace('-', '')
    
    print("="*70)
    print("🌍 NASA POWER DATA COLLECTION")
    print("="*70)
    print(f"Date Range: {start_date} to {end_date}")
    print(f"Locations: {len(locations)}")
    print(f"Parameters: {', '.join(POWER_PARAMETERS)}")
    print()
    
    all_data = []
    
    async with httpx.AsyncClient() as session:
        for location in locations:
            df = await fetch_power_for_location(location, start_power, end_power, session)
            if not df.empty:
                all_data.append(df)
            
            # Small delay to avoid rate limiting
            await asyncio.sleep(0.5)
    
    if not all_data:
        print("\n❌ No POWER data collected")
        return pd.DataFrame()
    
    # Combine all location data
    combined_df = pd.concat(all_data, ignore_index=True)
    
    print("\n" + "="*70)
    print("✅ POWER DATA COLLECTION COMPLETE")
    print("="*70)
    print(f"Total records: {len(combined_df)}")
    print(f"Date range: {combined_df['date'].min()} to {combined_df['date'].max()}")
    print(f"Locations: {combined_df['location'].nunique()}")
    print()
    
    # Statistics by location
    print("📊 Data by Location:")
    for loc_name in combined_df['location'].unique():
        loc_data = combined_df[combined_df['location'] == loc_name]
        print(f"   {loc_name}: {len(loc_data)} days")
        print(f"      Avg temp: {loc_data['temperature'].mean():.1f}°C")
        print(f"      Avg precip: {loc_data['precipitation'].mean():.2f}mm")
        print(f"      Avg humidity: {loc_data['humidity'].mean():.1f}%")
    
    return combined_df


async def main():
    """Main function to fetch and save POWER data."""
    
    # Configuration
    start_date = "2023-01-01"
    end_date = "2025-09-30"
    
    # Output path
    output_dir = Path(__file__).parent.parent / "ml" / "models"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "power_data.csv"
    
    # Fetch data
    df = await fetch_all_power_data(start_date, end_date)
    
    if df.empty:
        print("\n❌ Failed to fetch POWER data")
        return
    
    # Save to CSV
    df.to_csv(output_file, index=False)
    
    print(f"\n💾 Saved POWER data to: {output_file}")
    print(f"   File size: {output_file.stat().st_size / 1024:.2f} KB")
    print()
    
    print("📋 Next Steps:")
    print("1. Fetch IMERG data: python scripts/fetch_imerg_data.py (if not already done)")
    print("2. Apply enhanced flood labeling: python enhance_flood_labels.py")
    print("3. Train model: python ml/train_model.py")
    print()
    
    print("💡 Column Information:")
    print(f"   Columns: {', '.join(df.columns)}")
    for col in ['temperature', 'precipitation', 'humidity', 'wind_speed']:
        if col in df.columns:
            print(f"   {col}: min={df[col].min():.2f}, max={df[col].max():.2f}, mean={df[col].mean():.2f}")
    print()


if __name__ == "__main__":
    asyncio.run(main())
