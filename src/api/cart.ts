const BASE = "http://localhost:3000/api/cart";

export async function addToCart(productId: string) {
  const res = await fetch(`${BASE}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity: 1 })
  });

  if (!res.ok) throw new Error("Erreur d'ajout au panier");
  return res.json();
}

export async function updateQuantity(productId: string, quantity: number) {
  const res = await fetch(`${BASE}/items/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity })
  });

  if (!res.ok) throw new Error("Erreur de mise à jour");
  return res.json();
}

export async function removeItem(productId: string) {
  const res = await fetch(`${BASE}/items/${productId}`, {
    method: "DELETE"
  });

  if (!res.ok) throw new Error("Erreur de suppression");
  return res.json();
}

export async function getCart() {
  const res = await fetch(BASE);
  return res.json();
}
