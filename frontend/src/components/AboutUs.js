import React from "react";

export default function AboutUs() {
  return (
    <div className="container py-5">
      <div className="mx-auto stagger" style={{ maxWidth: "800px" }}>
        <div className="text-center mb-5">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 80, height: 80, background: "var(--accent-muted)", color: "var(--accent)", fontSize: "2rem" }}
          >
            🌱
          </div>
          <h1 className="h2 fw-bold mb-2" style={{ color: "var(--text-primary)" }}>About AgroScan</h1>
          <p className="text-muted" style={{ fontSize: "1.1rem" }}>
            Empowering farmers with Artificial Intelligence
          </p>
        </div>

        <div className="glass-lg rounded-4 p-4 p-md-5 mb-4">
          <h2 className="h4 fw-bold mb-3" style={{ color: "var(--text-primary)" }}>Our Mission</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>
            AgroScan aims to revolutionize agriculture by putting the power of advanced crop disease detection into the hands of every farmer. By utilizing state-of-the-art AI and machine learning techniques, we deliver quick, accurate diagnoses and actionable care tips—minimizing crop loss and maximizing yield.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-6">
            <div className="glass rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-cpu text-accent" style={{ fontSize: "1.5rem" }} />
                <h3 className="h5 fw-bold mb-0">Smart Detection</h3>
              </div>
              <p className="small mb-0 text-muted">Identify diseases early with an accuracy rate that rivals experienced agronomists.</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="glass rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-shield-check text-accent" style={{ fontSize: "1.5rem" }} />
                <h3 className="h5 fw-bold mb-0">Actionable Advice</h3>
              </div>
              <p className="small mb-0 text-muted">Receive not just diagnosis but tailored fertilizer and prevention recommendations instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
