import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

interface AdmissionReportsPayload {
  academic_year: number | null;
  kpis: Record<string, number>;
  by_grade: Array<{ grade: string; count: number }>;
  by_gender: Array<{ gender: string; count: number }>;
}

export function AdmissionReportsPage() {
  const currentYear = new Date().getFullYear();
  const [academicYear, setAcademicYear] = useState(currentYear);

  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ["admissions-reports", academicYear],
    queryFn: async () => {
      const { data } = await apiClient.get<AdmissionReportsPayload>("/api/v1/admissions/reports", {
        params: { academic_year: academicYear },
      });
      return data;
    },
  });

  const dashboardKpis = useMemo(() => reportData?.kpis ?? {}, [reportData?.kpis]);
  const admissionsByGrade = useMemo(() => reportData?.by_grade ?? [], [reportData?.by_grade]);
  const admissionsByGender = useMemo(() => reportData?.by_gender ?? [], [reportData?.by_gender]);

  const maxByGrade = Math.max(1, ...admissionsByGrade.map((item) => item.count));

  const genderPieStyle = useMemo(() => {
    const total = admissionsByGender.reduce((sum, item) => sum + item.count, 0);
    if (total <= 0) {
      return { background: "#e7edf7" };
    }
    const palette = ["#0c5f81", "#2a9d8f", "#f4a261", "#e76f51", "#7b8ac9", "#8d6cab"];
    let cursor = 0;
    const segments = admissionsByGender.map((item, idx) => {
      const start = cursor;
      const size = (item.count / total) * 360;
      cursor += size;
      return `${palette[idx % palette.length]} ${start.toFixed(1)}deg ${cursor.toFixed(1)}deg`;
    });
    return { background: `conic-gradient(${segments.join(",")})` };
  }, [admissionsByGender]);

  return (
    <main className="container page-stack">
      <section className="panel">
        <div className="reports-header-row">
          <h1>Dashboard</h1>
          <label className="field-wrap inline" htmlFor="academic_year_filter">
            <span>Academic Year</span>
            <select
              id="academic_year_filter"
              value={academicYear}
              onChange={(event) => setAcademicYear(Number(event.target.value))}
            >
              {Array.from({ length: 7 }, (_, idx) => currentYear - idx).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
        {reportLoading ? <p>Loading dashboard data...</p> : null}
        <div className="stats-grid compact">
          {Object.entries(dashboardKpis ?? {}).map(([key, value]) => (
            <article className="stat-card" key={key}>
              <strong>{value}</strong>
              <span>{key}</span>
            </article>
          ))}
        </div>
      </section>

        <div className="dashboard-chart-grid">
          <article className="panel chart-panel">
            <h2>Student Count by Grade</h2>
            <div className="grade-bar-plot">
              {admissionsByGrade.map((item) => (
                <div key={item.grade} className="grade-bar-row">
                  <span className="grade-label">{item.grade}</span>
                  <div className="grade-bar-track">
                    <span className="grade-bar-fill" style={{ width: `${Math.round((item.count / maxByGrade) * 100)}%` }} />
                  </div>
                  <span className="grade-value">{item.count}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel chart-panel">
            <h2>Student Count by Gender</h2>
            <div className="gender-pie-wrap">
              <div className="gender-pie" style={genderPieStyle} aria-label="Gender distribution pie chart" />
              <div className="gender-legend">
                {admissionsByGender.map((item, idx) => (
                  <div className="gender-legend-item" key={item.gender}>
                    <span className={`gender-legend-dot dot-${idx % 6}`} />
                    <span>{item.gender}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
    </main>
  );
}
