import axios, { AxiosError } from "axios";

import type { AuthTokens } from "@/types/auth";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/auth/storage";

export interface ApiErrorShape {
  status: number;
  code: string;
  message: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest.headers["x-retry"]) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        return Promise.reject(error);
      }

      originalRequest.headers["x-retry"] = "1";
      try {
        const refreshResponse = await refreshClient.post<AuthTokens>("/api/v1/auth/refresh-token", {
          refresh_token: refreshToken,
        });
        setTokens(refreshResponse.data);
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
        return apiClient(originalRequest);
      } catch {
        clearTokens();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export function mapApiError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    return {
      status: error.response?.status ?? 500,
      code: error.code ?? "AXIOS_ERROR",
      message:
        (error.response?.data as { detail?: string } | undefined)?.detail ??
        error.message ??
        "Unexpected request error",
    };
  }

  return {
    status: 500,
    code: "UNKNOWN_ERROR",
    message: "Unexpected error",
  };
}

export { apiClient };
