import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Package,
  TrendingUp,
  ShoppingCart,
  Edit,
  Trash2,
  Plus,
  Eye,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Filter,
  BarChart3,
  Download,
} from "lucide-react";
import AddProductModal from "@/components/ui/AddProductModal";
import EditProductModal from "@/components/ui/EditProductModal";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { API_BASE, API_ROOT } from "@/api/client";
import { authHeaders } from "@/api/authHeaders";

export default function ArtisanDashboard() {
  type ArtisanStats = {
    totalSales: number;
    totalOrders: number;
    productCount: number;
    salesChangePercent?: number;
  };
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState<ArtisanStats | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [loading, setLoading] = useState(false);

  const lowStockProducts = products.filter((p) => p.stock < 5);
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const { user } = useAuth();

  const productSalesMetric = (product) =>
    product?.totalSales ??
    product?.salesCount ??
    product?.sales ??
    product?.sold ??
    product?.ordersCount ??
    0;

  const bestSellingProduct = products.reduce(
    (best, product) => {
      const sales = productSalesMetric(product);

      if (sales > best.salesMetric) {
        return { product, salesMetric: sales };
      }

      return best;
    },
    { product: null, salesMetric: 0 }
  );

  const totalSalesMetric = products.reduce(
    (total, product) => total + productSalesMetric(product),
    0
  );

  const averagePrice =
    products.length > 0
      ? products.reduce((sum, product) => sum + (product.price || 0), 0) /
        products.length
      : 0;

  const highestPrice = products.reduce(
    (max, product) => Math.max(max, product.price || 0),
    0
  );

  const totalInventoryValue = products.reduce(
    (sum, product) => sum + (product.price || 0) * (product.stock || 0),
    0
  );

  const maxInventoryValue = products.reduce(
    (max, product) =>
      Math.max(max, (product.price || 0) * (product.stock || 0)),
    0
  );

  const bestSellingPercent =
    totalSalesMetric > 0
      ? Math.min((bestSellingProduct.salesMetric / totalSalesMetric) * 100, 100)
      : products.length > 0
      ? 100
      : 0;

  const averagePricePercent =
    highestPrice > 0 ? Math.min((averagePrice / highestPrice) * 100, 100) : 0;

  const inventoryValuePercent =
    maxInventoryValue > 0
      ? Math.min(
          (totalInventoryValue / (maxInventoryValue * Math.max(products.length, 1))) *
            100,
          100
        )
      : 0;

  async function loadProducts() {
    if (!user) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/products/by-artisan/${user.id}`
      );
      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
        ? data.products
        : [];

      setProducts(list);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]); // avoid filter crash
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    if (!user) return;

    try {
      const res = await fetch(`${API_BASE}/stats/artisan`, {
        headers: authHeaders({ includeJson: false, includeUserId: true }),
      });

      if (!res.ok) {
        setStats(null);
        return;
      }

      const data = await res.json();
      setStats(data); // save object directly
    } catch (err) {
      console.error("Failed to load stats:", err);
      setStats(null);
    }
  }

  useEffect(() => {
    if (user) {
      loadProducts();
      loadStats();
    }
  }, [user]);

  const artisanData: ArtisanStats = stats || {
    totalSales: 0,
    totalOrders: 0,
    productCount: 0,
    salesChangePercent: 0,
  };
  // Filter products based on active tab
  const filteredProducts = products.filter((product) => {
    if (activeTab === "all") return true;
    if (activeTab === "lowStock") return product.stock < 5 && product.stock > 0;
    if (activeTab === "outOfStock") return product.stock === 0;
    if (activeTab === "inStock") return product.stock >= 5;
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (sortConfig.key === "name") {
      return sortConfig.direction === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortConfig.key === "price") {
      return sortConfig.direction === "asc"
        ? a.price - b.price
        : b.price - a.price;
    }
    if (sortConfig.key === "stock") {
      return sortConfig.direction === "asc"
        ? a.stock - b.stock
        : b.stock - a.stock;
    }
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey)
      return <ChevronUp className="h-3 w-3 opacity-0" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">
              Dashboard Artisan
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos produits et suivez vos performances
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadProducts();
                loadStats();
              }}
              className="gap-2"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>
            <Button
              onClick={() => setOpenAdd(true)}
              className="gap-2 rounded-apple bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-5 w-5" />
              Ajouter un produit
            </Button>
          </div>
        </div>

        {/* Alert Banner */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-apple p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 mb-1">
                  Attention : Gestion du stock requise
                </p>
                <p className="text-sm text-amber-700">
                  {outOfStockProducts.length > 0 && (
                    <span className="font-semibold">
                      {outOfStockProducts.length} produit
                      {outOfStockProducts.length > 1 ? "s" : ""} épuisé
                      {outOfStockProducts.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {outOfStockProducts.length > 0 &&
                    lowStockProducts.length > 0 &&
                    " • "}
                  {lowStockProducts.length > 0 && (
                    <span className="font-semibold">
                      {lowStockProducts.length} produit
                      {lowStockProducts.length > 1 ? "s" : ""} en stock faible
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => setActiveTab("lowStock")}
              >
                Voir le stock
              </Button>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            title="Ventes totales"
            value={`${artisanData.totalSales.toLocaleString()} MAD`}
            change={
              artisanData.salesChangePercent !== undefined
                ? `${artisanData.salesChangePercent.toFixed(1)}%`
                : undefined
            }
            icon={<TrendingUp className="h-5 w-5" />}
            color="primary"
          />

          <StatCard
            title="Commandes"
            value={artisanData.totalOrders || 0}
            change={undefined} // no orders change percent from backend
            icon={<ShoppingCart className="h-5 w-5" />}
            color="secondary"
          />

          <StatCard
            title="Produits actifs"
            value={products.length}
            icon={<Package className="h-5 w-5" />}
          />

          <StatCard
            title="Stock faible"
            value={lowStockProducts.length}
            icon={<AlertCircle className="h-5 w-5" />}
            alert={lowStockProducts.length > 0}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Table Section */}
          <div className="lg:col-span-2">
            <Card className="rounded-apple border border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/50 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-muted-foreground" />
                    <CardTitle className="text-xl font-semibold">
                      Vos produits
                    </CardTitle>
                    <Badge variant="secondary" className="rounded-full">
                      {sortedProducts.length}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Simple Tab Navigation */}
                    <div className="inline-flex bg-muted p-1 rounded-lg">
                      <button
                        onClick={() => setActiveTab("all")}
                        className={`px-3 py-1.5 text-sm rounded-apple transition-colors ${
                          activeTab === "all"
                            ? "bg-background shadow-xs"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        Tous
                      </button>
                      <button
                        onClick={() => setActiveTab("inStock")}
                        className={`px-3 py-1.5 text-sm rounded-apple transition-colors ${
                          activeTab === "inStock"
                            ? "bg-background shadow-xs"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        En stock
                      </button>
                      <button
                        onClick={() => setActiveTab("lowStock")}
                        className={`px-3 py-1.5 text-sm rounded-apple transition-colors flex items-center gap-1 ${
                          activeTab === "lowStock"
                            ? "bg-background shadow-xs"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <AlertCircle className="h-3 w-3" />
                        Faible
                      </button>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-apple"
                      title="Filtrer les produits"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/30 border-b border-border">
                            <th
                              className="py-3 px-6 text-left font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => handleSort("name")}
                            >
                              <div className="flex items-center gap-2">
                                Nom
                                <SortIcon columnKey="name" />
                              </div>
                            </th>
                            <th
                              className="py-3 px-6 text-left font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => handleSort("price")}
                            >
                              <div className="flex items-center gap-2">
                                Prix
                                <SortIcon columnKey="price" />
                              </div>
                            </th>
                            <th
                              className="py-3 px-6 text-left font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => handleSort("stock")}
                            >
                              <div className="flex items-center gap-2">
                                Stock
                                <SortIcon columnKey="stock" />
                              </div>
                            </th>
                            <th className="py-3 px-6 text-left font-medium text-muted-foreground">
                              Catégorie
                            </th>
                            <th className="py-3 px-6 text-left font-medium text-muted-foreground">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {sortedProducts.map((p) => {
                            const lowStock = p.stock < 5;
                            const outOfStock = p.stock === 0;

                            return (
                              <tr
                                key={p._id}
                                className="border-b border-border hover:bg-muted/20 transition-colors group"
                              >
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-apple bg-muted flex items-center justify-center group-hover:bg-muted/50 transition-colors">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{p.name}</p>
                                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                        {p.description || "Aucune description"}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-4 px-6">
                                  <span className="font-semibold">
                                    {p.price} MAD
                                  </span>
                                </td>

                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-20 bg-muted rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          outOfStock
                                            ? "bg-red-500"
                                            : lowStock
                                            ? "bg-amber-500"
                                            : "bg-emerald-500"
                                        }`}
                                        style={{
                                          width: `${
                                            Math.min(p.stock, 20) * 5
                                          }%`,
                                        }}
                                      ></div>
                                    </div>

                                    <div className="flex flex-col min-w-[80px]">
                                      <span
                                        className={`font-medium ${
                                          outOfStock
                                            ? "text-red-600"
                                            : lowStock
                                            ? "text-amber-600"
                                            : "text-emerald-600"
                                        }`}
                                      >
                                        {p.stock} unités
                                      </span>
                                      {outOfStock ? (
                                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs rounded-full px-2">
                                          Épuisé
                                        </Badge>
                                      ) : lowStock ? (
                                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs rounded-full px-2">
                                          Faible
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs rounded-full px-2">
                                          Bon
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="py-4 px-6">
                                  <Badge
                                    variant="outline"
                                    className="rounded-full px-3"
                                  >
                                    {p.category || "Non catégorisé"}
                                  </Badge>
                                </td>

                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 rounded-apple hover:bg-muted"
                                      onClick={() => setEditProduct(p)}
                                      title="Modifier"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 rounded-apple hover:bg-red-50 hover:text-red-600"
                                      onClick={() => setDeleteProduct(p)}
                                      title="Supprimer"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 rounded-apple hover:bg-muted"
                                      title="Voir détails"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {sortedProducts.length === 0 && (
                      <div className="text-center py-16">
                        <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">
                          {activeTab === "all"
                            ? "Aucun produit enregistré"
                            : "Aucun produit correspond à ce filtre"}
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          {activeTab === "all"
                            ? "Commencez par ajouter votre premier produit à votre catalogue"
                            : "Essayez de modifier vos filtres pour voir plus de résultats"}
                        </p>
                        {activeTab === "all" && (
                          <Button
                            onClick={() => setOpenAdd(true)}
                            className="gap-2 rounded-apple"
                          >
                            <Plus className="h-4 w-4" />
                            Ajouter un produit
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stock Status */}
            <Card className="rounded-apple border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  État du stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-apple bg-emerald-50 hover:bg-emerald-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                    <span>Stock bon</span>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {products.filter((p) => p.stock >= 5).length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-apple bg-amber-50 hover:bg-amber-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span>Stock faible</span>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {lowStockProducts.length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-apple bg-red-50 hover:bg-red-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span>Épuisé</span>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {outOfStockProducts.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card className="rounded-apple border border-border bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Résumé de performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Produit le plus vendu
                    </span>
                    <span className="font-medium">
                      {bestSellingProduct.product?.name ||
                        (products.length ? "N/A" : "Aucun produit")}
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${bestSellingPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Moyenne des prix
                    </span>
                    <span className="font-medium">
                      {averagePrice.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })} MAD
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-secondary h-2 rounded-full"
                      style={{ width: `${averagePricePercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valeur totale</span>
                    <span className="font-medium">
                      {totalInventoryValue.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })} MAD
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${inventoryValuePercent}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={loadProducts}
        artisanId={user?.id}
        apiBaseUrl={API_ROOT}
      />

      <EditProductModal
        open={!!editProduct}
        product={editProduct}
        onClose={() => setEditProduct(null)}
        onUpdated={loadProducts}
      />

      <DeleteConfirmModal
        open={!!deleteProduct}
        product={deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onDeleted={loadProducts}
      />
    </div>
  );
}

/* ---------------------- */
/*   Apple Style StatCard */
/* ---------------------- */
function StatCard({
  title,
  value,
  change,
  icon,
  color = "default",
  alert = false,
}: any) {
  const colorClasses = {
    default: "border-border",
    primary: "border-primary/20",
    secondary: "border-secondary/20",
  };

  const bgClasses = {
    default: "bg-background",
    primary: "bg-primary/5",
    secondary: "bg-secondary/5",
  };

  return (
    <Card
      className={`rounded-apple border shadow-xs ${colorClasses[color]} transition-all hover:shadow-sm`}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-2 rounded-apple ${bgClasses[color]} border ${colorClasses[color]}`}
          >
            {icon}
          </div>
          {alert && (
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
          )}
        </div>
        <p className="text-sm text-muted-foreground font-medium mb-1">
          {title}
        </p>
        <p className="text-2xl font-semibold mb-2">{value}</p>
        {change && (
          <div className="flex items-center">
            <span
              className={`text-xs font-medium ${
                change.startsWith("+") ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {change}
            </span>
            <span className="text-muted-foreground text-xs ml-2">
              vs mois dernier
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
