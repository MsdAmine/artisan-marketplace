// src/api/orders.js
const API_URL = "http://localhost:3000/api";

export async function getOrders() {
  const res = await fetch("http://localhost:3000/api/orders");
  if (!res.ok) throw new Error("HTTP error! status: " + res.status);
  return res.json();
}


export async function createOrder() {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function getOrderById(orderId) {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}