import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", number: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    const res = await signup(form.name, form.email, form.password, form.number);
    if (res.success) {
      showToast(`Account created! Welcome, ${form.name}`, "info");
      navigate("/dashboard");
    } else {
      showToast(res.error || "Signup failed", "error");
    }
  };

  const passwordStrength = (pwd) => {
    if (!pwd) return { label: "", color: "", width: "0%" };
    if (pwd.length < 6) return { label: "Weak", color: "#ef4444", width: "33%" };
    if (pwd.length < 10) return { label: "Medium", color: "#f59e0b", width: "66%" };
    return { label: "Strong", color: "#22c55e", width: "100%" };
  };

  const strength = passwordStrength(form.password);

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "calc(100vh - 200px)" }}>
      <div className="stagger w-100" style={{ maxWidth: "440px" }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 64, height: 64, background: "var(--accent-muted)", color: "var(--accent)" }}
          >
            <i className="bi bi-person-plus" style={{ fontSize: "2rem" }} />
          </div>
          <h1 className="h3 fw-bold mb-1" style={{ color: "var(--text-primary)" }}>Create your account</h1>
          <p className="mb-0" style={{ color: "var(--text-muted)" }}>
            Join AgroScan to start monitoring crops
          </p>
        </div>

        {/* Form card */}
        <div className="glass-lg rounded-4 p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>
                Full name
              </label>
              <div className="position-relative">
                <span
                  className="position-absolute top-50 translate-middle-y"
                  style={{ left: 14, color: "var(--text-muted)" }}
                >
                  <i className="bi bi-person" />
                </span>
                <input
                  type="text"
                  name="name"
                  className="form-control ps-5"
                  placeholder="Sahbaz Siddique"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

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

            {/* Phone Number */}
            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>
                Phone Number
              </label>
              <div className="position-relative">
                <span
                  className="position-absolute top-50 translate-middle-y"
                  style={{ left: 14, color: "var(--text-muted)" }}
                >
                  <i className="bi bi-telephone" />
                </span>
                <input
                  type="tel"
                  name="number"
                  className="form-control ps-5"
                  placeholder="+91 9876543210"
                  value={form.number}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
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
                  autoComplete="new-password"
                  minLength={6}
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
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div
                    className="rounded-pill overflow-hidden"
                    style={{ height: 4, background: "var(--border)" }}
                  >
                    <div
                      className="h-100 rounded-pill"
                      style={{ width: strength.width, background: strength.color, transition: "width 0.3s" }}
                    />
                  </div>
                  <div className="small mt-1" style={{ color: strength.color }}>
                    {strength.label}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>
                Confirm password
              </label>
              <div className="position-relative">
                <span
                  className="position-absolute top-50 translate-middle-y"
                  style={{ left: 14, color: "var(--text-muted)" }}
                >
                  <i className="bi bi-shield-lock" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="form-control ps-5"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <span
                    className="position-absolute top-50 translate-middle-y"
                    style={{ right: 14, color: "#22c55e" }}
                  >
                    <i className="bi bi-check-circle-fill" />
                  </span>
                )}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-agro w-100 py-2" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Creating account…
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2" />
                  Create account
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center mb-0 mt-4 small" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: "var(--accent)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
