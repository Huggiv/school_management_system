import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthProvider";
import { ProtectedRoute } from "@/router/ProtectedRoute";

function TopNav() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="container">
        <nav>
          <strong>School Portal</strong>
          <div className="links">
            <Link className="pill" to="/">
              Home
            </Link>
            <Link className="pill" to="/dashboard">
              Dashboard
            </Link>
            <Link className="pill" to="/admission">
              Admission
            </Link>
            <Link className="pill" to="/grade">
              Grade
            </Link>
            <Link className="pill" to="/assignments">
              Assignments
            </Link>
            <Link className="pill" to="/about">
              About
            </Link>
            <Link className="pill" to="/contact">
              Contact
            </Link>
            {isAuthenticated ? (
              <button onClick={logout} type="button">
                Logout ({user?.role})
              </button>
            ) : (
              <Link className="pill" to="/login">
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function Page({ title, description }: { title: string; description: string }) {
  return (
    <main className="container">
      <section className="card">
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
    </main>
  );
}

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
      <TopNav />
      <Routes>
        <Route path="/" element={<Page title="Home" description="School landing page shell is ready." />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Page title="Dashboard" description="Role-aware dashboard entry point." />} />
          <Route path="/admission" element={<Page title="Admission" description="Admission workflow foundation." />} />
          <Route path="/grade" element={<Page title="Grade" description="Grade module foundation." />} />
          <Route path="/assignments" element={<Page title="Assignments" description="Assignment module foundation." />} />
          <Route path="/profile" element={<Page title="Profile" description="User profile shell." />} />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={["administrator", "principal"]} />}
        >
          <Route path="/admin" element={<Page title="Admin" description="Administrator dashboard shell." />} />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={["student"]} />}
        >
          <Route path="/student" element={<Page title="Student" description="Student dashboard shell." />} />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={["teacher"]} />}
        >
          <Route path="/teacher" element={<Page title="Teacher" description="Teacher dashboard shell." />} />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={["parent"]} />}
        >
          <Route path="/parent" element={<Page title="Parent" description="Parent dashboard shell." />} />
        </Route>

        <Route path="/about" element={<Page title="About" description="About page foundation." />} />
        <Route path="/contact" element={<Page title="Contact" description="Contact page foundation." />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
