export type StoredAuth = {
  token?: string;
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
};

export function readStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem("auth");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse auth from storage", err);
    return null;
  }
}

export function getAuthToken(): string | null {
  const storedAuth = readStoredAuth();
  if (storedAuth?.token) return storedAuth.token;

  const token = localStorage.getItem("token");
  return token ?? null;
}

export function authHeaders(
  options: { includeJson?: boolean; includeUserId?: boolean } = {}
): Record<string, string> {
  const { includeJson = true, includeUserId = false } = options;
  const headers: Record<string, string> = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const storedAuth = readStoredAuth();
  const userId = storedAuth?.user?.id;
  if (includeUserId && userId) {
    headers["x-user-id"] = userId;
  }

  return headers;
}
