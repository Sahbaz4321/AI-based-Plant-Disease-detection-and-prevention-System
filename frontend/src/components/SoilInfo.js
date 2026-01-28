import React, { useEffect, useState } from "react";
import API from "../api";

export default function SoilInfo() {
  const [soil, setSoil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/soil-info")
      .then((res) => setSoil(res.data))
      .catch(() => setSoil({
        soilMoisture: "—",
        soilType: "—",
        recommendedFertilizer: "—",
        preventionTips: ["Check connectivity and try again."],
      }))
      .finally(() => setLoading(false));
  }, []);

  const metrics = soil
    ? [
        { label: "Soil moisture", value: soil.soilMoisture, icon: "bi-droplet-half" },
        { label: "Soil type", value: soil.soilType, icon: "bi-globe2" },
        { label: "fertilizer", value: soil.recommendedFertilizer, icon: "bi-flower2" },
      ]
    : [];

  return (
    <div className="container">
      <section className="stagger text-center mb-5">
        <h1 className="h3 fw-bold mb-2" style={{ color: "var(--text-primary)" }}>
          <i className="bi bi-droplet me-2 text-accent" />
          Soil & crop information
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "520px", margin: "0 auto" }}>
          Soil insights, fertilizer recommendations, and prevention tips for healthier crops.
        </p>
      </section>

      {loading ? (
        <div className="stagger glass rounded-4 p-5 mx-auto" style={{ maxWidth: "640px" }}>
          <div className="skeleton mb-4" style={{ height: 28, width: "45%" }} />
          <div className="skeleton mb-3" style={{ height: 56, width: "100%" }} />
          <div className="skeleton mb-3" style={{ height: 56, width: "100%" }} />
          <div className="skeleton mb-4" style={{ height: 56, width: "100%" }} />
          <div className="skeleton" style={{ height: 120, width: "100%" }} />
        </div>
      ) : soil ? (
        <div className="stagger" style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div className="glass rounded-4 p-4 p-md-5 mb-4">
            <h2 className="h5 fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
              <i className="bi bi-bar-chart me-2 text-accent" />
              Soil details
            </h2>
            <div className="row g-3">
              {metrics.map((m, i) => (
                <div key={i} className="col-md-4">
                  <div
                    className="rounded-3 p-3 h-100 d-flex align-items-center gap-3"
                    style={{ background: "var(--accent-muted)", border: "1px solid var(--border)" }}
                  >
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 44, height: 44, background: "var(--bg-secondary)", color: "var(--accent)" }}
                    >
                      <i className={`bi ${m.icon}`} style={{ fontSize: "1.1rem" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="small text-muted mb-0">{m.label}</div>
                      <div className="fw-semibold text-truncate" style={{ color: "var(--text-primary)" }}>
                        {m.value}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-4 p-4 p-md-5">
            <h2 className="h5 fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
              <i className="bi bi-lightbulb me-2 text-accent" />
              Prevention tips
            </h2>
            <ul className="list-unstyled mb-0">
              {soil.preventionTips.map((tip, i) => (
                <li
                  key={i}
                  className="d-flex align-items-start gap-3 mb-3 pb-3"
                  style={{
                    borderBottom: i < soil.preventionTips.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <span
                    className="rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0 fw-bold small"
                    style={{ width: 28, height: 28, background: "var(--accent-muted)", color: "var(--accent)" }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
