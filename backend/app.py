from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
import httpx
import os
import tempfile

# Optional imports for scientific datasets
try:
    import xarray as xr  # type: ignore
    HAS_XARRAY = True
except Exception:
    xr = None
    HAS_XARRAY = False

app = FastAPI(title="BahaLa Na - IMERG fetcher")

CMR_SEARCH_URL = "https://cmr.earthdata.nasa.gov/search/granules.json"
NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

# Load Earthdata JWT from environment variable (secure)
# Set via: $env:EARTHDATA_JWT = "your_token_here" (PowerShell)
# Or add to .env file and load with python-dotenv
EARTHDATA_JWT = os.getenv("EARTHDATA_JWT")

class ImergRequest(BaseModel):
    start_date: str  # YYYY-MM-DD
    end_date: str    # YYYY-MM-DD
    bbox: str | None = None  # minLon,minLat,maxLon,maxLat


class PowerRequest(BaseModel):
    start_date: str  # YYYYMMDD
    end_date: str    # YYYYMMDD
    latitude: float
    longitude: float
    parameters: str | None = "T2M,PRECTOTCORR,RH2M,WS2M"  # Temperature, Precipitation, Humidity, Wind Speed
    community: str | None = "AG"  # AG=Agroclimatology (good for flood/agriculture)


class FloodRiskRequest(BaseModel):
    start_date: str  # YYYY-MM-DD
    end_date: str    # YYYY-MM-DD
    latitude: float
    longitude: float


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "service": "BahaLa Na IMERG fetcher"}


@app.post("/api/imerg")
async def fetch_imerg(req: ImergRequest, authorization: str = Header(None)):
    """Fetch IMERG granule(s) from CMR and return a small summary."""

    if not authorization:
        if EARTHDATA_JWT:
            authorization = f"Bearer {EARTHDATA_JWT}"
        else:
            raise HTTPException(
                status_code=401,
                detail="Missing Authorization header. Provide 'Bearer <token>' or set EARTHDATA_JWT environment variable."
            )

    params = {
        "short_name": "GPM_3IMERGDL",
        "page_size": 10,
        "sort_key": "start_date",
        "temporal": f"{req.start_date}T00:00:00Z/{req.end_date}T23:59:59Z",
    }
    if req.bbox:
        params["bounding_box"] = req.bbox

    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.get(CMR_SEARCH_URL, params=params)
        r.raise_for_status()
        results = r.json()

    items = results.get("feed", {}).get("entry", [])
    if not items:
        raise HTTPException(status_code=404, detail="No IMERG granules found for the query")

    granule = items[0]
    links = granule.get("links", [])

    # Find a download URL
    download_url = None
    for L in links:
        href = L.get("href")
        rel = L.get("rel", "")
        type_ = L.get("type", "")
        if href and ("data" in rel or type_ in ("application/x-hdf", "application/x-netcdf", "application/octet-stream")):
            download_url = href
            break
    if not download_url:
        for L in links:
            if L.get("href"):
                download_url = L.get("href")
                break

    if not download_url:
        raise HTTPException(status_code=404, detail="No downloadable URL found")

    headers = {"Authorization": authorization}
    async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
        resp = await client.get(download_url, headers=headers)
        resp.raise_for_status()
        content = resp.content

    # Save to temporary file
    suffix = os.path.splitext(download_url)[1] or ".h5"
    fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    with open(tmp_path, "wb") as f:
        f.write(content)

    if HAS_XARRAY:
        try:
            ds = xr.open_dataset(tmp_path)
            summary = {v: list(ds[v].shape) for v in ds.data_vars}
            coords = {c: list(ds[c].values.shape) if hasattr(ds[c].values, 'shape') else None for c in ds.coords}

            precip_sample = None
            for candidate in ("precipitationCal", "precipitation", "rainfall", "precip"):
                if candidate in ds:
                    try:
                        precip_sample = float(ds[candidate].mean().item())
                    except Exception:
                        precip_sample = None
                    break

            ds.close()
            os.remove(tmp_path)
            return {
                "granule_id": granule.get("id"),
                "download_url": download_url,
                "variables": summary,
                "coords": coords,
                "precip_mean_sample": precip_sample,
            }
        except Exception as e:
            os.remove(tmp_path)
            raise HTTPException(status_code=500, detail=f"Failed to open dataset: {str(e)}")

    return {
        "granule_id": granule.get("id"),
        "download_url": download_url,
        "note": "xarray not installed; file downloaded locally",
        "local_temp_path": tmp_path,
    }


@app.post("/api/imerg/metadata")
async def imerg_metadata(req: ImergRequest, authorization: str = Header(None)):
    """Return metadata for IMERG granules from CMR (no downloads)."""
    if not authorization:
        if EARTHDATA_JWT:
            authorization = f"Bearer {EARTHDATA_JWT}"
        else:
            raise HTTPException(
                status_code=401,
                detail="Missing Authorization header. Provide 'Bearer <token>' or set EARTHDATA_JWT environment variable."
            )

    params = {
        "short_name": "GPM_3IMERGDL",
        "page_size": 20,
        "sort_key": "start_date",
        "temporal": f"{req.start_date}T00:00:00Z/{req.end_date}T23:59:59Z",
    }
    if req.bbox:
        params["bounding_box"] = req.bbox

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(CMR_SEARCH_URL, params=params)
        r.raise_for_status()
        results = r.json()

    entries = results.get("feed", {}).get("entry", [])
    granules = []
    for g in entries:
        granules.append({
            "id": g.get("id"),
            "title": g.get("title"),
            "start_time": g.get("time_start"),
            "end_time": g.get("time_end"),
            "size": g.get("granule_size"),
            "links": g.get("links", []),
        })

    return {
        "total_hits": results.get("feed", {}).get("hits", len(entries)),
        "count": len(granules),
        "granules": granules
    }


@app.post("/api/power/climate")
async def fetch_power_data(req: PowerRequest):
    """
    Fetch climate data from NASA POWER API for a specific location and date range.
    
    No authentication required - POWER API is publicly accessible.
    
    Parameters:
    - start_date: YYYYMMDD format (e.g., "20240901")
    - end_date: YYYYMMDD format (e.g., "20240930")
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


@app.post("/api/flood-risk")
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
    power_start = req.start_date.replace("-", "")
    power_end = req.end_date.replace("-", "")
    
    # Create bbox around the point (±0.5 degrees)
    bbox = f"{req.longitude-0.5},{req.latitude-0.5},{req.longitude+0.5},{req.latitude+0.5}"
    
    # Fetch IMERG data (rainfall)
    imerg_req = ImergRequest(
        start_date=req.start_date,
        end_date=req.end_date,
        bbox=bbox
    )
    
    if not authorization:
        if EARTHDATA_JWT:
            authorization = f"Bearer {EARTHDATA_JWT}"
        else:
            raise HTTPException(
                status_code=401,
                detail="Missing Authorization header for IMERG data"
            )
    
    # Get IMERG metadata (lightweight)
    params = {
        "short_name": "GPM_3IMERGDL",
        "page_size": 10,
        "sort_key": "start_date",
        "temporal": f"{req.start_date}T00:00:00Z/{req.end_date}T23:59:59Z",
        "bounding_box": bbox
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(CMR_SEARCH_URL, params=params)
        r.raise_for_status()
        imerg_results = r.json()
    
    imerg_granules = imerg_results.get("feed", {}).get("entry", [])
    
    # Fetch POWER climate data
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


