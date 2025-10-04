# BahaLa Na - Climate Data API (backend)

FastAPI service for querying:
- **NASA GPM IMERG** - Satellite rainfall data (requires authentication)
- **NASA POWER** - Ground-based climate data (publicly accessible)
- **Flood Risk Assessment** - Combined analysis for flood prediction

## Files
- `app.py` - FastAPI app with endpoints for climate data and flood risk
- `requirements.txt` - Python dependencies
- `test_client.py` - Simple test client

## Setup

### 1. Create virtual environment and install dependencies

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Set your NASA Earthdata JWT token

**Option A: Environment Variable (Recommended)**
```powershell
$env:EARTHDATA_JWT = "eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4i..."
```

**Option B: Pass in Authorization header** (see usage examples below)

### 3. Run the server

```powershell
python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

The server will be available at `http://127.0.0.1:8000`

## API Endpoints

### `GET /`
Health check endpoint.

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/
```

### `POST /api/imerg/metadata`
Query CMR for IMERG granule metadata (no download). Fast and lightweight.

**Request body:**
```json
{
  "start_date": "2024-09-01",
  "end_date": "2024-09-01",
  "bbox": "115,4,126,21"
}
```

**Example (using environment variable):**
```powershell
$body = @{ start_date='2024-09-01'; end_date='2024-09-01'; bbox='115,4,126,21' } | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:8000/api/imerg/metadata -Method Post -Body $body -ContentType 'application/json'
```

**Example (with Authorization header):**
```powershell
$token = 'Bearer eyJ0eXA...'
$body = @{ start_date='2024-09-01'; end_date='2024-09-01'; bbox='115,4,126,21' } | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:8000/api/imerg/metadata -Method Post -Body $body -Headers @{ Authorization = $token } -ContentType 'application/json'
```

**Response:**
```json
{
  "total_hits": 1,
  "count": 1,
  "granules": [{
    "id": "G3225068022-GES_DISC",
    "title": "GPM_3IMERGDL.07:3B-DAY-L.MS.MRG.3IMERG...",
    "start_time": "2024-09-01T00:00:00.000Z",
    "end_time": "2024-09-01T23:59:59.999Z",
    "size": "32.90",
    "links": [...]
  }]
}
```

### `POST /api/imerg`
Download IMERG granule and extract rainfall data (requires xarray).

**Request body:** Same as metadata endpoint

**Response:** Granule data with precipitation statistics (if xarray installed) or download path

### `POST /api/power/climate`
Get climate data from NASA POWER API for a specific location. **No authentication required!**

**Request body:**
```json
{
  "start_date": "20240901",
  "end_date": "20240930",
  "latitude": 14.5995,
  "longitude": 120.9842,
  "parameters": "T2M,PRECTOTCORR,RH2M,WS2M",
  "community": "AG"
}
```

**Parameters:**
- `start_date`, `end_date`: **YYYYMMDD** format (different from IMERG!)
- `latitude`: -90 to 90 (e.g., Manila: 14.5995)
- `longitude`: -180 to 180 (e.g., Manila: 120.9842)
- `parameters`: Comma-separated list:
  - `T2M` - Temperature at 2 meters (°C)
  - `PRECTOTCORR` - Precipitation corrected (mm/day)
  - `RH2M` - Relative humidity at 2 meters (%)
  - `WS2M` - Wind speed at 2 meters (m/s)
  - `ALLSKY_SFC_SW_DWN` - Solar radiation (MJ/m²/day)
- `community`: `AG` (Agroclimatology), `RE` (Renewable Energy), or `SB` (Sustainable Buildings)

**Example:**
```powershell
$body = @{
    start_date = '20240901'
    end_date = '20240930'
    latitude = 14.5995
    longitude = 120.9842
    parameters = 'T2M,PRECTOTCORR,RH2M,WS2M'
    community = 'AG'
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri http://127.0.0.1:8000/api/power/climate -Method Post -Body $body -ContentType 'application/json'
$result.daily_data | Select-Object -First 3
```

**Response:**
```json
{
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "date_range": {
    "start": "20240901",
    "end": "20240930"
  },
  "daily_data": [
    {
      "date": "20240901",
      "T2M": 28.5,
      "PRECTOTCORR": 12.3,
      "RH2M": 78.2,
      "WS2M": 3.1
    },
    ...
  ],
  "metadata": {
    "source": "NASA POWER API",
    "community": "AG",
    "version": "2.5.8"
  }
}
```

### `POST /api/flood-risk`
**Combined endpoint:** Fetches both IMERG and POWER data, calculates flood risk score.

**Query parameters:**
- `start_date`: YYYY-MM-DD format
- `end_date`: YYYY-MM-DD format
- `latitude`: Location latitude
- `longitude`: Location longitude

**Example:**
```powershell
$token = "Bearer $env:EARTHDATA_JWT"
$params = @{
    start_date = '2024-09-01'
    end_date = '2024-09-30'
    latitude = 14.5995
    longitude = 120.9842
}

$result = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/flood-risk" `
    -Method Post `
    -Body ($params | ConvertTo-Json) `
    -Headers @{ Authorization = $token } `
    -ContentType 'application/json'

Write-Host "Risk Level: $($result.flood_risk.level)" -ForegroundColor $(if($result.flood_risk.level -eq 'HIGH'){'Red'}elseif($result.flood_risk.level -eq 'MEDIUM'){'Yellow'}else{'Green'})
Write-Host "Risk Score: $($result.flood_risk.score)/100"
Write-Host "`nRisk Factors:"
$result.flood_risk.factors | ForEach-Object { Write-Host "  - $_" }
```

**Response:**
```json
{
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "flood_risk": {
    "level": "MEDIUM",
    "score": 45,
    "factors": [
      "High daily rainfall (87.2mm)",
      "Moderate average rainfall (23.4mm/day)",
      "High humidity (82.3%)",
      "IMERG satellite data available"
    ]
  },
  "climate_summary": {
    "avg_precipitation_mm": 23.4,
    "max_precipitation_mm": 87.2,
    "avg_temperature_c": 28.1,
    "avg_humidity_percent": 82.3
  },
  "data_sources": {
    "imerg_granules_found": 30,
    "power_data_days": 30
  }
}
```

## Notes

- **IMERG Authentication:** Requires NASA Earthdata JWT token (get from https://urs.earthdata.nasa.gov/)
- **POWER API:** Publicly accessible, no authentication needed
- **Date formats:** 
  - IMERG endpoints: `YYYY-MM-DD` (e.g., `2024-09-01`)
  - POWER endpoint: `YYYYMMDD` (e.g., `20240901`)
- **Flood risk algorithm:** Simple rule-based scoring (can be enhanced with ML)
- **xarray:** Optional dependency - IMERG download works without it but returns metadata only

## Future Improvements

- Caching downloaded granules
- Spatial subsetting (crop to exact region)
- Multiple granule downloads
- Streaming for large files
- Rate limiting and retry logic
