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
      showToast(`Welcome back, ${res.user.name}!`, "info");
      navigate("/dashboard");
    } else {
      showToast(res.error || "Login failed", "error");
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "calc(100vh - 200px)" }}>
      <div className="stagger w-100" style={{ maxWidth: "420px" }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 64, height: 64, background: "var(--accent-muted)", color: "var(--accent)" }}
          >
            <i className="bi bi-person-circle" style={{ fontSize: "2rem" }} />
          </div>
          <h1 className="h3 fw-bold mb-1" style={{ color: "var(--text-primary)" }}>Welcome back</h1>
          <p className="mb-0" style={{ color: "var(--text-muted)" }}>
            Sign in to your AgroScan account
          </p>
        </div>

        {/* Form card */}
        <div className="glass-lg rounded-4 p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>
                Email address
              </label>
              <div className="position-relative">
                <span
                  className="position-absolute top-50 translate-middle-y"
                  style={{ left: 14, color: "var(--text-muted)" }}
                >
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

            {/* Password */}
            <div className="mb-4">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="position-relative">
                <span
                  className="position-absolute top-50 translate-middle-y"
                  style={{ left: 14, color: "var(--text-muted)" }}
                >
                  <i className="bi bi-lock" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control ps-5 pe-5"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute top-50 translate-middle-y p-0 border-0"
                  style={{ right: 14, color: "var(--text-muted)" }}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-agro w-100 py-2" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Signing in…
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="d-flex align-items-center my-4">
            <hr className="flex-grow-1" style={{ borderColor: "var(--border)" }} />
            <span className="px-3 small" style={{ color: "var(--text-muted)" }}>or</span>
            <hr className="flex-grow-1" style={{ borderColor: "var(--border)" }} />
          </div>

          {/* Demo login */}
          <button
            type="button"
            className="btn btn-outline-secondary w-100 py-2 mb-3"
            onClick={async () => {
              const res = await login("demo@agroscan.com", "demo123");
              if (res.success) {
                showToast(`Welcome, ${res.user.name}! (Demo account)`, "info");
                navigate("/dashboard");
              }
            }}
            disabled={loading}
          >
            <i className="bi bi-lightning me-2" />
            Try Demo Account
          </button>

          {/* Signup link */}
          <p className="text-center mb-0 small" style={{ color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/signup" className="fw-semibold text-decoration-none" style={{ color: "var(--accent)" }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
