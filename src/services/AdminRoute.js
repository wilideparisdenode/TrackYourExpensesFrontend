"use client"

import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const AdminRoute = () => {
  const { user, loading } = useAuth()

  // While checking auth, you can show a loader
  if (loading) {
    return <div>Loading...</div>
  }

  // If user is not logged in or not admin, redirect to home or login
  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />
  }

  // If user is admin, render the child routes/components
  return <Outlet />
}

export default AdminRoute
