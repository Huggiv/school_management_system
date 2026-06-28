import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

import { ProtectedRoute } from "@/router/ProtectedRoute";

vi.mock("@/features/auth/AuthProvider", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
  }),
}));

describe("ProtectedRoute", () => {
  test("redirects unauthenticated users to login route", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<div>Dashboard content</div>} path="/dashboard" />
          </Route>
          <Route element={<div>Login page</div>} path="/login" />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });
});
