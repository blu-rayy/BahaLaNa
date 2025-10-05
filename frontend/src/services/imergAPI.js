/**
 * IMERG API Service
 * Handles precipitation data from NASA IMERG dataset
 */
import apiClient from './api';

/**
 * Fetch IMERG precipitation data
 * @param {Object} params - Request parameters
 * @param {string} params.start_date - Start date (YYYY-MM-DD)
 * @param {string} params.end_date - End date (YYYY-MM-DD)
 * @param {number} params.north - North boundary
 * @param {number} params.south - South boundary
 * @param {number} params.east - East boundary
 * @param {number} params.west - West boundary
 * @returns {Promise} IMERG precipitation data
 */
export const fetchIMERGData = async ({ start_date, end_date, north, south, east, west }) => {
  try {
    const response = await apiClient.post('/imerg', {
      start_date,
      end_date,
      north,
      south,
      east,
      west,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch IMERG data:', error);
    throw error;
  }
};

/**
 * Create bounding box from center point and radius
 * @param {number} lat - Center latitude
 * @param {number} lon - Center longitude
 * @param {number} radius - Radius in kilometers (default: 50)
 * @returns {Object} Bounding box {north, south, east, west}
 */
export const createBoundingBox = (lat, lon, radius = 50) => {
  // Rough conversion: 1 degree ≈ 111 km
  const latDelta = radius / 111;
  const lonDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

  return {
    north: lat + latDelta,
    south: lat - latDelta,
    east: lon + lonDelta,
    west: lon - lonDelta,
  };
};
