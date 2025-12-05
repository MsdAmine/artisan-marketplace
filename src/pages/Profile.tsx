import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Home,
  Mail,
  MapPin,
  Package,
  Phone,
  Shield,
  ShoppingBag,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { getOrders } from "@/api/orders";
import { getCurrentUser } from "@/api/users";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";

type DeliveryAddress = {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  image?: string;
};

type Order = {
  _id: string;
  orderNumber?: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  deliveryAddress?: DeliveryAddress;
  createdAt: string;
};

type CustomerProfile = {
  id: string;
  email: string;
  role: string;
  name?: string;
  phone?: string;
};

const statusStyles: Record<
  string,
  { label: string; color: string; icon: ComponentType<{ className?: string }> }
> = {
  processing: {
    label: "En traitement",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
  },
  shipped: {
    label: "Expédiée",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Package,
  },
  delivered: {
    label: "Livrée",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Annulée",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    icon: Clock,
  },
};

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const [profileData, orderData] = await Promise.all([
          getCurrentUser(),
          getOrders(),
        ]);

        setProfile({
          id: profileData.id || profileData._id,
          email: profileData.email,
          role: profileData.role,
          name: profileData.name,
          phone: profileData.phone,
        });
        setOrders(orderData || []);
      } catch (err) {
        console.error("Unable to load customer profile", err);
        setError(
          "Impossible de charger votre profil pour le moment. Veuillez réessayer plus tard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const activeOrders = orders.filter(
      (order) => order.status !== "delivered" && order.status !== "cancelled"
    ).length;
    const deliveredOrders = orders.filter((order) => order.status === "delivered").length;

    return { totalOrders, totalSpent, activeOrders, deliveredOrders };
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);

  const addressBook = useMemo(() => {
    const addresses = new Map<string, DeliveryAddress>();

    orders.forEach((order) => {
      if (!order.deliveryAddress) return;
      const { street, city, postalCode, country } = order.deliveryAddress;
      const key = `${street || ""}-${city || ""}-${postalCode || ""}-${country || ""}`;
      if (!addresses.has(key)) {
        addresses.set(key, order.deliveryAddress);
      }
    });

    return Array.from(addresses.values());
  }, [orders]);

  function formatDate(value?: string) {
    if (!value) return "Date inconnue";
    try {
      return new Date(value).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (err) {
      return "Date inconnue";
    }
  }

  if (!user && !authLoading) {
    return <div className="text-center py-12">Veuillez vous connecter.</div>;
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Profil indisponible</CardTitle>
            <CardDescription>{error || "Profil introuvable."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-semibold">
              {profile.name?.[0]?.toUpperCase() || profile.email[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Client</p>
            <h1 className="text-3xl font-bold tracking-tight">
              {profile.name || "Profil client"}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Mail className="h-4 w-4" />
              <span>{profile.email}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/my-orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Mes commandes
            </Link>
          </Button>
          <Button variant="default" className="gap-2">
            <Shield className="h-4 w-4" /> Sécurité
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Commandes</CardDescription>
            <CardTitle className="text-3xl">{stats.totalOrders}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
            <Package className="h-4 w-4" /> Total de commandes passées
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dépenses</CardDescription>
            <CardTitle className="text-3xl">
              {stats.totalSpent.toLocaleString("fr-FR", {
                style: "currency",
                currency: "MAD",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Montant total dépensé
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>En cours</CardDescription>
            <CardTitle className="text-3xl">{stats.activeOrders}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" /> Commandes en préparation ou expédiées
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Livrées</CardDescription>
            <CardTitle className="text-3xl">{stats.deliveredOrders}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Commandes livrées
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
            <CardDescription>Un aperçu de vos 3 dernières commandes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Vous n'avez pas encore passé de commande.
              </p>
            )}
            {recentOrders.map((order) => {
              const status = statusStyles[order.status] || statusStyles.processing;
              const StatusIcon = status.icon;
              return (
                <div
                  key={order._id}
                  className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(order.createdAt)}
                    </p>
                    <h3 className="font-semibold">Commande {order.orderNumber || order._id}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {order.items.slice(0, 3).map((item) => (
                        <Badge key={item.productId} variant="secondary">
                          {item.quantity} × {item.productName}
                        </Badge>
                      ))}
                      {order.items.length > 3 && (
                        <Badge variant="outline">+{order.items.length - 3} autres</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-lg font-semibold">
                        {order.totalAmount.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </p>
                    </div>
                    <Badge className={`flex items-center gap-1 border ${status.color}`}>
                      <StatusIcon className="h-4 w-4" /> {status.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
              <CardDescription>Contact et sécurité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-semibold">{profile.name || "Non renseigné"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold break-all">{profile.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-semibold">{profile.phone || "Non renseigné"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Rôle</p>
                  <p className="font-semibold capitalize">{profile.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adresses enregistrées</CardTitle>
              <CardDescription>Basées sur vos commandes récentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressBook.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ajoutez une première adresse lors de votre prochaine commande.
                </p>
              )}
              {addressBook.map((address, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Adresse #{idx + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      {[address.street, address.postalCode, address.city]
                        .filter(Boolean)
                        .join(", ") || "Adresse partielle"}
                    </p>
                    {address.country && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {address.country}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
