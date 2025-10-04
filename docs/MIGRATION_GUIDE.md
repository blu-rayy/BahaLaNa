# Migration Guide: Refactored Backend (Oct 5, 2025)

## Summary of Changes

### 1. **Modular Architecture**
   - Old: Single `app.py` file (~400+ lines)
   - New: Organized into `app/` package with separate modules

### 2. **Documentation Organization**
   - Old: Files scattered in root and backend/
   - New: Centralized in `docs/` folder

### 3. **Updated to 2025 Dates**
   - All examples now use 2025 dates
   - Test scripts updated

---

## File Changes

### Deleted Files
```
❌ backend/app.py                 → Replaced by main.py + app/ package
❌ DEVELOPMENT_NOTES.md (root)    → Moved to docs/
❌ backend/README.md              → Moved to docs/API_README.md
❌ backend/POWER_API_GUIDE.md     → Moved to docs/
```

### New Files
```
✅ backend/main.py                → Application entry point
✅ backend/app/__init__.py
✅ backend/app/config.py          → Configuration
✅ backend/app/models.py          → Pydantic models
✅ backend/app/utils.py           → Utility functions
✅ backend/app/routes/__init__.py
✅ backend/app/routes/health.py   → Health endpoint
✅ backend/app/routes/imerg.py    → IMERG endpoints
✅ backend/app/routes/power.py    → POWER endpoint
✅ backend/app/routes/flood_risk.py → Flood risk endpoint
✅ docs/DEVELOPMENT_NOTES.md      → Updated with refactoring details
✅ docs/API_README.md             → API usage guide
✅ docs/POWER_API_GUIDE.md        → POWER API details
✅ README.md (root)               → Project overview
✅ backend/README.md (new)        → Backend-specific guide
```

---

## How to Update Your Local Environment

### If You Have Existing Code

```powershell
# 1. Stop any running servers
Stop-Process -Name python -Force

# 2. Pull latest changes
git pull origin main

# 3. Reinstall dependencies (if needed)
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 4. Update your run command
# OLD:
python -m uvicorn app:app --host 127.0.0.1 --port 8000

# NEW:
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### If Starting Fresh

```powershell
# Clone repository
git clone https://github.com/blu-rayy/BahaLaNa.git
cd BahaLaNa/backend

# Setup virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Set environment variable
$env:EARTHDATA_JWT = "your_token_here"

# Run server
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

---

## Code Migration Examples

### Importing Models (OLD vs NEW)

```python
# OLD (when everything was in app.py)
from app import ImergRequest, PowerRequest

# NEW (modular structure)
from app.models import ImergRequest, PowerRequest, FloodRiskRequest
```

### Importing Configuration

```python
# OLD
CMR_SEARCH_URL = "https://..."  # Hard-coded in app.py

# NEW
from app.config import CMR_SEARCH_URL, NASA_POWER_URL, EARTHDATA_JWT
```

### Using Utilities

```python
# NEW (didn't exist before)
from app.utils import convert_date_format, create_bbox_from_point

# Convert dates
power_date = convert_date_format("2025-01-15", "YYYYMMDD")  # → "20250115"

# Create bounding box
bbox = create_bbox_from_point(14.5995, 120.9842, margin=0.5)
# → "120.4842,14.0995,121.4842,15.0995"
```

---

## Testing the New Structure

### 1. Test Root Endpoint
```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/
```

**Expected output:**
```json
{
  "name": "BahaLa Na Climate Data API",
  "version": "1.0.0",
  "tagline": "From bahala na to may plano na",
  "endpoints": {
    "health": "/api/",
    "imerg_metadata": "/api/imerg/metadata",
    ...
  }
}
```

### 2. Test POWER API (2025 dates)
```powershell
$body = @{
    start_date = '20250101'
    end_date = '20250107'
    latitude = 14.5995
    longitude = 120.9842
} | ConvertTo-Json

Invoke-RestMethod -Uri http://127.0.0.1:8000/api/power/climate `
    -Method Post -Body $body -ContentType 'application/json'
```

### 3. Test Flood Risk (2025 dates)
```powershell
$body = @{
    start_date = '2025-01-01'
    end_date = '2025-01-07'
    latitude = 14.5995
    longitude = 120.9842
} | ConvertTo-Json

Invoke-RestMethod -Uri http://127.0.0.1:8000/api/flood-risk `
    -Method Post -Body $body -ContentType 'application/json' `
    -Headers @{ Authorization = "Bearer $env:EARTHDATA_JWT" }
```

---

## Benefits of New Structure

### For Development

✅ **Parallel Work:** Multiple team members can edit different route files without conflicts  
✅ **Easier Testing:** Import and test individual modules  
✅ **Code Navigation:** Find specific endpoints quickly  
✅ **Reusability:** Utilities can be imported anywhere  

### Example: Two People Working Simultaneously

**Person A:** Working on `app/routes/imerg.py` (IMERG endpoints)  
**Person B:** Working on `app/routes/power.py` (POWER endpoint)  
**Person C:** Working on frontend

**Result:** No Git merge conflicts! 🎉

### For Maintenance

✅ **Bug Fixes:** Change one file without affecting others  
✅ **Adding Features:** Create new route file, import in `__init__.py`  
✅ **Configuration:** All settings in one place (`config.py`)  
✅ **Type Safety:** Pydantic models in dedicated file  

---

## Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'app'"

**Cause:** Running from wrong directory

**Solution:**
```powershell
# Make sure you're in the backend/ directory
cd C:\Users\otaku\Documents\VSC\BahaLaNa\backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### Issue: "Cannot import name 'api_router'"

**Cause:** Circular import or missing `__init__.py`

**Solution:** Make sure all `__init__.py` files exist in `app/` and `app/routes/`

### Issue: Old app.py still present

**Cause:** Git didn't delete the file

**Solution:**
```powershell
# Manually delete old app.py if it exists
Remove-Item backend/app.py -Force
```

---

## Documentation Locations

| What | Old Location | New Location |
|------|-------------|--------------|
| Development notes | `/DEVELOPMENT_NOTES.md` | `/docs/DEVELOPMENT_NOTES.md` |
| API usage | `/backend/README.md` | `/docs/API_README.md` |
| POWER guide | `/backend/POWER_API_GUIDE.md` | `/docs/POWER_API_GUIDE.md` |
| Project overview | (didn't exist) | `/README.md` |
| Backend guide | (was API docs) | `/backend/README.md` |

---

## Next Steps After Migration

1. ✅ **Test all endpoints** with new structure
2. ✅ **Update any custom scripts** to use new imports
3. ✅ **Review documentation** in `/docs` folder
4. 🚧 **Start frontend development** (React + Leaflet)
5. 🚧 **Add unit tests** for each module
6. 🚧 **Enhance flood risk algorithm** with ML

---

## Questions?

Check the updated documentation:
- `/docs/DEVELOPMENT_NOTES.md` - Full technical details
- `/docs/API_README.md` - API usage examples
- `/backend/README.md` - Backend setup guide

Or refer to commit history for specific changes.

---

**Migration Date:** October 5, 2025  
**Status:** ✅ Complete and tested  
**Impact:** All team members should pull latest changes
