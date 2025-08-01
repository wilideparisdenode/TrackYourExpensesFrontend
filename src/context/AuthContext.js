"use client"

import { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // SAFELY check for existing session
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // Only parse if userData exists and is valid
    if (token && userData && userData !== "undefined") {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("user"); // Clean corrupted data
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      const { token, User } = response;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(User));
      setUser(User);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async ({ name, email, password }) => {
    try {
      await apiService.signup({ name, email, password });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};