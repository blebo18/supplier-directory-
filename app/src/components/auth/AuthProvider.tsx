"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  isEditor: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.accessToken);
      }
    } catch {
      // Not logged in
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Login failed" };
    setUser(data.user);
    setToken(data.accessToken);
    return {};
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Registration failed" };
    setUser(data.user);
    setToken(data.accessToken);
    return {};
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Clear refresh token cookie
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isEditor: user?.role === "EDITOR" || user?.role === "ADMIN",
        isAdmin: user?.role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
