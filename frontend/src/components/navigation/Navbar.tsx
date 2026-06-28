import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthProvider";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/admission", label: "Admission" },
  { to: "/grade", label: "Grade" },
  { to: "/assignments", label: "Assignments" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

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
          {NAV_ITEMS.map((item) => (
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              key={item.to}
              onClick={() => setOpen(false)}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <>
              <NavLink className="nav-link" onClick={() => setOpen(false)} to="/profile">
                Profile
              </NavLink>
              <button className="auth-btn" onClick={logout} type="button">
                Logout ({user?.role})
              </button>
            </>
          ) : (
            <>
              <NavLink className="nav-link" onClick={() => setOpen(false)} to="/signup">
                Sign up
              </NavLink>
              <NavLink className="auth-btn" onClick={() => setOpen(false)} to="/login">
                Login
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
