import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "bi-grid-1x2" },
  { to: "/upload", label: "Scan", icon: "bi-camera" },
  { to: "/soil", label: "Soil Info", icon: "bi-droplet" },
  { to: "/feedback", label: "Feedback", icon: "bi-chat-square-text" },
];

export default function Navbar() {
  const { dark, toggleTheme } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top"
      style={{
        background: "var(--nav-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--nav-border)",
        boxShadow: "var(--shadow)",
      }}
    >
      <div className="container">
        <Link
          to="/dashboard"
          className="navbar-brand d-flex align-items-center gap-2 text-decoration-none"
          style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "1.25rem" }}
        >
          <span style={{ fontSize: "1.5rem" }}>🌱</span>
          <span>AgroScan</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          style={{ color: "var(--text-primary)" }}
        >
          <i className={`bi ${open ? "bi-x-lg" : "bi-list"}`} style={{ fontSize: "1.25rem" }} />
        </button>

        <div
          className={`collapse navbar-collapse ${open ? "show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center gap-1">
            {navLinks.map(({ to, label, icon }) => (
              <li key={to} className="nav-item">
                <Link
                  to={to}
                  className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-3 ${
                    location.pathname === to ? "active" : ""
                  }`}
                  onClick={() => setOpen(false)}
                  style={{
                    color: location.pathname === to ? "var(--accent)" : "var(--text-secondary)",
                    fontWeight: location.pathname === to ? 600 : 500,
                    background: location.pathname === to ? "var(--accent-muted)" : "transparent",
                  }}
                >
                  <i className={`bi ${icon}`} />
                  {label}
                </Link>
              </li>
            ))}
            <li className="nav-item ms-lg-2">
              <button
                type="button"
                className="btn btn-link nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-decoration-none border-0"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                style={{ color: "var(--text-secondary)" }}
              >
                <i className={`bi ${dark ? "bi-sun" : "bi-moon-stars"}`} />
                {dark ? "Light" : "Dark"}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
