import { useAuth } from "@/features/auth/AuthProvider";
import { AdminDashboard } from "@/features/dashboard/AdminDashboard";
import { ParentDashboard } from "@/features/dashboard/ParentDashboard";
import { StudentDashboard } from "@/features/dashboard/StudentDashboard";
import { TeacherDashboard } from "@/features/dashboard/TeacherDashboard";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.first_name}. Here is your role-specific summary.</p>
      </section>

      {(user?.role === "administrator" || user?.role === "principal") && <AdminDashboard />}
      {user?.role === "teacher" && <TeacherDashboard />}
      {user?.role === "student" && <StudentDashboard />}
      {user?.role === "parent" && <ParentDashboard />}
    </main>
  );
}
