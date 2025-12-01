import { useEffect, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";

export default function Catalog() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold tracking-tight mb-8">
          🛍️ Produits disponibles
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.length > 0 ? (
            products.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))
          ) : (
            <p className="text-gray-500">Chargement...</p>
          )}
        </div>
      </div>
    </div>
  );
}
