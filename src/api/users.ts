import { API_BASE } from "./client";
import { authHeaders } from "./authHeaders";

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: authHeaders({ includeJson: false, includeUserId: true }),
  });

  if (!res.ok) {
    throw new Error(`Failed to load current user (status ${res.status})`);
  }

  return res.json();
}
