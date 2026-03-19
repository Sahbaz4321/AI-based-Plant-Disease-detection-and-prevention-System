import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { auth, database } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get, child } from "firebase/database";

const statTemplates = [
  { label: "Scans today", valueKey: "scans", fallback: "0", icon: "bi-camera", color: "var(--accent)" },
  { label: "Crops monitored", valueKey: "crops", fallback: "4", icon: "bi-flower2", color: "var(--accent-light)" },
  { label: "Diseases detected", valueKey: "diseases", fallback: "0", icon: "bi-bug", color: "var(--accent)" },
];

const steps = [
  { title: "Upload", desc: "Upload a crop leaf or plant image", icon: "bi-cloud-arrow-up", to: "/upload" },
  { title: "Scan", desc: "AI analyzes disease & suggests care", icon: "bi-cpu" },
  { title: "Act", desc: "Follow fertilizer & prevention tips", icon: "bi-check2-circle", to: "/soil" },
];

export default function Dashboard() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentScans, setRecentScans] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    API.get("/dashboard")
      .then((res) => setInfo(res.data))
      .catch(() => setInfo({ user: "Farmer", farmLocation: "—", cropsMonitored: 4, message: "Welcome to AgroScan." }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserProfile(user);
        const dbRef = ref(database);
        try {
          const snapshot = await get(child(dbRef, `users/${user.uid}/scans`));
          if (snapshot.exists()) {
            const scansData = snapshot.val();
            // Convert to array and sort by date descending
            const scansArray = Object.keys(scansData).map((key) => ({
              id: key,
              ...scansData[key],
            }));
            scansArray.sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecentScans(scansArray);
          }
        } catch (error) {
          console.error("Failed to fetch recent scans:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const statValues = {
    scans: recentScans.length ? String(recentScans.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length) : "0",
    crops: info ? String(info.cropsMonitored ?? 4) : "4",
    diseases: recentScans.length ? String(recentScans.length) : "0",
  };

  return (
    <div className="container py-4">
      {/* Hero */}
      <section className="stagger text-center py-5">
        <div
          className="rounded-4 mx-auto p-4 p-md-5 mb-4 position-relative overflow-hidden"
          style={{
            maxWidth: "720px",
            background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
            color: "white",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Decorative background circle */}
          <div className="position-absolute rounded-circle" style={{
            width: 300, height: 300, background: "rgba(255,255,255,0.1)",
            top: -100, right: -50, pointerEvents: "none"
          }} />
          
          <h1 className="display-6 fw-bold mb-2 position-relative z-1">🌿 AgroScan Dashboard</h1>
          <p className="mb-0 opacity-90 position-relative z-1" style={{ fontSize: "1.05rem" }}>
            Monitor your crops and get real-time AI insights for disease detection and care.
          </p>
          <Link
            to="/upload"
            className="btn btn-light mt-4 px-4 py-2 rounded-3 fw-semibold position-relative z-1 d-inline-flex align-items-center gap-2"
            style={{ color: "var(--gradient-start)", transition: "transform 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <i className="bi bi-camera" />
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
              style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
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
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 56, height: 56, background: "var(--accent-muted)", color: s.color }}
              >
                <i className={`bi ${s.icon}`} style={{ fontSize: "1.5rem" }} />
              </div>
              <div>
                <div className="fw-bold fs-3 lh-1 mb-1" style={{ color: "var(--text-primary)" }}>
                  {statValues[s.valueKey] ?? s.fallback}
                </div>
                <div className="small fw-semibold" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="stagger mb-5">
        <h2 className="h4 fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <i className="bi bi-lightning-charge-fill text-accent" />
          How it works
        </h2>
        <div className="row g-3">
          {steps.map((step, i) => (
            <div key={i} className="col-md-4">
              <div
                className="glass rounded-4 p-4 h-100 d-flex flex-column position-relative overflow-hidden"
              >
                <div className="position-absolute top-0 start-0 w-100" style={{ height: "4px", background: "var(--accent)" }} />
                <div className="d-flex align-items-center gap-3 mb-3 mt-2">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold shadow-sm"
                    style={{ width: 36, height: 36, background: "var(--accent)", color: "white", fontSize: "1rem" }}
                  >
                    {i + 1}
                  </div>
                  <span className="fw-bold fs-5" style={{ color: "var(--text-primary)" }}>{step.title}</span>
                </div>
                <p className="mb-4 flex-grow-1" style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>{step.desc}</p>
                {step.to ? (
                  <Link to={step.to} className="btn btn-agro btn-sm align-self-start px-3 rounded-pill d-inline-flex align-items-center gap-2">
                    Start <i className={`bi ${step.icon}`} />
                  </Link>
                ) : (
                  <span className="badge rounded-pill align-self-start px-3 py-2 d-inline-flex align-items-center gap-2" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    <i className={`bi ${step.icon}`} /> Automatic
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Scans (Beautiful Layout) */}
      {recentScans.length > 0 && (
        <section className="stagger mt-5 pt-3">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="h4 fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <i className="bi bi-clock-history text-accent" />
              Recent Scans
            </h2>
            <span className="badge rounded-pill px-3 py-2" style={{ background: "var(--accent-muted)", color: "var(--accent)", fontSize: "0.85rem" }}>
              Total: {recentScans.length}
            </span>
          </div>
          
          <div className="row g-4">
            {recentScans.map((scan) => (
              <div key={scan.id} className="col-md-6 col-lg-4">
                <div className="glass-lg rounded-4 p-4 h-100 d-flex flex-column" style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "var(--shadow)";
                  }}
                >
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: 48, height: 48, background: "var(--accent)", color: "white" }}>
                        <i className="bi bi-bug-fill fs-5" />
                      </div>
                      <div>
                        <div className="fw-bold text-truncate" style={{ color: "var(--text-primary)", maxWidth: "150px" }} title={scan.disease}>
                          {scan.disease}
                        </div>
                        <div className="small text-muted">
                          {new Date(scan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    {scan.confidence && (
                        <div className="text-end">
                            <span className="badge rounded-pill fw-semibold bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                                {Math.round(scan.confidence * 100)}%
                            </span>
                        </div>
                    )}
                  </div>
                  
                  <div className="flex-grow-1">
                      {scan.fertilizer && !scan.fertilizer.includes("Confidence:") && (
                          <div className="mb-2 p-2 rounded-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                             <div className="small fw-semibold mb-1" style={{ color: "var(--text-secondary)" }}><i className="bi bi-flower2 text-accent me-1"/> Fertilizer:</div>
                             <div className="small text-muted text-truncate" title={scan.fertilizer}>{scan.fertilizer}</div>
                          </div>
                      )}
                      
                      {scan.prevention && (
                          <div className="p-2 rounded-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                             <div className="small fw-semibold mb-1" style={{ color: "var(--text-secondary)" }}><i className="bi bi-shield-check text-accent me-1"/> Prevention:</div>
                             <div className="small text-muted text-truncate" title={scan.prevention}>{scan.prevention}</div>
                          </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
