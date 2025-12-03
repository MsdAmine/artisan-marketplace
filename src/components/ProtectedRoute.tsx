import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[]; // <-- optional
}) {
  const { user } = useAuth();

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" />;

  // Logged in but role mismatch → redirect home
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}
