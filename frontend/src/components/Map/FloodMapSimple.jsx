/**
 * Simple FloodMap Component for debugging
 */
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FloodMapSimple = ({ className }) => {
  const [mapError, setMapError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('Simple FloodMap mounted');
    console.log('Leaflet available:', typeof L !== 'undefined');
    console.log('Leaflet version:', L.version);
    
    // Add delay to ensure CSS is loaded
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 250);
    
    return () => clearTimeout(timer);
  }, []);

  if (mapError) {
    return (
      <div className={`${className} relative flex items-center justify-center bg-gray-100`} style={{ minHeight: '400px' }}>
        <div className="text-center text-gray-600">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-lg font-semibold">Map Error</p>
          <p className="text-sm">{mapError.message}</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className={`${className} relative flex items-center justify-center bg-gray-100`} style={{ minHeight: '400px' }}>
        <div className="text-center text-gray-600">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-lg font-semibold">Loading Map...</p>
          <p className="text-sm">Initializing Leaflet</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className={`${className} relative`} style={{ minHeight: '400px', height: '100%' }}>
        <MapContainer
          key="simple-flood-map"
          center={[14.5995, 120.9842]}
          zoom={10}
          style={{ height: '100%', width: '100%', minHeight: '400px' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Marker position={[14.5995, 120.9842]}>
            <Popup>
              <div>
                <p><strong>Philippines</strong></p>
                <p>Default location - Manila area</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    );
  } catch (error) {
    console.error('Map render error:', error);
    setMapError(error);
    return null;
  }
};

export default FloodMapSimple;