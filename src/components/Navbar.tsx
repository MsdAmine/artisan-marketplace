import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, BarChart3, Store } from "lucide-react";

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="container h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold tracking-tight">
          Artisan <span className="text-primary">Market</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "font-medium text-primary" : "text-gray-600"
            }
          >
            Catalogue
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "font-medium text-primary" : "text-gray-600"
            }
          >
            Artisan
          </NavLink>

          <NavLink
            to="/stats"
            className={({ isActive }) =>
              isActive ? "font-medium text-primary" : "text-gray-600"
            }
          >
            Stats
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive
                ? "font-medium text-primary flex items-center gap-1"
                : "text-gray-600 flex items-center gap-1"
            }
          >
            <ShoppingCart size={18} />
            Panier
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
  