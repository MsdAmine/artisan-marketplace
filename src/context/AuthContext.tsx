// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE } from "@/api/client";
import { authHeaders, readStoredAuth } from "@/api/authHeaders";

import type { User } from "@/types/auth";

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storedAuth = readStoredAuth();

  const [user, setUser] = useState<User | null>(storedAuth?.user || null);
  const [token, setToken] = useState<string | null>(storedAuth?.token || null);
  const [loading, setLoading] = useState(false); // no delay

  function normalizeId(value: unknown): string {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (typeof record.$oid === "string") return record.$oid;
      if (typeof record.toString === "function") return record.toString();
    }
    return "";
  }

  useEffect(() => {
    if (!token) return;

    const storedUserId = readStoredAuth()?.user?.id || user?.id;
    if (!storedUserId) return;

    let cancelled = false;

    async function loadUser() {
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/users/me`, {
          headers: authHeaders({ includeJson: false, includeUserId: true }),
        });

        if (!res.ok) {
          if (!cancelled) setLoading(false);
          return;
        }

        const data = await res.json();

        if (cancelled) return;

        setUser({
          id: normalizeId(data.id || data._id),
          email: data.email,
          role: data.role,
          avatar: data.avatar || null,
        });
      } catch (err) {
        console.error("Auth load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // 👉 Re-add these two functions:
  function login(token: string, user: User) {
    setUser(user);
    setToken(token);

    // Save token separately
    localStorage.setItem("token", token);

    // Save user+token
    localStorage.setItem("auth", JSON.stringify({ token, user }));
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export { AuthContext };
