# Marker Click Feature - User Guide

## Overview
Click on any risk marker to view its detailed analysis in the existing sidebar panels.

## How It Works

### 1️⃣ Run an Analysis
- Click on the map to select a location
- Choose an analysis date
- Click "Run Analysis"
- Multiple risk markers will appear on the map (color-coded by risk level)

### 2️⃣ View Main Analysis Results
After analysis completes, the right sidebar shows:
- **Risk Assessment Panel** (top right): Main location's risk score
- **Detailed Analysis Panel** (below map): Full analysis details

### 3️⃣ Click a Risk Marker
Click any marker on the map to:
- **Risk Assessment Panel updates** to show that marker's risk score
- **Detailed Analysis Panel updates** with marker-specific data
- A cyan "📍 Marker Data" badge appears to indicate you're viewing a marker

### 4️⃣ Return to Main View
- Click the **✕ button** in the Detailed Analysis panel header
- Panels will return to showing the main analysis results

## Visual Changes

### Risk Assessment Panel
```
┌─────────────────────────────────┐
│ ⚠️ Risk Assessment  📍 Marker   │  ← Indicator appears
│                                 │
│        CRITICAL                 │  ← Updates to marker's level
│          87/100                 │  ← Updates to marker's score
│       Risk Score                │
│                                 │
│  Rainfall: 12.4mm              │  ← Updates to marker's data
│  Temperature: 28.5°C           │  ← Updates to marker's data
└─────────────────────────────────┘
```

### Detailed Analysis Panel
```
┌─────────────────────────────────┐
│ 📊 Detailed Analysis      ✕    │  ← Close button appears
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📍 Nearby Risk Marker       │ │  ← Location badge
│ │ 14.6234°N, 121.0123°E      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Risk Factors:                   │  ← Marker's risk factors
│ • High rainfall detected        │
│ • Elevated humidity levels      │
│                                 │
│ Climate Data:                   │  ← Marker's climate data
│ Max Rainfall: 45.2mm           │
│ Avg Humidity: 78.5%            │
└─────────────────────────────────┘
```

## Marker Colors

Risk markers are color-coded:
- 🔴 **Red (Critical)**: Risk score 75-100
- 🟠 **Orange (High)**: Risk score 50-74
- 🟡 **Yellow (Medium)**: Risk score 25-49
- 🟢 **Green (Low)**: Risk score 0-24

## Tips

1. **Compare Markers**: Click different markers to compare their risk levels
2. **Main Location**: The marker at your selected location shows "📍 Selected Location"
3. **Nearby Locations**: Other markers show "📍 Nearby Risk Marker"
4. **Clear Selection**: Click ✕ or run a new analysis to reset the view
5. **Hover Effect**: Markers scale up when you hover over them

## Technical Notes

- Marker data includes:
  - Risk score and level
  - Precipitation, temperature, humidity
  - Risk factors
  - Analysis period
  - Data source counts

- The panels seamlessly switch between main and marker data
- No new windows or overlays - uses existing UI elements
- Data updates are instant on marker click
