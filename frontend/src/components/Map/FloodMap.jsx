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
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const setLocation = useFloodStore((state) => state.setLocation);
  const setMapCenter = useMapStore((state) => state.setCenter);

  const handleLocationSelect = (lat, lng) => {
    setLocation(lat, lng);
    setMapCenter(lat, lng);
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        ref={mapRef}
      >
        <TileLayer
          attribution={MAP_CONFIG.TILE_ATTRIBUTION}
          url={MAP_CONFIG.TILE_LAYER_URL}
        />
        
        <MapClickHandler onLocationSelect={handleLocationSelect} />
        <MapUpdater center={center} zoom={zoom} />
        
        {location && (
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold mb-1">Selected Location</p>
                <p>{formatCoordinates(location.latitude, location.longitude)}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default FloodMap;
