import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

export function StudentDashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard-student"],
    queryFn: async () => {
      const { data } = await apiClient.get<Record<string, number>>("/api/v1/dashboard/student");
      return data;
    },
  });

  return (
    <section className="panel">
      <h2>Student Dashboard</h2>
      <div className="stats-grid compact">
        {Object.entries(data ?? {}).map(([key, value]) => (
          <article className="stat-card" key={key}>
            <strong>{value}</strong>
            <span>{key}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
