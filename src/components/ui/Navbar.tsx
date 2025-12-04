import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  BarChart3,
  Home,
  User,
  Bell,
  Search,
} from "lucide-react";
// FIX: Explicitly importing React to resolve the 'Cannot find namespace JSX' error
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Assuming getCart and useAuth are correctly defined elsewhere
import { getCart } from "@/api/cart";
import { useAuth } from "@/context/AuthContext";

/** Define the required structure for a navigation link */
interface NavLink {
  path: string;
  label: string;
  // FIX: Using React.ReactElement instead of JSX.Element for explicit type resolution
  icon: React.ReactElement;
  badge?: number; // Optional badge for displaying counts (like cart items)
}

/** Define the structure for a cart item needed for calculation */
interface CartItem {
  quantity: number;
  // Add other properties like productId, price, etc., if needed
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Assuming useAuth provides user and logout

  const [cartCount, setCartCount] = useState(0); // Load cart count

  async function loadCartCount() {
    try {
      const cart = await getCart(); // FIX: Use explicit CartItem type for better type safety instead of 'any'
      const totalItems = cart.items?.reduce(
        (sum: number, item: CartItem) => sum + item.quantity,
        0
      );
      setCartCount(totalItems || 0);
    } catch (err) {
      console.error("Failed to load cart count", err);
    }
  }

  useEffect(() => {
    loadCartCount();
  }, [location.pathname]);

  const isActive = (path: string) =>
    location.pathname ===
    path; /** Desktop links (dynamic based on auth + role) **/ // Use NavLink | false[] to allow conditional elements, then filter and cast to NavLink[]

  const navLinks: NavLink[] = [
    { path: "/", label: "Accueil", icon: <Home className="h-4 w-4" /> },
    {
      path: "/cart",
      label: "Panier",
      icon: <ShoppingCart className="h-4 w-4" />,
      badge: cartCount,
    }, // ADDITION: Profile link, visible only if the user is authenticated
    user && {
      path: user.role === "artisan" ? `/artisan/${user.id}` : "/profile",
      label: "Mon Profil",
      icon: <User className="h-4 w-4" />,
    },

    user?.role === "customer" && {
      path: "/my-orders",
      label: "Mes commandes",
      icon: <Package className="h-4 w-4" />,
    },
    user?.role === "artisan" && {
      path: "/artisan/dashboard",
      label: "Dashboard",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    user?.role === "admin" && {
      path: "/admin/dashboard",
      label: "Admin Panel",
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ].filter(Boolean) as NavLink[]; // Filter removes 'false' values, cast ensures type safety

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-md">
      {" "}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {" "}
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}{" "}
          <Link to="/" className="flex items-center gap-2 group">
            {" "}
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center shadow-lg">
              <Package className="h-4 w-4 text-white" />{" "}
            </div>{" "}
            <div>
              {" "}
              <h1 className="text-xl font-extrabold tracking-tight text-gray-800">
                ArtisanMarket{" "}
              </h1>{" "}
              <p className="text-xs text-muted-foreground -mt-1 font-medium">
                Artisanat d'exception{" "}
              </p>{" "}
            </div>{" "}
          </Link>
          {/* DESKTOP NAV */}{" "}
          <div className="hidden lg:flex items-center space-x-1">
            {" "}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-gray-600 hover:text-primary hover:bg-muted"
                }`}
              >
                {link.icon} {link.label}{" "}
                {link.badge && link.badge > 0 ? (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 min-w-5 flex items-center justify-center px-1 rounded-full bg-red-500 text-white font-bold text-xs"
                  >
                    {link.badge}{" "}
                  </Badge>
                ) : null}{" "}
              </Link>
            ))}{" "}
          </div>
          {/* RIGHT SIDE */}{" "}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}{" "}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-muted"
              title="Rechercher"
            >
              <Search className="h-4 w-4" />{" "}
            </Button>
            {/* Notifications */}{" "}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-muted relative"
              title="Notifications"
            >
              <Bell className="h-4 w-4" /> {/* Notification indicator */}{" "}
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>{" "}
            </Button>
            {/* AUTH BUTTON */}{" "}
            {!user ? (
              <Button
                variant="default"
                size="sm"
                className="gap-2 rounded-full hidden sm:flex font-semibold"
                onClick={() => navigate("/login")}
              >
                <User className="h-4 w-4" /> Se connecter{" "}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full hidden sm:flex font-semibold"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <User className="h-4 w-4" />
                Déconnexion{" "}
              </Button>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </nav>
  );
}
