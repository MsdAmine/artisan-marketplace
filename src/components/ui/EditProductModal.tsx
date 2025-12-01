import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function EditProductModal({ open, onClose, product, onUpdated }: any) {
  const [form, setForm] = useState(product || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(product || {});
  }, [product]);

  if (!product) return null;

  function updateField(field: string, value: any) {
    setForm({ ...form, [field]: value });
  }

  async function updateProduct() {
    setLoading(true);

    const res = await fetch(`http://localhost:3000/api/artisans/${product._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock)
      })
    });

    if (res.ok) {
      onUpdated();
      onClose();
    } else {
      alert("Erreur lors de la modification");
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} />
          <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} />
          <Input value={form.price} onChange={(e) => updateField("price", e.target.value)} />
          <Input value={form.stock} onChange={(e) => updateField("stock", e.target.value)} />
          <Input value={form.category} onChange={(e) => updateField("category", e.target.value)} />

          <Button className="w-full" onClick={updateProduct} disabled={loading}>
            {loading ? "Modification..." : "Sauvegarder"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
