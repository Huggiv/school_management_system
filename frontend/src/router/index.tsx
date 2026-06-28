import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthProvider";
import { Navbar } from "@/components/navigation/Navbar";
import { AdmissionReportsPage } from "@/features/admissions/pages/AdmissionReportsPage";
import { AdmissionRootRedirect } from "@/features/admissions/pages/AdmissionRootRedirect";
import { ApplicationManagementPage } from "@/features/admissions/pages/ApplicationManagementPage";
import { DecisionHistoryPage } from "@/features/admissions/pages/DecisionHistoryPage";
import { NewAdmissionPage } from "@/features/admissions/pages/NewAdmissionPage";
import { ReviewQueuePage } from "@/features/admissions/pages/ReviewQueuePage";
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
    window.location.href = "/";
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
          <p style={{ marginTop: "0.75rem" }}>
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

function SignupPage() {
  const { signup } = useAuth();

  async function onSubmit(formData: FormData): Promise<void> {
    const first_name = String(formData.get("first_name") ?? "").trim();
    const last_name = String(formData.get("last_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirm_password = String(formData.get("confirm_password") ?? "");
    await signup({
      first_name,
      last_name,
      email,
      password,
      confirm_password,
      phone: phone || undefined,
    });
    window.location.href = "/";
  }

  return (
    <main className="container">
      <section className="card">
        <h1>Sign up</h1>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            try {
              await onSubmit(data);
            } catch (error) {
              const msg = error instanceof Error ? error.message : "Sign-up failed";
              alert(msg);
            }
          }}
        >
          <div className="grid">
            <input name="first_name" type="text" placeholder="First name" required />
            <input name="last_name" type="text" placeholder="Last name" required />
            <input name="email" type="email" placeholder="Email" required />
            <input name="phone" type="tel" placeholder="Phone (optional)" />
            <input name="password" type="password" placeholder="Password" required />
            <input
              name="confirm_password"
              type="password"
              placeholder="Confirm password"
              required
            />
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <button type="submit">Create account</button>
          </div>
          <p style={{ marginTop: "0.75rem" }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
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
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admission" element={<AdmissionRootRedirect />} />
          <Route path="/admission/new" element={<NewAdmissionPage />} />
          <Route path="/grade" element={<GradePage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["administrator", "principal"]} />}>
          <Route path="/admission/manage" element={<ApplicationManagementPage />} />
          <Route path="/admission/review" element={<ReviewQueuePage />} />
          <Route path="/admission/history" element={<DecisionHistoryPage />} />
          <Route path="/admission/reports" element={<AdmissionReportsPage />} />
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
