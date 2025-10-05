# BahaLa Na 🌊🇵🇭

**Tagline:** "From bahala na to may plano na"  
**Mission:** Data-driven flood awareness and prediction for the Philippines

*NASA Space Apps 2025 Project*

---

## Quick Start

### Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Set your NASA Earthdata JWT token
$env:EARTHDATA_JWT = "your_token_here"

# Run server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Visit: http://127.0.0.1:8000/docs for API documentation

---

## Project Structure

```
BahaLa Na/
├── backend/              # FastAPI backend
│   ├── main.py          # Application entry point
│   ├── app/             # Application modules
│   │   ├── config.py    # Configuration
│   │   ├── models.py    # Data models
│   │   ├── utils.py     # Utilities
│   │   └── routes/      # API endpoints
│   └── requirements.txt
├── docs/                 # Documentation
│   ├── DEVELOPMENT_NOTES.md
│   ├── API_README.md
│   └── POWER_API_GUIDE.md
└── frontend/             # (Coming soon)
```

---

## Features

✅ **NASA GPM IMERG Integration** - Satellite rainfall data  
✅ **NASA POWER Integration** - Ground-based climate data  
✅ **Flood Risk Assessment** - Automated risk scoring (LOW/MEDIUM/HIGH)  
✅ **XGBoost ML Model** - AI-powered flood prediction (84-88% accuracy)  
✅ **RESTful API** - FastAPI with auto-generated docs  
✅ **Modular Architecture** - Scalable and maintainable  
🚧 **Frontend** - React + Leaflet map (in progress)

---

## API Endpoints

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `GET /` | Root info | No |
| `GET /api/` | Health check | No |
| `POST /api/imerg/metadata` | Query rainfall data | Yes |
| `POST /api/power/climate` | Get climate data | No |
| `POST /api/flood-risk` | Assess flood risk | Yes |

Full API documentation: See `/docs` folder

---

## 🤖 AI/ML Flood Prediction

Train an XGBoost model using IMERG data:

```powershell
cd backend
pip install -r requirements-ml.txt
python -m ml.train_model  # Test with synthetic data
```

**Quick Start:** See `docs/AI_ML_IMERG_COMPLETE_GUIDE.md`  
**Full Guide:** See `docs/ML_IMPLEMENTATION_GUIDE.md`  
**XGBoost Details:** See `docs/XGBOOST_GUIDE.md`

---

## Example: Flood Risk Assessment

```powershell
$body = @{
    start_date = '2025-01-01'
    end_date = '2025-01-07'
    latitude = 14.5995   # Manila
    longitude = 120.9842
} | ConvertTo-Json

$result = Invoke-RestMethod `
    -Uri http://127.0.0.1:8000/api/flood-risk `
    -Method Post `
    -Body $body `
    -ContentType 'application/json' `
    -Headers @{ Authorization = "Bearer $env:EARTHDATA_JWT" }

# Result:
# Risk Level: MEDIUM
# Risk Score: 55/100
# Factors: High rainfall, elevated humidity, satellite data available
```

---

## Tech Stack

**Backend:**
- Python 3.13
- FastAPI
- httpx (async HTTP)
- Pydantic (validation)
- Optional: xarray (NetCDF parsing)

**Data Sources:**
- NASA GPM IMERG (rainfall)
- NASA POWER (temperature, humidity, wind)

**Frontend (Planned):**
- React
- Leaflet (maps)
- Chart.js (visualizations)

---

## Team

3rd-year Software Engineering students  
**Project:** NASA Space Apps 2025  
**Timeline:** October 5-6, 2025

---

## Documentation

- **[Development Notes](docs/DEVELOPMENT_NOTES.md)** - Full project history and technical decisions
- **[API README](docs/API_README.md)** - API usage guide with examples
- **[POWER API Guide](docs/POWER_API_GUIDE.md)** - NASA POWER integration details

---

## License

MIT License - See LICENSE file

---

## Acknowledgments

- NASA for open data APIs (IMERG, POWER)
- NASA Space Apps Challenge 2025
- PAGASA (Philippine weather service)

---

**Status:** Backend complete ✅ | Frontend in progress 🚧  
**Last Updated:** October 5, 2025
