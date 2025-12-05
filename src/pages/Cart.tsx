import { useEffect, useState } from "react";
import { getCart, updateQuantity, removeItem } from "@/api/cart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { createOrder } from "@/api/orders";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  CheckCircle,
  CreditCard,
  Shield,
  Truck,
  AlertCircle,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Interface pour le type d'adresse
interface DeliveryAddress {
  fullName: string; // Correspond au nom du client s'il est utilisé
  city: string;
  address: string; // Correspond à street
}

// SIMULATION: Fonction pour simuler la récupération des données utilisateur (basée sur l'image)
// NOTE: Vous devrez remplacer ceci par la fonction API réelle qui charge le profil client
const fetchUserData = async () => {
  // Simuler un délai de réseau
  await new Promise((resolve) => setTimeout(resolve, 300));

  const customerData = {
    name: "massine", // Utilisé pour fullName
    email: "massine@gmail.com",
    deliveryAddress: {
      street: "10 Av allal Al Fassi, bayt al maarifa",
      city: "Rabat",
      postalCode: "10000",
      country: "Morocco",
      phone: "0618356833",
    },
  };

  // Conversion des données utilisateur en format DeliveryAddress
  if (customerData.deliveryAddress) {
    return {
      fullName: customerData.name || "",
      city: customerData.deliveryAddress.city || "",
      address: customerData.deliveryAddress.street || "",
    };
  }
  return null;
};

// Adresse vide pour l'état de modification
const EMPTY_ADDRESS: DeliveryAddress = {
  fullName: "",
  city: "",
  address: "",
};

