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
      showToast(`Account created for ${form.name}`, "info");
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
    <div className="container auth-shell d-flex align-items-center">
      <div className="stagger w-100 auth-panel">
        <section className="auth-showcase">
          <span className="section-kicker mb-3" style={{ color: "white", background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.16)" }}>
            <i className="bi bi-person-check" />
            New grower setup
          </span>
          <h1 className="display-6 fw-bold mb-3 position-relative">Create an account built for crop workflows.</h1>
          <p className="mb-4 position-relative" style={{ maxWidth: "31rem", opacity: 0.92 }}>
            Sign up once, then keep scan history, soil guidance, and feedback in one consistent workspace across sessions.
          </p>
          <div className="row g-3 position-relative">
            <div className="col-sm-6">
              <div className="auth-metric h-100">
                <div className="small text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.07em" }}>Scan reports</div>
                <div className="fw-semibold">Store past detections and return to them when needed.</div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="auth-metric h-100">
                <div className="small text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.07em" }}>Soil guidance</div>
                <div className="fw-semibold">Pair disease output with practical soil and care advice.</div>
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
              <i className="bi bi-person-plus" style={{ fontSize: "2rem" }} />
            </div>
            <h2 className="h3 fw-bold mb-1" style={{ color: "var(--text-primary)" }}>Create your account</h2>
            <p className="mb-0" style={{ color: "var(--text-muted)" }}>Join AgroScan to start monitoring crops.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>
                Full name
              </label>
              <div className="position-relative">
                <span className="field-icon">
                  <i className="bi bi-person" />
                </span>
                <input
                  type="text"
                  name="name"
                  className="form-control ps-5"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

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

            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>
                Phone number
              </label>
              <div className="position-relative">
                <span className="field-icon">
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

            <div className="mb-3">
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
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  minLength={6}
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
              {form.password && (
                <div className="mt-2">
                  <div className="rounded-pill overflow-hidden" style={{ height: 4, background: "var(--border)" }}>
                    <div className="h-100 rounded-pill" style={{ width: strength.width, background: strength.color, transition: "width 0.3s" }} />
                  </div>
                  <div className="small mt-1" style={{ color: strength.color }}>
                    {strength.label}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>
                Confirm password
              </label>
              <div className="position-relative">
                <span className="field-icon">
                  <i className="bi bi-shield-lock" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="form-control ps-5"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <span className="field-action" style={{ color: "#22c55e" }}>
                    <i className="bi bi-check-circle-fill" />
                  </span>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-agro w-100 py-3" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Creating account...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2" />
                  Create account
                </>
              )}
            </button>
          </form>

          <p className="text-center mb-0 mt-4 small" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: "var(--accent)" }}>
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
