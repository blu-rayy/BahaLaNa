# 🚀 Quick Reference

## URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Main application UI |
| Backend API | http://localhost:8000/api | API endpoints |
| API Docs | http://localhost:8000/docs | Interactive API documentation |
| API Health | http://localhost:8000/api/ | Health check endpoint |

## Startup Commands

### Both Servers (Recommended)
```bash
# Use the debug script (checks everything)
./start-debug.sh
```

### Manual Start
```bash
# Backend
cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (in new terminal)
cd frontend && npm run dev
```

### Stop Everything
```bash
pkill -f "uvicorn"
pkill -f "vite"
```

## Quick Tests

### Backend Health
```bash
curl http://localhost:8000/api/
# Expected: {"status":"ok","service":"BahaLa Na Climate Data API", ...}
```

### Flood Risk Assessment (with your token)
```bash
curl -X POST http://localhost:8000/api/flood-risk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "latitude": 14.5995,
    "longitude": 120.9842,
    "start_date": "2024-09-01",
    "end_date": "2024-10-01"
  }'
```

## Common Issues

### Map Not Showing
1. Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Check browser console (F12) for errors
3. Verify Leaflet CSS is loaded (view page source)

### API Failing
1. Open browser console (F12)
2. Look for: `🔑 Token available: Yes`
3. If "No", restart frontend: `pkill -f vite && cd frontend && npm run dev`
4. Check backend is running: `curl http://localhost:8000/api/`

### Wrong Port (5174 instead of 5173)
```bash
pkill -f "vite"
sleep 2
cd frontend && npm run dev
```

## Browser Console Logs

### ✅ Good (Everything Working)
```
🔗 API Base URL configured: http://localhost:8000/api
🔑 Token available: Yes (eyJ0eXAi...)
📤 Request: POST http://localhost:8000/api/flood-risk
🎫 Authorization header: Set
✅ Response: 200 OK
```

### ❌ Bad (Needs Fixing)
```
🔑 Token available: No
  → Restart frontend server

❌ API Error: 401 Unauthorized
  → Token missing or invalid

❌ Network Error: Failed to fetch
  → Backend not running
```

## Environment Files

### Frontend (.env)
```bash
# Location: frontend/.env
VITE_API_URL=http://localhost:8000/api
VITE_EARTHDATA_TOKEN=eyJ0eXAiOiJKV1QiLCJvcmlnaW4...  # One line, no breaks!
VITE_DEFAULT_LAT=14.5995
VITE_DEFAULT_LON=120.9842
VITE_DEFAULT_ZOOM=10
```

### Backend (.env)
```bash
# Location: backend/.env
EARTHDATA_JWT=eyJ0eXAiOiJKV1QiLCJvcmlnaW4...  # Same token as frontend
API_HOST=0.0.0.0
API_PORT=8000
```

## Application Flow

1. **User Opens App** → http://localhost:5173
2. **Dashboard Loads** → Shows map and controls
3. **Click Map** → Selects location (lat/lon updated)
4. **Select Dates** → Choose start and end dates
5. **Click "Assess Flood Risk"** → Sends API request
6. **Backend Processes**:
   - Validates request
   - Fetches IMERG satellite data (with token)
   - Fetches NASA POWER climate data
   - Runs ML model prediction
   - Returns flood risk assessment
7. **Frontend Displays**:
   - Risk level (LOW/MEDIUM/HIGH/CRITICAL)
   - Probability percentage
   - Confidence score
   - Climate summary

## Date Range Tips

- **Recommended**: Last 30-90 days from today
- **Format**: YYYY-MM-DD (e.g., 2024-09-15)
- **IMERG Data**: Available from June 2000 to near real-time (~1-2 days delay)
- **Don't use future dates**: Data doesn't exist yet!

## Useful Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open DevTools | F12 or Ctrl+Shift+I |
| Console Tab | Ctrl+Shift+J |
| Hard Refresh | Ctrl+Shift+R |
| View Source | Ctrl+U |

## Log Files

If using `start-debug.sh`:
```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/` | GET | Health check |
| `/api/flood-risk` | POST | Assess flood risk |
| `/api/imerg` | POST | Get IMERG precipitation data |
| `/api/power/climate` | POST | Get NASA POWER climate data |

## Support Files

| File | Purpose |
|------|---------|
| `ISSUES_RESOLVED.md` | Detailed status of fixes applied |
| `TROUBLESHOOTING.md` | Comprehensive debugging guide |
| `AUTHENTICATION_SETUP.md` | How authentication works |
| `start-debug.sh` | Automated startup script |

## Quick Checklist

Before testing:
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5173
- [ ] Both .env files configured
- [ ] Token is on single line (no breaks)
- [ ] Leaflet CSS in index.html

Expected results:
- [ ] Map visible and interactive
- [ ] Can click map to select location
- [ ] Can select date range
- [ ] "Assess Flood Risk" button works
- [ ] Results display correctly
- [ ] No errors in console

---

**Need help?** Check `TROUBLESHOOTING.md` for detailed solutions!
