"""NASA POWER API endpoints"""

from fastapi import APIRouter, HTTPException
import httpx

from ..models import PowerRequest
from ..config import NASA_POWER_URL

router = APIRouter()


@router.post("/climate")
async def fetch_power_data(req: PowerRequest):
    """
    Fetch climate data from NASA POWER API for a specific location and date range.
    
    No authentication required - POWER API is publicly accessible.
    
    Parameters:
    - start_date: YYYYMMDD format (e.g., "20250901")
    - end_date: YYYYMMDD format (e.g., "20250930")
    - latitude: Decimal degrees (-90 to 90)
    - longitude: Decimal degrees (-180 to 180)
    - parameters: Comma-separated list (default: T2M,PRECTOTCORR,RH2M,WS2M)
      Available: T2M (temp), PRECTOTCORR (precip), RH2M (humidity), 
                 WS2M (wind), ALLSKY_SFC_SW_DWN (solar radiation), etc.
    - community: Data community (AG=Agroclimatology, RE=Renewable Energy, SB=Sustainable Buildings)
    
    Returns daily climate data for the location.
    """
    params = {
        "parameters": req.parameters,
        "community": req.community,
        "longitude": req.longitude,
        "latitude": req.latitude,
        "start": req.start_date,
        "end": req.end_date,
        "format": "JSON"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(NASA_POWER_URL, params=params)
        r.raise_for_status()
        data = r.json()
    
    # Extract and format the response
    if "properties" not in data or "parameter" not in data["properties"]:
        raise HTTPException(status_code=500, detail="Unexpected POWER API response format")
    
    parameters_data = data["properties"]["parameter"]
    
    # Reorganize data by date instead of by parameter
    dates = set()
    for param_name, param_values in parameters_data.items():
        dates.update(param_values.keys())
    
    daily_data = []
    for date in sorted(dates):
        day_record = {"date": date}
        for param_name, param_values in parameters_data.items():
            day_record[param_name] = param_values.get(date)
        daily_data.append(day_record)
    
    return {
        "location": {
            "latitude": req.latitude,
            "longitude": req.longitude
        },
        "date_range": {
            "start": req.start_date,
            "end": req.end_date
        },
        "parameters_info": data.get("parameters", {}),
        "daily_data": daily_data,
        "metadata": {
            "source": "NASA POWER API",
            "community": req.community,
            "version": data.get("header", {}).get("api_version", "unknown")
        }
    }
