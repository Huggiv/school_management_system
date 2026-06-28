import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "@/features/auth/AuthProvider";
import { Navbar } from "@/components/navigation/Navbar";

describe("Navbar", () => {
  test("renders primary navigation links", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Admission")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
