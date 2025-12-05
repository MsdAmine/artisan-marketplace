// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  role: "customer" | "artisan" | "admin";
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialAuth = JSON.parse(localStorage.getItem("auth") || "null");

  const [user, setUser] = useState<User | null>(initialAuth?.user || null);
  const [token, setToken] = useState<string | null>(initialAuth?.token || null);
  const [loading, setLoading] = useState(false); // no delay

  // Load stored auth
  useEffect(() => {
    const saved = localStorage.getItem("auth");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed.user);
      setToken(parsed.token);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/users/me", {
          headers: {
            "x-user-id": JSON.parse(localStorage.getItem("auth")!)?.user.id,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUser({
            id: data.id,
            email: data.email,
            role: data.role,
          });
          setToken(savedToken);
        }
      } catch (err) {
        console.error("Auth load error:", err);
      }

      setLoading(false);
    }

    loadUser();
  }, []);

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
