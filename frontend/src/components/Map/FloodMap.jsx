/**
 * FloodMap Component
 * Main interactive map using Leaflet
 */
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { MAP_CONFIG } from '../../utils/constants';
import useMapStore from '../../stores/mapStore';
import useFloodStore from '../../stores/floodStore';
import { formatCoordinates } from '../../utils/geoUtils';
import { formatToReadable } from '../../utils/dateFormatter';
import { getRiskBgColor } from '../../services/floodRiskAPI';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom marker with risk score
const createRiskScoreIcon = (riskScore, riskLevel) => {
  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return '#dc2626'; // red-600
      case 'MEDIUM': return '#ea580c'; // orange-600
      case 'LOW': return '#16a34a'; // green-600
      default: return '#6b7280'; // gray-500
    }
  };

  const color = getRiskColor(riskLevel);
  
  return L.divIcon({
    className: 'custom-risk-marker',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        ${riskScore}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Component to handle map click events
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Component to update map center
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

const FloodMap = ({ className, onLocationSelect }) => {
  const mapRef = useRef();
  const center = useMapStore((state) => state.center);
  const zoom = useMapStore((state) => state.zoom);
  const location = useFloodStore((state) => state.location);
  const floodData = useFloodStore((state) => state.floodData);
  const setLocation = useFloodStore((state) => state.setLocation);
  const setMapCenter = useMapStore((state) => state.setCenter);

  console.log('🗺️ FloodMap rendering with:', { center, zoom, location, className });

  useEffect(() => {
    console.log('🗺️ FloodMap mounted, checking for Leaflet availability:', !!L);
  }, []);

  const handleLocationSelect = (lat, lng) => {
    setLocation(lat, lng);
    setMapCenter(lat, lng);
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  try {
    return (
      <div className={`${className} relative`} style={{ minHeight: '400px', height: '100%' }}>
        <MapContainer
          center={center || [14.5995, 120.9842]}
          zoom={zoom || 10}
          style={{ height: '100%', width: '100%', minHeight: '400px', zIndex: 0 }}
          ref={mapRef}
          whenCreated={(mapInstance) => {
            console.log('🗺️ Map created successfully:', mapInstance);
            setTimeout(() => {
              mapInstance.invalidateSize();
            }, 100);
          }}
        >
          <TileLayer
            attribution={MAP_CONFIG.TILE_ATTRIBUTION}
            url={MAP_CONFIG.TILE_LAYER_URL}
          />
          
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          <MapUpdater center={center || [14.5995, 120.9842]} zoom={zoom || 10} />
          
          {location && (
            <Marker 
              position={[location.latitude, location.longitude]}
              icon={floodData ? createRiskScoreIcon(floodData.flood_risk.score, floodData.flood_risk.level) : undefined}
            >
              <Popup maxWidth={350} className="flood-risk-popup">
                <div className="text-sm">
                  <div className="mb-3">
                    <p className="font-semibold text-gray-800 mb-1">📍 Analysis Location</p>
                    <p className="text-gray-600 font-mono text-xs">
                      {formatCoordinates(location.latitude, location.longitude)}
                    </p>
                  </div>
                  
                  {floodData ? (
                    <div className="border-t pt-3 space-y-4">
                      {/* Risk Overview */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700 font-medium">Risk Assessment:</span>
                          <span 
                            className={`px-3 py-1 rounded-full text-xs font-bold text-black ${getRiskBgColor(floodData.flood_risk.level)}`}
                          >
                            {floodData.flood_risk.level}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800">
                            {floodData.flood_risk.score}/100
                          </div>
                          <div className="text-xs text-gray-600">Flood Risk Score</div>
                        </div>
                      </div>

                      {/* Climate Summary */}
                      {floodData.climate_summary && (
                        <div>
                          <p className="font-medium text-gray-700 mb-2">🌤️ Climate Conditions</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-blue-50 p-2 rounded text-center">
                              <div className="text-blue-700 text-xs font-medium">💧 Rainfall</div>
                              <div className="text-blue-900 font-bold text-sm">
                                {floodData.climate_summary.avg_precipitation_mm}mm
                              </div>
                              <div className="text-blue-600 text-xs">avg/day</div>
                            </div>
                            <div className="bg-orange-50 p-2 rounded text-center">
                              <div className="text-orange-700 text-xs font-medium">🌡️ Temp</div>
                              <div className="text-orange-900 font-bold text-sm">
                                {floodData.climate_summary.avg_temperature_c}°C
                              </div>
                              <div className="text-orange-600 text-xs">average</div>
                            </div>
                            <div className="bg-green-50 p-2 rounded text-center">
                              <div className="text-green-700 text-xs font-medium">💨 Humidity</div>
                              <div className="text-green-900 font-bold text-sm">
                                {floodData.climate_summary.avg_humidity_percent}%
                              </div>
                              <div className="text-green-600 text-xs">average</div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Max rainfall: {floodData.climate_summary.max_precipitation_mm}mm
                          </div>
                        </div>
                      )}
                      
                      {/* Risk Factors */}
                      {floodData.flood_risk.factors && floodData.flood_risk.factors.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-700 text-sm mb-2">⚠️ Contributing Risk Factors</p>
                          <div className="bg-amber-50 rounded-lg p-3">
                            <ul className="text-xs text-amber-800 space-y-1">
                              {floodData.flood_risk.factors.map((factor, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-amber-600 flex-shrink-0 font-bold">•</span>
                                  <span>{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Analysis Details */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-gray-700 text-xs mb-2">📊 Analysis Details</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>
                            <strong>Period:</strong> {formatToReadable(floodData.date_range.start)} to {formatToReadable(floodData.date_range.end)}
                          </div>
                          {floodData.data_sources && (
                            <div>
                              <strong>Data:</strong> {floodData.data_sources.power_data_days} days of climate data
                              {floodData.data_sources.imerg_granules_found > 0 && 
                                `, ${floodData.data_sources.imerg_granules_found} satellite images`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t pt-3 text-center py-4">
                      <div className="text-gray-400 mb-2">
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium mb-1">No Analysis Available</p>
                      <p className="text-xs text-gray-500">
                        Select dates and run flood risk analysis to see detailed results
                      </p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    );
  } catch (error) {
    console.error('🗺️ FloodMap error:', error);
    return (
      <div className={`${className} relative flex items-center justify-center bg-gray-100`} style={{ minHeight: '400px' }}>
        <div className="text-center text-gray-600">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-lg font-semibold">Map Loading Error</p>
          <p className="text-sm">Unable to load the interactive map</p>
          <p className="text-xs mt-2">Check console for details</p>
        </div>
      </div>
    );
  }
};

export default FloodMap;
