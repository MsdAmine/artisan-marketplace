// src/components/ui/ProductModal.jsx (CODE CORRIGÉ)

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addToCart } from "@/api/cart";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Package,
  Tag,
  Star,
  CheckCircle,
  Shield,
  AlertCircle,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { trackInteraction } from "@/api/recommendations";
import { useArtisanName } from "@/hooks/useArtisanName";
// 🟢 IMPORTATION DU HOOK DE NOTE
import { useProductRating } from "@/hooks/useProductRating"; 

export default function ProductModal({ open, onClose, product }: any) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();

  const artisanName = useArtisanName(product?.artisanId);
  // 🟢 UTILISATION DU HOOK DE NOTE
  const { average: fetchedRating, totalReviews } = useProductRating(product?._id);

  // 🟢 CALCUL DE LA NOTE FORMATÉE (pour afficher X.X, même 0.0)
  const averageRating = parseFloat(fetchedRating).toFixed(1);

  // If no product, do not render the modal
  if (!product) return null;

  /* ---------- Track product view in Neo4j ---------- */
  useEffect(() => {
    if (!open || !user || !product?._id) return;

    // Fire and forget, do not block UI
    trackInteraction({
      userId: user.id,
      productId: product._id,
      action: "view",
    }).catch((err) => {
      console.error("Failed to track view interaction", err);
    });
  }, [open, user, product?._id]);

  async function handleAdd() {
    try {
      setLoading(true);

      // Add to cart in your backend
      await addToCart(product._id, quantity);

      // Track add_to_cart interaction in Neo4j
      if (user) {
        trackInteraction({
          userId: user.id,
          productId: product._id,
          action: "add_to_cart",
        }).catch((err) => {
          console.error("Failed to track add_to_cart interaction", err);
        });
      }

      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        setQuantity(1);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Erreur d'ajout au panier");
    } finally {
      setLoading(false);
    }
  }

  function handleIncrement() {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  }

  function handleDecrement() {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }

  const stockStatus =
    product.stock === 0
      ? { label: "Épuisé", color: "bg-red-100 text-red-800 border-red-200" }
      : product.stock < 5
      ? {
          label: "Stock limité",
          color: "bg-amber-100 text-amber-800 border-amber-200",
        }
      : {
          label: "En stock",
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-apple max-h-[90vh] overflow-y-auto my-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Single Image */}
          <div>
            <div className="relative">
              <div className="aspect-square rounded-apple border border-border bg-gray-50 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Package className="h-16 w-16" />
                  </div>
                )}
              </div>

              {/* Stock Badge */}
              <div className="absolute top-4 left-4">
                <Badge
                  className={`${stockStatus.color} rounded-full px-3 border`}
                >
                  {stockStatus.label}
                </Badge>
              </div>
            </div>

            {/* Product Info Under Image */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Produit artisanal</p>
                  <p className="text-sm text-muted-foreground">
                    Fait main au Maroc
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Garantie qualité</p>
                  <p className="text-sm text-muted-foreground">
                    Retour gratuit sous 30 jours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col">
            <DialogHeader className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="rounded-full gap-1">
                  <Tag className="h-3 w-3" />
                  {product.category || "Non catégorisé"}
                </Badge>
                {/* 🟢 REMPLACEMENT DES VALEURS STATIQUES PAR LES VALEURS RÉELLES */}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{totalReviews === 0 ? 'N/A' : averageRating}</span> {/* Utilisation de la note réelle ou "0.0" */}
                  <span className="text-sm text-muted-foreground">({totalReviews})</span> {/* Utilisation du nombre d'avis réel */}
                </div>
              </div>
              <DialogTitle className="text-2xl font-semibold tracking-tight">
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-base mt-2">
                {product.description ||
                  "Produit artisanal de qualité supérieure."}
              </DialogDescription>
            </DialogHeader>

            {/* Price Section */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">{product.price} MAD</span>
                <span className="text-sm text-muted-foreground">
                  TVA incluse
                </span>
              </div>
            </div>

            {/* Stock Warning */}
            {product.stock < 5 && product.stock > 0 && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-apple p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 text-sm mb-1">
                      Stock limité
                    </p>
                    <p className="text-amber-700 text-xs">
                      Seulement {product.stock} exemplaire
                      {product.stock > 1 ? "s" : ""} disponible
                      {product.stock > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Quantité</span>
                <span className="text-sm text-muted-foreground">
                  {product.stock} disponible{product.stock > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-apple">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-none rounded-l-apple hover:bg-muted"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-16 text-center font-medium text-lg">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-none rounded-r-apple hover:bg-muted"
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right flex-1">
                  <p className="text-lg font-semibold">
                    {product.price * quantity} MAD
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {quantity} × {product.price} MAD
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAdd}
                disabled={loading || product.stock === 0}
                className="w-full gap-2 rounded-apple py-3"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Ajout en cours...
                  </>
                ) : added ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Ajouté au panier !
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Ajouter au panier
                  </>
                )}
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Artisan</p>
                  <p className="font-medium">
                    {artisanName || product.artisan || "Artisan local"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Livraison</p>
                  <p className="font-medium text-emerald-600">Gratuite</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Fabrication</p>
                  <p className="font-medium">Fait à la main</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Référence</p>
                  <p className="font-medium">
                    {product._id?.slice(-8).toUpperCase() ||
                      "ART-" +
                      Math.random().toString(36).substr(2, 6).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}