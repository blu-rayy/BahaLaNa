/**
 * Constants used throughout the application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000, // 30 seconds
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [
    parseFloat(import.meta.env.VITE_DEFAULT_LAT) || 14.5995,
    parseFloat(import.meta.env.VITE_DEFAULT_LON) || 120.9842,
  ],
  DEFAULT_ZOOM: parseInt(import.meta.env.VITE_DEFAULT_ZOOM) || 10,
  MIN_ZOOM: 3,
  MAX_ZOOM: 18,
  TILE_LAYER_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

// Flood Risk Levels
export const RISK_LEVELS = {
  LOW: {
    label: 'Low',
    color: '#22c55e',
    bgColor: 'bg-flood-low',
    textColor: 'text-flood-low',
    description: 'Minimal flood risk',
  },
  MEDIUM: {
    label: 'Medium',
    color: '#eab308',
    bgColor: 'bg-flood-medium',
    textColor: 'text-flood-medium',
    description: 'Moderate flood risk - monitor conditions',
  },
  HIGH: {
    label: 'High',
    color: '#ef4444',
    bgColor: 'bg-flood-high',
    textColor: 'text-flood-high',
    description: 'High flood risk - prepare for flooding',
  },
  CRITICAL: {
    label: 'Critical',
    color: '#991b1b',
    bgColor: 'bg-flood-critical',
    textColor: 'text-flood-critical',
    description: 'Critical flood risk - evacuate if necessary',
  },
};

// Date Presets
export const DATE_PRESETS = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 14 Days', days: 14 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

// Climate Parameters
export const CLIMATE_PARAMETERS = {
  T2M: {
    label: 'Temperature',
    unit: '°C',
    description: 'Temperature at 2 meters',
  },
  PRECTOTCORR: {
    label: 'Precipitation',
    unit: 'mm',
    description: 'Corrected precipitation',
  },
  RH2M: {
    label: 'Humidity',
    unit: '%',
    description: 'Relative humidity at 2 meters',
  },
  WS2M: {
    label: 'Wind Speed',
    unit: 'm/s',
    description: 'Wind speed at 2 meters',
  },
};

// Chart Colors
export const CHART_COLORS = {
  precipitation: '#3b82f6', // blue
  temperature: '#ef4444', // red
  humidity: '#06b6d4', // cyan
  windSpeed: '#8b5cf6', // purple
  floodRisk: '#f59e0b', // amber
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Loading States
export const LOADING_MESSAGES = [
  'Fetching precipitation data...',
  'Analyzing climate patterns...',
  'Calculating flood risk...',
  'Processing satellite imagery...',
  'Preparing results...',
];
