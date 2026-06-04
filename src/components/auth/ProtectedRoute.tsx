import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

type ProtectedRouteProps = {
  allowedRoles?: string[];
};

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role?.replace("ROLE_", "") ?? "";
    const hasRole = allowedRoles.includes(userRole);

    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}