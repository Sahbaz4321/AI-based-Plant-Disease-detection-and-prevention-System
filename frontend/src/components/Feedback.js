import React from "react";
import { Link } from "react-router-dom";

const feedback = {
  detectedDisease: "Leaf Blight",
  cureProcedure:
    "Spray Mancozeb 2.5g per litre of water at 10-day intervals. Remove and burn infected leaves.",
  fertilizer: "NPK 19:19:19 foliar spray — promotes leaf recovery.",
  preventiveMeasures:
    "Maintain field hygiene, avoid overhead irrigation, and rotate crops annually.",
};

const cards = [
  { title: "Detected disease", value: feedback.detectedDisease, icon: "bi-bug" },
  { title: "Procedure to cure", value: feedback.cureProcedure, icon: "bi-clipboard2-pulse", full: true },
  { title: "Recommended fertilizer", value: feedback.fertilizer, icon: "bi-flower2" },
  { title: "Preventive measures", value: feedback.preventiveMeasures, icon: "bi-shield-check", full: true },
];

export default function Feedback() {
  return (
    <div className="container">
      <section className="stagger text-center mb-5">
        <h1 className="h3 fw-bold mb-2" style={{ color: "var(--text-primary)" }}>
          <i className="bi bi-chat-square-text me-2 text-accent" />
          AgroScan feedback
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "520px", margin: "0 auto" }}>
          Latest analysis: disease, cure, fertilizer, and prevention tips.
        </p>
      </section>

      <div className="stagger" style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div className="glass rounded-4 p-4 p-md-5 mb-4">
          <h2 className="h5 fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
            <i className="bi bi-clipboard2-data me-2 text-accent" />
            Analysis result
          </h2>
          <div className="row g-3">
            {cards.map((c, i) => (
              <div key={i} className={c.full ? "col-12" : "col-md-6"}>
                <div
                  className="rounded-3 p-4 h-100 d-flex align-items-start gap-3"
                  style={{ background: "var(--accent-muted)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 44, height: 44, background: "var(--bg-secondary)", color: "var(--accent)" }}
                  >
                    <i className={`bi ${c.icon}`} style={{ fontSize: "1.1rem" }} />
                  </div>
                  <div className="min-w-0">
                    <div className="small text-muted mb-1">{c.title}</div>
                    <div className="fw-semibold" style={{ color: "var(--text-primary)" }}>
                      {c.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="alert alert-success rounded-3 mt-4 mb-0 d-flex align-items-center gap-2"
            style={{ background: "var(--accent-muted)", border: "1px solid var(--border)" }}
          >
            <i className="bi bi-check-circle flex-shrink-0" />
            Your field report has been generated successfully.
          </div>
        </div>

        <div className="text-center">
          <p className="mb-3" style={{ color: "var(--text-muted)" }}>
            Upload a crop image on the <strong>Scan</strong> page to get new AI-based feedback.
          </p>
          <Link to="/upload" className="btn btn-agro">
            <i className="bi bi-camera me-2" />
            Scan image
          </Link>
        </div>
      </div>
    </div>
  );
}
