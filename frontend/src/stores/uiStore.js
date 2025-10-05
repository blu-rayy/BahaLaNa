/**
 * UI Store
 * Manages UI state (modals, sidebars, notifications, etc.)
 */
import { create } from 'zustand';

const useUIStore = create((set) => ({
  // State
  sidebarOpen: true,
  modalOpen: false,
  modalContent: null,
  notifications: [],
  theme: 'light',

  // Actions
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  openModal: (content) => {
    set({ modalOpen: true, modalContent: content });
  },

  closeModal: () => {
    set({ modalOpen: false, modalContent: null });
  },

  addNotification: (notification) => {
    const id = Date.now();
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id,
          type: 'info',
          duration: 5000,
          ...notification,
        },
      ],
    }));

    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, notification.duration || 5000);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setTheme: (theme) => {
    set({ theme });
    // Store in localStorage
    localStorage.setItem('theme', theme);
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return { theme: newTheme };
    });
  },
}));

export default useUIStore;
