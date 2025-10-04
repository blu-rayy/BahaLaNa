# BahaLa Na - Development Notes & Knowledge Transfer# BahaLa Na - Development Notes & Knowledge Transfer



**Project:** NASA Space Apps 2025 - Flood Prediction & Citizen Awareness  **Project:** NASA Space Apps 2025 - Flood Prediction & Citizen Awareness  

**Team:** 3rd-year Software Engineering students (5 members)  **Team:** 3rd-year Software Engineering students (5 members)  

**Timeline:** 29 hours to MVP (as of start)  **Timeline:** 29 hours to MVP (as of start)  

**Date Started:** October 5, 2025  **Date Started:** October 5, 2025  

**Last Updated:** October 5, 2025 (Post-Refactoring)

---

---

## Project Overview

## 🚀 RECENT CHANGES (Oct 5, 2025 - Afternoon)

**Name:** BahaLa Na  

### Major Refactoring: Modular Backend Architecture**Tagline:** "From bahala na to may plano na" (From resigned uncertainty to having a plan)



**Why:** Improved code organization, maintainability, and team collaboration.**Mission:** Transform the Filipino cultural phrase "bahala na" (resigned uncertainty about floods) into data-driven flood preparedness using NASA open data.



**New Structure:****Core Tech Stack:**

```- Backend: Python FastAPI

backend/- Data Source: NASA GPM IMERG rainfall data + NASA POWER climate API

├── main.py                      # Application entry point- Authentication: NASA Earthdata JWT tokens

├── app/- Future: React + Leaflet frontend, AI/ML flood risk prediction

│   ├── __init__.py

│   ├── config.py               # Configuration & environment variables---

│   ├── models.py               # Pydantic request/response models

│   ├── utils.py                # Utility functions (date conversion, bbox)## Development Session Summary

│   └── routes/

│       ├── __init__.py         # Router aggregation### What We Built

│       ├── health.py           # Health check endpoint

│       ├── imerg.py            # IMERG rainfall data endpointsA working FastAPI backend that:

│       ├── power.py            # NASA POWER climate data endpoint1. Queries NASA's CMR (Common Metadata Repository) for GPM IMERG rainfall data

│       └── flood_risk.py       # Flood risk assessment endpoint2. Authenticates using NASA Earthdata JWT tokens

├── requirements.txt3. Returns granule metadata with download links (fast, lightweight)

├── test_client.py4. Supports downloading and parsing NetCDF files (with optional xarray)

└── test_power_api.py5. Handles NASA URS (Earthdata login) redirect flows



docs/                            # NEW: Centralized documentation### Key Files Created

├── DEVELOPMENT_NOTES.md        # This file

├── API_README.md               # API usage guide```

└── POWER_API_GUIDE.md          # POWER API integration detailsbackend/

```├── app.py                 # FastAPI server with 3 endpoints

├── requirements.txt       # Python dependencies

**Benefits:**├── README.md             # Setup and usage instructions

- ✅ Separation of concerns (routes, models, config, utils)└── test_client.py        # Simple test client (for reference)

- ✅ Easier testing (import individual modules)```

- ✅ Better Git collaboration (fewer merge conflicts)

- ✅ Scalable architecture for future features---

- ✅ Added CORS middleware for frontend integration

## Technical Decisions & Rationale

**Migration Guide:**

```powershell### 1. Dataset Choice: GPM_3IMERGDL (not GPM_3IMERGDL_07)

# OLD: Run with app.py

python -m uvicorn app:app --host 127.0.0.1 --port 8000**Problem:** Initial queries using `GPM_3IMERGDL_07` returned empty results.



# NEW: Run with main.py**Solution:** Use `GPM_3IMERGDL` (without version suffix) in CMR queries.

python -m uvicorn main:app --host 127.0.0.1 --port 8000

# OR**Why:** NASA CMR sometimes prefers the base dataset name rather than version-specific names. The actual granules returned are version V07B.

python main.py

```**Code location:** `app.py` lines ~45 and ~145 (both endpoints)



### NASA POWER API Integration```python

