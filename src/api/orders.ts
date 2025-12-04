// src/api/orders.ts
import { API_BASE } from "./client";


export async function getOrders() {
  const res = await fetch(`${API_BASE}/orders`);

  if (!res.ok) {
    throw new Error("HTTP error! status: " + res.status);
  }

  return res.json();
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export async function createOrder(orderData: any) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(orderData), // ✅ SEND REAL DATA
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("Order error:", txt);
    throw new Error("Error creating order");
  }

  return res.json();
}

export async function getOrderById(orderId: string) {
  const res = await fetch(`${API_BASE}/orders/${orderId}`);

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
}
