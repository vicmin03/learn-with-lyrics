import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function AdminRoute() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}