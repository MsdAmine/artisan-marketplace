// src/pages/ArtisanDashboard.jsx
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";

export default function ArtisanDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/my-products"); // adjust path if needed
      setProducts(data);
    } catch (err) {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const body = {
        name: form.name,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      await apiPost("/products", body); // adjust path if needed
      setForm({
        name: "",
        description: "",
        category: "",
        price: "",
        stock: "",
      });
      await loadProducts();
    } catch (err) {
      setError("Failed to create product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[2fr,1.3fr]">
      {/* Left side - products list */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Espace Artisan</h1>
        <p className="text-sm text-slate-600 mb-4">
          Gérez vos produits publiés sur la marketplace.
        </p>

        {loading ? (
          <p>Chargement des produits...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucun produit pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Nom
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Catégorie
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">
                    Prix
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-t last:border-b">
                    <td className="px-4 py-2">
                      <div className="font-medium text-slate-800">
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">
                        {p.description}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {p.category || "-"}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-800">
                      {p.price} {p.currency || "MAD"}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-800">
                      {p.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Right side - create product form */}
      <section className="bg-white rounded-xl border shadow-sm p-5 h-fit">
        <h2 className="text-lg font-semibold mb-3">
          Ajouter un nouveau produit
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Ce formulaire sera utile pour la démo devant le professeur.
        </p>

        {error && (
          <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">
            {error}
          </p>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nom du produit
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Catégorie
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Prix
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                min="0"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-2 rounded-lg bg-indigo-600 text-white text-sm font-medium py-2 hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Enregistrement..." : "Enregistrer le produit"}
          </button>
        </form>
      </section>
    </div>
  );
}