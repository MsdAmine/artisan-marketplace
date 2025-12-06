import { API_BASE } from "./client";
import { authHeaders } from "./authHeaders";

export type UpdateUserPayload = {
  name?: string;
  phone?: string;
  avatar?: string;
  deliveryAddress?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
};

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: authHeaders({ includeJson: false, includeUserId: true }),
  });

  if (!res.ok) {
    throw new Error(`Failed to load current user (status ${res.status})`);
  }

  return res.json();
}

export async function updateCurrentUserProfile(payload: UpdateUserPayload) {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PUT",
    headers: authHeaders({ includeJson: true, includeUserId: true }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to update user profile (status ${res.status})`);
  }

  return res.json();
}
