import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm py-4 mb-8">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          Artisan Marketplace
        </Link>

        <div className="flex gap-6">
          <Link to="/cart" className="text-gray-700 hover:text-primary">
            Panier
          </Link>

          <Link to="/dashboard" className="text-gray-700 hover:text-primary">
            Artisan Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
