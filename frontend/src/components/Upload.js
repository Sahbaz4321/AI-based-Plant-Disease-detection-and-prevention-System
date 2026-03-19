import React, { useState, useCallback, useEffect } from "react";
import API, { ModelAPI } from "../api";
import { database } from "../firebase";
import { ref, push, set } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useToast } from "../context/ToastContext";

const HISTORY_KEY = "agroscan-scan-history";
const MAX_HISTORY = 5;

function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addToHistory(entry) {
  const list = getHistory();
  const next = [{ ...entry, id: Date.now() }, ...list].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export default function Upload() {
  const { showToast } = useToast();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);
  const [history, setHistory] = useState(getHistory());
  const [dbScans, setDbScans] = useState([]);

  // Fetch db scans for logged in user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        import("firebase/database").then(({ get, child }) => {
          const dbRef = ref(database);
          get(child(dbRef, `users/${user.uid}/scans`)).then((snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const arr = Object.keys(data).map(k => ({ id: k, ...data[k] }));
              arr.sort((a,b) => new Date(b.date) - new Date(a.date));
              setDbScans(arr);
            }
          });
        });
      } else {
        setDbScans([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const clearPreviews = useCallback(() => {
    previews.forEach(p => URL.revokeObjectURL(p));
    setPreviews([]);
    setFiles([]);
    setResults([]);
  }, [previews]);

  useEffect(() => {
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p));
    };
  }, [previews]);

  const handleFiles = useCallback(
    (fileList) => {
      clearPreviews();
      const validFiles = Array.from(fileList).filter(f => f.type.startsWith("image/"));
      if (validFiles.length === 0) return;
      
      setFiles(validFiles);
      setPreviews(validFiles.map(f => URL.createObjectURL(f)));
      setResults([]);
    },
    [clearPreviews]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDrag(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDrag(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDrag(false);
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      showToast("Please select or drop images first", "error");
      return;
    }

    setLoading(true);
    setProgress(0);
    setResults([]);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + Math.random() * 8 + 2;
      });
    }, 200);

    const formData = new FormData();
    files.forEach(file => {
      formData.append("images", file);
    });

    try {
      // 1) Get predictions for all images
      const predictRes = await ModelAPI.post("/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const predictionsData = Array.isArray(predictRes.data) ? predictRes.data : [predictRes.data];
      if (!predictionsData || predictionsData.length === 0) {
        throw new Error("No prediction returned from model");
      }

      // 2) Get explanations in parallel
      const fullyMappedResults = await Promise.all(
        predictionsData.map(async (pred, index) => {
          let explainData = null;
          try {
            const explainRes = await ModelAPI.post("/explain-disease", {
              disease: pred.predicted_class,
            });
            explainData = explainRes.data;
          } catch {
            explainData = null;
          }

          return {
            filename: files[index]?.name || `Image ${index + 1}`,
            disease: pred.predicted_class,
            confidence: pred.confidence,
            fertilizer: explainData?.recommended_fertilizer || "",
            procedure: explainData?.procedure || "",
            prevention: explainData?.prevention || "",
            preview: previews[index]
          };
        })
      );

      clearInterval(interval);
      setProgress(100);
      setResults(fullyMappedResults);

      // Save to history and firebase
      const auth = getAuth();
      const user = auth.currentUser;

      const newHistoryEntries = [];

      for (const mapped of fullyMappedResults) {
        const historyEntry = {
          disease: mapped.disease,
          confidence: mapped.confidence,
          fertilizer: mapped.fertilizer || `Confidence: ${(mapped.confidence * 100).toFixed(1)}%`,
          procedure: mapped.procedure,
          prevention: mapped.prevention,
          date: new Date().toISOString(),
          filename: mapped.filename
        };

        if (user) {
          const scansRef = ref(database, `users/${user.uid}/scans`);
          const newScanRef = push(scansRef);
          await set(newScanRef, historyEntry);
        } else {
          addToHistory(historyEntry);
        }
        newHistoryEntries.push(historyEntry);
      }

      if (!user) {
        setHistory(getHistory());
      }
      
      // Save last prediction locally for SoilInfo guest fallback
      if (newHistoryEntries.length > 0) {
        localStorage.setItem("agroscan-last-prediction", JSON.stringify(newHistoryEntries[0]));
      }
      
      showToast(`${files.length} images scanned successfully!`, "info");
    } catch (err) {
      clearInterval(interval);
      setProgress(0);
      showToast("Scan failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-3 px-md-4 pb-5">
      {/* Header */}
      <section className="stagger text-center mb-5 mt-4">
        <h1 className="h3 fw-bold mb-2" style={{ color: "var(--text-primary)" }}>
          <i className="bi bi-camera me-2 text-accent" />
          Batch Crop Image Scan
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto" }}>
          Upload single or multiple crop/leaf images for rapid AI-based disease detection, fertilizer suggestions, and actionable prevention tips.
        </p>
      </section>

      {/* Upload area layout (Top) */}
      <div className="row justify-content-center mb-5">
        <div className="col-12 col-xl-10">
          <div className="stagger glass-lg rounded-4 p-4 p-md-5 w-100 d-flex flex-column align-items-center position-relative overflow-hidden">
             {/* Decorative element */}
            <div className="position-absolute top-0 start-0 w-100" style={{ height: "4px", background: "linear-gradient(90deg, var(--gradient-start), var(--gradient-end))" }} />
            
            <h2 className="h4 fw-bold mb-4 align-self-start" style={{ color: "var(--text-primary)" }}>
              <i className="bi bi-cloud-arrow-up-fill me-2 text-accent" />
              Upload Images
            </h2>

            {/* Drop zone based on requested Tailwind HTML mapped to Bootstrap/Custom style */}
            <div className="d-flex align-items-center justify-content-center w-100"
                 onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
              <div className={`d-flex flex-column align-items-center justify-content-center w-100 rounded-4 ${drag ? "shadow-sm" : ""}`}
                   style={{
                     height: "20rem",
                     backgroundColor: drag ? "var(--accent-muted)" : "var(--bg-secondary)",
                     border: "2px dashed " + (drag ? "var(--accent)" : "rgba(13, 92, 46, 0.3)"),
                     transition: "all 0.3s ease"
                   }}>
                <div className="d-flex flex-column align-items-center justify-content-center p-4 w-100 h-100">
                  
                  {previews.length === 0 && (
                     <>
                        <svg className="mb-4 text-muted" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v9m-5 0H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2M8 9l4-5 4 5m1 8h.01"/>
                        </svg>
                        <p className="mb-2 fw-semibold" style={{ color: "var(--text-primary)" }}>Click the button below to upload</p>
                        <p className="small mb-4" style={{ color: "var(--text-muted)" }}>Max. File Size: <span className="fw-bold">30MB</span></p>
                        
                        <button type="button" onClick={() => document.getElementById("file-input")?.click()} className="btn btn-agro d-inline-flex align-items-center shadow-sm px-4 py-2">
                          <svg className="me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
                          Browse file
                        </button>
                     </>
                  )}

                  {previews.length === 1 && (
                     <div className="d-flex flex-column position-relative align-items-center h-100 justify-content-center w-100 p-2">
                         <img src={previews[0]} alt="Preview" className="rounded-3 shadow-sm mb-3" style={{ maxWidth: "100%", maxHeight: "220px", objectFit: "contain", border: "2px solid var(--border)", backgroundColor: "var(--bg-primary)" }} />
                         <p className="fw-bold mb-0 w-100 text-center" style={{ color: "var(--text-primary)", wordBreak: "break-all" }}>{files[0].name}</p>
                     </div>
                  )}

                  {previews.length > 1 && (
                     <div className="w-100 h-100 p-2 d-flex flex-column justify-content-center position-relative">
                        <div className="d-flex flex-row flex-wrap gap-2 justify-content-center mb-3 overflow-auto" style={{ maxHeight: "180px" }}>
                          {previews.map((preview, idx) => (
                            <div key={idx} className="position-relative shadow-sm rounded-3" style={{ border: "2px solid var(--border)", width: "90px", height: "90px", overflow: "hidden" }}>
                              <img src={preview} alt={`Preview ${idx + 1}`} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                            </div>
                          ))}
                        </div>
                        <p className="mb-0 text-center fw-bold px-3 py-1 bg-accent-muted rounded-pill shadow-sm align-self-center text-accent">
                          {files.length} images selected
                        </p>
                     </div>
                  )}

                </div>
              </div>
              <input id="file-input" type="file" multiple accept="image/*" className="d-none" onChange={(e) => handleFiles(e.target.files)} />
            </div>

            {/* Actions */}
            <div className="d-flex gap-3 mt-4 w-100 justify-content-center">
              <button
                type="button"
                className="btn btn-agro px-5 py-2 fw-semibold fs-6 shadow-sm"
                onClick={handleUpload}
                disabled={loading || files.length === 0}
                style={{ transition: "transform 0.2s" }}
                onMouseEnter={(e) => { if (!loading && files.length > 0) e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Analyzing {files.length} Image{files.length > 1 ? "s" : ""}…
                  </>
                ) : (
                  <>
                    <i className="bi bi-cpu-fill me-2" />
                    Scan Images
                  </>
                )}
              </button>
              {previews.length > 0 && (
                <button
                  type="button"
                  className="btn btn-outline-secondary px-3"
                  onClick={clearPreviews}
                  disabled={loading}
                >
                  <i className="bi bi-x-lg fs-5" />
                </button>
              )}
            </div>

            {/* Progress bar */}
            {loading && (
              <div className="mt-4 w-100" style={{ maxWidth: "500px" }}>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="fw-semibold" style={{ color: "var(--text-secondary)" }}>AI Processing Models…</span>
                  <span style={{ color: "var(--accent)", fontWeight: "bold" }}>{Math.round(progress)}%</span>
                </div>
                <div
                  className="rounded-pill overflow-hidden shadow-sm"
                  style={{ height: 8, background: "var(--border)" }}
                >
                  <div
                    className="h-100 rounded-pill"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, var(--gradient-start), var(--gradient-end))",
                      transition: "width 0.2s ease-out",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results grid (Bottom of Upload Area) */}
      {results.length > 0 && (
        <div className="row justify-content-center mb-5 stagger">
          <div className="col-12 col-xl-10">
            <h2 className="h4 fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <i className="bi bi-ui-checks-grid text-accent" />
              Analysis Results
            </h2>
            
            <div className="row g-4">
              {results.map((res, i) => (
                <div key={i} className="col-12">
                  <div className="glass rounded-4 h-100 overflow-hidden d-flex flex-column shadow-sm" style={{ borderLeft: "4px solid var(--accent)" }}>
                    {/* Card Header */}
                    <div className="d-flex p-3 gap-3 align-items-center" style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
                      <img src={res.preview} alt="Thumb" className="rounded-3 shadow-sm flex-shrink-0" style={{ width: 80, height: 80, objectFit: "cover" }} />
                      <div className="flex-grow-1 min-w-0">
                        <h3 className="h5 fw-bold mb-2 text-truncate" style={{ color: "var(--text-primary)" }} title={res.fileName}>{res.filename}</h3>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                           <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 py-2 px-3 fs-6 d-flex align-items-center gap-2">
                              <i className="bi bi-bug-fill" /> {res.disease}
                           </span>
                           {typeof res.confidence === "number" && (
                             <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 py-2 px-3 fs-6 fw-semibold">
                               {Math.round(res.confidence * 100)}% Confidence
                             </span>
                           )}
                        </div>
                      </div>
                    </div>

                    {/* Card Body - Now configured as a row for wide screens */}
                    <div className="p-4 d-flex flex-column gap-3 flex-grow-1">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="rounded-3 p-4 h-100" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                            <div className="small fw-bold text-uppercase mb-2" style={{ color: "var(--text-secondary)", letterSpacing: "0.5px" }}>
                              <i className="bi bi-flower2 text-accent me-2 fs-5" />
                              Fertilizer Plan
                            </div>
                            <p className="mb-0" style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>{res.fertilizer || "No specific fertilizer advice for this scan."}</p>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="rounded-3 p-4 h-100" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                            <div className="small fw-bold text-uppercase mb-2" style={{ color: "var(--text-secondary)", letterSpacing: "0.5px" }}>
                              <i className="bi bi-clipboard2-pulse text-accent me-2 fs-5" />
                              Treatment
                            </div>
                            <p className="mb-0" style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>{res.procedure || "No specific treatment required."}</p>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="rounded-3 p-4 h-100" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                            <div className="small fw-bold text-uppercase mb-2" style={{ color: "var(--text-secondary)", letterSpacing: "0.5px" }}>
                              <i className="bi bi-shield-check text-accent me-2 fs-5" />
                              Prevention
                            </div>
                            <p className="mb-0" style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>{res.prevention || "Maintain good agricultural practices."}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scan History display (Firebase for logged in, Local for guest) */}
      {(dbScans.length > 0 || (!getAuth().currentUser && history.length > 0)) && (
        <div className="row justify-content-center stagger">
          <div className="col-12 col-xl-10">
            <h2 className="h4 fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <i className="bi bi-clock-history text-accent" />
              {getAuth().currentUser ? "Your Recent Scans" : "Local Recent Scans"}
            </h2>
            <div className="row g-3">
              {(getAuth().currentUser ? dbScans : history).map((h, idx) => (
                <div key={h.id || idx} className="col-md-6 col-lg-4">
                  <div className="glass rounded-4 p-3 h-100 d-flex align-items-start gap-3 shadow-sm position-relative overflow-hidden" style={{ borderLeft: "4px solid var(--accent)" }}>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 48, height: 48, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                    >
                      <i className="bi bi-bug-fill" style={{ fontSize: "1.2rem", color: "var(--accent)" }} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-bold text-truncate mb-1" style={{ color: "var(--text-primary)", fontSize: "1.05rem" }} title={h.disease}>
                        {h.disease}
                      </div>
                      <div className="small text-muted text-truncate mb-2" title={h.fertilizer}>
                        <i className="bi bi-flower2 me-1 text-accent" />
                        {h.fertilizer || "No fertilizer advice"}
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <span className="small fw-semibold" style={{ color: "var(--text-secondary)" }}>
                          {new Date(h.date).toLocaleDateString()}
                        </span>
                        {typeof h.confidence === "number" && (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                            {Math.round(h.confidence * 100)}% Conf
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
