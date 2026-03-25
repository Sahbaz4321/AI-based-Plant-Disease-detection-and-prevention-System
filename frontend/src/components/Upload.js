import React, { useState, useCallback, useEffect } from "react";
import API, { ModelAPI } from "../api";
import { database } from "../firebase";
import { ref, push, set } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useToast } from "../context/ToastContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { generateYieldAdvice } from "../utils/soilAdvice";

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

// Compress image to base64 for persistent thumbnail
const getBase64Thumb = async (file) => {
  if (!file) return null;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_W = 300;
        const scale = MAX_W / img.width;
        canvas.width = MAX_W;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// AI fallback estimator for recovery days
const getRecoveryEstimate = (diseaseName) => {
  const d = (diseaseName || "").toLowerCase();
  if (d.includes("healthy") || d.includes("none")) return "No Treatment Needed";
  if (d.includes("rust") || d.includes("blight")) return "14 - 21 Days";
  if (d.includes("spot") || d.includes("mildew") || d.includes("scab")) return "7 - 14 Days";
  if (d.includes("rot") || d.includes("virus") || d.includes("mosaic")) return "21 - 30+ Days";
  return "10 - 15 Days";
};

// Parse raw disease string for beautiful web output
const parseDiseaseInfo = (rawStr) => {
  if (!rawStr) return { plant: "Unknown Leaf", condition: "Unknown" };
  const parts = rawStr.split("___");
  if (parts.length === 2) {
    return {
      plant: parts[0].replace(/_/g, " "),
      condition: parts[1].replace(/_/g, " ")
    };
  }
  return { plant: "Plant Scan", condition: rawStr.replace(/_/g, " ") };
};

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
  const [showAllHistory, setShowAllHistory] = useState(false);

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
            preview: previews[index],
            thumbBase64: await getBase64Thumb(files[index])
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
          filename: mapped.filename,
          thumbBase64: mapped.thumbBase64 || null
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

  const handleDownloadPdf = async (scan, i) => {
    const reportName = scan.filename || scan.disease || "Upload_Report";
    const element = document.getElementById(`pdf-template-upload-${i}`);
    if (!element) return;
    
    showToast("Generating PDF... please wait", "info");
    element.style.display = 'block';
    element.style.position = 'absolute';
    element.style.top = '-9999px';
    element.style.left = '-9999px';
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AgroScan_${reportName}.pdf`);
      showToast("Report downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate PDF", "error");
    } finally {
      element.style.display = 'none';
    }
  };

  const isAuth = getAuth().currentUser;
  const hList = isAuth ? dbScans : history;

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
                     border: "2px dashed " + (drag ? "var(--accent)" : "var(--border)"),
                     boxShadow: drag ? "var(--glow)" : "none",
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
                     <div className="d-flex flex-column position-relative align-items-center h-100 justify-content-center w-100 p-4">
                         <div className="position-relative d-inline-block rounded-4 shadow-lg mb-3 overflow-hidden" style={{ border: "4px solid var(--accent)", background: "var(--bg-primary)" }}>
                            <img src={previews[0]} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "cover", display: "block" }} />
                            <div className="position-absolute bottom-0 start-0 w-100 p-2" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>
                               <span className="badge bg-success shadow-sm"><i className="bi bi-check-circle-fill me-1" /> Ready</span>
                            </div>
                         </div>
                         <div className="d-flex align-items-center gap-3 px-4 py-2 rounded-pill shadow-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                            <i className="bi bi-image text-accent fs-4" />
                            <p className="fw-semibold mb-0 text-truncate" style={{ color: "var(--text-primary)", maxWidth: "250px" }}>{files[0].name}</p>
                            <span className="small text-muted border-start ps-3 border-secondary d-none d-md-inline">{(files[0].size / 1024 / 1024).toFixed(1)} MB</span>
                         </div>
                     </div>
                  )}

                  {previews.length > 1 && (
                     <div className="w-100 h-100 p-2 d-flex flex-column justify-content-center align-items-center position-relative">
                        <div className="rounded-pill px-4 py-2 mb-4 shadow-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--accent-muted)" }}>
                           <span className="fw-bold text-accent"><i className="bi bi-images me-2" />{files.length} Images Selected</span>
                        </div>
                        <div className="d-flex flex-row flex-wrap gap-3 justify-content-center overflow-auto custom-scroll p-2" style={{ maxHeight: "200px", maxWidth: "100%" }}>
                          {previews.map((preview, idx) => (
                            <div key={idx} className="position-relative shadow-sm rounded-3 overflow-hidden animate-fade-in" style={{ border: "2px solid var(--border)", width: "100px", height: "100px", transition: "transform 0.2s" }} onMouseEnter={(e)=>e.currentTarget.style.transform="scale(1.05)"} onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}>
                              <img src={preview} alt={`Preview ${idx + 1}`} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                              <div className="position-absolute bottom-0 start-0 w-100 text-center" style={{ background: "rgba(0,0,0,0.6)", fontSize: "0.7rem", color: "white", padding: "2px 0" }}>
                                {idx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
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
                  className="rounded-pill overflow-hidden shadow-sm position-relative"
                  style={{ height: 10, background: "var(--border)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}
                >
                  <div
                    className="h-100 rounded-pill position-relative overflow-hidden"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, var(--gradient-start), var(--gradient-end))",
                      transition: "width 0.2s ease-out",
                      boxShadow: "0 0 10px var(--accent-muted)"
                    }}
                  >
                    <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", animation: "sweep 1s infinite" }} />
                  </div>
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
              {results.map((res, i) => {
                const recoveryEstimate = getRecoveryEstimate(res.disease);
                const info = parseDiseaseInfo(res.disease);
                const soilAdvice = generateYieldAdvice(res.disease);
                
                return (
                  <div key={i} className="col-12">
                    <div className="glass-lg rounded-4 overflow-hidden shadow-lg position-relative" style={{ border: "1px solid var(--border)" }}>
                      {/* Premium Header Indicator */}
                      <div className="position-absolute top-0 start-0 w-100" style={{ height: "4px", background: "linear-gradient(90deg, var(--gradient-start), var(--gradient-end))" }} />
                      
                      {/* Super Modern Header */}
                      <div className="p-4 d-flex flex-column flex-md-row gap-4 align-items-md-center justify-content-between position-relative" style={{ background: "var(--bg-secondary)", zIndex: 1 }}>
                        <div className="d-flex flex-column flex-md-row gap-4 align-items-md-center">
                          <div className="d-flex flex-column align-items-center gap-2">
                            <img src={res.preview} alt="Thumb" className="rounded-4 shadow-sm" style={{ width: 120, height: 120, objectFit: "cover", border: recoveryEstimate === "No Treatment Needed" ? "3px solid #10b981" : "3px solid #ef4444", padding: "3px", background: "white" }} />
                            {recoveryEstimate === "No Treatment Needed" ? (
                               <span className="badge rounded-pill shadow-sm fw-bold px-3 py-1" style={{ background: "var(--bg-primary)", color: "#10b981", border: "1px solid #10b981", fontSize: "0.85rem" }}><i className="bi bi-shield-check me-1"/> Healthy</span>
                            ) : (
                               <span className="badge rounded-pill shadow-sm fw-bold px-3 py-1" style={{ background: "var(--bg-primary)", color: "#ef4444", border: "1px solid #ef4444", fontSize: "0.85rem" }}><i className="bi bi-bug-fill me-1"/> Detected</span>
                            )}
                          </div>
                          
                          <div className="text-center text-md-start">
                            <span className="badge rounded-pill text-uppercase mb-2 fw-bold" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--accent)", letterSpacing: "1px", border: "1px solid var(--border)" }}>
                              <i className="bi bi-tree me-1"/> {info.plant}
                            </span>
                            <h3 className="fw-bold mb-3 display-6" style={{ color: "var(--text-primary)", letterSpacing: "-0.5px" }}>{info.condition}</h3>
                            <button 
                              className="btn btn-sm d-inline-flex align-items-center gap-2 rounded-pill py-2 px-4 shadow-sm text-white animate-fade-in"
                              style={{ background: "linear-gradient(135deg, #059669, #10b981)", border: "none", fontWeight: "600", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
                              onClick={() => handleDownloadPdf(res, i)}
                              onMouseEnter={(e)=>{e.currentTarget.style.transform="scale(1.03)"; e.currentTarget.style.boxShadow="0 8px 15px rgba(16,185,129,0.3)"}}
                              onMouseLeave={(e)=>{e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 2px 4px rgba(0,0,0,0.1)"}}
                            >
                              <i className="bi bi-file-earmark-arrow-down-fill fs-5" /> Save PDF Report
                            </button>
                          </div>
                        </div>

                        {/* Top Right: AI Confidence Visual */}
                        {typeof res.confidence === "number" && (
                          <div className="text-center p-4 rounded-4 shadow-sm d-flex flex-column align-items-center justify-content-center border" style={{ background: "var(--bg-primary)", borderColor: "var(--border)", minWidth: "160px" }}>
                            <div className="position-relative d-inline-block d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px", borderRadius: "50%", background: `conic-gradient(#10b981 ${res.confidence * 100}%, #e5e7eb 0)` }}>
                               <div className="rounded-circle d-flex align-items-center justify-content-center flex-column" style={{ width: "68px", height: "68px", background: "var(--bg-primary)" }}>
                                  <span className="fw-bold fs-4" style={{ color: "var(--text-primary)", lineHeight: "1" }}>{Math.round(res.confidence * 100)}<span className="fs-6 text-muted">%</span></span>
                               </div>
                            </div>
                            <span className="mt-2 small fw-bold text-uppercase" style={{ color: "var(--text-secondary)", letterSpacing: "0.5px" }}>AI Accuracy</span>
                          </div>
                        )}
                      </div>

                      {/* Colorful Grid Dashboard Body */}
                      <div className="p-4 bg-primary bg-opacity-10 border-top mt-1" style={{ borderColor: "var(--nav-border) !important" }}>
                        <div className="row g-4">
                          
                          {/* Soil Health Visual Card */}
                          <div className="col-12 col-xl-4">
                             <div className="glass rounded-4 p-4 h-100 d-flex flex-column" style={{ borderTop: "4px solid #f59e0b" }}>
                               <h4 className="h6 fw-bold mb-3 d-flex align-items-center gap-2 text-uppercase letter-spacing-1" style={{ color: "#92400e" }}>
                                 <i className="bi bi-globe-americas fs-4" /> Soil Physics
                               </h4>
                               
                               <div className="d-flex align-items-center gap-4 mb-4 mt-2">
                                  <div className="position-relative d-inline-block d-flex align-items-center justify-content-center shadow-sm" style={{ width: "90px", height: "90px", borderRadius: "50%", background: `conic-gradient(${soilAdvice.healthScore > 75 ? '#10b981' : soilAdvice.healthScore > 50 ? '#f59e0b' : '#ef4444'} ${soilAdvice.healthScore}%, #f3f4f6 0)` }}>
                                     <div className="rounded-circle d-flex align-items-center justify-content-center flex-column shadow-inner" style={{ width: "76px", height: "76px", background: "var(--bg-secondary)" }}>
                                        <span className="fw-bold display-6 mb-n1" style={{ color: soilAdvice.healthScore > 75 ? '#10b981' : soilAdvice.healthScore > 50 ? '#f59e0b' : '#ef4444' }}>{soilAdvice.healthScore}</span>
                                     </div>
                                  </div>
                                  <div>
                                     <div className="fw-bold text-uppercase small mb-1" style={{ color: "var(--text-secondary)" }}>Optimal Soil Type:</div>
                                     <div className="fw-semibold mb-2" style={{ color: "var(--text-primary)" }}>{soilAdvice.type}</div>
                                     <div className="fw-bold text-uppercase small mb-1" style={{ color: "var(--text-secondary)" }}>Condition:</div>
                                     <div className="badge text-wrap text-start lh-base" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#92400e", border: "1px solid rgba(245, 158, 11, 0.2)" }}>{soilAdvice.fertility}</div>
                                  </div>
                               </div>
                               <div className="small p-3 rounded-3 mt-auto" style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", color: "#92400e" }}>
                                  <strong>Requirement:</strong> {soilAdvice.action}
                               </div>
                             </div>
                          </div>

                          {/* Action Plan Column */}
                          <div className="col-12 col-xl-8">
                             <div className="row g-3 h-100">
                                <div className="col-12">
                                  <div className="glass rounded-4 p-4 d-flex gap-4 position-relative overflow-hidden" style={{ borderLeft: "4px solid #10b981", background: "rgba(16, 185, 129, 0.03)" }}>
                                     <div className="fs-1 position-absolute top-50 start-0 translate-middle-y ms-2 text-success opacity-10"><i className="bi bi-heart-pulse-fill"/></div>
                                     <div className="z-1 flex-shrink-0">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center text-success border border-success border-opacity-25" style={{ width: 48, height: 48, background: "rgba(16, 185, 129, 0.1)" }}><i className="bi bi-bandaid fs-5"/></div>
                                     </div>
                                     <div className="z-1 flex-grow-1">
                                        <h4 className="h6 fw-bold mb-2 text-success letter-spacing-1 text-uppercase">Recommended Treatment</h4>
                                        <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 mb-3 me-3"><i className="bi bi-clock-history me-1"/> Est. Recovery: {recoveryEstimate}</span>
                                        <p className="mb-0 fw-semibold" style={{ color: "var(--text-primary)", lineHeight: "1.6", fontSize: "0.95rem" }}>{res.procedure || "No specific treatment required."}</p>
                                     </div>
                                  </div>
                                </div>
                                
                                <div className="col-12 col-md-6">
                                  <div className="glass rounded-4 p-4 h-100 position-relative border" style={{ borderTop: "4px solid #3b82f6 !important", borderColor: "var(--border) !important", background: "rgba(59, 130, 246, 0.03)" }}>
                                      <h4 className="h6 fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "#1e40af" }}><i className="bi bi-droplet-half fs-5"/> Fertilizer Plan</h4>
                                      <p className="mb-0 fw-semibold" style={{ color: "var(--text-primary)", lineHeight: "1.5", fontSize: "0.9rem" }}>{res.fertilizer}</p>
                                  </div>
                                </div>

                                <div className="col-12 col-md-6">
                                  <div className="glass rounded-4 p-4 h-100 position-relative border" style={{ borderTop: "4px solid #6366f1 !important", borderColor: "var(--border) !important", background: "rgba(99, 102, 241, 0.03)" }}>
                                      <h4 className="h6 fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "#3730a3" }}><i className="bi bi-shield-check fs-5"/> Prevention Strategy</h4>
                                      <p className="mb-0 fw-semibold" style={{ color: "var(--text-primary)", lineHeight: "1.5", fontSize: "0.9rem" }}>{res.prevention}</p>
                                  </div>
                                </div>
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* Hidden PDF Template for html2canvas */}
                      <div id={`pdf-template-upload-${i}`} style={{ display: 'none', width: '700px', padding: '15px 25px', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
                        <div style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '2px solid #059669', paddingBottom: '5px' }}>
                          <h1 style={{ color: '#059669', marginBottom: '4px', fontSize: '24px', fontWeight: 'bold' }}>AgroScan Diagnostic Report</h1>
                          <h2 style={{ fontSize: '16px', margin: 0, color: '#1f2937' }}>{res.filename || `Scan Report ${i+1}`}</h2>
                          <p style={{ color: '#6b7280', marginTop: '2px', fontSize: '11px' }}>Generated on {new Date().toLocaleString()}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                          <div style={{ flex: 1 }}>
                             <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', color: '#111827', fontSize: '16px', margin: '0 0 6px 0' }}>Crop Analysis</h3>
                             <p style={{ fontSize: '14px', margin: '0 0 4px 0' }}><strong>Detected Condition:</strong> {res.disease}</p>
                             <p style={{ fontSize: '14px', margin: '0 0 6px 0' }}><strong>AI Confidence:</strong> {typeof res.confidence === "number" ? Math.round(res.confidence * 100) + '%' : 'N/A'}</p>
                             {typeof res.confidence === "number" && (
                               <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                                 <div style={{ width: `${Math.round(res.confidence * 100)}%`, height: '100%', backgroundColor: '#059669' }} />
                               </div>
                             )}
                          </div>
                          <div style={{ flexShrink: 0 }}>
                             {(res.thumbBase64 || res.preview) ? (
                               <img src={res.thumbBase64 || res.preview} alt="Crop" style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e5e7eb' }} crossOrigin="anonymous" />
                             ) : (
                               <div style={{ width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: '8px', border: '2px dashed #d1d5db' }}>
                                 <span style={{ fontSize: '36px' }}>🌱</span>
                               </div>
                             )}
                          </div>
                        </div>

                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', color: '#111827', fontSize: '16px', margin: '0 0 6px 0' }}>AI Action Plan</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                           <div style={{ padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                             <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px', color: '#065f46' }}>🌿 Treatment Procedure</strong>
                             <span style={{ fontSize: '13px', color: '#064e3b', lineHeight: '1.3' }}>{res.procedure}</span>
                           </div>
                           <div style={{ padding: '8px', backgroundColor: '#fffbeb', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                             <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px', color: '#92400e' }}>🛡️ Precaution & Prevention</strong>
                             <span style={{ fontSize: '13px', color: '#78350f', lineHeight: '1.3' }}>{res.prevention}</span>
                           </div>
                           <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
                             <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px', color: '#1e40af' }}>🌾 Fertilizer Recommendation</strong>
                             <span style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: '1.3' }}>{res.fertilizer}</span>
                           </div>
                        </div>

                        {(() => {
                          const soilAdvice = generateYieldAdvice(res.disease);
                          return (
                            <>
                              <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', margin: '10px 0 6px 0', color: '#111827', fontSize: '16px' }}>Soil Health & Mechanics</h3>
                              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#fafafa', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                <div style={{ flex: 1, fontSize: '13px', lineHeight: '1.3' }}>
                                   <p style={{ margin: '0 0 4px 0' }}><strong>Optimum Soil Type:</strong> {soilAdvice.type}</p>
                                   <p style={{ margin: '0 0 4px 0' }}><strong>Fertility Status:</strong> {soilAdvice.fertility}</p>
                                   <p style={{ margin: '0 0 6px 0' }}><strong>Required Soil Action:</strong> {soilAdvice.action}</p>
                                   
                                   <div style={{ width: '100%' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '11px', fontWeight: 'bold', color: '#4b5563' }}>
                                         <span>Poor</span>
                                         <span>Optimal</span>
                                      </div>
                                      <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                                         <div style={{ width: `${soilAdvice.healthScore}%`, height: '100%', backgroundColor: soilAdvice.healthScore > 75 ? '#10b981' : soilAdvice.healthScore > 50 ? '#f59e0b' : '#ef4444' }} />
                                      </div>
                                   </div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '6px', backgroundColor: '#ffffff', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '3px solid', borderColor: soilAdvice.healthScore > 75 ? '#10b981' : soilAdvice.healthScore > 50 ? '#f59e0b' : '#ef4444' }}>
                                   <span style={{ fontSize: '24px', fontWeight: 'bold', color: soilAdvice.healthScore > 75 ? '#10b981' : soilAdvice.healthScore > 50 ? '#f59e0b' : '#ef4444' }}>{soilAdvice.healthScore}</span>
                                   <span style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold' }}>SCORE</span>
                                </div>
                              </div>
                            </>
                          );
                        })()}

                        <div style={{ marginTop: '10px', paddingTop: '8px', textAlign: 'center', borderTop: '1px solid #e5e7eb', color: '#6b7280', fontSize: '12px' }}>
                          <span>Generated by </span><strong style={{ color: '#059669' }}>Sahbaz</strong>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Scan History display (Firebase for logged in, Local for guest) */}
      {hList.length > 0 && (
          <div className="row justify-content-center stagger">
            <div className="col-12 col-xl-10">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="h4 fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <i className="bi bi-clock-history text-accent" />
                  {isAuth ? "Your Recent Scans" : "Local Recent Scans"}
                </h2>
                {hList.length > 6 && (
                  <button 
                    className="btn btn-sm px-4 py-2 rounded-pill fw-semibold shadow-sm animate-fade-in" 
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-muted)"; e.currentTarget.style.color = "var(--accent)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-secondary)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                  >
                    {showAllHistory ? (
                      <><i className="bi bi-eye-slash-fill me-2" />Show Less</>
                    ) : (
                      <><i className="bi bi-eye-fill me-2" />View All ({hList.length})</>
                    )}
                  </button>
                )}
              </div>
              <div className="row g-3">
                {hList.slice(0, showAllHistory ? hList.length : 6).map((h, idx) => (
                <div key={h.id || idx} className="col-md-6 col-lg-4">
                  <div className="glass rounded-4 p-3 h-100 d-flex align-items-start gap-3 shadow-sm position-relative overflow-hidden" style={{ borderLeft: "4px solid var(--accent)" }}>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 48, height: 48, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                    >
                      <i className="bi bi-bug-fill" style={{ fontSize: "1.2rem", color: "var(--accent)" }} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-bold text-wrap mb-1" style={{ color: "var(--text-primary)", fontSize: "1.05rem", wordBreak: "break-word" }} title={h.disease}>
                        {h.disease}
                      </div>
                      <div className="small text-muted text-wrap mb-2" style={{ lineHeight: "1.4" }} title={h.fertilizer}>
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
