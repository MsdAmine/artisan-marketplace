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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
