import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedHome() {
  const { user } = useAuth();

  // If not logged in → send to login
  if (!user) return <Navigate to="/login" replace />;

  // If logged in → go to the normal homepage
  return <Navigate to="/catalog" replace />;
}
