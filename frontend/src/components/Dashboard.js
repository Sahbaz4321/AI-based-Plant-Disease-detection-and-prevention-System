import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

const statTemplates = [
  { label: "Scans today", valueKey: "scans", fallback: "12", icon: "bi-camera", color: "var(--accent)" },
  { label: "Crops monitored", valueKey: "crops", fallback: "4", icon: "bi-flower2", color: "var(--accent-light)" },
  { label: "Diseases detected", valueKey: "diseases", fallback: "3", icon: "bi-bug", color: "var(--accent)" },
];

const steps = [
  { title: "Upload", desc: "Upload a crop leaf or plant image", icon: "bi-cloud-arrow-up", to: "/upload" },
  { title: "Scan", desc: "AI analyzes disease & suggests care", icon: "bi-cpu" },
  { title: "Act", desc: "Follow fertilizer & prevention tips", icon: "bi-check2-circle", to: "/soil" },
];

export default function Dashboard() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/dashboard")
      .then((res) => setInfo(res.data))
      .catch(() => setInfo({ user: "Farmer", farmLocation: "—", cropsMonitored: 4, message: "Welcome to AgroScan." }))
      .finally(() => setLoading(false));
  }, []);

  const statValues = {
    scans: "12",
    crops: info ? String(info.cropsMonitored ?? 4) : "4",
    diseases: "3",
  };

  return (
    <div className="container">
      {/* Hero */}
      <section className="stagger text-center py-5">
        <div
          className="rounded-4 mx-auto p-4 p-md-5 mb-4"
          style={{
            maxWidth: "720px",
            background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
            color: "white",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <h1 className="display-6 fw-bold mb-2">🌿 AgroScan Dashboard</h1>
          <p className="mb-0 opacity-90" style={{ fontSize: "1.05rem" }}>
            Monitor your crops and get real-time AI insights for disease detection and care.
          </p>
          <Link
            to="/upload"
            className="btn btn-light mt-4 px-4 py-2 rounded-3 fw-semibold"
            style={{ color: "var(--gradient-start)" }}
          >
            <i className="bi bi-camera me-2" />
            Scan a crop image
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="stagger row g-3 g-md-4 mb-5">
        {statTemplates.map((s, i) => (
          <div key={i} className="col-md-4">
            <div
              className="glass rounded-4 p-4 h-100 d-flex align-items-center gap-3"
              style={{ transition: "transform 0.2s" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "var(--shadow)";
              }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 48, height: 48, background: "var(--accent-muted)", color: s.color }}
              >
                <i className={`bi ${s.icon}`} style={{ fontSize: "1.25rem" }} />
              </div>
              <div>
                <div className="fw-bold fs-4" style={{ color: "var(--text-primary)" }}>
                  {statValues[s.valueKey] ?? s.fallback}
                </div>
                <div className="small" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="stagger mb-5">
        <h2 className="h4 fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
          <i className="bi bi-lightning-charge me-2 text-accent" />
          How it works
        </h2>
        <div className="row g-3">
          {steps.map((step, i) => (
            <div key={i} className="col-md-4">
              <div
                className="glass rounded-4 p-4 h-100 d-flex flex-column"
                style={{ borderLeft: "4px solid var(--accent)" }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span
                    className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold"
                    style={{ width: 28, height: 28, background: "var(--accent-muted)", color: "var(--accent)", fontSize: "0.85rem" }}
                  >
                    {i + 1}
                  </span>
                  <span className="fw-semibold" style={{ color: "var(--text-primary)" }}>{step.title}</span>
                </div>
                <p className="small mb-3 flex-grow-1" style={{ color: "var(--text-muted)" }}>{step.desc}</p>
                {step.to ? (
                  <Link to={step.to} className="btn btn-agro btn-sm align-self-start">
                    <i className={`bi ${step.icon} me-1`} />
                    Go
                  </Link>
                ) : (
                  <span className="text-muted small">
                    <i className={`bi ${step.icon} me-1`} />
                    Automatic
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Farmer card */}
      <section className="stagger">
        <h2 className="h4 fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
          <i className="bi bi-person-badge me-2 text-accent" />
          Farmer overview
        </h2>
        {loading ? (
          <div className="glass rounded-4 p-5" style={{ maxWidth: "560px" }}>
            <div className="skeleton mb-3" style={{ height: 24, width: "40%" }} />
            <div className="skeleton mb-2" style={{ height: 20, width: "80%" }} />
            <div className="skeleton mb-2" style={{ height: 20, width: "70%" }} />
            <div className="skeleton mt-4" style={{ height: 48, width: "100%" }} />
          </div>
        ) : info ? (
          <div
            className="glass-lg rounded-4 p-4 p-md-5"
            style={{ maxWidth: "560px" }}
          >
            <div className="d-flex flex-wrap gap-3 mb-4">
              <div>
                <div className="small text-muted mb-1">User</div>
                <div className="fw-semibold" style={{ color: "var(--text-primary)" }}>{info.user}</div>
              </div>
              <div>
                <div className="small text-muted mb-1">Location</div>
                <div className="fw-semibold" style={{ color: "var(--text-primary)" }}>{info.farmLocation}</div>
              </div>
              <div>
                <div className="small text-muted mb-1">Crops monitored</div>
                <div className="fw-semibold" style={{ color: "var(--text-primary)" }}>{info.cropsMonitored}</div>
              </div>
            </div>
            <div
              className="alert alert-success rounded-3 mb-0"
              style={{ background: "var(--accent-muted)", border: "1px solid var(--border)" }}
            >
              <i className="bi bi-check-circle me-2" />
              {info.message}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
