import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AddProductModal from "@/components/ui/AddProductModal";
import EditProductModal from "@/components/ui/EditProductModal";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

export default function ArtisanDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const lowStockProducts = products.filter((p: any) => p.stock < 5);


  async function loadProducts() {
    const res = await fetch("http://localhost:3000/api/artisans");
    const data = await res.json();
    setProducts(data);
  }

  async function loadStats() {
    const res = await fetch("http://localhost:3000/api/stats/sales-by-artisan");
    const data = await res.json();
    setStats(data);
  }

  useEffect(() => {
    loadProducts();
    loadStats();
  }, []);

  const artisanData = stats.find(s => s._id === "demo-artisan");

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard Artisan</h1>
          <Button onClick={() => setOpenAdd(true)}>
            Ajouter un produit
          </Button>
        </div>
        {lowStockProducts.length > 0 && (
          <div className="mb-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded">
            ⚠️ Attention: {lowStockProducts.length} produit(s) ont un stock faible !
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <StatCard title="Ventes totales" value={(artisanData?.totalSales || 0) + " MAD"} />
          <StatCard title="Commandes" value={artisanData?.totalOrders || 0} />
          <StatCard title="Produits" value={products.length} />
        </div>

        {/* Product Table */}
        <ProductTable
          products={products}
          onEdit={(p) => setEditProduct(p)}
          onDelete={(p) => setDeleteProduct(p)}
        />

        <AddProductModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onCreated={() => loadProducts()}
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
    </div>
  );
}


function StatCard({ title, value }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
      <p className="text-gray-600">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function ProductTable({ products, onEdit, onDelete }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h2 className="text-xl font-bold mb-4">Vos produits</h2>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Nom</th>
            <th>Prix</th>
            <th>Stock</th>
            <th>Catégorie</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p: any) => {
            const lowStock = p.stock < 5;

            return (
              <tr
                key={p._id}
                className={`border-b ${
                  lowStock ? "bg-red-50" : ""
                }`}
              >
                <td className="py-2">{p.name}</td>
                <td>{p.price} MAD</td>

                <td className={lowStock ? "font-bold text-red-600" : ""}>
                  {p.stock}

                  {lowStock && (
                    <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                      Stock faible
                    </span>
                  )}
                </td>

                <td>{p.category}</td>

                <td className="flex gap-3 py-2">
                  <Button size="sm" onClick={() => onEdit(p)}>
                    Modifier
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(p)}>
                    Supprimer
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


