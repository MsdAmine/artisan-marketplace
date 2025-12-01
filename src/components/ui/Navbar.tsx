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
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItems] = useState(3); // Mock cart items count

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Accueil", icon: <Home className="h-4 w-4" /> },
    { path: "/cart", label: "Panier", icon: <ShoppingCart className="h-4 w-4" />, badge: cartItems },
    { path: "/my-orders", label: "Mes commandes", icon: <Package className="h-4 w-4" /> },
    { path: "/dashboard", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="h-8 w-8 rounded-apple bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-primary">
                    ArtisanMarket
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1">Artisanat d'exception</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
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
                  {link.badge && link.badge > 0 && (
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

            {/* Right side actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-apple hover:bg-muted"
                title="Rechercher"
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-apple hover:bg-muted relative"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-apple"
                title="Mon compte"
              >
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">Mon compte</span>
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-apple"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-sm">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-apple text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    {link.icon}
                    {link.label}
                  </div>
                  {link.badge && link.badge > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="h-5 min-w-5 flex items-center justify-center px-1 rounded-full bg-primary text-primary-foreground"
                    >
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              ))}
              
              <div className="pt-3 border-t border-border mt-3">
                <div className="flex items-center gap-2 px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 rounded-apple"
                  >
                    <User className="h-4 w-4" />
                    Mon compte
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-apple hover:bg-muted"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Search Bar for Mobile */}
      <div className="md:hidden border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Rechercher des produits..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-apple text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>
    </>
  );
}