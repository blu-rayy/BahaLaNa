/**
 * Base API client for BahaLaNa backend
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

console.log('🔗 API Base URL configured:', API_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout for NASA API calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = import.meta.env.VITE_EARTHDATA_TOKEN;
    console.log('🔑 Token available:', token ? `Yes (${token.substring(0, 20)}...)` : 'No');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`📤 Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('📦 Request Data:', config.data);
    console.log('🎫 Authorization header:', config.headers.Authorization ? 'Set' : 'Not set');
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status} ${response.statusText}`);
    console.log('📦 Response Data:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('❌ API Error:', error.response.status, error.response.data);
      console.error('📍 URL:', error.config?.baseURL + error.config?.url);
    } else if (error.request) {
      // Request made but no response
      console.error('❌ Network Error:', error.message);
      console.error('📍 URL:', error.config?.baseURL + error.config?.url);
      console.error('💡 Is the backend running on http://localhost:8000?');
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
