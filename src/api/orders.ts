// src/api/orders.ts
import { API_BASE } from "./client";
import { authHeaders } from "./authHeaders";

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
