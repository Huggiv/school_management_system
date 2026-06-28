import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthProvider";
import { Navbar } from "@/components/navigation/Navbar";
import { AdmissionPage } from "@/features/admissions/AdmissionPage";
import { AssignmentsPage } from "@/features/assignments/AssignmentsPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { GradePage } from "@/features/grades/GradePage";
import { HomePage } from "@/features/home/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ProtectedRoute } from "@/router/ProtectedRoute";

function LoginPage() {
  const { login } = useAuth();

  async function onSubmit(formData: FormData): Promise<void> {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    await login({ email, password });
    window.location.href = "/dashboard";
  }

  return (
    <main className="container">
      <section className="card">
        <h1>Login</h1>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            try {
              await onSubmit(data);
            } catch (error) {
              const msg = error instanceof Error ? error.message : "Login failed";
              alert(msg);
            }
          }}
        >
          <div className="grid">
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <button type="submit">Sign in</button>
          </div>
        </form>
      </section>
    </main>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admission" element={<AdmissionPage />} />
          <Route path="/grade" element={<GradePage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["administrator", "principal"]} />}>
          <Route path="/admin" element={<DashboardPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student" element={<DashboardPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
          <Route path="/teacher" element={<DashboardPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["parent"]} />}>
          <Route path="/parent" element={<DashboardPage />} />
        </Route>

        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
