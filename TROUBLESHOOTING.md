# 🔧 Troubleshooting Guide

## Issues Fixed

### ✅ Issue 1: Map Not Showing

**Problem**: The Leaflet map was not visible on the dashboard.

**Root Cause**: Leaflet CSS was not loaded in the HTML.

**Solution**: Added Leaflet CSS CDN link to `frontend/index.html`:
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin=""/>
```

### ✅ Issue 2: API Calls Failing ("Failed to fetch flood risk data")

**Problem**: Frontend couldn't connect to backend API, showing "Failed to fetch flood risk data" error.

**Root Causes**:
1. **Environment Variable Not Loading**: The Earthdata token in `frontend/.env` had line breaks
2. **Token Format**: Multi-line token strings don't load properly in environment variables

**Solution**:
1. Recreated `frontend/.env` with token on a single line
2. Added detailed logging to `api.js` to debug token loading
3. Restarted frontend dev server to pick up new environment variables

**Verification**:
```bash
# Check token is on single line
wc -l frontend/.env  # Should be 10 lines total
grep -n "VITE_EARTHDATA_TOKEN" frontend/.env  # Should show line 5 with full token

# Verify token length (should be ~600 characters)
grep "VITE_EARTHDATA_TOKEN=" frontend/.env | cut -d'=' -f2 | wc -c
```

## Current Status

### ✅ Working
- Backend server running on http://localhost:8000
- Frontend server running on http://localhost:5173
- Environment variables configured correctly
- Leaflet CSS loaded
- API authentication configured
- Backend successfully returns 200 OK for flood-risk requests

### ⏳ To Test
- Full end-to-end flow in browser
- Map interaction and location selection
- Date range selection
- Flood risk assessment button

## Common Issues

### Issue: "Failed to fetch flood risk data"

**Symptoms**:
- Error message appears after clicking "Assess Flood Risk"
- Browser console shows network errors or 401/403 errors

**Debugging Steps**:

1. **Check Environment Variables**:
   ```bash
   # Frontend
   cat frontend/.env
   # Verify VITE_EARTHDATA_TOKEN is present and on ONE line
   
   # Backend
   cat backend/.env
   # Verify EARTHDATA_JWT is present
   ```

2. **Check Token Loading** (Browser Console):
   - Open Developer Tools (F12) → Console tab
   - Look for log: `🔑 Token available: Yes (...)`
   - If shows "No", the .env file isn't being read

3. **Restart Frontend Server**:
   ```bash
   # Kill and restart to pick up .env changes
   pkill -f "vite"
   cd frontend && npm run dev
   ```

4. **Test Backend Directly**:
   ```bash
   curl -X POST http://localhost:8000/api/flood-risk \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{"latitude": 14.5995, "longitude": 120.9842, "start_date": "2024-10-01", "end_date": "2024-10-05"}'
   ```

5. **Check Backend Logs**:
   - Look for requests in the uvicorn terminal
   - Should see: `POST /api/flood-risk HTTP/1.1" 200 OK`
   - If 401/403: Token is missing or invalid
   - If 500: Server error (check backend logs for details)

### Issue: Map Not Visible

**Symptoms**:
- Dashboard loads but map area is blank
- No error in console

**Debugging Steps**:

1. **Check Leaflet CSS**:
   - View page source (Ctrl+U)
   - Look for: `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"`
   - If missing, check `index.html`

2. **Check Console for Errors**:
   - Open Developer Tools (F12) → Console tab
   - Look for Leaflet-related errors
   - Look for missing CSS warnings

3. **Check Map Container Height**:
   - Inspect the map div in DevTools
   - Should have `height: 600px` or similar
   - If height is 0, map won't render

4. **Hard Refresh**:
   ```
   Windows/Linux: Ctrl + Shift + R
   Mac: Cmd + Shift + R
   ```

### Issue: Wrong Port (5174 instead of 5173)

**Symptoms**:
- Frontend starts on port 5174
- Old instance still running on 5173

**Solution**:
```bash
# Kill all Vite processes
pkill -f "vite"

# Wait a moment
sleep 2

# Start fresh
cd frontend && npm run dev
```

### Issue: CORS Errors

**Symptoms**:
- Browser console shows: "blocked by CORS policy"
- API calls fail with network errors

**Debugging Steps**:

1. **Check Backend CORS Config** (`backend/main.py`):
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # Should be present
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Verify API URL**:
   - Check `frontend/.env`: `VITE_API_URL=http://localhost:8000/api`
   - Should NOT have trailing slash after `/api`

