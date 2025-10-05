/**
 * Flood Risk API Service
 * Handles flood risk assessment endpoint
 */
import apiClient from './api';

/**
 * Assess flood risk for a location and date range
 * @param {Object} params - Request parameters
 * @param {number} params.latitude - Latitude coordinate
 * @param {number} params.longitude - Longitude coordinate
 * @param {string} params.start_date - Start date (YYYY-MM-DD)
 * @param {string} params.end_date - End date (YYYY-MM-DD)
 * @returns {Promise} Flood risk assessment data
 */
export const assessFloodRisk = async ({ latitude, longitude, start_date, end_date }) => {
  try {
    const response = await apiClient.post('/flood-risk', {
      latitude,
      longitude,
      start_date,
      end_date,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to assess flood risk:', error);
    throw error;
  }
};

/**
 * Get flood risk level color
 * @param {string} level - Risk level (LOW, MEDIUM, HIGH, CRITICAL)
 * @returns {string} Tailwind color class
 */
export const getRiskColor = (level) => {
  const colors = {
    LOW: 'text-flood-low',
    MEDIUM: 'text-flood-medium',
    HIGH: 'text-flood-high',
    CRITICAL: 'text-flood-critical',
  };
  return colors[level] || 'text-gray-500';
};

/**
 * Get flood risk level background color
 * @param {string} level - Risk level (LOW, MEDIUM, HIGH, CRITICAL)
 * @returns {string} Tailwind background color class
 */
export const getRiskBgColor = (level) => {
  const colors = {
    LOW: 'bg-flood-low',
    MEDIUM: 'bg-flood-medium',
    HIGH: 'bg-flood-high',
    CRITICAL: 'bg-flood-critical',
  };
  return colors[level] || 'bg-gray-500';
};
