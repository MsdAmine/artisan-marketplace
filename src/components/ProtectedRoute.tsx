import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, roles }: any) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const roleFallback = (role?: string) => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "artisan") return "/artisan/dashboard";
    return "/";
  };

  if (loading) return null; // or a spinner

  if (!user)
    return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={roleFallback(user.role)} replace />;
  }

  return children;
}
