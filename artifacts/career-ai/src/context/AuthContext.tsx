import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  avatarId: number;
  points: number;
  careerField: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, avatarId: number) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const BASE = "/api/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("pathai_token"));
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem("pathai_token");
    if (!t) { setIsLoading(false); return; }
    try {
      const res = await fetch(`${BASE}/me`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setToken(t);
      } else {
        localStorage.removeItem("pathai_token");
        setUser(null);
        setToken(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Login failed");
    localStorage.setItem("pathai_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (username: string, email: string, password: string, avatarId: number) => {
    const res = await fetch(`${BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, avatarId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Registration failed");
    localStorage.setItem("pathai_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("pathai_token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
