import { configureStore } from '@reduxjs/toolkit';
import preferencesReducer from './preferenceSlice';
import modeSlice from "./modeSlice";
export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    mode:modeSlice
  },
});
