import { createSlice } from '@reduxjs/toolkit';

// Helper function to get initial state from localStorage or use defaults
const getInitialState = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('app-theme');
    const savedFontSize = localStorage.getItem('app-font-size');
    const savedCompactMode = localStorage.getItem('app-compact-mode');
    
    return {
      theme: savedTheme || 'dark',
      fontSize: savedFontSize || 'medium',
      compactMode: savedCompactMode ? JSON.parse(savedCompactMode) : false,
    };
  }
  
  return {
    theme: 'dark',
    fontSize: 'medium',
    compactMode: false,
  };
};

const modeSlice = createSlice({
  name: 'mode',
  initialState: getInitialState(),
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-theme', action.payload);
      }
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-font-size', action.payload);
      }
    },
    toggleCompactMode: (state) => {
      state.compactMode = !state.compactMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-compact-mode', JSON.stringify(state.compactMode));
      }
    },
    setCompactMode: (state, action) => {
      state.compactMode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-compact-mode', JSON.stringify(action.payload));
      }
    },
    resetModeSettings: (state) => {
      state.theme = 'dark';
      state.fontSize = 'medium';
      state.compactMode = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-theme', 'dark');
        localStorage.setItem('app-font-size', 'medium');
        localStorage.setItem('app-compact-mode', JSON.stringify(false));
      }
    },
    applySystemTheme: (state) => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.theme = isDarkMode ? 'dark' : 'light';
        localStorage.setItem('app-theme', state.theme);
      }
    }
  },
});

export const { 
  setTheme, 
  setFontSize, 
  toggleCompactMode, 
  setCompactMode, 
  resetModeSettings,
  applySystemTheme 
} = modeSlice.actions;

export default modeSlice.reducer;