import { useEffect, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import {
  Filter,
  Grid3x3,
  List,
  Search,
  ChevronDown,
  X,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import * as TabsUI from "@radix-ui/react-tabs";
const Tabs = TabsUI.Root;
const TabsList = TabsUI.List;
const TabsTrigger = TabsUI.Trigger;
const TabsContent = TabsUI.Content;

// Define a basic Product type (assuming your MongoDB products have these)
interface Product {
  _id: string;
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  stock: number;
  artisan: string;
  // Add other necessary properties like imageUrls, etc.
}

// Define the structure of a recommended item returned from the backend
interface RecommendationItem {
  id: string; // The MongoDB product ID
  name: string | null; // Currently null from the backend
  score: number;
}

// Define the structure of the merged product (full product data + score)
interface MergedProduct extends Product {
  score: number;
}

export default function Catalog() {
  const [recommended, setRecommended] = useState<MergedProduct[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true); // Global product loading
  const [priceRange, setPriceRange] = useState([0, 5000]);

  // NEW STATE: dedicated loading for recommendations
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Removed: showRecommendations state as we are using tabs now.

  // Extract unique categories from products
  const categories = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  // --- EFFECT 1: Load all MongoDB Products ---
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3000/api/products")
      .then((res) => res.json())
      .then((data: Product[]) => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // --- EFFECT 2: Load and Merge Neo4j Recommendations ---
  useEffect(() => {
    async function loadRecommendations() {
      try {
        const saved = localStorage.getItem("auth");
        if (!saved || products.length === 0) return;

        setLoadingRecommendations(true); // Start loading recommendations

        const { user } = JSON.parse(saved);

        const res = await fetch(
          `http://localhost:3000/api/recommendations/${user.id}`
        );

        if (!res.ok) {
          console.error("Failed to fetch recommendations:", res.statusText);
          return;
        }

        const data = await res.json();
        const recommendationItems: RecommendationItem[] = data.products;

        const productMap = new Map(products.map((p) => [p._id, p]));

        const mergedRecommendations = recommendationItems
          .map((rec) => {
            const fullProduct = productMap.get(rec.id);

            if (fullProduct) {
              return {
                ...fullProduct,
                score: rec.score,
              } as MergedProduct;
            }
            return null;
          })
          .filter((p): p is MergedProduct => p !== null);

        setRecommended(mergedRecommendations);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setLoadingRecommendations(false); // Stop loading recommendations
      }
    }

    loadRecommendations();
  }, [products]);

  // Filter and sort products (Logic remains the same)
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Apply price filter
    result = result.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "stock":
        result.sort((a, b) => b.stock - a.stock);
        break;
      default: // "featured"
        result.sort((a, b) => b.stock - a.stock);
        break;
    }

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortBy, priceRange]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("featured");
    setPriceRange([0, 5000]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight mb-3">
                Marché Artisanal
              </h1>
              <p className="text-muted-foreground text-lg">
                Découvrez des créations uniques faites à la main avec passion
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="rounded-full px-4 py-1.5">
                <TrendingUp className="h-3 w-3 mr-1" />
                {products.length} produits
              </Badge>
              <Badge className="rounded-full px-4 py-1.5 bg-primary text-primary-foreground">
                <Sparkles className="h-3 w-3 mr-1" />
                Artisanat premium
              </Badge>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un produit, un artisan..."
              className="pl-12 pr-4 py-3 rounded-apple bg-white border-border focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0">
            <Card className="rounded-apple border-border sticky top-24">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtres
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-xs h-7"
                  >
                    Réinitialiser
                  </Button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Catégories
                  </h4>
                  <div className="space-y-2">
                    {categories.slice(0, 8).map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-apple text-sm transition-colors ${
                          selectedCategory === category
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="capitalize">
                          {category === "all" ? "Toutes" : category}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {category === "all"
                            ? products.length
                            : products.filter((p) => p.category === category)
                                .length}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Fourchette de prix
                  </h4>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>0 MAD</span>
                      <span>Jusqu'à {priceRange[1]} MAD</span>
                    </div>
                  </div>
                </div>

                {/* Stock Status */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Disponibilité
                  </h4>
                  <div className="space-y-2">
                    {[
                      {
                        label: "En stock",
                        count: products.filter((p) => p.stock > 0).length,
                      },
                      {
                        label: "Stock limité",
                        count: products.filter(
                          (p) => p.stock > 0 && p.stock < 5
                        ).length,
                      },
                      {
                        label: "Bientôt disponible",
                        count: products.filter((p) => p.stock === 0).length,
                      },
                    ].map((status) => (
                      <button
                        key={status.label}
                        className="flex items-center justify-between w-full text-left px-3 py-2 rounded-apple text-sm hover:bg-muted transition-colors"
                      >
                        <span>{status.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {status.count}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <CardContent className="p-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Statistiques
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Prix moyen</span>
                    <span className="font-semibold">
                      {Math.round(
                        products.reduce((acc, p) => acc + p.price, 0) /
                          products.length
                      ) || 0}{" "}
                      MAD
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Artisans actifs</span>
                    <span className="font-semibold">
                      {new Set(products.map((p) => p.artisan)).size}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Note moyenne</span>
                    <span className="font-semibold flex items-center gap-1">
                      4.8{" "}
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content: Tabbed Structure */}
          <div className="flex-1">
            <Tabs defaultValue="catalog">
              {/* 1. Tab List (Products | For You) */}
              <TabsList className="flex h-auto p-1 bg-muted rounded-full w-full justify-start mb-8 border border-border">
                <TabsTrigger
                  value="catalog"
                  className="flex-1 py-2 px-6 rounded-full text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  Catalogue ({filteredProducts.length})
                </TabsTrigger>

                {/* Only show the 'For You' tab if recommendations exist */}
                {recommended.length > 0 && (
                  <TabsTrigger
                    value="recommended"
                    className="flex-1 py-2 px-6 rounded-full text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Pour vous ({recommended.length})
                  </TabsTrigger>
                )}
              </TabsList>

              {/* 2. Content for "Catalogue" (Filtered Products) */}
              <TabsContent value="catalog">
                {/* Controls Bar (Filter/Sort/View) - Applied here for the main catalog view */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      {filteredProducts.length} produit
                      {filteredProducts.length !== 1 ? "s" : ""} trouvé
                      {filteredProducts.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex border border-border rounded-apple overflow-hidden">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        className="h-9 w-9 rounded-none border-r border-border"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        className="h-9 w-9 rounded-none"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-white border border-border rounded-apple pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                      >
                        <option value="featured">En vedette</option>
                        <option value="price-low">Prix : croissant</option>
                        <option value="price-high">Prix : décroissant</option>
                        <option value="name">Nom A-Z</option>
                        <option value="stock">Disponibilité</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
                    </div>
                  </div>
                </div>
                {/* End Controls Bar */}

                {/* Products Grid / No Products Found Message */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="h-12 w-12 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-muted-foreground">
                      Chargement des produits...
                    </p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div
                    className={`gap-6 ${
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        : "space-y-4"
                    }`}
                  >
                    {filteredProducts.map((p) => (
                      <ProductCard key={p._id} p={p} viewMode={viewMode} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-muted-foreground mb-3">
                      Aucun produit trouvé
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Aucun produit ne correspond à vos critères de recherche.
                      Essayez de modifier vos filtres.
                    </p>
                    <Button onClick={resetFilters} className="rounded-apple">
                      Réinitialiser les filtres
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* 3. Content for "For You" (Recommendations) */}
              <TabsContent value="recommended">
                {/* *** ALIGNMENT FIX: Spacer to match the height of the Controls Bar in the Catalogue tab. ***
                  I'm adding a dummy div to take up the space where the filter/sort controls are on the other tab.
                  I'm also removing the h3 and putting the title inside this spacer.
                */}
                <div className="flex items-center justify-between mb-8 h-[36px]">
                  <h3 className="text-xl font-semibold">
                    Recommandations personnalisées
                  </h3>
                </div>

                {loadingRecommendations ? (
                  // Show a centered loading spinner while data is fetched/merged
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-10 w-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-muted-foreground">
                      Analyse des préférences...
                    </p>
                  </div>
                ) : recommended.length > 0 ? (
                  // Show the grid only when data is ready
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommended.map((p) => (
                      <ProductCard key={p._id} p={p} viewMode="grid" />
                    ))}
                  </div>
                ) : (
                  // Show a message if no recommendations are found after loading
                  <div className="text-center py-12 text-muted-foreground">
                    Aucune recommandation trouvée pour l'instant.
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Loading More */}
            {filteredProducts.length > 0 && (
              <div className="mt-12 text-center"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
