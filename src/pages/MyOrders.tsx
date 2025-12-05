import { useEffect, useState } from "react";
import { getOrders } from "@/api/orders";
import { submitProductRatings } from "@/api/productRatings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Home,
  Receipt,
  Download,
  ArrowRight,
  ChevronRight,
  Filter,
  Calendar,
  CreditCard,
  User,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  Star,
} from "lucide-react";

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [error, setError] = useState<string | null>(null);
  const [itemRatings, setItemRatings] = useState<Record<string, number>>({});
  const [submittingRating, setSubmittingRating] = useState(false);
  
  const [submittedRatings, setSubmittedRatings] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const buildItemRatingKey = (orderId: string, item: any, index: number) => {
    return [
      orderId,
      item.productId,
      item.product?._id,
      item._id,
      item.productName,
      index,
    ]
      .filter(Boolean)
      .join(":");
  };

  const handleRateItem = (
    orderId: string,
    item: any,
    index: number,
    rating: number
  ) => {
    const key = buildItemRatingKey(orderId, item, index);
    setItemRatings((prev) => ({
      ...prev,
      [key]: rating,
    }));
  };

  const getRatedItemsForOrder = (order: any) => {
    return (order.items || [])
      .map((item: any, index: number) => {
        const key = buildItemRatingKey(order._id, item, index);
        const rating = itemRatings[key];

        if (!rating) return null;

        return {
          key,
          orderId: order._id,
          orderItemId: item._id,
          productId: item.productId || item.product?._id || "",
          productName: item.productName,
          rating,
          quantity: item.quantity,
        };
      })
      .filter((item) => item.productId)
      .filter(
        (
          item
        ): item is {
          orderId: string;
          orderItemId: string;
          productId: string;
          productName: string;
          rating: number;
          quantity: number;
        } => Boolean(item)
      );
  };

  const handleSubmitRatings = async (order: any) => {
    const ratedItems = getRatedItemsForOrder(order).filter(
      (item) => !submittedRatings.has(item.key)
    );

    if (!ratedItems.length) {
      toast({
        title: "Aucune note sélectionnée",
        description:
          "Sélectionnez une note pour au moins un produit avant de l'enregistrer.",
      });
      return;
    }

    setSubmittingRating(true);

    try {
      await submitProductRatings(
        order._id,
        ratedItems.map((item) => ({
          productId: item.productId,
          rating: item.rating,
          orderItemId: item.orderItemId || null,
        }))
      );

      toast({
        title: "Notation enregistrée",
        description: "Notes enregistrées avec succès.",
      });
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement des notes", err);
      toast({
        title: "Échec de l'enregistrement",
        description:
          err?.message || "Impossible d'enregistrer vos notes pour le moment.",
      });
    } finally {
      setSubmittingRating(false);
    }
  };

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setError("Impossible de charger vos commandes. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders based on status
  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    return order.status === activeFilter;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === "amount-high") {
      return b.totalAmount - a.totalAmount;
    }
    return a.totalAmount - b.totalAmount;
  });

  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      processing: {
        label: "En traitement",
        icon: Clock,
        color: "bg-amber-100 text-amber-800 border-amber-200",
      },
      shipped: {
        label: "Expédiée",
        icon: Truck,
        color: "bg-blue-100 text-blue-800 border-blue-200",
      },
      delivered: {
        label: "Livrée",
        icon: CheckCircle,
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      },
      cancelled: {
        label: "Annulée",
        icon: Clock,
        color: "bg-red-100 text-red-800 border-red-200",
      },
    };
    return (
      statusMap[status] || {
        label: "Inconnu",
        icon: Clock,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      }
    );
  };

  const getPaymentMethodInfo = (method: string) => {
    const methods: any = {
      credit_card: "Carte bancaire",
      paypal: "PayPal",
      cash_on_delivery: "Paiement à la livraison",
    };
    return methods[method] || method;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return "Date inconnue";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            Chargement de vos commandes...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Erreur de chargement
          </h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={loadOrders} className="rounded-apple">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight mb-2">
                Mes Commandes
              </h1>
              <p className="text-muted-foreground">
                Consultez et gérez toutes vos commandes passées
              </p>
            </div>
            <Button
              variant="outline"
              onClick={loadOrders}
              className="gap-2 rounded-apple"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>

          {/* Stats Summary - Only show if there are orders */}
          {orders.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-8">
              <Card className="rounded-apple border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total des commandes
                      </p>
                      <p className="text-2xl font-semibold">{orders.length}</p>
                    </div>
                    <div className="h-10 w-10 rounded-apple bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-apple border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total dépensé
                      </p>
                      <p className="text-2xl font-semibold">
                        {orders.reduce(
                          (sum, order) => sum + (order.totalAmount || 0),
                          0
                        )}{" "}
                        MAD
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-apple bg-emerald-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-apple border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">En cours</p>
                      <p className="text-2xl font-semibold">
                        {
                          orders.filter(
                            (o) =>
                              o.status === "processing" ||
                              o.status === "shipped"
                          ).length
                        }
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-apple bg-blue-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-apple border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Livrées</p>
                      <p className="text-2xl font-semibold">
                        {orders.filter((o) => o.status === "delivered").length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-apple bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Filters and Controls - Only show if there are orders */}
        {orders.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <Button
                  variant={activeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter("all")}
                  className="rounded-apple"
                >
                  Toutes ({orders.length})
                </Button>
                <Button
                  variant={
                    activeFilter === "processing" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setActiveFilter("processing")}
                  className="rounded-apple"
                >
                  En traitement (
                  {orders.filter((o) => o.status === "processing").length})
                </Button>
                <Button
                  variant={activeFilter === "shipped" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter("shipped")}
                  className="rounded-apple"
                >
                  Expédiées (
                  {orders.filter((o) => o.status === "shipped").length})
                </Button>
                <Button
                  variant={activeFilter === "delivered" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter("delivered")}
                  className="rounded-apple"
                >
                  Livrées (
                  {orders.filter((o) => o.status === "delivered").length})
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {sortedOrders.length} commande
                  {sortedOrders.length !== 1 ? "s" : ""}
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-border rounded-apple pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                  <option value="newest">Plus récentes</option>
                  <option value="oldest">Plus anciennes</option>
                  <option value="amount-high">Montant élevé</option>
                  <option value="amount-low">Montant faible</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {sortedOrders.length === 0 ? (
                <Card className="rounded-apple border-border">
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                      Aucune commande trouvée
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {activeFilter === "all"
                        ? "Vous n'avez passé aucune commande pour le moment."
                        : "Aucune commande ne correspond à ce filtre."}
                    </p>
                    {activeFilter !== "all" && (
                      <Button
                        variant="outline"
                        onClick={() => setActiveFilter("all")}
                        className="rounded-apple"
                      >
                        Voir toutes les commandes
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                sortedOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <Card
                      key={order._id}
                      className="rounded-apple border-border hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <Badge
                                className={`${statusInfo.color} rounded-full px-3 py-1`}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {order.orderNumber ||
                                  `CMD-${order._id?.slice(-8)}`}
                              </span>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(order.createdAt)}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                              <div>
                                <h3 className="font-semibold mb-2">Articles</h3>
                                <div className="space-y-1">
                                  {(order.items || [])
                                    .slice(0, 2)
                                    .map((item: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <span className="truncate max-w-[180px]">
                                          {item.productName || "Produit"}
                                        </span>
                                        <span className="font-medium">
                                          {item.quantity} ×{" "}
                                          {(item.subtotal || 0) /
                                            (item.quantity || 1)}{" "}
                                          MAD
                                        </span>
                                      </div>
                                    ))}
                                  {(order.items || []).length > 2 && (
                                    <p className="text-sm text-muted-foreground">
                                      + {(order.items || []).length - 2} autre
                                      {(order.items || []).length - 2 > 1
                                        ? "s"
                                        : ""}{" "}
                                      article
                                      {(order.items || []).length - 2 > 1
                                        ? "s"
                                        : ""}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h3 className="font-semibold mb-2">
                                  Livraison
                                </h3>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span>
                                      {order.deliveryAddress?.city ||
                                        "Ville inconnue"}
                                    </span>
                                  </div>
                                  {order.estimatedDelivery && (
                                    <div className="flex items-center gap-2">
                                      <Truck className="h-3 w-3 text-muted-foreground" />
                                      <span>
                                        {statusInfo.label === "Livrée"
                                          ? `Livrée le ${formatDate(
                                              order.deliveredAt ||
                                                order.estimatedDelivery
                                            )}`
                                          : `Estimation: ${formatDate(
                                              order.estimatedDelivery
                                            )}`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h3 className="font-semibold mb-2">Paiement</h3>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="h-3 w-3 text-muted-foreground" />
                                    <span>
                                      {getPaymentMethodInfo(
                                        order.paymentMethod ||
                                          "cash_on_delivery"
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="ml-8 text-right">
                            <div className="text-2xl font-bold mb-2">
                              {order.totalAmount || 0} MAD
                            </div>
                            <div className="flex items-center gap-2 text-primary text-sm">
                              <span>Voir les détails</span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </>
        ) : (
          // Empty state when no orders
          <Card className="rounded-apple border-border">
            <CardContent className="p-16 text-center">
              <div className="h-32 w-32 rounded-apple bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center mx-auto mb-8">
                <Package className="h-16 w-16 text-primary/50" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Aucune commande
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Vous n'avez pas encore passé de commande. Parcourez notre
                catalogue et découvrez des produits artisanaux uniques.
              </p>
              <Button asChild className="rounded-apple gap-2 px-8" size="lg">
                <a href="/">Découvrir les produits</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-3xl rounded-apple max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Détails de la commande
            </DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber ||
                `CMD-${selectedOrder?._id?.slice(-8)}`}{" "}
              • Passée le {selectedOrder && formatDate(selectedOrder.createdAt)}
              {selectedOrder?.createdAt && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {new Date(selectedOrder.createdAt).toLocaleTimeString(
                    "fr-FR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="rounded-apple border-border">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Résumé de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(selectedOrder.items || []).map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b border-border pb-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-apple bg-muted flex items-center justify-center">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  className="h-full w-full object-cover rounded-apple"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {item.productName || "Produit"}
                              </p>
                              {selectedOrder.status === "delivered" && (
                                <div className="py-2">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Notez ce produit
                                  </p>
                                  <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
                                    <div className="flex gap-1">
                                      {[...Array(5)].map((_, starIndex) => {
                                        const starValue = starIndex + 1;
                                        const itemKey = buildItemRatingKey(
                                          selectedOrder._id,
                                          item,
                                          index
                                        );
                                        const isActive =
                                          itemRatings[itemKey] >= starValue;

                                        return (
                                          <button
                                            type="button"
                                            key={starIndex}
                                            onClick={() =>
                                              handleRateItem(
                                                selectedOrder._id,
                                                item,
                                                index,
                                                starValue
                                              )
                                            }
                                            className={`transition-colors ${
                                              isActive
                                                ? "text-amber-500"
                                                : "text-muted-foreground hover:text-amber-400"
                                            }`}
                                            aria-label={`Noter ${starValue} étoile${
                                              starValue === 1 ? "" : "s"
                                            } pour ${
                                              item.productName || "ce produit"
                                            }`}
                                            aria-pressed={isActive}
                                          >
                                            <Star className="h-4 w-4 fill-current" />
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <Button
                                      size="sm"
                                      className="rounded-apple"
                                      variant="default"
                                      onClick={() =>
                                        handleSubmitRatings(selectedOrder)
                                      }
                                      disabled={submittingRating}
                                    >
                                      {submittingRating
                                        ? "Enregistrement..."
                                        : "Noter"}
                                    </Button>
                                  </div>
                                </div>
                              )}
                              <p className="text-sm text-muted-foreground">
                                Quantité: {item.quantity || 1}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {item.subtotal || 0} MAD
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(item.subtotal || 0) / (item.quantity || 1)} MAD
                              l'unité
                            </p>
                          </div>
                        </div>
                      )
                    )}

                    <div className="pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sous-total</span>
                        <span>
                          {(selectedOrder.items || []).reduce(
                            (sum: number, item: any) =>
                              sum + (item.subtotal || 0),
                            0
                          )}{" "}
                          MAD
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Livraison</span>
                        <span className="text-emerald-600">Gratuite</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                        <span>Total</span>
                        <span>{selectedOrder.totalAmount || 0} MAD</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping and Payment Info */}
              <div className="grid grid-cols-2 gap-6">
                <Card className="rounded-apple border-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Adresse de livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium">
                      {selectedOrder.deliveryAddress?.fullName || "Client"}
                    </p>
                    <p className="text-sm">
                      {selectedOrder.deliveryAddress?.address ||
                        "Adresse inconnue"}
                    </p>
                    <p className="text-sm">
                      {selectedOrder.deliveryAddress?.city || "Ville inconnue"}
                    </p>
                    <div className="pt-2 space-y-1">
                      {selectedOrder.deliveryAddress?.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {selectedOrder.deliveryAddress.phone}
                        </div>
                      )}
                      {selectedOrder.deliveryAddress?.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {selectedOrder.deliveryAddress.email}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-apple border-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Paiement et livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Méthode de paiement
                      </p>
                      <p className="font-medium">
                        {getPaymentMethodInfo(
                          selectedOrder.paymentMethod || "cash_on_delivery"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Statut
                      </p>
                      {(() => {
                        const statusInfo = getStatusInfo(
                          selectedOrder.status || "processing"
                        );
                        const StatusIcon = statusInfo.icon;
                        return (
                          <Badge
                            className={`${statusInfo.color} rounded-full px-3 py-1`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        );
                      })()}
                    </div>
                    {selectedOrder.estimatedDelivery && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {selectedOrder.status === "delivered"
                            ? "Livrée le"
                            : "Estimation de livraison"}
                        </p>
                        <p className="font-medium">
                          {formatDate(selectedOrder.estimatedDelivery)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-apple"
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
