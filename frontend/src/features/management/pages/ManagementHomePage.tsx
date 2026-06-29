import { Link } from "react-router-dom";

const MANAGEMENT_LINKS = [
  {
    to: "/management/users",
    title: "Users",
    description: "Update user profile fields, role assignment, and account status context.",
  },
  {
    to: "/management/student-parents",
    title: "Student Parent Links",
    description: "Link students with one or more parent records and manage primary guardians.",
  },
  {
    to: "/management/teachers",
    title: "Teachers",
    description: "Maintain teacher profiles and assign subjects/classes.",
  },
  {
    to: "/management/subjects",
    title: "Subjects",
    description: "Maintain subject catalog used by exam schedules and result entry.",
  },
  {
    to: "/management/exam-sessions",
    title: "Exam Sessions",
    description: "Create term-wise exam sessions and track lifecycle states.",
  },
  {
    to: "/management/exam-subjects",
    title: "Exam Subjects",
    description: "Plan class-level papers for each subject in a session.",
  },
  {
    to: "/management/exam-results",
    title: "Exam Results",
    description: "Capture and review student marks at exam paper level.",
  },
  {
    to: "/management/fee-structures",
    title: "Fee Structures",
    description: "Define academic year fee structures by class.",
  },
  {
    to: "/management/student-fee-ledgers",
    title: "Student Ledgers",
    description: "Track billed, paid, and pending fee amounts for each student.",
  },
  {
    to: "/management/fee-payments",
    title: "Fee Payments",
    description: "Record fee collections against student ledgers.",
  },
];

export function ManagementHomePage() {
  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Management Console</h1>
        <p>Use these modules to manage users, academics, exams, and fee operations.</p>
      </section>

      <section className="feature-grid">
        {MANAGEMENT_LINKS.map((item) => (
          <article className="panel" key={item.to}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <Link to={item.to}>
              <button type="button">Open {item.title}</button>
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
