import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { child, get, ref } from "firebase/database";
import API from "../api";
import { auth, database } from "../firebase";

const statTemplates = [
  { label: "Scans today", valueKey: "scans", fallback: "0", icon: "bi-camera", color: "var(--accent)" },
  { label: "Crops monitored", valueKey: "crops", fallback: "4", icon: "bi-flower2", color: "var(--accent-light)" },
  { label: "Diseases detected", valueKey: "diseases", fallback: "0", icon: "bi-bug", color: "var(--accent)" },
];

const steps = [
  { title: "Upload", desc: "Upload a crop leaf or plant image", icon: "bi-cloud-arrow-up", to: "/upload" },
  { title: "Scan", desc: "AI analyzes disease and suggests care", icon: "bi-cpu" },
  { title: "Act", desc: "Follow fertilizer and prevention tips", icon: "bi-check2-circle", to: "/soil" },
];

export default function Dashboard() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentScans, setRecentScans] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [showAllScans, setShowAllScans] = useState(false);

  useEffect(() => {
    API.get("/dashboard")
      .then((res) => setInfo(res.data))
      .catch(() =>
        setInfo({
          user: "Farmer",
          farmLocation: "-",
          cropsMonitored: 4,
          message: "Welcome to AgroScan.",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setUserProfile(user);
      const dbRef = ref(database);

      try {
        const snapshot = await get(child(dbRef, `users/${user.uid}/scans`));
        if (snapshot.exists()) {
          const scansData = snapshot.val();
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
    });

    return () => unsubscribe();
  }, []);

  const statValues = {
    scans: recentScans.length
      ? String(recentScans.filter((scan) => new Date(scan.date).toDateString() === new Date().toDateString()).length)
      : "0",
    crops: info ? String(info.cropsMonitored ?? 4) : "4",
    diseases: recentScans.length ? String(recentScans.length) : "0",
  };

  return (
    <div className="container py-4 py-lg-5">
      <section className="stagger mb-5">
        <div
          className="hero-panel p-4 p-lg-5 text-white"
          style={{
            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.98), rgba(167, 139, 250, 0.92))",
          }}
        >
          <div className="row g-4 align-items-center position-relative">
            <div className="col-lg-7">
              <span className="section-kicker mb-3" style={{ color: "white", background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.18)" }}>
                <i className="bi bi-stars" />
                Smart farm cockpit
              </span>
              <h1 className="display-6 fw-bold mb-3">Track crop health with a cleaner, faster workflow.</h1>
              <p className="mb-4" style={{ maxWidth: "36rem", fontSize: "1.05rem", opacity: 0.92 }}>
                AgroScan brings disease detection, scan history, and next-step care advice into one focused dashboard for daily crop monitoring.
              </p>
              <div className="d-flex flex-wrap gap-2 mb-4">
                <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(255,255,255,0.14)", color: "white" }}>1. Upload image</span>
                <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(255,255,255,0.14)", color: "white" }}>2. Scan disease</span>
                <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(255,255,255,0.14)", color: "white" }}>3. Follow advice</span>
              </div>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/upload" className="btn btn-light px-4 py-3 rounded-pill fw-bold d-inline-flex align-items-center gap-2">
                  <i className="bi bi-camera-fill" />
                  Start a new scan
                </Link>
                <Link to="/reports" className="btn border border-light border-opacity-25 text-white px-4 py-3 rounded-pill fw-semibold d-inline-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-text" />
                  Open reports
                </Link>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="glass-lg p-4 text-start h-100" style={{ background: "linear-gradient(180deg, rgba(124, 58, 237, 0.78), rgba(91, 33, 182, 0.74))", borderColor: "rgba(255,255,255,0.16)", color: "white" }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <div className="small text-uppercase fw-bold" style={{ letterSpacing: "0.08em", opacity: 0.75 }}>
                      Live overview
                    </div>
                    <div className="h4 mb-0 fw-bold">{info?.user || userProfile?.displayName || "Farmer"}</div>
                  </div>
                  <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(255,255,255,0.14)", color: "white" }}>
                    {loading ? "Syncing" : "Ready"}
                  </span>
                </div>
                <p className="mb-4" style={{ opacity: 0.88 }}>
                  {info?.message || "Keep plants healthy with image-based disease checks and structured follow-up advice."}
                </p>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="auth-metric h-100">
                      <div className="small text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.06em", opacity: 0.72 }}>Next action</div>
                      <div className="fw-semibold">Upload a fresh crop image</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="auth-metric h-100">
                      <div className="small text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.06em", opacity: 0.72 }}>Monitored crops</div>
                      <div className="fw-semibold">{info?.cropsMonitored ?? 4}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="auth-metric h-100">
                      <div className="small text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.06em", opacity: 0.72 }}>Status</div>
                      <div className="fw-semibold">AI detection active</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="auth-metric h-100">
                      <div className="small text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.06em", opacity: 0.72 }}>Recent scans</div>
                      <div className="fw-semibold">{recentScans.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stagger row g-3 g-md-4 mb-5">
        {statTemplates.map((stat) => (
          <div key={stat.label} className="col-md-4">
            <div
              className="glass p-4 h-100 d-flex align-items-center gap-3"
              style={{ transition: "transform 0.2s, box-shadow 0.2s", background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,243,255,0.92))" }}
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
                style={{ width: 56, height: 56, background: "var(--accent-muted)", color: stat.color }}
              >
                <i className={`bi ${stat.icon}`} style={{ fontSize: "1.5rem" }} />
              </div>
              <div>
                <div className="fw-bold fs-3 lh-1 mb-1" style={{ color: "var(--text-primary)" }}>
                  {statValues[stat.valueKey] ?? stat.fallback}
                </div>
                <div className="small fw-semibold" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="stagger mb-5">
        <div className="section-heading mb-4">
          <span className="section-kicker mb-3">
            <i className="bi bi-lightning-charge-fill" />
            Workflow
          </span>
          <h2 className="h3 fw-bold mb-2" style={{ color: "var(--text-primary)" }}>Three steps from photo to action.</h2>
          <p className="mb-0" style={{ color: "var(--text-muted)" }}>
            The flow stays simple so scans can be repeated quickly in real field conditions.
          </p>
        </div>
        <div className="row g-3">
          {steps.map((step, index) => (
            <div key={step.title} className="col-md-4">
              <div className="glass p-4 h-100 d-flex flex-column position-relative overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,243,255,0.94))" }}>
                <div className="position-absolute top-0 start-0 w-100" style={{ height: "4px", background: "var(--accent)" }} />
                <div className="d-flex align-items-center gap-3 mb-3 mt-2">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold shadow-sm"
                    style={{ width: 36, height: 36, background: "var(--accent)", color: "white", fontSize: "1rem" }}
                  >
                    {index + 1}
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

      {recentScans.length > 0 && (
        <section className="stagger mt-5 pt-3">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <span className="section-kicker mb-2">
                <i className="bi bi-clock-history" />
                History
              </span>
              <h2 className="h3 fw-bold mb-0" style={{ color: "var(--text-primary)" }}>Recent scan activity</h2>
            </div>
            {recentScans.length > 6 && (
              <button
                className="btn btn-sm px-4 py-2 rounded-pill fw-semibold shadow-sm animate-fade-in"
                onClick={() => setShowAllScans(!showAllScans)}
                style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)", transition: "all 0.2s" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent-muted)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-secondary)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {showAllScans ? (
                  <><i className="bi bi-eye-slash-fill me-2" />Show Less</>
                ) : (
                  <><i className="bi bi-eye-fill me-2" />View All ({recentScans.length})</>
                )}
              </button>
            )}
          </div>

          <div className="row g-4">
            {recentScans.slice(0, showAllScans ? recentScans.length : 6).map((scan) => (
              <div key={scan.id} className="col-md-6 col-xl-4">
                <div
                  className="glass compact-card h-100 d-flex flex-column"
                  style={{ transition: "transform 0.2s, box-shadow 0.2s", background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,243,255,0.92))" }}
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
                      <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: 42, height: 42, background: "var(--accent)", color: "white" }}>
                        <i className="bi bi-bug-fill" />
                      </div>
                      <div>
                        <div className="fw-bold compact-title text-wrap" style={{ color: "var(--text-primary)", wordBreak: "break-word" }} title={scan.disease}>
                          {scan.disease}
                        </div>
                        <div className="small text-muted">
                          {new Date(scan.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                    {scan.confidence && (
                      <div className="text-end">
                        <span className="badge rounded-pill fw-semibold px-2 py-1" style={{ background: "rgba(124, 58, 237, 0.12)", color: "var(--accent)", border: "1px solid rgba(124, 58, 237, 0.22)" }}>
                          {Math.round(scan.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-grow-1">
                    <div className="small text-muted text-wrap mb-2" style={{ lineHeight: "1.4" }} title={scan.fertilizer || scan.prevention}>
                      <i className="bi bi-flower2 me-1 text-accent" />
                      {scan.fertilizer || scan.prevention || "No recommendation available"}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <span className="small fw-semibold" style={{ color: "var(--text-secondary)" }}>
                        {new Date(scan.date).toLocaleDateString()}
                      </span>
                      {typeof scan.confidence === "number" && (
                        <span className="badge" style={{ background: "rgba(124, 58, 237, 0.12)", color: "var(--accent)", border: "1px solid rgba(124, 58, 237, 0.22)" }}>
                          {Math.round(scan.confidence * 100)}% Conf
                        </span>
                      )}
                    </div>
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
