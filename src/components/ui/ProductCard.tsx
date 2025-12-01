import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { addToCart } from "@/api/cart";

export default function ProductCard({ p }: any) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    try {
      setLoading(true);
      await addToCart(p._id);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout au panier");
    }
    setLoading(false);
  }

  return (
    <Card className="shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{p.name}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{p.description}</p>
        <p className="font-bold text-primary text-xl">{p.price} MAD</p>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleAdd}
          disabled={loading}
        >
          {loading ? "Ajout..." : added ? "✔ Ajouté !" : "Ajouter au panier"}
        </Button>
      </CardFooter>
    </Card>
  );
}
