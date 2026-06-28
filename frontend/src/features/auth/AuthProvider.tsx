import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { apiClient, mapApiError } from "@/lib/api/client";
import {
  clearStoredUser,
  clearTokens,
  getStoredUser,
  setStoredUser,
  setTokens,
} from "@/lib/auth/storage";
import type { AuthTokens, AuthUser } from "@/types/auth";

interface LoginPayload {
  email: string;
  password: string;
}

interface SignupPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone?: string;
}

interface LoginResponse {
  tokens: AuthTokens;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: async (payload) => {
        try {
          const response = await apiClient.post<LoginResponse>("/api/v1/auth/login", payload);
          setTokens(response.data.tokens);
          setStoredUser(response.data.user);
          setUser(response.data.user);
        } catch (error) {
          const mapped = mapApiError(error);
          throw new Error(mapped.message);
        }
      },
      signup: async (payload) => {
        try {
          const response = await apiClient.post<LoginResponse>("/api/v1/auth/signup", payload);
          setTokens(response.data.tokens);
          setStoredUser(response.data.user);
          setUser(response.data.user);
        } catch (error) {
          const mapped = mapApiError(error);
          throw new Error(mapped.message);
        }
      },
      logout: () => {
        clearTokens();
        clearStoredUser();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
