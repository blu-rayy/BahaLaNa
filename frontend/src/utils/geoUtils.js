/**
 * Geospatial Utilities
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees
 * @returns {number} Radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Format coordinates to display string
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} precision - Decimal places (default: 4)
 * @returns {string} Formatted coordinate string
 */
export const formatCoordinates = (lat, lon, precision = 4) => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(precision)}°${latDir}, ${Math.abs(lon).toFixed(precision)}°${lonDir}`;
};

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} Whether coordinates are valid
 */
export const isValidCoordinates = (lat, lon) => {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
};

/**
 * Create bounding box from center point
 * @param {number} lat - Center latitude
 * @param {number} lon - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Object} Bounding box {north, south, east, west}
 */
export const createBoundingBox = (lat, lon, radiusKm = 50) => {
  // Rough conversion: 1 degree ≈ 111 km
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  return {
    north: Math.min(lat + latDelta, 90),
    south: Math.max(lat - latDelta, -90),
    east: Math.min(lon + lonDelta, 180),
    west: Math.max(lon - lonDelta, -180),
  };
};

/**
 * Calculate center point from bounding box
 * @param {Object} bbox - Bounding box {north, south, east, west}
 * @returns {Object} Center point {lat, lon}
 */
export const getBboxCenter = (bbox) => {
  return {
    lat: (bbox.north + bbox.south) / 2,
    lon: (bbox.east + bbox.west) / 2,
  };
};

/**
 * Check if point is within bounding box
 * @param {number} lat - Point latitude
 * @param {number} lon - Point longitude
 * @param {Object} bbox - Bounding box {north, south, east, west}
 * @returns {boolean} Whether point is inside bbox
 */
export const isPointInBbox = (lat, lon, bbox) => {
  return (
    lat >= bbox.south &&
    lat <= bbox.north &&
    lon >= bbox.west &&
    lon <= bbox.east
  );
};
