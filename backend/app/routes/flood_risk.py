"""Flood risk assessment endpoint"""

from fastapi import APIRouter, Header, HTTPException
import httpx

from ..models import FloodRiskRequest, ImergRequest, PowerRequest
from ..config import CMR_SEARCH_URL, NASA_POWER_URL, EARTHDATA_JWT, IMERG_DATASET_NAME
from ..utils import create_bbox_from_point, convert_date_format

router = APIRouter()


@router.post("")
async def assess_flood_risk(
    req: FloodRiskRequest,
    authorization: str = Header(None)
):
    """
    Combined endpoint: Fetch both IMERG rainfall and POWER climate data,
    then calculate a simple flood risk score.
    
    This is a basic MVP implementation - can be enhanced with ML models later.
    """
    # Convert date formats
    # IMERG uses YYYY-MM-DD, POWER uses YYYYMMDD
    power_start = convert_date_format(req.start_date, "YYYYMMDD")
    power_end = convert_date_format(req.end_date, "YYYYMMDD")
    
    # Create bbox around the point (±0.5 degrees)
    bbox = create_bbox_from_point(req.latitude, req.longitude, margin=0.5)
    
    # Fetch IMERG data (rainfall) - OPTIONAL
    imerg_granules = []
    if authorization or EARTHDATA_JWT:
        try:
            if not authorization:
                authorization = f"Bearer {EARTHDATA_JWT}"
            
            # Get IMERG metadata (lightweight)
            params = {
                "short_name": IMERG_DATASET_NAME,
                "page_size": 10,
                "sort_key": "start_date",
                "temporal": f"{req.start_date}T00:00:00Z/{req.end_date}T23:59:59Z",
                "bounding_box": bbox
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                r = await client.get(CMR_SEARCH_URL, params=params, headers={"Authorization": authorization})
                r.raise_for_status()
                imerg_results = r.json()
            
            imerg_granules = imerg_results.get("feed", {}).get("entry", [])
        except Exception as e:
            print(f"⚠️ IMERG data unavailable: {e}")
            # Continue without IMERG data
    
    # Fetch POWER climate data (no auth required)
    power_req = PowerRequest(
        start_date=power_start,
        end_date=power_end,
        latitude=req.latitude,
        longitude=req.longitude,
        parameters="T2M,PRECTOTCORR,RH2M,WS2M"
    )
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(NASA_POWER_URL, params={
            "parameters": power_req.parameters,
            "community": power_req.community,
            "longitude": power_req.longitude,
            "latitude": power_req.latitude,
            "start": power_req.start_date,
            "end": power_req.end_date,
            "format": "JSON"
        })
        r.raise_for_status()
        power_data = r.json()
    
    power_params = power_data.get("properties", {}).get("parameter", {})
    
    # Simple flood risk calculation
    precip_data = power_params.get("PRECTOTCORR", {})
    temp_data = power_params.get("T2M", {})
    humidity_data = power_params.get("RH2M", {})
    
    # Calculate average precipitation
    precip_values = [v for v in precip_data.values() if v is not None and v >= 0]
    avg_precip = sum(precip_values) / len(precip_values) if precip_values else 0
    max_precip = max(precip_values) if precip_values else 0
    
    # Calculate average humidity
    humidity_values = [v for v in humidity_data.values() if v is not None]
    avg_humidity = sum(humidity_values) / len(humidity_values) if humidity_values else 0
    
    # Simple risk scoring (0-100)
    # Factors: high precipitation, high humidity
    risk_score = 0
    risk_level = "LOW"
    risk_factors = []
    
    if max_precip > 100:  # >100mm in a day
        risk_score += 40
        risk_factors.append(f"Very high daily rainfall ({max_precip:.1f}mm)")
    elif max_precip > 50:
        risk_score += 25
        risk_factors.append(f"High daily rainfall ({max_precip:.1f}mm)")
    elif max_precip > 20:
        risk_score += 10
        risk_factors.append(f"Moderate rainfall ({max_precip:.1f}mm)")
    
    if avg_precip > 50:
        risk_score += 20
        risk_factors.append(f"High average rainfall ({avg_precip:.1f}mm/day)")
    elif avg_precip > 20:
        risk_score += 10
        risk_factors.append(f"Moderate average rainfall ({avg_precip:.1f}mm/day)")
    
    if avg_humidity > 80:
        risk_score += 15
        risk_factors.append(f"High humidity ({avg_humidity:.1f}%)")
    elif avg_humidity > 70:
        risk_score += 5
        risk_factors.append(f"Elevated humidity ({avg_humidity:.1f}%)")
    
    if len(imerg_granules) > 0:
        risk_score += 5
        risk_factors.append("IMERG satellite data available")
    
    # Determine risk level
    if risk_score >= 60:
        risk_level = "HIGH"
    elif risk_score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
    
    return {
        "location": {
            "latitude": req.latitude,
            "longitude": req.longitude
        },
        "date_range": {
            "start": req.start_date,
            "end": req.end_date
        },
        "flood_risk": {
            "level": risk_level,
            "score": risk_score,
            "factors": risk_factors
        },
        "climate_summary": {
            "avg_precipitation_mm": round(avg_precip, 2),
            "max_precipitation_mm": round(max_precip, 2),
            "avg_temperature_c": round(sum([v for v in temp_data.values() if v is not None]) / len([v for v in temp_data.values() if v is not None]), 2) if temp_data else None,
            "avg_humidity_percent": round(avg_humidity, 2)
        },
        "data_sources": {
            "imerg_granules_found": len(imerg_granules),
            "power_data_days": len(precip_values)
        }
    }
