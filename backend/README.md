# BahaLa Na - IMERG fetcher (backend)

FastAPI service for querying NASA's GPM IMERG rainfall data using NASA CMR API and Earthdata authentication.

## Files
- `app.py` - FastAPI app with endpoints for IMERG data
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

## Notes

- **Authentication:** Requires NASA Earthdata JWT token (get from https://urs.earthdata.nasa.gov/)
- **xarray:** Optional dependency - app works without it but returns metadata only
- **Bounding box:** Format is `minLon,minLat,maxLon,maxLat` (e.g., Philippines: `115,4,126,21`)
- **Date format:** `YYYY-MM-DD`

## Future Improvements

- Caching downloaded granules
- Spatial subsetting (crop to exact region)
- Multiple granule downloads
- Streaming for large files
- Rate limiting and retry logic
