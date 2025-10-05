/**
 * Map Store
 * Manages map state (center, zoom, layers, etc.)
 */
import { create } from 'zustand';

const useMapStore = create((set) => ({
  // State
  center: [
    parseFloat(import.meta.env.VITE_DEFAULT_LAT) || 14.5995,
    parseFloat(import.meta.env.VITE_DEFAULT_LON) || 120.9842,
  ],
  zoom: parseInt(import.meta.env.VITE_DEFAULT_ZOOM) || 10,
  layers: {
    precipitation: true,
    floodZones: true,
    markers: true,
  },
  selectedLocation: null,
  riskMarkers: [], // Add risk markers to store

  // Actions
  setCenter: (lat, lon) => {
    set({ center: [lat, lon] });
  },

  setZoom: (zoom) => {
    set({ zoom });
  },

  toggleLayer: (layerName) => {
    set((state) => ({
      layers: {
        ...state.layers,
        [layerName]: !state.layers[layerName],
      },
    }));
  },

  setSelectedLocation: (location) => {
    set({ selectedLocation: location });
  },

  setRiskMarkers: (markers) => {
    set({ riskMarkers: markers });
  },

  clearRiskMarkers: () => {
    set({ riskMarkers: [] });
  },

  reset: () => {
    set({
      center: [
        parseFloat(import.meta.env.VITE_DEFAULT_LAT) || 14.5995,
        parseFloat(import.meta.env.VITE_DEFAULT_LON) || 120.9842,
      ],
      zoom: parseInt(import.meta.env.VITE_DEFAULT_ZOOM) || 10,
      layers: {
        precipitation: true,
        floodZones: true,
        markers: true,
      },
      selectedLocation: null,
      riskMarkers: [],
    });
  },
}));

export default useMapStore;
