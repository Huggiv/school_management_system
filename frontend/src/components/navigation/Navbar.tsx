import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthProvider";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/grade", label: "Grade" },
  { to: "/assignments", label: "Assignments" },
  { to: "/about", label: "About" },
];

const ADMIN_ADMISSION_ACTIONS = [
  { to: "/admission/new", label: "New Admission" },
  { to: "/admission/manage", label: "Application Management" },
  { to: "/admission/reports", label: "Reports" },
];

const MANAGEMENT_ACTIONS = [
  { to: "/management", label: "Overview" },
  { to: "/management/users", label: "Users" },
  { to: "/management/teachers", label: "Teachers" },
  { to: "/management/student-parents", label: "Student Parents" },
  { to: "/management/subjects", label: "Subjects" },
  { to: "/management/exam-sessions", label: "Exam Sessions" },
  { to: "/management/exam-subjects", label: "Exam Subjects" },
  { to: "/management/exam-results", label: "Exam Results" },
  { to: "/management/fee-structures", label: "Fee Structures" },
  { to: "/management/student-fee-ledgers", label: "Student Ledgers" },
  { to: "/management/fee-payments", label: "Fee Payments" },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const isAdminOpsUser = user?.role === "administrator" || user?.role === "principal";
  const admissionActions = isAdminOpsUser ? ADMIN_ADMISSION_ACTIONS : [ADMIN_ADMISSION_ACTIONS[0]];

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link className="brand" to="/">
          <span className="brand-mark">SMS</span>
          <span>
            <strong>School Portal</strong>
            <small>Learn. Lead. Rise.</small>
          </span>
        </Link>

        <button
          aria-label="Toggle navigation"
          className={`menu-toggle ${open ? "open" : ""}`}
          onClick={() => setOpen((prev) => !prev)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`main-nav ${open ? "show" : ""}`}>
          {NAV_ITEMS.slice(0, 1).map((item) => (
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              key={item.to}
              onClick={() => setOpen(false)}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}

          {isAuthenticated && isAdminOpsUser ? (
            <div className="action-dropdown">
              <button className="nav-link action-dropdown-trigger" type="button">
                Admission
              </button>
              <div className="action-dropdown-menu" role="menu" aria-label="Admission actions menu">
                {admissionActions.map((item) => (
                  <NavLink
                    className="action-dropdown-item"
                    key={item.to}
                    onClick={() => setOpen(false)}
                    to={item.to}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ) : null}

          {isAuthenticated && isAdminOpsUser ? (
            <div className="action-dropdown">
              <button className="nav-link action-dropdown-trigger" type="button">
                Management
              </button>
              <div className="action-dropdown-menu" role="menu" aria-label="Management actions menu">
                {MANAGEMENT_ACTIONS.map((item) => (
                  <NavLink
                    className="action-dropdown-item"
                    key={item.to}
                    onClick={() => setOpen(false)}
                    to={item.to}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ) : null}

          {NAV_ITEMS.slice(1).map((item) => (
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              key={item.to}
              onClick={() => setOpen(false)}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}

          <div className="action-dropdown account-dropdown">
            <button className="nav-link action-dropdown-trigger account-dropdown-trigger" type="button">
              <span className="login-icon" aria-hidden="true" />
              <span>Account</span>
            </button>
            <div className="action-dropdown-menu" role="menu" aria-label="Account actions menu">
              {isAuthenticated ? (
                <>
                  <NavLink className="action-dropdown-item" onClick={() => setOpen(false)} to="/profile">
                    Profile
                  </NavLink>
                  <button
                    className="action-dropdown-item action-dropdown-button"
                    onClick={logout}
                    type="button"
                  >
                    Logout ({user?.role})
                  </button>
                </>
              ) : (
                <>
                  <NavLink className="action-dropdown-item" onClick={() => setOpen(false)} to="/login">
                    Login
                  </NavLink>
                  <NavLink className="action-dropdown-item" onClick={() => setOpen(false)} to="/signup">
                    Sign up
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
