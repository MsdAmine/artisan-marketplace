import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import ArtisanDashboard from "./pages/ArtisanDashboard";
import Stats from "./pages/Stats";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
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