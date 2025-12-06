// src/components/ui/ProductCard.tsx (CODE FINAL CORRIGÉ)
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "react-router-dom";
import ProductModal from "./ProductModal";
import {
  Package,
  Star,
  Eye,
  Tag
} from "lucide-react";
import { useArtisanName } from "@/hooks/useArtisanName";
import { useProductRating } from "@/hooks/useProductRating"; 

export default function ProductCard({ p, viewMode = "grid" }: any) {
  const [open, setOpen] = useState(false);

  const fetchedArtisanName = useArtisanName(p.artisanId);
  // Assurez-vous que useProductRating est importé correctement (avec l'alias '@/hooks/useProductRating' ou '../hooks/useProductRating')
  const { average: fetchedRating, totalReviews } = useProductRating(p._id); 

  const artisanName =
    fetchedArtisanName || p.artisan || "Artisan local";
  
  const artisanProfilePath = p.artisanId ? `/artisan/${p.artisanId}` : null;

  // 1. 🟢 NOUVELLE LOGIQUE DE LA NOTE : 
  // fetchedRating (qui vient du hook) sera 0 si pas d'avis. 
  // On le formate en chaîne de caractères (ex: 5.0, 3.0, ou 0.0)
  const averageRating = parseFloat(fetchedRating).toFixed(1); 
  
  // La variable hasReviews n'est plus utilisée pour la visibilité du bloc,
  // mais elle peut servir à afficher le nombre d'avis.
  const hasReviews = totalReviews > 0; 
  
  const renderArtisanLink = (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Par</span>
      {artisanProfilePath ? (
        <Link
          to={artisanProfilePath}
          onClick={(e) => e.stopPropagation()}
          className="font-medium text-primary hover:underline"
        >
          {artisanName}
        </Link>
      ) : (
        <span className="text-muted-foreground">{artisanName}</span>
      )}
    </div>
  );

  // Check if product is low stock
  const isLowStock = p.stock < 5;
  const isOutOfStock = p.stock === 0;

  if (viewMode === "list") {
    return (
      <>
        <Card
          className="rounded-apple border border-border shadow-sm 
               hover:shadow-md transition-all duration-200 overflow-hidden
               bg-background group cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <div className="flex">
            {/* Image */}
            <div className="w-48 flex-shrink-0">
              <div className="relative h-full">
                <img
                  src={p.image || "https://via.placeholder.com/300"}
                  alt={p.name}
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                {isLowStock && !isOutOfStock && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs rounded-full px-2 border-amber-200">
                      Stock faible
                    </Badge>
                  </div>
                )}
                {isOutOfStock && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs rounded-full px-2 border-red-200">
                      Épuisé
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Content - List View */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-foreground tracking-tight mb-1">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-4 mb-3">
                    <Badge variant="outline" className="rounded-full text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {p.category || "Non catégorisé"}
                    </Badge>
                    
                    {/* 2. 🟢 AFFICHAGE CORRIGÉ - VUE LIST : Toujours afficher la note */}
                    <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{totalReviews === 0 ? 'N/A' : averageRating}</span> 
                        <span className="text-xs text-muted-foreground">({totalReviews})</span>
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {p.price} MAD
                </div>
              </div>

              <p className="text-muted-foreground mb-4 line-clamp-2">
                {p.description || "Produit artisanal de qualité."}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className={`text-sm ${isLowStock ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                      {p.stock} en stock
                    </span>
                  </div>
                  {renderArtisanLink}
                </div>
                <Button
                  className="gap-2 rounded-apple"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Voir détails
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <ProductModal open={open} onClose={() => setOpen(false)} product={p} />
      </>
    );
  }

  // Grid View (Default)
  return (
    <>
      <Card
        className="rounded-apple border border-border shadow-sm 
             hover:shadow-md hover:-translate-y-1
             transition-all duration-300 overflow-hidden cursor-pointer
             bg-background group h-full flex flex-col"
        onClick={() => setOpen(true)}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={p.image || "https://via.placeholder.com/300"}
            alt={p.name}
            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isLowStock && !isOutOfStock && (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs rounded-full px-2 border-amber-200">
                Stock faible
              </Badge>
            )}
            {isOutOfStock && (
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs rounded-full px-2 border-red-200">
                Épuisé
              </Badge>
            )}
            <Badge variant="outline" className="bg-white/90 text-xs rounded-full px-2">
              <Tag className="h-3 w-3 mr-1" />
              {p.category || "Artisanat"}
            </Badge>
          </div>
          
          {/* Rating */}
          {/* 2. 🟢 AFFICHAGE CORRIGÉ - VUE GRID : Toujours afficher la note */}
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold">{totalReviews === 0 ? 'N/A' : averageRating}</span> 
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground tracking-tight mb-2 line-clamp-1">
              {p.name}
            </h3>

            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {p.description || "Produit artisanal de qualité supérieure."}
            </p>

            {renderArtisanLink}
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-primary">
                {p.price} MAD
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className={`text-sm ${isLowStock ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                  {p.stock}
                </span>
              </div>
            </div>

            <Button
              className="w-full gap-2 rounded-apple"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              disabled={isOutOfStock}
            >
              <Eye className="h-4 w-4" />
              {isOutOfStock ? "Épuisé" : "Voir détails"}
            </Button>
          </div>
        </div>
      </Card>

      <ProductModal open={open} onClose={() => setOpen(false)} product={p} />
    </>
  );
}