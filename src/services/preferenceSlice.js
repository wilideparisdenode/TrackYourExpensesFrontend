import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currency: "USD",
  symbol:"$",
  language: "en",
  dateFormat: "MM/DD/YYYY",
  notifications: true,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    // Set all preferences at once
    setPreferences: (state, action) => {
      return { ...state, ...action.payload };
    },
    // Individual updates
  setCurrency: (state, action) => {
  state.currency = action.payload;
  if (state.currency === "USD") state.symbol = "$";
  else if (state.currency === "EUR") state.symbol = "€";
  else if (state.currency === "GBP") state.symbol = "£";
  else if (state.currency === "CFA") state.symbol = "CFA";
  else if (state.currency === "JPY") state.symbol = "¥";
  else if (state.currency === "INR") state.symbol = "₹";
  else state.symbol = ""; // fallback for unknown currencies
},
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
   
    setDateFormat: (state, action) => {
      state.dateFormat = action.payload;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    }
  }
});

export const {
  setPreferences,
  setCurrency,
  setLanguage,
  setDateFormat,
  toggleNotifications
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
