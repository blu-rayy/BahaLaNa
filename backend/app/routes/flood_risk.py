"""Flood risk assessment endpoint"""

from fastapi import APIRouter, Header, HTTPException
import httpx
from datetime import datetime

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
    # Validate dates are not in the future
    today = datetime.now().date()
    try:
        start_date_obj = datetime.strptime(req.start_date, "%Y-%m-%d").date()
        end_date_obj = datetime.strptime(req.end_date, "%Y-%m-%d").date()
        
        if start_date_obj > today or end_date_obj > today:
            raise HTTPException(
                status_code=400,
                detail="Cannot assess flood risk."
            )
            
        if end_date_obj < start_date_obj:
            raise HTTPException(
                status_code=400,
                detail="End date must be after start date"
            )
            
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use YYYY-MM-DD format."
        )
    
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
    
    # Calculate average temperature
    temp_values = [v for v in temp_data.values() if v is not None]
    avg_temp = sum(temp_values) / len(temp_values) if temp_values else None
    
    # Enhanced flood risk scoring (0-100)
    # Factors: precipitation, humidity, geography, topography
    risk_score = 0
    risk_level = "LOW"
    risk_factors = []
    
    # Base precipitation risk
    precip_risk = 0
    if max_precip > 100:  # >100mm in a day
        precip_risk += 40
        risk_factors.append(f"Very high daily rainfall ({max_precip:.1f}mm)")
    elif max_precip > 50:
        precip_risk += 25
        risk_factors.append(f"High daily rainfall ({max_precip:.1f}mm)")
    elif max_precip > 20:
        precip_risk += 10
        risk_factors.append(f"Moderate rainfall ({max_precip:.1f}mm)")
    
    if avg_precip > 50:
        precip_risk += 20
        risk_factors.append(f"High average rainfall ({avg_precip:.1f}mm/day)")
    elif avg_precip > 20:
        precip_risk += 10
        risk_factors.append(f"Moderate average rainfall ({avg_precip:.1f}mm/day)")
    
    # Humidity factor (minor impact)
    humidity_bonus = 0
    if avg_humidity > 80:
        humidity_bonus += 10
        risk_factors.append(f"High humidity ({avg_humidity:.1f}%)")
    elif avg_humidity > 70:
        humidity_bonus += 3
        risk_factors.append(f"Elevated humidity ({avg_humidity:.1f}%)")
    
    # Geographic risk modifiers based on known flood-prone areas
    geo_modifier = 1.0
    location_bonus = 0
    
    # High-risk areas (river valleys, low-lying coastal plains)
    if (14.4 <= req.latitude <= 14.8 and 120.9 <= req.longitude <= 121.2):  # Metro Manila/Marikina
        geo_modifier = 1.5
        location_bonus = 20
        risk_factors.append("Located in flood-prone Metro Manila region")
    elif (14.0 <= req.latitude <= 15.0 and 120.5 <= req.longitude <= 121.5):  # Central Luzon plains
        geo_modifier = 1.3
        location_bonus = 15
        risk_factors.append("Located in Central Luzon flood plains")
    elif (10.0 <= req.latitude <= 11.5 and 123.5 <= req.longitude <= 125.0):  # Leyte/Samar lowlands
        geo_modifier = 1.2
        location_bonus = 10
        risk_factors.append("Located in Eastern Visayas coastal lowlands")
    
    # Low-risk areas (mountainous, well-drained, small islands)
    elif (9.0 <= req.latitude <= 10.5 and 123.5 <= req.longitude <= 124.5):  # Bohol/Siquijor
        geo_modifier = 0.4  # Significantly reduce risk
        risk_factors.append("Limestone terrain with underground drainage (reduced flood risk)")
    elif (16.0 <= req.latitude <= 17.0 and 120.0 <= req.longitude <= 121.0):  # Baguio/Cordillera
        geo_modifier = 0.6
        risk_factors.append("Mountainous terrain with steep drainage (reduced flood risk)")
    elif (9.0 <= req.latitude <= 9.5 and 124.5 <= req.longitude <= 125.0):  # Camiguin
        geo_modifier = 0.5
        risk_factors.append("Volcanic island with rapid drainage (reduced flood risk)")
    
    # Calculate final risk score
    risk_score = int((precip_risk * geo_modifier) + humidity_bonus + location_bonus)
    risk_score = max(0, min(100, risk_score))  # Clamp to 0-100
    
    if len(imerg_granules) > 0:
        risk_score += 3  # Reduced bonus for satellite data
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
            "avg_temperature_c": round(avg_temp, 2) if avg_temp is not None else None,
            "avg_humidity_percent": round(avg_humidity, 2)
        },
        "data_sources": {
            "imerg_granules_found": len(imerg_granules),
            "power_data_days": len(precip_values)
        }
    }
