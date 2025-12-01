import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { addToCart } from "@/api/cart";
import { useState } from "react";

export default function ProductModal({ open, onClose, product }: any) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  async function handleAdd() {
    try {
      setLoading(true);
      await addToCart(product._id);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error(err);
      alert("Erreur d'ajout au panier");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full max-h-80 object-contain rounded bg-black/5"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-500">
            No image
          </div>
        )}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {product.name}
          </DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-xl font-bold text-primary">{product.price} MAD</p>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleAdd} disabled={loading} className="px-6">
            {loading ? "Ajout..." : added ? "✔ Ajouté !" : "Ajouter au panier"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
