import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { http, setAuthToken } from "../api/http";
import type { User } from "../types";

type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const TOKEN_KEY = "uecgea_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  async function refreshMe() {
    // Avoid stale-closure issues (e.g. login sets state then calls refreshMe in same tick)
    // by reading the latest token from state OR localStorage.
    const t = token ?? localStorage.getItem(TOKEN_KEY);
    if (!t) {
      setUser(null);
      return;
    }
    setAuthToken(t);
    try {
      const res = await http.get<User>("/auth/me");
      setUser(res.data);
    } catch (e) {
      // Token expired/invalid: clear local state to avoid a "stuck" session.
      logout();
      throw e;
    }
  }

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          await refreshMe();
        }
      } catch {
        // refreshMe already cleared state if needed
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(identifier: string, password: string) {
    const res = await http.post<{ access_token: string }>("/auth/login", {
      identifier,
      password,
    });
    const t = res.data.access_token;
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    await refreshMe();
  }

  async function register(username: string, email: string, password: string) {
    await http.post("/auth/register", { username, email, password });
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAuthToken(null);
  }

  const value = useMemo<AuthState>(
    () => ({ token, user, loading, login, register, logout, refreshMe }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
