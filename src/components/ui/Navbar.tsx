import { Link, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  BarChart3,
  Home,
  User,
  Bell,
  Search,
  Menu,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCart } from "@/api/cart";

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);

  // 👉 Load cart count
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

  // Load on mount + whenever route changes
  useEffect(() => {
    loadCartCount();
  }, [location.pathname]); // refresh on navigation

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Accueil", icon: <Home className="h-4 w-4" /> },
    { path: "/cart", label: "Panier", icon: <ShoppingCart className="h-4 w-4" />, badge: cartCount },
    { path: "/my-orders", label: "Mes commandes", icon: <Package className="h-4 w-4" /> },
    { path: "/dashboard", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <p className="text-xs text-muted-foreground -mt-1">Artisanat d'exception</p>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center space-x-1">
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

            {/* MOBILE BUTTON */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-apple"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-sm">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-apple text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {link.icon}
                    {link.label}
                  </div>

                  {link.badge > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 min-w-5 flex items-center justify-center px-1 rounded-full bg-primary text-primary-foreground"
                    >
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
