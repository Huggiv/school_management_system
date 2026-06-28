import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

export function ParentDashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard-parent"],
    queryFn: async () => {
      const { data } = await apiClient.get<Record<string, number>>("/api/v1/dashboard/parent");
      return data;
    },
  });

  return (
    <section className="panel">
      <h2>Parent Dashboard</h2>
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
