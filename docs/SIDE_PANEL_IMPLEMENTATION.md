# Side Panel Integration for Risk Markers

## Overview
Updated the existing "Risk Assessment" and "Detailed Analysis" panels to display data from clicked risk markers, providing a seamless way to explore different risk points without popups.

## Changes Made

### 1. FloodMap Component (`src/components/Map/FloodMap.jsx`)
- **Removed**: `Popup` import from react-leaflet
- **Added**: `onMarkerClick` prop to handle marker click events
- **Modified**: Risk markers now use `eventHandlers` instead of `Popup` components
- **Result**: Clicking a marker triggers a callback that updates the sidebar panels

```jsx
// Markers with click handlers
<Marker 
  ... 
  eventHandlers={{
    click: () => {
      if (onMarkerClick) {
        onMarkerClick(marker);
      }
    }
  }}
/>
```

### 2. Dashboard Component (`src/pages/Dashboard.jsx`)
- **Added**: `selectedMarker` state to track which marker is currently selected
- **Modified**: Existing "Risk Assessment" panel to show marker data when selected
- **Modified**: Existing "Detailed Analysis" panel to show marker data when selected
- **Features**:
  - Automatically switches between marker data and main analysis data
  - Shows a "📍 Marker Data" indicator when displaying marker info
  - Includes a close button (✕) to clear marker selection
  - Seamless transition between marker and main data views

### 3. Panel Behavior

#### Risk Assessment Panel (Top Right)
**When no marker selected**: Shows main flood analysis results
**When marker selected**: 
- Displays marker's risk level and score
- Shows "📍 Marker Data" indicator
- Updates rainfall and temperature metrics
- Highlights if it's the selected location marker

#### Detailed Analysis Panel (Below Map, Right Side)
**When no marker selected**: Shows main flood analysis details
**When marker selected**:
- Shows marker location coordinates
- Displays marker-specific risk factors
- Shows marker's climate data (max rainfall, humidity)
- Displays analysis period for that marker
- Includes close button to return to main view

## User Experience Flow

### Step 1: Initial State
- User runs an analysis
- Main panels show the primary location's flood risk data
- Multiple risk markers appear on the map

### Step 2: Click a Risk Marker
- User clicks any risk marker on the map
- **Risk Assessment** panel instantly updates to show that marker's score
- **Detailed Analysis** panel updates with marker's specific data
- Panels show "📍 Marker Data" or marker location to indicate active selection

### Step 3: Return to Main View
- User clicks the ✕ button in the Detailed Analysis panel
- Panels revert to showing the main analysis results
- Marker remains visible on map but not selected

## User Experience Improvements

### Before (Popups)
- ❌ Limited space for information
- ❌ Popups could be cut off at map edges
- ❌ Difficult to compare multiple markers
- ❌ Popups covered part of the map

### After (Integrated Panels)
- ✅ Uses existing UI panels - no new layout needed
- ✅ More space for detailed information
- ✅ Doesn't obstruct map view
- ✅ Easy to dismiss with close button
- ✅ Better mobile responsiveness
- ✅ Consistent with dashboard layout
- ✅ Smooth transitions between marker and main data

## Technical Details

### Props Flow
```
Dashboard
  ├─ selectedMarker (state)
  ├─ floodData (from store)
  └─ FloodMap
      └─ onMarkerClick={(marker) => setSelectedMarker(marker)}
```

### Data Priority Logic
```javascript
// Marker data takes priority when selected
{selectedMarker ? selectedMarker.level : floodData.flood_risk.level}
{selectedMarker ? selectedMarker.score : floodData.flood_risk.score}
```

### Marker Data Structure
```javascript
{
  id: string,
  lat: number,
  lng: number,
  score: number,
  level: 'Critical' | 'High' | 'Medium' | 'Low',
  isMain: boolean,
  data: {
    precipitation: number,
    temperature: number,
    humidity: number,
    max_precipitation: number,
    risk_factors: string[],
    data_days: number,
    satellite_images: number
  }
}
```

## Panel Integration Details

### Risk Assessment Panel
- **Location**: Top right, next to Analysis Configuration
- **Shows when**: `floodData` exists OR `selectedMarker` exists
- **Dynamic content**:
  - Risk level badge (changes color based on risk)
  - Risk score (0-100)
  - Rainfall metric
  - Temperature metric
  - Marker indicator (when marker selected)

### Detailed Analysis Panel
- **Location**: Below map, right sidebar
- **Shows when**: `floodData` exists OR `selectedMarker` exists
- **Dynamic content**:
  - Header with close button (when marker selected)
  - Location indicator badge
  - Risk factors list
  - Climate data (max rainfall, humidity)
  - Analysis period information

## Styling

The panels maintain the dashboard's dark theme:
- Background: `bg-gray-800/60` with backdrop blur
- Border: `border-gray-700/50`
- Text: White/gray color scheme
- Risk level colors: Dynamic based on risk level (red/orange/yellow/green)
- Marker indicator: Cyan accent color (`bg-cyan-500/10 border-cyan-500/20`)

## Future Enhancements

Possible improvements:
1. Add animation when switching between marker and main data
2. Allow comparing multiple markers side-by-side
3. Add history/breadcrumb trail of viewed markers
4. Include mini-map highlighting the selected marker
5. Add keyboard shortcuts (ESC to close, arrow keys to cycle through markers)
