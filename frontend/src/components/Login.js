import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);

    if (res.success) {
      showToast("Welcome back.", "info");
      navigate("/dashboard");
    } else {
      showToast(res.error || "Login failed", "error");
    }
  };

  return (
    <div className="container auth-shell d-flex align-items-center">
      <div className="stagger w-100 auth-panel">
        <section className="auth-showcase">
          <span className="section-kicker mb-3" style={{ color: "white", background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.16)" }}>
            <i className="bi bi-shield-check" />
            Protected workspace
          </span>
          <h1 className="display-6 fw-bold mb-3 position-relative">Welcome back to AgroScan.</h1>
          <p className="mb-4 position-relative" style={{ maxWidth: "30rem", opacity: 0.92 }}>
            Open your farm dashboard, continue previous scans, and review care suggestions without dealing with cluttered screens.
          </p>
          <div className="row g-3 position-relative">
            <div className="col-sm-6">
              <div className="auth-metric h-100">
                <div className="small text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.07em" }}>Fast diagnosis</div>
                <div className="fw-semibold">Upload photos and get disease insights in one focused flow.</div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="auth-metric h-100">
                <div className="small text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.07em" }}>Organized history</div>
                <div className="fw-semibold">Keep recent scan results ready for action and reporting.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-lg auth-form-card">
          <div className="mb-4">
            <div
              className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 64, height: 64, background: "var(--accent-muted)", color: "var(--accent)" }}
            >
              <i className="bi bi-person-circle" style={{ fontSize: "2rem" }} />
            </div>
            <h2 className="h3 fw-bold mb-1" style={{ color: "var(--text-primary)" }}>Sign in</h2>
            <p className="mb-0" style={{ color: "var(--text-muted)" }}>Access your crop monitoring workspace.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>
                Email address
              </label>
              <div className="position-relative">
                <span className="field-icon">
                  <i className="bi bi-envelope" />
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control ps-5"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="position-relative">
                <span className="field-icon">
                  <i className="bi bi-lock" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control ps-5 pe-5"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-link field-action p-0 border-0"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-agro w-100 py-3" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Signing in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2" />
                  Sign in
                </>
              )}
            </button>
          </form>

          <div className="d-flex align-items-center my-4">
            <hr className="flex-grow-1" style={{ borderColor: "var(--border)" }} />
            <span className="px-3 small" style={{ color: "var(--text-muted)" }}>or</span>
            <hr className="flex-grow-1" style={{ borderColor: "var(--border)" }} />
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary w-100 py-3 mb-3"
            onClick={async () => {
              const res = await login("demo@agroscan.com", "demo123");
              if (res.success) {
                navigate("/dashboard");
              }
            }}
            disabled={loading}
          >
            <i className="bi bi-lightning me-2" />
            Try demo account
          </button>

          <p className="text-center mb-0 small" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="fw-semibold text-decoration-none" style={{ color: "var(--accent)" }}>
              Create one
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
