import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import * as authService from "../services/authService";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithToken: (token: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone: string }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "kokwet_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken = async (token: string) => {
    const freshUser = await authService.fetchUserByToken(token);
    setUser({ ...freshUser, token });
  };

  const register = async (payload: { name: string; email: string; password: string; phone: string }) => {
    setLoading(true);
    try {
      const newUser = await authService.register(payload);
      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => setUser(null);

  const refreshUser = async () => {
    if (!user) return;
    const fresh = await authService.fetchMe();
    setUser((prev) => (prev ? { ...prev, ...fresh } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
