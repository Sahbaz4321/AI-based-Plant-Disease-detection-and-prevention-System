import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="mt-auto footer-panel"
      style={{
        background: "var(--nav-bg)",
        borderTop: "1px solid var(--nav-border)",
        padding: "2.5rem 0 2rem",
        marginTop: "3rem",
      }}
    >
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-lg-5">
            <Link to="/dashboard" className="text-decoration-none d-inline-flex align-items-center gap-3">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: 46,
                  height: 46,
                  background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                  color: "white",
                }}
              >
                <i className="bi bi-tree-fill" />
              </span>
              <span>
                <span style={{ fontWeight: 800, color: "var(--text-primary)", display: "block" }}>AgroScan</span>
                <span className="small" style={{ color: "var(--text-muted)" }}>AI-powered crop care companion</span>
              </span>
            </Link>
            <p className="mb-0 mt-3 small" style={{ color: "var(--text-muted)", maxWidth: "320px", lineHeight: "1.7" }}>
              AI-powered plant disease detection, scan tracking, and practical care suggestions designed for growers and agri-tech workflows.
            </p>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="small text-uppercase fw-bold mb-3" style={{ color: "var(--text-secondary)", letterSpacing: "0.08em" }}>
              Explore
            </div>
            <div className="d-flex flex-column gap-2">
              <Link to="/dashboard" className="footer-link small">Dashboard</Link>
              <Link to="/upload" className="footer-link small">Scan crops</Link>
              <Link to="/soil" className="footer-link small">Soil info</Link>
            </div>
          </div>
          <div className="col-sm-6 col-lg-4">
            <div className="small text-uppercase fw-bold mb-3" style={{ color: "var(--text-secondary)", letterSpacing: "0.08em" }}>
              Connect
            </div>
            <div className="d-flex flex-column gap-2">
              <Link to="/feedback" className="footer-link small">Feedback</Link>
              <Link to="/about" className="footer-link small">About us</Link>
              <Link to="/contact" className="footer-link small">Contact</Link>
            </div>
          </div>
        </div>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--nav-border)" }}>
          <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} AgroScan. Portfolio project.
          </p>
          <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
            Built for clearer crop monitoring interfaces.
          </p>
        </div>
      </div>
    </footer>
  );
}