params = {

**Added:** `/api/power/climate` endpoint (publicly accessible, no auth!)    "short_name": "GPM_3IMERGDL",  # NOT GPM_3IMERGDL_07

    ...

**Features:**}

- Temperature, precipitation, humidity, wind speed data```

- Historical daily data from NASA POWER

- No authentication required### 2. Optional xarray Dependency

- Complements IMERG satellite data with ground-based observations

**Problem:** Installing xarray on Windows requires HDF5 development libraries, which failed during `pip install`.

**Added:** `/api/flood-risk` endpoint (combined analysis)

**Error encountered:**

**Features:**```

- Queries both IMERG and POWER APIsValueError: did not find HDF5 headers

- Calculates risk score (0-100) with risk level (LOW/MEDIUM/HIGH)error: subprocess-exited-with-error (building h5py, netcdf4, rasterio)

- Shows risk factors (rainfall, humidity, data availability)```

- Returns climate summary statistics

**Solution:** Made xarray optional via try/except import:

**Example (Manila, Jan 2025):**

``````python

Risk Level: 🟡 MEDIUM (Score: 55/100)try:

Factors:    import xarray as xr  # type: ignore

  • High daily rainfall (76.5mm)    HAS_XARRAY = True

  • Moderate average rainfall (31.6mm/day)except Exception:

  • High humidity (89.4%)    xr = None

  • IMERG satellite data available    HAS_XARRAY = False

``````



---**Behavior:**

- If xarray installed: Downloads file, opens with xarray, extracts precipitation data

## Project Overview- If xarray missing: Downloads file, returns metadata and temp file path



**Name:** BahaLa Na  **Note:** The `# type: ignore` comment suppresses Pylance linter warnings about unresolved imports.

**Tagline:** "From bahala na to may plano na" (From resigned uncertainty to having a plan)

### 3. Authentication via Environment Variable

**Mission:** Transform the Filipino cultural phrase "bahala na" (resigned uncertainty about floods) into data-driven flood preparedness using NASA open data.

**Security requirement:** Never commit JWT tokens to version control.

**Core Tech Stack:**

- Backend: Python FastAPI (modular architecture)**Implementation:**

- Data Sources: ```python

  - NASA GPM IMERG (satellite rainfall data)EARTHDATA_JWT = os.getenv("EARTHDATA_JWT")

  - NASA POWER (ground-based climate data)

- Authentication: NASA Earthdata JWT tokens# In endpoints:

- Future: React + Leaflet frontend, AI/ML flood risk predictionif not authorization:

    if EARTHDATA_JWT:

---        authorization = f"Bearer {EARTHDATA_JWT}"

    else:

## API Endpoints Summary        raise HTTPException(status_code=401, detail="...")

```

| Endpoint | Method | Auth Required | Purpose |

|----------|--------|---------------|---------|**Usage:**

| `/` | GET | No | Root info |```powershell

| `/api/` | GET | No | Health check |# PowerShell

| `/api/imerg/metadata` | POST | Yes | Query IMERG granules (fast) |$env:EARTHDATA_JWT = "your_token_here"

| `/api/imerg` | POST | Yes | Download & parse IMERG data |python -m uvicorn app:app --host 127.0.0.1 --port 8000

| `/api/power/climate` | POST | No | Get POWER climate data |```

| `/api/flood-risk` | POST | Yes | Combined flood risk assessment |

**Alternative:** Users can pass `Authorization: Bearer <token>` header directly.

---

### 4. NASA URS Redirect Handling

## Quick Start for New Team Members

**Problem:** NASA data links often redirect to Earthdata URS login for authentication.

### 1. Clone and Setup

**Solution:** Detect redirects, follow URS URL with JWT to obtain session cookies, then retry download:

```powershell

cd backend```python

python -m venv .venvasync with httpx.AsyncClient(timeout=120.0, follow_redirects=False) as client:

.\.venv\Scripts\Activate.ps1    resp = await client.get(download_url, headers=headers)

pip install -r requirements.txt    

