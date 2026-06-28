export function AdmissionReportsPage() {
  const yearlyAdmissions = [
    { year: 2022, count: 274 },
    { year: 2023, count: 318 },
    { year: 2024, count: 356 },
    { year: 2025, count: 402 },
    { year: 2026, count: 428 },
  ];

  const admissionsByGrade = [
    { grade: "Nursery", count: 34 },
    { grade: "Kindergarten", count: 52 },
    { grade: "Grade 1", count: 49 },
    { grade: "Grade 2", count: 45 },
    { grade: "Grade 3", count: 41 },
    { grade: "Grade 4", count: 38 },
    { grade: "Grade 5", count: 36 },
    { grade: "Grade 6", count: 33 },
  ];

  const maxYearly = Math.max(...yearlyAdmissions.map((item) => item.count));
  const maxByGrade = Math.max(...admissionsByGrade.map((item) => item.count));

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Admission Reports</h1>
        <p>Sample KPI snapshot for admissions trends and grade distribution.</p>
      </section>

      <section className="panel">
        <h2>Admissions Year by Year</h2>
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
