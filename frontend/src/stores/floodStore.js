/**
 * Flood Data Store
 * Manages flood risk assessment data and related state
 */
import { create } from 'zustand';
import { assessFloodRisk } from '../services/floodRiskAPI';

const useFloodStore = create((set, get) => ({
  // State
  floodData: null,
  loading: false,
  error: null,
  location: {
    latitude: parseFloat(import.meta.env.VITE_DEFAULT_LAT) || 14.5995,
    longitude: parseFloat(import.meta.env.VITE_DEFAULT_LON) || 120.9842,
  },
  dateRange: {
    start_date: null,
    end_date: null,
  },

  // Actions
  setLocation: (latitude, longitude) => {
    set({ location: { latitude, longitude } });
  },

  setDateRange: (start_date, end_date) => {
    set({ dateRange: { start_date, end_date } });
  },

  fetchFloodRisk: async () => {
    const { location, dateRange } = get();
    
    if (!dateRange.start_date || !dateRange.end_date) {
      set({ error: 'Please select a date range' });
      return;
    }

    set({ loading: true, error: null });

    try {
      const data = await assessFloodRisk({
        latitude: location.latitude,
        longitude: location.longitude,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      });

      set({ floodData: data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch flood risk data',
        loading: false,
      });
    }
  },

  clearFloodData: () => {
    set({ floodData: null, error: null });
  },

  reset: () => {
    set({
      floodData: null,
      loading: false,
      error: null,
      location: {
        latitude: parseFloat(import.meta.env.VITE_DEFAULT_LAT) || 14.5995,
        longitude: parseFloat(import.meta.env.VITE_DEFAULT_LON) || 120.9842,
      },
      dateRange: {
        start_date: null,
        end_date: null,
      },
    });
  },
}));

export default useFloodStore;
