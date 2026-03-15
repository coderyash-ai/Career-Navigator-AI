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

// Enhanced storage utilities with fallback
const STORAGE_KEYS = {
  TOKEN: 'pathai_token',
  USER: 'pathai_user',
  PERSISTENT_AUTH: 'pathai_persistent_auth'
};

const storage = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const storedUser = storage.get(STORAGE_KEYS.USER);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => storage.get(STORAGE_KEYS.TOKEN));
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    console.log("AuthContext: refreshUser called");
    const t = storage.get(STORAGE_KEYS.TOKEN);
    const storedUser = storage.get(STORAGE_KEYS.USER);
    console.log("AuthContext: token from storage:", t ? "exists" : "none");
    console.log("AuthContext: stored user:", storedUser ? "exists" : "none");
    
    // If we have stored user data, use it immediately (prevents flash of unauthenticated state)
    if (storedUser && !user) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("AuthContext: restored user from storage immediately");
      } catch {
        // Invalid stored user, will try to fetch from API
      }
    }
    
    if (!t) { 
      console.log("AuthContext: no token found, clearing user state");
      setIsLoading(false);
      setUser(null);
      setToken(null);
      return; 
    }
    
    // Set token immediately to prevent auth flicker
    setToken(t);
    
    try {
      console.log("AuthContext: making /me request");
      const res = await fetch(`${BASE}/me`, { headers: { Authorization: `Bearer ${t}` } });
      console.log("AuthContext: /me response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("AuthContext: user data received from API:", data);
        setUser(data);
        // Update stored user data
        storage.set(STORAGE_KEYS.USER, JSON.stringify(data));
        storage.set(STORAGE_KEYS.PERSISTENT_AUTH, 'true');
      } else if (res.status === 401) {
        // Only clear on actual auth failure (401), not server errors
        console.log("AuthContext: token invalid (401), clearing auth");
        storage.remove(STORAGE_KEYS.TOKEN);
        storage.remove(STORAGE_KEYS.USER);
        storage.remove(STORAGE_KEYS.PERSISTENT_AUTH);
        setUser(null);
        setToken(null);
      } else {
        // Server error (500, etc) - keep existing auth data
        console.log("AuthContext: server error, keeping existing auth data");
        // Don't clear storage on server errors
        if (!user && storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // Fallback: keep whatever we have
          }
        }
      }
    } catch (error) {
      // Network/server error - don't clear auth data
      console.error("Auth refresh error (network/server):", error);
      console.log("AuthContext: keeping existing auth data due to network error");
      // Restore from storage if we have it
      if (!user && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Keep current state
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      console.log("AuthContext: login attempt for", email);
      const res = await fetch(`${BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log("AuthContext: login response status:", res.status);
      const data = await res.json();
      console.log("AuthContext: login response data:", data);
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      
      // Store auth data permanently
      storage.set(STORAGE_KEYS.TOKEN, data.token);
      storage.set(STORAGE_KEYS.USER, JSON.stringify(data.user));
      storage.set(STORAGE_KEYS.PERSISTENT_AUTH, 'true');
      setToken(data.token);
      setUser(data.user);
      console.log("AuthContext: login successful, user persisted:", data.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, avatarId: number) => {
    try {
      const res = await fetch(`${BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, avatarId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      
      // Store auth data permanently
      storage.set(STORAGE_KEYS.TOKEN, data.token);
      storage.set(STORAGE_KEYS.USER, JSON.stringify(data.user));
      storage.set(STORAGE_KEYS.PERSISTENT_AUTH, 'true');
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("AuthContext: logout called");
    // Clear all auth data
    storage.remove(STORAGE_KEYS.TOKEN);
    storage.remove(STORAGE_KEYS.USER);
    storage.remove(STORAGE_KEYS.PERSISTENT_AUTH);
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
