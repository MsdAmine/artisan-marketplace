import { API_BASE } from "./client";
import { authHeaders } from "./authHeaders";

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
