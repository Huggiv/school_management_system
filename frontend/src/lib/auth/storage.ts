import type { AuthTokens, AuthUser } from "@/types/auth";

const ACCESS_TOKEN_KEY = "sms_access_token";
const REFRESH_TOKEN_KEY = "sms_refresh_token";
const USER_KEY = "sms_auth_user";

function storage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export function getAccessToken(): string | null {
  return storage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  return storage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function setTokens(tokens: AuthTokens): void {
  storage()?.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  storage()?.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function clearTokens(): void {
  storage()?.removeItem(ACCESS_TOKEN_KEY);
  storage()?.removeItem(REFRESH_TOKEN_KEY);
}

export function setStoredUser(user: AuthUser): void {
  storage()?.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  const raw = storage()?.getItem(USER_KEY) ?? null;
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearStoredUser(): void {
  storage()?.removeItem(USER_KEY);
}
