import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  isDarkMode: boolean;
  language: 'tr' | 'en' | 'de' | 'fr' | 'es';
  sidebarOpen: boolean;
  loading: boolean;
  notifications: Notification[];
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
    autoHideDuration: number;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

const initialState: UIState = {
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  isDarkMode: (localStorage.getItem('theme') as 'light' | 'dark') === 'dark',
  language: (localStorage.getItem('language') as 'tr' | 'en' | 'de' | 'fr' | 'es') || 'tr',
  sidebarOpen: false,
  loading: false,
  notifications: [],
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 6000,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      state.isDarkMode = state.theme === 'dark';
      localStorage.setItem('theme', state.theme);
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      state.isDarkMode = action.payload === 'dark';
      localStorage.setItem('theme', action.payload);
    },
    setLanguage: (state, action: PayloadAction<'tr' | 'en' | 'de' | 'fr' | 'es'>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    showSnackbar: (state, action: PayloadAction<{
      message: string;
      severity?: 'success' | 'error' | 'warning' | 'info';
      autoHideDuration?: number;
    }>) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
        autoHideDuration: action.payload.autoHideDuration || 6000,
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  setLanguage,
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  clearAllNotifications,
  showSnackbar,
  hideSnackbar,
} = uiSlice.actions;

export default uiSlice.reducer;