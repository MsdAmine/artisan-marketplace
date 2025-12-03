import { Routes, Route, Navigate } from "react-router-dom";
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
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Toaster />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
  {/* Public */}
  <Route path="/catalog" element={<Catalog />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/cart" element={<Cart />} />

  {/* Customer only */}
  <Route
    path="/my-orders"
    element={
      <ProtectedRoute roles={["customer"]}>
        <MyOrders />
      </ProtectedRoute>
    }
  />

  {/* Artisan only */}
  <Route
    path="/artisan/dashboard"
    element={
      <ProtectedRoute roles={["artisan"]}>
        <ArtisanDashboard />
      </ProtectedRoute>
    }
  />

  {/* Admin only */}
  <Route
    path="/admin/dashboard"
    element={
      <ProtectedRoute roles={["admin"]}>
        <Stats />
      </ProtectedRoute>
    }
  />

  <Route path="*" element={<Navigate to="/" />} />
</Routes>
      </main>
    </div>
  );
}
