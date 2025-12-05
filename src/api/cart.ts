import { API_BASE } from "./client";

function getToken(): string | null {
  const stored = localStorage.getItem("auth") || localStorage.getItem("token");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed?.token ?? null;
  } catch (err) {
    // If it's not JSON, treat it as the raw token string
    if (typeof stored === "string") return stored;

    console.error("Failed to parse auth token", err);
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

export async function getCart() {
  const res = await fetch(`${API_BASE}/cart`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function addToCart(productId: string, quantity: number) {
  const res = await fetch(`${API_BASE}/cart/items`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}

export async function updateCartItem(productId: string, quantity: number) {
  const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error("Failed to update cart");
  return res.json();
}

export async function deleteCartItem(productId: string) {
  const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete cart item");
  return res.json();
}

export async function removeItem(productId: string) {
  return deleteCartItem(productId);
}

export async function updateQuantity(productId: string, quantity: number) {
  return updateCartItem(productId, quantity);
}
