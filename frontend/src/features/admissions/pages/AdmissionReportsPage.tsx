import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

interface AdmissionReportsPayload {
  yearly: Array<{ year: number; count: number }>;
  by_grade: Array<{ grade: string; count: number }>;
  by_status: Array<{ status: string; count: number }>;
}

export function AdmissionReportsPage() {
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ["admissions-reports"],
    queryFn: async () => {
      const { data } = await apiClient.get<AdmissionReportsPayload>("/api/v1/admissions/reports");
      return data;
    },
  });

  const { data: dashboardKpis, isLoading: kpiLoading } = useQuery({
    queryKey: ["dashboard-admin"],
    queryFn: async () => {
      const { data } = await apiClient.get<Record<string, number>>("/api/v1/dashboard/admin");
      return data;
    },
  });

  const yearlyAdmissions = reportData?.yearly ?? [];
  const admissionsByGrade = reportData?.by_grade ?? [];

  const maxYearly = Math.max(1, ...yearlyAdmissions.map((item) => item.count));
  const maxByGrade = Math.max(1, ...admissionsByGrade.map((item) => item.count));

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Admission Reports</h1>
        <p>Live KPI snapshot powered by admissions and dashboard data.</p>
      </section>

      <section className="panel">
        <h2>Dashboard KPIs</h2>
        {kpiLoading ? <p>Loading KPIs...</p> : null}
        <div className="stats-grid compact">
          {Object.entries(dashboardKpis ?? {}).map(([key, value]) => (
            <article className="stat-card" key={key}>
              <strong>{value}</strong>
              <span>{key}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Admissions Year by Year</h2>
        {reportLoading ? <p>Loading yearly admissions...</p> : null}
        <div className="stats-grid compact">
          {yearlyAdmissions.map((item) => (
            <article className="stat-card" key={item.year}>
              <small>{item.year}</small>
              <strong>{item.count}</strong>
              <div className="kpi-bar-track" aria-hidden="true">
                <span className="kpi-bar-fill" style={{ width: `${Math.round((item.count / maxYearly) * 100)}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Admissions by Grades</h2>
        {reportLoading ? <p>Loading admissions by grade...</p> : null}
        <table className="table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Admissions</th>
              <th>Distribution</th>
            </tr>
          </thead>
          <tbody>
            {admissionsByGrade.map((item) => (
              <tr key={item.grade}>
                <td>{item.grade}</td>
                <td>{item.count}</td>
                <td>
                  <div className="kpi-bar-track" aria-label={`${item.grade} admissions distribution`}>
                    <span className="kpi-bar-fill" style={{ width: `${Math.round((item.count / maxByGrade) * 100)}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
