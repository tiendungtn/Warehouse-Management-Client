import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasPermission = allowedRoles.includes(user.role);

  if (!hasPermission) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
