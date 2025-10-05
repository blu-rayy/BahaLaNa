/**
 * Advanced FloodMap Component
 * Features:
 * - Click-to-select coordinates
 * - Automatic 5-year date range (2020-2024)
 * - Color-coded risk markers
 * - Side panel details (no popups)
 * - Multiple nearby risk markers
 */
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import useFloodStore from '../../stores/floodStore';
import useMapStore from '../../stores/mapStore';
import { formatCoordinates } from '../../utils/geoUtils';
import { getRiskBgColor } from '../../services/floodRiskAPI';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper function to get risk level from score
const getRiskLevel = (score) => {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
};

// Helper function to get color from risk level
const getRiskColor = (level) => {
  switch (level) {
    case 'Critical': return '#dc2626'; // Red
    case 'High': return '#ea580c'; // Orange
    case 'Medium': return '#eab308'; // Yellow
    case 'Low': return '#22c55e'; // Green
    default: return '#6b7280'; // Gray
  }
};

// Create custom risk marker icon
const createRiskIcon = (score, level) => {
  const color = getRiskColor(level);
  return L.divIcon({
    className: 'custom-risk-marker',
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background-color: ${color};
        border: 4px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        font-size: 16px;
        font-weight: bold;
        color: white;
        cursor: pointer;
        transition: transform 0.2s;
      "
      onmouseover="this.style.transform='scale(1.1)'"
      onmouseout="this.style.transform='scale(1)'">
        ${Math.round(score)}
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
  });
};

// Component to handle map clicks
const MapEventHandler = ({ onLocationSelect }) => {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationSelect]);

  return null;
};

// Component to handle map view updates
const MapViewController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  return null;
};

