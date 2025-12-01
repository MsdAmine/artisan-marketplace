import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AddProductModal({ open, onClose, onCreated }: any) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    artisanId: "demo-artisan"
  });

  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: any) {
    setForm({ ...form, [field]: value });
  }

  async function createProduct() {
    setLoading(true);
    const res = await fetch("http://localhost:3000/api/artisans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock)
      })
    });

    if (res.ok) {
      onCreated();
      onClose();
    } else {
      alert("Erreur lors de la création du produit");
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un produit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input placeholder="Nom" value={form.name} onChange={e => updateField("name", e.target.value)} />
          <Textarea placeholder="Description" value={form.description} onChange={e => updateField("description", e.target.value)} />
          <Input placeholder="Prix" value={form.price} onChange={e => updateField("price", e.target.value)} />
          <Input placeholder="Stock" value={form.stock} onChange={e => updateField("stock", e.target.value)} />
          <Input placeholder="Catégorie" value={form.category} onChange={e => updateField("category", e.target.value)} />

          <Button className="w-full" onClick={createProduct} disabled={loading}>
            {loading ? "Création..." : "Créer le produit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
