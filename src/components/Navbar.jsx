import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-indigo-600">
          Artisan Market
        </Link>
        <nav className="flex gap-4 text-sm font-medium">
          <NavLink to="/" className="hover:text-indigo-600">
            Catalogue
          </NavLink>
          <NavLink to="/dashboard" className="hover:text-indigo-600">
            Espace Artisan
          </NavLink>
          <NavLink to="/stats" className="hover:text-indigo-600">
            Statistiques
          </NavLink>
          <NavLink to="/cart" className="hover:text-indigo-600">
            Panier
          </NavLink>
        </nav>
      </div>
    </header>
  );
}