import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import ProductCard from "../components/ProductCard";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/products")
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  async function handleAddToCart(productId) {
    await apiPost("/cart/items", { productId, quantity: 1 });
  }

  if (loading) return <p>Chargement du catalogue...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Produits des artisans locaux
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {products.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            onAddToCart={() => handleAddToCart(p._id)}
          />
        ))}
      </div>
    </div>
  );
}