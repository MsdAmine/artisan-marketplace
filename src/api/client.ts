const API_ROOT = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const API_BASE = `${API_ROOT}/api`;
export { API_ROOT };

export async function apiGet(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export async function apiPost(path: string, body: unknown, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    body: JSON.stringify(body),
    ...options,
  });

  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}
