import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "bi-grid-1x2" },
  { to: "/upload", label: "Scan", icon: "bi-camera" },
  { to: "/soil", label: "Soil Info", icon: "bi-droplet" },
  { to: "/feedback", label: "Feedback", icon: "bi-chat-square-text" },
];

export default function Navbar() {
  const { dark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

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
          to={isAuthenticated ? "/dashboard" : "/login"}
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

        <div className={`collapse navbar-collapse ${open ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-1">
            {isAuthenticated &&
              navLinks.map(({ to, label, icon }) => (
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

            {/* Theme toggle */}
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

            {/* Auth section */}
            {isAuthenticated ? (
              <li className="nav-item ms-lg-2 position-relative">
                <button
                  type="button"
                  className="btn d-flex align-items-center gap-2 px-3 py-2 rounded-3 border-0"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ background: "var(--accent-muted)", color: "var(--text-primary)" }}
                >
                  <span
                    className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: 32,
                      height: 32,
                      background: "var(--accent)",
                      color: "white",
                      fontSize: "0.9rem",
                    }}
                  >
                    {user?.avatar || "U"}
                  </span>
                  <span className="d-none d-lg-inline fw-semibold">{user?.name || "User"}</span>
                  <i className={`bi ${dropdownOpen ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ fontSize: "0.75rem" }} />
                </button>

                {dropdownOpen && (
                  <div
                    className="position-absolute end-0 mt-2 rounded-3 shadow-lg animate-fade-in"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      minWidth: 200,
                      zIndex: 1050,
                    }}
                  >
                    <div className="p-3 border-bottom text-center" style={{ borderColor: "var(--border) !important" }}>
                      <div className="fw-bold fs-5" style={{ color: "var(--text-primary)" }}>{user?.name}</div>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="btn w-100 text-start d-flex align-items-center gap-2 px-3 py-2 rounded-2 border-0 text-decoration-none"
                        onClick={() => setDropdownOpen(false)}
                        style={{ background: "transparent", color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-muted)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <i className="bi bi-person-circle" />
                        Profile
                      </Link>
                      <Link
                        to="/about"
                        className="btn w-100 text-start d-flex align-items-center gap-2 px-3 py-2 rounded-2 border-0 text-decoration-none"
                        onClick={() => setDropdownOpen(false)}
                        style={{ background: "transparent", color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-muted)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <i className="bi bi-info-circle" />
                        About Us
                      </Link>
                      <Link
                        to="/contact"
                        className="btn w-100 text-start d-flex align-items-center gap-2 px-3 py-2 rounded-2 border-0 text-decoration-none"
                        onClick={() => setDropdownOpen(false)}
                        style={{ background: "transparent", color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-muted)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <i className="bi bi-envelope" />
                        Contact Us
                      </Link>
                      <hr className="my-1 mx-2" style={{ borderColor: "var(--border)" }} />
                      <button
                        type="button"
                        className="btn w-100 text-start d-flex align-items-center gap-2 px-3 py-2 rounded-2 border-0"
                        onClick={handleLogout}
                        style={{ background: "transparent", color: "#ef4444" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <i className="bi bi-box-arrow-right" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ) : (
              <>
                <li className="nav-item ms-lg-2">
                  <Link
                    to="/login"
                    className="nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                    onClick={() => setOpen(false)}
                    style={{
                      color: location.pathname === "/login" ? "var(--accent)" : "var(--text-secondary)",
                      fontWeight: location.pathname === "/login" ? 600 : 500,
                      background: location.pathname === "/login" ? "var(--accent-muted)" : "transparent",
                    }}
                  >
                    <i className="bi bi-box-arrow-in-right" />
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/signup"
                    className="btn btn-agro d-flex align-items-center gap-2 px-3 py-2"
                    onClick={() => setOpen(false)}
                  >
                    <i className="bi bi-person-plus" />
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