```    if resp.status_code in (301, 302, 303, 307, 308):

        loc = resp.headers.get("location")

### 2. Get NASA Earthdata Token        if loc and "urs.earthdata" in loc:

            # Exchange JWT for cookies

1. Go to https://urs.earthdata.nasa.gov/            await client.get(loc, headers=headers, follow_redirects=True)

2. Register/login            # Retry with cookies

3. Navigate to "My Profile" → "Generate Token"            final = await client.get(download_url, follow_redirects=True)

4. Copy the JWT token```



### 3. Set Environment Variable**Why:** Some NASA data providers require cookie-based authentication even with valid JWT.



```powershell### 5. Metadata vs Download Endpoints

$env:EARTHDATA_JWT = "your_token_here"

```**Design decision:** Split into two endpoints for better UX during hackathon.



### 4. Run Server**`POST /api/imerg/metadata`**

- Fast (no download)

```powershell- Returns granule list with download URLs

python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload- Use for browsing available data

```- Response time: ~1-2 seconds



### 5. Test Endpoints**`POST /api/imerg`**

- Downloads actual NetCDF file

```powershell- Attempts to parse with xarray

# Health check- Returns precipitation statistics

Invoke-RestMethod -Uri http://127.0.0.1:8000/api/- Response time: ~10-30 seconds (depends on file size ~30MB)



# POWER API (no auth)---

$body = @{

    start_date = '20250101'## API Endpoints Documentation

    end_date = '20250107'

    latitude = 14.5995### Health Check

    longitude = 120.9842```

} | ConvertTo-JsonGET /

Response: {"status": "ok", "service": "BahaLa Na IMERG fetcher"}

Invoke-RestMethod -Uri http://127.0.0.1:8000/api/power/climate ````

    -Method Post -Body $body -ContentType 'application/json'

### Metadata Query (Recommended for Initial Testing)

# Flood risk (requires auth)```

