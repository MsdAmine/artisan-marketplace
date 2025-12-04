// src/api/orders.ts
import { API_BASE } from "./client";

// Read token from the same place AuthContext uses
function getToken(): string | null {
  const stored = localStorage.getItem("auth");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed.token || null;
  } catch (e) {
    console.error("Failed to parse auth from localStorage", e);
    return null;
  }
}

function authHeaders() {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// ----------------------
// GET all orders of user
// ----------------------
export async function getOrders() {
  const res = await fetch(`${API_BASE}/orders`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("HTTP error! status: " + res.status);
  }

  return res.json();
}

// ----------------------
// CREATE order
// ----------------------
export async function createOrder(orderData: any) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("Order error:", txt);
    throw new Error("Error creating order");
  }

  return res.json();
}

// ----------------------
// GET order by id
// ----------------------
export async function getOrderById(orderId: string) {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
}