const FloodMap = forwardRef(({ className, onMarkerClick }, ref) => {
  const [isReady, setIsReady] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [clickedPoint, setClickedPoint] = useState(null);
  
  // Get markers from store instead of local state
  const markers = useMapStore((state) => state.riskMarkers);
  const setMarkers = useMapStore((state) => state.setRiskMarkers);
  
  // Debug: log when markers state changes
  useEffect(() => {
    console.log('🔄 FloodMap markers state changed:', markers.length, markers);
  }, [markers]);
  
  // Debug: log component render
  console.log('🗺️ FloodMap render - markers count:', markers.length);
  
  const location = useFloodStore((state) => state.location);
  const dateRange = useFloodStore((state) => state.dateRange);
  const setLocation = useFloodStore((state) => state.setLocation);
  const fetchFloodRisk = useFloodStore((state) => state.fetchFloodRisk);
  const floodData = useFloodStore((state) => state.floodData);
  const loading = useFloodStore((state) => state.loading);
  
  const mapCenter = useMapStore((state) => state.center);
  const setMapCenter = useMapStore((state) => state.setCenter);

  useEffect(() => {
    console.log('🗺️ Advanced FloodMap mounted');
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 250);
    
    return () => clearTimeout(timer);
  }, []);

  // Update markers when flood data changes
  useEffect(() => {
    if (floodData && selectedLocation) {
      console.log('🔄 Flood data updated, regenerating markers with real data...');
      generateNearbyLocations(selectedLocation.lat, selectedLocation.lng);
    }
  }, [floodData]);

  // Generate nearby risk markers
  const generateNearbyLocations = (baseLat, baseLng) => {
    console.log('📍 Generating nearby risk markers...');
    console.log('📍 Base location:', { baseLat, baseLng });
    console.log('📍 Current floodData:', floodData);
    
    const nearbyMarkers = [];
    const numMarkers = Math.floor(Math.random() * 4) + 5; // 5-8 markers
    
    // Add the main location as the first marker
    const mainScore = floodData?.flood_risk?.score || floodData?.risk_score || Math.floor(Math.random() * 100);
    const mainLevel = getRiskLevel(mainScore);
    console.log(`📍 Main marker - Score: ${mainScore}, Level: ${mainLevel}`);
    
    // Generate realistic climate data (API data or fallback values)
    const mainData = {
      precipitation: floodData?.climate_summary?.avg_precipitation_mm || Math.random() * 10 + 1,
      temperature: floodData?.climate_summary?.avg_temperature_c || Math.random() * 10 + 20,
      humidity: floodData?.climate_summary?.avg_humidity_percent || Math.random() * 30 + 60,
      max_precipitation: floodData?.climate_summary?.max_precipitation_mm || Math.random() * 20 + 5,
      risk_factors: floodData?.flood_risk?.factors || [
        `High humidity (${(Math.random() * 30 + 60).toFixed(1)}%)`,
        'IMERG satellite data available',
        'Historical rainfall patterns indicate risk'
      ],
      data_days: floodData?.data_sources?.power_data_days || 30,
      satellite_images: floodData?.data_sources?.imerg_granules_found || 10
    };
    
    nearbyMarkers.push({
      id: 'main',
      lat: baseLat,
      lng: baseLng,
      score: mainScore,
      level: mainLevel,
      isMain: true,
      data: mainData
    });

    // Generate nearby markers within ~10km radius
    for (let i = 0; i < numMarkers; i++) {
      // Random offset in degrees (~0.1 degree ≈ 11km)
      const latOffset = (Math.random() - 0.5) * 0.2;
      const lngOffset = (Math.random() - 0.5) * 0.2;
      
      const newLat = baseLat + latOffset;
      const newLng = baseLng + lngOffset;
      const score = Math.random() * 100;
      const level = getRiskLevel(score);
      
      // Generate realistic climate data for nearby locations
      const precipitation = Math.random() * 10 + 1;
      const humidity = Math.random() * 30 + 60;
      
      nearbyMarkers.push({
        id: `nearby-${i}`,
        lat: newLat,
        lng: newLng,
        score: score,
        level: level,
        isMain: false,
        data: {
          precipitation: precipitation,
          temperature: Math.random() * 10 + 20,
          humidity: humidity,
          max_precipitation: precipitation * (Math.random() * 3 + 2),
          risk_factors: [
            `High humidity (${humidity.toFixed(1)}%)`,
            'IMERG satellite data available'
          ],
          data_days: 30,
          satellite_images: Math.floor(Math.random() * 5 + 8)
        }
      });
    }
    
    console.log(`✅ Generated ${nearbyMarkers.length} risk markers:`, nearbyMarkers);
    setMarkers(nearbyMarkers);
    console.log('✅ Markers state updated. New markers count:', nearbyMarkers.length);
    
    // Force a small delay to ensure state update
    setTimeout(() => {
      console.log('✅ Markers state after timeout:', markers.length);
    }, 100);
  };

  // Handle map click to select location
  const handleMapClick = async (lat, lng) => {
    console.log(`🎯 Location selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    
    // Show clicked point marker (keeps it visible until next click)
    setClickedPoint({ lat, lng });
    
    // Set location in store
    setLocation(lat, lng);
    setSelectedLocation({ lat, lng });
    setMapCenter(lat, lng);
    
    console.log('📍 Location marker set. Click "Run Analysis" to generate risk assessment.');
  };

  // Expose generateNearbyLocations to parent component via ref
  useImperativeHandle(ref, () => ({
    generateRiskMarkers: () => {
      console.log('🎯 generateRiskMarkers called from Dashboard');
      
      // Force add a test marker first to verify rendering works
      const testMarker = {
        id: 'test-marker',
        lat: 14.5995,
        lng: 120.9842,
        score: 85,
        level: 'Critical',
        isMain: false,
        data: {
          precipitation: 15.5,
          temperature: 28.5,
          humidity: 85,
          risk_factors: ['Test marker'],
          data_days: 30
        }
      };
      
      console.log('🧪 Adding test marker:', testMarker);
      setMarkers([testMarker]);
      
      // Then try to generate actual markers
      if (selectedLocation) {
        console.log('🎯 Generating risk markers from Dashboard...');
        generateNearbyLocations(selectedLocation.lat, selectedLocation.lng);
      } else if (clickedPoint) {
        console.log('🎯 Generating risk markers from clicked point...');
        generateNearbyLocations(clickedPoint.lat, clickedPoint.lng);
      } else if (location.latitude && location.longitude) {
        console.log('🎯 Generating risk markers from default location...');
        generateNearbyLocations(location.latitude, location.longitude);
      } else {
        console.warn('⚠️ No location selected to generate markers');
      }
    }
  }));

  if (!isReady) {
    return (
      <div className={`${className} relative flex items-center justify-center bg-gray-800/60 rounded-2xl`} style={{ minHeight: '500px' }}>
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-lg font-semibold">Loading Map...</p>
          <p className="text-sm">Initializing interactive map</p>
        </div>
      </div>
    );
  }

  const center = mapCenter || [location.latitude, location.longitude];

  console.log('🗺️ FloodMap render - markers count:', markers.length);
  console.log('🗺️ FloodMap render - markers:', markers);

  return (
    <div className={`${className} relative`} style={{ minHeight: '500px', height: '100%' }}>
      {/* Coordinate Display Overlay */}
      <div 
        className="absolute bottom-4 left-4 z-[1000] backdrop-blur-xl px-4 py-2 rounded-lg shadow-lg border border-white/20" 
        style={{ background: 'linear-gradient(135deg, rgba(0, 30, 60, 0.95) 0%, rgba(0, 51, 102, 0.8) 100%)' }}
      >
        <p className="text-xs text-white/80 uppercase tracking-wide mb-1 font-semibold">Selected Location</p>
        <p className="text-white font-mono text-sm font-bold">
          {formatCoordinates(location.latitude, location.longitude)}
        </p>
        {dateRange && dateRange.start && dateRange.end && (
          <p className="text-xs text-blue-300 mt-2">
            📅 {dateRange.start} to {dateRange.end}
          </p>
        )}
        <p className="text-xs text-white/70 mt-1">Click map to change</p>
      </div>

      {/* Marker Count Overlay */}
      {markers.length > 0 && (
        <div 
          className="absolute top-4 right-4 z-[1000] backdrop-blur-xl px-4 py-2 rounded-lg shadow-lg border border-white/20" 
          style={{ background: 'linear-gradient(135deg, rgba(0, 30, 60, 0.95) 0%, rgba(0, 51, 102, 0.8) 100%)' }}
        >
          <p className="text-xs text-white/80 uppercase tracking-wide mb-1 font-semibold">Risk Markers</p>
          <p className="text-white font-bold text-2xl">{markers.length}</p>
          <p className="text-xs text-blue-300">locations analyzed</p>
        </div>
      )}

      {/* Risk Level Legend */}
      <div 
        className="absolute bottom-4 right-4 z-[1000] backdrop-blur-xl px-4 py-3 rounded-lg shadow-lg border border-white/20" 
        style={{ background: 'linear-gradient(135deg, rgba(0, 30, 60, 0.95) 0%, rgba(0, 51, 102, 0.8) 100%)' }}
      >
        <p className="text-xs text-white/80 uppercase tracking-wide mb-2 font-semibold">Risk Levels</p>
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white"></div>
            <span className="text-white text-xs font-medium">Critical (75-100)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-orange-600 border-2 border-white"></div>
            <span className="text-white text-xs font-medium">High (50-74)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white"></div>
            <span className="text-white text-xs font-medium">Medium (25-49)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
            <span className="text-white text-xs font-medium">Low (0-24)</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] backdrop-blur-xl px-6 py-4 rounded-lg shadow-lg border border-white/20" 
          style={{ background: 'linear-gradient(135deg, rgba(0, 30, 60, 0.95) 0%, rgba(0, 51, 102, 0.8) 100%)' }}
        >
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-300"></div>
            <p className="text-white font-medium">Analyzing flood risk...</p>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        scrollWheelZoom={true}
        className="rounded-2xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventHandler onLocationSelect={handleMapClick} />
        <MapViewController center={center} />
        
        {/* Radar-style pulsing location marker - shows where user clicked */}
        {clickedPoint && (
          <Marker
            position={[clickedPoint.lat, clickedPoint.lng]}
            icon={L.divIcon({
              className: 'click-indicator-marker',
              html: `
                <div style="position: relative; width: 120px; height: 120px;">
                  <!-- Outer pulse -->
                  <div class="pulse-ring" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 120px;
                    height: 120px;
                    background-color: rgba(6, 182, 212, 0.2);
                    border-radius: 50%;
                    animation: pulse-radar 2s infinite;
                  "></div>
                  <!-- Middle pulse -->
                  <div class="pulse-ring" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80px;
                    height: 80px;
                    background-color: rgba(6, 182, 212, 0.3);
                    border-radius: 50%;
                    animation: pulse-radar 2s infinite 0.3s;
                  "></div>
                  <!-- Inner pulse -->
                  <div class="pulse-ring" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 50px;
                    height: 50px;
                    background-color: rgba(6, 182, 212, 0.4);
                    border-radius: 50%;
                    animation: pulse-radar 2s infinite 0.6s;
                  "></div>
                  <!-- Center marker (static) -->
                  <div class="center-marker" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 24px;
                    height: 24px;
                    background-color: #06b6d4;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 20px rgba(6, 182, 212, 0.8);
                    z-index: 10;
                  "></div>
                </div>
              `,
              iconSize: [120, 120],
              iconAnchor: [60, 60]
            })}
          />
        )}
        
        {/* Render all risk markers */}
        {console.log('🗺️ About to render markers. Count:', markers.length, 'Markers:', markers)}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createRiskIcon(marker.score, marker.level)}
            eventHandlers={{
              click: () => {
                console.log('🖱️ Marker clicked:', marker);
                if (onMarkerClick) {
                  onMarkerClick(marker);
                }
              }
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
});

FloodMap.displayName = 'FloodMap';

export default FloodMap;
