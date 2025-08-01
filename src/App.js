"use client"
import { Provider} from 'react-redux';
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppContent from "./AppContent";
import {store} from "./services/store.js";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Provider store={store}>
        <AppContent />
        </Provider>
      </Router>
    </AuthProvider>
  );
}