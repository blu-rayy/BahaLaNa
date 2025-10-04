"""
Test script for NASA POWER API and flood risk endpoints.
No authentication required for POWER endpoints!
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"

def test_power_api():
    """Test NASA POWER API endpoint"""
    print("\n" + "="*60)
    print("Testing NASA POWER API (Climate Data)")
    print("="*60)
    
    # Manila, Philippines coordinates
    payload = {
        "start_date": "20250101",
        "end_date": "20250107",  # 1 week
        "latitude": 14.5995,
        "longitude": 120.9842,
        "parameters": "T2M,PRECTOTCORR,RH2M,WS2M",
        "community": "AG"
    }
    
    print(f"\nQuerying POWER data for Manila:")
    print(f"  Coordinates: {payload['latitude']}, {payload['longitude']}")
    print(f"  Date range: {payload['start_date']} to {payload['end_date']}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/power/climate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        data = response.json()
        
        print(f"\n✅ SUCCESS! Retrieved {len(data['daily_data'])} days of data")
        print(f"\nMetadata:")
        print(f"  Source: {data['metadata']['source']}")
        print(f"  API Version: {data['metadata']['version']}")
        
        print(f"\nFirst 3 days of data:")
        for day in data['daily_data'][:3]:
            print(f"\n  Date: {day['date']}")
            print(f"    Temperature: {day.get('T2M', 'N/A')}°C")
            print(f"    Precipitation: {day.get('PRECTOTCORR', 'N/A')} mm/day")
            print(f"    Humidity: {day.get('RH2M', 'N/A')}%")
            print(f"    Wind Speed: {day.get('WS2M', 'N/A')} m/s")
        
        # Calculate summary statistics
        precip_values = [d['PRECTOTCORR'] for d in data['daily_data'] if d.get('PRECTOTCORR') is not None]
        temp_values = [d['T2M'] for d in data['daily_data'] if d.get('T2M') is not None]
        
        if precip_values:
            print(f"\nSummary Statistics:")
            print(f"  Avg Precipitation: {sum(precip_values)/len(precip_values):.2f} mm/day")
            print(f"  Max Precipitation: {max(precip_values):.2f} mm/day")
            print(f"  Avg Temperature: {sum(temp_values)/len(temp_values):.2f}°C")
        
        return True
        
    except requests.exceptions.HTTPError as e:
        print(f"\n❌ HTTP Error: {e}")
        print(f"Response: {e.response.text}")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False


def test_flood_risk_api():
    """Test combined flood risk endpoint"""
    print("\n" + "="*60)
    print("Testing Flood Risk Assessment")
    print("="*60)
    
    import os
    token = os.getenv("EARTHDATA_JWT")
    
    if not token:
        print("\n⚠️  WARNING: EARTHDATA_JWT not set!")
        print("Set it with: $env:EARTHDATA_JWT = 'your_token'")
        print("Skipping flood risk test...")
        return False
    
    # Cebu City coordinates (known flood-prone area)
    payload = {
        "start_date": "2025-01-01",
        "end_date": "2025-01-07",
        "latitude": 10.3157,
        "longitude": 123.8854
    }
    
    print(f"\nAssessing flood risk for Cebu City:")
    print(f"  Coordinates: {payload['latitude']}, {payload['longitude']}")
    print(f"  Date range: {payload['start_date']} to {payload['end_date']}")
    
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/flood-risk",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        data = response.json()
        
        print(f"\n{'='*50}")
        print(f"  🌧️  FLOOD RISK ASSESSMENT")
        print(f"{'='*50}")
        
        risk_level = data['flood_risk']['level']
        risk_score = data['flood_risk']['score']
        
        # Color-code the risk level
        color_emoji = {
            'LOW': '🟢',
            'MEDIUM': '🟡',
            'HIGH': '🔴'
        }
        
        print(f"\n  Risk Level: {color_emoji.get(risk_level, '⚪')} {risk_level}")
        print(f"  Risk Score: {risk_score}/100")
        
        print(f"\n  Risk Factors:")
        for factor in data['flood_risk']['factors']:
            print(f"    • {factor}")
        
        print(f"\n  Climate Summary:")
        summary = data['climate_summary']
        print(f"    Avg Precipitation: {summary['avg_precipitation_mm']} mm/day")
        print(f"    Max Precipitation: {summary['max_precipitation_mm']} mm/day")
        print(f"    Avg Temperature: {summary['avg_temperature_c']}°C")
        print(f"    Avg Humidity: {summary['avg_humidity_percent']}%")
        
        print(f"\n  Data Sources:")
        print(f"    IMERG granules: {data['data_sources']['imerg_granules_found']}")
        print(f"    POWER data days: {data['data_sources']['power_data_days']}")
        
        print(f"\n{'='*50}")
        
        return True
        
    except requests.exceptions.HTTPError as e:
        print(f"\n❌ HTTP Error: {e}")
        print(f"Response: {e.response.text}")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False


def test_multiple_locations():
    """Test flood risk for multiple Philippine cities"""
    print("\n" + "="*60)
    print("Testing Multiple Locations in Philippines")
    print("="*60)
    
    import os
    token = os.getenv("EARTHDATA_JWT")
    
    if not token:
        print("\n⚠️  Skipping (EARTHDATA_JWT not set)")
        return False
    
    locations = [
        {"name": "Manila", "lat": 14.5995, "lon": 120.9842},
        {"name": "Cebu City", "lat": 10.3157, "lon": 123.8854},
        {"name": "Davao City", "lat": 7.1907, "lon": 125.4553},
        {"name": "Baguio City", "lat": 16.4023, "lon": 120.5960},
    ]
    
    results = []
    
    for loc in locations:
        payload = {
            "start_date": "2025-01-01",
            "end_date": "2025-01-07",
            "latitude": loc['lat'],
            "longitude": loc['lon']
        }
        
        try:
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{BASE_URL}/api/flood-risk",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            
            results.append({
                "city": loc['name'],
                "risk_level": data['flood_risk']['level'],
                "risk_score": data['flood_risk']['score'],
                "max_precip": data['climate_summary']['max_precipitation_mm']
            })
            
        except Exception as e:
            print(f"  ❌ Failed for {loc['name']}: {e}")
            continue
    
    # Display summary table
    print(f"\n{'City':<15} {'Risk Level':<12} {'Score':<8} {'Max Rainfall'}")
    print("-" * 55)
    
    for r in sorted(results, key=lambda x: x['risk_score'], reverse=True):
        emoji = {'HIGH': '🔴', 'MEDIUM': '🟡', 'LOW': '🟢'}.get(r['risk_level'], '⚪')
        print(f"{r['city']:<15} {emoji} {r['risk_level']:<10} {r['risk_score']:<8} {r['max_precip']:.1f} mm")
    
    return True


if __name__ == "__main__":
    print("\n🚀 BahaLa Na - API Testing Suite")
    print("="*60)
    
    # Test 1: POWER API (no auth required)
    power_success = test_power_api()
    
    # Test 2: Flood Risk (requires auth)
    risk_success = test_flood_risk_api()
    
    # Test 3: Multiple locations
    multi_success = test_multiple_locations()
    
    print("\n" + "="*60)
    print("Test Summary:")
    print(f"  POWER API: {'✅ PASSED' if power_success else '❌ FAILED'}")
    print(f"  Flood Risk: {'✅ PASSED' if risk_success else '❌ FAILED or SKIPPED'}")
    print(f"  Multi-location: {'✅ PASSED' if multi_success else '❌ FAILED or SKIPPED'}")
    print("="*60)
