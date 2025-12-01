import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/ui/Navbar";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import ArtisanDashboard from "./pages/ArtisanDashboard";
import Stats from "./pages/Stats";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* 🔥 REQUIRED so toast notifications appear */}
      <Toaster />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/dashboard" element={<ArtisanDashboard />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
