import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";

vi.mock("@/lib/api/client", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/api/client")>();
  return {
    ...original,
    apiClient: {
      post: vi.fn().mockResolvedValue({
        data: {
          tokens: {
            access_token: "access",
            refresh_token: "refresh",
            token_type: "bearer",
            expires_in: 1800,
          },
          user: {
            id: 1,
            first_name: "Demo",
            last_name: "User",
            email: "demo@test.local",
            role: "student",
          },
        },
      }),
    },
  };
});

describe("AuthProvider", () => {
  test("supports login and updates authenticated state", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: "demo@test.local", password: "Password123" });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("demo@test.local");
  });

  test("supports logout and clears authenticated state", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: "demo@test.local", password: "Password123" });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
  });
});
