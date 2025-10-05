/**
 * NASA POWER API Service
 * Handles climate data from NASA POWER dataset
 */
import apiClient from './api';

/**
 * Fetch NASA POWER climate data
 * @param {Object} params - Request parameters
 * @param {string} params.start_date - Start date (YYYYMMDD)
 * @param {string} params.end_date - End date (YYYYMMDD)
 * @param {number} params.latitude - Latitude coordinate
 * @param {number} params.longitude - Longitude coordinate
 * @param {string} params.parameters - Comma-separated parameters (default: T2M,PRECTOTCORR,RH2M,WS2M)
 * @returns {Promise} Climate data
 */
export const fetchPowerData = async ({
  start_date,
  end_date,
  latitude,
  longitude,
  parameters = 'T2M,PRECTOTCORR,RH2M,WS2M',
}) => {
  try {
    const response = await apiClient.post('/power', {
      start_date,
      end_date,
      latitude,
      longitude,
      parameters,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch POWER data:', error);
    throw error;
  }
};

/**
 * Convert date from YYYY-MM-DD to YYYYMMDD format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Date in YYYYMMDD format
 */
export const formatDateForPower = (dateString) => {
  return dateString.replace(/-/g, '');
};

/**
 * Parse POWER API parameter data into arrays
 * @param {Object} parameterData - Parameter data from API
 * @returns {Array} Array of {date, value} objects
 */
export const parsePowerParameter = (parameterData) => {
  return Object.entries(parameterData).map(([date, value]) => ({
    date,
    value: parseFloat(value),
  }));
};
