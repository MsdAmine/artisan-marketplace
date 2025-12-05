// src/api/auth.ts
import { API_BASE } from "./client";

const BASE = `${API_BASE}/auth`;

export async function signup(data: { name: string; email: string; password: string; role: string }) {
  const res = await fetch(`${BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}