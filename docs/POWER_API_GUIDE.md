# NASA POWER API Integration Guide

**Added:** October 5, 2025  
**Status:** ✅ Working and tested  

---

## What Was Added

### New API Endpoints

1. **`POST /api/power/climate`** - NASA POWER climate data (no auth required)
2. **`POST /api/flood-risk`** - Combined IMERG + POWER flood risk assessment

### New Request Models

```python
class PowerRequest(BaseModel):
    start_date: str  # YYYYMMDD format
    end_date: str    # YYYYMMDD format
    latitude: float
    longitude: float
    parameters: str | None = "T2M,PRECTOTCORR,RH2M,WS2M"
    community: str | None = "AG"

class FloodRiskRequest(BaseModel):
    start_date: str  # YYYY-MM-DD format
    end_date: str    # YYYY-MM-DD format
    latitude: float
    longitude: float
```

---

## How to Use NASA POWER API

### 1. Query Climate Data (No Authentication!)

**Endpoint:** `POST /api/power/climate`

**Request:**
```powershell
$body = @{
    start_date = '20240901'  # YYYYMMDD format!
    end_date = '20240907'
    latitude = 14.5995       # Manila
    longitude = 120.9842
    parameters = 'T2M,PRECTOTCORR,RH2M,WS2M'
    community = 'AG'
} | ConvertTo-Json

Invoke-RestMethod -Uri http://127.0.0.1:8000/api/power/climate `
    -Method Post `
    -Body $body `
    -ContentType 'application/json'
```

**Available Parameters:**
- `T2M` - Temperature at 2 meters (°C)
- `PRECTOTCORR` - Precipitation corrected (mm/day)
- `RH2M` - Relative humidity (%)
- `WS2M` - Wind speed (m/s)
- `ALLSKY_SFC_SW_DWN` - Solar radiation (MJ/m²/day)
- `T2M_MAX` - Max temperature
- `T2M_MIN` - Min temperature
- Many more at: https://power.larc.nasa.gov/docs/

**Communities:**
- `AG` - Agroclimatology (recommended for flood/agriculture)
- `RE` - Renewable Energy
- `SB` - Sustainable Buildings

**Response:**
```json
{
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "daily_data": [
    {
      "date": "20240901",
      "T2M": 27.56,
      "PRECTOTCORR": 45.07,
      "RH2M": 86.09,
      "WS2M": 0.78
    },
    ...
  ],
  "metadata": {
    "source": "NASA POWER API",
    "version": "2.5.8"
  }
}
```

---

### 2. Assess Flood Risk (Combined Analysis)

**Endpoint:** `POST /api/flood-risk`

**Requires:** NASA Earthdata JWT token

**Request:**
```powershell
$body = @{
    start_date = '2024-09-01'  # YYYY-MM-DD format!
    end_date = '2024-09-07'
    latitude = 14.5995
    longitude = 120.9842
} | ConvertTo-Json

Invoke-RestMethod -Uri http://127.0.0.1:8000/api/flood-risk `
    -Method Post `
    -Body $body `
    -ContentType 'application/json' `
    -Headers @{ Authorization = "Bearer $env:EARTHDATA_JWT" }
```

**What It Does:**
1. Queries IMERG for satellite rainfall data (±0.5° around point)
2. Queries POWER for ground-based climate data (temperature, humidity, etc.)
3. Calculates a risk score (0-100) based on:
   - Daily rainfall amount
   - Average rainfall over period
   - Humidity levels
   - Availability of satellite data

**Risk Levels:**
- `LOW` (0-29) - 🟢 Minimal flood risk
- `MEDIUM` (30-59) - 🟡 Moderate risk, monitor conditions
- `HIGH` (60-100) - 🔴 Significant flood risk, take precautions

**Response:**
```json
{
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "flood_risk": {
    "level": "MEDIUM",
    "score": 55,
    "factors": [
      "High daily rainfall (76.5mm)",
      "Moderate average rainfall (31.6mm/day)",
      "High humidity (89.4%)",
      "IMERG satellite data available"
    ]
  },
  "climate_summary": {
    "avg_precipitation_mm": 31.59,
    "max_precipitation_mm": 76.49,
    "avg_temperature_c": 26.74,
    "avg_humidity_percent": 89.37
  },
  "data_sources": {
    "imerg_granules_found": 7,
    "power_data_days": 7
  }
}
```

---

## Tested Results

### Manila (Sept 1-7, 2024)

**POWER Climate Data:**
```
Date: 20240901 - Temp: 27.56°C, Rain: 45.07mm, Humidity: 86.09%
Date: 20240902 - Temp: 25.72°C, Rain: 76.49mm, Humidity: 94.73% ⚠️ High
Date: 20240903 - Temp: 26.49°C, Rain: 17.40mm, Humidity: 91.45%
Date: 20240904 - Temp: 26.47°C, Rain: 43.74mm, Humidity: 92.80%
Date: 20240905 - Temp: 26.42°C, Rain: 26.63mm, Humidity: 91.31%
Date: 20240906 - Temp: 26.80°C, Rain: 9.21mm, Humidity: 88.91%
Date: 20240907 - Temp: 27.70°C, Rain: 2.60mm, Humidity: 80.29%
```

**Flood Risk Assessment:**
- **Risk Level:** 🟡 MEDIUM
- **Risk Score:** 55/100
- **Max Rainfall:** 76.49mm on Sept 2
- **Avg Rainfall:** 31.59mm/day
- **IMERG Granules:** 7 days available

---

## Date Format Differences ⚠️

**Important:** Different endpoints use different date formats!

