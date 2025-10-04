# Backend - BahaLa Na Climate Data API

FastAPI server providing NASA climate data for flood risk assessment.

---

## Setup

```powershell
# Create virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Set NASA Earthdata JWT token
$env:EARTHDATA_JWT = "your_token_here"

# Run server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

---

## Project Structure

```
backend/
├── main.py                 # Application entry point
├── app/
│   ├── config.py          # Configuration settings
│   ├── models.py          # Pydantic request/response models
│   ├── utils.py           # Utility functions
│   └── routes/
│       ├── health.py      # Health check
│       ├── imerg.py       # IMERG endpoints
│       ├── power.py       # POWER endpoint
│       └── flood_risk.py  # Flood risk endpoint
├── requirements.txt
├── test_client.py
└── test_power_api.py
```

---

## API Endpoints

### Health Check
```http
GET /
GET /api/
```

### IMERG (Satellite Rainfall)
```http
POST /api/imerg/metadata
POST /api/imerg

Request body:
{
  "start_date": "2025-01-01",  // YYYY-MM-DD
  "end_date": "2025-01-07",
  "bbox": "115,4,126,21"       // Optional: minLon,minLat,maxLon,maxLat
}

Headers:
Authorization: Bearer <your_jwt_token>
```

### POWER (Climate Data)
```http
POST /api/power/climate

Request body:
{
  "start_date": "20250101",    // YYYYMMDD
  "end_date": "20250107",
  "latitude": 14.5995,
  "longitude": 120.9842,
  "parameters": "T2M,PRECTOTCORR,RH2M,WS2M"
}

No authentication required!
```

### Flood Risk Assessment
```http
POST /api/flood-risk

Request body:
{
  "start_date": "2025-01-01",  // YYYY-MM-DD
  "end_date": "2025-01-07",
  "latitude": 14.5995,
  "longitude": 120.9842
}

Headers:
Authorization: Bearer <your_jwt_token>
```

---

## Testing

### Quick Test

```powershell
# Test POWER API (no auth)
$body = '{"start_date":"20250101","end_date":"20250107","latitude":14.5995,"longitude":120.9842}' 
Invoke-RestMethod -Uri http://127.0.0.1:8000/api/power/climate -Method Post -Body $body -ContentType 'application/json'
```

### Run Test Suite

```powershell
python test_power_api.py
```

---

## Configuration

### Environment Variables

- `EARTHDATA_JWT` - NASA Earthdata authentication token (required for IMERG)

### Files

- `app/config.py` - API URLs, timeouts, dataset names
- `requirements.txt` - Python dependencies

---

## Development

### Adding a New Endpoint

1. Create route file in `app/routes/`
2. Add router to `app/routes/__init__.py`
3. Update documentation

### Running Tests

```powershell
pytest tests/
```

---

## Documentation

See `/docs` folder for detailed documentation:
- Development notes
- API usage examples
- POWER API integration guide

---

## Dependencies

**Core:**
- fastapi - Web framework
- uvicorn - ASGI server
- httpx - Async HTTP client
- pydantic - Data validation

**Optional:**
- xarray - NetCDF/HDF5 parsing (for IMERG downloads)

---

## Date Formats

| API | Format | Example |
|-----|--------|---------|
| IMERG | YYYY-MM-DD | 2025-01-15 |
| POWER | YYYYMMDD | 20250115 |
| Flood Risk | YYYY-MM-DD | 2025-01-15 |

Use `app.utils.convert_date_format()` for conversion.

---

**Version:** 1.0.0  
**Last Updated:** October 5, 2025
