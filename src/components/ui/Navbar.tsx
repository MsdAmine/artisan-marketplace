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
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCart } from "@/api/cart";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [cartCount, setCartCount] = useState(0);

  // Load cart count
  async function loadCartCount() {
    try {
      const cart = await getCart();
      const totalItems = cart.items?.reduce(
        (sum: number, item: any) => sum + item.quantity,
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

  const isActive = (path: string) => location.pathname === path;

  /** Desktop links (dynamic based on auth + role) **/
  const navLinks = [
    { path: "/", label: "Accueil", icon: <Home className="h-4 w-4" /> },
    { path: "/cart", label: "Panier", icon: <ShoppingCart className="h-4 w-4" />, badge: cartCount },
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
  ].filter(Boolean) as any[];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-apple bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-primary">
                ArtisanMarket
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                Artisanat d'exception
              </p>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-apple text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                {link.icon}
                {link.label}

                {link.badge > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 min-w-5 flex items-center justify-center px-1 rounded-full bg-primary text-primary-foreground"
                  >
                    {link.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">

            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-apple hover:bg-muted"
              title="Rechercher"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-apple hover:bg-muted relative"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            </Button>

            {/* AUTH BUTTON */}
            {!user ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-apple"
                onClick={() => navigate("/login")}
              >
                <User className="h-4 w-4" />
                Se connecter
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-apple"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <User className="h-4 w-4" />
                Déconnexion
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
