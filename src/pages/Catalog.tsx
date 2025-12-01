import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import ProductCard from "../components/ProductCard";

export default function Catalog() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiGet("/products").then(setData);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Produits locaux</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {data.map((p) => (
          <ProductCard
            key={p._id}
            p={p}
            onAdd={() => apiPost("/cart/items", { productId: p._id, quantity: 1 })}
          />
        ))}
      </div>
    </div>
  );
}
