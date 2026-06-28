import { NavLink } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthProvider";

const ADMIN_ADMISSION_LINKS = [
  { to: "/admission/new", label: "New Admission" },
  { to: "/admission/manage", label: "Application Management" },
  { to: "/admission/review", label: "Review Queue" },
  { to: "/admission/history", label: "Decision History" },
  { to: "/admission/reports", label: "Reports" },
];

export function AdmissionSideNav() {
  const { user } = useAuth();
  const isAdminOpsUser = user?.role === "administrator" || user?.role === "principal";
  const links = isAdminOpsUser ? ADMIN_ADMISSION_LINKS : [ADMIN_ADMISSION_LINKS[0]];

  return (
    <aside className="admission-side-nav panel" aria-label="Admission operations navigation">
      <h2>Admissions</h2>
      <nav className="admission-side-nav-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `admission-side-nav-link ${isActive ? "active" : ""}`}
            end={link.to === "/admission/new"}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
