import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/ui/Navbar";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import ArtisanDashboard from "./pages/ArtisanDashboard";
import Stats from "./pages/Stats";
import { Toaster } from "./components/ui/toaster";
import MyOrders from "./pages/MyOrders";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/Signup";

export default function App() {
  const location = useLocation();

  // 🛑 Routes where Navbar should not appear
  const hideNavbarRoutes = ["/login", "/signup"];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 👇 Hide Navbar on login/signup */}
      {!shouldHideNavbar && <Navbar />}

      <Toaster />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Catalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute roles={["customer"]}>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/artisan/dashboard"
            element={
              <ProtectedRoute roles={["artisan"]}>
                <ArtisanDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Stats />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
