import { useAuth } from "@/features/auth/AuthProvider";

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Profile</h1>
        <p>
          {user?.first_name} {user?.last_name} ({user?.role})
        </p>
        <p>{user?.email}</p>
      </section>
    </main>
  );
}
