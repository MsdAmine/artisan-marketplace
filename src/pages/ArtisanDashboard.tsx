import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableRow,
  TableHead, TableBody, TableCell
} from "@/components/ui/table";

export default function ArtisanDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "", category: "", price: "", stock: ""
  });

  const load = () => apiGet("/my-products").then(setProducts);

  useEffect(load, []);

  const submit = (e) => {
    e.preventDefault();
    apiPost("/products", form).then(() => {
      setForm({ name: "", category: "", price: "", stock: "" });
      load();
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-3xl font-semibold">Espace Artisan</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Stock</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((p) => (
            <TableRow key={p._id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.category}</TableCell>
              <TableCell>{p.price} MAD</TableCell>
              <TableCell>{p.stock}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={submit}>
        <Input placeholder="Nom" value={form.name}
          onChange={(e)=>setForm({...form, name: e.target.value})} />

        <Input placeholder="Catégorie" value={form.category}
          onChange={(e)=>setForm({...form, category: e.target.value})} />

        <Input placeholder="Prix" type="number" value={form.price}
          onChange={(e)=>setForm({...form, price: e.target.value})} />

        <Input placeholder="Stock" type="number" value={form.stock}
          onChange={(e)=>setForm({...form, stock: e.target.value})} />

        <Button className="md:col-span-4" type="submit">Ajouter</Button>
      </form>
    </div>
  );
}
