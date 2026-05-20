import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

type ProtectedRouteProps = {
  allowedRoles?: string[];
};

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user && allowedRoles.includes(user.role);

    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}