"use client"

import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./App.css";

// Components
import ExpenseCategories from "./components/ExpenseCategories";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Budgets from "./components/Budgets";
import Categories from "./components/Categories"; 
import Expenses from "./components/Expenses";
import Income from "./components/Income";
import Reports from "./components/Reports";
import Users from "./components/Users";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function AppContent() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Not logged in: Only allow login/signup
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Logged in: Show app layout
  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={`main-content ${sidebarOpen ? "expanded" : ""}`}>
        <Header toggleSidebar={toggleSidebar} />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expense_category" element={<ExpenseCategories />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/income" element={<Income />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/users" element={<Users />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}