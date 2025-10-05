/**
 * Health Check API Service
 */
import apiClient from './api';

/**
 * Check backend health status
 * @returns {Promise} Health status data
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};
