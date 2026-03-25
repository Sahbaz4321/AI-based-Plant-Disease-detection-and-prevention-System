import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, database } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get, child } from "firebase/database";
import { generateYieldAdvice } from "../utils/soilAdvice";

export default function SoilInfo() {
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState(null);
  const [scanDisease, setScanDisease] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const dbRef = ref(database);
        try {
          const snapshot = await get(child(dbRef, `users/${user.uid}/scans`));
          if (snapshot.exists()) {
            const scansData = snapshot.val();
            const scansArray = Object.keys(scansData).map((key) => scansData[key]);
            // Sort to get newest
            scansArray.sort((a, b) => new Date(b.date) - new Date(a.date));
            const latestScan = scansArray[0];
            
            setScanDisease(latestScan.disease);
            setAdvice(generateYieldAdvice(latestScan.disease));
          } else {
            // No scans found
            setAdvice(generateYieldAdvice(""));
          }
        } catch (error) {
          console.error("Failed to fetch user scan data:", error);
          setAdvice(generateYieldAdvice(""));
        } finally {
          setLoading(false);
        }
      } else {
        // Guest fallback
        try {
          const raw = localStorage.getItem("agroscan-last-prediction");
          if (raw) {
            const parsed = JSON.parse(raw);
            setScanDisease(parsed.disease);
            setAdvice(generateYieldAdvice(parsed.disease));
          } else {
            setAdvice(generateYieldAdvice(""));
          }
        } catch {
          setAdvice(generateYieldAdvice(""));
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container py-5">
      <section className="stagger text-center mb-5">
        <h1 className="h3 fw-bold mb-2" style={{ color: "var(--text-primary)" }}>
          <i className="bi bi-droplet me-2 text-accent" />
          Smart Crop & Soil Advisor
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "560px", margin: "0 auto" }}>
          Dynamic soil analysis and yield-improving insights tailored specifically to your latest crop scan.
        </p>
      </section>

      {loading ? (
        <div className="stagger glass rounded-4 p-5 mx-auto" style={{ maxWidth: "760px" }}>
          <div className="skeleton mb-4" style={{ height: 28, width: "45%" }} />
          <div className="skeleton mb-3" style={{ height: 100, width: "100%" }} />
          <div className="skeleton mb-3" style={{ height: 100, width: "100%" }} />
          <div className="skeleton" style={{ height: 100, width: "100%" }} />
        </div>
      ) : advice ? (
        <div className="stagger mx-auto" style={{ maxWidth: "800px" }}>
          
          {scanDisease && (
            <div className="alert alert-info d-flex align-items-center gap-3 mb-4 rounded-4" style={{ background: "rgba(14, 165, 233, 0.1)", border: "1px solid rgba(14, 165, 233, 0.3)", color: "var(--text-primary)" }}>
              <i className="bi bi-info-circle-fill text-info fs-4" />
              <div>
                <strong>Scan context updated:</strong> Customizing soil and fertilizer advice based on your latest crop scan: <span className="text-info fw-bold">{scanDisease}</span>.
              </div>
            </div>
          )}

          {/* Health Score Overview Component */}
          <div className="glass-lg rounded-4 p-4 p-md-5 mb-4 d-flex flex-column flex-md-row gap-4 align-items-center justify-content-between">
            <div>
              <h2 className="h4 fw-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Soil Fertility & Health Index
              </h2>
              <p className="mb-0 text-muted" style={{ maxWidth: "400px" }}>
                This index represents the current potential for high-yield crop production based on your field's pathology.
              </p>
            </div>
            
            <div className="text-center position-relative">
              <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: 140, height: 140 }}>
                <svg width="140" height="140" viewBox="0 0 140 140" className="position-absolute z-0">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="var(--border)" strokeWidth="8" />
                  <circle cx="70" cy="70" r="60" fill="none" stroke={advice.healthScore > 75 ? "#10b981" : advice.healthScore > 50 ? "#f59e0b" : "#ef4444"} strokeWidth="8"
                    strokeDasharray="377" 
                    strokeDashoffset={377 - (377 * (advice.healthScore || 0)) / 100}
                    strokeLinecap="round"
                    style={{ 
                      transition: "stroke-dashoffset 1.5s ease-out", 
                      transform: "rotate(-90deg)", 
                      transformOrigin: "50% 50%", 
                      filter: `drop-shadow(0 0 8px ${advice.healthScore > 75 ? "rgba(16,185,129,0.5)" : advice.healthScore > 50 ? "rgba(245,158,11,0.5)" : "rgba(239,68,68,0.5)"})` 
                    }}
                  />
                </svg>
                <div className="position-relative z-1 d-flex flex-column align-items-center justify-content-center">
                  <span className="fs-2 fw-bold" style={{ color: "var(--text-primary)" }}>{advice.healthScore}</span>
                  <span className="small text-muted fw-semibold text-uppercase" style={{ fontSize: "0.75rem" }}>/ 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="glass rounded-4 p-4 h-100 position-relative overflow-hidden">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: 48, height: 48, background: "var(--bg-secondary)", color: "var(--accent)" }}>
                    <i className="bi bi-globe-americas fs-5" />
                  </div>
                  <div>
                    <h3 className="h6 fw-bold mb-0" style={{ color: "var(--text-primary)" }}>Recommended Soil Type</h3>
                  </div>
                </div>
                <p className="fs-5 fw-semibold mb-0" style={{ color: "var(--text-secondary)" }}>
                  {advice.type}
                </p>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="glass rounded-4 p-4 h-100 position-relative overflow-hidden">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: 48, height: 48, background: "var(--bg-secondary)", color: "var(--accent)" }}>
                    <i className="bi bi-graph-up-arrow fs-5" />
                  </div>
                  <div>
                    <h3 className="h6 fw-bold mb-0" style={{ color: "var(--text-primary)" }}>Fertility Status</h3>
                  </div>
                </div>
                <p className="fs-5 fw-semibold mb-0" style={{ color: "var(--text-secondary)" }}>
                  {advice.fertility}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-lg rounded-4 p-4 p-md-5 position-relative overflow-hidden">
            <div className="position-absolute top-0 start-0 h-100" style={{ width: "4px", background: "var(--accent)" }} />
            <h2 className="h4 fw-bold mb-4" style={{ color: "var(--text-primary)", marginLeft: "1rem" }}>
              <i className="bi bi-stars me-2 text-accent" />
              Yield Improvement Plan
            </h2>
            
            <div className="mb-4" style={{ marginLeft: "1rem" }}>
              <h3 className="h6 fw-bold text-muted text-uppercase letter-spacing-1 mb-2">Optimal Fertilizer</h3>
              <div className="p-3 rounded-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <span className="fs-5 fw-semibold" style={{ color: "var(--text-primary)" }}>{advice.fertilizer}</span>
              </div>
            </div>

            <div style={{ marginLeft: "1rem" }}>
              <h3 className="h6 fw-bold text-muted text-uppercase letter-spacing-1 mb-2">Required Core Action</h3>
              <div className="p-3 rounded-3" style={{ background: "var(--accent-muted)", border: "1px solid var(--border)" }}>
                <p className="mb-0 fw-semibold" style={{ color: "var(--accent)", lineHeight: 1.6 }}>{advice.action}</p>
              </div>
            </div>
          </div>

        </div>
      ) : null}
      
      {!scanDisease && !loading && (
        <div className="text-center mt-5">
           <Link to="/upload" className="btn btn-agro py-2 px-4 shadow-sm">
             <i className="bi bi-camera me-2" />
             Scan a crop to get personalized tips
           </Link>
        </div>
      )}
    </div>
  );
}
