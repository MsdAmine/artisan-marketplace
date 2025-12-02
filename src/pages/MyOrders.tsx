import { useEffect, useState } from "react";
import { getOrders } from "@/api/orders";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw
} from "lucide-react";

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Mock orders data structure (in real app, replace with actual API)
  const mockOrders = [
    {
      _id: "1",
      orderNumber: "ORD-2024-0012",
      createdAt: "2024-03-15T10:30:00Z",
      items: [
        { productName: "Tapis berbère premium", quantity: 1, subtotal: 890, image: "/tapis.jpg" },
        { productName: "Poterie artisanale", quantity: 2, subtotal: 340, image: "/poterie.jpg" }
      ],
      totalAmount: 1230,
      status: "delivered",
      deliveryAddress: {
        name: "John Doe",
        street: "123 Rue de la Paix",
        city: "Casablanca",
        phone: "+212 6 12 34 56 78",
        email: "john@example.com"
      },
      paymentMethod: "credit_card",
      estimatedDelivery: "2024-03-20",
      deliveredAt: "2024-03-19T14:20:00Z"
    },
    {
      _id: "2",
      orderNumber: "ORD-2024-0011",
      createdAt: "2024-03-10T14:45:00Z",
      items: [
        { productName: "Couscoussière en cuivre", quantity: 1, subtotal: 650, image: "/couscoussiere.jpg" }
      ],
      totalAmount: 650,
      status: "shipped",
      deliveryAddress: {
        name: "Jane Smith",
        street: "456 Avenue Mohammed V",
        city: "Rabat",
        phone: "+212 6 98 76 54 32",
        email: "jane@example.com"
      },
      paymentMethod: "paypal",
      estimatedDelivery: "2024-03-18",
      trackingNumber: "TRK789456123"
    },
    {
      _id: "3",
      orderNumber: "ORD-2024-0010",
      createdAt: "2024-03-05T09:15:00Z",
      items: [
        { productName: "Lanterne marocaine", quantity: 3, subtotal: 450, image: "/lanterne.jpg" },
        { productName: "Plateau en bois d'olivier", quantity: 1, subtotal: 280, image: "/plateau.jpg" },
        { productName: "Théière artisanale", quantity: 2, subtotal: 360, image: "/theiere.jpg" }
      ],
      totalAmount: 1090,
      status: "processing",
      deliveryAddress: {
        name: "Robert Johnson",
        street: "789 Boulevard Hassan II",
        city: "Marrakech",
        phone: "+212 6 55 44 33 22",
        email: "robert@example.com"
      },
      paymentMethod: "cash_on_delivery",
      estimatedDelivery: "2024-03-22"
    },
    {
      _id: "4",
      orderNumber: "ORD-2024-0009",
      createdAt: "2024-02-28T16:20:00Z",
      items: [
        { productName: "Babouche marocaine", quantity: 2, subtotal: 240, image: "/babouche.jpg" }
      ],
      totalAmount: 240,
      status: "cancelled",
      deliveryAddress: {
        name: "Sarah Wilson",
        street: "101 Rue des Artisans",
        city: "Fès",
        phone: "+212 6 11 22 33 44",
        email: "sarah@example.com"
      },
      paymentMethod: "credit_card",
      cancellationReason: "Changed mind"
    }
  ];

  async function loadOrders() {
    setLoading(true);
    try {
      // Uncomment for real API call
      // const data = await getOrders();
      // setOrders(data);
      
      // Using mock data for now
      setOrders(mockOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders based on status
  const filteredOrders = orders.filter(order => {
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
      processing: { label: "En traitement", icon: Clock, color: "bg-amber-100 text-amber-800 border-amber-200" },
      shipped: { label: "Expédiée", icon: Truck, color: "bg-blue-100 text-blue-800 border-blue-200" },
      delivered: { label: "Livrée", icon: CheckCircle, color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
      cancelled: { label: "Annulée", icon: Clock, color: "bg-red-100 text-red-800 border-red-200" }
    };
    return statusMap[status] || { label: "Inconnu", icon: Clock, color: "bg-gray-100 text-gray-800 border-gray-200" };
  };

  const getPaymentMethodInfo = (method: string) => {
    const methods: any = {
      credit_card: "Carte bancaire",
      paypal: "PayPal",
      cash_on_delivery: "Paiement à la livraison"
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement de vos commandes...</p>
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

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="rounded-apple border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total des commandes</p>
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
                    <p className="text-sm text-muted-foreground">Total dépensé</p>
                    <p className="text-2xl font-semibold">
                      {orders.reduce((sum, order) => sum + order.totalAmount, 0)} MAD
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
                      {orders.filter(o => o.status === "processing" || o.status === "shipped").length}
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
                      {orders.filter(o => o.status === "delivered").length}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-apple bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Controls */}
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
              variant={activeFilter === "processing" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("processing")}
              className="rounded-apple"
            >
              En traitement ({orders.filter(o => o.status === "processing").length})
            </Button>
            <Button
              variant={activeFilter === "shipped" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("shipped")}
              className="rounded-apple"
            >
              Expédiées ({orders.filter(o => o.status === "shipped").length})
            </Button>
            <Button
              variant={activeFilter === "delivered" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("delivered")}
              className="rounded-apple"
            >
              Livrées ({orders.filter(o => o.status === "delivered").length})
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {sortedOrders.length} commande{sortedOrders.length !== 1 ? 's' : ''}
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
                          <Badge className={`${statusInfo.color} rounded-full px-3 py-1`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {order.orderNumber}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-8">
                          <div>
                            <h3 className="font-semibold mb-2">Articles</h3>
                            <div className="space-y-1">
                              {order.items.slice(0, 2).map((item: any, index: number) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="truncate max-w-[180px]">{item.productName}</span>
                                  <span className="font-medium">{item.quantity} × {item.subtotal / item.quantity} MAD</span>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <p className="text-sm text-muted-foreground">
                                  + {order.items.length - 2} autre{order.items.length - 2 > 1 ? 's' : ''} article{order.items.length - 2 > 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Livraison</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{order.deliveryAddress.city}</span>
                              </div>
                              {order.estimatedDelivery && (
                                <div className="flex items-center gap-2">
                                  <Truck className="h-3 w-3 text-muted-foreground" />
                                  <span>
                                    {statusInfo.label === "Livrée" 
                                      ? `Livrée le ${new Date(order.deliveredAt || order.estimatedDelivery).toLocaleDateString('fr-FR')}`
                                      : `Estimation: ${new Date(order.estimatedDelivery).toLocaleDateString('fr-FR')}`
                                    }
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
                                <span>{getPaymentMethodInfo(order.paymentMethod)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ml-8 text-right">
                        <div className="text-2xl font-bold mb-2">{order.totalAmount} MAD</div>
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
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl rounded-apple">
          <DialogHeader>
            <DialogTitle className="text-2xl">Détails de la commande</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber} • Passée le {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="rounded-apple border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-apple bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.subtotal} MAD</p>
                          <p className="text-sm text-muted-foreground">{item.subtotal / item.quantity} MAD l'unité</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sous-total</span>
                        <span>{selectedOrder.items.reduce((sum: number, item: any) => sum + item.subtotal, 0)} MAD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Livraison</span>
                        <span className="text-emerald-600">Gratuite</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                        <span>Total</span>
                        <span>{selectedOrder.totalAmount} MAD</span>
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
                    <p className="font-medium">{selectedOrder.deliveryAddress.name}</p>
                    <p className="text-sm">{selectedOrder.deliveryAddress.street}</p>
                    <p className="text-sm">{selectedOrder.deliveryAddress.city}</p>
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3" />
                        {selectedOrder.deliveryAddress.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        {selectedOrder.deliveryAddress.email}
                      </div>
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
                      <p className="text-sm text-muted-foreground mb-1">Méthode de paiement</p>
                      <p className="font-medium">{getPaymentMethodInfo(selectedOrder.paymentMethod)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Statut</p>
                      {(() => {
                        const statusInfo = getStatusInfo(selectedOrder.status);
                        const StatusIcon = statusInfo.icon;
                        return (
                          <Badge className={`${statusInfo.color} rounded-full px-3 py-1`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        );
                      })()}
                    </div>
                    {selectedOrder.estimatedDelivery && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {selectedOrder.status === "delivered" ? "Livrée le" : "Estimation de livraison"}
                        </p>
                        <p className="font-medium">
                          {new Date(selectedOrder.estimatedDelivery).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" className="gap-2 rounded-apple">
                  <Download className="h-4 w-4" />
                  Télécharger la facture
                </Button>
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