$body = @{POST /api/imerg/metadata

    start_date = '2025-01-01'Content-Type: application/json

    end_date = '2025-01-07'

    latitude = 14.5995Request:

    longitude = 120.9842{

} | ConvertTo-Json  "start_date": "2024-09-01",

  "end_date": "2024-09-01",

Invoke-RestMethod -Uri http://127.0.0.1:8000/api/flood-risk `  "bbox": "115,4,126,21"  // Optional: minLon,minLat,maxLon,maxLat

    -Method Post -Body $body -ContentType 'application/json' `}

    -Headers @{ Authorization = "Bearer $env:EARTHDATA_JWT" }

```Response:

{

---  "total_hits": 1,

  "count": 1,

## Date Format Reference  "granules": [{

    "id": "G3225068022-GES_DISC",

**IMPORTANT:** Different APIs use different date formats!    "title": "GPM_3IMERGDL.07:3B-DAY-L.MS.MRG.3IMERG.20240901-S000000-E235959.V07B.nc4",

    "start_time": "2024-09-01T00:00:00.000Z",

| API/Endpoint | Format | Example |    "end_time": "2024-09-01T23:59:59.999Z",

|--------------|--------|---------|    "size": "32.9026775360107",

| IMERG (CMR) | `YYYY-MM-DD` | `2025-01-15` |    "links": [

| POWER | `YYYYMMDD` | `20250115` |      {

| Flood Risk | `YYYY-MM-DD` (auto-converts) | `2025-01-15` |        "href": "https://data.gesdisc.earthdata.nasa.gov/data/GPM_L3/...",

        "rel": "http://esipfed.org/ns/fedsearch/1.1/data#",

**Utility function** in `app/utils.py`:        "type": null

```python      },

from app.utils import convert_date_format      ...

    ]

# Convert between formats  }]

power_date = convert_date_format("2025-01-15", "YYYYMMDD")  # → "20250115"}

``````



---### Download & Parse

```

## Module ReferencePOST /api/imerg

Content-Type: application/json

### `app/config.py`

**Purpose:** Centralized configuration (API URLs, auth, timeouts)Request: Same as metadata endpoint



### `app/models.py`Response (with xarray):

**Purpose:** Pydantic models (`ImergRequest`, `PowerRequest`, `FloodRiskRequest`){

  "granule_id": "G3225068022-GES_DISC",

### `app/utils.py`  "download_url": "https://...",

**Purpose:** Helper functions (date conversion, bbox calculations)  "variables": {

    "precipitationCal": [1, 3600, 1800],

### `app/routes/`    ...

**Purpose:** API endpoint definitions  },

- `health.py` - Health check  "coords": {...},

- `imerg.py` - IMERG data endpoints  "precip_mean_sample": 2.34

- `power.py` - POWER climate data}

- `flood_risk.py` - Flood risk assessment

Response (without xarray):

---{

  "granule_id": "G3225068022-GES_DISC",

## Common Errors & Solutions  "download_url": "https://...",

  "note": "xarray not installed...",

### "ModuleNotFoundError: No module named 'app'"  "local_temp_path": "C:\\Users\\...\\tmpXXX.nc4"

**Fix:** Run from `backend/` directory: `python -m uvicorn main:app`}

```

### "Port 8000 already in use"

**Fix:** `Stop-Process -Name python -Force`---



### "Missing Authorization header"## Known Issues & Workarounds

**Fix:** `$env:EARTHDATA_JWT = "your_token"`

### Issue 1: Server Shuts Down When Running Client in Same Terminal

---

**Symptom:** Running `uvicorn` in background, then immediately running client causes server shutdown.

## Project File Structure

**Workaround:** Use two separate PowerShell terminal windows:

```- Terminal 1: Run uvicorn (keep open)

BahaLa Na/- Terminal 2: Run API calls

├── backend/

│   ├── main.py                 # NEW: Entry point**Root cause:** The way background processes were managed in the development environment.

│   ├── app/                    # NEW: Application package

│   │   ├── config.py### Issue 2: Empty Granule Results with valid CMR response

│   │   ├── models.py

│   │   ├── utils.py**Symptom:** CMR returns `"hits": null` but has granules in `entry` array.

│   │   └── routes/

│   ├── requirements.txt**Fix:** Changed response parsing to use entry count as fallback:

│   └── tests/```python

├── docs/                       # NEW: Centralized docs"total_hits": results.get("feed", {}).get("hits", len(entries))

│   ├── DEVELOPMENT_NOTES.md```

│   ├── API_README.md

│   └── POWER_API_GUIDE.md### Issue 3: PowerShell Heredoc Syntax Not Supported

└── frontend/                   # (Coming soon)

```**Symptom:** Trying to use `<<` for Python scripts in PowerShell fails.



---**Workaround:** Use simple `-c` one-liners or external `.py` files.



## Next Steps---



1. **Test with 2025 data** once available## Testing the API

2. **Frontend:** React + Leaflet map

3. **Enhance risk algorithm:** elevation, soil moisture, historical floods### Quick Test Script (PowerShell)

4. **ML model:** Train on historical data

5. **Caching:** Redis for API responses```powershell

6. **Unit tests:** pytest for modules# 1. Set token

$env:EARTHDATA_JWT = "your_jwt_token_here"

---

# 2. Start server

## Resourcescd C:\Users\otaku\Documents\VSC\BahaLaNa\backend

.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000

- **NASA POWER:** https://power.larc.nasa.gov/docs/

- **NASA CMR:** https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html# 3. In another terminal:

- **GPM IMERG:** https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGDL_07/summary# Test health

- **FastAPI:** https://fastapi.tiangolo.com/Invoke-RestMethod -Uri http://127.0.0.1:8000/

- **Project Repo:** github.com/blu-rayy/BahaLaNa

# Test metadata

---$body = '{"start_date":"2024-09-01","end_date":"2024-09-01","bbox":"115,4,126,21"}'

$result = Invoke-RestMethod -Uri http://127.0.0.1:8000/api/imerg/metadata -Method Post -Body $body -ContentType 'application/json'

**Document Version:** 2.0 (Post-Refactoring)  

**Last Updated:** October 5, 2025  # View results

**Status:** Ready for team handoff with modular architecture 🚀$result | ConvertTo-Json -Depth 5


# Extract download link
($result.granules[0].links | Where-Object {$_.rel -like '*data#*'})[0].href
```

### Verified Test Results (as of Oct 5, 2025)

**Query:** Sept 1, 2024, Philippines bbox  
**Result:**  
- Total hits: 1  
- Granule ID: `G3225068022-GES_DISC`  
- Download URL: `https://data.gesdisc.earthdata.nasa.gov/data/GPM_L3/GPM_3IMERGDL.07/2024/09/3B-DAY-L.MS.MRG.3IMERG.20240901-S000000-E235959.V07B.nc4`  
- File size: ~32.9 MB  
- Status: ✅ Working

---

## NASA Earthdata Authentication

### Getting a JWT Token

1. Go to https://urs.earthdata.nasa.gov/
2. Register/login with your account
3. Navigate to "My Profile" → "Generate Token"
4. Copy the JWT (long string starting with `eyJ0...`)
5. Token expires after ~90 days (check expiration in JWT payload)

### Token Structure (for debugging)

JWT tokens have 3 parts separated by `.`:
```
eyJ0eXAi... (header) . eyJ0eXBlOiJV... (payload) . 37Y-9Oin... (signature)
```

Decode payload (base64) to see expiration:
```python
import json, base64
payload = "eyJ0eXBlOiJV..."  # second part of JWT
decoded = json.loads(base64.b64decode(payload + '=='))
print(decoded['exp'])  # Unix timestamp
```

---

## Philippines Bounding Box

For flood prediction focused on Philippines:

```
bbox = "115,4,126,21"
```

Breakdown:
- Min Longitude: 115°E (western edge)
- Min Latitude: 4°N (southern edge, Mindanao)
- Max Longitude: 126°E (eastern edge)
- Max Latitude: 21°N (northern edge, Luzon)

**Note:** IMERG granules are global (covers entire world), so bbox filtering happens client-side or via CMR query parameter.

---

## Dependencies & Installation

### Minimal Requirements (Working on Windows without HDF5 libs)

```txt
fastapi
uvicorn[standard]
httpx
requests
pydantic
```

**These work out of the box on Windows.**

### Optional (Requires HDF5 development libraries)

```txt
xarray
h5py
netcdf4
rasterio
```

**Installation on Windows:**
- Requires Microsoft Visual C++ Build Tools
- Requires HDF5 C libraries
- Alternative: Use conda environment or Docker

**Our approach:** Skip xarray for MVP, use metadata endpoint only. Later, process NetCDF files using external tools or cloud environment.

---

## Future Improvements (Post-Hackathon)

### High Priority
1. **CORS middleware** for frontend integration
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   app.add_middleware(CORSMiddleware, allow_origins=["*"])
   ```

2. **Caching layer** to avoid re-downloading same granules
   - Use Redis or simple file-based cache
   - Key: `{dataset}_{date}_{bbox}`

3. **Rate limiting** to respect NASA API limits
   - Use `slowapi` package
   - Limit: ~10 requests/minute per IP

4. **Frontend integration**
   - React + Leaflet map
   - Display rainfall heatmap
   - Date range picker
   - Flood risk indicator (Low/Med/High)

### Medium Priority
5. **Spatial subsetting** - crop NetCDF to exact region instead of downloading global file
6. **Multiple granule downloads** - support date ranges returning multiple files
7. **OPeNDAP integration** - stream data instead of downloading full files
8. **AI/ML flood prediction model**
   - Features: rainfall amount, location, soil moisture, elevation
   - Output: Flood probability

### Low Priority
9. **Unit tests** (`pytest`)
10. **API documentation** (FastAPI auto-generates at `/docs`)
11. **Docker containerization**
12. **Deployment** (Render, Railway, or AWS Lambda)

---

## Common Errors & Solutions

### Error: "No module named 'fastapi'"
**Cause:** Dependencies not installed  
**Fix:** `pip install -r requirements.txt`

### Error: "Port 8000 already in use"
**Cause:** Previous uvicorn still running  
**Fix:** `Stop-Process -Name python -Force`

### Error: "Missing Authorization header"
**Cause:** EARTHDATA_JWT not set  
**Fix:** `$env:EARTHDATA_JWT = "your_token"`

### Error: "No IMERG granules found"
**Cause:** Date in future or invalid bbox  
**Fix:** Use historical dates (e.g., 2024-09-01)

### Error: "Download failed: 403 Forbidden"
**Cause:** Invalid or expired JWT token  
**Fix:** Generate new token from Earthdata URS

---

## Team Collaboration Tips

### For New Team Members

1. **Clone the repo** and read this file first
2. **Set up Python environment:**
   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. **Get NASA Earthdata token** (see section above)

4. **Test the API** using PowerShell commands in "Testing the API" section

5. **Read the code:**
   - Start with `app.py` health endpoint (`GET /`)
   - Then metadata endpoint (simpler, no download)
   - Finally full download endpoint

### Git Workflow

**⚠️ IMPORTANT:** Never commit tokens!

```bash
# Add .env to .gitignore
echo ".env" >> .gitignore
echo "**/*token*" >> .gitignore
echo "**/*jwt*" >> .gitignore

# Check before committing
git status
git diff

# If you accidentally committed a token:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/app.py" \
  --prune-empty --tag-name-filter cat -- --all
```

### Code Review Checklist

- [ ] No hard-coded tokens or secrets
- [ ] Error handling for all external API calls
- [ ] Type hints on function parameters
- [ ] Docstrings on all endpoints
- [ ] Console logs removed (use logging module)
- [ ] Requirements.txt updated

---

## Resources & References

### NASA APIs
- **CMR Search API:** https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html
- **GPM IMERG Dataset:** https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGDL_07/summary
- **Earthdata Login:** https://urs.earthdata.nasa.gov/
- **NASA POWER API:** https://power.larc.nasa.gov/docs/services/api/

### Documentation
- **FastAPI:** https://fastapi.tiangolo.com/
- **httpx (async HTTP):** https://www.python-httpx.org/
- **xarray:** https://docs.xarray.dev/

### Tools Used During Development
- VS Code with Python and Pylance extensions
- PowerShell 5.1 (Windows)
- Python 3.13
- Virtual environment (venv)

---

## Contact & Questions

If you encounter issues or have questions:

1. Check this document first
2. Review error messages in server logs
3. Test with `curl` or Postman to isolate issues
4. Check NASA Earthdata status: https://www.earthdata.nasa.gov/

**Original developer context:** Session with Claude Sonnet 4.5 on Oct 5, 2025

---

## Appendix: Full Working Example

```powershell
# Complete end-to-end test script

# Step 1: Setup
cd C:\Users\otaku\Documents\VSC\BahaLaNa\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn httpx requests pydantic

# Step 2: Set token (replace with your actual token)
$env:EARTHDATA_JWT = "eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4i..."

# Step 3: Start server (keep this terminal open)
python -m uvicorn app:app --host 127.0.0.1 --port 8000

# Step 4: In new terminal, test
$body = @{
    start_date = "2024-09-01"
    end_date = "2024-09-01"
    bbox = "115,4,126,21"
} | ConvertTo-Json

$result = Invoke-RestMethod `
    -Uri http://127.0.0.1:8000/api/imerg/metadata `
    -Method Post `
    -Body $body `
    -ContentType 'application/json'

# Step 5: View results
Write-Host "Total hits: $($result.total_hits)" -ForegroundColor Green
Write-Host "Granule ID: $($result.granules[0].id)" -ForegroundColor Cyan
Write-Host "Download link: $(($result.granules[0].links | Where-Object {$_.rel -like '*data#*'})[0].href)" -ForegroundColor Yellow

# Expected output:
# Total hits: 1
# Granule ID: G3225068022-GES_DISC
# Download link: https://data.gesdisc.earthdata.nasa.gov/data/GPM_L3/...
```

---

**Document Version:** 1.0  
**Last Updated:** October 5, 2025  
**Status:** Ready for team handoff  

Good luck with NASA Space Apps 2025! 🚀🌊