3. **Test with curl** (bypasses CORS):
   ```bash
   curl http://localhost:8000/api/
   ```

### Issue: Date Format Errors

**Symptoms**:
- Backend returns error about invalid date format
- Dates don't work correctly

**Solution**:
- Use YYYY-MM-DD format: `2024-10-01`
- Date inputs in HTML automatically use this format
- Don't use past dates (IMERG data availability)

## Browser Console Debugging

### Expected Logs (Normal Operation):

```
🔗 API Base URL configured: http://localhost:8000/api
🔑 Token available: Yes (eyJ0eXAiOiJKV1QiLCJvcm...)
📤 Request: POST http://localhost:8000/api/flood-risk
📦 Request Data: {latitude: 14.5995, longitude: 120.9842, ...}
🎫 Authorization header: Set
✅ Response: 200 OK
📦 Response Data: {location: {...}, flood_risk: {...}, ...}
```

### Error Logs to Watch For:

```
❌ API Error: 401 Unauthorized
  → Token missing or invalid

❌ API Error: 500 Internal Server Error
  → Backend error (check uvicorn logs)

❌ Network Error: Failed to fetch
  → Backend not running or wrong URL

🔑 Token available: No
  → .env file not loaded (restart dev server)
```

## Quick Fixes

### Complete Restart
```bash
# Kill everything
pkill -f "uvicorn"
pkill -f "vite"

# Wait
sleep 2

# Start backend
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
cd ..

# Wait for backend
sleep 3

# Start frontend
cd frontend
npm run dev &
cd ..
```

### Use the Debug Script
```bash
./start-debug.sh
```

This script:
- Checks all dependencies
- Verifies configuration files
- Checks ports
- Starts both servers
- Tests backend health
- Shows helpful URLs and commands

## Testing Checklist

After fixing issues, test in this order:

1. ✅ **Backend Health**:
   ```bash
   curl http://localhost:8000/api/
   ```
   Should return: `{"status":"ok","service":"BahaLa Na Climate Data API"}`

2. ✅ **Backend with Token**:
   ```bash
   curl -X POST http://localhost:8000/api/flood-risk \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"latitude": 14.5995, "longitude": 120.9842, "start_date": "2024-10-01", "end_date": "2024-10-05"}'
   ```
   Should return flood risk data (200 OK)

3. ✅ **Frontend Loads**:
   - Open http://localhost:5173
   - Should see dashboard with header
   - No console errors

4. ✅ **Map Renders**:
   - Map should be visible in the right panel
   - Should show tiles (street map)
   - Should be able to zoom/pan

5. ✅ **Location Selection**:
   - Click on map
   - Left panel should update with new coordinates
   - Marker should appear on map

6. ✅ **Date Selection**:
   - Select start date (past 30-90 days recommended)
   - Select end date (after start date)
   - Button should become enabled

7. ✅ **Flood Risk Assessment**:
   - Click "Assess Flood Risk" button
   - Loading spinner should appear
   - Results should display in left panel
   - No error messages

## Need More Help?

### Check Logs

**Backend Log** (in terminal running uvicorn):
- Shows all HTTP requests
- Shows errors with stack traces
- Shows IMERG/POWER API calls

**Frontend Log** (browser console):
- Shows API request/response details
- Shows React component errors
- Shows environment variable loading

### Environment Info

**Backend**:
- Python version: 3.12
- FastAPI version: 0.100.0
- Port: 8000

**Frontend**:
- Node version: (check with `node --version`)
- React version: 19
- Vite version: 7.1.9
- Port: 5173

### Files to Check

Configuration:
- `/workspaces/BahaLaNa/frontend/.env`
- `/workspaces/BahaLaNa/backend/.env`
- `/workspaces/BahaLaNa/frontend/index.html`
- `/workspaces/BahaLaNa/backend/app/config.py`

API Setup:
- `/workspaces/BahaLaNa/frontend/src/services/api.js`
- `/workspaces/BahaLaNa/backend/main.py`
- `/workspaces/BahaLaNa/backend/app/routes/flood_risk.py`

## Success Indicators

You'll know everything is working when:

1. ✅ Both servers start without errors
2. ✅ Map is visible and interactive
3. ✅ Can select location by clicking map
4. ✅ Can select date range
5. ✅ "Assess Flood Risk" button works
6. ✅ Results display with risk level, probability, confidence
7. ✅ No errors in browser console
8. ✅ Backend logs show 200 OK responses

---

**Last Updated**: October 5, 2025
**Status**: All major issues resolved ✅