| Endpoint | Format | Example |
|----------|--------|---------|
| `/api/imerg` | YYYY-MM-DD | `2024-09-01` |
| `/api/imerg/metadata` | YYYY-MM-DD | `2024-09-01` |
| `/api/power/climate` | YYYYMMDD | `20240901` |
| `/api/flood-risk` | YYYY-MM-DD | `2024-09-01` |

The `/api/flood-risk` endpoint automatically converts between formats.

---

## Integration Tips

### For Frontend Developers

**Display Flood Risk on Map:**
```javascript
// Fetch flood risk for clicked location
async function checkFloodRisk(lat, lon) {
  const response = await fetch('http://localhost:8000/api/flood-risk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${EARTHDATA_JWT}`
    },
    body: JSON.stringify({
      start_date: '2024-09-01',
      end_date: '2024-09-30',
      latitude: lat,
      longitude: lon
    })
  });
  
  const data = await response.json();
  
  // Color-code marker based on risk
  const color = {
    'LOW': 'green',
    'MEDIUM': 'yellow',
    'HIGH': 'red'
  }[data.flood_risk.level];
  
  return { ...data, markerColor: color };
}
```

**Get Climate Time Series:**
```javascript
// Get daily rainfall for chart
async function getClimateTrend(lat, lon, startDate, endDate) {
  const response = await fetch('http://localhost:8000/api/power/climate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      start_date: startDate.replace(/-/g, ''),  // YYYYMMDD
      end_date: endDate.replace(/-/g, ''),
      latitude: lat,
      longitude: lon,
      parameters: 'PRECTOTCORR,T2M,RH2M'
    })
  });
  
  const data = await response.json();
  
  // Transform for chart.js
  return data.daily_data.map(d => ({
    date: d.date,
    rainfall: d.PRECTOTCORR,
    temperature: d.T2M,
    humidity: d.RH2M
  }));
}
```

---

## Enhancing the Flood Risk Algorithm

**Current implementation** (in `app.py`):
- Simple rule-based scoring
- Factors: rainfall amount, humidity, data availability

**Future improvements:**
1. **Add elevation data** - Low-lying areas = higher risk
2. **Soil moisture** - Saturated soil = less absorption
3. **Historical floods** - Known flood-prone areas
4. **River proximity** - Near rivers = higher risk
5. **Machine Learning model:**
   ```python
   # Features: rainfall, humidity, temp, elevation, soil_moisture, 
   #           distance_to_river, historical_flood_count
   # Target: flood_occurred (0 or 1)
   
   from sklearn.ensemble import RandomForestClassifier
   model = RandomForestClassifier()
   model.fit(X_train, y_train)
   flood_probability = model.predict_proba(features)[0][1]
   ```

---

## Common Philippine Cities Coordinates

For testing:

```python
CITIES = {
    "Manila": {"lat": 14.5995, "lon": 120.9842},
    "Cebu City": {"lat": 10.3157, "lon": 123.8854},
    "Davao City": {"lat": 7.1907, "lon": 125.4553},
    "Baguio City": {"lat": 16.4023, "lon": 120.5960},
    "Quezon City": {"lat": 14.6760, "lon": 121.0437},
    "Makati": {"lat": 14.5547, "lon": 121.0244},
    "Zamboanga": {"lat": 6.9214, "lon": 122.0790},
    "Tacloban": {"lat": 11.2447, "lon": 125.0036},  # Haiyan impact
}
```

---

## Error Handling

### POWER API Errors

**Problem:** `{"properties": {"parameter": {}}}` - Empty response  
**Cause:** Invalid coordinates or date range  
**Solution:** Verify lat/lon are within valid ranges, dates are historical

**Problem:** `"detail": "Unexpected POWER API response format"`  
**Cause:** API response structure changed  
**Solution:** Check NASA POWER API docs, update parsing logic

### Flood Risk Errors

**Problem:** `"Missing Authorization header for IMERG data"`  
**Cause:** No JWT token provided  
**Solution:** Set `$env:EARTHDATA_JWT` or pass `Authorization` header

**Problem:** Zero IMERG granules found  
**Cause:** Future dates or invalid bounding box  
**Solution:** Use historical dates, verify bbox calculation

---

## Performance Notes

| Endpoint | Avg Response Time | Data Transfer |
|----------|-------------------|---------------|
| `/api/power/climate` | ~1-2 seconds | ~5-10 KB |
| `/api/flood-risk` | ~3-5 seconds | ~15-30 KB |
| `/api/imerg/metadata` | ~1-2 seconds | ~10-20 KB |

**Caching recommendation:**
- Cache POWER data for 24 hours (updates daily)
- Cache IMERG metadata for 6 hours
- Cache flood risk scores for 1 hour

---

## Next Steps for Team

1. **Test with real typhoon dates:**
   - Typhoon Haiyan (Yolanda): Nov 8, 2013
   - Typhoon Mangkhut (Ompong): Sept 15, 2018
   - Recent monsoon floods: Check PAGASA data

2. **Integrate with frontend:**
   - Display flood risk on Leaflet map
   - Show rainfall time series chart
   - Add location search (cities/provinces)

3. **Add more data sources:**
   - PAGASA local weather stations
   - River gauge levels (if available)
   - Social media flood reports

4. **Improve risk model:**
   - Collect historical flood data
   - Train ML model
   - Add real-time alerts

---

## Resources

- **NASA POWER Docs:** https://power.larc.nasa.gov/docs/
- **Parameter List:** https://power.larc.nasa.gov/docs/services/api/temporal/
- **Data Methodology:** https://power.larc.nasa.gov/docs/methodology/
- **PAGASA:** https://www.pagasa.dost.gov.ph/ (Philippines weather service)

---

**Status:** Ready for integration with frontend 🚀
