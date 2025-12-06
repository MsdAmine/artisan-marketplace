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
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Assuming getCart and useAuth are correctly defined elsewhere
import { getCart } from "@/api/cart";
import { useAuth } from "@/context/AuthContext";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/api/notifications";
import type { Notification } from "@/types/notifications";
import { Input } from "./input";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setNotificationsOpen(false);
      return;
    }

    void loadNotifications();
  }, [user]);

  async function loadNotifications() {
    try {
      setNotificationsLoading(true);
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setNotificationsLoading(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleNotificationSelect(notification: Notification) {
    if (!notification.read) {
      try {
        await markNotificationRead(notification._id);
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id ? { ...item, read: true } : item
          )
        );
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }

    setNotificationsOpen(false);
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  }

  function submitSearch() {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    navigate(`/artisans/search?q=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    submitSearch();
  }

  const isActive = (path: string) =>
    location.pathname ===
    path; 
  
  const isArtisan = user?.role === "artisan"; // Vérifie si l'utilisateur est un artisan

  /** Desktop links (dynamic based on auth + role) **/ // Use NavLink | false[] to allow conditional elements, then filter and cast to NavLink[]

  const navLinks: NavLink[] = [
    // Condition: Afficher 'Accueil' uniquement si l'utilisateur n'est PAS un artisan
    !isArtisan && { path: "/", label: "Accueil", icon: <Home className="h-4 w-4" /> },
    
    // Condition: Afficher 'Panier' uniquement si l'utilisateur n'est PAS un artisan
    !isArtisan && {
      path: "/cart",
      label: "Panier",
      icon: <ShoppingCart className="h-4 w-4" />,
      badge: cartCount,
    }, 
    
    // ADDITION: Profile link, visible only if the user is authenticated
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
            {/* Search */}
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                {searchOpen && (
                  <Input
                    ref={searchInputRef}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un artisan"
                    className="w-52 sm:w-64 pr-10"
                    onBlur={() => {
                      if (!searchTerm) {
                        setSearchOpen(false);
                      }
                    }}
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 rounded-full hover:bg-muted ${
                    searchOpen ? "bg-muted" : ""
                  }`}
                  title="Rechercher un artisan"
                  type={searchOpen ? "submit" : "button"}
                  onClick={() => {
                    if (searchOpen && searchTerm.trim()) {
                      submitSearch();
                      return;
                    }
                    setSearchOpen((open) => !open);
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
            {/* Notifications */}{" "}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-muted relative"
                title={user ? "Notifications" : "Connectez-vous pour voir les notifications"}
                onClick={() => {
                  if (!user) return;
                  if (!notificationsOpen) {
                    void loadNotifications();
                  }
                  setNotificationsOpen((open) => !open);
                }}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 min-h-4 min-w-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                ) : null}
              </Button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-xl shadow-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        {notificationsLoading
                          ? "Chargement..."
                          : unreadCount > 0
                            ? `${unreadCount} non lues`
                            : "Toutes lues"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={handleMarkAllRead}
                      disabled={unreadCount === 0}
                    >
                      Marquer tout comme lu
                    </Button>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {notifications.length === 0 && !notificationsLoading ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun nouvel événement.
                      </p>
                    ) : null}

                    {notifications.map((notification) => {
                      const destination = notification.artisanId
                        ? `/artisan/${notification.artisanId}`
                        : "/";

                      return (
                        <Link
                          key={notification._id}
                          to={destination}
                          onClick={() => void handleNotificationSelect(notification)}
                          className={`block rounded-lg border p-2 transition ${
                            notification.read
                              ? "border-transparent bg-muted/50"
                              : "border-primary/20 bg-primary/5"
                          }`}
                        >
                          <p className="text-sm font-semibold">
                            Nouvel article publié
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.productName || "Découvrir la nouveauté"}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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