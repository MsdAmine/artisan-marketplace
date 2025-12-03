import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedHome() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (user.role === "admin") return <Navigate to="/admin/dashboard" />;
  if (user.role === "artisan") return <Navigate to="/artisan/dashboard" />;

  return <Navigate to="/catalog" />; // customer default
}
