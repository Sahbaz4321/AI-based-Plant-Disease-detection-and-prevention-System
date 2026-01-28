import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{
        background: "var(--nav-bg)",
        borderTop: "1px solid var(--nav-border)",
        padding: "2rem 0",
        marginTop: "3rem",
      }}
    >
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <Link to="/dashboard" className="text-decoration-none d-inline-flex align-items-center gap-2">
              <span style={{ fontSize: "1.25rem", color: "var(--accent)" }}>🌱</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>AgroScan</span>
            </Link>
            <p className="mb-0 mt-2 small" style={{ color: "var(--text-muted)", maxWidth: "280px" }}>
              AI-powered plant disease detection & crop care. Built for farmers and agri-tech.
            </p>
          </div>
          <div className="col-md-6">
            <div className="d-flex flex-wrap gap-3 justify-content-md-end">
              <Link to="/dashboard" className="small" style={{ color: "var(--text-secondary)" }}>Dashboard</Link>
              <Link to="/upload" className="small" style={{ color: "var(--text-secondary)" }}>Scan</Link>
              <Link to="/soil" className="small" style={{ color: "var(--text-secondary)" }}>Soil Info</Link>
              <Link to="/feedback" className="small" style={{ color: "var(--text-secondary)" }}>Feedback</Link>
            </div>
            <p className="mb-0 mt-2 small text-md-end" style={{ color: "var(--text-muted)" }}>
              © {new Date().getFullYear()} AgroScan. Portfolio project.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