export default function Cart() {
  const { toast } = useToast();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  // État pour stocker l'adresse par défaut réelle une fois chargée
  const [defaultAddress, setDefaultAddress] = useState<DeliveryAddress | null>(
    null
  );

  // L'adresse actuellement utilisée dans le formulaire (initialisée à vide, sera remplie par useEffect)
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>(
    EMPTY_ADDRESS
  );

  // NOUVEL ÉTAT pour savoir si l'utilisateur est en train de saisir une nouvelle adresse
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  async function refreshCart() {
    const data = await getCart();
    setCart(data);
  }

  async function loadInitialData() {
    setLoading(true);
    try {
      // 1. Charger le panier
      await refreshCart();

      // 2. Charger l'adresse utilisateur réelle
      const userAddress = await fetchUserData();

      setDefaultAddress(userAddress);

      if (userAddress && isAddressValid(userAddress)) {
        // Utiliser l'adresse de l'utilisateur si elle est valide
        setDeliveryAddress(userAddress);
        setIsEditingAddress(false); // Afficher l'adresse par défaut
      } else {
        // Forcer l'édition si aucune adresse n'est trouvée
        setIsEditingAddress(true);
      }
    } catch (error) {
      console.error("Erreur de chargement initial:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le panier ou l'adresse utilisateur.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fonction utilitaire pour vérifier si l'adresse est valide (non vide)
  const isAddressValid = (address: DeliveryAddress) => {
    return (
      address.fullName.trim() !== "" &&
      address.city.trim() !== "" &&
      address.address.trim() !== ""
    );
  };

  const handleRemoveItem = async (productId: string, productName: string) => {
    setRemovingItem(productId);
    try {
      await removeItem(productId);
      toast({
        title: "Article retiré",
        description: `${productName} a été supprimé du panier.`,
      });
      refreshCart();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de retirer l'article.",
      });
    } finally {
      setRemovingItem(null);
    }
  };

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(productId, newQuantity);
      refreshCart();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la quantité.",
      });
    }
  };

  const handleCheckout = async () => {
    if (isEditingAddress && !isAddressValid(deliveryAddress)) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir toutes les informations de livraison.",
      });
      return;
    }

    try {
      await createOrder({
        items: cart.items,
        totalAmount: cart.totalAmount,
        paymentMethod: "cash_on_delivery",
        deliveryAddress: deliveryAddress,
      });
      toast({
        title: "Commande validée ! 🎉",
        description: "Votre commande a été enregistrée avec succès.",
      });
      setCheckoutOpen(false);
      refreshCart();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider la commande.",
      });
    }
  };

  // Logique pour basculer vers le formulaire d'édition
  const handleEditAddress = () => {
    setIsEditingAddress(true);
    // L'adresse courante (deliveryAddress) reste dans l'état et pré-remplit le formulaire.
  };

  // Logique pour revenir à l'adresse par défaut
  const handleRevertToDefault = () => {
    if (defaultAddress) {
      setDeliveryAddress(defaultAddress);
      setIsEditingAddress(false);
    }
  };

  /* --------------------------- */
  /*      Loading State          */
  /* --------------------------- */
  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );

  /* --------------------------- */
  /*      Empty Cart State       */
  /* --------------------------- */
  if (!cart?.items?.length)
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-2xl mx-auto px-8 py-16 text-center">
          <div className="h-32 w-32 rounded-apple bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center mx-auto mb-8">
            <ShoppingCart className="h-16 w-16 text-primary/50" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight mb-4">
            Votre panier est vide
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            Ajoutez des produits artisanaux uniques pour commencer votre
            collection
          </p>

          <Button asChild className="rounded-apple gap-2 px-8" size="lg">
            <a href="/">
              <Package className="h-5 w-5" />
              Explorer les produits
            </a>
          </Button>

          <div className="mt-16 grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="h-12 w-12 rounded-apple bg-muted flex items-center justify-center mx-auto mb-3">
                  {i === 1 && (
                    <Shield className="h-6 w-6 text-muted-foreground" />
                  )}
                  {i === 2 && (
                    <Truck className="h-6 w-6 text-muted-foreground" />
                  )}
                  {i === 3 && (
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm font-medium">
                  {i === 1 && "Paiement sécurisé"}
                  {i === 2 && "Livraison rapide"}
                  {i === 3 && "Retour gratuit"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight mb-2">
            Votre Panier
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {cart.items.length} article{cart.items.length > 1 ? "s" : ""} dans
              votre panier
            </p>
            <Badge variant="outline" className="rounded-full">
              <ShoppingCart className="h-3 w-3 mr-1" />
              En cours
            </Badge>
          </div>
          <Button
            variant="link"
            onClick={loadInitialData}
            className="p-0 h-auto text-sm text-muted-foreground"
          >
            Recharger l'adresse utilisateur (Simulé)
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <Card className="rounded-apple border-border mb-6">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg">Articles</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {cart.items.map((item: any) => (
                    <div
                      key={item.productId}
                      className="p-6 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-6">
                        {/* Image */}
                        <div className="relative">
                          <img
                            src={
                              item.image || "https://via.placeholder.com/100"
                            }
                            className="h-24 w-24 rounded-apple object-cover border border-border"
                            alt={item.productName}
                          />
                          <div className="absolute -top-2 -right-2">
                            <Badge className="rounded-full bg-primary text-primary-foreground">
                              {item.quantity}
                            </Badge>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {item.productName}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-3">
                            {item.description || "Produit artisanal de qualité"}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 border border-border rounded-apple">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none rounded-l-apple hover:bg-muted"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none rounded-r-apple hover:bg-muted"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="text-right flex-1">
                              <p className="text-lg font-semibold">
                                {item.subtotal} MAD
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.unitPrice} MAD l'unité
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-9 w-9 rounded-apple"
                            onClick={() =>
                              handleRemoveItem(item.productId, item.productName)
                            }
                            disabled={removingItem === item.productId}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-96">
            <Card className="rounded-apple border-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-medium">
                      {cart.items.reduce(
                        (sum: number, item: any) => sum + item.subtotal,
                        0
                      )}{" "}
                      MAD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="text-emerald-600 font-medium">
                      Gratuite
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes</span>
                    <span className="font-medium">0 MAD</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{cart.totalAmount} MAD</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full rounded-apple gap-2"
                  size="lg"
                  onClick={() => setCheckoutOpen(true)}
                >
                  <CreditCard className="h-5 w-5" />
                  Procéder au paiement
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Livraison estimée: 3-5 jours
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Retour gratuit sous 30 jours
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md rounded-apple max-h-[85vh] overflow-y-auto my-8">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Confirmer votre commande
            </DialogTitle>
            <DialogDescription>
              Vérifiez les détails et confirmez l'adresse de livraison.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Gestion de l'adresse de livraison */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse de livraison
              </h4>

              {isEditingAddress || !isAddressValid(deliveryAddress) ? (
                // MODE ÉDITION / SAISIE (Champs pré-remplis avec l'adresse courante)
                <div className="space-y-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input
                      id="fullName"
                      placeholder="Prénom et Nom"
                      value={deliveryAddress.fullName}
                      onChange={(e) =>
                        setDeliveryAddress((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="rounded-apple"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      placeholder="Votre ville"
                      value={deliveryAddress.city}
                      onChange={(e) =>
                        setDeliveryAddress((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className="rounded-apple"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="address">Adresse complète</Label>
                    <Input
                      id="address"
                      placeholder="Rue, numéro, appartement"
                      value={deliveryAddress.address}
                      onChange={(e) =>
                        setDeliveryAddress((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      className="rounded-apple"
                    />
                  </div>
                  {/* Bouton pour revenir à l'adresse par défaut */}
                  {defaultAddress && isAddressValid(defaultAddress) && (
                    <div className="text-right pt-2">
                        <Button
                            variant="link"
                            className="p-0 h-auto text-xs text-muted-foreground gap-1"
                            onClick={handleRevertToDefault}
                        >
                            <RotateCcw className="h-3 w-3" />
                            Revenir à l'adresse par défaut
                        </Button>
                    </div>
                  )}
                </div>
              ) : (
                // MODE AFFICHAGE (Adresse par défaut ou saisie précédemment validée)
                <Card className="rounded-apple border-primary/50 bg-primary/5">
                  <CardContent className="p-4 space-y-1">
                    <p className="font-semibold">{deliveryAddress.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {deliveryAddress.address}, {deliveryAddress.city}
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm text-primary/70 gap-1 pt-1"
                      onClick={handleEditAddress}
                    >
                      <MapPin className="h-4 w-4" />
                      Modifier l'adresse
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            {/* Fin Gestion de l'adresse de livraison */}

            {/* Order Summary */}
            <Card className="rounded-apple border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total à payer</span>
                    <span className="text-2xl">{cart.totalAmount} MAD</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Articles</span>
                      <span>{cart.items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison</span>
                      <span className="text-emerald-600">Gratuite</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <div>
              <h4 className="font-medium mb-3">Méthode de paiement</h4>
              <div className="space-y-2">
                {["credit_card", "paypal", "cash_on_delivery"].map((method) => (
                  <div
                    key={method}
                    className={`flex items-center gap-3 p-3 border rounded-apple hover:border-primary/50 cursor-pointer transition-colors ${
                      method === "cash_on_delivery"
                        ? "border-primary/50 bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="h-5 w-5 rounded-full border-2 border-border flex items-center justify-center">
                      {method === "cash_on_delivery" && (
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <span className="capitalize">
                      {method === "credit_card" &&
                        "Carte bancaire (Non disponible)"}
                      {method === "paypal" && "PayPal (Non disponible)"}
                      {method === "cash_on_delivery" &&
                        "Paiement à la livraison"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-muted/30 rounded-apple p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">Paiement sécurisé</p>
                  <p className="text-xs text-muted-foreground">
                    Vos informations de paiement sont cryptées et ne seront
                    jamais stockées sur nos serveurs.
                  </p>
                </div>
              </div>
            </div>

            {/* Warning for stock */}
            {cart.items.some((item: any) => item.stock < item.quantity) && (
              <div className="bg-amber-50 border border-amber-200 rounded-apple p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 text-sm mb-1">
                      Attention stock limité
                    </p>
                    <p className="text-amber-700 text-xs">
                      Certains articles ont un stock limité. Validez rapidement
                      votre commande.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setCheckoutOpen(false)}
              className="rounded-apple"
            >
              Continuer mes achats
            </Button>
            <Button
              onClick={handleCheckout}
              className="rounded-apple gap-2"
              // Le bouton est actif si l'adresse actuellement dans l'état est valide
              disabled={!isAddressValid(deliveryAddress)}
            >
              <CheckCircle className="h-5 w-5" />
              Payer {cart.totalAmount} MAD
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}